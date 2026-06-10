# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

AuPair A.EU — Première plateforme mondiale dédiée aux au pairs africains. Mise en relation de jeunes africains avec des familles d'accueil en Europe et en Amérique.

## Stack

- **Framework**: Next.js 16.1.6 (App Router) + React 19, TypeScript strict
- **UI**: Tailwind CSS 4 + Radix UI primitives + Lucide React icons
- **ORM**: Prisma 7 + `@prisma/adapter-pg`
- **Database**: PostgreSQL (Supabase in prod)
- **Auth**: NextAuth.js v5 (beta) — Google + Facebook OAuth + credentials, JWT strategy
- **Hosting**: Vercel

Not yet integrated: Supabase Realtime (messaging), Stripe + CinetPay (payments), Resend (emails), Supabase Storage (photo uploads).

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # ESLint
npx prisma generate  # Regenerate client after schema changes
npx prisma db push   # Apply schema to database (no migration file)
npx prisma studio    # GUI for database
npx playwright test  # E2E tests
npm run db:seed      # Create/update the admin account from ADMIN_* env vars
```

`postinstall` runs `prisma generate` automatically on `npm install`. `predev` runs `prisma/seed.ts` automatically before `npm run dev`, which upserts an `ADMIN` user from `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` (no-op if `ADMIN_EMAIL`/`ADMIN_PASSWORD` are unset).

## Critical: Prisma 7 differences from v5/v6

- `schema.prisma` has **no `url`** in the datasource block — the URL lives in `prisma.config.ts`
- Import the client from `@/generated/prisma/client`, **not** `@prisma/client`
- The `PrismaPg` adapter must be passed on instantiation: see `src/lib/prisma.ts` for the singleton pattern
- Client output directory: `src/generated/prisma/` (set in schema generator block)

## Critical: Next.js App Router `"use client"` + metadata

- Pages that pass React components (e.g. Lucide icons) to Client Components via props **must** declare `"use client"`
- Pages with `"use client"` **cannot** export `metadata` — split into a Server Component wrapper for metadata + a Client Component for the interactive page

## Authentication architecture

`src/lib/auth.ts` exports `{ handlers, auth, signIn, signOut }` from NextAuth.

The session JWT is extended with `id` and `role` fields. Type augmentations are in `src/types/next-auth.d.ts`.

Existing API routes:
- `POST /api/auth/register` — creates User + AuPairProfile or FamilyProfile in a single nested Prisma write. Profile fields not collected at registration are filled later in the dashboard.
- `/api/auth/[...nextauth]` — NextAuth handler

Auth pages: `signIn` → `/connexion`, `error` → `/connexion`.

## User roles and business rules

| Role | Access |
|---|---|
| `AU_PAIR` | Requires 32€/30-day subscription to use messaging |
| `FAMILLE` | Free, unlimited access |
| `AGENCE` | — |
| `ADMIN` | Back-office at `/admin` |

Profile status lifecycle: `PENDING → ACTIVE → HIDDEN / SUSPENDED / DELETED`

## Design system

- Primary: `#E87722` (orange), Secondary: `#1A1A2E` (dark blue)
- Accent background: `#FFF3E0`, Page backgrounds: `#FFFFFF` / `#F5F5F5`
- Font: Inter (Google Fonts)
- UI primitives: `src/components/ui/` (Button, Badge, Card)

## Layout system

- `PublicLayoutWrapper` (`src/components/layout/PublicLayoutWrapper.tsx`) — wraps the root layout; conditionally renders `Navbar` + `Footer`
- `DashboardLayout` — sidebar layout for `/dashboard/*`
- `AdminLayout` — sidebar layout for `/admin/*`

## Key constants

`src/lib/constants.ts` — origin countries, host countries, languages list, subscription price (`SUBSCRIPTION_PRICE_EUR = 32`, `SUBSCRIPTION_PRICE_XOF = 20800`, `SUBSCRIPTION_DAYS = 30`), education levels, duration options.

## Environment variables

All required keys are in `.env.local`. Required:

```
DATABASE_URL
NEXTAUTH_URL / NEXTAUTH_SECRET
GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET
FACEBOOK_CLIENT_ID / FACEBOOK_CLIENT_SECRET
STRIPE_SECRET_KEY / NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY / STRIPE_WEBHOOK_SECRET
CINETPAY_API_KEY / CINETPAY_SITE_ID
RESEND_API_KEY / RESEND_FROM_EMAIL
NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_APP_URL
ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NAME (optional — seeds an ADMIN account on `npm run dev`)
```
