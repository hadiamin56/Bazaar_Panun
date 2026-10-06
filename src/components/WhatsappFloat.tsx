import { MessageCircle } from "lucide-react";
import { site } from "@/lib/site";

export function WhatsappFloat() {
  return (
    <a
      href={`https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent("Hi! I'm interested in your collection at Bazaar Panun.")}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition hover:scale-110 hover:bg-green-600"
    >
      <MessageCircle size={26} />
    </a>
  );
}
