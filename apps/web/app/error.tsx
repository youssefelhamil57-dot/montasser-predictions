"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Global error boundary. Catches any unhandled error during render of a route.
 * The error is logged client-side; production deployments should also forward
 * to a tracker (Sentry, etc.) via a useEffect hook.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // TODO Phase 4.x: forward to Sentry / external logger
    console.error("[error.tsx]", error);
  }, [error]);

  return (
    <div className="min-h-svh grid place-items-center px-4 py-12">
      <div className="max-w-md text-center space-y-6">
        <div className="mx-auto size-16 rounded-full bg-destructive/10 text-destructive grid place-items-center">
          <AlertTriangle className="size-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Quelque chose a cassé.</h1>
          <p className="text-muted-foreground">
            Réessaie l'action. Si ça persiste, contacte le support en mentionnant le code ci-dessous.
          </p>
          {error.digest && (
            <p className="font-mono text-xs text-muted-foreground">
              ref: <code className="bg-muted px-1.5 py-0.5 rounded">{error.digest}</code>
            </p>
          )}
        </div>
        <div className="flex justify-center gap-2">
          <Button onClick={reset}>
            <RotateCw /> Réessayer
          </Button>
          <Button asChild variant="outline">
            <Link href="/"><Home /> Accueil</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
