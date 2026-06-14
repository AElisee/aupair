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

Not yet integrated: Supabase Realtime (messaging), Resend (emails), Supabase Storage (photo uploads). Stripe (card payments) and CinetPay (Mobile Money) are integrated and admin-configurable, see below.

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # ESLint
npx prisma generate  # Regenerate client after schema changes
npx prisma db push   # Apply schema to database (no migration file)
npx prisma studio    # GUI for database
npm run db:seed      # Create/update the admin account from ADMIN_* env vars
```

`@playwright/test` is a devDependency but no `playwright.config.ts` or test files exist yet — E2E testing is not set up.

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

`events.createUser` in `src/lib/auth.ts` — when a user signs in via OAuth for the first time, the Prisma adapter creates the `User` row but not a business profile; this hook auto-creates a `PENDING` `AuPairProfile` with placeholder fields (name split from the OAuth `name`, `dateOfBirth: 2000-01-01`, empty strings/arrays for required fields) so dashboard/profile routes don't break on a missing profile. Credentials login normalizes email via `.trim().toLowerCase()` (matches `prisma/seed.ts`).

## Routing & access control

`src/proxy.ts` is the Next.js 16 middleware (replaces `middleware.ts`), matched on `/dashboard/:path*`, `/admin/:path*`, `/connexion`. It decodes the NextAuth JWT via `getToken({ secret: process.env.AUTH_SECRET })` (Edge-compatible, no DB call):

- `AUTH_REQUIRED = ["/dashboard"]` — redirects to `/connexion?callbackUrl=...` if not authenticated
- `ADMIN_ONLY = ["/admin"]` — non-admins are silently redirected to their role's dashboard (no 403, avoids route enumeration)
- `GUEST_ONLY = ["/connexion"]` — authenticated users are redirected away to their dashboard

`src/lib/safe-redirect.ts` provides `getSafeCallbackUrl`, `getDefaultRedirectForRole` (role → `/admin` | `/dashboard/au-pair` | `/dashboard/famille` | `/`), and `resolvePostLoginRedirect`, all OWASP-hardened against open-redirect payloads. Used by both `proxy.ts` and the Navbar/login flow.

## API route patterns

- `/api/dashboard/{au-pair|famille}` (GET) — aggregates data for the dashboard home (profile completion %, stats, etc.) from the session user.
- `/api/profile/{au-pair|famille}` (GET/PUT) — full profile read/update. GET shapes the Prisma row into form-friendly fields (dates → `YYYY-MM-DD` strings, phone numbers split into country code + number via `splitPhone()`/`PHONE_COUNTRY_CODES`). PUT does the inverse and persists with `prisma.<model>.update()`.

All of these call `auth()` first and return `401` if `!session?.user?.id`.

## Admin back-office

`/admin/*` pages (`AdminLayout`, sidebar nav: Dashboard, Utilisateurs, Modération, Paiements, Analytics, Blog, FAQ, Tickets, Pays) are backed by `/api/admin/*` routes, all gated by `requireAdminSession()` (`src/lib/admin.ts`) which returns `null` (→ `403`) unless `session.user.role === "ADMIN"`:

- `/api/admin/dashboard` (GET) — KPIs (`totalUsers`, `signups30d`, `revenue30d`, `activeSubscriptions`, `pendingProfiles`), recent users, recent payments
- `/api/admin/users` (GET/PATCH) — combined AuPair + Family list; PATCH applies `action: "validate" | "hide" | "unhide" | "suspend" | "delete"` via `setProfileStatus()`
- `/api/admin/moderation` (GET/PATCH) — `PENDING` profiles sorted by waiting time; PATCH applies `action: "validate" | "reject"`
- `/api/admin/profile/[userId]` (GET, `?role=AU_PAIR|FAMILLE`) — full profile detail, rendered by `src/app/admin/profil/[userId]/page.tsx` (full-page view, opened in a new tab via the "eye" icon in `/admin/utilisateurs` and `/admin/moderation`)
- `/api/admin/countries` (GET/POST/PATCH/DELETE) — CRUD for the `Country` table, used by `/admin/pays`

`setProfileStatus()` (`src/lib/admin.ts`) sets `validatedAt`/`validatedBy` when transitioning a profile to `ACTIVE`.

Only `/admin`, `/admin/utilisateurs`, `/admin/moderation`, `/admin/paiements`, `/admin/pays` have pages; Analytics, Blog, FAQ, Tickets in the sidebar nav are not yet implemented. `/admin/paiements` still renders with hardcoded/mock data.

## Internationalization

`src/contexts/LanguageContext.tsx` provides `LanguageProvider` + `useLang()` returning `{ lang, setLang, t }`, where `t(fr, en)` returns the string for the current language (`"fr" | "en"`, persisted to `localStorage` under `aupair-lang`, defaults to `"fr"`). Wrapped around the app (alongside `SessionProvider`) in `PublicLayoutWrapper`. There is no `next-intl`-based routing despite it being a dependency.

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

## Countries (DB-backed)

Origin/host countries, flags, and WhatsApp dial codes live in the `Country` model (`type: ORIGIN | HOST`, unique on `name`), seeded from `DEFAULT_COUNTRIES` in `prisma/seed.ts` and editable via `/admin/pays` — they're **not** in `constants.ts`.

- `src/lib/countries.ts` — `getCountriesByType(type?)`, `getCountryFlagMap()` (name → emoji, used by admin pages), `splitPhoneNumber(phone, fallbackCountry, countries)` (splits a stored WhatsApp number into dial code + local number)
- `/api/countries` (GET, public) — returns `{ origin: CountryDTO[], host: CountryDTO[] }` (active only, `{ name, flag, dialCode }`)
- `src/hooks/useCountries.ts` — client hook fetching `/api/countries`, used by registration/profile forms and the admin profile page for country selects and flag lookups

## Key constants

`src/lib/constants.ts` — `LANGUAGES`, subscription price (`SUBSCRIPTION_PRICE_EUR = 32`, `SUBSCRIPTION_PRICE_XOF = 20800`, `SUBSCRIPTION_DAYS = 30`), `EDUCATION_LEVELS`, `DURATIONS`.

## Environment variables

All keys are in `.env` (not `.env.local`). Required:

```
DATABASE_URL
NEXTAUTH_URL / NEXTAUTH_SECRET
GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET
FACEBOOK_CLIENT_ID / FACEBOOK_CLIENT_SECRET
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (publishable key only — not currently used by any code, kept for a future Stripe Elements integration)
NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_APP_URL
ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NAME (optional — seeds an ADMIN account on `npm run dev`)
CRON_SECRET (optional — if set, `/api/cron/weekly-profile-views` requires `Authorization: Bearer ${CRON_SECRET}`)
```

### Email (Resend)

Resend credentials (`resendApiKey`, `emailFrom`) are **not** environment variables —
they're admin-configurable settings stored on `AppSettings` (`app_settings` table),
edited at `/admin/parametres/email` via `/api/admin/constants`. `src/lib/mail.ts`'s
`sendMail()` loads them from `getAppSettings()` on every call and logs a clear
`[mail]` error (never throws) if either is missing or Resend rejects the send.
See `docs/email-resend.md` for setup, local testing, and production deployment.

### Payments (Stripe)

`stripeSecretKey` and `stripeWebhookSecret` are **not** environment variables —
they're admin-configurable settings stored on `AppSettings` (`app_settings` table),
edited at `/admin/parametres/stripe` via `/api/admin/constants`. Both
`/api/payments/stripe/checkout` and `/api/webhooks/stripe` load them from
`getAppSettings()` on every request and return `503` if either is missing.

### Payments (CinetPay — Mobile Money)

`cinetpayApiKey` and `cinetpaySiteId` are **not** environment variables —
they're admin-configurable settings stored on `AppSettings` (`app_settings` table),
edited at `/admin/parametres/cinetpay` via `/api/admin/constants`. Both
`/api/payments/cinetpay/init` and `/api/webhooks/cinetpay` load them from
`getAppSettings()` on every request and return `503` if either is missing. The
`notify_url` sent to CinetPay is `${NEXT_PUBLIC_APP_URL}/api/webhooks/cinetpay`
(must be publicly reachable — use a tunnel like ngrok for local testing). The
webhook re-verifies the transaction via CinetPay's `/v2/payment/check` API before
activating a subscription (never trusts the notify payload directly). CinetPay's
sandbox/test mode is toggled in the CinetPay dashboard and uses the same API_KEY/SITE_ID.
