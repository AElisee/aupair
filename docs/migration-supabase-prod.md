# Migration vers Supabase entreprise (production)

Ce document décrit toutes les étapes pour connecter le projet au compte Supabase entreprise en production, tout en conservant le compte Supabase personnel pour le développement local.

## Contexte

| Environnement | Compte Supabase | Usage |
|---|---|---|
| Local (`npm run dev`) | Compte personnel | Développement et tests |
| Production (Vercel) | Compte entreprise | Site en ligne |

Le compte Supabase entreprise est vide au départ : RLS activé, aucune table, aucun service connecté. Prisma se connecte avec le rôle `postgres` (superuser) qui a `BYPASS RLS` nativement — RLS activé sans policies n'affecte pas Prisma et est en fait la configuration correcte.

---

## Étape 1 — Récupérer les credentials Supabase entreprise

Sur le dashboard Supabase de l'entreprise : **Settings → Database**

| Paramètre | Où trouver | Variable |
|---|---|---|
| Transaction pooler (port 6543) | Connection string → Transaction | `DATABASE_URL` prod |
| Session pooler (port 5432) | Connection string → Session | Utilisé uniquement pour `db push` |
| Project URL | Settings → API | `NEXT_PUBLIC_SUPABASE_URL` |
| Anon key | Settings → API | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| Service role key | Settings → API | `SUPABASE_SERVICE_ROLE_KEY` |

Le format des URLs Supabase :
```
Transaction : postgresql://postgres.ID_PROJET:MOT_DE_PASSE@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true
Session     : postgresql://postgres.ID_PROJET:MOT_DE_PASSE@aws-0-eu-west-1.pooler.supabase.com:5432/postgres
```

---

## Étape 2 — Créer le schéma sur la base prod

Utiliser la **session pooler URL (port 5432)** — sans `pgbouncer=true` — pour que les instructions DDL passent correctement.

```bash
DATABASE_URL="postgresql://postgres.ID_PROD:MOT_DE_PASSE@aws-0-eu-west-1.pooler.supabase.com:5432/postgres" npx prisma db push
```

Cela crée toutes les tables et enums définis dans `prisma/schema.prisma` sans affecter la base de dev.

---

## Étape 3 — Seed de la base prod

Lancer le seed contre la base prod pour initialiser le compte admin et les pays par défaut.

```bash
DATABASE_URL="postgresql://postgres.ID_PROD:MOT_DE_PASSE@aws-0-eu-west-1.pooler.supabase.com:5432/postgres" \
ADMIN_EMAIL="admin@aupairaeu.com" \
ADMIN_PASSWORD="MOT_DE_PASSE_FORT" \
ADMIN_NAME="Administrateur" \
npx tsx prisma/seed.ts
```

> **Important** : ne pas réutiliser le mot de passe de dev (`123456789`). Choisir un mot de passe fort pour la prod.

---

## Étape 4 — Variables d'environnement sur Vercel

Sur **Vercel → Settings → Environment Variables**, sélectionner l'environnement **Production** et ajouter :

| Variable | Valeur |
|---|---|
| `DATABASE_URL` | Transaction pooler prod (port 6543, `?pgbouncer=true`) |
| `AUTH_SECRET` | Nouvelle valeur aléatoire — générer avec `openssl rand -hex 32` |
| `AUTH_URL` | `https://www.aupairaeu.com` |
| `AUTH_GOOGLE_ID` | ID de l'application Google OAuth |
| `AUTH_GOOGLE_SECRET` | Secret de l'application Google OAuth |
| `AUTH_FACEBOOK_ID` | ID de l'application Facebook OAuth |
| `AUTH_FACEBOOK_SECRET` | Secret de l'application Facebook OAuth |
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase entreprise |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé anon du projet Supabase entreprise |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key du projet Supabase entreprise |
| `NEXT_PUBLIC_APP_URL` | `https://www.aupairaeu.com` |
| `CRON_SECRET` | Valeur aléatoire (`openssl rand -hex 32`) |
| `ADMIN_EMAIL` | Email du compte admin prod |
| `ADMIN_PASSWORD` | Mot de passe du compte admin prod |
| `ADMIN_NAME` | Nom affiché du compte admin |

> `AUTH_SECRET` **doit être différent** de celui du dev pour que les sessions des deux environnements ne soient pas interchangeables.

---

## Étape 5 — OAuth : autoriser le domaine de production

### Google (console.cloud.google.com)

Dans le projet Google Cloud → **APIs & Services → Credentials → OAuth 2.0 Client** :

- **Authorized JavaScript origins** : ajouter `https://www.aupairaeu.com`
- **Authorized redirect URIs** : ajouter `https://www.aupairaeu.com/api/auth/callback/google`

### Meta / Facebook (developers.facebook.com)

Dans l'application Meta → **Facebook Login → Settings** :

- **Valid OAuth Redirect URIs** : ajouter `https://www.aupairaeu.com/api/auth/callback/facebook`

> Sans ces ajouts, la connexion Google/Facebook sera bloquée en production avec une erreur `redirect_uri_mismatch`.

---

## Étape 6 — RLS sur Supabase prod

**Aucune action requise.**

Prisma se connecte avec le rôle `postgres` qui dispose de `BYPASS RLS` dans Supabase. RLS activé sans policies est la configuration correcte : le client Supabase anon ne peut rien lire directement, ce qui est le comportement voulu.

Si Supabase Realtime ou Storage (non encore intégrés) sont ajoutés plus tard, des policies RLS devront être créées à ce moment-là.

---

## Étape 7 — Configuration dans l'admin panel post-déploiement

Une fois le site déployé et le compte admin accessible sur `/admin` :

### Email (Resend)

Aller sur `/admin/parametres/email` :
- **Resend API Key** : clé API du compte Resend entreprise
- **Email d'envoi** : `noreply@aupairaeu.com` (domaine vérifié dans Resend — voir `docs/resend-domain-setup.md`)

### Paiements (KKiaPay)

Aller sur `/admin/parametres/kkiapay` :
- **Clé publique** : clé publique KKiaPay prod
- **Clé privée** : clé privée KKiaPay prod
- **Mode sandbox** : désactiver (passer à `false`) pour la production réelle

---

## Ordre d'exécution recommandé

1. **Récupérer les credentials** (Étape 1) depuis le dashboard Supabase entreprise
2. **Créer le schéma** (Étape 2) — `prisma db push` vers la base prod
3. **Seeder la base** (Étape 3) — compte admin + pays
4. **Configurer Vercel** (Étape 4) — variables d'environnement
5. **Configurer OAuth** (Étape 5) — Google et Facebook
6. **Déclencher le déploiement** sur Vercel et vérifier
7. **Configurer Resend et KKiaPay** (Étape 7) via l'admin panel

---

## Vérifications post-migration

- [ ] Connexion email/mot de passe fonctionne sur le domaine prod
- [ ] Connexion Google OAuth fonctionne
- [ ] Connexion Facebook OAuth fonctionne
- [ ] Inscription d'un nouvel au pair crée bien un profil `PENDING`
- [ ] Email de réinitialisation de mot de passe arrive bien
- [ ] Paiement KKiaPay déclenche bien la création d'abonnement
- [ ] Admin panel accessible et données visibles
