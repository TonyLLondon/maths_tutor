import { verifySessionToken } from "@/lib/session";
import { LEGACY_TENANT_SLUGS } from "@/lib/tenants";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PREFIXES = ["/login", "/api/auth/login"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.match(/\.(svg|png|jpg)$/)
  ) {
    return NextResponse.next();
  }

  const legacyMatch = pathname.match(/^\/t\/([^/]+)(\/.*)?$/);
  if (legacyMatch) {
    const slug = legacyMatch[1];
    if ((LEGACY_TENANT_SLUGS as readonly string[]).includes(slug)) {
      const rest = legacyMatch[2] ?? "";
      return NextResponse.redirect(
        new URL(`/t/lewis${rest}`, request.url),
        308,
      );
    }
  }

  if (PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const token = request.cookies.get("mt_session")?.value;
  if (!token || !(await verifySessionToken(token))) {
    const login = new URL("/login", request.url);
    if (pathname !== "/") {
      login.searchParams.set("next", pathname);
    }
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
