"use client";

import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import type { SiteSettings } from "@/lib/settings-defaults";
import { jsonInit, useAdminFetch } from "./api";
import { Card, ImageField, ListEditor, NumberField, TextArea, TextField, Toggle, smallInputClass } from "./ui";

export type SettingsSection = "store" | "home" | "pages";

type Updater = <S extends keyof SiteSettings, K extends keyof SiteSettings[S]>(section: S, key: K, value: SiteSettings[S][K]) => void;

export function SettingsTab({ section }: { section: SettingsSection }) {
  const adminFetch = useAdminFetch();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    adminFetch<SiteSettings>("/api/settings").then((s) => s && setSettings(s));
  }, [adminFetch]);

  const set: Updater = (sectionKey, key, value) => {
    setSettings((s) => (s ? { ...s, [sectionKey]: { ...s[sectionKey], [key]: value } } : s));
    setDirty(true);
    setSaved(false);
  };

  const save = async () => {
    if (!settings) return;
    setSaving(true);
    const result = await adminFetch<SiteSettings>("/api/settings", jsonInit("PUT", settings));
    setSaving(false);
    if (result) {
      setSettings(result);
      setDirty(false);
      setSaved(true);
    }
  };

  if (!settings) return <p className="text-sm text-gray-400">Loading...</p>;

  return (
    <div className="space-y-5 pb-20">
      {section === "store" && <StoreSettings s={settings} set={set} />}
      {section === "home" && <HomeSettings s={settings} set={set} />}
      {section === "pages" && <PageSettings s={settings} set={set} />}

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-100 bg-white/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-end gap-3">
          {dirty && <span className="text-xs text-amber-600">You have unsaved changes</span>}
          {saved && !dirty && (
            <span className="flex items-center gap-1 text-xs text-green-600">
              <Check size={14} /> Saved — live on the website now
            </span>
          )}
          <button
            onClick={save}
            disabled={saving || !dirty}
            className="flex items-center gap-2 rounded-full bg-brand-purple px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {saving && <Loader2 size={16} className="animate-spin" />}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

type Props = { s: SiteSettings; set: Updater };

function StoreSettings({ s, set }: Props) {
  const store = s.store;
  const checkout = s.checkout;
  return (
    <>
      <Card title="Store details" description="Shown in the menu, footer and browser tab.">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Store name" value={store.name} onChange={(v) => set("store", "name", v)} />
          <TextField label="Tagline" value={store.tagline} onChange={(v) => set("store", "tagline", v)} />
        </div>
        <ImageField label="Logo" hint="square image works best" value={store.logo} onChange={(v) => set("store", "logo", v)} />
        <TextField
          label="Announcement bar"
          hint="the coloured strip at the very top; leave empty to hide it"
          value={store.announcement}
          onChange={(v) => set("store", "announcement", v)}
        />
      </Card>

      <Card title="Contact & social" description="Used on the Contact page, footer, WhatsApp buttons and order messages.">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="WhatsApp number"
            hint="with country code, digits only, e.g. 918491029071"
            value={store.whatsappNumber}
            onChange={(v) => set("store", "whatsappNumber", v.replace(/\D/g, ""))}
          />
          <TextField label="Email" type="email" value={store.email} onChange={(v) => set("store", "email", v)} />
          <TextField
            label="Instagram link"
            hint="starts with https://"
            value={store.instagramUrl}
            onChange={(v) => set("store", "instagramUrl", v)}
          />
          <TextField label="Instagram handle" hint="e.g. @bazaarpanun" value={store.instagramHandle} onChange={(v) => set("store", "instagramHandle", v)} />
        </div>
        <TextField label="Address" value={store.address} onChange={(v) => set("store", "address", v)} />
        <TextArea
          label="WhatsApp button message"
          hint="pre-filled text when a visitor taps the green WhatsApp button"
          rows={2}
          value={store.whatsappMessage}
          onChange={(v) => set("store", "whatsappMessage", v)}
        />
      </Card>

      <Card title="Shipping & payment" description="Applied at checkout. Prices are in rupees.">
        <div className="grid gap-4 sm:grid-cols-2">
          <NumberField label="Shipping fee (₹)" value={checkout.shippingFee} onChange={(v) => set("checkout", "shippingFee", v)} />
          <NumberField
            label="Free shipping above (₹)"
            hint="0 = always free"
            value={checkout.freeShippingThreshold}
            onChange={(v) => set("checkout", "freeShippingThreshold", v)}
          />
        </div>
        <Toggle label="Allow Cash on Delivery" checked={checkout.codEnabled} onChange={(v) => set("checkout", "codEnabled", v)} />
        <Toggle
          label="Allow ordering via WhatsApp"
          checked={checkout.whatsappOrderEnabled}
          onChange={(v) => set("checkout", "whatsappOrderEnabled", v)}
        />
      </Card>

      <Card title="Footer">
        <TextArea label="About text" value={store.footerAbout} onChange={(v) => set("store", "footerAbout", v)} />
        <TextField label="Bottom note" hint="next to the copyright line" value={store.footerNote} onChange={(v) => set("store", "footerNote", v)} />
      </Card>

      <Card title="Search engines (SEO)" description="How the site appears on Google and when the link is shared.">
        <TextField label="Site title" value={store.seoTitle} onChange={(v) => set("store", "seoTitle", v)} />
        <TextArea label="Site description" rows={2} value={store.seoDescription} onChange={(v) => set("store", "seoDescription", v)} />
      </Card>
    </>
  );
}

function HomeSettings({ s, set }: Props) {
  const h = s.home;
  return (
    <>
      <Card title="Hero banner" description="The big banner at the top of the homepage.">
        <ImageField label="Background image" hint="wide photo, at least 1600px across" value={h.heroImage} onChange={(v) => set("home", "heroImage", v)} />
        <TextField label="Small label above the title" value={h.heroBadge} onChange={(v) => set("home", "heroBadge", v)} />
        <TextField label="Title" value={h.heroTitle} onChange={(v) => set("home", "heroTitle", v)} />
        <TextArea label="Subtitle" rows={2} value={h.heroSubtitle} onChange={(v) => set("home", "heroSubtitle", v)} />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Main button text" hint="empty to hide" value={h.heroPrimaryLabel} onChange={(v) => set("home", "heroPrimaryLabel", v)} />
          <TextField label="Main button link" hint="e.g. /shop" value={h.heroPrimaryLink} onChange={(v) => set("home", "heroPrimaryLink", v)} />
          <TextField label="Second button text" hint="empty to hide" value={h.heroSecondaryLabel} onChange={(v) => set("home", "heroSecondaryLabel", v)} />
          <TextField
            label="Second button link"
            hint="e.g. /shop?category=bridal-wear"
            value={h.heroSecondaryLink}
            onChange={(v) => set("home", "heroSecondaryLink", v)}
          />
        </div>
      </Card>

      <Card title="Highlights strip" description="The row of three highlights under the banner.">
        <Toggle label="Show this section" checked={h.showBadges} onChange={(v) => set("home", "showBadges", v)} />
        <ListEditor
          label="Highlights"
          items={h.badges}
          onChange={(v) => set("home", "badges", v)}
          newItem={() => ({ title: "", text: "" })}
          addLabel="Add highlight"
          renderItem={(b, update) => (
            <>
              <input placeholder="Title" value={b.title} onChange={(e) => update({ ...b, title: e.target.value })} className={smallInputClass} />
              <input placeholder="Text" value={b.text} onChange={(e) => update({ ...b, text: e.target.value })} className={smallInputClass} />
            </>
          )}
        />
      </Card>

      <SectionCard
        title="Categories section"
        show={h.showCategories}
        onShow={(v) => set("home", "showCategories", v)}
        heading={h.categoriesTitle}
        onHeading={(v) => set("home", "categoriesTitle", v)}
        sub={h.categoriesSubtitle}
        onSub={(v) => set("home", "categoriesSubtitle", v)}
        note="Shows your categories. Manage them in the Categories tab."
      />
      <SectionCard
        title="Featured products section"
        show={h.showFeatured}
        onShow={(v) => set("home", "showFeatured", v)}
        heading={h.featuredTitle}
        onHeading={(v) => set("home", "featuredTitle", v)}
        sub={h.featuredSubtitle}
        onSub={(v) => set("home", "featuredSubtitle", v)}
        note="Shows up to 8 products marked “Featured” in the Products tab."
      />
      <SectionCard
        title="New arrivals section"
        show={h.showNewArrivals}
        onShow={(v) => set("home", "showNewArrivals", v)}
        heading={h.newArrivalsTitle}
        onHeading={(v) => set("home", "newArrivalsTitle", v)}
        sub={h.newArrivalsSubtitle}
        onSub={(v) => set("home", "newArrivalsSubtitle", v)}
        note="Shows up to 4 products marked “New arrival” in the Products tab."
      />

      <Card title="Customer reviews section">
        <Toggle label="Show this section" checked={h.showTestimonials} onChange={(v) => set("home", "showTestimonials", v)} />
        <TextField label="Heading" value={h.testimonialsTitle} onChange={(v) => set("home", "testimonialsTitle", v)} />
        <ListEditor
          label="Reviews"
          items={h.testimonials}
          onChange={(v) => set("home", "testimonials", v)}
          newItem={() => ({ name: "", city: "", text: "" })}
          addLabel="Add review"
          renderItem={(t, update) => (
            <>
              <div className="grid gap-2 sm:grid-cols-2">
                <input placeholder="Customer name" value={t.name} onChange={(e) => update({ ...t, name: e.target.value })} className={smallInputClass} />
                <input placeholder="City" value={t.city} onChange={(e) => update({ ...t, city: e.target.value })} className={smallInputClass} />
              </div>
              <textarea placeholder="Review" rows={2} value={t.text} onChange={(e) => update({ ...t, text: e.target.value })} className={smallInputClass} />
            </>
          )}
        />
      </Card>

      <Card title="Follow us banner" description="The coloured banner at the bottom with Instagram and WhatsApp buttons.">
        <Toggle label="Show this section" checked={h.showCta} onChange={(v) => set("home", "showCta", v)} />
        <TextField label="Heading" value={h.ctaTitle} onChange={(v) => set("home", "ctaTitle", v)} />
        <TextArea label="Text" rows={2} value={h.ctaText} onChange={(v) => set("home", "ctaText", v)} />
      </Card>
    </>
  );
}

function SectionCard(p: {
  title: string;
  show: boolean;
  onShow: (v: boolean) => void;
  heading: string;
  onHeading: (v: string) => void;
  sub: string;
  onSub: (v: string) => void;
  note: string;
}) {
  return (
    <Card title={p.title} description={p.note}>
      <Toggle label="Show this section" checked={p.show} onChange={p.onShow} />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Heading" value={p.heading} onChange={p.onHeading} />
        <TextField label="Subheading" value={p.sub} onChange={p.onSub} />
      </div>
    </Card>
  );
}

function PageSettings({ s, set }: Props) {
  const a = s.about;
  const c = s.contact;
  return (
    <>
      <Card title="About Us page">
        <ImageField label="Banner image" value={a.image} onChange={(v) => set("about", "image", v)} />
        <TextField label="Title" value={a.title} onChange={(v) => set("about", "title", v)} />
        <TextField label="Subtitle" value={a.subtitle} onChange={(v) => set("about", "subtitle", v)} />
        <ListEditor
          label="Story paragraphs"
          items={a.paragraphs}
          onChange={(v) => set("about", "paragraphs", v)}
          newItem={() => ""}
          addLabel="Add paragraph"
          renderItem={(text, update) => (
            <textarea rows={4} value={text} onChange={(e) => update(e.target.value)} className={smallInputClass} />
          )}
        />
        <ListEditor
          label="Highlight boxes"
          items={a.stats}
          onChange={(v) => set("about", "stats", v)}
          newItem={() => ""}
          addLabel="Add box"
          renderItem={(text, update) => (
            <input placeholder="e.g. 56K+ Followers" value={text} onChange={(e) => update(e.target.value)} className={smallInputClass} />
          )}
        />
        <TextField label="Promise heading" hint="empty to hide the box" value={a.promiseTitle} onChange={(v) => set("about", "promiseTitle", v)} />
        <TextArea label="Promise text" value={a.promiseText} onChange={(v) => set("about", "promiseText", v)} />
      </Card>

      <Card title="Contact page" description="Contact details (WhatsApp, email, address) are set in Store Settings.">
        <TextField label="Title" value={c.title} onChange={(v) => set("contact", "title", v)} />
        <TextField label="Subtitle" value={c.subtitle} onChange={(v) => set("contact", "subtitle", v)} />
      </Card>
    </>
  );
}
