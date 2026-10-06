"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ArrowDown, ArrowUp, ImagePlus, Loader2, Plus, Trash2, X } from "lucide-react";
import { uploadImage, useAdminFetch } from "./api";

const inputClass =
  "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-purple";

export function Card({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      {description && <p className="mt-0.5 text-xs text-gray-500">{description}</p>}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

export function Label({ text, hint }: { text: string; hint?: string }) {
  return (
    <span className="mb-1 block text-sm font-medium text-gray-700">
      {text}
      {hint && <span className="ml-1 text-xs font-normal text-gray-400">— {hint}</span>}
    </span>
  );
}

export function TextField({
  label,
  hint,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <Label text={label} hint={hint} />
      <input type={type} required={required} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className={inputClass} />
    </label>
  );
}

export function TextArea({ label, hint, value, onChange, rows = 3 }: { label: string; hint?: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <label className="block">
      <Label text={label} hint={hint} />
      <textarea rows={rows} value={value} onChange={(e) => onChange(e.target.value)} className={inputClass} />
    </label>
  );
}

export function NumberField({ label, hint, value, onChange }: { label: string; hint?: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="block">
      <Label text={label} hint={hint} />
      <input
        type="number"
        min={0}
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(Math.max(0, Math.round(Number(e.target.value) || 0)))}
        className={inputClass}
      />
    </label>
  );
}

export function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-sm text-gray-700">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? "bg-brand-purple" : "bg-gray-300"}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${checked ? "left-[22px]" : "left-0.5"}`} />
      </button>
      {label}
    </label>
  );
}

function useUploader() {
  const adminFetch = useAdminFetch();
  const [uploading, setUploading] = useState(false);
  const upload = async (files: File[]) => {
    setUploading(true);
    const urls: string[] = [];
    for (const file of files) {
      const url = await uploadImage(file, adminFetch);
      if (url) urls.push(url);
    }
    setUploading(false);
    return urls;
  };
  return { upload, uploading };
}

// One image with an upload/replace button.
export function ImageField({ label, hint, value, onChange }: { label: string; hint?: string; value: string; onChange: (url: string) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const { upload, uploading } = useUploader();
  return (
    <div>
      <Label text={label} hint={hint} />
      <div className="flex items-center gap-4">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
          {value && <Image src={value} alt="" fill className="object-cover" />}
        </div>
        <button
          type="button"
          disabled={uploading}
          onClick={() => input.current?.click()}
          className="flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:border-brand-purple disabled:opacity-60"
        >
          {uploading ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
          {uploading ? "Uploading..." : value ? "Change image" : "Upload image"}
        </button>
        <input
          ref={input}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={async (e) => {
            const files = Array.from(e.target.files ?? []);
            e.target.value = "";
            const [url] = await upload(files.slice(0, 1));
            if (url) onChange(url);
          }}
        />
      </div>
    </div>
  );
}

// Several images: upload many at once, remove, and reorder. The first one is the main photo.
export function ImagesField({ label, value, onChange }: { label: string; value: string[]; onChange: (urls: string[]) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const { upload, uploading } = useUploader();
  const move = (i: number, j: number) => {
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <div>
      <Label text={label} hint="first photo is the main one" />
      <div className="flex flex-wrap gap-3">
        {value.map((url, i) => (
          <div key={url + i} className="group relative h-24 w-20 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
            <Image src={url} alt="" fill className="object-cover" />
            {i === 0 && <span className="absolute left-1 top-1 rounded bg-brand-purple px-1 text-[10px] font-semibold text-white">Main</span>}
            <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/50 p-0.5 text-white">
              <button type="button" aria-label="Move left" disabled={i === 0} onClick={() => move(i, i - 1)} className="disabled:opacity-30">
                <ArrowUp size={14} className="-rotate-90" />
              </button>
              <button type="button" aria-label="Remove" onClick={() => onChange(value.filter((_, k) => k !== i))}>
                <X size={14} />
              </button>
              <button type="button" aria-label="Move right" disabled={i === value.length - 1} onClick={() => move(i, i + 1)} className="disabled:opacity-30">
                <ArrowUp size={14} className="rotate-90" />
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          disabled={uploading}
          onClick={() => input.current?.click()}
          className="flex h-24 w-20 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-gray-200 text-xs text-gray-500 hover:border-brand-purple disabled:opacity-60"
        >
          {uploading ? <Loader2 size={18} className="animate-spin" /> : <ImagePlus size={18} />}
          {uploading ? "Uploading" : "Add photos"}
        </button>
        <input
          ref={input}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={async (e) => {
            const files = Array.from(e.target.files ?? []);
            e.target.value = "";
            const urls = await upload(files);
            if (urls.length) onChange([...value, ...urls]);
          }}
        />
      </div>
    </div>
  );
}

// Editable list of items (testimonials, badges, paragraphs...) with add/remove/reorder.
export function ListEditor<T>({
  label,
  items,
  onChange,
  newItem,
  renderItem,
  addLabel = "Add",
}: {
  label: string;
  items: T[];
  onChange: (items: T[]) => void;
  newItem: () => T;
  renderItem: (item: T, update: (item: T) => void) => React.ReactNode;
  addLabel?: string;
}) {
  const move = (i: number, j: number) => {
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <div>
      <Label text={label} />
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2 rounded-lg border border-gray-100 bg-gray-50 p-3">
            <div className="flex-1 space-y-2">{renderItem(item, (updated) => onChange(items.map((x, k) => (k === i ? updated : x))))}</div>
            <div className="flex flex-col gap-1 text-gray-400">
              <button type="button" aria-label="Move up" disabled={i === 0} onClick={() => move(i, i - 1)} className="hover:text-gray-700 disabled:opacity-30">
                <ArrowUp size={16} />
              </button>
              <button type="button" aria-label="Move down" disabled={i === items.length - 1} onClick={() => move(i, i + 1)} className="hover:text-gray-700 disabled:opacity-30">
                <ArrowDown size={16} />
              </button>
              <button type="button" aria-label="Remove" onClick={() => onChange(items.filter((_, k) => k !== i))} className="hover:text-red-500">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange([...items, newItem()])}
        className="mt-2 flex items-center gap-1.5 text-sm font-medium text-brand-purple hover:underline"
      >
        <Plus size={16} /> {addLabel}
      </button>
    </div>
  );
}

export const smallInputClass = inputClass;
