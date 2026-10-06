"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { StarRating } from "./StarRating";
import { useWishlistStore } from "@/store/wishlist";

export function ProductCard({ product }: { product: Product }) {
  const isWished = useWishlistStore((s) => s.isWished(product.id));
  const toggle = useWishlistStore((s) => s.toggle);
  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(100 - (product.price / product.compareAtPrice) * 100)
      : 0;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition hover:shadow-lg">
      <Link href={`/product/${product.slug}`} className="relative block aspect-[9/11] overflow-hidden bg-gray-100">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {product.isNew && (
            <span className="rounded-full bg-brand-teal px-2 py-0.5 text-[11px] font-semibold text-white">New</span>
          )}
          {discount > 0 && (
            <span className="rounded-full bg-brand-pink px-2 py-0.5 text-[11px] font-semibold text-white">
              -{discount}%
            </span>
          )}
          {product.stock === 0 && (
            <span className="rounded-full bg-gray-800 px-2 py-0.5 text-[11px] font-semibold text-white">
              Sold Out
            </span>
          )}
        </div>
      </Link>
      <button
        onClick={(e) => {
          e.preventDefault();
          toggle(product.id);
        }}
        aria-label="Toggle wishlist"
        className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow transition hover:scale-110"
      >
        <Heart size={16} className={isWished ? "fill-brand-pink text-brand-pink" : "text-gray-500"} />
      </button>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <span className="text-[11px] uppercase tracking-wide text-gray-400">{product.category.replace("-", " ")}</span>
        <Link href={`/product/${product.slug}`} className="line-clamp-2 text-sm font-medium text-gray-800 hover:text-brand-purple">
          {product.name}
        </Link>
        <StarRating rating={product.rating} />
        <div className="mt-1 flex items-center gap-2">
          <span className="font-semibold text-gray-900">{formatPrice(product.price)}</span>
          {product.compareAtPrice && (
            <span className="text-xs text-gray-400 line-through">{formatPrice(product.compareAtPrice)}</span>
          )}
        </div>
      </div>
    </div>
  );
}
