"use client";

import { createContext, useContext } from "react";

// Sends an admin request. Shows the server's error and returns null on failure;
// a 401 (logged out / session expired) sends the user back to the login screen.
export type AdminFetch = <T = unknown>(url: string, init?: RequestInit) => Promise<T | null>;

export const AdminFetchContext = createContext<AdminFetch | null>(null);

export function useAdminFetch(): AdminFetch {
  const value = useContext(AdminFetchContext);
  if (!value) throw new Error("useAdminFetch must be used inside the admin dashboard");
  return value;
}

export function makeAdminFetch(onUnauthorized: () => void): AdminFetch {
  return async <T,>(url: string, init?: RequestInit) => {
    const res = await fetch(url, init).catch(() => null);
    if (!res) {
      alert("Network error. Please check your connection and try again.");
      return null;
    }
    if (res.status === 401) {
      onUnauthorized();
      return null;
    }
    const body = await res.json().catch(() => null);
    if (!res.ok) {
      alert(body?.error || `Something went wrong (error ${res.status}). Please try again.`);
      return null;
    }
    return (body ?? {}) as T;
  };
}

export const jsonInit = (method: string, data: unknown): RequestInit => ({
  method,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(data),
});

// Shrinks photos in the browser before upload (max 1600px, WebP), so pages load fast
// and the database stays small. GIFs are uploaded as they are to keep animation.
async function compressImage(file: File): Promise<Blob> {
  if (file.type === "image/gif") return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.85));
    return blob && blob.size < file.size ? blob : file;
  } catch {
    return file;
  }
}

export async function uploadImage(file: File, adminFetch: AdminFetch): Promise<string | null> {
  const body = new FormData();
  body.append("file", await compressImage(file), file.name);
  const result = await adminFetch<{ url: string }>("/api/images", { method: "POST", body });
  return result?.url ?? null;
}
