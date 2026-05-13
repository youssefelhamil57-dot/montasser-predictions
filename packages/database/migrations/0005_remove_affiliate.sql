-- AffiliateAI Pro — scope reduction: 1xBet affiliate tracking is now handled
-- externally on 1xBet's own partner dashboard. The app keeps only the
-- predictions + gamification surface. This migration tears down the
-- affiliate-tracking schema.
--
-- Apply AFTER 0001..0004. Safe to re-run (uses IF EXISTS).

-- ---------------------------------------------------------------------------
-- 1) Drop helper RPCs (they reference tables we're about to drop)
-- ---------------------------------------------------------------------------
drop function if exists public.upsert_daily_snapshot(uuid, date);
drop function if exists public.affiliate_active_players(uuid);
drop function if exists public.bump_shortcode_click(text);
drop function if exists public.bump_prediction_bet_click(uuid);
-- bump_prediction_view stays — still useful for the public feed

-- ---------------------------------------------------------------------------
-- 2) Drop affiliate-only tables
-- ---------------------------------------------------------------------------
drop table if exists public.link_shortcodes cascade;
drop table if exists public.affiliate_revenue_snapshots cascade;
drop table if exists public.affiliate_conversions cascade;

-- ---------------------------------------------------------------------------
-- 3) Drop affiliate-only columns on profiles
-- ---------------------------------------------------------------------------
-- These were never read without the affiliate flow, safe to drop.
alter table public.profiles drop column if exists affiliate_id;
alter table public.profiles drop column if exists affiliate_link;
alter table public.profiles drop column if exists referral_code;
alter table public.profiles drop column if exists referred_by;

-- ---------------------------------------------------------------------------
-- 4) Remove badges that no longer make sense (referral + revenue)
-- ---------------------------------------------------------------------------
delete from public.badges
 where slug in (
   'first_referral', 'referrals_10', 'referrals_50',
   'first_revenue',  'revenue_100',  'revenue_1000', 'revenue_10000'
 );

-- ---------------------------------------------------------------------------
-- 5) Cleanup: drop index that referenced the dropped column
-- ---------------------------------------------------------------------------
drop index if exists public.profiles_referral_code_idx;
