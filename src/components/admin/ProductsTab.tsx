"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Pencil, Plus, Search, Trash2, X } from "lucide-react";
import type { Category, Product } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { jsonInit, useAdminFetch } from "./api";
import { ImagesField, NumberField, TextArea, TextField, Toggle, smallInputClass } from "./ui";

export function ProductsTab({ categories }: { categories: Category[] }) {
  const adminFetch = useAdminFetch();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [editing, setEditing] = useState<Product | "new" | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");

  const load = useCallback(async () => {
    const data = await adminFetch<Product[]>("/api/products");
    if (data) setProducts(data);
  }, [adminFetch]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch on mount
    load();
  }, [load]);

  const remove = async (p: Product) => {
    if (!confirm(`Delete "${p.name}"? Past orders keep their details.`)) return;
    if (await adminFetch(`/api/products/${p.id}`, { method: "DELETE" })) load();
  };

  if (!products) return <p className="text-sm text-gray-400">Loading...</p>;

  const categoryName = (slug: string) => categories.find((c) => c.slug === slug)?.name ?? slug;
  const q = query.trim().toLowerCase();
  const shown = products.filter((p) => (!category || p.category === category) && (!q || p.name.toLowerCase().includes(q)));

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button onClick={() => setEditing("new")} className="flex items-center gap-2 rounded-full bg-brand-purple px-4 py-2 text-sm font-semibold text-white">
          <Plus size={16} /> Add Product
        </button>
        <div className="relative min-w-[180px] flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input placeholder="Search products" value={query} onChange={(e) => setQuery(e.target.value)} className={`${smallInputClass} pl-9`} />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm">
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Labels</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {shown.map((p) => (
              <tr key={p.id} className="border-t border-gray-100">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded bg-gray-100">
                      <Image src={p.images[0]} alt="" fill className="object-cover" />
                    </div>
                    <span className="line-clamp-2 max-w-[220px] font-medium text-gray-800">{p.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500">{categoryName(p.category)}</td>
                <td className="px-4 py-3 text-gray-800">{formatPrice(p.price)}</td>
                <td className={`px-4 py-3 ${p.stock === 0 ? "font-semibold text-red-500" : p.stock <= 3 ? "text-amber-600" : "text-gray-500"}`}>
                  {p.stock === 0 ? "Out of stock" : p.stock}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {p.isFeatured && <span className="rounded bg-brand-purple/10 px-1.5 py-0.5 text-[11px] text-brand-purple">Featured</span>}
                    {p.isNew && <span className="rounded bg-green-50 px-1.5 py-0.5 text-[11px] text-green-700">New</span>}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-3">
                    <button onClick={() => setEditing(p)} className="text-gray-400 hover:text-brand-purple" aria-label="Edit">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => remove(p)} className="text-gray-400 hover:text-red-500" aria-label="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {shown.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <ProductForm
          product={editing === "new" ? null : editing}
          categories={categories}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
    </div>
  );
}

const toList = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);

function ProductForm({
  product,
  categories,
  onClose,
  onSaved,
}: {
  product: Product | null;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const adminFetch = useAdminFetch();
  const [form, setForm] = useState({
    name: product?.name ?? "",
    category: product?.category ?? categories[0]?.slug ?? "",
    price: product?.price ?? 0,
    compareAtPrice: product?.compareAtPrice ?? 0,
    fabric: product?.fabric ?? "",
    stock: product?.stock ?? 10,
    description: product?.description ?? "",
    sizes: product?.sizes?.join(", ") ?? "",
    colors: product?.colors?.join(", ") ?? "",
    tags: product?.tags?.join(", ") ?? "",
    images: (product?.images ?? []).filter((url) => url !== "/products/placeholder.svg"),
    isFeatured: product?.isFeatured ?? false,
    isNew: product?.isNew ?? true,
  });
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => setForm((f) => ({ ...f, [key]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.price <= 0) return alert("Please enter a price.");
    setSaving(true);
    const payload = {
      name: form.name,
      category: form.category,
      price: form.price,
      compareAtPrice: form.compareAtPrice > form.price ? form.compareAtPrice : null,
      fabric: form.fabric,
      stock: form.stock,
      description: form.description,
      sizes: toList(form.sizes),
      colors: toList(form.colors),
      tags: toList(form.tags),
      images: form.images.length ? form.images : ["/products/placeholder.svg"],
      isFeatured: form.isFeatured,
      isNew: form.isNew,
    };
    const ok = await adminFetch(product ? `/api/products/${product.id}` : "/api/products", jsonInit(product ? "PUT" : "POST", payload));
    setSaving(false);
    if (ok) onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">{product ? "Edit Product" : "Add Product"}</h2>
          <button onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <ImagesField label="Photos" value={form.images} onChange={(v) => set("images", v)} />
          <TextField label="Name *" required value={form.name} onChange={(v) => set("name", v)} />
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700">Category *</span>
            <select value={form.category} onChange={(e) => set("category", e.target.value)} className={smallInputClass}>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <NumberField label="Price (₹) *" value={form.price} onChange={(v) => set("price", v)} />
            <NumberField label="Original price (₹)" hint="shown crossed out" value={form.compareAtPrice} onChange={(v) => set("compareAtPrice", v)} />
            <NumberField label="Stock" value={form.stock} onChange={(v) => set("stock", v)} />
          </div>
          <TextField label="Fabric" value={form.fabric} onChange={(v) => set("fabric", v)} />
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField label="Sizes" hint="comma separated" placeholder="S, M, L, XL" value={form.sizes} onChange={(v) => set("sizes", v)} />
            <TextField label="Colours" hint="comma separated" placeholder="Maroon, Emerald" value={form.colors} onChange={(v) => set("colors", v)} />
          </div>
          <TextField label="Tags" hint="comma separated, e.g. bestseller" value={form.tags} onChange={(v) => set("tags", v)} />
          <TextArea label="Description" rows={4} value={form.description} onChange={(v) => set("description", v)} />
          <div className="flex flex-wrap gap-6">
            <Toggle label="Featured on homepage" checked={form.isFeatured} onChange={(v) => set("isFeatured", v)} />
            <Toggle label="New arrival" checked={form.isNew} onChange={(v) => set("isNew", v)} />
          </div>
          <button type="submit" disabled={saving} className="w-full rounded-full bg-brand-purple py-2.5 text-sm font-semibold text-white disabled:opacity-60">
            {saving ? "Saving..." : product ? "Save Changes" : "Add Product"}
          </button>
        </form>
      </div>
    </div>
  );
}
