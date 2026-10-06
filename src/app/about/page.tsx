import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, Users, Package, Heart } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us | Bazaar Panun",
  description: "Learn about Bazaar Panun — a Kashmir based online store for authentic fabric, suits and bridal wear.",
};

export default function AboutPage() {
  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/brand/hero.svg" alt="" fill className="object-cover" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
          <h1 className="font-serif text-4xl font-bold text-white sm:text-5xl">Our Story</h1>
          <p className="mt-4 text-white/85">Bismillahi Rehman Ni Rahim — rooted in Kashmiri heritage, made for the modern woman.</p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <p className="text-base leading-relaxed text-gray-600">
          Bazaar Panun began as a small Kashmir based venture with one goal — to bring the region&apos;s finest
          textile traditions to homes across India. From hand-loomed brocade and pashmina shawls to intricately
          embroidered bridal suits, every piece we curate carries a story of craftsmanship passed down through
          generations.
        </p>
        <p className="mt-4 text-base leading-relaxed text-gray-600">
          What started as a small collection shared with friends and family has now grown into a community of over
          56,000 followers who trust us for authentic, quality fabric and suits — delivered straight to their
          doorstep with love and care.
        </p>

        <div className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4">
          {[
            { icon: Users, label: "56K+ Followers" },
            { icon: Package, label: "31K+ Products Shared" },
            { icon: Sparkles, label: "Handpicked Quality" },
            { icon: Heart, label: "Loved by Thousands" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-2 rounded-xl border border-gray-100 p-5 text-center shadow-sm">
              <Icon className="text-brand-purple" size={28} />
              <span className="text-sm font-medium text-gray-700">{label}</span>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-xl bg-gray-50 p-8 text-center">
          <h2 className="font-serif text-2xl font-bold text-gray-900">Our Promise</h2>
          <p className="mt-3 text-sm text-gray-600">
            Every product is checked for quality before it reaches you. We work directly with local artisans and
            weavers to ensure authenticity, fair trade and timely delivery — no exceptions.
          </p>
          <Link href="/shop" className="mt-6 inline-block rounded-full bg-brand-purple px-6 py-3 text-sm font-semibold text-white">
            Explore Our Collection
          </Link>
        </div>
      </section>
    </div>
  );
}
