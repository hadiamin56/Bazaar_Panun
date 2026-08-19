import { Suspense } from "react";
import type { Metadata } from "next";
import { readProducts, readCategories } from "@/lib/products";
import { ShopClient } from "@/components/ShopClient";

export const metadata: Metadata = {
  title: "Shop All | Bazaar Panun",
  description: "Browse our full collection of Kashmiri fabric, suits, bridal wear, shawls and clutches.",
};

export default function ShopPage() {
  const products = readProducts();
  const categories = readCategories();
  return (
    <Suspense>
      <ShopClient products={products} categories={categories} />
    </Suspense>
  );
}
