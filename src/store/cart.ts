"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/lib/types";

type CartState = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, size?: string, color?: string) => void;
  updateQuantity: (productId: string, size: string | undefined, color: string | undefined, quantity: number) => void;
  clear: () => void;
  totalItems: () => number;
  subtotal: () => number;
};

const sameLine = (a: CartItem, productId: string, size?: string, color?: string) =>
  a.productId === productId && a.size === size && a.color === color;

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => sameLine(i, item.productId, item.size, item.color));
          if (existing) {
            return {
              items: state.items.map((i) =>
                sameLine(i, item.productId, item.size, item.color)
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, item] };
        }),
      removeItem: (productId, size, color) =>
        set((state) => ({
          items: state.items.filter((i) => !sameLine(i, productId, size, color)),
        })),
      updateQuantity: (productId, size, color, quantity) =>
        set((state) => ({
          items: state.items
            .map((i) =>
              sameLine(i, productId, size, color) ? { ...i, quantity: Math.max(1, quantity) } : i
            )
            .filter((i) => i.quantity > 0),
        })),
      clear: () => set({ items: [] }),
      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal: () => get().items.reduce((sum, i) => sum + i.quantity * i.price, 0),
    }),
    { name: "bazaar-panun-cart" }
  )
);
