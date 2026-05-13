-- AffiliateAI Pro — Seed data
-- Idempotent: safe to re-run.

-- ---------------------------------------------------------------------------
-- Badges catalogue
-- ---------------------------------------------------------------------------
insert into public.badges (slug, name, description, icon, color, points_reward, condition_type, condition_value) values
  ('first_prediction',  'Premier pronostic',  'Consulter sa toute première prédiction.',                 'sparkles',     'indigo',  10,  'volume',    1),
  ('streak_3',          'En forme',           'Consulter des prédictions 3 jours d''affilée.',           'flame',        'amber',   25,  'streak',    3),
  ('streak_7',          'Semaine parfaite',   '7 jours consécutifs sur la plateforme.',                  'flame',        'orange',  75,  'streak',    7),
  ('streak_30',         'Marathonien',        '30 jours d''affilée — discipline absolue.',               'medal',        'rose',    300, 'streak',    30),
  ('accuracy_60',       'Analyste affûté',    '60% de précision sur au moins 20 prédictions.',           'target',       'emerald', 100, 'accuracy',  60),
  ('accuracy_70',       'Analyste expert',    '70% de précision sur 20+ prédictions.',                   'target',       'emerald', 250, 'accuracy',  70),
  ('accuracy_80',       'Oracle',             '80% de précision sur 50+ prédictions.',                   'crown',        'amber',   1000,'accuracy',  80),
  ('volume_50',         'Vétéran',            '50 prédictions consultées.',                              'chart-bar',    'indigo',  50,  'volume',    50),
  ('volume_200',        'Centurion',          '200 prédictions consultées.',                             'chart-bar',    'violet',  200, 'volume',    200),
  ('volume_1000',       'Légende',            '1000 prédictions consultées.',                            'trophy',       'gold',    1000,'volume',    1000),
  ('top_100',           'Top 100',            'Entrer dans le top 100 du classement points.',            'star',         'amber',   150, 'rank',      100),
  ('top_10',            'Top 10',             'Top 10 du classement points.',                            'star',         'orange',  500, 'rank',      10),
  ('top_1',             'Numéro 1',           'Première place du classement points.',                    'crown',        'gold',    2000,'rank',      1),
  ('first_referral',    'Ambassadeur',        'Premier filleul recruté.',                                'users',        'sky',     50,  'referral',  1),
  ('referrals_10',      'Mentor',             '10 filleuls actifs.',                                     'users',        'sky',     300, 'referral',  10),
  ('referrals_50',      'Architecte',         '50 filleuls — tu construis un empire.',                   'building',     'violet',  1500,'referral',  50),
  ('first_revenue',     'Premier euro',       'Première commission générée.',                            'coins',        'emerald', 100, 'revenue',   1),
  ('revenue_100',       'Cent balles',        '100€ de commissions cumulées.',                           'coins',        'emerald', 250, 'revenue',   100),
  ('revenue_1000',      'Affilié pro',        '1 000€ de commissions cumulées.',                         'coins',        'gold',    1000,'revenue',   1000),
  ('revenue_10000',     'Whale',              '10 000€ de commissions cumulées.',                        'gem',          'gold',    5000,'revenue',   10000)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  color = excluded.color,
  points_reward = excluded.points_reward,
  condition_type = excluded.condition_type,
  condition_value = excluded.condition_value;

-- ---------------------------------------------------------------------------
-- Sample predictions (next 48h) — purely illustrative, replace via cron
-- ---------------------------------------------------------------------------
insert into public.predictions (
  sport, league, match_id, home_team, away_team, match_date,
  prediction_type, predicted_outcome, confidence_score,
  ai_reasoning, key_factors, odds_suggested, risk_level,
  is_premium, is_featured, model_version
) values
  ('football', 'Champions League', 'sample-cl-001',
   'Real Madrid', 'Manchester City', now() + interval '1 day',
   'match_winner', 'HOME', 72.5,
   'Real Madrid joue à domicile et reste sur 4 victoires en 5 matchs. City a perdu 2 défenseurs sur blessure.',
   array['Forme récente Real 4V/1N','Avantage Bernabéu','Blessures défensives City','H2H favorable Real'],
   1.95, 'medium',
   true, true, 'v1'),

  ('football', 'Premier League', 'sample-pl-001',
   'Arsenal', 'Chelsea', now() + interval '2 days',
   'match_winner', 'HOME', 68.0,
   'Arsenal domine ses derbies londoniens à l''Emirates et présente une attaque en feu.',
   array['Forme Arsenal 5V à domicile','Stats xG supérieures','Chelsea fragile défensivement'],
   1.85, 'medium',
   true, false, 'v1'),

  ('football', 'La Liga', 'sample-ll-001',
   'FC Barcelona', 'Atlético Madrid', now() + interval '1 day' + interval '3 hours',
   'over_under', 'OVER', 64.2,
   'Les deux équipes marquent souvent (BTTS 70% sur les 10 derniers H2H). Total >2.5 probable.',
   array['Moyenne buts élevée','BTTS 70%','Attaques en forme'],
   1.80, 'medium',
   false, false, 'v1'),

  ('tennis', 'ATP Masters 1000', 'sample-tn-001',
   'Carlos Alcaraz', 'Jannik Sinner', now() + interval '2 days' + interval '5 hours',
   'match_winner', 'AWAY', 55.0,
   'Match très serré. Sinner légèrement favori sur surface dure rapide selon notre modèle.',
   array['H2H 50/50','Surface favorable Sinner','Forme récente équivalente'],
   2.05, 'high',
   true, false, 'v1'),

  ('basketball', 'NBA', 'sample-nba-001',
   'Boston Celtics', 'Los Angeles Lakers', now() + interval '12 hours',
   'match_winner', 'HOME', 78.5,
   'Boston à domicile reste invaincu sur ses 8 derniers matchs. Différentiel net rating massif.',
   array['Net rating #1 NBA','Invincibilité domicile','Lakers fatigués (back-to-back)'],
   1.55, 'low',
   false, true, 'v1')
on conflict (match_id, prediction_type, model_version) do nothing;
