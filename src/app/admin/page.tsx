"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Lock, Plus, Trash2, Pencil, X, Package, ShoppingCart, LogOut } from "lucide-react";
import type { Product, Order } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import categories from "@/data/categories.json";

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "bazaarpanun2024";
const AUTH_KEY = "bp-admin-auth";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of session auth flag on mount
    setAuthed(sessionStorage.getItem(AUTH_KEY) === "true");
    setChecked(true);
  }, []);

  if (!checked) return null;
  if (!authed) return <LoginGate onSuccess={() => setAuthed(true)} />;
  return <Dashboard onLogout={() => { sessionStorage.removeItem(AUTH_KEY); setAuthed(false); }} />;
}

function LoginGate({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem(AUTH_KEY, "true");
      onSuccess();
    } else {
      setError("Incorrect password");
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-purple/10 text-brand-purple">
        <Lock size={24} />
      </div>
      <h1 className="mt-4 font-serif text-2xl font-bold text-gray-900">Admin Login</h1>
      <p className="mt-1 text-sm text-gray-500">Manage products and orders for Bazaar Panun</p>
      <form onSubmit={submit} className="mt-6 w-full space-y-3">
        <input
          type="password"
          placeholder="Enter admin password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-brand-purple"
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button type="submit" className="w-full rounded-full bg-brand-purple py-2.5 text-sm font-semibold text-white">
          Login
        </button>
      </form>
    </div>
  );
}

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<"products" | "orders">("products");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    Promise.all([fetch("/api/products").then((r) => r.json()), fetch("/api/orders").then((r) => r.json())]).then(
      ([p, o]) => {
        setProducts(p);
        setOrders(o);
        setLoading(false);
      }
    );
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch on mount
    loadData();
  }, []);

  const deleteProduct = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    loadData();
  };

  const updateOrderStatus = async (id: string, status: Order["status"]) => {
    await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    loadData();
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-serif text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <button onClick={onLogout} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500">
          <LogOut size={16} /> Logout
        </button>
      </div>

      <div className="mb-6 flex gap-2 border-b border-gray-100">
        <TabButton active={tab === "products"} onClick={() => setTab("products")} icon={Package} label={`Products (${products.length})`} />
        <TabButton active={tab === "orders"} onClick={() => setTab("orders")} icon={ShoppingCart} label={`Orders (${orders.length})`} />
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Loading...</p>
      ) : tab === "products" ? (
        <div>
          <button
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
            className="mb-4 flex items-center gap-2 rounded-full bg-brand-purple px-4 py-2 text-sm font-semibold text-white"
          >
            <Plus size={16} /> Add Product
          </button>
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-t border-gray-100">
                    <td className="flex items-center gap-3 px-4 py-3">
                      <div className="relative h-12 w-10 overflow-hidden rounded bg-gray-100">
                        <Image src={p.images[0]} alt="" fill className="object-cover" />
                      </div>
                      <span className="line-clamp-1 max-w-[200px] font-medium text-gray-800">{p.name}</span>
                    </td>
                    <td className="px-4 py-3 capitalize text-gray-500">{p.category.replace("-", " ")}</td>
                    <td className="px-4 py-3 text-gray-800">{formatPrice(p.price)}</td>
                    <td className="px-4 py-3 text-gray-500">{p.stock}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditing(p);
                            setShowForm(true);
                          }}
                          className="text-gray-400 hover:text-brand-purple"
                          aria-label="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => deleteProduct(p.id)} className="text-gray-400 hover:text-red-500" aria-label="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.length === 0 && <p className="text-sm text-gray-400">No orders yet.</p>}
          {orders.map((o) => (
            <div key={o.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{o.id}</p>
                  <p className="text-xs text-gray-400">{new Date(o.createdAt).toLocaleString()}</p>
                </div>
                <select
                  value={o.status}
                  onChange={(e) => updateOrderStatus(o.id, e.target.value as Order["status"])}
                  className="rounded-lg border border-gray-200 px-2 py-1.5 text-xs font-medium"
                >
                  {["pending", "confirmed", "shipped", "delivered", "cancelled"].map((s) => (
                    <option key={s} value={s}>
                      {s[0].toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <p className="font-medium text-gray-700">{o.customer.name}</p>
                  <p className="text-gray-500">{o.customer.phone}</p>
                  <p className="text-gray-500">
                    {o.customer.address}, {o.customer.city} - {o.customer.pincode}
                  </p>
                </div>
                <div>
                  {o.items.map((item, i) => (
                    <p key={i} className="text-gray-600">
                      {item.name} x{item.quantity} — {formatPrice(item.price * item.quantity)}
                    </p>
                  ))}
                  <p className="mt-1 font-semibold text-gray-900">Total: {formatPrice(o.total)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <ProductForm
          product={editing}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ size?: number }>;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium transition ${
        active ? "border-brand-purple text-brand-purple" : "border-transparent text-gray-500 hover:text-gray-700"
      }`}
    >
      <Icon size={16} /> {label}
    </button>
  );
}

function ProductForm({
  product,
  onClose,
  onSaved,
}: {
  product: Product | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: product?.name || "",
    category: product?.category || categories[0].slug,
    price: product?.price?.toString() || "",
    compareAtPrice: product?.compareAtPrice?.toString() || "",
    fabric: product?.fabric || "",
    stock: product?.stock?.toString() || "10",
    description: product?.description || "",
    sizes: product?.sizes?.join(", ") || "",
    colors: product?.colors?.join(", ") || "",
    isFeatured: product?.isFeatured || false,
  });
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name: form.name,
      category: form.category,
      price: Number(form.price),
      compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : undefined,
      fabric: form.fabric,
      stock: Number(form.stock),
      description: form.description,
      sizes: form.sizes ? form.sizes.split(",").map((s) => s.trim()).filter(Boolean) : undefined,
      colors: form.colors ? form.colors.split(",").map((s) => s.trim()).filter(Boolean) : undefined,
      isFeatured: form.isFeatured,
    };
    if (product) {
      await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
    setSaving(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">{product ? "Edit Product" : "Add Product"}</h2>
          <button onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <Input label="Name *" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} required />
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Category *</label>
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            >
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Price *" type="number" value={form.price} onChange={(v) => setForm((f) => ({ ...f, price: v }))} required />
            <Input label="Compare-at Price" type="number" value={form.compareAtPrice} onChange={(v) => setForm((f) => ({ ...f, compareAtPrice: v }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Fabric" value={form.fabric} onChange={(v) => setForm((f) => ({ ...f, fabric: v }))} />
            <Input label="Stock" type="number" value={form.stock} onChange={(v) => setForm((f) => ({ ...f, stock: v }))} />
          </div>
          <Input label="Sizes (comma separated)" value={form.sizes} onChange={(v) => setForm((f) => ({ ...f, sizes: v }))} />
          <Input label="Colors (comma separated)" value={form.colors} onChange={(v) => setForm((f) => ({ ...f, colors: v }))} />
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))}
              className="h-4 w-4"
            />
            Featured product
          </label>
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-full bg-brand-purple py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? "Saving..." : product ? "Save Changes" : "Add Product"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-purple"
      />
    </div>
  );
}
