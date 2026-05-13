import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "EUR", locale = "fr-FR"): string {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount);
}

export function formatNumber(value: number, locale = "fr-FR"): string {
  return new Intl.NumberFormat(locale).format(value);
}

export function formatPercent(value: number, fractionDigits = 1, locale = "fr-FR"): string {
  return new Intl.NumberFormat(locale, {
    style: "percent",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value / 100);
}

/** confidence 0-100 → tailwind color token */
export function confidenceColor(score: number): "low" | "medium" | "high" | "elite" {
  if (score >= 85) return "elite";
  if (score >= 70) return "high";
  if (score >= 50) return "medium";
  return "low";
}

/**
 * Build a short random URL-safe code (shortcodes, referral codes).
 *
 * Alphabet excludes visually-ambiguous chars (I, L, O, U, 0, 1) so users can
 * read codes off a QR / screenshot without confusion. The 26-char length
 * introduces a tiny (<5%) bias via `% alphabet.length`, which is fine here —
 * shortcodes are not cryptographic.
 */
export function randomShortcode(length = 8): string {
  const alphabet = "ABCDEFGHJKMNPQRSTVWXYZ23456789"; // 30 chars, no I/L/O/U/0/1
  let out = "";
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  for (let i = 0; i < bytes.length; i++) {
    out += alphabet[bytes[i] % alphabet.length];
  }
  return out;
}
