import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { env } from "@/lib/env";
import { verifySessionNode, SESSION_COOKIE } from "@/lib/auth/session";
import { BatLogo, BrandMark } from "@/components/brand/bat-logo";
import { LoginForm } from "./login-form";

export const metadata = {
  title: "Connexion",
  description: "Accès Montasser.",
};

export const dynamic = "force-dynamic";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  // If already logged in, bounce to the feed
  const existing = cookies().get(SESSION_COOKIE)?.value;
  if (existing && env.server.AUTH_SECRET) {
    const session = verifySessionNode(existing, env.server.AUTH_SECRET);
    if (session) redirect(searchParams.next?.startsWith("/") ? searchParams.next : "/");
  }

  return (
    <div className="min-h-svh flex flex-col">
      <header className="container py-6">
        <Link href="/" className="cursor-pointer hover:opacity-90 transition-opacity">
          <BrandMark size="md" glow />
        </Link>
      </header>

      <main className="flex-1 grid place-items-center px-4 pb-12">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center space-y-4">
            <BatLogo className="mx-auto h-20 w-auto" glow />
            <div>
              <h1 className="font-display text-3xl uppercase tracking-[0.18em]">Connexion</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Accède au feed Montasser.
              </p>
            </div>
          </div>

          <div className="rounded-md border border-border bg-card p-6 shadow-xl">
            <LoginForm next={searchParams.next} />
          </div>

          <p className="text-center text-[11px] text-muted-foreground font-display uppercase tracking-[0.2em]">
            18+ · Jouez responsable
          </p>
        </div>
      </main>
    </div>
  );
}
