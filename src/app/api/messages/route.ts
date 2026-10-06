import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { clientIp, rateLimited } from "@/lib/rate-limit";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await prisma.message.findMany({ orderBy: { createdAt: "desc" }, take: 500 }));
}

// Contact form.
export async function POST(req: NextRequest) {
  const b = ((await req.json().catch(() => null)) ?? {}) as Record<string, unknown>;
  // Hidden "website" field: real visitors leave it empty, spam bots fill it in.
  if (b.website) return NextResponse.json({ ok: true }, { status: 201 });
  if (rateLimited(`msg:${clientIp(req.headers)}`, 5, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many messages. Please try again later or contact us on WhatsApp." }, { status: 429 });
  }

  const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  const name = str(b.name, 150);
  const email = str(b.email, 200);
  const phone = str(b.phone, 30);
  const message = str(b.message, 5000);
  if (!name || !message) return NextResponse.json({ error: "Please fill in your name and message." }, { status: 400 });
  if (!/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });

  await prisma.message.create({ data: { name, email, phone: phone || null, message } });
  return NextResponse.json({ ok: true }, { status: 201 });
}
