"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useWishlistStore } from "@/store/wishlist";
import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/lib/types";

export default function WishlistPage() {
  const productIds = useWishlistStore((s) => s.productIds);
  const [products, setProducts] = useState<Product[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data: Product[]) => {
        setProducts(data);
        setLoaded(true);
      });
  }, []);

  const wished = products.filter((p) => productIds.includes(p.id));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-6 font-serif text-3xl font-bold text-gray-900">My Wishlist</h1>
      {loaded && wished.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-24 text-center">
          <Heart size={56} className="text-gray-300" />
          <p className="mt-4 text-lg font-medium text-gray-700">Your wishlist is empty</p>
          <p className="mt-1 text-sm text-gray-500">Save items you love to view them here anytime.</p>
          <Link href="/shop" className="mt-6 rounded-full bg-brand-purple px-6 py-3 text-sm font-semibold text-white">
            Explore Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
          {wished.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
