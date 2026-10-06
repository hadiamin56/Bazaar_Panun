import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

const MAX_BYTES = 5 * 1024 * 1024;

// Identify the format from the file's first bytes rather than trusting the browser.
function detectImageType(buf: Buffer): string | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WEBP") return "image/webp";
  if (buf.subarray(0, 6).toString("ascii") === "GIF87a" || buf.subarray(0, 6).toString("ascii") === "GIF89a") return "image/gif";
  return null;
}

// Upload an image (admin only). Returns { url } to store on a product, category or setting.
export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "Image is too large (max 5 MB)" }, { status: 413 });

  const data = Buffer.from(await file.arrayBuffer());
  const mimeType = detectImageType(data);
  if (!mimeType) return NextResponse.json({ error: "Only JPG, PNG, WebP or GIF images are allowed" }, { status: 400 });

  const id = randomBytes(12).toString("hex");
  await prisma.image.create({ data: { id, mimeType, data, size: data.length } });
  return NextResponse.json({ id, url: `/api/images/${id}` }, { status: 201 });
}
