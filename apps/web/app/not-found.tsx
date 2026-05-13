import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BrandMark, BatLogo } from "@/components/brand/bat-logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-svh flex flex-col">
      <header className="container py-6">
        <Link href="/" className="cursor-pointer hover:opacity-90 transition-opacity">
          <BrandMark size="md" glow />
        </Link>
      </header>
      <main className="flex-1 grid place-items-center px-4">
        <div className="max-w-md text-center space-y-6">
          <BatLogo className="mx-auto h-20 w-auto text-primary" glow />
          <p className="font-display text-7xl md:text-8xl gradient-text tracking-tight">404</p>
          <h1 className="font-display text-2xl uppercase tracking-[0.15em]">Disparu dans la nuit</h1>
          <p className="text-muted-foreground">
            Cette page n'existe pas, ou plus. Reviens à la signalisation pour voir les pronostics du jour.
          </p>
          <Button asChild>
            <Link href="/"><ArrowLeft /> Retour aux pronostics</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
