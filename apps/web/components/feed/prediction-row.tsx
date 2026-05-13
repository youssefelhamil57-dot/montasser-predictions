import { ArrowUpRight, CheckCircle2, XCircle, Star } from "lucide-react";
import type { PublicPrediction } from "@shared/index";
import { cn, confidenceColor } from "@/lib/utils";

const BETTING_URL = process.env.NEXT_PUBLIC_BETTING_URL ?? "https://1xbet.com/";

interface PredictionRowProps {
  prediction: PublicPrediction;
}

const OUTCOME_LABELS: Record<string, string> = {
  HOME: "1",
  AWAY: "2",
  DRAW: "X",
  OVER: "Over",
  UNDER: "Under",
  YES: "BTTS Oui",
  NO: "BTTS Non",
  "1X": "1X",
  X2: "X2",
  "12": "12",
};

// Batman-aligned: low=red, medium=amber, high=primary yellow, elite=bright gold
const CONFIDENCE_BAR: Record<ReturnType<typeof confidenceColor>, string> = {
  low: "from-red-500/80 to-red-600",
  medium: "from-orange-400 to-amber-500",
  high: "from-amber-400 to-primary",
  elite: "from-primary via-yellow-300 to-primary bat-glow",
};

/**
 * Compact SoFascore-style row. Single line on desktop, slightly stacked on mobile.
 *
 *   time │ teams │ pick │ confidence bar │ odds │ Parier →
 */
export function PredictionRow({ prediction }: PredictionRowProps) {
  const date = new Date(prediction.matchDate);
  const time = new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);

  const isFinished = prediction.actualOutcome !== null;
  const won = prediction.isCorrect === true;
  const lost = prediction.isCorrect === false;

  const confidence = prediction.confidenceScore ?? 0;
  const tier = confidenceColor(confidence);
  const outcomeLabel = OUTCOME_LABELS[prediction.predictedOutcome] ?? prediction.predictedOutcome;

  return (
    <li className="group relative">
      <div
        className={cn(
          "grid grid-cols-[64px_1fr_auto] md:grid-cols-[64px_minmax(0,1fr)_56px_180px_72px_auto] items-center gap-3 md:gap-4",
          "px-3 md:px-4 py-2.5 border-b border-border/60",
          "transition-colors hover:bg-card/60",
          isFinished && "opacity-75",
        )}
      >
        {/* Time */}
        <div className="font-mono text-sm tabular-nums text-muted-foreground">
          {time}
        </div>

        {/* Teams */}
        <div className="min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            {prediction.isFeatured && !isFinished && (
              <Star className="size-3.5 text-accent shrink-0" aria-label="Featured" />
            )}
            <p className="truncate text-sm">
              <span className="font-medium">{prediction.homeTeam}</span>
              <span className="mx-1.5 text-muted-foreground">vs</span>
              <span className="font-medium">{prediction.awayTeam}</span>
            </p>
          </div>
          {/* Mobile-only confidence row */}
          <div className="md:hidden mt-1 flex items-center gap-2">
            <PickBadge label={outcomeLabel} tier={tier} />
            <ConfidenceMini score={confidence} tier={tier} />
            {prediction.oddsSuggested ? (
              <span className="font-mono text-xs text-muted-foreground tabular-nums">
                @ {prediction.oddsSuggested.toFixed(2)}
              </span>
            ) : null}
          </div>
        </div>

        {/* Desktop: Pick */}
        <div className="hidden md:flex justify-center">
          <PickBadge label={outcomeLabel} tier={tier} />
        </div>

        {/* Desktop: Confidence */}
        <div className="hidden md:block">
          {isFinished ? (
            <FinishedTag won={won} lost={lost} />
          ) : (
            <ConfidenceMini score={confidence} tier={tier} fullWidth />
          )}
        </div>

        {/* Desktop: Odds */}
        <div className="hidden md:block font-mono text-sm tabular-nums text-right text-muted-foreground">
          {prediction.oddsSuggested ? prediction.oddsSuggested.toFixed(2) : "—"}
        </div>

        {/* CTA */}
        <a
          href={BETTING_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap",
            "bg-primary text-primary-foreground hover:bg-primary/90",
            isFinished && "bg-muted text-muted-foreground hover:bg-muted pointer-events-none",
          )}
          aria-label={`Parier sur ${prediction.homeTeam} vs ${prediction.awayTeam} sur 1xBet`}
        >
          {isFinished ? "Terminé" : (
            <>
              Parier <ArrowUpRight className="size-3.5" />
            </>
          )}
        </a>
      </div>
    </li>
  );
}

function PickBadge({ label, tier }: { label: string; tier: ReturnType<typeof confidenceColor> }) {
  const tierColor: Record<typeof tier, string> = {
    low: "bg-red-500/15 text-red-300 ring-red-500/30",
    medium: "bg-amber-500/15 text-amber-300 ring-amber-500/30",
    high: "bg-primary/20 text-primary ring-primary/40",
    elite: "bg-primary/30 text-primary ring-primary/60 bat-glow",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center min-w-[40px] rounded px-1.5 py-0.5 text-xs font-bold ring-1 font-mono",
        tierColor[tier],
      )}
    >
      {label}
    </span>
  );
}

function ConfidenceMini({
  score,
  tier,
  fullWidth = false,
}: {
  score: number;
  tier: ReturnType<typeof confidenceColor>;
  fullWidth?: boolean;
}) {
  const pct = Math.max(0, Math.min(100, score));
  return (
    <div className={cn("flex items-center gap-2", fullWidth ? "w-full" : "w-32")}>
      <div className="relative flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full rounded-full bg-gradient-to-r", CONFIDENCE_BAR[tier])}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="font-mono text-xs tabular-nums font-semibold w-10 text-right">
        {score.toFixed(0)}%
      </span>
    </div>
  );
}

function FinishedTag({ won, lost }: { won: boolean; lost: boolean }) {
  if (won) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-primary">
        <CheckCircle2 className="size-3.5" /> Gagné
      </span>
    );
  }
  if (lost) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-destructive">
        <XCircle className="size-3.5" /> Perdu
      </span>
    );
  }
  return <span className="text-xs text-muted-foreground">En attente</span>;
}
