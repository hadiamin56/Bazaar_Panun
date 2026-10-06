import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, Users, Package, Heart } from "lucide-react";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { store, about } = await getSettings();
  return { title: `${about.title} | ${store.name}`, description: about.subtitle };
}

const statIcons = [Users, Package, Sparkles, Heart];

export default async function AboutPage() {
  const { about } = await getSettings();
  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image src={about.image} alt="" fill className="object-cover" />
          <div className="absolute inset-0 bg-black/20" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
          <h1 className="font-serif text-4xl font-bold text-white sm:text-5xl">{about.title}</h1>
          {about.subtitle && <p className="mt-4 text-white/85">{about.subtitle}</p>}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        {about.paragraphs.map((text, i) => (
          <p key={i} className={`whitespace-pre-wrap text-base leading-relaxed text-gray-600 ${i > 0 ? "mt-4" : ""}`}>
            {text}
          </p>
        ))}

        {about.stats.length > 0 && (
          <div className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {about.stats.map((label, i) => {
              const Icon = statIcons[i % statIcons.length];
              return (
                <div key={i} className="flex flex-col items-center gap-2 rounded-xl border border-gray-100 p-5 text-center shadow-sm">
                  <Icon className="text-brand-purple" size={28} />
                  <span className="text-sm font-medium text-gray-700">{label}</span>
                </div>
              );
            })}
          </div>
        )}

        {about.promiseTitle && (
          <div className="mt-12 rounded-xl bg-gray-50 p-8 text-center">
            <h2 className="font-serif text-2xl font-bold text-gray-900">{about.promiseTitle}</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm text-gray-600">{about.promiseText}</p>
            <Link href="/shop" className="mt-6 inline-block rounded-full bg-brand-purple px-6 py-3 text-sm font-semibold text-white">
              Explore Our Collection
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
