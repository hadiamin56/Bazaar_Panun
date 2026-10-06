import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { parseCategoryInput } from "@/lib/category-input";

type Ctx = { params: Promise<{ slug: string }> };

// Edit name/description/image, or move up/down with { move: "up" | "down" }.
export async function PUT(req: NextRequest, { params }: Ctx) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { slug } = await params;
  const body = await req.json().catch(() => null);
  const current = await prisma.category.findUnique({ where: { slug } });
  if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (body?.move === "up" || body?.move === "down") {
    const all = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
    const i = all.findIndex((c) => c.slug === slug);
    const j = body.move === "up" ? i - 1 : i + 1;
    if (j >= 0 && j < all.length) {
      [all[i], all[j]] = [all[j], all[i]];
      await prisma.$transaction(all.map((c, idx) => prisma.category.update({ where: { slug: c.slug }, data: { sortOrder: idx } })));
    }
    return NextResponse.json({ ok: true });
  }

  const parsed = parseCategoryInput(body);
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const row = await prisma.category.update({ where: { slug }, data: parsed.data });
  return NextResponse.json(row);
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { slug } = await params;
  const count = await prisma.product.count({ where: { categorySlug: slug } });
  if (count > 0) {
    return NextResponse.json(
      { error: `This category still has ${count} product(s). Move or delete them first.` },
      { status: 409 }
    );
  }
  const { count: deleted } = await prisma.category.deleteMany({ where: { slug } });
  if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
