# `@affiliateai/database` — schema & migrations

Postgres schema for AffiliateAI Pro, designed for Supabase. All tables use Row
Level Security; the service-role key bypasses RLS for webhooks and cron jobs.

## Files

| File | Purpose |
|---|---|
| `migrations/0001_initial_schema.sql` | Tables, indexes, triggers, `auth.users` hook, `public.leaderboard` view. |
| `migrations/0002_rls_policies.sql`   | RLS policies. Run **after** `0001`. |
| `migrations/0003_seed.sql`           | Badge catalogue + 5 sample predictions. Idempotent. |

## How to apply

### Option A — Supabase Cloud (recommended for development)

1. Create a project at <https://app.supabase.com>.
2. Open **SQL Editor → New Query**.
3. Paste `0001_initial_schema.sql`, run.
4. Repeat for `0002_rls_policies.sql`, then `0003_seed.sql`.

### Option B — Supabase CLI

```bash
# install
npm i -g supabase
supabase login
supabase link --project-ref YOUR_PROJECT_REF

# apply each migration in order
supabase db push --file migrations/0001_initial_schema.sql
supabase db push --file migrations/0002_rls_policies.sql
supabase db push --file migrations/0003_seed.sql
```

### Option C — local Postgres

```bash
psql "$DATABASE_URL" -f migrations/0001_initial_schema.sql
psql "$DATABASE_URL" -f migrations/0002_rls_policies.sql
psql "$DATABASE_URL" -f migrations/0003_seed.sql
```

> Note: `0001` assumes Supabase's `auth.users` table exists (the `auth` schema
> is created by Supabase, not by this migration). For plain Postgres, you'd
> need to stub `auth.users` and `auth.uid()` first.

## After applying

1. In Supabase Dashboard → **Auth → Providers**, enable Email (magic link) and
   optionally Google OAuth (you'll need a Google Cloud OAuth client).
2. Set the **Site URL** to `http://localhost:3000` for dev and your prod
   domain for prod. Add `http://localhost:3000/auth/callback` to the
   **Redirect URLs** allowlist.
3. Copy the project URL + anon key + service-role key into
   `apps/web/.env.local`.

## Modifying the schema

If you change SQL, also update `apps/web/lib/db/types.ts` (or wire
`supabase gen types typescript --project-id ... > apps/web/lib/db/types.ts`
to regenerate automatically).
