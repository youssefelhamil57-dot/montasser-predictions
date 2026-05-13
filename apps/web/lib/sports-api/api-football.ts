import "server-only";
import { z } from "zod";
import { cached } from "@/lib/cache";
import { logger } from "@/lib/logger";

/**
 * Thin client for api-football.com (RapidAPI alternative).
 * Free tier: 100 req/day. Cache aggressively (1h for stats, 5min for odds).
 *
 * Endpoint reference: https://www.api-football.com/documentation-v3
 */

const BASE_URL = "https://v3.football.api-sports.io";

const log = logger.child({ component: "api-football" });

class ApiFootballError extends Error {
  constructor(message: string, public readonly status?: number, public readonly body?: unknown) {
    super(message);
    this.name = "ApiFootballError";
  }
}

async function request<T>(path: string, init?: RequestInit & { ttlSeconds?: number }): Promise<T> {
  const key = process.env.API_FOOTBALL_KEY;
  if (!key) throw new ApiFootballError("API_FOOTBALL_KEY missing — set it in .env.local");

  const ttl = init?.ttlSeconds ?? 3600;
  return cached(`api-football:${path}`, async () => {
    log.debug("api-football request", { path });
    const res = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: {
        "x-apisports-key": key,
        accept: "application/json",
        ...init?.headers,
      },
      // Vercel edge fetch is undici; long-lived if cached upstream as well
      next: { revalidate: ttl },
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      log.error("api-football error", { path, status: res.status, body });
      throw new ApiFootballError(`api-football ${res.status}`, res.status, body);
    }

    const json = (await res.json()) as { response: T; errors?: unknown };
    if (json.errors && Array.isArray(json.errors) ? json.errors.length > 0 : Object.keys(json.errors ?? {}).length > 0) {
      log.warn("api-football logical errors", { path, errors: json.errors });
    }
    return json.response;
  }, { ttlSeconds: ttl });
}

// ---- Schemas ---------------------------------------------------------------

const fixtureSchema = z.object({
  fixture: z.object({
    id: z.number(),
    date: z.string(),
    timezone: z.string().nullable().optional(),
    status: z.object({ short: z.string() }).optional(),
    venue: z.object({ name: z.string().nullable() }).nullable().optional(),
  }),
  league: z.object({
    id: z.number(),
    name: z.string(),
    country: z.string().nullable().optional(),
    season: z.number(),
  }),
  teams: z.object({
    home: z.object({ id: z.number(), name: z.string(), logo: z.string().nullable().optional() }),
    away: z.object({ id: z.number(), name: z.string(), logo: z.string().nullable().optional() }),
  }),
});

export type RawFixture = z.infer<typeof fixtureSchema>;

const teamStatsSchema = z.object({
  team: z.object({ id: z.number(), name: z.string() }),
  fixtures: z.object({
    played:  z.object({ total: z.number(), home: z.number(), away: z.number() }),
    wins:    z.object({ total: z.number(), home: z.number(), away: z.number() }),
    draws:   z.object({ total: z.number(), home: z.number(), away: z.number() }),
    loses:   z.object({ total: z.number(), home: z.number(), away: z.number() }),
  }),
  goals: z.object({
    for:      z.object({ total: z.object({ total: z.number() }) }),
    against:  z.object({ total: z.object({ total: z.number() }) }),
  }),
  clean_sheet:     z.object({ total: z.number() }).optional(),
  failed_to_score: z.object({ total: z.number() }).optional(),
  form: z.string().nullable().optional(),
});

export type RawTeamStats = z.infer<typeof teamStatsSchema>;

const oddsSchema = z.object({
  fixture: z.object({ id: z.number() }),
  bookmakers: z
    .array(
      z.object({
        id: z.number(),
        name: z.string(),
        bets: z.array(
          z.object({
            id: z.number(),
            name: z.string(),
            values: z.array(z.object({ value: z.string(), odd: z.string() })),
          }),
        ),
      }),
    )
    .default([]),
});

export type RawOdds = z.infer<typeof oddsSchema>;

// ---- Endpoints -------------------------------------------------------------

export async function getFixturesByDate(dateIso: string, timezone = "Europe/Paris"): Promise<RawFixture[]> {
  const raw = await request<unknown[]>(`/fixtures?date=${dateIso}&timezone=${encodeURIComponent(timezone)}`, {
    ttlSeconds: 600,
  });
  return raw
    .map((r) => {
      const parsed = fixtureSchema.safeParse(r);
      if (!parsed.success) {
        log.warn("fixture parse failed", { issues: parsed.error.flatten() });
        return null;
      }
      return parsed.data;
    })
    .filter((x): x is RawFixture => x !== null);
}

export async function getTeamStats(teamId: number, leagueId: number, season: number): Promise<RawTeamStats | null> {
  const raw = await request<unknown>(`/teams/statistics?team=${teamId}&league=${leagueId}&season=${season}`, {
    ttlSeconds: 3600,
  });
  const parsed = teamStatsSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}

export async function getHeadToHead(teamA: number, teamB: number, last = 10): Promise<RawFixture[]> {
  const raw = await request<unknown[]>(`/fixtures/headtohead?h2h=${teamA}-${teamB}&last=${last}`, {
    ttlSeconds: 86400,
  });
  return raw
    .map((r) => fixtureSchema.safeParse(r))
    .filter((p) => p.success)
    .map((p) => p.data as RawFixture);
}

export async function getOdds(fixtureId: number): Promise<RawOdds | null> {
  const raw = await request<unknown[]>(`/odds?fixture=${fixtureId}`, { ttlSeconds: 300 });
  const first = raw[0];
  if (!first) return null;
  const parsed = oddsSchema.safeParse(first);
  return parsed.success ? parsed.data : null;
}
