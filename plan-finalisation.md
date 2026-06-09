# Plan de finalisation feature par feature - AuPair A.EU

Date : 09 juin 2026  
Objectif : terminer le projet progressivement, en validant chaque fonctionnalite avant de passer a la suivante.  
Stack recommandee : Next.js API Routes + Prisma + PostgreSQL Supabase + Supabase Storage/Realtime + Stripe + CinetPay + Resend.

## Methode de travail

Avancer dans l'ordre ci-dessous. Chaque tache doit etre consideree comme terminee uniquement si :

- le code compile avec `npm run build`
- le lint ne rajoute pas de nouvelles erreurs
- le parcours a ete teste manuellement
- les donnees sont persistantes quand la tache concerne la base de donnees
- les routes sensibles verifient la session et le role cote serveur

Commandes de validation regulieres :

```bash
npm run lint
npm run build
npx prisma generate
npx prisma db push
```

## Vue globale du planning

| Phase | Duree estimee | Objectif |
| --- | ---: | --- |
| Phase 1 | Jours 1 a 3 | Nettoyage, environnement, base de donnees |
| Phase 2 | Jours 4 a 7 | Authentification complete |
| Phase 3 | Jours 8 a 13 | Profils et annuaires dynamiques |
| Phase 4 | Jours 14 a 18 | Messagerie et abonnement |
| Phase 5 | Jours 19 a 24 | Admin, moderation, contact |
| Phase 6 | Jours 25 a 31 | Paiement, emails, upload |
| Phase 7 | Jours 32 a 38 | Tests, securite, deploiement |

Estimation totale MVP solide : **18 a 25 jours ouvrables**.  
Estimation production complete : **35 a 45 jours ouvrables**.

---

# Phase 1 - Stabilisation et environnement

## Tache 1 - Corriger la qualite de base du projet

Periode : Jour 1  
Priorite : tres haute

Objectif :

- Corriger les erreurs bloquantes du lint.
- Supprimer les imports inutilises.
- Corriger les apostrophes/guillemets non echappes dans le JSX.
- Corriger `LanguageContext.tsx` pour eviter le `setState` direct dans `useEffect`.

Fichiers concernes :

- `src/app/**/*.tsx`
- `src/components/**/*.tsx`
- `src/contexts/LanguageContext.tsx`
- `src/types/next-auth.d.ts`

Ressources a utiliser :

- ESLint deja installe
- React 19
- Next.js 16
- Commande `npm run lint`

Critere de validation :

- `npm run lint` doit passer ou, au minimum, ne garder que des avertissements acceptes temporairement.
- `npm run build` doit rester vert.

## Tache 2 - Verifier et nettoyer les variables d'environnement

Periode : Jour 1  
Priorite : tres haute

Objectif :

- Identifier les variables obligatoires.
- Remplacer les placeholders par de vraies valeurs en local.
- Separer clairement `.env`, `.env.local`, et les variables de production.

Variables a verifier :

- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `FACEBOOK_CLIENT_ID`
- `FACEBOOK_CLIENT_SECRET`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `CINETPAY_API_KEY`
- `CINETPAY_SITE_ID`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Ressources a utiliser :

- `.env`
- `.env.local`
- `src/lib/auth.ts`
- `src/lib/prisma.ts`
- `prisma.config.ts`
- Dashboard Supabase
- Dashboard Google Cloud OAuth
- Dashboard Meta/Facebook Developers

Critere de validation :

- Le projet demarre localement.
- Prisma peut se connecter a la base.
- Les secrets sensibles ne sont pas commites.

## Tache 3 - Creer et connecter la base PostgreSQL Supabase

Periode : Jour 2  
Priorite : tres haute

Objectif :

- Creer le projet Supabase.
- Recuperer l'URL PostgreSQL.
- Brancher `DATABASE_URL`.
- Appliquer le schema Prisma.

Fichiers concernes :

- `prisma/schema.prisma`
- `prisma.config.ts`
- `src/lib/prisma.ts`

Ressources a utiliser :

- Supabase PostgreSQL
- Prisma 7
- `@prisma/adapter-pg`
- `pg`

Commandes :

```bash
npx prisma generate
npx prisma db push
npx prisma studio
```

Critere de validation :

- Les tables sont creees dans Supabase.
- `npx prisma studio` affiche les modeles.
- `npm run build` passe.

## Tache 4 - Ajouter un seed de donnees

Periode : Jour 2 a Jour 3  
Priorite : haute

Objectif :

- Ajouter des donnees de test propres pour developper rapidement.
- Creer au moins :
  - 1 admin
  - 2 au pairs
  - 2 familles
  - 2 abonnements
  - 4 messages
  - 3 articles de blog
  - 8 questions FAQ
  - 3 temoignages

Fichiers a creer :

- `prisma/seed.ts`

Fichiers a modifier :

- `package.json` pour ajouter une commande seed si necessaire

Ressources a utiliser :

- Prisma Client genere dans `src/generated/prisma`
- `bcryptjs` pour hasher les mots de passe
- Donnees mockees deja presentes dans :
  - `src/app/trouver-au-pair/page.tsx`
  - `src/app/trouver-famille/page.tsx`
  - `src/app/admin/page.tsx`
  - `src/app/blog/page.tsx`

Critere de validation :

- La base contient les donnees de depart.
- Les mots de passe sont hashes.
- Un admin peut etre utilise pour tester la zone admin.

---

# Phase 2 - Authentification complete

## Tache 5 - Brancher l'inscription sur l'API

Periode : Jour 4  
Priorite : tres haute

Objectif :

- Modifier la page `/inscription` pour appeler `/api/auth/register`.
- Afficher les erreurs API.
- Afficher un chargement pendant la creation.
- Connecter automatiquement l'utilisateur apres inscription ou le rediriger vers `/connexion`.

Fichiers concernes :

- `src/app/inscription/page.tsx`
- `src/app/api/auth/register/route.ts`

Ressources a utiliser :

- Route existante `/api/auth/register`
- `fetch`
- `next-auth/react` avec `signIn`
- `useRouter` de `next/navigation`

Critere de validation :

- Un compte au pair est cree en base depuis l'interface.
- Un compte famille est cree en base depuis l'interface.
- Les emails dupliques retournent une erreur claire.
- Les mots de passe trop courts sont bloques.

## Tache 6 - Durcir la route d'inscription

Periode : Jour 4 a Jour 5  
Priorite : haute

Objectif :

- Ajouter une validation serveur robuste.
- Normaliser toutes les donnees.
- Eviter les champs requis avec valeurs trop vides quand c'est possible.

Fichiers concernes :

- `src/app/api/auth/register/route.ts`

Ressources a utiliser :

- Librairie recommandee : `zod`
- `bcryptjs`
- Prisma transactions
- Types Prisma `UserRole`, `ProfileStatus`

Action recommandee :

```bash
npm install zod
```

Critere de validation :

- Les entrees invalides retournent 400.
- Les doublons retournent 409.
- Les erreurs serveur ne revelent pas d'informations sensibles.

## Tache 7 - Finaliser la session cote client

Periode : Jour 5  
Priorite : haute

Objectif :

- Ajouter un provider client pour NextAuth si necessaire.
- Permettre a la navbar et aux dashboards de connaitre l'utilisateur connecte.

Fichiers a creer si necessaire :

- `src/components/providers/AuthProvider.tsx`

Fichiers a modifier :

- `src/app/layout.tsx`
- `src/components/layout/Navbar.tsx`
- `src/components/layout/DashboardLayout.tsx`
- `src/components/layout/AdminLayout.tsx`

Ressources a utiliser :

- `SessionProvider` depuis `next-auth/react`
- `useSession`
- `signOut`

Critere de validation :

- La navbar affiche Connexion/Inscription pour un visiteur.
- La navbar affiche Dashboard/Deconnexion pour un utilisateur connecte.
- Le bouton deconnexion fonctionne.

## Tache 8 - Finaliser les redirections par role

Periode : Jour 6  
Priorite : haute

Objectif :

- Rediriger automatiquement :
  - `AU_PAIR` vers `/dashboard/au-pair`
  - `FAMILLE` vers `/dashboard/famille`
  - `ADMIN` vers `/admin`
- Securiser les `callbackUrl`.

Fichiers concernes :

- `src/app/connexion/page.tsx`
- `src/lib/safe-redirect.ts`
- `src/middleware.ts`

Ressources a utiliser :

- NextAuth callbacks
- Middleware Next.js
- Helper `getSafeCallbackUrl`

Critere de validation :

- Un au pair arrive sur son dashboard.
- Une famille arrive sur son dashboard.
- Un non-admin ne peut pas acceder a `/admin`.

## Tache 9 - Ajouter recuperation mot de passe

Periode : Jour 7  
Priorite : moyenne

Objectif :

- Creer un parcours de mot de passe oublie.
- Envoyer un email avec lien temporaire.
- Permettre la reinitialisation du mot de passe.

Pages a creer :

- `src/app/mot-de-passe-oublie/page.tsx`
- `src/app/reinitialiser-mot-de-passe/page.tsx`

Routes API a creer :

- `src/app/api/auth/forgot-password/route.ts`
- `src/app/api/auth/reset-password/route.ts`

Ressources a utiliser :

- Prisma `VerificationToken` ou modele dedie si necessaire
- `bcryptjs`
- Resend

Critere de validation :

- Un utilisateur recoit un email de reinitialisation.
- Le lien expire.
- Le nouveau mot de passe fonctionne.

---

# Phase 3 - Profils et annuaires dynamiques

## Tache 10 - Creer les helpers metier

Periode : Jour 8  
Priorite : haute

Objectif :

- Centraliser les verifications de session, role, abonnement et profil.

Fichiers a creer :

- `src/lib/current-user.ts`
- `src/lib/permissions.ts`
- `src/lib/subscriptions.ts`
- `src/lib/profile.ts`

Ressources a utiliser :

- `auth()` depuis `src/lib/auth.ts`
- Prisma
- Enums du client Prisma

Critere de validation :

- Les routes API peuvent appeler des helpers simples :
  - `requireUser()`
  - `requireAdmin()`
  - `hasActiveSubscription(userId)`
  - `getDashboardPathForRole(role)`

## Tache 11 - Brancher le profil au pair

Periode : Jour 8 a Jour 9  
Priorite : tres haute

Objectif :

- Charger le profil depuis Prisma.
- Sauvegarder les modifications.
- Remplacer les valeurs statiques.

Fichiers concernes :

- `src/app/dashboard/au-pair/profil/page.tsx`

Routes API a creer :

- `src/app/api/profiles/au-pair/route.ts`

Ressources a utiliser :

- Prisma `AuPairProfile`
- `auth()`
- Validation `zod`
- Composants UI existants

Critere de validation :

- Les modifications persistent apres rechargement.
- Un utilisateur ne peut modifier que son propre profil.
- Un admin peut consulter les profils en moderation.

## Tache 12 - Brancher le profil famille

Periode : Jour 9 a Jour 10  
Priorite : tres haute

Objectif :

- Creer les sous-pages famille manquantes.
- Permettre a une famille de modifier son profil.

Pages a creer :

- `src/app/dashboard/famille/profil/page.tsx`
- `src/app/dashboard/famille/recherche/page.tsx`
- `src/app/dashboard/famille/messages/page.tsx`
- `src/app/dashboard/famille/notifications/page.tsx`
- `src/app/dashboard/famille/parametres/page.tsx`

Routes API a creer :

- `src/app/api/profiles/family/route.ts`

Ressources a utiliser :

- Prisma `FamilyProfile`
- `DashboardLayout`
- UI deja presente dans `src/app/dashboard/famille/page.tsx`

Critere de validation :

- La famille peut modifier ses informations.
- Les liens de navigation famille ne menent plus vers des pages absentes.

## Tache 13 - Brancher l'annuaire des au pairs

Periode : Jour 10 a Jour 11  
Priorite : haute

Objectif :

- Remplacer `mockAuPairs` par une requete Prisma.
- Filtrer par pays, langue, experience, disponibilite si applicable.

Fichiers concernes :

- `src/app/trouver-au-pair/page.tsx`

Ressources a utiliser :

- Prisma `AuPairProfile`
- Query params Next.js
- Server Components si possible

Critere de validation :

- Les profils `ACTIVE` apparaissent.
- Les profils `PENDING`, `HIDDEN`, `SUSPENDED` n'apparaissent pas publiquement.
- Les filtres changent les resultats.

## Tache 14 - Brancher l'annuaire des familles

Periode : Jour 11 a Jour 12  
Priorite : haute

Objectif :

- Remplacer `mockFamilies` par une requete Prisma.
- Filtrer par pays, ville, nombre d'enfants et criteres utiles.

Fichiers concernes :

- `src/app/trouver-famille/page.tsx`

Ressources a utiliser :

- Prisma `FamilyProfile`
- Query params Next.js

Critere de validation :

- Les familles `ACTIVE` apparaissent.
- Les filtres fonctionnent.
- Le nombre de resultats est correct.

## Tache 15 - Ajouter les pages detail profil

Periode : Jour 12 a Jour 13  
Priorite : haute

Objectif :

- Permettre de consulter un profil complet.
- Ajouter le bouton contacter.
- Incrementer `profileViews`.

Pages a creer :

- `src/app/au-pairs/[id]/page.tsx`
- `src/app/familles/[id]/page.tsx`

Ressources a utiliser :

- Prisma `AuPairProfile`
- Prisma `FamilyProfile`
- `auth()`
- `profileViews`

Critere de validation :

- Un profil actif est visible.
- Un profil masque ou suspendu retourne une page 404 ou acces refuse.
- Le bouton contacter redirige vers la messagerie.

---

# Phase 4 - Messagerie et abonnement

## Tache 16 - Implementer l'abonnement en base

Periode : Jour 14  
Priorite : haute

Objectif :

- Lire l'abonnement actif d'un utilisateur.
- Afficher les jours restants.
- Ajouter une activation manuelle temporaire pour tester avant paiement reel.

Fichiers concernes :

- `src/app/dashboard/au-pair/abonnement/page.tsx`

Routes API a creer :

- `src/app/api/subscription/route.ts`
- `src/app/api/subscription/dev-activate/route.ts` uniquement en dev si necessaire

Ressources a utiliser :

- Prisma `Subscription`
- Helper `hasActiveSubscription`
- Enums `SubscriptionStatus`, `Currency`, `PaymentMethod`

Critere de validation :

- Un abonnement actif debloque la messagerie.
- Un abonnement expire bloque la messagerie.

## Tache 17 - Creer l'API de messagerie

Periode : Jour 15 a Jour 16  
Priorite : tres haute

Objectif :

- Lister les conversations.
- Lister les messages d'une conversation.
- Envoyer un message.
- Marquer les messages comme lus.

Routes API a creer :

- `src/app/api/messages/route.ts`
- `src/app/api/messages/[userId]/route.ts`
- `src/app/api/messages/[userId]/read/route.ts`

Ressources a utiliser :

- Prisma `Message`
- `auth()`
- Helper `hasActiveSubscription`
- Verification blocage `Block`

Regles metier :

- Une famille peut envoyer gratuitement.
- Un au pair ne peut envoyer que si abonnement actif.
- Un utilisateur ne peut pas envoyer a lui-meme.
- Un utilisateur bloque ne peut pas envoyer.

Critere de validation :

- Les messages sont stockes.
- Un au pair sans abonnement recoit une erreur 403.
- Le fil de messages se recharge correctement.

## Tache 18 - Brancher l'UI messages

Periode : Jour 16 a Jour 17  
Priorite : haute

Objectif :

- Remplacer les messages mockes par l'API.
- Ajouter etat chargement, vide, erreur.
- Ajouter polling simple toutes les 5 secondes.

Fichiers concernes :

- `src/app/dashboard/au-pair/messages/page.tsx`
- `src/app/dashboard/famille/messages/page.tsx`

Ressources a utiliser :

- API `/api/messages`
- React `useEffect`
- `fetch`

Critere de validation :

- Deux comptes peuvent echanger.
- Le message apparait apres envoi.
- Le gating abonnement est visible et respecte.

## Tache 19 - Ajouter favoris, signalements et blocages

Periode : Jour 18  
Priorite : moyenne

Objectif :

- Ajouter favoris.
- Ajouter signalements.
- Ajouter blocage utilisateur.

Routes API a creer :

- `src/app/api/favorites/route.ts`
- `src/app/api/reports/route.ts`
- `src/app/api/blocks/route.ts`

Ressources a utiliser :

- Prisma `Favorite`
- Prisma `Report`
- Prisma `Block`

Critere de validation :

- Un utilisateur peut ajouter/retirer un favori.
- Un signalement apparait dans l'admin.
- Un utilisateur bloque ne peut plus envoyer de message.

---

# Phase 5 - Admin, moderation, contact

## Tache 20 - Brancher le dashboard admin

Periode : Jour 19  
Priorite : haute

Objectif :

- Remplacer les KPIs statiques par des requetes Prisma.

Fichiers concernes :

- `src/app/admin/page.tsx`

Ressources a utiliser :

- Prisma counts
- `requireAdmin()`
- Server Components

KPIs :

- Nombre d'utilisateurs
- Nombre d'au pairs
- Nombre de familles
- Profils en attente
- Abonnements actifs
- Revenus totaux
- Signalements ouverts

Critere de validation :

- Les chiffres changent selon les donnees en base.
- Un non-admin ne peut pas acceder.

## Tache 21 - Brancher admin utilisateurs

Periode : Jour 20  
Priorite : haute

Objectif :

- Lister les utilisateurs reels.
- Filtrer par role/statut.
- Activer/desactiver un compte.

Fichiers concernes :

- `src/app/admin/utilisateurs/page.tsx`

Routes API a creer :

- `src/app/api/admin/users/route.ts`
- `src/app/api/admin/users/[id]/route.ts`

Ressources a utiliser :

- Prisma `User`
- `requireAdmin()`

Critere de validation :

- La liste affiche les utilisateurs reels.
- Les actions modifient la base.

## Tache 22 - Brancher moderation

Periode : Jour 21  
Priorite : haute

Objectif :

- Lister les profils `PENDING`.
- Valider, masquer, suspendre ou supprimer un profil.

Fichiers concernes :

- `src/app/admin/moderation/page.tsx`

Routes API a creer :

- `src/app/api/admin/moderation/route.ts`
- `src/app/api/admin/moderation/[profileId]/route.ts`

Ressources a utiliser :

- Prisma `AuPairProfile`
- Prisma `FamilyProfile`
- Enum `ProfileStatus`

Critere de validation :

- Valider un profil le rend visible publiquement.
- Masquer un profil le retire des annuaires.

## Tache 23 - Brancher paiements admin

Periode : Jour 22  
Priorite : moyenne

Objectif :

- Afficher les abonnements reels.
- Calculer les revenus.
- Ajouter export CSV.

Fichiers concernes :

- `src/app/admin/paiements/page.tsx`

Routes API a creer :

- `src/app/api/admin/payments/route.ts`
- `src/app/api/admin/payments/export/route.ts`

Ressources a utiliser :

- Prisma `Subscription`
- `Currency`
- `PaymentMethod`

Critere de validation :

- La liste correspond aux abonnements en base.
- L'export CSV fonctionne.

## Tache 24 - Brancher le formulaire contact

Periode : Jour 23  
Priorite : moyenne

Objectif :

- Transformer les demandes contact en tickets support.
- Envoyer un email de confirmation.

Fichiers concernes :

- `src/app/contact/page.tsx`

Routes API a creer :

- `src/app/api/contact/route.ts`

Ressources a utiliser :

- Prisma `Ticket`
- Resend
- Validation `zod`

Critere de validation :

- Un ticket est cree.
- L'admin peut le voir.
- Le demandeur recoit un email.

## Tache 25 - Creer admin blog, FAQ et tickets

Periode : Jour 24  
Priorite : moyenne

Objectif :

- Creer les pages admin manquantes deja presentes dans la navigation.

Pages a creer :

- `src/app/admin/blog/page.tsx`
- `src/app/admin/faq/page.tsx`
- `src/app/admin/tickets/page.tsx`
- `src/app/admin/analytics/page.tsx`

Routes API a creer :

- `src/app/api/admin/blog/route.ts`
- `src/app/api/admin/faq/route.ts`
- `src/app/api/admin/tickets/route.ts`

Ressources a utiliser :

- Prisma `BlogPost`
- Prisma `FaqItem`
- Prisma `Ticket`
- Prisma `TicketMessage`

Critere de validation :

- Les liens admin ne menent plus vers 404.
- L'admin peut publier/modifier FAQ et blog.

---

# Phase 6 - Paiement, emails, upload

## Tache 26 - Integrer Stripe Checkout

Periode : Jour 25 a Jour 26  
Priorite : tres haute pour production

Objectif :

- Creer une session Stripe Checkout.
- Rediriger l'au pair vers Stripe.
- Gerer retour succes/echec.

Routes API a creer :

- `src/app/api/payments/stripe/checkout/route.ts`

Fichiers concernes :

- `src/app/dashboard/au-pair/abonnement/page.tsx`

Ressources a utiliser :

- Package `stripe`
- Package `@stripe/stripe-js`
- Dashboard Stripe
- Variables `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

Critere de validation :

- Un utilisateur peut ouvrir Checkout.
- Le montant est correct : 32 EUR.
- La session contient l'id utilisateur en metadata.

## Tache 27 - Ajouter le webhook Stripe

Periode : Jour 27  
Priorite : tres haute pour production

Objectif :

- Activer l'abonnement uniquement apres paiement confirme.

Route API a creer :

- `src/app/api/webhooks/stripe/route.ts`

Ressources a utiliser :

- `stripe.webhooks.constructEvent`
- Variable `STRIPE_WEBHOOK_SECRET`
- Prisma `Subscription`

Critere de validation :

- Un paiement reussi cree un abonnement actif de 30 jours.
- Un paiement echoue n'active rien.
- Le webhook est idempotent.

## Tache 28 - Integrer CinetPay / Mobile Money

Periode : Jour 28 a Jour 29  
Priorite : haute pour Cote d'Ivoire

Objectif :

- Permettre le paiement Mobile Money.
- Gerer notification/callback CinetPay.

Routes API a creer :

- `src/app/api/payments/cinetpay/init/route.ts`
- `src/app/api/webhooks/cinetpay/route.ts`

Ressources a utiliser :

- Compte marchand CinetPay
- `CINETPAY_API_KEY`
- `CINETPAY_SITE_ID`
- Prisma `Subscription`
- Montant recommande local : 21 000 FCFA

Critere de validation :

- Un paiement Mobile Money peut etre initie.
- La notification active l'abonnement.
- Le montant XOF est stocke correctement.

## Tache 29 - Ajouter les emails transactionnels

Periode : Jour 30  
Priorite : haute

Objectif :

- Envoyer les emails importants.

Fichiers a creer :

- `src/lib/mail.ts`
- `src/emails/welcome.ts`
- `src/emails/subscription-confirmed.ts`
- `src/emails/password-reset.ts`
- `src/emails/profile-approved.ts`

Ressources a utiliser :

- Resend
- Variable `RESEND_API_KEY`
- Variable `RESEND_FROM_EMAIL`

Emails prioritaires :

- Bienvenue
- Confirmation d'inscription
- Profil valide
- Paiement confirme
- Mot de passe oublie
- Expiration prochaine d'abonnement

Critere de validation :

- Les emails partent en environnement de test.
- Les erreurs email ne bloquent pas la transaction principale.

## Tache 30 - Ajouter l'upload Supabase Storage

Periode : Jour 31  
Priorite : haute

Objectif :

- Uploader photo de profil, photo famille et documents.
- Stocker les URLs en base.

Routes API a creer :

- `src/app/api/upload/route.ts`

Fichiers concernes :

- `src/app/dashboard/au-pair/profil/page.tsx`
- `src/app/dashboard/famille/profil/page.tsx`

Ressources a utiliser :

- Supabase Storage
- `@supabase/supabase-js`
- Bucket `profiles`
- Bucket `documents`
- `SUPABASE_SERVICE_ROLE_KEY`

Regles :

- Limiter les types : jpg, png, webp, pdf pour documents.
- Limiter la taille.
- Ne jamais exposer la service role key cote client.

Critere de validation :

- Une photo s'affiche apres upload.
- Le fichier est stocke dans Supabase.
- L'URL est enregistree dans Prisma.

---

# Phase 7 - Tests, securite, deploiement

## Tache 31 - Ajouter les pages legales manquantes

Periode : Jour 32  
Priorite : haute avant production

Objectif :

- Eviter les liens morts.
- Preparer l'exploitation commerciale.

Pages a creer :

- `src/app/cgu/page.tsx`
- `src/app/cgv/page.tsx`
- `src/app/confidentialite/page.tsx`
- `src/app/cookies/page.tsx`

Ressources a utiliser :

- Page existante `src/app/mentions-legales/page.tsx`
- Conseils juridiques du client ou juriste
- RGPD pour donnees personnelles

Critere de validation :

- Les liens de l'inscription fonctionnent.
- Le footer pointe vers les bonnes pages.

## Tache 32 - Ajouter les tests Playwright critiques

Periode : Jour 33 a Jour 35  
Priorite : haute

Objectif :

- Tester les parcours qui doivent toujours fonctionner.

Dossier a creer :

- `tests/e2e`

Ressources a utiliser :

- `@playwright/test`
- Seed de donnees
- Comptes de test

Tests prioritaires :

- Inscription au pair
- Inscription famille
- Connexion
- Redirection role
- Edition profil
- Recherche annuaire
- Envoi message avec abonnement actif
- Blocage message sans abonnement
- Validation profil admin
- Paiement simule ou webhook test

Critere de validation :

- `npx playwright test` passe en local.

## Tache 33 - Securiser les routes API

Periode : Jour 36  
Priorite : tres haute

Objectif :

- Verifier toutes les routes sensibles.
- Eviter les modifications non autorisees.

Ressources a utiliser :

- `auth()`
- Helpers `requireUser()` et `requireAdmin()`
- Validation `zod`
- Prisma where avec `userId`

Checklist :

- Toutes les routes admin exigent `ADMIN`.
- Toutes les routes profil exigent le proprietaire ou admin.
- La messagerie verifie blocage et abonnement.
- Les uploads verifient type, taille et session.
- Les webhooks verifient leur signature.

Critere de validation :

- Un utilisateur normal ne peut pas appeler une route admin.
- Un utilisateur ne peut pas modifier le profil d'un autre.

## Tache 34 - Ajouter rate limiting et logs

Periode : Jour 37  
Priorite : moyenne

Objectif :

- Reduire les abus sur auth, contact, messages et upload.
- Garder des logs utiles en production.

Ressources recommandees :

- Upstash Redis ou Vercel KV pour rate limiting
- Logs Vercel
- Sentry si budget disponible

Routes prioritaires :

- `/api/auth/register`
- `/api/auth/forgot-password`
- `/api/contact`
- `/api/messages`
- `/api/upload`

Critere de validation :

- Les abus repetes sont limites.
- Les erreurs serveur sont tracables.

## Tache 35 - Preparer le deploiement production

Periode : Jour 38  
Priorite : tres haute

Objectif :

- Mettre le projet en production proprement.

Ressources a utiliser :

- Vercel
- Supabase production
- Stripe production
- CinetPay production
- Resend domaine verifie
- Nom de domaine client

Checklist :

- Variables production configurees.
- `NEXTAUTH_URL` pointe vers le domaine final.
- Webhooks Stripe et CinetPay pointent vers le domaine final.
- Supabase Storage configure.
- Domaine email Resend verifie.
- `npm run build` passe.
- Les tests critiques passent.

Critere de validation :

- Le site est accessible publiquement.
- Les parcours critiques fonctionnent en production.

---

# Ordre strict conseille

1. Corriger lint et build.
2. Brancher Supabase PostgreSQL.
3. Ajouter seed.
4. Brancher inscription.
5. Finaliser connexion/deconnexion.
6. Brancher profils.
7. Brancher annuaires.
8. Ajouter pages detail.
9. Implementer abonnement.
10. Implementer messagerie.
11. Brancher admin.
12. Brancher contact.
13. Integrer Stripe.
14. Integrer CinetPay.
15. Ajouter emails.
16. Ajouter upload.
17. Ajouter pages legales.
18. Ajouter tests.
19. Securiser routes.
20. Deployer.

# Definition de "projet termine"

Le projet peut etre considere termine quand :

- un au pair peut s'inscrire, se connecter, completer son profil et payer son abonnement
- une famille peut s'inscrire, se connecter, completer son profil et contacter un au pair
- les annuaires affichent les profils reels valides
- la messagerie fonctionne avec controle d'abonnement
- l'admin peut moderer les profils et suivre les paiements
- les emails essentiels partent correctement
- les photos/documents peuvent etre uploades
- les pages legales sont presentes
- `npm run lint` passe
- `npm run build` passe
- les tests critiques Playwright passent
- le site fonctionne sur le domaine de production
