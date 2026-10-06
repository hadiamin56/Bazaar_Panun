import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "bp_admin";
const SESSION_HOURS = 12;

function secret(): string {
  const value = process.env.ADMIN_SESSION_SECRET;
  if (!value || value.length < 32) {
    throw new Error("ADMIN_SESSION_SECRET must be set to a random string of at least 32 characters.");
  }
  return value;
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

// Explains a missing server setting, so the login page can say what to fix.
export function adminConfigProblem(): string | null {
  if (!process.env.ADMIN_PASSWORD?.trim()) return "ADMIN_PASSWORD is not set on the server.";
  const secret = process.env.ADMIN_SESSION_SECRET ?? "";
  if (secret.length < 32) {
    return `ADMIN_SESSION_SECRET must be at least 32 characters (it is ${secret ? secret.length : "not set"}).`;
  }
  return null;
}

export function checkAdminPassword(password: string): boolean {
  // Trimmed so a stray space pasted into the hosting dashboard doesn't lock you out.
  const expected = process.env.ADMIN_PASSWORD?.trim();
  if (!expected) return false;
  // Compare HMACs so the comparison takes the same time whatever the input length.
  return safeEqual(sign(`pw:${password.trim()}`), sign(`pw:${expected}`));
}

export function createSessionToken(): { token: string; maxAge: number } {
  const maxAge = SESSION_HOURS * 60 * 60;
  const expires = Date.now() + maxAge * 1000;
  return { token: `${expires}.${sign(`session:${expires}`)}`, maxAge };
}

function isValidToken(token: string | undefined): boolean {
  if (!token) return false;
  const [expires, signature] = token.split(".");
  if (!expires || !signature || Number(expires) < Date.now()) return false;
  return safeEqual(signature, sign(`session:${expires}`));
}

export async function isAdmin(): Promise<boolean> {
  if (adminConfigProblem()) return false;
  const store = await cookies();
  return isValidToken(store.get(ADMIN_COOKIE)?.value);
}
