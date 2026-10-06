"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/format";
import { useSite } from "@/components/SiteProvider";
import type { OrderItem } from "@/lib/types";

export default function CheckoutPage() {
  const items = useCartStore((s) => s.items);
  const clear = useCartStore((s) => s.clear);
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    pincode: "",
    notes: "",
  });
  const { checkout, store } = useSite().settings;
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "whatsapp">(checkout.codEnabled ? "cod" : "whatsapp");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping = subtotal >= checkout.freeShippingThreshold || subtotal === 0 ? 0 : checkout.shippingFee;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
        <h1 className="font-serif text-2xl font-bold text-gray-900">Your cart is empty</h1>
        <p className="mt-2 text-sm text-gray-500">Add some products before checking out.</p>
        <Link href="/shop" className="mt-6 inline-block rounded-full bg-brand-purple px-6 py-3 text-sm font-semibold text-white">
          Shop Now
        </Link>
      </div>
    );
  }

  const handleChange = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.phone || !form.address || !form.city || !form.pincode) {
      setError("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          subtotal,
          shipping,
          total,
          customer: form,
          paymentMethod,
        }),
      });
      const order = await res.json().catch(() => null);
      if (!res.ok) throw new Error(order?.error || "Something went wrong placing your order. Please try again.");

      if (paymentMethod === "whatsapp") {
        const lines = (order.items as OrderItem[]).map((i) => `- ${i.name}${i.size ? ` (${i.size})` : ""} x${i.quantity} — ${formatPrice(i.price * i.quantity)}`);
        const msg = encodeURIComponent(
          `Hi ${store.name}! I'd like to place order ${order.id}:\n${lines.join("\n")}\n\nTotal: ${formatPrice(order.total)}\n\nName: ${form.name}\nPhone: ${form.phone}\nAddress: ${form.address}, ${form.city} - ${form.pincode}`
        );
        window.open(`https://wa.me/${store.whatsappNumber}?text=${msg}`, "_blank");
      }

      clear();
      router.push(`/order-confirmation?id=${order.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong placing your order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-6 font-serif text-3xl font-bold text-gray-900">Checkout</h1>
      <div className="grid gap-8 lg:grid-cols-3">
        <form onSubmit={handleSubmit} className="space-y-5 lg:col-span-2">
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Shipping Details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full Name *" value={form.name} onChange={handleChange("name")} />
              <Field label="Phone Number *" value={form.phone} onChange={handleChange("phone")} type="tel" />
              <Field label="Email" value={form.email} onChange={handleChange("email")} type="email" className="sm:col-span-2" />
              <Field label="Address *" value={form.address} onChange={handleChange("address")} className="sm:col-span-2" />
              <Field label="City *" value={form.city} onChange={handleChange("city")} />
              <Field label="Pincode *" value={form.pincode} onChange={handleChange("pincode")} />
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">Order Notes</label>
                <textarea
                  value={form.notes}
                  onChange={handleChange("notes")}
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-purple"
                  placeholder="Any special instructions..."
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Payment Method</h2>
            <div className="space-y-3">
              {!checkout.codEnabled && !checkout.whatsappOrderEnabled && (
                <p className="text-sm text-red-500">Online ordering is paused right now. Please contact us on WhatsApp.</p>
              )}
              {checkout.codEnabled && <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-3 has-[:checked]:border-brand-purple has-[:checked]:bg-brand-purple/5">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                  className="h-4 w-4 text-brand-purple"
                />
                <div>
                  <p className="text-sm font-medium text-gray-800">Cash on Delivery</p>
                  <p className="text-xs text-gray-500">Pay when your order arrives at your doorstep</p>
                </div>
              </label>}
              {checkout.whatsappOrderEnabled && <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-3 has-[:checked]:border-brand-purple has-[:checked]:bg-brand-purple/5">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "whatsapp"}
                  onChange={() => setPaymentMethod("whatsapp")}
                  className="h-4 w-4 text-brand-purple"
                />
                <div>
                  <p className="text-sm font-medium text-gray-800">Confirm via WhatsApp</p>
                  <p className="text-xs text-gray-500">We&apos;ll send your order summary to WhatsApp to confirm details &amp; payment</p>
                </div>
              </label>}
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={submitting || (!checkout.codEnabled && !checkout.whatsappOrderEnabled)}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-purple py-3.5 text-sm font-semibold text-white transition hover:bg-brand-purple/90 disabled:opacity-60"
          >
            {submitting && <Loader2 size={16} className="animate-spin" />}
            Place Order — {formatPrice(total)}
          </button>
        </form>

        <div className="h-fit rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Order Summary</h2>
          <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={`${item.productId}-${item.size}-${item.color}`} className="flex gap-3">
                <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gray-800 text-[10px] font-bold text-white">
                    {item.quantity}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="line-clamp-2 text-xs font-medium text-gray-700">{item.name}</p>
                  <p className="text-xs text-gray-400">{item.size}</p>
                </div>
                <span className="text-xs font-semibold text-gray-900">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="my-4 border-t border-gray-100" />
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
            </div>
          </div>
          <div className="my-4 border-t border-gray-100" />
          <div className="flex justify-between text-base font-semibold text-gray-900">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  className = "",
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-purple"
      />
    </div>
  );
}
