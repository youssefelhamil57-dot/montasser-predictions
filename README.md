# AffiliateAI

Site public de pronostics sportifs propulsés par IA. Style SoFascore : sidebar
des sports, matchs groupés par compétition, pronostic + score de confiance + cote
par ligne, bouton "Parier sur 1xBet" qui ouvre ton lien affilié 1xBet.

**Pas d'auth, pas de compte, pas de gamification.** L'utilisateur arrive → voit
le feed → clique sur "Parier" → est redirigé vers 1xBet. C'est tout.

## Stack

- **Web** : Next.js 14 (App Router) · TypeScript strict · Tailwind · Radix
- **BDD** : Supabase Postgres (lecture publique sur `predictions`, écritures via service role)
- **IA** : Anthropic Claude pour générer les pronostics
- **Sports data** : API-Football (avec fallback mock)
- **Tests** : Vitest

## Repo layout

```
affiliate/
├── apps/web/                # Next.js app (un seul build)
├── packages/
│   ├── database/migrations/ # SQL Supabase (6 fichiers, ordre strict)
│   └── shared/src/          # Types partagés (PublicPrediction, etc.)
├── DEPLOYMENT.md            # Guide Vercel + Supabase
└── package.json             # Scripts racine
```

## Pages

| Route | Quoi |
|---|---|
| `/` | Le feed (page principale) — filtres date + sport |
| `/?sport=football&date=tomorrow` | Feed filtré |
| `/legal/terms` | CGU |
| `/legal/privacy` | Politique de confidentialité |
| `/legal/responsible-gambling` | Jeu responsable + helplines |
| `GET /api/predictions` | JSON public — paramètres `sport`, `league`, `date`, `minConfidence`, `featured`, `page`, `limit` |
| `GET /api/cron/generate-predictions` | Cron Vercel (toutes les 2h) qui appelle Claude pour générer de nouveaux pronostics |
| `GET /api/health` | Probe d'uptime |

## Quick start

```bash
npm run install:all

cp apps/web/.env.local.example apps/web/.env.local
# remplis NEXT_PUBLIC_BETTING_URL avec ton lien 1xBet
# remplis NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY
# remplis ANTHROPIC_API_KEY pour activer la génération IA

# applique les 6 migrations dans l'ordre (voir packages/database/README.md)

npm run dev
# → http://localhost:3000
```

**Sans Supabase configuré** : le feed render avec **8 pronostics mock**
(Real–City, Arsenal–Chelsea, Barça–Atlético, PSG–OM, Alcaraz–Sinner, etc.) en
mode dev pour voir le visuel.

## Scripts

| Script | Action |
|---|---|
| `npm run dev` | Démarre le dev server |
| `npm run build` | Build production |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest |
| `npm run lint` | ESLint |

## Comment générer de vrais pronostics

1. Crée un projet Supabase + applique les 6 migrations (`0001` → `0006`)
2. Récupère une clé Anthropic sur <https://console.anthropic.com> ($5 de crédit gratuit)
3. Mets ces 2 clés + ton URL Supabase dans `.env.local`
4. `npm run dev`
5. Dans un autre terminal : `curl http://localhost:3000/api/cron/generate-predictions`
6. Recharge http://localhost:3000 → tes pronostics IA s'affichent

Sans `API_FOOTBALL_KEY`, l'IA tourne sur 3 matchs mock (Real–City, Arsenal–Chelsea, Barça–Atlético).
Avec la clé, l'IA tourne sur les **vrais matchs des 48h à venir** (max 20 par run, ~50¢ par run).

## Déploiement

Voir [DEPLOYMENT.md](DEPLOYMENT.md). TL;DR : Vercel, root dir `apps/web`, env
vars depuis `.env.local.example`, le cron `generate-predictions` est déclaré
dans `vercel.json` et se déclenche automatiquement toutes les 2h (Pro plan)
ou quotidiennement (Hobby).

## Conformité

- 1xBet est **restreint ou interdit** en France, UK, Pays-Bas et plusieurs
  autres juridictions. Vérifie la légalité dans ton marché cible.
- Le footer affiche un avertissement 18+ et un lien vers
  [/legal/responsible-gambling](apps/web/app/legal/responsible-gambling/page.tsx)
  avec les numéros d'écoute (Joueurs Info Service, SOS Joueurs, BeGambleAware).
- Aucune donnée personnelle collectée (site public).
