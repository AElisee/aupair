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

Not yet integrated: Supabase Realtime (messaging), Supabase Storage (photo uploads). Two payment aggregators are integrated and admin-configurable — FedaPay and GeniusPay — with one active at a time, see below.

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

`/admin/*` pages (`AdminLayout`, sidebar nav: Dashboard, Utilisateurs, Modération, Paiements, Pays, Blog, FAQ, Tickets) are backed by `/api/admin/*` routes, all gated by `requireAdminSession()` (`src/lib/admin.ts`) which returns `null` (→ `403`) unless `session.user.role === "ADMIN"`:

- `/api/admin/dashboard` (GET) — KPIs (`totalUsers`, `signups30d`, `revenue30d`, `activeSubscriptions`, `pendingProfiles`), recent users, recent payments
- `/api/admin/users` (GET/PATCH) — combined AuPair + Family list; PATCH applies `action: "validate" | "hide" | "unhide" | "suspend" | "delete"` via `setProfileStatus()`
- `/api/admin/moderation` (GET/PATCH) — `PENDING` profiles sorted by waiting time; PATCH applies `action: "validate" | "reject"`
- `/api/admin/profile/[userId]` (GET, `?role=AU_PAIR|FAMILLE`) — full profile detail, rendered by `src/app/admin/profil/[userId]/page.tsx` (full-page view, opened in a new tab via the "eye" icon in `/admin/utilisateurs` and `/admin/moderation`; header with status actions via `PATCH /api/admin/users`, KPI row — completion, views, latest subscription / kids, validation — and a two-column layout). Profile completion fields live in `src/lib/profile-completion.ts`, shared with `/api/dashboard/*`
- `/api/admin/countries` (GET/POST/PATCH/DELETE) — CRUD for the `Country` table, used by `/admin/pays`

- `/api/admin/documents` (GET/POST/PATCH/DELETE) — CRUD for `LegalDocument` (CGU, privacy policy, …; FR/EN content stored as **HTML**), used by `/admin/parametres/documents`, which edits it with a Tiptap WYSIWYG editor (`src/components/admin/RichTextEditor.tsx`). HTML is sanitized server-side with `sanitize-html` (`sanitizeDocumentHtml()` in `src/lib/legal-documents.server.ts`, strict allowlist matching the editor's output) both on save and on public render. Older docs saved as a Markdown subset are detected (`isLegacyMarkdown`) and converted on the fly by `toDocumentHtml()` (`src/lib/legal-documents.ts`). Published docs are rendered publicly at `/cgu`, `/cgv`, `/confidentialite`, `/securite`, `/cookies` (dedicated slugs in `DEDICATED_DOCUMENT_PATHS`; `/documents/<dedicated slug>` redirects there) or `/documents/[slug]`, via `LegalDocumentView` (`src/components/legal/`), styled by the `.legal-content` CSS class in `globals.css` (shared with the editor). Missing/unpublished → 404.

`setProfileStatus()` (`src/lib/admin.ts`) sets `validatedAt`/`validatedBy` when transitioning a profile to `ACTIVE`.

The `/admin` dashboard fetches both `/api/admin/dashboard` and `/api/admin/analytics` (ring KPIs, sign-ups area chart, validation gauge, top countries, revenue bars — shadcn charts, brand palette orange `#E87722` / blue `#3A5BA8` / green `#3FA45B` from the logo, plus teal `#2A9D8F` / indigo `#5B63C9`; cards take a light brand-tinted gradient via `Panel tint`); `/admin/analytics` now redirects to `/admin`. Admin icons are Lucide at `size={20} strokeWidth={1.25}`. Shared back-office building blocks live in `src/components/admin/AdminUI.tsx` (palette constants, `ICON`, `PAGE_TITLE` h1 class, `Panel`, `PanelHeader`, `IconChip`, ring `KpiCard` / `KpiGrid`) — the dashboard, `/admin/paiements`, `/admin/utilisateurs`, `/admin/moderation`, `/admin/tickets` and `/admin/parametres/constantes` use them (the latter with the shared `src/components/admin/EditableList.tsx`, `chips` or `rows` variant). Admin typography: h1 `PAGE_TITLE` (font-medium), section titles `text-[15px] font-medium`, nothing heavier than `font-medium` except KPI values (`font-semibold`). `/admin/paiements` lists each payment's expiration date (`Subscription.expiresAt`, 30 days from payment).

## Internationalization

`src/contexts/LanguageContext.tsx` provides `LanguageProvider` + `useLang()` returning `{ lang, setLang, t }`, where `t(fr, en)` returns the string for the current language (`"fr" | "en"`, persisted to `localStorage` under `aupair-lang`, defaults to `"fr"`; read via `useSyncExternalStore` so SSR always renders FR without hydration mismatch). Wrapped around the app (alongside `SessionProvider`) in `PublicLayoutWrapper`. There is no `next-intl`-based routing despite it being a dependency.

The whole UI (public site, auth pages, au pair/family dashboards, admin back-office) takes **all** its text from `src/i18n/`, never hardcoded strings. Use `useI18n()` (`src/i18n/index.ts`) in client components; it returns `{ t, tValue, tList, tError, relativeDate, locale, lang, setLang }`.

- Dictionaries, each entry `{ fr, en }` side by side (functions for interpolated strings, arrays of objects for lists like steps/FAQ — their order matches icon arrays in the components): `site.ts` (public pages, navbar, footer, 404), `auth.ts` (login, signup, password pages), `dashboard.ts` (au pair/family spaces), `admin.ts` (back-office). They're merged into one `t`; `satisfies Dictionary` makes a missing language a type error and `_NoDuplicateSections` rejects two files declaring the same top-level section.
- `src/i18n/values.ts` — display-only EN labels for French values stored in the DB (countries, languages, education levels, durations, report reasons, subscription features, gender) and for French API error messages (`tError`). Unknown values fall through unchanged. Values stay stored in French.
- Blog articles (bilingual) live in `src/content/blog-articles.ts`, shared by `/blog`, `/blog/[slug]` and the home `BlogPreview`. The DB `BlogPost` / `FaqItem` tables (edited in `/admin/blog`, `/admin/faq`) are **not** displayed publicly yet; `/faq` content is in `site.ts`.
- Server pages that need `metadata` or DB data stay server components and render a client `*Content.tsx` / `*View.tsx` for the text. Page `metadata` (SEO title/description) stays French since the server doesn't know the visitor's language.
- APIs return raw values (ISO dates, enum keys, numbers) and the client formats them per language (e.g. `/api/admin/dashboard`, `/api/admin/analytics` months as `YYYY-MM`).
- `LanguageToggle` (`src/components/layout/`) shows FR/GB flag buttons (images via `CountryFlag`, emoji flags don't render on Windows); used in the Navbar, dashboard sidebar + mobile header, admin top bar and pending-validation screen.
- Sidebar nav for both dashboard roles is defined once in `src/components/layout/dashboard-nav.ts`; `DashboardLayout` takes only `role`. It mirrors the admin charte: breadcrumb in the top bar (hidden below `sm`), avatar dropdown (Mon profil / Se déconnecter), a sidebar "Au pair premium" link (instead of sign-out) when the au pair's subscription is active, and a warm soft background (`SPACE_BACKGROUND`, distinct from the admin's blue one). Pages open with `PageHeader` (`src/components/dashboard/`, admin `PAGE_TITLE` + `Separator`); same weights as admin (nothing heavier than `font-medium` except values). Dashboard greeting is Bonjour/Bonsoir from the device hour (`useIsEvening`). Admin table pagination is the shared `src/components/admin/Pagination.tsx`.
- Messaging (`/dashboard/{au-pair|famille}/messages`) is `MessagesPanel` (`src/components/messages/`, takes `role`, renders its own `PageHeader`): `ConversationList` (search + Toutes/Non lues filter), `MessageThread` (shadcn `Message` + `Bubble` from `src/components/ui/`, sticky day separators, read ticks), `MessageComposer`, `ReportDialog`. No realtime yet: the open thread polls every 5 s and the list every 10 s while the tab is visible.
- Notifications are stored in French; `NotificationsPanel` regenerates known types (`PROFILE_VIEW`, `WEEKLY_VIEWS_DIGEST`) in the current language from the stored text. Emails and the CSV payment export are still French-only.

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

### Au pair subscription page

`/dashboard/au-pair/abonnement` has three tabs (current subscription, plan & payment, payment history), fed by `GET /api/subscription` (latest subscription + `history[]`; an `ACTIVE` row past `expiresAt` is returned as `EXPIRED`). The pay button is disabled while a subscription is active, and `POST /api/payments/checkout` also refuses with `409` in that case (no early renewal).

### Payments — active provider switch

`AppSettings.paymentProvider` (`"fedapay" | "geniuspay"`, default `fedapay`) picks the
aggregator used for **new** payments. The client always calls `POST /api/payments/checkout`,
which delegates to the active provider's checkout route and returns `{ provider,
transactionId, checkoutUrl }`; the client then polls `/api/payments/{provider}/verify`.
The inactive provider's keys stay saved and its verify/webhook routes keep working, so
payments started before a switch still complete. Switching is done from the "Agrégateur
de paiement" block on `/admin/parametres/paiements` ("Moyens de paiement", one tab per provider; old `/admin/parametres/{fedapay,geniuspay}` URLs redirect there)
(`src/components/admin/payments/`: `ProviderCard` + generic `ProviderSettingsForm`); `/api/admin/constants` refuses to activate a provider
whose public + secret keys are missing. Helpers in `src/lib/payments.ts`
(`resolveActiveProvider`, `isProviderConfigured`, `activateSubscriptionForPayment`).

### Payments (GeniusPay — Wave, Orange/MTN/Moov Money, cards)

`geniuspayPublicKey` / `geniuspaySecretKey` / `geniuspayWebhookSecret` on `AppSettings`,
edited in the GeniusPay tab of `/admin/parametres/paiements`. Single base URL
`https://geniuspay.ci/api/v1/merchant` for sandbox and live (environment follows the key
prefix `pk_sandbox_`/`pk_live_`), auth via `X-API-Key` + `X-API-Secret` headers
(`src/lib/geniuspay.ts`). Hosted checkout mode (`POST /payments` without
`payment_method` → `checkout_url`), `metadata.user_id` maps a payment back to the user,
the payment `reference` (`MTX-…`) is the transaction id and the `Subscription.paymentId`.
Statuses: `completed` = success; `failed`/`cancelled`/`expired`/`refunded` = failure;
`pending`/`processing` = pending. Webhook `POST /api/webhooks/geniuspay` checks
`X-Webhook-Signature` = HMAC-SHA256 of `` `${X-Webhook-Timestamp}.${payload}` `` (5 min
tolerance), then re-fetches `GET /payments/{reference}` before writing. A re-fetched
`refunded` status sets the linked `Subscription` to `REFUNDED` (`revokeSubscriptionForRefund`
in `src/lib/payments.ts`, also used by the FedaPay webhook), which cuts access since checks require `ACTIVE`.

### Payments (FedaPay — Mobile Money & cards)

`fedapayPublicKey`, `fedapaySecretKey`, `fedapayWebhookSecret` and
`fedapayEnvironment` are **not** environment variables — they're
admin-configurable settings stored on `AppSettings` (`app_settings` table),
edited in the FedaPay tab of `/admin/parametres/paiements` via `/api/admin/constants`.
`fedapayEnvironment` (`"sandbox" | "live"`) is an **explicit** admin choice:
FedaPay's own SDK requires calling `setEnvironment()` rather than inferring it
from the key prefix, so the app can't auto-detect it either. API base URL is
derived from it: `https://sandbox-api.fedapay.com/v1` or
`https://api.fedapay.com/v1` (`fedapayBaseUrl()` in `src/lib/fedapay.ts`, which
also holds the header/signature/reference helpers). No SDK dependency — plain
`fetch`.

FedaPay uses the **hosted checkout redirect** flow (the officially recommended
starting point — covers all operators and cards without hardcoding per-country
`mode` values):

- `POST /api/payments/fedapay/checkout` — creates a transaction
  (`amount` = `settings.subscriptionPriceXof`, `currency.iso: "XOF"` always),
  then `POST /transactions/{id}/token` to get a hosted checkout `url`.
  `merchant_reference` is `AUPAIR-{userId}-{timestamp}`
  (`buildMerchantReference`/`parseUserIdFromMerchantReference` in
  `src/lib/fedapay.ts`) — the only way to map a transaction back to a user,
  since FedaPay's webhook payload carries no email. The client opens the
  returned `url` in a new tab and polls verify; FedaPay's page handles
  operator/card selection and OTP itself, so there's no `/countries` or
  `/operators` proxy route.
- `POST /api/payments/fedapay/verify` — polled by the client with
  `{ transactionId }`; re-fetches the transaction from FedaPay (`GET
  /transactions/{id}`) rather than trusting client-supplied status. FedaPay has
  7 statuses (`pending`, `approved`, `declined`, `canceled`, `refunded`,
  `transferred`, `expired`) mapped to success (`approved`/`transferred`),
  failure, or still-pending. Creates the `Subscription` row on success,
  idempotent on `paymentId` (the FedaPay transaction id).
- `POST /api/webhooks/fedapay` — server-to-server notification; verifies the
  `X-FEDAPAY-SIGNATURE` header (format `t=<timestamp>,s=<hex>`, HMAC-SHA256 of
  `` `${timestamp}.${rawBody}` `` with `fedapayWebhookSecret` — a **separate**
  secret from the API secret key, confirmed from the `fedapay-node` SDK
  source), then re-fetches the canonical transaction status server-side before
  writing (never trusts the webhook payload's embedded status), same idempotent
  `Subscription` creation as verify.
