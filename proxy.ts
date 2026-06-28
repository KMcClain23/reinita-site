import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, computeAdminToken } from "@/lib/admin-auth";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow login routes through unauthenticated
  if (pathname === "/admin/login" || pathname === "/api/admin/login") {
    return NextResponse.next();
  }

  const cookie = req.cookies.get(ADMIN_COOKIE);
  const password = process.env.ADMIN_PASSWORD;

  if (!password || !cookie) {
    return reject(req, pathname);
  }

  const expected = await computeAdminToken(password);
  if (cookie.value !== expected) {
    return reject(req, pathname);
  }

  return NextResponse.next();
}

function reject(req: NextRequest, pathname: string) {
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const loginUrl = new URL("/admin/login", req.url);
  if (pathname !== "/admin") {
    loginUrl.searchParams.set("from", pathname);
  }
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
