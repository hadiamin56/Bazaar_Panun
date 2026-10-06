import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { getProducts, toProduct } from "@/lib/products";
import { parseProductInput } from "@/lib/product-input";

export async function GET() {
  return NextResponse.json(await getProducts());
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = parseProductInput(await req.json().catch(() => null), false);
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const input = parsed.data;

  const category = await prisma.category.findUnique({ where: { slug: input.categorySlug as string } });
  if (!category) return NextResponse.json({ error: "Unknown category" }, { status: 400 });

  const id = `P${randomBytes(4).toString("hex").toUpperCase()}`;
  const slug = `${(input.name as string).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${id.toLowerCase()}`;
  const images = Array.isArray(input.images) && input.images.length ? input.images : ["/products/placeholder.svg"];

  const row = await prisma.product.create({
    data: {
      id,
      slug,
      name: input.name as string,
      categorySlug: category.slug,
      price: input.price as number,
      compareAtPrice: (input.compareAtPrice as number | null | undefined) ?? null,
      images,
      description: (input.description as string | undefined) ?? "",
      fabric: (input.fabric as string | null | undefined) ?? null,
      sizes: input.sizes ?? [],
      colors: input.colors ?? [],
      tags: input.tags ?? [],
      stock: (input.stock as number | undefined) ?? 0,
      isNew: true,
      isFeatured: (input.isFeatured as boolean | undefined) ?? false,
    },
  });
  return NextResponse.json(toProduct(row), { status: 201 });
}
