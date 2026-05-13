-- AffiliateAI Pro — Initial schema
-- Run order: 0001_initial_schema.sql → 0002_rls_policies.sql → 0003_seed.sql
-- Apply via: supabase db push  (or paste into Supabase SQL editor)

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles : extends auth.users
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  avatar_url text,
  country text default 'MA',
  language text default 'fr' check (language in ('fr','en','ar')),

  plan text default 'free' check (plan in ('free','pro','white_label')),
  plan_expires_at timestamptz,

  -- gamification
  total_points integer default 0 not null,
  current_streak integer default 0 not null,
  longest_streak integer default 0 not null,
  predictions_made integer default 0 not null,
  correct_predictions integer default 0 not null,
  accuracy_rate numeric(5,2) default 0 not null,
  last_active_date date,

  -- affiliation
  affiliate_id text unique,
  affiliate_link text,
  referral_code text unique,
  referred_by uuid references public.profiles(id) on delete set null,

  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index profiles_referral_code_idx on public.profiles(referral_code);
create index profiles_plan_idx on public.profiles(plan) where plan <> 'free';
create index profiles_accuracy_idx on public.profiles(accuracy_rate desc) where predictions_made >= 10;

-- ---------------------------------------------------------------------------
-- predictions : AI-generated
-- ---------------------------------------------------------------------------
create table public.predictions (
  id uuid default gen_random_uuid() primary key,
  sport text not null,
  league text not null,
  match_id text not null,
  home_team text not null,
  away_team text not null,
  match_date timestamptz not null,

  prediction_type text not null,           -- match_winner | over_under | both_score | ...
  predicted_outcome text not null,         -- HOME | AWAY | DRAW | OVER | UNDER | YES | NO
  confidence_score numeric(4,1) not null check (confidence_score between 0 and 100),
  ai_reasoning text,
  key_factors text[],
  odds_suggested numeric(6,2),
  risk_level text check (risk_level in ('low','medium','high')),

  actual_outcome text,
  is_correct boolean,

  model_version text default 'v1' not null,
  data_sources jsonb,

  is_premium boolean default false not null,
  is_featured boolean default false not null,

  views_count integer default 0 not null,
  clicks_to_bet integer default 0 not null,

  created_at timestamptz default now() not null,
  unique (match_id, prediction_type, model_version)
);

create index predictions_sport_date_idx on public.predictions(sport, match_date desc);
create index predictions_open_confidence_idx on public.predictions(confidence_score desc) where is_correct is null;
create index predictions_featured_idx on public.predictions(match_date desc) where is_featured = true;
create index predictions_match_date_idx on public.predictions(match_date) where actual_outcome is null;

-- ---------------------------------------------------------------------------
-- user_predictions : interactions
-- ---------------------------------------------------------------------------
create table public.user_predictions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  prediction_id uuid references public.predictions(id) on delete cascade not null,
  action text not null check (action in ('viewed','saved','bet_clicked','shared')),
  created_at timestamptz default now() not null,
  unique (user_id, prediction_id, action)
);

create index user_predictions_user_idx on public.user_predictions(user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- affiliate_conversions : every click / signup / deposit from 1xBet webhook
-- ---------------------------------------------------------------------------
create table public.affiliate_conversions (
  id uuid default gen_random_uuid() primary key,
  affiliate_id uuid references public.profiles(id) on delete cascade not null,

  event_type text not null check (event_type in ('click','registration','first_deposit','recurring_deposit','chargeback')),

  player_ref text,
  player_country text,

  deposit_amount numeric(10,2),
  net_revenue numeric(10,2),
  commission_amount numeric(10,2),
  commission_rate numeric(5,2),

  source text,                   -- web | telegram | instagram | direct
  utm_source text,
  utm_medium text,
  utm_campaign text,
  prediction_id uuid references public.predictions(id) on delete set null,
  click_shortcode text,
  ip_hash text,
  user_agent text,

  status text default 'pending' not null check (status in ('pending','confirmed','paid','cancelled')),
  confirmed_at timestamptz,
  paid_at timestamptz,

  raw_webhook_data jsonb,
  created_at timestamptz default now() not null
);

create index aff_conv_affiliate_idx on public.affiliate_conversions(affiliate_id, created_at desc);
create index aff_conv_type_idx on public.affiliate_conversions(affiliate_id, event_type, status);
create index aff_conv_prediction_idx on public.affiliate_conversions(prediction_id) where prediction_id is not null;
create index aff_conv_player_ref_idx on public.affiliate_conversions(player_ref) where player_ref is not null;

-- ---------------------------------------------------------------------------
-- affiliate_revenue_snapshots : aggregated for dashboard speed
-- ---------------------------------------------------------------------------
create table public.affiliate_revenue_snapshots (
  id uuid default gen_random_uuid() primary key,
  affiliate_id uuid references public.profiles(id) on delete cascade not null,
  period_date date not null,
  period_type text default 'daily' not null check (period_type in ('daily','weekly','monthly')),

  clicks integer default 0 not null,
  registrations integer default 0 not null,
  first_deposits integer default 0 not null,
  total_deposits numeric(10,2) default 0 not null,
  net_revenue numeric(10,2) default 0 not null,
  commission_earned numeric(10,2) default 0 not null,
  active_players integer default 0 not null,

  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique (affiliate_id, period_date, period_type)
);

create index aff_snap_affiliate_date_idx on public.affiliate_revenue_snapshots(affiliate_id, period_date desc);

-- ---------------------------------------------------------------------------
-- badges : catalogue + user_badges : earned
-- ---------------------------------------------------------------------------
create table public.badges (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  name text not null,
  description text,
  icon text not null,
  color text default 'purple',
  points_reward integer default 0 not null,
  condition_type text,                  -- streak | accuracy | volume | referral | revenue
  condition_value integer,
  created_at timestamptz default now() not null
);

create table public.user_badges (
  user_id uuid references public.profiles(id) on delete cascade not null,
  badge_id uuid references public.badges(id) on delete cascade not null,
  earned_at timestamptz default now() not null,
  primary key (user_id, badge_id)
);

create index user_badges_user_idx on public.user_badges(user_id, earned_at desc);

-- ---------------------------------------------------------------------------
-- telegram_subscribers
-- ---------------------------------------------------------------------------
create table public.telegram_subscribers (
  id uuid default gen_random_uuid() primary key,
  telegram_id bigint unique not null,
  telegram_username text,
  first_name text,
  language_code text default 'fr',
  user_id uuid references public.profiles(id) on delete set null,
  affiliate_id uuid references public.profiles(id) on delete set null,
  is_active boolean default true not null,
  notifications_enabled boolean default true not null,
  sports_preferences text[] default array['football'],
  last_interaction_at timestamptz default now() not null,
  created_at timestamptz default now() not null
);

create index telegram_subs_user_idx on public.telegram_subscribers(user_id) where user_id is not null;
create index telegram_subs_affiliate_idx on public.telegram_subscribers(affiliate_id) where affiliate_id is not null;

-- ---------------------------------------------------------------------------
-- triggers : updated_at on profiles / snapshots
-- ---------------------------------------------------------------------------
create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch
  before update on public.profiles
  for each row execute function public.touch_updated_at();

create trigger snapshots_touch
  before update on public.affiliate_revenue_snapshots
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- on auth.users insert → create profile row with sensible defaults
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  base_username text;
  candidate text;
  suffix int := 0;
begin
  base_username := coalesce(
    new.raw_user_meta_data->>'username',
    split_part(new.email, '@', 1),
    'user'
  );
  -- normalise: lowercase, strip non-alnum
  base_username := lower(regexp_replace(base_username, '[^a-zA-Z0-9_]', '', 'g'));
  if length(base_username) < 3 then
    base_username := 'user' || substr(new.id::text, 1, 6);
  end if;

  candidate := base_username;
  while exists(select 1 from public.profiles where username = candidate) loop
    suffix := suffix + 1;
    candidate := base_username || suffix::text;
  end loop;

  insert into public.profiles (id, username, referral_code)
  values (
    new.id,
    candidate,
    upper(substr(encode(gen_random_bytes(6), 'hex'), 1, 8))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- helper view : public leaderboard (top by accuracy, gated by volume)
-- ---------------------------------------------------------------------------
create or replace view public.leaderboard as
select
  p.id,
  p.username,
  p.avatar_url,
  p.country,
  p.total_points,
  p.current_streak,
  p.accuracy_rate,
  p.predictions_made,
  p.correct_predictions,
  rank() over (order by p.total_points desc) as rank_by_points,
  -- Rank by accuracy, but only meaningful for profiles with >= 20 predictions.
  -- Users below the threshold get NULL ranks (pushed to the end via nulls last).
  rank() over (
    order by case when p.predictions_made >= 20 then p.accuracy_rate end desc nulls last
  ) as rank_by_accuracy
from public.profiles p
where p.predictions_made >= 5;
