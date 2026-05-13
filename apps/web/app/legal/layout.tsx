import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-svh flex flex-col">
      <SiteHeader />
      <main className="container flex-1 py-10 max-w-3xl">
        <Button asChild variant="ghost" size="sm" className="mb-4 -ml-3">
          <Link href="/">
            <ArrowLeft className="size-4" /> Retour à l'accueil
          </Link>
        </Button>
        <article className="space-y-4 leading-relaxed [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:tracking-tight [&_h1]:mb-6 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-8 [&_h2]:mb-3 [&_h3]:font-semibold [&_h3]:mt-4 [&_p]:text-muted-foreground [&_p]:text-[15px] [&_li]:text-muted-foreground [&_li]:text-[15px] [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_a]:text-primary [&_a]:underline-offset-4 [&_a:hover]:underline [&_strong]:text-foreground [&_code]:text-foreground [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm">
          {children}
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
