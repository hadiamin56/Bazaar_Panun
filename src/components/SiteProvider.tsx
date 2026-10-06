"use client";

import { createContext, useContext } from "react";
import type { SiteSettings } from "@/lib/settings-defaults";
import type { Category } from "@/lib/types";

type SiteContextValue = { settings: SiteSettings; categories: Category[] };

const SiteContext = createContext<SiteContextValue | null>(null);

// Makes the admin-managed settings and categories available to client components.
export function SiteProvider({ value, children }: { value: SiteContextValue; children: React.ReactNode }) {
  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export function useSite(): SiteContextValue {
  const value = useContext(SiteContext);
  if (!value) throw new Error("useSite must be used inside <SiteProvider>");
  return value;
}
