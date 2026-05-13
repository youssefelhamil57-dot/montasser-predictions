/**
 * Cross-app domain types — shared between apps/web and (future) apps/*.
 * Keep this file framework-agnostic (no React, no Next.js, no Supabase imports).
 *
 * Apps consume these via the `@shared/*` path alias declared in their tsconfig.
 * No npm package is published; this folder is a typescript-only source.
 */

export type Plan = "free" | "pro" | "white_label";
export type Language = "fr" | "en" | "ar";
export type RiskLevel = "low" | "medium" | "high";

export type Sport = "football" | "tennis" | "basketball" | "esport" | "hockey";

export type PredictionType =
  | "match_winner"
  | "double_chance"
  | "over_under"
  | "both_score"
  | "asian_handicap"
  | "exact_score";

export type PredictionOutcome =
  | "HOME"
  | "AWAY"
  | "DRAW"
  | "OVER"
  | "UNDER"
  | "YES"
  | "NO";

/** Shape produced by the AI prediction engine. */
export interface PredictionResult {
  outcome: PredictionOutcome | string;
  confidence: number;          // 0–100
  reasoning: string;           // FR, 2-3 sentences
  keyFactors: string[];        // 3-5 bullets
  riskLevel: RiskLevel;
  suggestedOdds: number;
  alternativeBets?: AlternativeBet[];
}

export interface AlternativeBet {
  type: PredictionType;
  outcome: string;
  confidence: number;
  odds: number;
}

/** Public-shape of a prediction sent to clients. confidence_score is nullable
 *  to support free-tier masking (server sets it to null for non-pro users). */
export interface PublicPrediction {
  id: string;
  sport: Sport | string;
  league: string;
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  matchDate: string;
  predictionType: PredictionType | string;
  predictedOutcome: string;
  confidenceScore: number | null;
  aiReasoning: string | null;
  keyFactors: string[] | null;
  oddsSuggested: number | null;
  riskLevel: RiskLevel | null;
  isPremium: boolean;
  isFeatured: boolean;
  actualOutcome: string | null;
  isCorrect: boolean | null;
}
