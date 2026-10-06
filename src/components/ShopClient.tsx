"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import type { Product, Category } from "@/lib/types";
import { ProductCard } from "./ProductCard";
import { formatPrice } from "@/lib/format";

const SORTS = [
  { value: "newest", label: "Newest First" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
] as const;

export function ShopClient({ products, categories }: { products: Product[]; categories: Category[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get("category") ? [searchParams.get("category") as string] : []
  );
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [sort, setSort] = useState<string>("newest");
  const [maxPrice, setMaxPrice] = useState<number>(30000);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    const cat = searchParams.get("category");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resync filters when nav link changes the URL
    setSelectedCategories(cat ? [cat] : []);
    setQuery(searchParams.get("q") || "");
  }, [searchParams]);

  const toggleCategory = (slug: string) => {
    setSelectedCategories((prev) => (prev.includes(slug) ? prev.filter((c) => c !== slug) : [...prev, slug]));
  };

  const filtered = useMemo(() => {
    let list = products.filter((p) => p.price <= maxPrice);
    if (selectedCategories.length) {
      list = list.filter((p) => selectedCategories.includes(p.category));
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.fabric?.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }
    switch (sort) {
      case "price-asc":
        list = [...list].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list = [...list].sort((a, b) => b.price - a.price);
        break;
      case "rating":
        list = [...list].sort((a, b) => b.rating - a.rating);
        break;
      default:
        list = [...list].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    }
    return list;
  }, [products, selectedCategories, query, sort, maxPrice]);

  const clearFilters = () => {
    setSelectedCategories([]);
    setMaxPrice(30000);
    setQuery("");
    router.replace(pathname);
  };

  const FilterPanel = (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-semibold text-gray-900">Search</h3>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products..."
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-purple"
        />
      </div>
      <div>
        <h3 className="mb-3 text-sm font-semibold text-gray-900">Category</h3>
        <div className="space-y-2">
          {categories.map((c) => (
            <label key={c.slug} className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={selectedCategories.includes(c.slug)}
                onChange={() => toggleCategory(c.slug)}
                className="h-4 w-4 rounded border-gray-300 text-brand-purple focus:ring-brand-purple"
              />
              {c.name}
            </label>
          ))}
        </div>
      </div>
      <div>
        <h3 className="mb-3 text-sm font-semibold text-gray-900">
          Max Price: {formatPrice(maxPrice)}
        </h3>
        <input
          type="range"
          min={500}
          max={30000}
          step={500}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-brand-purple"
        />
      </div>
      <button onClick={clearFilters} className="text-sm font-medium text-brand-purple hover:underline">
        Clear all filters
      </button>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold text-gray-900">Shop All</h1>
        <p className="mt-1 text-sm text-gray-500">{filtered.length} products found</p>
      </div>

      <div className="flex gap-8">
        <aside className="hidden w-64 shrink-0 lg:block">{FilterPanel}</aside>

        <div className="flex-1">
          <div className="mb-5 flex items-center justify-between gap-3">
            <button
              onClick={() => setFiltersOpen(true)}
              className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 lg:hidden"
            >
              <SlidersHorizontal size={16} /> Filters
            </button>
            <div className="ml-auto flex items-center gap-2">
              <label htmlFor="sort" className="text-sm text-gray-500">
                Sort by
              </label>
              <select
                id="sort"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="rounded-lg border border-gray-200 px-2 py-2 text-sm outline-none focus:border-brand-purple"
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-24 text-center">
              <p className="text-lg font-medium text-gray-700">No products found</p>
              <p className="mt-1 text-sm text-gray-500">Try adjusting your filters or search terms.</p>
              <button onClick={clearFilters} className="mt-4 rounded-full bg-brand-purple px-5 py-2 text-sm font-medium text-white">
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>

      {filtersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setFiltersOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-80 max-w-full overflow-y-auto bg-white p-5 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <span className="text-base font-semibold">Filters</span>
              <button aria-label="Close filters" onClick={() => setFiltersOpen(false)}>
                <X size={22} />
              </button>
            </div>
            {FilterPanel}
          </div>
        </div>
      )}
    </div>
  );
}
