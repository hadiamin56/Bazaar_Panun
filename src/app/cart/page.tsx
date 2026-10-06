"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/format";
import { site } from "@/lib/site";

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping = items.length === 0 ? 0 : subtotal >= site.freeShippingThreshold ? 0 : site.shippingFee;

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center px-4 py-24 text-center sm:px-6 lg:px-8">
        <ShoppingBag size={56} className="text-gray-300" />
        <h1 className="mt-4 font-serif text-2xl font-bold text-gray-900">Your cart is empty</h1>
        <p className="mt-2 text-sm text-gray-500">Looks like you haven&apos;t added anything yet.</p>
        <Link href="/shop" className="mt-6 rounded-full bg-brand-purple px-6 py-3 text-sm font-semibold text-white">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-6 font-serif text-3xl font-bold text-gray-900">Shopping Cart</h1>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => (
            <div
              key={`${item.productId}-${item.size}-${item.color}`}
              className="flex gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
            >
              <Link href={`/product/${item.slug}`} className="relative h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                <Image src={item.image} alt={item.name} fill className="object-cover" />
              </Link>
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <Link href={`/product/${item.slug}`} className="text-sm font-medium text-gray-800 hover:text-brand-purple">
                    {item.name}
                  </Link>
                  <p className="mt-1 text-xs text-gray-400">
                    {item.size && `Size: ${item.size}`} {item.color && `· Color: ${item.color}`}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center rounded-lg border border-gray-200">
                    <button
                      onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity - 1)}
                      className="flex h-8 w-8 items-center justify-center text-gray-600 hover:bg-gray-50"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-7 text-center text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity + 1)}
                      className="flex h-8 w-8 items-center justify-center text-gray-600 hover:bg-gray-50"
                      aria-label="Increase quantity"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{formatPrice(item.price * item.quantity)}</span>
                </div>
              </div>
              <button
                onClick={() => removeItem(item.productId, item.size, item.color)}
                aria-label="Remove item"
                className="self-start text-gray-300 transition hover:text-red-500"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        <div className="h-fit rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Order Summary</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
            </div>
            {subtotal < site.freeShippingThreshold && (
              <p className="text-xs text-brand-teal">
                Add {formatPrice(site.freeShippingThreshold - subtotal)} more for free shipping
              </p>
            )}
          </div>
          <div className="my-4 border-t border-gray-100" />
          <div className="flex justify-between text-base font-semibold text-gray-900">
            <span>Total</span>
            <span>{formatPrice(subtotal + shipping)}</span>
          </div>
          <Link
            href="/checkout"
            className="mt-6 flex items-center justify-center gap-2 rounded-full bg-brand-purple py-3 text-sm font-semibold text-white transition hover:bg-brand-purple/90"
          >
            Proceed to Checkout <ArrowRight size={16} />
          </Link>
          <Link href="/shop" className="mt-3 block text-center text-sm text-gray-500 hover:text-brand-purple">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
