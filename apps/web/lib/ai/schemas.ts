import { z } from "zod";

export const PREDICTION_TYPES = [
  "match_winner",
  "over_under",
  "both_score",
  "double_chance",
  "asian_handicap",
  "exact_score",
] as const;

const altBetSchema = z.object({
  predictionType: z.enum(PREDICTION_TYPES),
  predictedOutcome: z.string().min(1).max(32),
  confidence: z.number().min(0).max(100),
  odds: z.number().positive().max(1000),
});

/**
 * Validates the Claude output against our contract. Any non-conformant
 * response triggers a retry with a stricter prompt.
 */
export const aiPredictionDraftSchema = z.object({
  predictionType: z.enum(PREDICTION_TYPES),
  predictedOutcome: z.string().min(1).max(32),
  confidenceScore: z.number().min(0).max(100),
  reasoning: z.string().min(20).max(800),
  keyFactors: z.array(z.string().min(1).max(120)).min(2).max(6),
  riskLevel: z.enum(["low", "medium", "high"]),
  suggestedOdds: z.number().positive().max(1000).nullable(),
  alternativeBets: z.array(altBetSchema).max(3).optional(),
});

export type AiPredictionDraftValidated = z.infer<typeof aiPredictionDraftSchema>;

/** Extract JSON from a model response that *should* be pure JSON but may
 *  occasionally include surrounding text. Returns null if nothing parses. */
export function extractJson(raw: string): unknown | null {
  const trimmed = raw.trim();
  // Fast path: already JSON
  try {
    return JSON.parse(trimmed);
  } catch {
    // fallthrough
  }
  // Strip markdown code fences if present
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (fenceMatch) {
    try {
      return JSON.parse(fenceMatch[1]);
    } catch {
      // fallthrough
    }
  }
  // Last resort: first balanced { ... }
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) {
    try {
      return JSON.parse(trimmed.slice(start, end + 1));
    } catch {
      return null;
    }
  }
  return null;
}
