import { Suspense } from "react";
import type { Metadata } from "next";
import { getProducts, getCategories } from "@/lib/products";
import { ShopClient } from "@/components/ShopClient";
import { getSettings } from "@/lib/settings";

export async function generateMetadata(): Promise<Metadata> {
  const { store } = await getSettings();
  return { title: `Shop All | ${store.name}`, description: store.seoDescription };
}

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  return (
    <Suspense>
      <ShopClient products={products} categories={categories} />
    </Suspense>
  );
}
