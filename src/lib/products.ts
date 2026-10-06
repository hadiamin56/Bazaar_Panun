import fs from "fs";
import path from "path";
import type { Product, Category } from "./types";

const productsFile = path.join(process.cwd(), "src", "data", "products.json");
const categoriesFile = path.join(process.cwd(), "src", "data", "categories.json");

export function readProducts(): Product[] {
  const raw = fs.readFileSync(productsFile, "utf8");
  return JSON.parse(raw);
}

export function writeProducts(products: Product[]) {
  fs.writeFileSync(productsFile, JSON.stringify(products, null, 2));
}

export function readCategories(): Category[] {
  const raw = fs.readFileSync(categoriesFile, "utf8");
  return JSON.parse(raw);
}

export function getProductBySlug(slug: string): Product | undefined {
  return readProducts().find((p) => p.slug === slug);
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  return readProducts()
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, limit);
}
