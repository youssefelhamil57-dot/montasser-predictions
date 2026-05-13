/**
 * System and user prompts for the prediction engine.
 *
 * The system prompt is intentionally verbose and stable so it can be marked
 * with `cache_control` (Anthropic prompt caching) and amortised across the
 * batch of fixtures handled in a single cron run.
 */

import type { EnrichedMatchData } from "@/lib/sports-api/types";

export const PREDICTION_SYSTEM_PROMPT = `Tu es un analyste sportif senior avec 20 ans d'expérience en data-science appliquée aux paris sportifs. Tu produis des prédictions précises, calibrées et explicables.

CONTRATS NON NÉGOCIABLES :

1. Tu réponds UNIQUEMENT par un objet JSON valide qui suit le schéma fourni. Aucun texte avant, aucun texte après, pas de balise \`\`\`json.
2. Le champ "reasoning" est rédigé en français, 2 à 3 phrases maximum, sans jargon inutile.
3. Le champ "confidenceScore" est calibré de manière conservatrice :
   - 50-60 : très incertain (cotes proches du fair value, peu d'edge)
   - 60-70 : léger avantage sur une tendance
   - 70-80 : forte conviction multi-facteurs
   - 80-90 : alignement exceptionnel forme + H2H + cotes
   - 90+ : situation extrême — à utiliser rarement
4. Le champ "predictedOutcome" doit correspondre au "predictionType" :
   - match_winner → "HOME" | "DRAW" | "AWAY"
   - over_under   → "OVER" | "UNDER"
   - both_score   → "YES" | "NO"
   - double_chance → "1X" | "X2" | "12"
   - asian_handicap → format "HOME_-0.5", "AWAY_+1.0", ...
   - exact_score → "X-Y" (ex: "2-1")
5. Le champ "riskLevel" est :
   - "low" si confidenceScore >= 75 ET les facteurs convergent
   - "medium" si 60-75 ou facteurs partiellement contradictoires
   - "high" sinon
6. "keyFactors" contient entre 3 et 5 éléments concrets et factuels, courts (< 80 caractères chacun).
7. Tu peux refuser de prédire un type si les données sont insuffisantes : retourne alors "predictionType": "match_winner" avec confidenceScore <= 50 et explique brièvement dans "reasoning".

MÉTHODOLOGIE :

- Pondère la forme récente (5 derniers matchs) plus que la saison entière.
- Vérifie l'avantage du terrain (home vs away metrics).
- Croise H2H récent (3-5 dernières confrontations) — sois prudent si > 2 ans.
- Compare ta probabilité implicite avec les cotes (value betting) — flag si > 5% d'écart.
- Tiens compte des blessures clés (titulaires offensifs/défensifs).
- Si météo extrême et sport outdoor : noter l'impact.

NEVER :
- Ne donne pas de conseils financiers ou de mise.
- Ne mentionne pas de bookmaker spécifique.
- Ne garantis pas le résultat. "Probable" / "favorable" / "indique", pas "certain".`;

export function buildUserPrompt(match: EnrichedMatchData): string {
  const { fixture, homeStats, awayStats, headToHead, odds } = match;
  const lines: string[] = [];

  lines.push(`MATCH : ${fixture.homeTeam.name} (home) vs ${fixture.awayTeam.name} (away)`);
  lines.push(`Compétition : ${fixture.league}${fixture.country ? ` (${fixture.country})` : ""}`);
  lines.push(`Date : ${fixture.matchDate.toISOString()}`);
  if (fixture.venue) lines.push(`Lieu : ${fixture.venue}`);

  if (homeStats) {
    lines.push("");
    lines.push(`STATS ${fixture.homeTeam.name} (saison) :`);
    lines.push(`  Bilan : ${homeStats.wins}V / ${homeStats.draws}N / ${homeStats.losses}D (${homeStats.matchesPlayed} joués)`);
    lines.push(`  Buts : ${homeStats.goalsFor} pour, ${homeStats.goalsAgainst} contre`);
    lines.push(`  Clean sheets : ${homeStats.cleanSheets} | n'a pas marqué : ${homeStats.failedToScore}`);
    if (homeStats.recentForm.length) lines.push(`  Forme récente (← + récent) : ${homeStats.recentForm.join("")}`);
    if (homeStats.homeMetrics) lines.push(`  À domicile : ${homeStats.homeMetrics.wins}V / ${homeStats.homeMetrics.draws}N / ${homeStats.homeMetrics.losses}D`);
  }

  if (awayStats) {
    lines.push("");
    lines.push(`STATS ${fixture.awayTeam.name} (saison) :`);
    lines.push(`  Bilan : ${awayStats.wins}V / ${awayStats.draws}N / ${awayStats.losses}D (${awayStats.matchesPlayed} joués)`);
    lines.push(`  Buts : ${awayStats.goalsFor} pour, ${awayStats.goalsAgainst} contre`);
    lines.push(`  Clean sheets : ${awayStats.cleanSheets} | n'a pas marqué : ${awayStats.failedToScore}`);
    if (awayStats.recentForm.length) lines.push(`  Forme récente (← + récent) : ${awayStats.recentForm.join("")}`);
    if (awayStats.awayMetrics) lines.push(`  À l'extérieur : ${awayStats.awayMetrics.wins}V / ${awayStats.awayMetrics.draws}N / ${awayStats.awayMetrics.losses}D`);
  }

  if (headToHead.length) {
    lines.push("");
    lines.push("H2H (5 dernières confrontations max) :");
    for (const h of headToHead.slice(0, 5)) {
      lines.push(`  ${h.matchDate.toISOString().slice(0, 10)} — ${h.homeTeam} ${h.homeScore}-${h.awayScore} ${h.awayTeam}${h.competition ? ` [${h.competition}]` : ""}`);
    }
  }

  if (odds) {
    lines.push("");
    lines.push(`COTES (${odds.bookmaker}) : ${JSON.stringify(odds.values)}`);
  }

  lines.push("");
  lines.push("SCHÉMA DE SORTIE (JSON strict, aucun texte autour) :");
  lines.push("{");
  lines.push('  "predictionType": "match_winner" | "over_under" | "both_score" | "double_chance" | "asian_handicap" | "exact_score",');
  lines.push('  "predictedOutcome": string,');
  lines.push('  "confidenceScore": number,        // 0-100');
  lines.push('  "reasoning": string,              // FR, 2-3 phrases');
  lines.push('  "keyFactors": string[],           // 3-5 items courts');
  lines.push('  "riskLevel": "low" | "medium" | "high",');
  lines.push('  "suggestedOdds": number | null,');
  lines.push('  "alternativeBets": [');
  lines.push('    { "predictionType": ..., "predictedOutcome": ..., "confidence": number, "odds": number }');
  lines.push('  ]                                 // 0-2 paris alternatifs');
  lines.push("}");

  return lines.join("\n");
}
