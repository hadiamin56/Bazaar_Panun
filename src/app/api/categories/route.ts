import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { getCategories } from "@/lib/products";
import { parseCategoryInput, slugify } from "@/lib/category-input";

export async function GET() {
  return NextResponse.json(await getCategories());
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = parseCategoryInput(await req.json().catch(() => null));
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const slug = slugify(parsed.data.name);
  if (!slug) return NextResponse.json({ error: "Name must contain letters or numbers" }, { status: 400 });
  if (await prisma.category.findUnique({ where: { slug } })) {
    return NextResponse.json({ error: "A category with this name already exists" }, { status: 409 });
  }
  const last = await prisma.category.findFirst({ orderBy: { sortOrder: "desc" } });
  const row = await prisma.category.create({
    data: { slug, ...parsed.data, sortOrder: (last?.sortOrder ?? -1) + 1 },
  });
  return NextResponse.json(row, { status: 201 });
}
