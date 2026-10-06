import "server-only";
import { prisma } from "./db";
import type { Prisma, Product as ProductRow, Category as CategoryRow } from "@/generated/prisma/client";
import type { Product, Category } from "./types";

// Empty lists come back as undefined, which is what the UI expects for "no options".
function stringList(value: Prisma.JsonValue | null): string[] | undefined {
  const list = Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
  return list.length ? list : undefined;
}

export function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.categorySlug,
    price: row.price,
    compareAtPrice: row.compareAtPrice ?? undefined,
    images: stringList(row.images) ?? ["/products/placeholder.svg"],
    description: row.description,
    fabric: row.fabric ?? undefined,
    sizes: stringList(row.sizes),
    colors: stringList(row.colors),
    stock: row.stock,
    rating: row.rating,
    reviewCount: row.reviewCount,
    isNew: row.isNew,
    isFeatured: row.isFeatured,
    tags: stringList(row.tags),
    createdAt: row.createdAt.toISOString(),
  };
}

function toCategory(row: CategoryRow): Category {
  return { slug: row.slug, name: row.name, description: row.description, image: row.image };
}

export async function getProducts(): Promise<Product[]> {
  const rows = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });
  return rows.map(toProduct);
}

export async function getCategories(): Promise<Category[]> {
  const rows = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
  return rows.map(toCategory);
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const row = await prisma.product.findUnique({ where: { slug } });
  return row ? toProduct(row) : undefined;
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    where: { categorySlug: product.category, id: { not: product.id } },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return rows.map(toProduct);
}
