import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Server-only (Node) session signing. Pair with `session-edge.ts` for
 * Edge-runtime verification (the middleware can't import `node:crypto`).
 *
 * Token format: `username|expiresAtMs|hex(hmacSHA256(username|expiresAtMs, secret))`
 * - Signed with HMAC-SHA256 → tamper-evident
 * - Expiry embedded → no DB session table needed
 * - Constant-time compare → no timing oracle
 */

export function signSession(username: string, expiresAtMs: number, secret: string): string {
  const payload = `${username}|${expiresAtMs}`;
  const sig = createHmac("sha256", secret).update(payload).digest("hex");
  return `${payload}|${sig}`;
}

export function verifySessionNode(token: string, secret: string): { username: string; expiresAt: number } | null {
  const parts = token.split("|");
  if (parts.length !== 3) return null;
  const [username, expiresAtStr, sig] = parts;
  const expiresAt = Number(expiresAtStr);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return null;

  const expected = createHmac("sha256", secret).update(`${username}|${expiresAtStr}`).digest("hex");
  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(sig, "hex");
  if (a.length !== b.length) return null;
  try {
    return timingSafeEqual(a, b) ? { username, expiresAt } : null;
  } catch {
    return null;
  }
}

export const SESSION_COOKIE = "montasser_session";
export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
