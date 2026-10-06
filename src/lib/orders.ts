import "server-only";
import { randomInt } from "crypto";
import { prisma } from "./db";
import { getSettings } from "./settings";
import type { Prisma } from "@/generated/prisma/client";
import type { Order } from "./types";

const STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"] as const;
export type OrderStatus = (typeof STATUSES)[number];
export const isOrderStatus = (v: unknown): v is OrderStatus => STATUSES.includes(v as OrderStatus);

export class OrderError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

type OrderWithItems = Prisma.OrderGetPayload<{ include: { items: true } }>;

export function toOrder(row: OrderWithItems): Order {
  return {
    id: row.id,
    items: row.items.map((i) => ({
      productId: i.productId ?? "",
      slug: i.slug,
      name: i.name,
      image: i.image,
      price: i.price,
      size: i.size ?? undefined,
      color: i.color ?? undefined,
      quantity: i.quantity,
    })),
    subtotal: row.subtotal,
    shipping: row.shipping,
    total: row.total,
    customer: {
      name: row.customerName,
      phone: row.phone,
      email: row.email ?? undefined,
      address: row.address,
      city: row.city,
      pincode: row.pincode,
      notes: row.notes ?? undefined,
    },
    paymentMethod: row.paymentMethod,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  };
}

// What a customer may see on the confirmation page: no address or phone number.
export function toPublicOrder(order: Order) {
  const { id, items, subtotal, shipping, total, status, paymentMethod, createdAt } = order;
  return { id, items, subtotal, shipping, total, status, paymentMethod, createdAt };
}

export async function listOrders(): Promise<Order[]> {
  const rows = await prisma.order.findMany({ include: { items: true }, orderBy: { createdAt: "desc" } });
  return rows.map(toOrder);
}

export async function getOrder(id: string): Promise<Order | null> {
  const row = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  return row ? toOrder(row) : null;
}

// Hard-to-guess ID, e.g. BP7K2M9QXA4R. Avoids look-alike characters.
function newOrderId(): string {
  const alphabet = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
  let id = "BP";
  for (let i = 0; i < 10; i++) id += alphabet[randomInt(alphabet.length)];
  return id;
}

function text(v: unknown, field: string, max: number, required: boolean): string | null {
  const s = typeof v === "string" ? v.trim() : "";
  if (!s) {
    if (required) throw new OrderError(`${field} is required`);
    return null;
  }
  if (s.length > max) throw new OrderError(`${field} is too long`);
  return s;
}

type ItemInput = { productId: string; quantity: number; size?: string; color?: string };

function parseItems(v: unknown): ItemInput[] {
  if (!Array.isArray(v) || v.length === 0) throw new OrderError("Your cart is empty");
  if (v.length > 50) throw new OrderError("Too many items in one order");
  return v.map((raw) => {
    const i = (raw ?? {}) as Record<string, unknown>;
    if (typeof i.productId !== "string" || !i.productId) throw new OrderError("Invalid item in cart");
    if (typeof i.quantity !== "number" || !Number.isInteger(i.quantity) || i.quantity < 1 || i.quantity > 20) {
      throw new OrderError("Invalid quantity in cart");
    }
    return {
      productId: i.productId,
      quantity: i.quantity,
      size: typeof i.size === "string" && i.size ? i.size : undefined,
      color: typeof i.color === "string" && i.color ? i.color : undefined,
    };
  });
}

const listOf = (v: Prisma.JsonValue | null) => (Array.isArray(v) ? (v as string[]) : []);

// Prices, totals and stock all come from the database, never from the browser.
export async function createOrder(body: unknown): Promise<Order> {
  const b = (body ?? {}) as Record<string, unknown>;
  const c = (b.customer ?? {}) as Record<string, unknown>;
  const items = parseItems(b.items);
  const customer = {
    customerName: text(c.name, "Name", 150, true)!,
    phone: text(c.phone, "Phone", 30, true)!,
    email: text(c.email, "Email", 200, false),
    address: text(c.address, "Address", 500, true)!,
    city: text(c.city, "City", 100, true)!,
    pincode: text(c.pincode, "Pincode", 20, true)!,
    notes: text(c.notes, "Notes", 2000, false),
  };
  const { checkout } = await getSettings();
  const paymentMethod = b.paymentMethod === "whatsapp" ? "whatsapp" : "cod";
  if (paymentMethod === "cod" && !checkout.codEnabled) throw new OrderError("Cash on Delivery is not available right now.");
  if (paymentMethod === "whatsapp" && !checkout.whatsappOrderEnabled) throw new OrderError("WhatsApp orders are not available right now.");

  const row = await prisma.$transaction(async (tx) => {
    const ids = [...new Set(items.map((i) => i.productId))];
    const products = new Map((await tx.product.findMany({ where: { id: { in: ids } } })).map((p) => [p.id, p]));

    const lines = items.map((item) => {
      const p = products.get(item.productId);
      if (!p) throw new OrderError("A product in your cart is no longer available. Please remove it and try again.", 409);
      if (item.size && !listOf(p.sizes).includes(item.size)) throw new OrderError(`Size ${item.size} is not available for ${p.name}`);
      if (item.color && !listOf(p.colors).includes(item.color)) throw new OrderError(`Colour ${item.color} is not available for ${p.name}`);
      return {
        productId: p.id,
        slug: p.slug,
        name: p.name,
        image: listOf(p.images)[0] ?? "",
        price: p.price,
        size: item.size ?? null,
        color: item.color ?? null,
        quantity: item.quantity,
      };
    });

    // Reserve stock. The `stock >= qty` condition makes this safe when two people buy the last piece at once.
    const qtyByProduct = new Map<string, number>();
    for (const l of lines) qtyByProduct.set(l.productId, (qtyByProduct.get(l.productId) ?? 0) + l.quantity);
    for (const [productId, qty] of qtyByProduct) {
      const { count } = await tx.product.updateMany({
        where: { id: productId, stock: { gte: qty } },
        data: { stock: { decrement: qty } },
      });
      if (count === 0) {
        const p = products.get(productId)!;
        throw new OrderError(`Sorry, only ${p.stock} of ${p.name} left in stock.`, 409);
      }
    }

    const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
    const shipping = subtotal >= checkout.freeShippingThreshold ? 0 : checkout.shippingFee;

    return tx.order.create({
      data: {
        id: newOrderId(),
        subtotal,
        shipping,
        total: subtotal + shipping,
        ...customer,
        paymentMethod,
        items: { create: lines },
      },
      include: { items: true },
    });
  });

  return toOrder(row);
}

// Cancelling an order puts its stock back; un-cancelling takes it out again.
export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order | null> {
  const row = await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id }, include: { items: true } });
    if (!order) return null;

    const wasCancelled = order.status === "cancelled";
    const nowCancelled = status === "cancelled";
    if (wasCancelled !== nowCancelled) {
      for (const item of order.items) {
        if (!item.productId) continue; // product was deleted
        if (nowCancelled) {
          await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } });
        } else {
          const { count } = await tx.product.updateMany({
            where: { id: item.productId, stock: { gte: item.quantity } },
            data: { stock: { decrement: item.quantity } },
          });
          if (count === 0) throw new OrderError(`Not enough stock of ${item.name} to restore this order.`, 409);
        }
      }
    }

    return tx.order.update({ where: { id }, data: { status }, include: { items: true } });
  });
  return row ? toOrder(row) : null;
}
