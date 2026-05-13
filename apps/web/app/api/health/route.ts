import { NextResponse } from "next/server";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Health probe used by uptime monitors (e.g. UptimeRobot, BetterStack).
 *
 * - Returns 200 with build/runtime metadata when the server can boot.
 * - Pings Supabase via a lightweight HEAD on the REST endpoint so we surface
 *   DB connectivity issues, not just "the Next process is alive".
 * - No auth required — does NOT include secrets or per-tenant info.
 */
export async function GET() {
  const startedAt = Date.now();

  let supabaseOk = false;
  let supabaseLatencyMs: number | null = null;
  try {
    const t0 = Date.now();
    const res = await fetch(`${env.public.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/health`, {
      method: "GET",
      cache: "no-store",
      signal: AbortSignal.timeout(2000),
    });
    supabaseLatencyMs = Date.now() - t0;
    supabaseOk = res.ok;
  } catch {
    supabaseOk = false;
  }

  const body = {
    status: supabaseOk ? "ok" : "degraded",
    runtime: "nodejs",
    node: process.version,
    env: env.server.NODE_ENV,
    uptimeSeconds: Math.round(process.uptime()),
    supabase: {
      reachable: supabaseOk,
      latencyMs: supabaseLatencyMs,
    },
    elapsedMs: Date.now() - startedAt,
  };

  return NextResponse.json(body, {
    status: supabaseOk ? 200 : 503,
    headers: { "cache-control": "no-store" },
  });
}
