"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2, X } from "lucide-react";
import type { Category } from "@/lib/types";
import { jsonInit, useAdminFetch } from "./api";
import { ImageField, TextArea, TextField } from "./ui";

export function CategoriesTab({ onChanged }: { onChanged: () => void }) {
  const adminFetch = useAdminFetch();
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [editing, setEditing] = useState<Category | "new" | null>(null);

  const load = useCallback(async () => {
    const data = await adminFetch<Category[]>("/api/categories");
    if (data) setCategories(data);
  }, [adminFetch]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch on mount
    load();
  }, [load]);

  const changed = () => {
    load();
    onChanged();
  };

  const move = async (slug: string, direction: "up" | "down") => {
    if (await adminFetch(`/api/categories/${slug}`, jsonInit("PUT", { move: direction }))) changed();
  };

  const remove = async (c: Category) => {
    if (!confirm(`Delete the category "${c.name}"?`)) return;
    if (await adminFetch(`/api/categories/${c.slug}`, { method: "DELETE" })) changed();
  };

  if (!categories) return <p className="text-sm text-gray-400">Loading...</p>;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-500">Categories appear in the menu, footer, shop filters and on the homepage, in this order.</p>
        <button onClick={() => setEditing("new")} className="flex items-center gap-2 rounded-full bg-brand-purple px-4 py-2 text-sm font-semibold text-white">
          <Plus size={16} /> Add Category
        </button>
      </div>
      <div className="divide-y divide-gray-100 rounded-xl border border-gray-100 bg-white">
        {categories.length === 0 && <p className="p-4 text-sm text-gray-400">No categories yet.</p>}
        {categories.map((c, i) => (
          <div key={c.slug} className="flex items-center gap-3 p-3">
            <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded bg-gray-100">
              <Image src={c.image} alt="" fill className="object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-gray-900">{c.name}</p>
              <p className="truncate text-xs text-gray-500">{c.description}</p>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <button aria-label="Move up" disabled={i === 0} onClick={() => move(c.slug, "up")} className="hover:text-gray-700 disabled:opacity-30">
                <ArrowUp size={16} />
              </button>
              <button aria-label="Move down" disabled={i === categories.length - 1} onClick={() => move(c.slug, "down")} className="hover:text-gray-700 disabled:opacity-30">
                <ArrowDown size={16} />
              </button>
              <button aria-label="Edit" onClick={() => setEditing(c)} className="hover:text-brand-purple">
                <Pencil size={16} />
              </button>
              <button aria-label="Delete" onClick={() => remove(c)} className="hover:text-red-500">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <CategoryForm
          category={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            changed();
          }}
        />
      )}
    </div>
  );
}

function CategoryForm({ category, onClose, onSaved }: { category: Category | null; onClose: () => void; onSaved: () => void }) {
  const adminFetch = useAdminFetch();
  const [form, setForm] = useState({
    name: category?.name ?? "",
    description: category?.description ?? "",
    image: category?.image ?? "/products/placeholder.svg",
  });
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const ok = await adminFetch(category ? `/api/categories/${category.slug}` : "/api/categories", jsonInit(category ? "PUT" : "POST", form));
    setSaving(false);
    if (ok) onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">{category ? "Edit Category" : "Add Category"}</h2>
          <button onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <TextField label="Name *" required value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} />
          <TextArea label="Description" rows={2} value={form.description} onChange={(v) => setForm((f) => ({ ...f, description: v }))} />
          <ImageField label="Image" hint="portrait photo works best" value={form.image} onChange={(v) => setForm((f) => ({ ...f, image: v }))} />
          <button type="submit" disabled={saving} className="w-full rounded-full bg-brand-purple py-2.5 text-sm font-semibold text-white disabled:opacity-60">
            {saving ? "Saving..." : category ? "Save Changes" : "Add Category"}
          </button>
        </form>
      </div>
    </div>
  );
}
