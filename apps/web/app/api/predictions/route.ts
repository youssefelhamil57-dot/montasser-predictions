import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/db/supabase-admin";
import type { PredictionRow } from "@/lib/db/types";
import type { PublicPrediction } from "@shared/index";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  sport: z.string().optional(),
  league: z.string().optional(),
  minConfidence: z.coerce.number().min(0).max(100).optional(),
  featured: z.coerce.boolean().optional(),
  /** YYYY-MM-DD; filters predictions whose match_date is on that calendar day (UTC). */
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
});

/**
 * GET /api/predictions — public feed.
 * Auth removed. Everyone sees the full prediction details.
 */
export async function GET(request: NextRequest) {
  const parsed = querySchema.safeParse(Object.fromEntries(new URL(request.url).searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const q = parsed.data;
  const offset = (q.page - 1) * q.limit;

  const supabase = getSupabaseAdmin();
  let query = supabase
    .from("predictions")
    .select("*", { count: "exact" })
    .gte("match_date", new Date().toISOString());

  if (q.sport) query = query.eq("sport", q.sport);
  if (q.league) query = query.eq("league", q.league);
  if (q.featured) query = query.eq("is_featured", true);
  if (q.minConfidence !== undefined) query = query.gte("confidence_score", q.minConfidence);
  if (q.date) {
    const start = `${q.date}T00:00:00Z`;
    const end = `${q.date}T23:59:59.999Z`;
    query = query.gte("match_date", start).lte("match_date", end);
  }

  const { data, error, count } = await query
    .order("match_date", { ascending: true })
    .range(offset, offset + q.limit - 1)
    .returns<PredictionRow[]>();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const items: PublicPrediction[] = (data ?? []).map((row) => ({
    id: row.id,
    sport: row.sport,
    league: row.league,
    matchId: row.match_id,
    homeTeam: row.home_team,
    awayTeam: row.away_team,
    matchDate: row.match_date,
    predictionType: row.prediction_type,
    predictedOutcome: row.predicted_outcome,
    confidenceScore: row.confidence_score,
    aiReasoning: row.ai_reasoning,
    keyFactors: row.key_factors,
    oddsSuggested: row.odds_suggested,
    riskLevel: row.risk_level,
    isPremium: row.is_premium,
    isFeatured: row.is_featured,
    actualOutcome: row.actual_outcome,
    isCorrect: row.is_correct,
  }));

  return NextResponse.json(
    { items, total: count ?? items.length, page: q.page, limit: q.limit },
    { headers: { "cache-control": "public, s-maxage=60, stale-while-revalidate=300" } },
  );
}
