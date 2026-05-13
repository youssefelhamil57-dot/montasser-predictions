import Link from "next/link";
import { cn } from "@/lib/utils";

interface DateFilterProps {
  /** Active date filter key. */
  active: "today" | "tomorrow" | "week" | "all";
  /** Other search params to preserve when switching date. */
  preserve?: Record<string, string | undefined>;
  className?: string;
}

const TABS: Array<{ key: "today" | "tomorrow" | "week" | "all"; label: string }> = [
  { key: "today",    label: "Aujourd'hui" },
  { key: "tomorrow", label: "Demain" },
  { key: "week",     label: "Cette semaine" },
  { key: "all",      label: "Tout" },
];

export function DateFilter({ active, preserve, className }: DateFilterProps) {
  const buildHref = (key: string) => {
    const params = new URLSearchParams();
    if (preserve) {
      for (const [k, v] of Object.entries(preserve)) {
        if (v) params.set(k, v);
      }
    }
    if (key !== "today") params.set("date", key);
    else params.delete("date");
    const qs = params.toString();
    return qs ? `/?${qs}` : "/";
  };

  return (
    <div className={cn("flex items-center gap-0.5 rounded-md border border-border bg-card p-1", className)}>
      {TABS.map((tab) => {
        const isActive = active === tab.key;
        return (
          <Link
            key={tab.key}
            href={buildHref(tab.key)}
            className={cn(
              "px-3 py-1.5 rounded-sm font-display text-[11px] uppercase tracking-[0.15em] transition-colors cursor-pointer whitespace-nowrap",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-background/40",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
