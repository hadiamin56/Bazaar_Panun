"use client";

import { useCallback, useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import type { Order } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { jsonInit, useAdminFetch } from "./api";

const STATUSES: Order["status"][] = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
const statusStyle: Record<Order["status"], string> = {
  pending: "bg-amber-50 text-amber-700",
  confirmed: "bg-blue-50 text-blue-700",
  shipped: "bg-indigo-50 text-indigo-700",
  delivered: "bg-green-50 text-green-700",
  cancelled: "bg-gray-100 text-gray-500",
};
const label = (s: string) => s[0].toUpperCase() + s.slice(1);

export function OrdersTab({ onChanged }: { onChanged: () => void }) {
  const adminFetch = useAdminFetch();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [filter, setFilter] = useState<Order["status"] | "">("");

  const load = useCallback(async () => {
    const data = await adminFetch<Order[]>("/api/orders");
    if (data) setOrders(data);
  }, [adminFetch]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch on mount
    load();
  }, [load]);

  const updateStatus = async (id: string, status: Order["status"]) => {
    if (status === "cancelled" && !confirm("Cancel this order? Its items go back into stock.")) return;
    await adminFetch(`/api/orders/${id}`, jsonInit("PATCH", { status }));
    load();
    onChanged();
  };

  if (!orders) return <p className="text-sm text-gray-400">Loading...</p>;

  const active = orders.filter((o) => o.status !== "cancelled");
  const revenue = orders.filter((o) => o.status === "delivered").reduce((sum, o) => sum + o.total, 0);
  const shown = filter ? orders.filter((o) => o.status === filter) : orders;

  return (
    <div>
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Total orders" value={String(active.length)} />
        <Stat label="Pending" value={String(orders.filter((o) => o.status === "pending").length)} />
        <Stat label="To ship" value={String(orders.filter((o) => o.status === "confirmed").length)} />
        <Stat label="Delivered sales" value={formatPrice(revenue)} />
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {(["", ...STATUSES] as const).map((s) => (
          <button
            key={s || "all"}
            onClick={() => setFilter(s)}
            className={`rounded-full px-3 py-1 text-xs font-medium ${filter === s ? "bg-brand-purple text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            {s ? label(s) : "All"} ({s ? orders.filter((o) => o.status === s).length : orders.length})
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {shown.length === 0 && <p className="text-sm text-gray-400">No orders here.</p>}
        {shown.map((o) => (
          <div key={o.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {o.id}{" "}
                  <span className={`ml-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${statusStyle[o.status]}`}>{label(o.status)}</span>
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(o.createdAt).toLocaleString()} · {o.paymentMethod === "cod" ? "Cash on Delivery" : "WhatsApp order"}
                </p>
              </div>
              <select
                value={o.status}
                onChange={(e) => updateStatus(o.id, e.target.value as Order["status"])}
                className="rounded-lg border border-gray-200 px-2 py-1.5 text-xs font-medium"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {label(s)}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <p className="font-medium text-gray-700">{o.customer.name}</p>
                <p className="flex items-center gap-2 text-gray-500">
                  <a href={`tel:${o.customer.phone}`} className="hover:text-brand-purple">
                    {o.customer.phone}
                  </a>
                  <a
                    href={`https://wa.me/${o.customer.phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="WhatsApp customer"
                    className="text-green-600"
                  >
                    <MessageCircle size={14} />
                  </a>
                </p>
                {o.customer.email && <p className="text-gray-500">{o.customer.email}</p>}
                <p className="text-gray-500">
                  {o.customer.address}, {o.customer.city} - {o.customer.pincode}
                </p>
                {o.customer.notes && <p className="mt-1 rounded bg-amber-50 px-2 py-1 text-xs text-amber-800">Note: {o.customer.notes}</p>}
              </div>
              <div>
                {o.items.map((item, i) => (
                  <p key={i} className="text-gray-600">
                    {item.name}
                    {item.size && ` (${item.size})`}
                    {item.color && ` · ${item.color}`} ×{item.quantity} — {formatPrice(item.price * item.quantity)}
                  </p>
                ))}
                <p className="mt-1 text-xs text-gray-400">Shipping: {o.shipping ? formatPrice(o.shipping) : "Free"}</p>
                <p className="font-semibold text-gray-900">Total: {formatPrice(o.total)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-gray-900">{value}</p>
    </div>
  );
}
