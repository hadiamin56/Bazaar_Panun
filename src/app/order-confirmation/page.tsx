"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import type { Order } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { useSite } from "@/components/SiteProvider";

function Confirmation() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const storeName = useSite().settings.store.name;
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/orders/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setOrder);
  }, [id]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
      <CheckCircle2 size={64} className="mx-auto text-brand-teal" />
      <h1 className="mt-4 font-serif text-3xl font-bold text-gray-900">Order Placed Successfully!</h1>
      <p className="mt-2 text-sm text-gray-500">
        Thank you for shopping with {storeName}. {id && <>Your order ID is <span className="font-semibold text-gray-800">{id}</span>.</>}
      </p>
      <p className="mt-1 text-sm text-gray-500">We&apos;ll reach out to you shortly to confirm delivery details.</p>

      {order && (
        <div className="mt-8 rounded-xl border border-gray-100 bg-white p-6 text-left shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-gray-900">Order Summary</h2>
          <div className="space-y-2 text-sm text-gray-600">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between">
                <span>
                  {item.name} x{item.quantity}
                </span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="my-3 border-t border-gray-100" />
          <div className="flex justify-between text-base font-semibold text-gray-900">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link href="/shop" className="rounded-full bg-brand-purple px-6 py-3 text-sm font-semibold text-white">
          Continue Shopping
        </Link>
        <Link href="/" className="rounded-full border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-700">
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense>
      <Confirmation />
    </Suspense>
  );
}
