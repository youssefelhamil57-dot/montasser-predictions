# Deployment guide

This walks you from a fresh clone to a live AffiliateAI deployment on
Vercel + Supabase. Plan ~15 minutes (no auth setup needed — it's a public site).

## 1. Supabase project

1. Go to <https://app.supabase.com> → **New project**.
2. **SQL Editor → New Query** : paste each migration **in order** and run.
   - `packages/database/migrations/0001_initial_schema.sql`
   - `packages/database/migrations/0002_rls_policies.sql`
   - `packages/database/migrations/0003_seed.sql`
   - `packages/database/migrations/0004_shortcodes_and_helpers.sql`
   - `packages/database/migrations/0005_remove_affiliate.sql`
   - `packages/database/migrations/0006_public_only_strip_auth.sql`
3. **Project Settings → API** : copy these two values.
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **service_role (secret)** → `SUPABASE_SERVICE_ROLE_KEY`

> No Auth providers needed — the site is fully public and only reads
> `public.predictions` server-side via the service role key.

## 2. Your 1xBet affiliate link

Get your unique affiliate URL from your 1xBet Partners dashboard. Paste it
into `NEXT_PUBLIC_BETTING_URL`. Every "Parier sur 1xBet" button in the feed
opens this URL in a new tab. Tracking + commissions + payouts are entirely
on 1xBet's side.

## 3. External API keys

| Service | Variable | Where |
|---|---|---|
| Anthropic Claude | `ANTHROPIC_API_KEY` | <https://console.anthropic.com> → API Keys |
| API-Football | `API_FOOTBALL_KEY` | <https://www.api-football.com> → Dashboard (free tier: 100 req/day) |
| Cron auth | `CRON_SECRET` | `openssl rand -hex 32` |

Without `ANTHROPIC_API_KEY`, `/api/cron/generate-predictions` returns 500.
Without `API_FOOTBALL_KEY`, the sports aggregator falls back to 3 mock fixtures.

## 4. Vercel deployment

1. Import the GitHub repo into Vercel.
2. **Root Directory** : `apps/web`.
3. **Environment Variables** : add every key from `apps/web/.env.local.example`.
   Mark `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, `CRON_SECRET` as **secret**.
4. Deploy.
5. After the first deploy, set `NEXT_PUBLIC_APP_URL` to the production URL.
6. **Cron** : Vercel picks up `vercel.json` automatically.
   - `/api/cron/generate-predictions` runs every 2h (Pro plan) or daily (Hobby).

## 5. Custom domain (optional)

Vercel → **Settings → Domains** → add your domain. Update `NEXT_PUBLIC_APP_URL`.

## 6. Monitoring

- **Health endpoint** : `GET /api/health` returns 200 (or 503 if Supabase is
  unreachable). Point an uptime monitor at it.
- **Logs** : Vercel → Project → **Logs**. Structured JSON logger.
- **Errors** : `app/error.tsx` has a TODO for Sentry — wire it when needed.

## 7. Going-live checklist

- [ ] All 6 migrations applied in order
- [ ] `NEXT_PUBLIC_APP_URL` matches the live domain
- [ ] `NEXT_PUBLIC_BETTING_URL` set to your 1xBet affiliate link
- [ ] Legal pages reviewed by counsel (current text is a draft)
- [ ] Cron job visible in Vercel Cron Jobs tab
- [ ] First cron run produced predictions (check Supabase Table Editor → `predictions`)
- [ ] Uptime monitor pointed at `/api/health`
- [ ] Verified that "Parier sur 1xBet" opens your affiliate URL in a new tab

## 8. Rolling updates

- Run `npm run typecheck` and `npm test` before pushing.
- Vercel auto-deploys on push to `main`. Use preview deployments for PRs.
- Database migrations are manual: create `packages/database/migrations/0007_...sql`
  and apply via SQL Editor **before** deploying the code that depends on it.
