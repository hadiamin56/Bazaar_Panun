"use client";

import { useState } from "react";
import { MapPin, Mail, MessageCircle, Loader2, CheckCircle2 } from "lucide-react";
import { site } from "@/lib/site";
import { InstagramIcon } from "@/components/icons/InstagramIcon";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setTimeout(() => setStatus("sent"), 900);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h1 className="font-serif text-3xl font-bold text-gray-900 sm:text-4xl">Get in Touch</h1>
        <p className="mt-2 text-sm text-gray-500">We&apos;d love to hear from you — reach out via form, WhatsApp or Instagram.</p>
      </div>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-5">
          <ContactRow icon={MapPin} title="Location" desc={site.address} />
          <ContactRow
            icon={MessageCircle}
            title="WhatsApp"
            desc={`+${site.whatsappNumber}`}
            href={`https://wa.me/${site.whatsappNumber}`}
          />
          <ContactRow icon={Mail} title="Email" desc={site.email} href={`mailto:${site.email}`} />
          <ContactRow icon={InstagramIcon} title="Instagram" desc="@bazaarpanun" href={site.instagram} />

          <div className="overflow-hidden rounded-xl border border-gray-100">
            <div className="brand-gradient p-6 text-white">
              <p className="font-serif text-lg font-semibold">Order Directly on WhatsApp</p>
              <p className="mt-1 text-sm text-white/85">DM/WhatsApp us on +{site.whatsappNumber} for quick orders and queries.</p>
              <a
                href={`https://wa.me/${site.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-gray-900"
              >
                Chat Now
              </a>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-purple"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-purple"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Message</label>
            <textarea
              required
              rows={5}
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-purple"
            />
          </div>
          <button
            type="submit"
            disabled={status !== "idle"}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-purple py-3 text-sm font-semibold text-white transition hover:bg-brand-purple/90 disabled:opacity-70"
          >
            {status === "sending" && <Loader2 size={16} className="animate-spin" />}
            {status === "sent" && <CheckCircle2 size={16} />}
            {status === "idle" ? "Send Message" : status === "sending" ? "Sending..." : "Message Sent"}
          </button>
        </form>
      </div>
    </div>
  );
}

function ContactRow({
  icon: Icon,
  title,
  desc,
  href,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  desc: string;
  href?: string;
}) {
  const content = (
    <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition hover:border-brand-purple/40">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-purple/10 text-brand-purple">
        <Icon size={20} />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        <p className="text-sm text-gray-500">{desc}</p>
      </div>
    </div>
  );
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {content}
    </a>
  ) : (
    content
  );
}
