-- AffiliateAI Pro — auth removed. The site is now a public predictions feed.
-- Drop everything tied to users + gamification + telegram. The only thing
-- the app reads is `public.predictions`.
--
-- Apply AFTER 0001..0005. Safe to re-run (uses IF EXISTS).

-- 1) Drop the trigger that auto-created a profile on auth.users insert
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- 2) Drop the leaderboard view (depends on profiles)
drop view if exists public.leaderboard;

-- 3) Drop user-facing tables (cascade for FKs)
drop table if exists public.user_badges cascade;
drop table if exists public.badges cascade;
drop table if exists public.telegram_subscribers cascade;
drop table if exists public.user_predictions cascade;
drop table if exists public.profiles cascade;

-- 4) Drop the updated_at helper if nothing else uses it
-- (predictions doesn't have updated_at, so safe)
drop function if exists public.touch_updated_at() cascade;

-- 5) Drop the prediction-view-counter RPC and bet-click RPC are kept-or-removed:
-- We keep bump_prediction_view in case the feed wants to count impressions
-- later. Drop the redundant one.
-- (bump_prediction_bet_click and shortcode bump were already dropped in 0005.)

-- 6) Open up predictions reads to anon (the feed is public; no auth)
-- The existing RLS policy "predictions_read_all" already returns true, so anon
-- access works. No change needed here. The remaining write paths still go via
-- service-role, which bypasses RLS.
