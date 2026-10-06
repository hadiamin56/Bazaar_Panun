"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type WishlistState = {
  productIds: string[];
  toggle: (productId: string) => void;
  isWished: (productId: string) => boolean;
};

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      productIds: [],
      toggle: (productId) =>
        set((state) => ({
          productIds: state.productIds.includes(productId)
            ? state.productIds.filter((id) => id !== productId)
            : [...state.productIds, productId],
        })),
      isWished: (productId) => get().productIds.includes(productId),
    }),
    { name: "bazaar-panun-wishlist" }
  )
);
