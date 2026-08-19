import { NextRequest, NextResponse } from "next/server";
import { readProducts, writeProducts } from "@/lib/products";
import type { Product } from "@/lib/types";

export async function GET() {
  return NextResponse.json(readProducts());
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Partial<Product>;
  if (!body.name || !body.category || typeof body.price !== "number") {
    return NextResponse.json({ error: "name, category and price are required" }, { status: 400 });
  }
  const products = readProducts();
  const id = `P${(products.length + 1).toString().padStart(3, "0")}-${Date.now().toString(36)}`;
  const slug = `${body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${id.toLowerCase()}`;
  const product: Product = {
    id,
    slug,
    name: body.name,
    category: body.category,
    price: body.price,
    compareAtPrice: body.compareAtPrice,
    images: body.images && body.images.length ? body.images : ["/products/placeholder.svg"],
    description: body.description || "",
    fabric: body.fabric,
    sizes: body.sizes,
    colors: body.colors,
    stock: body.stock ?? 0,
    rating: 0,
    reviewCount: 0,
    isNew: true,
    isFeatured: !!body.isFeatured,
    tags: body.tags || [],
    createdAt: new Date().toISOString(),
  };
  products.unshift(product);
  writeProducts(products);
  return NextResponse.json(product, { status: 201 });
}
