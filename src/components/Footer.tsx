"use client";

import Link from "next/link";
import Image from "next/image";
import { MessageCircle, Mail, MapPin } from "lucide-react";
import { InstagramIcon } from "@/components/icons/InstagramIcon";
import { useSite } from "@/components/SiteProvider";

export function Footer() {
  const { settings, categories } = useSite();
  const site = settings.store;
  return (
    <footer className="mt-16 border-t border-gray-100 bg-gray-50">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="col-span-2 md:col-span-1">
          <Link href="/" className="mb-3 flex items-center gap-2">
            <Image src={site.logo} alt={site.name} width={36} height={36} className="h-9 w-9 object-contain" />
            <span className="font-serif text-lg font-bold">{site.name}</span>
          </Link>
          <p className="whitespace-pre-wrap text-sm text-gray-500">{site.footerAbout}</p>
          <div className="mt-4 flex gap-3">
            {site.instagramUrl && <a
              href={site.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-gray-600 shadow-sm transition hover:text-brand-pink"
            >
              <InstagramIcon size={18} />
            </a>}
            <a
              href={`https://wa.me/${site.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-gray-600 shadow-sm transition hover:text-green-600"
            >
              <MessageCircle size={18} />
            </a>
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-gray-900">Shop</h3>
          <ul className="space-y-2 text-sm text-gray-500">
            {categories.slice(0, 6).map((c) => (
              <li key={c.slug}>
                <Link href={`/shop?category=${c.slug}`} className="hover:text-brand-purple">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-gray-900">Company</h3>
          <ul className="space-y-2 text-sm text-gray-500">
            <li><Link href="/about" className="hover:text-brand-purple">About Us</Link></li>
            <li><Link href="/contact" className="hover:text-brand-purple">Contact</Link></li>
            <li><Link href="/shop" className="hover:text-brand-purple">All Products</Link></li>
            <li><Link href="/wishlist" className="hover:text-brand-purple">Wishlist</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-gray-900">Get in Touch</h3>
          <ul className="space-y-2.5 text-sm text-gray-500">
            <li className="flex items-start gap-2">
              <MapPin size={16} className="mt-0.5 shrink-0" />
              {site.address}
            </li>
            <li className="flex items-center gap-2">
              <MessageCircle size={16} className="shrink-0" />
              <a href={`https://wa.me/${site.whatsappNumber}`} className="hover:text-brand-purple">
                +{site.whatsappNumber}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail size={16} className="shrink-0" />
              <a href={`mailto:${site.email}`} className="hover:text-brand-purple">
                {site.email}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-100 py-4 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} {site.name}. All rights reserved.{site.footerNote && ` · ${site.footerNote}`}
      </div>
    </footer>
  );
}
