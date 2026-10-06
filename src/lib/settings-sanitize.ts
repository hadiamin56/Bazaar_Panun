import { defaultSettings, type SiteSettings } from "./settings-defaults";

const MAX_TEXT = 5000;
const MAX_ITEMS = 30;

// Image fields may only point at files on this site (uploads or /public files).
const isImageKey = (key: string) => key === "logo" || key === "image" || key.endsWith("Image");
// Link fields may be a page on this site or an https:// address.
const isLinkKey = (key: string) => key.endsWith("Link") || key.endsWith("Url");

function clean(template: unknown, input: unknown, key: string): unknown {
  if (typeof template === "string") {
    if (typeof input !== "string") return template;
    const s = input.slice(0, MAX_TEXT);
    if (isImageKey(key)) return s.startsWith("/") && !s.startsWith("//") ? s : template;
    if (isLinkKey(key)) return (s.startsWith("/") && !s.startsWith("//")) || s.startsWith("https://") ? s : template;
    return s;
  }
  if (typeof template === "number") {
    return typeof input === "number" && Number.isFinite(input) && input >= 0 ? Math.round(input) : template;
  }
  if (typeof template === "boolean") return typeof input === "boolean" ? input : template;
  if (Array.isArray(template)) {
    if (!Array.isArray(input)) return template;
    const itemTemplate = template[0];
    return input.slice(0, MAX_ITEMS).map((item) => clean(itemTemplate, item, key));
  }
  if (template && typeof template === "object") {
    const source = input && typeof input === "object" && !Array.isArray(input) ? (input as Record<string, unknown>) : {};
    return Object.fromEntries(
      Object.entries(template).map(([k, v]) => [k, clean(v, source[k], k)])
    );
  }
  return template;
}

// Keeps only known fields of the right type; anything missing or invalid falls back to the default.
export function sanitizeSettings(input: unknown): SiteSettings {
  return clean(defaultSettings, input, "") as SiteSettings;
}
