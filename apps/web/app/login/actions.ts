"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { env } from "@/lib/env";
import { signSession, SESSION_COOKIE, SESSION_TTL_MS } from "@/lib/auth/session";
import { logger } from "@/lib/logger";

const log = logger.child({ component: "login" });

const schema = z.object({
  username: z.string().trim().min(1, "Identifiant requis."),
  password: z.string().min(1, "Mot de passe requis."),
  next: z.string().optional(),
});

// NOTE: "use server" files may only export async functions. The shared types
// and `loginInitial` constant live in `./shared.ts` so they can be imported
// by both this file and the client form.
import type { LoginResult } from "./shared";

export async function loginAction(_prev: LoginResult, formData: FormData): Promise<LoginResult> {
  const parsed = schema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
    next: formData.get("next"),
  });
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Champs invalides." };
  }

  const expectedUser = env.server.AUTH_USERNAME;
  const expectedPass = env.server.AUTH_PASSWORD;
  const secret = env.server.AUTH_SECRET;

  if (!expectedUser || !expectedPass || !secret) {
    log.error("AUTH_* env vars not configured");
    return { status: "error", message: "Authentification non configurée côté serveur." };
  }

  // Light constant-time-ish check (length differences leak, but for a single
  // creds pair this is more than enough)
  if (parsed.data.username !== expectedUser || parsed.data.password !== expectedPass) {
    // Sleep a tiny bit to discourage rapid guessing (very mild)
    await new Promise((r) => setTimeout(r, 250));
    log.warn("login failed", { username: parsed.data.username });
    return { status: "error", message: "Identifiant ou mot de passe incorrect." };
  }

  const expiresAt = Date.now() + SESSION_TTL_MS;
  const token = signSession(parsed.data.username, expiresAt, secret);

  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: env.server.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(expiresAt),
  });

  log.info("login ok", { username: parsed.data.username });

  const next = parsed.data.next && parsed.data.next.startsWith("/") ? parsed.data.next : "/";
  redirect(next);
}
