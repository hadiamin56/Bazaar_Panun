import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { toProduct } from "@/lib/products";
import { parseProductInput } from "@/lib/product-input";
import { Prisma } from "@/generated/prisma/client";

const notFound = (e: unknown) => e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const parsed = parseProductInput(await req.json().catch(() => null), true);
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
  if (typeof parsed.data.categorySlug === "string") {
    const category = await prisma.category.findUnique({ where: { slug: parsed.data.categorySlug } });
    if (!category) return NextResponse.json({ error: "Unknown category" }, { status: 400 });
  }

  try {
    const row = await prisma.product.update({ where: { id }, data: parsed.data });
    return NextResponse.json(toProduct(row));
  } catch (e) {
    if (notFound(e)) return NextResponse.json({ error: "Not found" }, { status: 404 });
    throw e;
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  try {
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (notFound(e)) return NextResponse.json({ error: "Not found" }, { status: 404 });
    throw e;
  }
}
