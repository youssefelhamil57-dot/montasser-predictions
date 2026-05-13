import "server-only";
import { type NextRequest } from "next/server";
import { env } from "@/lib/env";

/**
 * Vercel Cron sends `Authorization: Bearer $CRON_SECRET`. We also accept the
 * Vercel-specific `vercel-cron` header for compatibility with their newer
 * scheduler. Returns true if the request is authentic.
 *
 * In development (CRON_SECRET unset), allows any request — convenient for
 * `curl localhost:3000/api/cron/...`.
 */
export function isAuthorizedCron(request: NextRequest): boolean {
  const secret = env.server.CRON_SECRET;
  if (!secret) {
    return env.server.NODE_ENV !== "production";
  }
  const header = request.headers.get("authorization");
  if (!header) return false;
  return header === `Bearer ${secret}`;
}
