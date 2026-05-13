import type { PublicPrediction } from "@shared/index";
import { Card } from "@/components/ui/card";
import { PredictionRow } from "./prediction-row";

interface PredictionsListProps {
  predictions: PublicPrediction[];
}

interface Group {
  league: string;
  sport: string;
  items: PublicPrediction[];
  earliest: number; // for sorting groups by match time
}

/**
 * Groups predictions by league, ordered by the earliest kickoff in each league.
 * Each row is rendered with `<PredictionRow>`.
 */
export function PredictionsList({ predictions }: PredictionsListProps) {
  if (predictions.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-sm text-muted-foreground">
          Aucun pronostic ne correspond à ces filtres. Essaie de les élargir.
        </p>
      </Card>
    );
  }

  // Group by league
  const groupsMap = new Map<string, Group>();
  for (const p of predictions) {
    const key = `${p.sport}::${p.league}`;
    const t = new Date(p.matchDate).getTime();
    const existing = groupsMap.get(key);
    if (existing) {
      existing.items.push(p);
      existing.earliest = Math.min(existing.earliest, t);
    } else {
      groupsMap.set(key, { league: p.league, sport: p.sport, items: [p], earliest: t });
    }
  }

  const groups = Array.from(groupsMap.values()).sort((a, b) => a.earliest - b.earliest);
  for (const g of groups) {
    g.items.sort((a, b) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime());
  }

  return (
    <div className="space-y-6">
      {groups.map((g) => (
        <Card key={`${g.sport}::${g.league}`} className="overflow-hidden border-border/80">
          <header className="flex items-center justify-between gap-2 border-b-2 border-primary/20 bg-primary/5 px-4 py-2.5">
            <div className="flex items-center gap-2 min-w-0">
              <span className="size-1.5 rounded-full bg-primary shrink-0" />
              <span className="font-display text-[10px] uppercase tracking-[0.25em] text-primary">
                {g.sport}
              </span>
              <span className="text-border">|</span>
              <h2 className="truncate font-display text-sm uppercase tracking-[0.12em]">{g.league}</h2>
            </div>
            <span className="font-mono text-xs tabular-nums text-muted-foreground">
              {g.items.length}
            </span>
          </header>
          <ul>
            {g.items.map((p) => (
              <PredictionRow key={p.id} prediction={p} />
            ))}
          </ul>
        </Card>
      ))}
    </div>
  );
}
