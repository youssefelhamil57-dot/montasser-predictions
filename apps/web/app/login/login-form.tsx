"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Loader2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { loginAction } from "./actions";
import { loginInitial } from "./shared";

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction] = useFormState(loginAction, loginInitial);

  return (
    <form action={formAction} className="space-y-4">
      {next ? <input type="hidden" name="next" value={next} /> : null}

      <div className="space-y-2">
        <Label htmlFor="username" className="font-display uppercase tracking-[0.2em] text-[11px] text-primary">
          Identifiant
        </Label>
        <Input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          autoFocus
          required
          className="bg-background border-border/60 focus-visible:ring-primary"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="font-display uppercase tracking-[0.2em] text-[11px] text-primary">
          Mot de passe
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="bg-background border-border/60 focus-visible:ring-primary"
        />
      </div>

      <SubmitButton />

      {state.status === "error" && (
        <Alert variant="destructive">
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      size="lg"
      disabled={pending}
      className="w-full font-display uppercase tracking-[0.18em]"
    >
      {pending ? <Loader2 className="animate-spin" /> : <LogIn />}
      Entrer dans Gotham
    </Button>
  );
}
