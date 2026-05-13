import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/logout — clears the session cookie and redirects to /login.
 * Use as `<form action="/api/auth/logout" method="post">` from anywhere.
 */
export async function POST(request: NextRequest) {
  const res = NextResponse.redirect(new URL("/login", request.url), { status: 303 });
  res.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });
  return res;
}

// Allow GET for convenience when testing
export const GET = POST;
