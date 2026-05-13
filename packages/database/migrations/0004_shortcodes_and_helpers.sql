-- AffiliateAI Pro — shortcodes + helper RPCs for Phase 2 tracking & aggregation.

-- ---------------------------------------------------------------------------
-- link_shortcodes : opaque short identifiers that resolve to (affiliate, source, prediction, campaign)
-- ---------------------------------------------------------------------------
create table public.link_shortcodes (
  code text primary key,                              -- url-safe, 8–12 chars
  affiliate_id uuid not null references public.profiles(id) on delete cascade,

  source text not null check (source in ('web','telegram','instagram','tiktok','email','direct','qr')),
  medium text,
  campaign text,
  prediction_id uuid references public.predictions(id) on delete set null,

  click_count integer default 0 not null,
  last_clicked_at timestamptz,

  created_at timestamptz default now() not null
);

create index link_shortcodes_affiliate_idx on public.link_shortcodes(affiliate_id, created_at desc);

alter table public.link_shortcodes enable row level security;

-- Affiliates can list / inspect their own shortcodes
create policy "shortcodes_read_own"
  on public.link_shortcodes for select
  using (auth.uid() = affiliate_id);

-- Affiliates can create their own shortcodes (capped via API rate-limit)
create policy "shortcodes_insert_own"
  on public.link_shortcodes for insert
  with check (auth.uid() = affiliate_id);

-- Affiliates can delete their own shortcodes (cleanup)
create policy "shortcodes_delete_own"
  on public.link_shortcodes for delete
  using (auth.uid() = affiliate_id);

-- ---------------------------------------------------------------------------
-- Atomic click increment + last_clicked_at (called by the click handler)
-- ---------------------------------------------------------------------------
create or replace function public.bump_shortcode_click(p_code text) returns void
language sql security definer set search_path = public as $$
  update public.link_shortcodes
     set click_count = click_count + 1,
         last_clicked_at = now()
   where code = p_code;
$$;

-- ---------------------------------------------------------------------------
-- Atomic prediction view + click counters
-- ---------------------------------------------------------------------------
create or replace function public.bump_prediction_view(p_id uuid) returns void
language sql security definer set search_path = public as $$
  update public.predictions
     set views_count = views_count + 1
   where id = p_id;
$$;

create or replace function public.bump_prediction_bet_click(p_id uuid) returns void
language sql security definer set search_path = public as $$
  update public.predictions
     set clicks_to_bet = clicks_to_bet + 1
   where id = p_id;
$$;

-- ---------------------------------------------------------------------------
-- Rolling active-player count for an affiliate over the trailing 30 days.
-- Used by the commission tier calculator.
-- ---------------------------------------------------------------------------
create or replace function public.affiliate_active_players(p_affiliate_id uuid)
returns integer language sql stable security definer set search_path = public as $$
  select count(distinct player_ref)::int
    from public.affiliate_conversions
   where affiliate_id = p_affiliate_id
     and player_ref is not null
     and event_type in ('first_deposit','recurring_deposit')
     and created_at >= now() - interval '30 days'
     and status in ('confirmed','paid');
$$;

-- ---------------------------------------------------------------------------
-- Atomic daily snapshot upsert. Called by the aggregation cron.
-- ---------------------------------------------------------------------------
create or replace function public.upsert_daily_snapshot(
  p_affiliate_id uuid,
  p_period_date date
) returns void language plpgsql security definer set search_path = public as $$
declare
  v_clicks int;
  v_registrations int;
  v_first_deposits int;
  v_total_deposits numeric(10,2);
  v_net_revenue numeric(10,2);
  v_commission numeric(10,2);
  v_active_players int;
begin
  select
    count(*) filter (where event_type = 'click'),
    count(*) filter (where event_type = 'registration' and status in ('confirmed','paid')),
    count(*) filter (where event_type = 'first_deposit' and status in ('confirmed','paid')),
    coalesce(sum(deposit_amount) filter (where event_type in ('first_deposit','recurring_deposit') and status in ('confirmed','paid')), 0),
    coalesce(sum(net_revenue)     filter (where status in ('confirmed','paid')), 0),
    coalesce(sum(commission_amount) filter (where status in ('confirmed','paid')), 0),
    count(distinct player_ref) filter (where event_type in ('first_deposit','recurring_deposit') and status in ('confirmed','paid') and player_ref is not null)
  into v_clicks, v_registrations, v_first_deposits, v_total_deposits, v_net_revenue, v_commission, v_active_players
  from public.affiliate_conversions
  where affiliate_id = p_affiliate_id
    and created_at >= p_period_date::timestamptz
    and created_at <  (p_period_date + interval '1 day')::timestamptz;

  insert into public.affiliate_revenue_snapshots (
    affiliate_id, period_date, period_type,
    clicks, registrations, first_deposits,
    total_deposits, net_revenue, commission_earned, active_players
  ) values (
    p_affiliate_id, p_period_date, 'daily',
    v_clicks, v_registrations, v_first_deposits,
    v_total_deposits, v_net_revenue, v_commission, v_active_players
  )
  on conflict (affiliate_id, period_date, period_type) do update set
    clicks = excluded.clicks,
    registrations = excluded.registrations,
    first_deposits = excluded.first_deposits,
    total_deposits = excluded.total_deposits,
    net_revenue = excluded.net_revenue,
    commission_earned = excluded.commission_earned,
    active_players = excluded.active_players,
    updated_at = now();
end;
$$;
