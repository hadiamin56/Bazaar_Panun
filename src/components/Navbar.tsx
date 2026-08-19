"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, X, Search, Heart, ShoppingBag, User } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import categories from "@/data/categories.json";

const navLinks = [
  { href: "/shop", label: "Shop All" },
  ...categories.map((c) => ({ href: `/shop?category=${c.slug}`, label: c.name })),
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const cartCount = useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));
  const wishCount = useWishlistStore((s) => s.productIds.length);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/shop?q=${encodeURIComponent(query)}`);
    setSearchOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur">
      <div className="brand-gradient py-1.5 text-center text-xs font-medium text-white">
        Free shipping on orders above ₹5,000 &nbsp;•&nbsp; Cash on Delivery available
      </div>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <button
          className="p-1 lg:hidden"
          aria-label="Open menu"
          onClick={() => setOpen(true)}
        >
          <Menu size={24} />
        </button>

        <Link href="/" className="flex items-center gap-2">
          <Image src="/brand/logo.svg" alt="Bazaar Panun" width={40} height={40} className="h-9 w-9" />
          <span className="hidden font-serif text-xl font-bold tracking-tight text-gray-900 sm:block">
            Bazaar <span className="brand-gradient-text">Panun</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-gray-600 transition hover:text-brand-purple"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <button
            aria-label="Search"
            onClick={() => setSearchOpen((v) => !v)}
            className="rounded-full p-2 text-gray-600 transition hover:bg-gray-100"
          >
            <Search size={20} />
          </button>
          <Link href="/admin" aria-label="Admin" className="hidden rounded-full p-2 text-gray-600 transition hover:bg-gray-100 sm:block">
            <User size={20} />
          </Link>
          <Link href="/wishlist" aria-label="Wishlist" className="relative rounded-full p-2 text-gray-600 transition hover:bg-gray-100">
            <Heart size={20} />
            {wishCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-pink text-[10px] font-bold text-white">
                {wishCount}
              </span>
            )}
          </Link>
          <Link href="/cart" aria-label="Cart" className="relative rounded-full p-2 text-gray-600 transition hover:bg-gray-100">
            <ShoppingBag size={20} />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-purple text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-gray-100 bg-white px-4 py-3 sm:px-6 lg:px-8">
          <form onSubmit={submitSearch} className="mx-auto flex max-w-2xl items-center gap-2">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for suits, fabric, shawls..."
              className="w-full rounded-full border border-gray-200 px-4 py-2 text-sm outline-none focus:border-brand-purple"
            />
            <button type="submit" className="rounded-full bg-brand-purple px-4 py-2 text-sm font-medium text-white">
              Search
            </button>
          </form>
        </div>
      )}

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-screen w-72 overflow-y-auto bg-white p-5 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <span className="font-serif text-lg font-bold">Bazaar Panun</span>
              <button aria-label="Close menu" onClick={() => setOpen(false)}>
                <X size={22} />
              </button>
            </div>
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  {link.label}
                </Link>
              ))}
              <div className="my-2 border-t border-gray-100" />
              <Link href="/wishlist" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Wishlist
              </Link>
              <Link href="/cart" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Cart
              </Link>
              <Link href="/about" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                About Us
              </Link>
              <Link href="/contact" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Contact
              </Link>
              <Link href="/admin" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Admin
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
