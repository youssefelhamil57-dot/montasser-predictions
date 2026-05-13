import Link from "next/link";
import { BrandMark } from "@/components/brand/bat-logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-border mt-12">
      <div className="container py-8 grid gap-6 md:grid-cols-[2fr_1fr_1fr] md:items-start">
        <div>
          <Link href="/" className="cursor-pointer hover:opacity-90 transition-opacity">
            <BrandMark size="md" glow />
          </Link>
          <p className="mt-3 text-sm text-muted-foreground max-w-md">
            Pronostics sportifs Montasser — analyse de la forme, des stats H2H et des cotes pour
            générer un score de confiance sur les matchs à venir.
          </p>
        </div>

        <div>
          <p className="text-[10px] font-display uppercase tracking-[0.25em] text-primary mb-3">
            Plus
          </p>
          <ul className="space-y-1.5 text-sm">
            <li><Link href="/" className="hover:text-foreground text-muted-foreground">Pronostics</Link></li>
            <li><Link href="/legal/responsible-gambling" className="hover:text-foreground text-muted-foreground">Jeu responsable</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-[10px] font-display uppercase tracking-[0.25em] text-primary mb-3">
            Légal
          </p>
          <ul className="space-y-1.5 text-sm">
            <li><Link href="/legal/terms" className="hover:text-foreground text-muted-foreground">CGU</Link></li>
            <li><Link href="/legal/privacy" className="hover:text-foreground text-muted-foreground">Confidentialité</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Montasser. Tous droits réservés.</p>
          <p>18+ · Jouez responsable · Les pronostics ne garantissent aucun gain.</p>
        </div>
      </div>
    </footer>
  );
}
