/**
 * Edge-runtime session verification. Uses Web Crypto (SubtleCrypto) instead
 * of `node:crypto` so it can run inside Next.js middleware.
 *
 * Token format must match the Node signer in `session.ts`.
 */

export const SESSION_COOKIE = "montasser_session";

export async function verifySessionEdge(
  token: string,
  secret: string,
): Promise<{ username: string; expiresAt: number } | null> {
  const parts = token.split("|");
  if (parts.length !== 3) return null;
  const [username, expiresAtStr, sig] = parts;
  const expiresAt = Number(expiresAtStr);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return null;

  const enc = new TextEncoder();
  let key: CryptoKey;
  try {
    key = await crypto.subtle.importKey(
      "raw",
      enc.encode(secret) as unknown as BufferSource,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
    );
  } catch {
    return null;
  }

  const sigBytes = hexToBytes(sig);
  if (!sigBytes) return null;

  try {
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      sigBytes as unknown as BufferSource,
      enc.encode(`${username}|${expiresAtStr}`) as unknown as BufferSource,
    );
    return valid ? { username, expiresAt } : null;
  } catch {
    return null;
  }
}

function hexToBytes(hex: string): Uint8Array | null {
  if (hex.length % 2 !== 0) return null;
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) {
    const byte = parseInt(hex.substr(i * 2, 2), 16);
    if (Number.isNaN(byte)) return null;
    out[i] = byte;
  }
  return out;
}
