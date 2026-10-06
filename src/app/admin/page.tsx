"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink, FileText, Home, Inbox, Layers, Lock, LogOut, Package, Settings, ShoppingCart } from "lucide-react";
import type { Category, Order } from "@/lib/types";
import { AdminFetchContext, makeAdminFetch } from "@/components/admin/api";
import { ProductsTab } from "@/components/admin/ProductsTab";
import { OrdersTab } from "@/components/admin/OrdersTab";
import { CategoriesTab } from "@/components/admin/CategoriesTab";
import { MessagesTab } from "@/components/admin/MessagesTab";
import { SettingsTab } from "@/components/admin/SettingsTab";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    fetch("/api/admin/session")
      .then((r) => r.json())
      .then((d) => setAuthed(!!d.authenticated))
      .catch(() => setAuthed(false))
      .finally(() => setChecked(true));
  }, []);

  const logout = async () => {
    await fetch("/api/admin/session", { method: "DELETE" });
    setAuthed(false);
  };
  // Stable, so the dashboard's data loaders don't re-run on every render.
  const onUnauthorized = useCallback(() => setAuthed(false), []);

  if (!checked) return null;
  if (!authed) return <LoginGate onSuccess={() => setAuthed(true)} />;
  return <Dashboard onLogout={logout} onUnauthorized={onUnauthorized} />;
}

function LoginGate({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) onSuccess();
      else {
        const body = await res.json().catch(() => null);
        setError(body?.error || `Login failed (error ${res.status}). Please try again.`);
      }
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-purple/10 text-brand-purple">
        <Lock size={24} />
      </div>
      <h1 className="mt-4 font-serif text-2xl font-bold text-gray-900">Admin Login</h1>
      <p className="mt-1 text-sm text-gray-500">Manage your store, products, orders and website content</p>
      <form onSubmit={submit} className="mt-6 w-full space-y-3">
        <input
          type="password"
          placeholder="Enter admin password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-brand-purple"
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-brand-purple py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {submitting ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

type Tab = "orders" | "products" | "categories" | "messages" | "store" | "home" | "pages";

const TABS: { id: Tab; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "products", label: "Products", icon: Package },
  { id: "categories", label: "Categories", icon: Layers },
  { id: "messages", label: "Messages", icon: Inbox },
  { id: "store", label: "Store Settings", icon: Settings },
  { id: "home", label: "Homepage", icon: Home },
  { id: "pages", label: "Pages", icon: FileText },
];

function Dashboard({ onLogout, onUnauthorized }: { onLogout: () => void; onUnauthorized: () => void }) {
  const adminFetch = useMemo(() => makeAdminFetch(onUnauthorized), [onUnauthorized]);
  const [tab, setTab] = useState<Tab>("orders");
  const [categories, setCategories] = useState<Category[]>([]);
  const [badges, setBadges] = useState<Partial<Record<Tab, number>>>({});

  // Categories (for the product form) and the counts shown on the tabs.
  const refresh = useCallback(async () => {
    const [cats, orders, messages] = await Promise.all([
      adminFetch<Category[]>("/api/categories"),
      adminFetch<Order[]>("/api/orders"),
      adminFetch<{ isRead: boolean }[]>("/api/messages"),
    ]);
    if (cats) setCategories(cats);
    setBadges({
      orders: orders?.filter((o) => o.status === "pending").length ?? 0,
      messages: messages?.filter((m) => !m.isRead).length ?? 0,
    });
  }, [adminFetch]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch on mount
    refresh();
  }, [refresh]);

  return (
    <AdminFetchContext.Provider value={adminFetch}>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-serif text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <Link href="/" target="_blank" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-purple">
              <ExternalLink size={16} /> View website
            </Link>
            <button onClick={onLogout} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>

        <div className="-mx-4 mb-6 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <div className="flex min-w-max gap-1 border-b border-gray-100">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium transition ${
                  tab === id ? "border-brand-purple text-brand-purple" : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon size={16} /> {label}
                {!!badges[id] && (
                  <span className="rounded-full bg-brand-pink px-1.5 text-[11px] font-semibold text-white">{badges[id]}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {tab === "orders" && <OrdersTab onChanged={refresh} />}
        {tab === "products" && <ProductsTab categories={categories} />}
        {tab === "categories" && <CategoriesTab onChanged={refresh} />}
        {tab === "messages" && <MessagesTab onChanged={refresh} />}
        {(tab === "store" || tab === "home" || tab === "pages") && <SettingsTab key={tab} section={tab} />}
      </div>
    </AdminFetchContext.Provider>
  );
}
