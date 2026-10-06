import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { OrderError, getOrder, isOrderStatus, toPublicOrder, updateOrderStatus } from "@/lib/orders";

// Customers can see their order summary (by its hard-to-guess ID); only admins see contact details.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json((await isAdmin()) ? order : toPublicOrder(order));
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!isOrderStatus(body?.status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  try {
    const order = await updateOrderStatus(id, body.status);
    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(order);
  } catch (e) {
    if (e instanceof OrderError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}
