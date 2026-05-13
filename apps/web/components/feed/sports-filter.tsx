import Link from "next/link";
import { cn } from "@/lib/utils";

interface SportEntry {
  key: string;        // "all" | "football" | "tennis" | "basketball" | "esport"
  label: string;
  count: number;
  color?: string;     // tailwind dot color class
}

interface SportsFilterProps {
  sports: SportEntry[];
  /** Currently selected sport key (or "all"). */
  active: string;
  /** Search params to preserve when switching sport. */
  preserve?: Record<string, string | undefined>;
  className?: string;
}

const DOT_COLOR: Record<string, string> = {
  all: "bg-foreground",
  football: "bg-emerald-500",
  tennis: "bg-amber-500",
  basketball: "bg-orange-500",
  esport: "bg-fuchsia-500",
  hockey: "bg-sky-500",
};

/**
 * Sofascore-style sports rail. Desktop: vertical list in left sidebar.
 * Mobile: horizontal pill scroller above the list.
 */
export function SportsFilter({ sports, active, preserve, className }: SportsFilterProps) {
  const buildHref = (sportKey: string) => {
    const params = new URLSearchParams();
    if (preserve) {
      for (const [k, v] of Object.entries(preserve)) {
        if (v) params.set(k, v);
      }
    }
    if (sportKey !== "all") params.set("sport", sportKey);
    else params.delete("sport");
    const qs = params.toString();
    return qs ? `/?${qs}` : "/";
  };

  return (
    <nav className={cn(className)} aria-label="Filtrer par sport">
      <p className="hidden md:block font-display text-[10px] uppercase tracking-[0.3em] text-primary mb-3 px-2">
        Sports
      </p>
      <ul className="md:flex-col flex gap-1 md:gap-0.5 overflow-x-auto md:overflow-visible -mx-2 px-2 md:mx-0 md:px-0 scrollbar-none">
        {sports.map((s) => {
          const isActive = active === s.key;
          return (
            <li key={s.key} className="md:w-full shrink-0">
              <Link
                href={buildHref(s.key)}
                className={cn(
                  "group flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm transition-colors cursor-pointer whitespace-nowrap uppercase tracking-[0.08em] font-medium",
                  isActive
                    ? "bg-primary/15 text-primary border-l-2 border-primary"
                    : "text-muted-foreground hover:bg-card hover:text-foreground border-l-2 border-transparent",
                )}
              >
                <span className="flex items-center gap-2 min-w-0 text-xs">
                  <span className={cn("size-2 rounded-full shrink-0", DOT_COLOR[s.key] ?? "bg-muted-foreground")} />
                  <span className="truncate">{s.label}</span>
                </span>
                <span className="tabular-nums font-mono text-xs text-muted-foreground">
                  {s.count}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
