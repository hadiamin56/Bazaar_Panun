import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Truck, ShieldCheck, RotateCcw, MessageCircle } from "lucide-react";
import { InstagramIcon } from "@/components/icons/InstagramIcon";
import { getProducts, getCategories } from "@/lib/products";
import { getSettings } from "@/lib/settings";
import { ProductCard } from "@/components/ProductCard";

// Always read the latest products and content from the database.
export const dynamic = "force-dynamic";

const badgeIcons = [Truck, ShieldCheck, RotateCcw];

function SectionHeading({ title, subtitle, viewAll = true }: { title: string; subtitle: string; viewAll?: boolean }) {
  return (
    <div className="mb-8 flex items-end justify-between">
      <div>
        <h2 className="font-serif text-2xl font-bold text-gray-900 sm:text-3xl">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
      </div>
      {viewAll && (
        <Link href="/shop" className="hidden text-sm font-medium text-brand-purple hover:underline sm:block">
          View all
        </Link>
      )}
    </div>
  );
}

export default async function Home() {
  const [products, categories, { home, store }] = await Promise.all([getProducts(), getCategories(), getSettings()]);
  const featured = products.filter((p) => p.isFeatured).slice(0, 8);
  const newArrivals = products.filter((p) => p.isNew).slice(0, 4);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image src={home.heroImage} alt="" fill priority className="object-cover" />
          <div className="absolute inset-0 bg-black/20" />
        </div>
        <div className="relative mx-auto flex max-w-7xl flex-col items-start gap-5 px-4 py-24 sm:px-6 md:py-32 lg:px-8">
          {home.heroBadge && (
            <span className="rounded-full bg-white/15 px-4 py-1 text-xs font-medium uppercase tracking-widest text-white backdrop-blur">
              {home.heroBadge}
            </span>
          )}
          <h1 className="max-w-xl font-serif text-4xl font-bold leading-tight text-white sm:text-5xl md:text-6xl">
            {home.heroTitle}
          </h1>
          {home.heroSubtitle && <p className="max-w-md text-base text-white/85 sm:text-lg">{home.heroSubtitle}</p>}
          <div className="flex flex-wrap gap-3">
            {home.heroPrimaryLabel && (
              <Link
                href={home.heroPrimaryLink}
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-gray-900 shadow-lg transition hover:scale-105"
              >
                {home.heroPrimaryLabel} <ArrowRight size={16} />
              </Link>
            )}
            {home.heroSecondaryLabel && (
              <Link
                href={home.heroSecondaryLink}
                className="inline-flex items-center gap-2 rounded-full border border-white/60 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                {home.heroSecondaryLabel}
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Trust badges */}
      {home.showBadges && home.badges.length > 0 && (
        <section className="border-b border-gray-100 bg-white">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-8 sm:grid-cols-3 sm:px-6 lg:px-8">
            {home.badges.map((b, i) => {
              const Icon = badgeIcons[i % badgeIcons.length];
              return (
                <div key={i} className="flex items-center gap-3">
                  <Icon className="shrink-0 text-brand-purple" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{b.title}</p>
                    <p className="text-xs text-gray-500">{b.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Categories */}
      {home.showCategories && categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading title={home.categoriesTitle} subtitle={home.categoriesSubtitle} />
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
      )}

      {/* Featured products */}
      {home.showFeatured && featured.length > 0 && (
        <section className="bg-gray-50 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading title={home.featuredTitle} subtitle={home.featuredSubtitle} />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {featured.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* New arrivals */}
      {home.showNewArrivals && newArrivals.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading title={home.newArrivalsTitle} subtitle={home.newArrivalsSubtitle} />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {newArrivals.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Testimonials */}
      {home.showTestimonials && home.testimonials.length > 0 && (
        <section className="bg-gray-50 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-8 text-center font-serif text-2xl font-bold text-gray-900 sm:text-3xl">{home.testimonialsTitle}</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {home.testimonials.map((t, i) => (
                <div key={i} className="rounded-xl bg-white p-6 shadow-sm">
                  <p className="text-sm text-gray-600">&ldquo;{t.text}&rdquo;</p>
                  <p className="mt-4 text-sm font-semibold text-gray-900">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.city}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Instagram / WhatsApp CTA */}
      {home.showCta && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="brand-gradient flex flex-col items-center gap-6 rounded-2xl px-6 py-12 text-center text-white sm:flex-row sm:justify-between sm:text-left">
            <div>
              <h2 className="font-serif text-2xl font-bold sm:text-3xl">{home.ctaTitle}</h2>
              {home.ctaText && <p className="mt-2 text-sm text-white/85">{home.ctaText}</p>}
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {store.instagramUrl && (
                <a
                  href={store.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-gray-900 transition hover:scale-105"
                >
                  <InstagramIcon size={18} /> {store.instagramHandle || "Instagram"}
                </a>
              )}
              {store.whatsappNumber && (
                <a
                  href={`https://wa.me/${store.whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/70 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  <MessageCircle size={18} /> WhatsApp Us
                </a>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
