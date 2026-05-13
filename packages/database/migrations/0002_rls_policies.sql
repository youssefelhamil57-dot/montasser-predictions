-- AffiliateAI Pro — Row Level Security policies
-- Service role bypasses RLS, so absence of a policy below means client-side blocked.

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;

-- public read of profiles (needed for leaderboard / public stats)
create policy "profiles_read_all"
  on public.profiles for select
  using (true);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- No insert/delete policies: rows are created by the auth trigger,
-- and deleted via auth.users cascade.

-- ---------------------------------------------------------------------------
-- predictions
-- ---------------------------------------------------------------------------
alter table public.predictions enable row level security;

-- Anyone (incl. anon) can read predictions. The API layer masks
-- confidence_score for non-pro users; RLS just controls row visibility.
create policy "predictions_read_all"
  on public.predictions for select
  using (true);

-- writes go through service_role only

-- ---------------------------------------------------------------------------
-- user_predictions
-- ---------------------------------------------------------------------------
alter table public.user_predictions enable row level security;

create policy "user_predictions_read_own"
  on public.user_predictions for select
  using (auth.uid() = user_id);

create policy "user_predictions_insert_own"
  on public.user_predictions for insert
  with check (auth.uid() = user_id);

create policy "user_predictions_update_own"
  on public.user_predictions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "user_predictions_delete_own"
  on public.user_predictions for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- affiliate_conversions
-- ---------------------------------------------------------------------------
alter table public.affiliate_conversions enable row level security;

create policy "affiliate_conversions_read_own"
  on public.affiliate_conversions for select
  using (auth.uid() = affiliate_id);

-- insert/update done via service_role from webhook handler

-- ---------------------------------------------------------------------------
-- affiliate_revenue_snapshots
-- ---------------------------------------------------------------------------
alter table public.affiliate_revenue_snapshots enable row level security;

create policy "aff_snapshots_read_own"
  on public.affiliate_revenue_snapshots for select
  using (auth.uid() = affiliate_id);

-- writes via service_role (cron aggregation job)

-- ---------------------------------------------------------------------------
-- badges (public catalogue)
-- ---------------------------------------------------------------------------
alter table public.badges enable row level security;

create policy "badges_read_all"
  on public.badges for select
  using (true);

-- ---------------------------------------------------------------------------
-- user_badges (publicly visible — public profiles)
-- ---------------------------------------------------------------------------
alter table public.user_badges enable row level security;

create policy "user_badges_read_all"
  on public.user_badges for select
  using (true);

-- writes via service_role (gamification engine)

-- ---------------------------------------------------------------------------
-- telegram_subscribers (service_role only; user can read own link)
-- ---------------------------------------------------------------------------
alter table public.telegram_subscribers enable row level security;

create policy "telegram_subs_read_own"
  on public.telegram_subscribers for select
  using (auth.uid() = user_id);

-- all writes via service_role from the bot
