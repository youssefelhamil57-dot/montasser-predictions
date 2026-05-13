import type { EnrichedMatchData, Fixture, TeamStats, HeadToHeadEntry } from "./types";

/**
 * Deterministic mock data used when API_FOOTBALL_KEY is not set.
 * Lets the AI engine + downstream cron jobs run end-to-end during local dev.
 *
 * Replace with a real provider in production by setting API_FOOTBALL_KEY.
 */

const today = () => new Date();
const inHours = (h: number) => new Date(Date.now() + h * 3600_000);

const TEAMS = {
  real:      { id: "mock:real",      name: "Real Madrid",       logo: null },
  city:      { id: "mock:city",      name: "Manchester City",   logo: null },
  barca:     { id: "mock:barca",     name: "FC Barcelona",      logo: null },
  atletico:  { id: "mock:atletico",  name: "Atlético Madrid",   logo: null },
  arsenal:   { id: "mock:arsenal",   name: "Arsenal",           logo: null },
  chelsea:   { id: "mock:chelsea",   name: "Chelsea",           logo: null },
} as const;

export const MOCK_FIXTURES: Fixture[] = [
  {
    id: "mock:cl-001",
    provider: "mock",
    externalId: "cl-001",
    sport: "football",
    league: "Champions League",
    country: "Europe",
    season: 2024,
    homeTeam: TEAMS.real,
    awayTeam: TEAMS.city,
    matchDate: inHours(24),
    venue: "Santiago Bernabéu",
    status: "scheduled",
  },
  {
    id: "mock:pl-001",
    provider: "mock",
    externalId: "pl-001",
    sport: "football",
    league: "Premier League",
    country: "England",
    season: 2024,
    homeTeam: TEAMS.arsenal,
    awayTeam: TEAMS.chelsea,
    matchDate: inHours(48),
    venue: "Emirates Stadium",
    status: "scheduled",
  },
  {
    id: "mock:laliga-001",
    provider: "mock",
    externalId: "laliga-001",
    sport: "football",
    league: "La Liga",
    country: "Spain",
    season: 2024,
    homeTeam: TEAMS.barca,
    awayTeam: TEAMS.atletico,
    matchDate: inHours(27),
    venue: "Camp Nou",
    status: "scheduled",
  },
];

function statsFor(teamId: string, wins: number, draws: number, losses: number, gf: number, ga: number, form: Array<"W" | "D" | "L">): TeamStats {
  return {
    teamId,
    matchesPlayed: wins + draws + losses,
    wins,
    draws,
    losses,
    goalsFor: gf,
    goalsAgainst: ga,
    cleanSheets: Math.floor(wins * 0.4),
    failedToScore: Math.floor(losses * 0.6),
    recentForm: form,
    homeMetrics: { wins: Math.ceil(wins / 2), draws: Math.floor(draws / 2), losses: Math.floor(losses / 2) },
    awayMetrics: { wins: Math.floor(wins / 2), draws: Math.ceil(draws / 2), losses: Math.ceil(losses / 2) },
  };
}

const STATS: Record<string, TeamStats> = {
  "mock:real":     statsFor("mock:real",     14, 3, 2,  42, 18, ["W","W","W","D","W"]),
  "mock:city":     statsFor("mock:city",     12, 4, 3,  38, 20, ["L","W","D","W","W"]),
  "mock:barca":    statsFor("mock:barca",    13, 2, 4,  44, 25, ["W","L","W","W","D"]),
  "mock:atletico": statsFor("mock:atletico", 10, 5, 4,  28, 17, ["D","W","W","L","W"]),
  "mock:arsenal":  statsFor("mock:arsenal",  13, 3, 3,  35, 16, ["W","W","W","W","D"]),
  "mock:chelsea":  statsFor("mock:chelsea",   9, 5, 5,  29, 24, ["D","L","W","D","W"]),
};

const H2H_REAL_CITY: HeadToHeadEntry[] = [
  { matchDate: new Date(Date.now() - 30 * 86400_000), homeTeam: "Real Madrid",     awayTeam: "Manchester City", homeScore: 3, awayScore: 3, competition: "Champions League" },
  { matchDate: new Date(Date.now() - 90 * 86400_000), homeTeam: "Manchester City", awayTeam: "Real Madrid",     homeScore: 4, awayScore: 0, competition: "Champions League" },
  { matchDate: new Date(Date.now() - 365 * 86400_000), homeTeam: "Real Madrid",    awayTeam: "Manchester City", homeScore: 3, awayScore: 1, competition: "Champions League" },
];

const ENRICHED: Record<string, EnrichedMatchData> = Object.fromEntries(
  MOCK_FIXTURES.map((fixture) => [
    fixture.id,
    {
      fixture,
      homeStats: STATS[fixture.homeTeam.id] ?? null,
      awayStats: STATS[fixture.awayTeam.id] ?? null,
      headToHead: fixture.id === "mock:cl-001" ? H2H_REAL_CITY : [],
      odds: {
        bookmaker: "Mock",
        capturedAt: today(),
        values: { "1": 1.95, X: 3.6, "2": 4.2, "OVER_2.5": 1.7, "UNDER_2.5": 2.1, BTTS_YES: 1.65 },
      },
      injuries: { home: [], away: [] },
      weather: null,
    },
  ]),
);

export function getMockFixtures(): Fixture[] {
  return MOCK_FIXTURES;
}

export function getMockEnrichedMatch(fixtureId: string): EnrichedMatchData | null {
  return ENRICHED[fixtureId] ?? null;
}
