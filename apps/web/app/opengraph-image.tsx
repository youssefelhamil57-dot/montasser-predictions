import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Montasser — Pronostics sportifs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Default OG image — Gotham-noir backdrop, bat silhouette, MONTASSER wordmark.
 * No external font loading: relies on system-default + heavy weight + tight
 * tracking to mimic the Anton display feel.
 */
export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          color: "#F8F4E8",
          background:
            "radial-gradient(ellipse at top, rgba(251,205,37,0.10), transparent 55%), radial-gradient(ellipse at bottom, #060709, #0a0c12 60%, #14171c)",
          fontFamily: "Impact, 'Arial Black', system-ui, sans-serif",
        }}
      >
        {/* Top row: bat + brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 32, fontWeight: 900, letterSpacing: 8, textTransform: "uppercase", color: "#FBCD25" }}>
          <svg viewBox="0 0 32 16" width="68" height="34" fill="#FBCD25" style={{ filter: "drop-shadow(0 0 20px rgba(251,205,37,0.45))" }}>
            <path d="M 16 2 L 14.5 0.5 L 13.5 3 L 12 1.5 L 10.5 4 L 8 2 L 6 5 L 2 3 L 0.5 6 L 3 9 L 6 8 L 9 11 L 12 9 L 14 12 L 16 10 L 18 12 L 20 9 L 23 11 L 26 8 L 29 9 L 31.5 6 L 30 3 L 26 5 L 24 2 L 21.5 4 L 20 1.5 L 18.5 3 L 17.5 0.5 Z" />
          </svg>
          <span>Montasser</span>
        </div>

        {/* Middle: headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontSize: 110,
              fontWeight: 900,
              lineHeight: 0.95,
              letterSpacing: 1,
              textTransform: "uppercase",
              color: "#F8F4E8",
            }}
          >
            Pronostics
          </div>
          <div
            style={{
              fontSize: 110,
              fontWeight: 900,
              lineHeight: 0.95,
              letterSpacing: 1,
              textTransform: "uppercase",
              color: "#FBCD25",
              textShadow: "0 0 40px rgba(251,205,37,0.35)",
            }}
          >
            Montasser
          </div>
          <div style={{ fontSize: 26, color: "rgba(248,244,232,0.7)", maxWidth: 900, lineHeight: 1.35, marginTop: 8, fontWeight: 500 }}>
            Score de confiance · groupés par compétition · lien direct vers 1xBet.
          </div>
        </div>

        {/* Bottom: meta row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", fontSize: 18, letterSpacing: 4, textTransform: "uppercase", color: "rgba(248,244,232,0.55)" }}>
          <div style={{ display: "flex", gap: 32 }}>
            <span>Football</span>
            <span>Tennis</span>
            <span>Basketball</span>
            <span>E-sport</span>
          </div>
          <div>18+ · Jouez responsable</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
