import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, computeAdminToken } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD not configured on the server" },
      { status: 500 }
    );
  }

  let password = "";
  try {
    const body = await req.json();
    password = String(body.password ?? "");
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  // Constant-time compare so timing can't leak password length/contents
  if (password.length !== expected.length) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }
  let mismatch = 0;
  for (let i = 0; i < password.length; i++) {
    mismatch |= password.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  if (mismatch !== 0) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  const token = await computeAdminToken(expected);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return res;
}
