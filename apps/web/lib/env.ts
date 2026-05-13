import { z } from "zod";

/**
 * Validated environment access. Import from here instead of reading process.env
 * directly so missing/invalid values fail loudly at boot rather than at runtime.
 *
 * Auth has been removed — the only Supabase usage is server-side reads of the
 * `predictions` table via the service-role key (in cron + API routes).
 */

const optionalString = (min = 1) =>
  z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string().min(min).optional(),
  );

const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  // Supabase — service role used for reads (RLS allows anon read on predictions
  // already, but we use service role to avoid round-tripping a cookieless client).
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  // Claude API — required by the prediction generation cron
  ANTHROPIC_API_KEY: optionalString(),

  // Sports data — falls back to mocks when missing
  API_FOOTBALL_KEY: optionalString(),

  // Cron-route shared secret. In production, set this; in dev it's optional.
  CRON_SECRET: optionalString(16),

  // --- Site login (single user) ---
  AUTH_USERNAME: optionalString(),
  AUTH_PASSWORD: optionalString(),
  /** HMAC secret used to sign session cookies. Use `openssl rand -hex 32`. */
  AUTH_SECRET: optionalString(32),
});

const publicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  /**
   * Your 1xBet affiliate link from the 1xBet Partners dashboard.
   * Every "Parier sur 1xBet" CTA in the feed opens this URL in a new tab.
   * Tracking + commissions are handled on 1xBet's side.
   */
  NEXT_PUBLIC_BETTING_URL: z.string().url().default("https://1xbet.com/"),
});

type Server = z.infer<typeof serverSchema>;
type Public = z.infer<typeof publicSchema>;

const publicEnv: Public = publicSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_BETTING_URL: process.env.NEXT_PUBLIC_BETTING_URL,
});

let cachedServer: Server | null = null;
function getServer(): Server {
  if (typeof window !== "undefined") {
    throw new Error("env.server accessed from the browser — refusing to leak secrets.");
  }
  if (!cachedServer) {
    cachedServer = serverSchema.parse({
      NODE_ENV: process.env.NODE_ENV,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
      API_FOOTBALL_KEY: process.env.API_FOOTBALL_KEY,
      CRON_SECRET: process.env.CRON_SECRET,
      AUTH_USERNAME: process.env.AUTH_USERNAME,
      AUTH_PASSWORD: process.env.AUTH_PASSWORD,
      AUTH_SECRET: process.env.AUTH_SECRET,
    });
  }
  return cachedServer;
}

export const env = {
  public: publicEnv,
  get server() {
    return getServer();
  },
};
