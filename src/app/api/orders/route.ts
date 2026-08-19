import { NextRequest, NextResponse } from "next/server";
import { readOrders, writeOrders } from "@/lib/orders";
import type { Order } from "@/lib/types";

export async function GET() {
  const orders = readOrders().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return NextResponse.json(orders);
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Omit<Order, "id" | "status" | "createdAt">;
  if (!body.items?.length || !body.customer?.name || !body.customer?.phone) {
    return NextResponse.json({ error: "Missing required order fields" }, { status: 400 });
  }
  const orders = readOrders();
  const order: Order = {
    id: `BP${Date.now().toString(36).toUpperCase()}`,
    items: body.items,
    subtotal: body.subtotal,
    shipping: body.shipping,
    total: body.total,
    customer: body.customer,
    paymentMethod: body.paymentMethod || "whatsapp",
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  orders.unshift(order);
  writeOrders(orders);
  return NextResponse.json(order, { status: 201 });
}
