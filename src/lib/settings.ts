import "server-only";
import { cache } from "react";
import { prisma } from "./db";
import { sanitizeSettings } from "./settings-sanitize";
import type { SiteSettings } from "./settings-defaults";

const KEY = "site";

// Read once per request, however many components ask.
export const getSettings = cache(async (): Promise<SiteSettings> => {
  const row = await prisma.setting.findUnique({ where: { key: KEY } });
  return sanitizeSettings(row?.value ?? {});
});

export async function saveSettings(input: unknown): Promise<SiteSettings> {
  const value = sanitizeSettings(input);
  await prisma.setting.upsert({ where: { key: KEY }, update: { value }, create: { key: KEY, value } });
  return value;
}
