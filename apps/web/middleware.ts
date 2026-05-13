import { NextResponse, type NextRequest } from "next/server";
import { verifySessionEdge, SESSION_COOKIE } from "@/lib/auth/session-edge";

/**
 * Gate the site behind the login. Public exceptions:
 *   - /login (the login page itself)
 *   - /api/auth/* (login submit, logout)
 *   - /api/cron/* (server-to-server, secured by CRON_SECRET)
 *   - /api/health (uptime monitoring)
 *   - /legal/* (CGU, privacy, responsible gambling — must stay public)
 *   - /opengraph-image, /favicon.ico, /robots.txt, /sitemap.xml
 *   - /_next/* (Next.js internals, handled by the matcher already)
 */
const PUBLIC_PREFIXES = [
  "/login",
  "/api/auth/",
  "/api/cron/",
  "/api/health",
  "/legal/",
  "/opengraph-image",
  "/favicon",
  "/robots.txt",
  "/sitemap.xml",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    // Mis-configuration: fail closed in production, fail open in dev so the
    // app remains usable while the user wires up the env.
    if (process.env.NODE_ENV === "production") {
      return new NextResponse("AUTH_SECRET not configured", { status: 503 });
    }
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionEdge(token, secret) : null;

  if (!session) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname + request.nextUrl.search);
    const res = NextResponse.redirect(url);
    if (token) res.cookies.delete(SESSION_COOKIE); // clear invalid/expired
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Run on everything except Next.js static assets, image optimizer, common static files
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|opengraph-image|.*\\.(?:png|jpg|jpeg|svg|webp|ico|gif)).*)",
  ],
};
