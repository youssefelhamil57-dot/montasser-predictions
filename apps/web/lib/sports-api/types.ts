/**
 * Internal normalized sports data shapes — provider-agnostic. The AI engine
 * consumes these; provider clients (api-football, mocks, etc.) project their
 * raw responses into this shape.
 */

import type { RiskLevel, Sport, PredictionType } from "@shared/index";

export interface Fixture {
  id: string;                  // stable across providers ("api-football:12345" or "mock:cl-001")
  provider: string;            // "api-football" | "mock" | "openligadb"
  externalId: string;          // raw upstream id

  sport: Sport | string;
  league: string;
  country: string | null;
  season: number | null;

  homeTeam: TeamRef;
  awayTeam: TeamRef;

  matchDate: Date;             // ISO date
  venue: string | null;
  status: FixtureStatus;
}

export type FixtureStatus =
  | "scheduled"
  | "live"
  | "finished"
  | "postponed"
  | "cancelled";

export interface TeamRef {
  id: string;
  name: string;
  logo: string | null;
}

export interface TeamStats {
  teamId: string;
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  cleanSheets: number;
  failedToScore: number;

  /** Most-recent-first array of W/D/L letters, last 10. */
  recentForm: Array<"W" | "D" | "L">;
  /** Same metrics restricted to home (or away) matches. */
  homeMetrics: { wins: number; draws: number; losses: number } | null;
  awayMetrics: { wins: number; draws: number; losses: number } | null;
}

export interface HeadToHeadEntry {
  matchDate: Date;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  competition: string | null;
}

export interface OddsSnapshot {
  /** Map { "1": 1.85, "X": 3.50, "2": 4.20, "OVER_2.5": 1.80, ... } */
  bookmaker: string;
  values: Record<string, number>;
  capturedAt: Date;
}

export interface InjuryReport {
  playerName: string;
  position: string | null;
  reason: string | null;
  expectedReturn: string | null;
}

/**
 * The full bundle sent to the AI engine for a single match.
 * Build via SportsDataAggregator.getEnrichedMatchData().
 */
export interface EnrichedMatchData {
  fixture: Fixture;
  homeStats: TeamStats | null;
  awayStats: TeamStats | null;
  headToHead: HeadToHeadEntry[];
  odds: OddsSnapshot | null;
  injuries: { home: InjuryReport[]; away: InjuryReport[] };
  weather?: { description: string; tempC: number; windKph: number } | null;
}

/** What the AI engine outputs after analysing EnrichedMatchData. */
export interface AiPredictionDraft {
  predictionType: PredictionType;
  predictedOutcome: string;
  confidenceScore: number;          // 0-100
  reasoning: string;                 // FR
  keyFactors: string[];              // 3-5 items
  riskLevel: RiskLevel;
  suggestedOdds: number | null;
  modelVersion: string;
  alternativeBets?: Array<{
    predictionType: PredictionType;
    predictedOutcome: string;
    confidence: number;
    odds: number;
  }>;
}
