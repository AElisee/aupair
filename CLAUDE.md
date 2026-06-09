# CLAUDE.md — AuPair A.EU

## Vision
Première plateforme mondiale dédiée aux au pairs africains. Mise en relation de jeunes africains avec des familles d'accueil en Europe et en Amérique.

## Stack technique
- **Framework** : Next.js 16 (App Router) — TypeScript strict
- **UI** : Tailwind CSS + composants custom (`@/components/ui/`)
- **ORM** : Prisma 7 + adapter `@prisma/adapter-pg`
- **Base de données** : PostgreSQL (Supabase en prod)
- **Auth** : NextAuth.js v5 (Google + Facebook OAuth + credentials)
- **Messagerie** : Supabase Realtime (à intégrer)
- **Paiement** : Stripe (CB/PayPal) + CinetPay (Mobile Money) (à intégrer)
- **Emails** : Resend (à intégrer)
- **Hébergement** : Vercel

## Points d'attention Prisma 7
- Le `schema.prisma` N'a PAS de `url` dans le datasource (nouveau dans v7)
- L'URL est dans `prisma.config.ts` (datasource.url)
- Import du client : `@/generated/prisma/client` (pas `@prisma/client`)
- Utiliser `PrismaPg` adapter : `new PrismaPg({ connectionString: process.env.DATABASE_URL })`
- Après tout changement de schéma : `npx prisma generate` puis `npx prisma db push`

## Charte graphique
- **Couleur principale** : `#E87722` (orange)
- **Couleur secondaire** : `#1A1A2E` (bleu nuit)
- **Fond** : `#FFFFFF` / `#F5F5F5`
- **Accent** : `#FFF3E0` (orange très clair)
- **Police** : Inter (Google Fonts)
- **Icônes** : Lucide React

## Types d'utilisateurs
- `AU_PAIR` — Abonnement 32€/30 jours requis pour la messagerie
- `FAMILLE` — Inscription gratuite, accès illimité
- `AGENCE`
- `ADMIN`

## Règle critique Next.js App Router
- Les pages qui passent des composants React (ex: icônes Lucide) à des Client Components via props **doivent** avoir `"use client"`
- Les pages avec `"use client"` **ne peuvent pas** exporter `metadata`
- Séparés si besoin : créer un wrapper Server Component pour les metadata

---

## ÉTAT DU PROJET — 09/03/2026

### ✅ Implémenté et testé (22/22 pages)

#### Pages publiques
- `/` — Page d'accueil (Hero, Stats, Comment ça marche, Pays, Témoignages, Blog, CTA)
- `/devenir-au-pair` — Guide au pair avec avantages, conditions, stepper
- `/accueillir-un-au-pair` — Guide famille avec arguments, tâches, témoignage
- `/tarifs` — Cards 32€ au pair / 0€ famille, 3 modes paiement
- `/faq` — Accordéon par catégories (au pair, famille, paiement, sécurité)
- `/contact` — Formulaire + infos contact
- `/trouver-au-pair` — Annuaire avec filtres (pays, langue)
- `/trouver-famille` — Annuaire avec filtres (pays)
- `/blog` — Liste articles avec filtres catégories
- `/blog/[slug]` — Article individuel dynamique
- `/mentions-legales` — Infos légales SIRET, hébergeur, RGPD
- `/securite` — 6 standards de sécurité
- `/sitemap.xml` — Sitemap XML automatique (26 URLs)
- `/robots.txt` — Robots.txt (bloque /admin, /dashboard, /api)

#### Authentification
- `/connexion` — Email/password + Google + Facebook (UI)
- `/inscription` — Stepper 4 étapes (choix rôle → infos → profil → confirmation)

#### Dashboard au pair (`/dashboard/au-pair/...`)
- `/dashboard/au-pair` — KPIs, statut abonnement, familles suggérées
- `/dashboard/au-pair/profil` — Formulaire édition profil complet
- `/dashboard/au-pair/messages` — Chat UI avec conversations
- `/dashboard/au-pair/abonnement` — Jauge jours + 3 modes paiement

#### Dashboard famille (`/dashboard/famille/...`)
- `/dashboard/famille` — KPIs, au pairs suggérés

#### Back-office admin (`/admin/...`)
- `/admin` — KPIs temps réel, alertes modération, dernières inscriptions
- `/admin/utilisateurs` — Tableau filtrable avec actions (valider, masquer, supprimer)
- `/admin/moderation` — File de validation avec profils en attente
- `/admin/paiements` — Tableau paiements, KPIs financiers, export CSV

### 🚧 À implémenter (Phase suivante)

1. **Connexion BDD réelle** — Configurer `DATABASE_URL` Supabase et migrer
2. **NextAuth routes API** — `/api/auth/[...nextauth]/route.ts`
3. **API routes** — `/api/profils`, `/api/messages`, `/api/abonnement`
4. **Stripe + CinetPay** — Intégration paiement réel
5. **Resend emails** — Emails transactionnels (bienvenue, confirmation, rappels)
6. **Supabase Realtime** — Messagerie temps réel
7. **Upload photos** — Supabase Storage pour profils
8. **Dashboard famille complet** — Profil, messages, recherche
9. **Pages légales** — CGU, CGV, confidentialité, cookies (à compléter)
10. **Tests E2E** — Suite Playwright complète

---

## Structure des fichiers clés
```
src/
├── app/
│   ├── (pages publiques)/     → /devenir-au-pair, /tarifs, /faq, /contact...
│   ├── trouver-au-pair/       → Annuaire au pairs
│   ├── trouver-famille/       → Annuaire familles
│   ├── connexion/             → Login
│   ├── inscription/           → Register (stepper)
│   ├── dashboard/
│   │   ├── au-pair/           → Tableau de bord, profil, messages, abonnement
│   │   └── famille/           → Tableau de bord famille
│   ├── admin/                 → Back-office (users, moderation, paiements)
│   ├── blog/                  → Liste + [slug]
│   ├── sitemap.ts             → Sitemap XML auto
│   ├── robots.ts              → Robots.txt
│   └── layout.tsx             → Layout racine (Navbar + Footer)
├── components/
│   ├── ui/                    → Button, Badge, Card
│   ├── layout/
│   │   ├── Navbar.tsx         → Navbar sticky avec sélecteur FR/EN
│   │   ├── Footer.tsx         → Footer 4 colonnes
│   │   ├── DashboardLayout.tsx → Layout sidebar dashboard
│   │   └── AdminLayout.tsx    → Layout sidebar admin
│   └── home/                  → HeroSection, StatsSection, HowItWorks...
├── lib/
│   ├── prisma.ts              → Client Prisma (avec PrismaPg adapter)
│   ├── auth.ts                → NextAuth config
│   ├── utils.ts               → cn(), formatDate(), calculateAge()...
│   └── constants.ts           → Pays, langues, prix
├── generated/prisma/          → Client Prisma généré (ne pas éditer)
└── types/
    └── next-auth.d.ts         → Extension types NextAuth (role, id)
```

## Commandes utiles
```bash
# Développement
npm run dev

# Base de données
npx prisma generate          # Régénérer le client après changement schéma
npx prisma db push           # Appliquer le schéma à la BDD
npx prisma studio            # Interface graphique BDD

# Build & tests
npm run build                # Build production
npx playwright test          # Tests E2E

# Tests manuels Playwright (depuis le skill)
cd ~/.claude/plugins/cache/playwright-skill/playwright-skill/4.1.0/skills/playwright-skill
node run.js /tmp/mon-test.js
```

## Variables d'environnement requises
Voir `.env.local` — à compléter avec les vraies clés pour la prod.
