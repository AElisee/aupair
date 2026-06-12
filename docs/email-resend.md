# Envoi d'emails avec Resend

AuPair A.EU utilise [Resend](https://resend.com) pour l'envoi de tous les emails
transactionnels (réinitialisation de mot de passe, confirmation de contact,
réponses aux tickets de support, etc.).

La configuration (clé API et adresse d'expédition) **n'est pas stockée dans `.env`**.
Elle est gérée par l'administrateur depuis le back-office, dans
**`/admin/parametres/email`**, et persistée dans la table `app_settings`
(`resendApiKey`, `emailFrom`). Cela permet de changer de clé ou d'expéditeur
sans redéployer l'application.

## 1. Créer un compte Resend et obtenir une clé API

1. Créer un compte sur [resend.com](https://resend.com).
2. Aller dans **API Keys** ([resend.com/api-keys](https://resend.com/api-keys)) et créer une
   clé (permission "Sending access" suffit).
3. Copier la clé (elle commence par `re_...`, elle n'est affichée qu'une seule fois).

## 2. Configurer l'adresse d'expédition

Resend exige que le **domaine** de l'adresse `From` soit vérifié dans
**Domains** sur resend.com (ajout d'enregistrements DNS SPF/DKIM fournis par
Resend). Une adresse générique (gmail.com, outlook.com, ...) ne peut pas être
vérifiée et **ne peut pas être utilisée comme expéditeur**.

- Pour les tests, Resend fournit un domaine prêt à l'emploi :
  `onboarding@resend.dev` — mais en mode test (sans domaine vérifié), Resend
  n'autorise l'envoi qu'**à l'adresse email du compte Resend lui-même**.
- En production, utilisez une adresse sur un domaine que vous avez vérifié,
  par ex. `AuPair A.EU <contact@aupair-aeu.com>`.

## 3. Configurer dans le back-office

1. Se connecter en tant qu'admin et aller sur `/admin/parametres/email`.
2. Renseigner la **clé API Resend** (`re_...`).
3. Renseigner l'**adresse d'expédition**, au format `email@domaine.com` ou
   `Nom Affiché <email@domaine.com>`.
4. Cliquer sur **Enregistrer**.

Tant que la clé API ou l'adresse d'expédition ne sont pas renseignées, `sendMail()`
(`src/lib/mail.ts`) n'envoie aucun email et écrit une erreur explicite dans les
logs serveur (`[mail] Envoi annulé — configuration Resend incomplète...`).

## 4. Tester en local

1. Configurer la clé API et l'adresse d'expédition comme ci-dessus (utiliser
   `onboarding@resend.dev` et envoyer uniquement vers l'email associé à votre
   compte Resend si vous n'avez pas encore de domaine vérifié).
2. Lancer `npm run dev`.
3. Aller sur `/mot-de-passe-oublie`, saisir l'email d'un compte existant
   (avec mot de passe — les comptes OAuth sans mot de passe ne reçoivent pas
   d'email, voir ci-dessous).
4. Observer les logs serveur (`[forgot-password]` et `[mail]`) :
   - génération du lien de réinitialisation,
   - tentative d'envoi,
   - succès (`id` Resend retourné) ou erreur détaillée.
5. Le lien de réinitialisation utilise `NEXT_PUBLIC_APP_URL` si défini, sinon
   l'origine de la requête (`http://localhost:3000` en local).

## 5. Déployer en production

1. S'assurer que `NEXT_PUBLIC_APP_URL` est défini sur l'URL publique de
   l'application (Vercel) — il est utilisé pour générer les liens dans les
   emails.
2. Vérifier le domaine d'expédition dans Resend (DNS SPF/DKIM) avant de
   configurer `emailFrom` avec ce domaine en production.
3. Configurer la clé API et l'adresse d'expédition de production dans
   `/admin/parametres/email` — aucune variable d'environnement à redéployer.

## Pourquoi les emails de réinitialisation n'arrivaient pas

L'ancienne implémentation lisait `RESEND_API_KEY` / `RESEND_FROM_EMAIL` depuis
`.env`, qui n'étaient pas définies. `sendMail()` détectait l'absence de clé et
se contentait d'un `console.warn` sans envoyer l'email, alors que l'API
`/api/auth/forgot-password` répondait toujours `{ ok: true }` (volontairement,
pour ne pas révéler si un email existe en base) — donnant l'impression que
l'email avait été envoyé.
