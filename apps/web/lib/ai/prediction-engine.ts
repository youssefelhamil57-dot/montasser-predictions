import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { logger } from "@/lib/logger";
import { getSupabaseAdmin } from "@/lib/db/supabase-admin";
import { getEnrichedMatchData, getTodayFixtures } from "@/lib/sports-api/aggregator";
import type { EnrichedMatchData, AiPredictionDraft } from "@/lib/sports-api/types";
import { PREDICTION_SYSTEM_PROMPT, buildUserPrompt } from "./prompts";
import { aiPredictionDraftSchema, extractJson } from "./schemas";

const log = logger.child({ component: "prediction-engine" });

/**
 * Active model. Update here when bumping versions; the model name is recorded
 * on each row in predictions.model_version so older predictions stay attributable.
 */
const MODEL = "claude-sonnet-4-5";
const MODEL_VERSION = "claude-sonnet-4-5:v1";

const MAX_OUTPUT_TOKENS = 800;

let cachedClient: Anthropic | null = null;
function getClient(): Anthropic {
  if (!cachedClient) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY missing");
    cachedClient = new Anthropic({ apiKey, maxRetries: 2 });
  }
  return cachedClient;
}

/**
 * Generate one prediction for a match.
 * Strategy: single Claude call with prompt-cached system prompt. If the
 * response fails Zod validation, retry once with a stricter user prompt.
 */
export async function generatePrediction(match: EnrichedMatchData): Promise<AiPredictionDraft> {
  const client = getClient();

  let lastError: string | null = null;

  for (let attempt = 1; attempt <= 2; attempt++) {
    const userPrompt = attempt === 1
      ? buildUserPrompt(match)
      : `${buildUserPrompt(match)}\n\nTENTATIVE PRÉCÉDENTE INVALIDE : ${lastError}. Renvoie un JSON strictement conforme au schéma, rien d'autre.`;

    // TODO: switch to anthropic.beta.promptCaching.messages.create() OR upgrade
    // @anthropic-ai/sdk to >=0.30 to enable prompt caching on the system prompt
    // (the system block is stable across a batch run — perfect cache target).
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_OUTPUT_TOKENS,
      system: PREDICTION_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });

    const textBlock = response.content.find((b): b is Anthropic.TextBlock => b.type === "text");
    if (!textBlock) {
      lastError = "no text content in response";
      log.warn("empty model response", { matchId: match.fixture.id, attempt });
      continue;
    }

    const json = extractJson(textBlock.text);
    if (!json) {
      lastError = "could not parse JSON";
      log.warn("json parse failed", { matchId: match.fixture.id, attempt, raw: textBlock.text.slice(0, 300) });
      continue;
    }

    const parsed = aiPredictionDraftSchema.safeParse(json);
    if (!parsed.success) {
      lastError = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
      log.warn("zod validation failed", { matchId: match.fixture.id, attempt, issues: parsed.error.flatten() });
      continue;
    }

    log.info("prediction generated", {
      matchId: match.fixture.id,
      type: parsed.data.predictionType,
      outcome: parsed.data.predictedOutcome,
      confidence: parsed.data.confidenceScore,
      attempt,
      usage: response.usage,
    });

    return { ...parsed.data, modelVersion: MODEL_VERSION };
  }

  throw new Error(`prediction generation failed after retries: ${lastError ?? "unknown error"}`);
}

// ---------------------------------------------------------------------------
// Batch processing — called by the cron at /api/cron/generate-predictions
// ---------------------------------------------------------------------------

export interface BatchOptions {
  /** Skip fixtures already covered by a prediction for the same model version. */
  skipExisting?: boolean;
  /** Hard cap to bound cost. Default: 20 per run. */
  maxFixtures?: number;
  /** Only fixtures starting within this many hours from now. */
  withinHours?: number;
  /** Fetch fixtures for this date (YYYY-MM-DD). Default: today. */
  forDate?: string;
  /** Allow past matches (skip the "must be in the future" filter). */
  allowPast?: boolean;
  /** If set, insert predictions with `match_date = now() + offset hours`,
   *  spread across N hours starting in `simulateFutureInHours`. Useful when
   *  back-testing with historical fixtures so they appear on the live feed. */
  simulateFutureInHours?: number;
  /** Seconds to wait between fixtures (helps respect upstream rate limits). */
  perFixtureDelayMs?: number;
}

export async function generateDailyPredictions(opts: BatchOptions = {}): Promise<{
  generated: number;
  skipped: number;
  failed: number;
}> {
  const skipExisting = opts.skipExisting ?? true;
  const maxFixtures = opts.maxFixtures ?? 20;
  const withinHours = opts.withinHours ?? 48;
  const allowPast = opts.allowPast ?? false;
  const delayMs = opts.perFixtureDelayMs ?? 0;

  const fetchDate = opts.forDate ? new Date(`${opts.forDate}T12:00:00Z`) : new Date();
  const fixtures = await getTodayFixtures({ date: fetchDate });

  const upcoming = allowPast
    ? fixtures.filter((f) => f.status === "scheduled" || f.status === "finished")
    : fixtures.filter(
        (f) =>
          f.status === "scheduled" &&
          f.matchDate.getTime() > Date.now() &&
          f.matchDate.getTime() < Date.now() + withinHours * 3600_000,
      );

  log.info("batch start", { totalUpcoming: upcoming.length, maxFixtures, withinHours });

  const supabase = getSupabaseAdmin();
  let existing: Set<string> = new Set();
  if (skipExisting && upcoming.length) {
    const ids = upcoming.map((f) => f.externalId);
    const { data } = await supabase
      .from("predictions")
      .select("match_id")
      .in("match_id", ids)
      .eq("model_version", MODEL_VERSION)
      .returns<Array<{ match_id: string }>>();
    existing = new Set((data ?? []).map((r) => r.match_id));
  }

  const queue = upcoming.filter((f) => !existing.has(f.externalId)).slice(0, maxFixtures);
  let generated = 0;
  let failed = 0;

  for (let i = 0; i < queue.length; i++) {
    const fixture = queue[i];
    if (i > 0 && delayMs > 0) {
      await new Promise((res) => setTimeout(res, delayMs));
    }
    try {
      const enriched = await getEnrichedMatchData(fixture.id);
      if (!enriched) {
        log.warn("enrichment failed, skipping", { fixtureId: fixture.id });
        failed++;
        continue;
      }
      const draft = await generatePrediction(enriched);

      // When simulating future dates, distribute fixtures across the window
      // so they show up on the live feed instead of being filtered as past.
      const effectiveDate = opts.simulateFutureInHours
        ? new Date(Date.now() + (1 + i * (opts.simulateFutureInHours / queue.length)) * 3600_000)
        : fixture.matchDate;

      const predictionInsert = {
        sport: fixture.sport,
        league: fixture.league,
        match_id: opts.simulateFutureInHours ? `sim-${fixture.externalId}` : fixture.externalId,
        home_team: fixture.homeTeam.name,
        away_team: fixture.awayTeam.name,
        match_date: effectiveDate.toISOString(),
        prediction_type: draft.predictionType,
        predicted_outcome: draft.predictedOutcome,
        confidence_score: draft.confidenceScore,
        ai_reasoning: draft.reasoning,
        key_factors: draft.keyFactors,
        odds_suggested: draft.suggestedOdds ?? null,
        risk_level: draft.riskLevel,
        is_premium: draft.confidenceScore >= 70,
        is_featured: draft.confidenceScore >= 80,
        model_version: MODEL_VERSION,
        data_sources: {
          provider: fixture.provider,
          fixtureId: fixture.id,
          generatedAt: new Date().toISOString(),
        },
      };
      const { error } = await supabase.from("predictions").insert(predictionInsert as never);

      if (error) {
        log.error("insert prediction failed", { fixtureId: fixture.id, error });
        failed++;
      } else {
        generated++;
      }
    } catch (err) {
      log.error("generation exception", { fixtureId: fixture.id, err });
      failed++;
    }
  }

  const skipped = upcoming.length - queue.length;
  log.info("batch done", { generated, skipped, failed });
  return { generated, skipped, failed };
}

// ---------------------------------------------------------------------------
// Self-learning — refresh accuracy from finished matches
// ---------------------------------------------------------------------------

/**
 * For each prediction whose match has finished and whose actual_outcome is
 * still null, fetch the result and stamp is_correct + actual_outcome. This
 * relies on the cron job feeding actual outcomes via a separate path (TODO
 * Phase 2.5: wire api-football fixtures-by-id for results, or accept manual
 * input via admin).
 *
 * For now this is a placeholder that documents the contract; the resolution
 * loop will land alongside the results-ingest cron.
 */
export async function updateModelAccuracy(): Promise<{ refreshed: number }> {
  const supabase = getSupabaseAdmin();

  const { data: pending } = await supabase
    .from("predictions")
    .select("id, match_id, predicted_outcome, model_version")
    .lt("match_date", new Date().toISOString())
    .is("is_correct", null)
    .limit(100);

  log.info("accuracy refresh: pending predictions", { count: pending?.length ?? 0 });

  // TODO: resolve actual_outcome from the sports provider for each match_id,
  // then update predictions + recompute profile accuracy_rate. Phase 2.5.

  return { refreshed: 0 };
}
