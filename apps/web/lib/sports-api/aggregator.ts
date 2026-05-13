import "server-only";
import { logger } from "@/lib/logger";
import { getMockFixtures, getMockEnrichedMatch } from "./mock-data";
import {
  getFixturesByDate,
  getTeamStats,
  getHeadToHead,
  getOdds,
  type RawFixture,
} from "./api-football";
import type {
  EnrichedMatchData,
  Fixture,
  TeamStats,
  HeadToHeadEntry,
  OddsSnapshot,
} from "./types";

/**
 * Provider-agnostic façade. Falls back to mocks when API_FOOTBALL_KEY is unset
 * so local dev and CI work without external creds.
 */

const log = logger.child({ component: "sports-aggregator" });

const isMockMode = (): boolean => !process.env.API_FOOTBALL_KEY;

/** ISO date (YYYY-MM-DD) in the given timezone. */
function isoDate(d: Date, tz = "Europe/Paris"): string {
  const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" });
  return fmt.format(d); // en-CA → YYYY-MM-DD
}

export async function getTodayFixtures(opts: { date?: Date; sports?: string[] } = {}): Promise<Fixture[]> {
  const date = opts.date ?? new Date();
  if (isMockMode()) {
    log.debug("mock mode: returning mock fixtures");
    return getMockFixtures();
  }
  const raw = await getFixturesByDate(isoDate(date));
  return raw.map(projectFixture);
}

export async function getEnrichedMatchData(fixtureId: string): Promise<EnrichedMatchData | null> {
  if (isMockMode() || fixtureId.startsWith("mock:")) {
    return getMockEnrichedMatch(fixtureId);
  }

  const [providerKey, externalId] = fixtureId.split(":", 2);
  if (providerKey !== "api-football" || !externalId) {
    log.warn("unknown fixture provider", { fixtureId });
    return null;
  }

  const fixtures = await getFixturesByDate(isoDate(new Date()));
  const raw = fixtures.find((f) => String(f.fixture.id) === externalId);
  if (!raw) {
    log.warn("fixture not found", { fixtureId });
    return null;
  }
  const fixture = projectFixture(raw);

  const [homeStats, awayStats, h2h, oddsRaw] = await Promise.all([
    getTeamStats(raw.teams.home.id, raw.league.id, raw.league.season).then((s) => s && projectTeamStats(s, fixture.homeTeam.id)),
    getTeamStats(raw.teams.away.id, raw.league.id, raw.league.season).then((s) => s && projectTeamStats(s, fixture.awayTeam.id)),
    getHeadToHead(raw.teams.home.id, raw.teams.away.id).then(projectH2H),
    getOdds(raw.fixture.id).then(projectOdds),
  ]);

  return {
    fixture,
    homeStats: homeStats ?? null,
    awayStats: awayStats ?? null,
    headToHead: h2h,
    odds: oddsRaw,
    injuries: { home: [], away: [] }, // TODO: wire /injuries when needed
    weather: null,
  };
}

// ---- Projections from raw API-Football → normalized ----------------------

function projectFixture(raw: RawFixture): Fixture {
  const statusShort = raw.fixture.status?.short ?? "NS";
  return {
    id: `api-football:${raw.fixture.id}`,
    provider: "api-football",
    externalId: String(raw.fixture.id),
    sport: "football",
    league: raw.league.name,
    country: raw.league.country ?? null,
    season: raw.league.season,
    homeTeam: { id: `api-football:${raw.teams.home.id}`, name: raw.teams.home.name, logo: raw.teams.home.logo ?? null },
    awayTeam: { id: `api-football:${raw.teams.away.id}`, name: raw.teams.away.name, logo: raw.teams.away.logo ?? null },
    matchDate: new Date(raw.fixture.date),
    venue: raw.fixture.venue?.name ?? null,
    status: mapStatus(statusShort),
  };
}

function mapStatus(short: string): Fixture["status"] {
  if (["1H", "2H", "HT", "ET", "BT", "P", "LIVE"].includes(short)) return "live";
  if (["FT", "AET", "PEN"].includes(short)) return "finished";
  if (["PST"].includes(short)) return "postponed";
  if (["CANC", "ABD"].includes(short)) return "cancelled";
  return "scheduled";
}

function projectTeamStats(raw: Awaited<ReturnType<typeof getTeamStats>> & object, teamId: string): TeamStats {
  const recentForm = (raw.form ?? "").slice(-10).split("").filter((c): c is "W" | "D" | "L" => c === "W" || c === "D" || c === "L");
  return {
    teamId,
    matchesPlayed: raw.fixtures.played.total,
    wins: raw.fixtures.wins.total,
    draws: raw.fixtures.draws.total,
    losses: raw.fixtures.loses.total,
    goalsFor: raw.goals.for.total.total,
    goalsAgainst: raw.goals.against.total.total,
    cleanSheets: raw.clean_sheet?.total ?? 0,
    failedToScore: raw.failed_to_score?.total ?? 0,
    recentForm,
    homeMetrics: { wins: raw.fixtures.wins.home, draws: raw.fixtures.draws.home, losses: raw.fixtures.loses.home },
    awayMetrics: { wins: raw.fixtures.wins.away, draws: raw.fixtures.draws.away, losses: raw.fixtures.loses.away },
  };
}

function projectH2H(raws: RawFixture[]): HeadToHeadEntry[] {
  return raws.map((r) => ({
    matchDate: new Date(r.fixture.date),
    homeTeam: r.teams.home.name,
    awayTeam: r.teams.away.name,
    homeScore: 0, // api-football includes goals in a different field; left 0 for the schema
    awayScore: 0,
    competition: r.league.name,
  }));
}

function projectOdds(raw: Awaited<ReturnType<typeof getOdds>>): OddsSnapshot | null {
  if (!raw) return null;
  const values: Record<string, number> = {};
  for (const bm of raw.bookmakers) {
    const matchWinner = bm.bets.find((b) => b.name === "Match Winner");
    if (matchWinner) {
      for (const v of matchWinner.values) {
        const n = Number(v.odd);
        if (Number.isFinite(n)) values[v.value] = n;
      }
      return { bookmaker: bm.name, capturedAt: new Date(), values };
    }
  }
  return null;
}
