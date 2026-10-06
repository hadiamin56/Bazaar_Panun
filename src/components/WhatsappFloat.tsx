"use client";

import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { useSite } from "@/components/SiteProvider";

export function WhatsappFloat() {
  const { store } = useSite().settings;
  const pathname = usePathname();
  // Hidden in the admin, where it would cover the Save button.
  if (!store.whatsappNumber || pathname.startsWith("/admin")) return null;
  return (
    <a
      href={`https://wa.me/${store.whatsappNumber}?text=${encodeURIComponent(store.whatsappMessage)}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition hover:scale-110 hover:bg-green-600"
    >
      <MessageCircle size={26} />
    </a>
  );
}
