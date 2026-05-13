import "server-only";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import type { Database } from "@/lib/db/types";

/**
 * Service-role Supabase client. Bypasses RLS. Server-only.
 * Use for: webhook ingestion, cron aggregations, admin tooling, cross-user reads.
 *
 * NEVER import this from a Client Component or expose it through a public API route
 * without authorization checks.
 */
let cached: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabaseAdmin() {
  if (!cached) {
    cached = createClient<Database>(
      env.public.NEXT_PUBLIC_SUPABASE_URL,
      env.server.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: { autoRefreshToken: false, persistSession: false },
        global: { headers: { "X-Client-Info": "montasser-admin" } },
      },
    );
  }
  return cached;
}
