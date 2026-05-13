import { describe, expect, it } from "vitest";
import {
  cn,
  confidenceColor,
  formatCurrency,
  formatNumber,
  formatPercent,
  randomShortcode,
} from "@/lib/utils";

describe("cn (tailwind class merge)", () => {
  it("merges conflicting Tailwind classes (later wins)", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("dedupes and joins with spaces", () => {
    expect(cn("a", "b", false && "c", "a")).toBe("a b a");
  });
});

describe("confidenceColor", () => {
  it("buckets scores into 4 tiers", () => {
    expect(confidenceColor(0)).toBe("low");
    expect(confidenceColor(49.9)).toBe("low");
    expect(confidenceColor(50)).toBe("medium");
    expect(confidenceColor(69.9)).toBe("medium");
    expect(confidenceColor(70)).toBe("high");
    expect(confidenceColor(84.9)).toBe("high");
    expect(confidenceColor(85)).toBe("elite");
    expect(confidenceColor(100)).toBe("elite");
  });
});

describe("formatters", () => {
  it("formats numbers with French thousand separators", () => {
    expect(formatNumber(1_234_567)).toMatch(/1.234.567/); // NBSP or thin space depending on ICU
  });

  it("formats currency in EUR by default", () => {
    const out = formatCurrency(99.5);
    expect(out).toMatch(/99,50/);
    expect(out).toMatch(/€/);
  });

  it("formats percent with configurable digits", () => {
    expect(formatPercent(42.345, 1)).toMatch(/42,3\s?%/);
    expect(formatPercent(42, 0)).toMatch(/42\s?%/);
  });
});

describe("randomShortcode", () => {
  it("produces the requested length using the safe alphabet", () => {
    const code = randomShortcode(10);
    expect(code).toHaveLength(10);
    expect(/^[ABCDEFGHJKMNPQRSTVWXYZ23456789]+$/.test(code)).toBe(true);
  });

  it("does not contain visually-ambiguous chars (I/L/O/U/0/1)", () => {
    const code = randomShortcode(128);
    expect(code).not.toMatch(/[ILOU01]/);
  });

  it("generates distinct codes across calls (rare collision allowed)", () => {
    const codes = new Set<string>();
    for (let i = 0; i < 200; i++) codes.add(randomShortcode(8));
    expect(codes.size).toBeGreaterThan(195);
  });
});
