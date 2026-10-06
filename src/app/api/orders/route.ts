import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { OrderError, createOrder, listOrders, toPublicOrder } from "@/lib/orders";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await listOrders());
}

export async function POST(req: NextRequest) {
  try {
    const order = await createOrder(await req.json().catch(() => null));
    return NextResponse.json(toPublicOrder(order), { status: 201 });
  } catch (e) {
    if (e instanceof OrderError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}
