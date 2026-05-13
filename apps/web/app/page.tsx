import { getSupabaseAdmin } from "@/lib/db/supabase-admin";
import { MOCK_FEED } from "@/lib/preview-feed";
import type { PredictionRow } from "@/lib/db/types";
import type { PublicPrediction } from "@shared/index";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { BatLogo } from "@/components/brand/bat-logo";
import { SportsFilter } from "@/components/feed/sports-filter";
import { DateFilter } from "@/components/feed/date-filter";
import { PredictionsList } from "@/components/feed/predictions-list";

export const metadata = {
  title: "Pronostics sportifs Montasser",
  description:
    "Tous les pronostics Montasser, mis à jour en continu, groupés par compétition. Cote suggérée, niveau de confiance, lien direct vers 1xBet.",
};

export const dynamic = "force-dynamic";

type SearchParams = {
  sport?: string;
  league?: string;
  date?: "today" | "tomorrow" | "week" | "all";
};

type DateRange = { start: Date; end: Date | null };

const SPORTS_CATALOGUE = [
  { key: "all",        label: "Tous les sports" },
  { key: "football",   label: "Football" },
  { key: "tennis",     label: "Tennis" },
  { key: "basketball", label: "Basketball" },
  { key: "esport",     label: "E-sport" },
] as const;

export default async function HomePage({ searchParams }: { searchParams: SearchParams }) {
  const dateKey = (searchParams.date ?? "today") as "today" | "tomorrow" | "week" | "all";
  const activeSport = searchParams.sport ?? "all";
  const range = computeRange(dateKey);

  // Fetch matches in the range — sport filter applied client-side so we can
  // show per-sport counts in the sidebar.
  const fetched = await fetchPredictions(range);
  const items = fetched.length === 0 && process.env.NODE_ENV !== "production"
    ? filterMocksToRange(MOCK_FEED, range)
    : fetched;

  const visible = items
    .filter((p) => activeSport === "all" || p.sport === activeSport)
    .map(projectPrediction);

  const sportEntries = SPORTS_CATALOGUE.map((s) => ({
    key: s.key,
    label: s.label,
    count: s.key === "all" ? items.length : items.filter((p) => p.sport === s.key).length,
  }));

  return (
    <div className="min-h-svh flex flex-col">
      <SiteHeader />

      <main className="container flex-1 py-6 md:py-8">
        {/* Page title + date tabs */}
        <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 mb-2 text-primary">
              <BatLogo className="h-3 w-auto" glow />
              <span className="font-display uppercase tracking-[0.3em] text-[11px]">
                Pronostics Montasser
              </span>
            </div>
            <h1 className="font-display text-3xl md:text-5xl uppercase tracking-[0.02em] leading-none">
              {DATE_TITLES[dateKey]}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {visible.length} pronostic{visible.length > 1 ? "s" : ""} · analysés en temps réel
            </p>
          </div>
          <DateFilter
            active={dateKey}
            preserve={{ sport: activeSport === "all" ? undefined : activeSport }}
          />
        </header>

        {/* Layout: sidebar + list */}
        <div className="grid gap-6 md:grid-cols-[200px_minmax(0,1fr)]">
          <aside className="md:sticky md:top-20 md:self-start">
            <SportsFilter
              sports={sportEntries}
              active={activeSport}
              preserve={{ date: dateKey === "today" ? undefined : dateKey }}
            />
          </aside>

          <section>
            <PredictionsList predictions={visible} />
          </section>
        </div>

        {/* Compliance footer-strip */}
        <p className="mt-8 text-center text-xs text-muted-foreground">
          18+ · Jouez responsable · Les pronostics ne garantissent aucun gain ·{" "}
          <a href="/legal/responsible-gambling" className="hover:text-foreground underline-offset-4 hover:underline">
            Besoin d'aide ?
          </a>
        </p>
      </main>

      <SiteFooter />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Date range helpers
// ---------------------------------------------------------------------------

const DATE_TITLES: Record<"today" | "tomorrow" | "week" | "all", string> = {
  today: "Pronostics du jour",
  tomorrow: "Pronostics de demain",
  week: "Pronostics de la semaine",
  all: "Tous les pronostics à venir",
};

function computeRange(key: "today" | "tomorrow" | "week" | "all"): DateRange {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setUTCHours(0, 0, 0, 0);
  switch (key) {
    case "today": {
      const end = new Date(startOfToday);
      end.setUTCDate(end.getUTCDate() + 1);
      return { start: now, end };
    }
    case "tomorrow": {
      const start = new Date(startOfToday);
      start.setUTCDate(start.getUTCDate() + 1);
      const end = new Date(start);
      end.setUTCDate(end.getUTCDate() + 1);
      return { start, end };
    }
    case "week": {
      const end = new Date(startOfToday);
      end.setUTCDate(end.getUTCDate() + 7);
      return { start: now, end };
    }
    case "all":
    default:
      return { start: now, end: null };
  }
}

function filterMocksToRange(mocks: PredictionRow[], range: DateRange): PredictionRow[] {
  const startTs = range.start.getTime();
  const endTs = range.end?.getTime() ?? Infinity;
  return mocks.filter((m) => {
    const t = new Date(m.match_date).getTime();
    return t >= startTs && t < endTs;
  });
}

// ---------------------------------------------------------------------------
// Supabase read
// ---------------------------------------------------------------------------

async function fetchPredictions(range: DateRange): Promise<PredictionRow[]> {
  try {
    const supabase = getSupabaseAdmin();
    let query = supabase
      .from("predictions")
      .select("*")
      .gte("match_date", range.start.toISOString())
      .order("match_date", { ascending: true })
      .limit(200);
    if (range.end) query = query.lt("match_date", range.end.toISOString());
    const { data } = await query.returns<PredictionRow[]>();
    return data ?? [];
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Row → public shape
// ---------------------------------------------------------------------------

function projectPrediction(row: PredictionRow): PublicPrediction {
  return {
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
  };
}
