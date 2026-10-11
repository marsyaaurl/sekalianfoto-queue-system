import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Redirect unauthenticated visitors away from admin pages.
 *
 * This is only an early navigation check. Every future admin Route Handler
 * must still call getAdminSession() before performing a mutation.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    const sessionToken = request.cookies.get("queue_admin_session")?.value;
    if (!sessionToken) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
