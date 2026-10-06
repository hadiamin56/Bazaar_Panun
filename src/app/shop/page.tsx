import { Suspense } from "react";
import type { Metadata } from "next";
import { getProducts, getCategories } from "@/lib/products";
import { ShopClient } from "@/components/ShopClient";

export const metadata: Metadata = {
  title: "Shop All | Bazaar Panun",
  description: "Browse our full collection of Kashmiri fabric, suits, bridal wear, shawls and clutches.",
};

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  return (
    <Suspense>
      <ShopClient products={products} categories={categories} />
    </Suspense>
  );
}
