import type { Prisma } from "@/generated/prisma/client";

type Result = { data: Prisma.ProductUncheckedUpdateInput } | { error: string };

const isInt = (v: unknown, min = 0): v is number => typeof v === "number" && Number.isInteger(v) && v >= min;

function stringList(v: unknown): string[] | null {
  if (!Array.isArray(v) || v.some((s) => typeof s !== "string")) return null;
  return v.map((s: string) => s.trim()).filter(Boolean);
}

// Validates a create/update body from the admin form. With `partial`, missing fields are left unchanged.
export function parseProductInput(body: unknown, partial: boolean): Result {
  if (!body || typeof body !== "object") return { error: "Invalid request body" };
  const b = body as Record<string, unknown>;
  const data: Prisma.ProductUncheckedUpdateInput = {};
  const has = (key: string) => b[key] !== undefined;

  if (has("name") || !partial) {
    if (typeof b.name !== "string" || !b.name.trim()) return { error: "name is required" };
    data.name = b.name.trim();
  }
  if (has("category") || !partial) {
    if (typeof b.category !== "string" || !b.category) return { error: "category is required" };
    data.categorySlug = b.category;
  }
  if (has("price") || !partial) {
    if (!isInt(b.price, 1)) return { error: "price must be a whole number above 0" };
    data.price = b.price;
  }
  if (has("compareAtPrice")) {
    if (b.compareAtPrice !== null && !isInt(b.compareAtPrice, 1)) return { error: "compareAtPrice must be a whole number" };
    data.compareAtPrice = b.compareAtPrice as number | null;
  }
  if (has("stock")) {
    if (!isInt(b.stock)) return { error: "stock must be a whole number" };
    data.stock = b.stock;
  }
  if (has("description")) {
    if (typeof b.description !== "string") return { error: "description must be text" };
    data.description = b.description;
  }
  if (has("fabric")) {
    if (b.fabric !== null && typeof b.fabric !== "string") return { error: "fabric must be text" };
    data.fabric = (b.fabric as string | null)?.trim() || null;
  }
  for (const key of ["sizes", "colors", "tags", "images"] as const) {
    if (!has(key)) continue;
    const list = b[key] === null ? [] : stringList(b[key]);
    if (!list) return { error: `${key} must be a list of text values` };
    data[key] = list;
  }
  if (has("isFeatured")) data.isFeatured = !!b.isFeatured;
  if (has("isNew")) data.isNew = !!b.isNew;

  return { data };
}
