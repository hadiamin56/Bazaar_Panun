import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, adminConfigProblem, checkAdminPassword, createSessionToken, isAdmin } from "@/lib/auth";

// Is the current visitor logged in as admin?
export async function GET() {
  return NextResponse.json({ authenticated: await isAdmin() });
}

// Log in.
export async function POST(req: NextRequest) {
  const problem = adminConfigProblem();
  if (problem) return NextResponse.json({ error: `Admin login is not set up: ${problem}` }, { status: 500 });
  const body = await req.json().catch(() => null);
  const password = typeof body?.password === "string" ? body.password : "";
  if (!checkAdminPassword(password)) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }
  const { token, maxAge } = createSessionToken();
  const res = NextResponse.json({ authenticated: true });
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  });
  return res;
}

// Log out.
export async function DELETE() {
  const res = NextResponse.json({ authenticated: false });
  res.cookies.delete(ADMIN_COOKIE);
  return res;
}
