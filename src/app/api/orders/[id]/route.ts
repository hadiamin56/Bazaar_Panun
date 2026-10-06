import { NextRequest, NextResponse } from "next/server";
import { readOrders, writeOrders } from "@/lib/orders";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = readOrders().find((o) => o.id === id);
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(order);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const orders = readOrders();
  const idx = orders.findIndex((o) => o.id === id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  orders[idx] = { ...orders[idx], ...body };
  writeOrders(orders);
  return NextResponse.json(orders[idx]);
}
