import { cn } from "@/lib/utils";

interface BatLogoProps {
  className?: string;
  /** Add a glowing bat-signal halo behind the logo. */
  glow?: boolean;
  decorative?: boolean;
  label?: string;
}

/**
 * Bat-signal oval emblem: yellow ellipse + black bat silhouette.
 *
 * NOTE: this is a generic bat-in-oval design, *not* a copy of the DC Comics
 * Batman trademark. If you want to use the official trademarked Batman logo
 * (at your own legal risk), drop a PNG/SVG at `apps/web/public/logo.png` and
 * swap the SVG below for `<img src="/logo.png" alt="..." />`.
 */
export function BatLogo({ className, glow = false, decorative = true, label }: BatLogoProps) {
  return (
    <svg
      viewBox="0 0 200 100"
      xmlns="http://www.w3.org/2000/svg"
      role={decorative ? "presentation" : "img"}
      aria-hidden={decorative}
      aria-label={!decorative ? label : undefined}
      className={cn(glow && "bat-glow", className)}
    >
      {/* Yellow oval with black outline */}
      <ellipse cx="100" cy="50" rx="96" ry="46" fill="#FBCD25" stroke="#0a0c12" strokeWidth="3" />
      {/* Bat silhouette */}
      <path
        fill="#0a0c12"
        d="M 100 22
           L 92 17 L 88 26 L 80 19 L 74 28
           L 62 23 L 55 31 L 42 27 L 32 35
           L 22 41 L 14 49
           L 26 50 L 36 56 L 46 61 L 54 66
           L 64 70 L 72 74 L 80 76 L 88 78 L 96 78
           L 100 84
           L 104 78 L 112 78 L 120 76 L 128 74
           L 136 70 L 146 66 L 154 61 L 164 56 L 174 50 L 186 49
           L 178 41 L 168 35 L 158 27 L 145 31 L 138 23
           L 126 28 L 120 19 L 112 26 L 108 17 Z"
      />
    </svg>
  );
}

/**
 * Brand wordmark: oval logo + MONTASSER. Used in headers, footers, OG.
 */
export function BrandMark({
  size = "md",
  glow = false,
  className,
}: {
  size?: "sm" | "md" | "lg";
  glow?: boolean;
  className?: string;
}) {
  const sizes = {
    sm: { logo: "h-6 w-auto", text: "text-base" },
    md: { logo: "h-8 w-auto", text: "text-lg" },
    lg: { logo: "h-10 w-auto", text: "text-2xl" },
  };
  return (
    <span className={cn("inline-flex items-center gap-2.5 font-display uppercase tracking-[0.18em] text-primary", className)}>
      <BatLogo className={cn(sizes[size].logo)} glow={glow} />
      <span className={cn("leading-none", sizes[size].text)}>Montasser</span>
    </span>
  );
}
