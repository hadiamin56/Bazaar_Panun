import { NextRequest, NextResponse } from "next/server";
import { readProducts, writeProducts } from "@/lib/products";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const products = readProducts();
  const idx = products.findIndex((p) => p.id === id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  products[idx] = { ...products[idx], ...body };
  writeProducts(products);
  return NextResponse.json(products[idx]);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const products = readProducts();
  const next = products.filter((p) => p.id !== id);
  if (next.length === products.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
  writeProducts(next);
  return NextResponse.json({ ok: true });
}
