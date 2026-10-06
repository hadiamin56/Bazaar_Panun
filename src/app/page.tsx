import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Truck, ShieldCheck, RotateCcw, MessageCircle } from "lucide-react";
import { InstagramIcon } from "@/components/icons/InstagramIcon";
import { getProducts, getCategories } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";
import { site } from "@/lib/site";

// Always read the latest products from the database.
export const dynamic = "force-dynamic";

export default async function Home() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  const featured = products.filter((p) => p.isFeatured).slice(0, 8);
  const newArrivals = [...products].filter((p) => p.isNew).slice(0, 4);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/brand/hero.svg" alt="" fill priority className="object-cover" />
        </div>
        <div className="relative mx-auto flex max-w-7xl flex-col items-start gap-5 px-4 py-24 sm:px-6 md:py-32 lg:px-8">
          <span className="rounded-full bg-white/15 px-4 py-1 text-xs font-medium uppercase tracking-widest text-white backdrop-blur">
            Kashmir Based Online Store
          </span>
          <h1 className="max-w-xl font-serif text-4xl font-bold leading-tight text-white sm:text-5xl md:text-6xl">
            Timeless Fabric &amp; Suits, Woven With Tradition
          </h1>
          <p className="max-w-md text-base text-white/85 sm:text-lg">
            Discover handpicked brocade, bridal wear, pashmina shawls and designer suits — crafted for every occasion.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-gray-900 shadow-lg transition hover:scale-105"
            >
              Shop Collection <ArrowRight size={16} />
            </Link>
            <Link
              href="/shop?category=bridal-wear"
              className="inline-flex items-center gap-2 rounded-full border border-white/60 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Bridal Collection
            </Link>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="border-b border-gray-100 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-8 sm:grid-cols-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Truck className="text-brand-purple" />
            <div>
              <p className="text-sm font-semibold text-gray-900">Pan-India Delivery</p>
              <p className="text-xs text-gray-500">Free shipping above ₹5,000</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-brand-purple" />
            <div>
              <p className="text-sm font-semibold text-gray-900">Authentic Craftsmanship</p>
              <p className="text-xs text-gray-500">Sourced directly from Kashmir</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <RotateCcw className="text-brand-purple" />
            <div>
              <p className="text-sm font-semibold text-gray-900">Cash on Delivery</p>
              <p className="text-xs text-gray-500">Pay when your order arrives</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-serif text-2xl font-bold text-gray-900 sm:text-3xl">Shop by Category</h2>
            <p className="mt-1 text-sm text-gray-500">Explore our curated collections</p>
          </div>
          <Link href="/shop" className="hidden text-sm font-medium text-brand-purple hover:underline sm:block">
            View all
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/shop?category=${c.slug}`}
              className="group relative aspect-[4/5] overflow-hidden rounded-xl"
            >
              <Image src={c.image} alt={c.name} fill sizes="200px" className="object-cover transition duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-black/25 transition group-hover:bg-black/40" />
              <span className="absolute bottom-3 left-3 right-3 text-sm font-semibold text-white">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="font-serif text-2xl font-bold text-gray-900 sm:text-3xl">Featured Pieces</h2>
              <p className="mt-1 text-sm text-gray-500">Handpicked favourites from our collection</p>
            </div>
            <Link href="/shop" className="hidden text-sm font-medium text-brand-purple hover:underline sm:block">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* New arrivals */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-serif text-2xl font-bold text-gray-900 sm:text-3xl">New Arrivals</h2>
            <p className="mt-1 text-sm text-gray-500">Fresh off the loom</p>
          </div>
          <Link href="/shop" className="hidden text-sm font-medium text-brand-purple hover:underline sm:block">
            View all
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {newArrivals.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-center font-serif text-2xl font-bold text-gray-900 sm:text-3xl">What Our Customers Say</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { name: "Aaliya R.", text: "The brocade fabric quality is outstanding — exactly like the pictures. Fast delivery too!", city: "Srinagar" },
              { name: "Fatima K.", text: "Ordered my bridal suit from here and got so many compliments. Truly authentic Kashmiri craftsmanship.", city: "Delhi" },
              { name: "Insha M.", text: "Loved the pashmina shawl, so soft and warm. Will definitely shop again.", city: "Jammu" },
            ].map((t) => (
              <div key={t.name} className="rounded-xl bg-white p-6 shadow-sm">
                <p className="text-sm text-gray-600">&ldquo;{t.text}&rdquo;</p>
                <p className="mt-4 text-sm font-semibold text-gray-900">{t.name}</p>
                <p className="text-xs text-gray-400">{t.city}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Instagram / WhatsApp CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="brand-gradient flex flex-col items-center gap-6 rounded-2xl px-6 py-12 text-center text-white sm:flex-row sm:justify-between sm:text-left">
          <div>
            <h2 className="font-serif text-2xl font-bold sm:text-3xl">Follow Us for Daily Drops</h2>
            <p className="mt-2 text-sm text-white/85">Join 56K+ followers for new arrivals, styling tips and exclusive offers.</p>
          </div>
          <div className="flex gap-3">
            <a
              href={site.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-gray-900 transition hover:scale-105"
            >
              <InstagramIcon size={18} /> @bazaarpanun
            </a>
            <a
              href={`https://wa.me/${site.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/70 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              <MessageCircle size={18} /> WhatsApp Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
