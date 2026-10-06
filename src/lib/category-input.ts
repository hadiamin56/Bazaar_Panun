type CategoryInput = { name: string; description: string; image: string };

export function parseCategoryInput(body: unknown): { data: CategoryInput } | { error: string } {
  const b = (body ?? {}) as Record<string, unknown>;
  const name = typeof b.name === "string" ? b.name.trim() : "";
  if (!name) return { error: "Name is required" };
  if (name.length > 150) return { error: "Name is too long" };
  const description = typeof b.description === "string" ? b.description.trim() : "";
  const image = typeof b.image === "string" && b.image.startsWith("/") && !b.image.startsWith("//") ? b.image : "/products/placeholder.svg";
  return { data: { name, description, image } };
}

export const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 90);
