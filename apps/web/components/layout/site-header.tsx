import Link from "next/link";
import { LogOut } from "lucide-react";
import { BrandMark } from "@/components/brand/bat-logo";
import { Button } from "@/components/ui/button";

/**
 * Authenticated-side header. Anything that renders this is past the middleware
 * so the visitor is logged in — we always show the logout control.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur-xl">
      <div className="container flex items-center justify-between py-3">
        <Link href="/" className="cursor-pointer hover:opacity-90 transition-opacity">
          <BrandMark size="md" glow />
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/legal/responsible-gambling"
            className="hidden sm:inline-flex text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors"
          >
            Jeu responsable
          </Link>
          <form action="/api/auth/logout" method="post">
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              aria-label="Déconnexion"
              className="font-display uppercase tracking-[0.18em] text-xs"
            >
              <LogOut className="size-4" />
              <span className="hidden sm:inline">Sortir</span>
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
