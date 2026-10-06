"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, MessageCircle, Minus, Plus, ShieldCheck, Truck, RotateCcw, Check } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { StarRating } from "./StarRating";
import { ProductCard } from "./ProductCard";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import { useSite } from "@/components/SiteProvider";

export function ProductDetailClient({ product, related }: { product: Product; related: Product[] }) {
  const site = useSite().settings.store;
  const [activeImage, setActiveImage] = useState(0);
  const [size, setSize] = useState<string | undefined>(product.sizes?.[0]);
  const [color, setColor] = useState<string | undefined>(product.colors?.[0]);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const isWished = useWishlistStore((s) => s.isWished(product.id));
  const toggleWish = useWishlistStore((s) => s.toggle);

  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(100 - (product.price / product.compareAtPrice) * 100)
      : 0;

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images[0],
      price: product.price,
      size,
      color,
      quantity,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const whatsappMessage = encodeURIComponent(
    `Hi! I'm interested in ordering:\n${product.name}${size ? ` (Size: ${size})` : ""}${color ? ` (Color: ${color})` : ""} x${quantity}\nPrice: ${formatPrice(product.price)}`
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <nav className="mb-6 text-xs text-gray-400">
        <Link href="/" className="hover:text-brand-purple">Home</Link> /{" "}
        <Link href={`/shop?category=${product.category}`} className="capitalize hover:text-brand-purple">
          {product.category.replace("-", " ")}
        </Link>{" "}
        / <span className="text-gray-600">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <div>
          <div className="relative aspect-[9/11] w-full overflow-hidden rounded-xl bg-gray-100">
            <Image src={product.images[activeImage]} alt={product.name} fill className="object-cover" priority />
            {discount > 0 && (
              <span className="absolute left-3 top-3 rounded-full bg-brand-pink px-2.5 py-1 text-xs font-semibold text-white">
                -{discount}% OFF
              </span>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="mt-3 flex gap-3">
              {product.images.map((img, i) => (
                <button
                  key={img}
                  onClick={() => setActiveImage(i)}
                  className={`relative h-20 w-16 overflow-hidden rounded-lg border-2 ${
                    activeImage === i ? "border-brand-purple" : "border-transparent"
                  }`}
                >
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <span className="text-xs font-medium uppercase tracking-wide text-brand-purple">
            {product.category.replace("-", " ")}
          </span>
          <h1 className="mt-1 font-serif text-2xl font-bold text-gray-900 sm:text-3xl">{product.name}</h1>
          <div className="mt-2 flex items-center gap-2">
            <StarRating rating={product.rating} />
            <span className="text-sm text-gray-500">
              {product.rating} ({product.reviewCount} reviews)
            </span>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <span className="text-2xl font-bold text-gray-900">{formatPrice(product.price)}</span>
            {product.compareAtPrice && (
              <span className="text-base text-gray-400 line-through">{formatPrice(product.compareAtPrice)}</span>
            )}
          </div>

          <p className="mt-4 text-sm leading-relaxed text-gray-600">{product.description}</p>

          {product.fabric && (
            <p className="mt-3 text-sm text-gray-700">
              <span className="font-medium">Fabric:</span> {product.fabric}
            </p>
          )}

          {product.colors && product.colors.length > 0 && (
            <div className="mt-5">
              <p className="mb-2 text-sm font-medium text-gray-800">Color: {color}</p>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                      color === c
                        ? "border-brand-purple bg-brand-purple/10 text-brand-purple"
                        : "border-gray-200 text-gray-600 hover:border-gray-400"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.sizes && product.sizes.length > 0 && (
            <div className="mt-5">
              <p className="mb-2 text-sm font-medium text-gray-800">Size: {size}</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`h-10 min-w-10 rounded-lg border px-3 text-sm font-medium transition ${
                      size === s
                        ? "border-brand-purple bg-brand-purple/10 text-brand-purple"
                        : "border-gray-200 text-gray-600 hover:border-gray-400"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-5 flex items-center gap-3">
            <p className="text-sm font-medium text-gray-800">Quantity</p>
            <div className="flex items-center rounded-lg border border-gray-200">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex h-9 w-9 items-center justify-center text-gray-600 hover:bg-gray-50"
                aria-label="Decrease quantity"
              >
                <Minus size={14} />
              </button>
              <span className="w-8 text-center text-sm font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(product.stock || 10, q + 1))}
                className="flex h-9 w-9 items-center justify-center text-gray-600 hover:bg-gray-50"
                aria-label="Increase quantity"
              >
                <Plus size={14} />
              </button>
            </div>
            <span className="text-xs text-gray-400">{product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}</span>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-brand-purple px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-purple/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {added ? (
                <>
                  <Check size={16} /> Added to Cart
                </>
              ) : (
                "Add to Cart"
              )}
            </button>
            <a
              href={`https://wa.me/${site.whatsappNumber}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-2 rounded-full border border-green-500 px-6 py-3 text-sm font-semibold text-green-600 transition hover:bg-green-50"
            >
              <MessageCircle size={16} /> Order via WhatsApp
            </a>
            <button
              onClick={() => toggleWish(product.id)}
              aria-label="Toggle wishlist"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gray-200 transition hover:border-brand-pink"
            >
              <Heart size={18} className={isWished ? "fill-brand-pink text-brand-pink" : "text-gray-500"} />
            </button>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-3 border-t border-gray-100 pt-6 sm:grid-cols-3">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Truck size={18} className="text-brand-purple" /> Pan-India Delivery
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <ShieldCheck size={18} className="text-brand-purple" /> Authentic Product
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <RotateCcw size={18} className="text-brand-purple" /> COD Available
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="mb-6 font-serif text-2xl font-bold text-gray-900">You May Also Like</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
