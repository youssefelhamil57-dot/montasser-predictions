import { describe, expect, it } from "vitest";
import { aiPredictionDraftSchema, extractJson } from "@/lib/ai/schemas";

describe("extractJson", () => {
  it("parses already-JSON input", () => {
    expect(extractJson('{"a":1}')).toEqual({ a: 1 });
  });

  it("strips markdown ```json fences", () => {
    const raw = "```json\n{\"x\": 2}\n```";
    expect(extractJson(raw)).toEqual({ x: 2 });
  });

  it("strips plain ``` fences", () => {
    const raw = "```\n{\"y\": 3}\n```";
    expect(extractJson(raw)).toEqual({ y: 3 });
  });

  it("falls back to the first balanced { ... } when surrounded by prose", () => {
    const raw = 'Voici le JSON :\n{"z": 4}\nFin du message.';
    expect(extractJson(raw)).toEqual({ z: 4 });
  });

  it("returns null on irrecoverable garbage", () => {
    expect(extractJson("no json here")).toBeNull();
    expect(extractJson("{ not balanced")).toBeNull();
  });

  it("handles nested objects and arrays", () => {
    const raw = "trailing\n{\n \"k\": [1, {\"nested\": true}]\n}\n";
    expect(extractJson(raw)).toEqual({ k: [1, { nested: true }] });
  });
});

describe("aiPredictionDraftSchema", () => {
  const valid = {
    predictionType: "match_winner",
    predictedOutcome: "HOME",
    confidenceScore: 72.5,
    reasoning:
      "Real Madrid joue à domicile et reste sur 4 victoires en 5 matchs. City a perdu 2 défenseurs sur blessure.",
    keyFactors: ["Forme récente", "Avantage Bernabéu", "Blessures City"],
    riskLevel: "medium" as const,
    suggestedOdds: 1.95,
  };

  it("accepts a well-formed draft", () => {
    const parsed = aiPredictionDraftSchema.parse(valid);
    expect(parsed.confidenceScore).toBe(72.5);
  });

  it("rejects confidenceScore outside 0-100", () => {
    expect(aiPredictionDraftSchema.safeParse({ ...valid, confidenceScore: 120 }).success).toBe(false);
    expect(aiPredictionDraftSchema.safeParse({ ...valid, confidenceScore: -1 }).success).toBe(false);
  });

  it("rejects unknown predictionType", () => {
    expect(
      aiPredictionDraftSchema.safeParse({ ...valid, predictionType: "yolo_bet" }).success,
    ).toBe(false);
  });

  it("requires reasoning length >= 20", () => {
    expect(aiPredictionDraftSchema.safeParse({ ...valid, reasoning: "short" }).success).toBe(false);
  });

  it("requires at least 2 keyFactors", () => {
    expect(
      aiPredictionDraftSchema.safeParse({ ...valid, keyFactors: ["only one"] }).success,
    ).toBe(false);
  });

  it("accepts null suggestedOdds", () => {
    expect(
      aiPredictionDraftSchema.parse({ ...valid, suggestedOdds: null }).suggestedOdds,
    ).toBeNull();
  });

  it("accepts an alternativeBets array", () => {
    const parsed = aiPredictionDraftSchema.parse({
      ...valid,
      alternativeBets: [
        { predictionType: "over_under", predictedOutcome: "OVER", confidence: 65, odds: 1.85 },
      ],
    });
    expect(parsed.alternativeBets).toHaveLength(1);
  });
});
