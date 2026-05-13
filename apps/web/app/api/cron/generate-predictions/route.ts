import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { isAuthorizedCron } from "@/lib/api/auth-cron";
import { generateDailyPredictions } from "@/lib/ai/prediction-engine";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";
// Vercel Hobby plan caps at 60s per invocation. Stay under by:
// - capping maxFixtures to ~5 per run
// - keeping perFixtureDelayMs low (or 0) on the free tier
// On Pro plan you can raise this to 300 + use longer delays for rate-limit safety.
export const maxDuration = 60;

const log = logger.child({ component: "cron/generate-predictions" });

const optionsSchema = z.object({
  maxFixtures: z.coerce.number().int().positive().max(50).optional(),
  withinHours: z.coerce.number().int().positive().max(168).optional(),
  /** YYYY-MM-DD to back-fill from a specific date (useful with API-Football's
   *  free tier which only exposes 2022–2024 seasons). */
  forDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  /** Set "true" to include past + finished fixtures (back-test mode). */
  allowPast: z.coerce.boolean().optional(),
  /** When back-filling, override `match_date` so predictions land in the next
   *  N hours and show up on the live feed. */
  simulateFutureInHours: z.coerce.number().int().positive().max(720).optional(),
  /** Milliseconds to wait between fixtures (default 0). Use ~7000 (7s) when
   *  on API-Football Free to respect 10 req/min. */
  perFixtureDelayMs: z.coerce.number().int().min(0).max(60_000).optional(),
});

export async function POST(request: NextRequest) {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const parsed = optionsSchema.safeParse(Object.fromEntries(new URL(request.url).searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const result = await generateDailyPredictions(parsed.data);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    log.error("cron failed", { err });
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "unknown error" },
      { status: 500 },
    );
  }
}

// Vercel Cron also accepts GET; mirror to the same handler for compatibility.
export const GET = POST;
