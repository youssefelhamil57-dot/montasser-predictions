import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Anton } from "next/font/google";
import { env } from "@/lib/env";
import "./globals.css";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

/** Display font for the Gotham-noir headings + brand wordmark. */
const display = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(env.public.NEXT_PUBLIC_APP_URL),
  title: {
    default: "Montasser — Pronostics sportifs",
    template: "%s · Montasser",
  },
  description:
    "Pronostics sportifs Montasser propulsés par Claude. Score de confiance, reasoning détaillé, lien direct vers 1xBet.",
  applicationName: "Montasser",
  authors: [{ name: "Montasser" }],
  keywords: ["pronostics sportifs", "Montasser", "1xBet", "football", "tennis", "basketball"],
  openGraph: {
    type: "website",
    title: "Montasser — Pronostics sportifs",
    description: "Pronostics Montasser, mis à jour en continu.",
    siteName: "Montasser",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [{ media: "(prefers-color-scheme: dark)", color: "#0a0c12" }],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="dark" suppressHydrationWarning>
      <body className={`${sans.variable} ${mono.variable} ${display.variable} font-sans antialiased min-h-svh`}>
        {children}
      </body>
    </html>
  );
}
