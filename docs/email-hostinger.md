# Boîte mail professionnelle (Hostinger) + domaine Vercel

Plan pour recevoir et répondre aux mails de `contact@aupairaeu.com` (Hostinger Starter Business Email), tout en gardant le domaine chez Vercel et Resend pour les mails automatiques de l'app.

> ⚠️ Vérifier l'orthographe du domaine avant l'achat : le code utilise `aupairaeu.com` (`src/lib/email-templates.ts`).

## Principe

| Usage | Service | Adresse |
|---|---|---|
| Mails humains (recevoir / répondre) | Hostinger | `contact@aupairaeu.com` (+ alias) |
| Mails automatiques de l'app (inscription, mot de passe, tickets…) | Resend | `no-reply@aupairaeu.com` |
| DNS du domaine | Vercel | — |

- Le domaine reste chez Vercel : **ne pas** changer les nameservers vers Hostinger (le site ne s'afficherait plus). On ajoute seulement des enregistrements DNS dans Vercel.
- Resend reste en charge des mails transactionnels : meilleure délivrabilité, et pas de limite d'envoi Hostinger.

## 1. Achat chez Hostinger

1. Choisir **Starter Business Email**. Une seule boîte suffit (ex. `contact@aupairaeu.com`), car l'offre inclut 5 alias gratuits (`support@`, `admin@`, `paiements@`…) qui arrivent tous dans la même boîte.
2. À l'étape du domaine, choisir « J'ai déjà un domaine » et saisir `aupairaeu.com`.
3. Créer la boîte et son mot de passe. Hostinger affiche ensuite les enregistrements DNS à ajouter : garder cette page ouverte.

## 2. DNS dans Vercel

Dans Vercel, aller dans **Domains**, puis `aupairaeu.com`, puis **DNS Records**, et ajouter les enregistrements suivants. Toujours recopier les valeurs exactes affichées par Hostinger, elles peuvent varier un peu.

| Type | Nom | Valeur | Priorité |
|---|---|---|---|
| MX | `@` | `mx1.hostinger.com` | 5 |
| MX | `@` | `mx2.hostinger.com` | 10 |
| TXT | `@` | `v=spf1 include:_spf.mail.hostinger.com ~all` | – |
| CNAME | `hostingermail-a._domainkey` | `hostingermail-a.dkim.mail.hostinger.com` | – |
| CNAME | `hostingermail-b._domainkey` | `hostingermail-b.dkim.mail.hostinger.com` | – |
| CNAME | `hostingermail-c._domainkey` | `hostingermail-c.dkim.mail.hostinger.com` | – |
| CNAME | `autodiscover` / `autoconfig` | (valeurs indiquées par Hostinger) | – |
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:contact@aupairaeu.com` | – |

- **Avant d'ajouter** : supprimer tout ancien MX ou SPF sur `@`. Il ne doit y avoir **qu'un seul** enregistrement SPF (`v=spf1`) sur la racine.
- **Vérification** : retourner dans le panneau Hostinger et cliquer sur « Vérifier ». La propagation prend de quelques minutes à quelques heures.
- **Test** : envoyer un mail depuis un Gmail perso vers `contact@`, puis répondre depuis le webmail Hostinger (`mail.hostinger.com`).

## 3. Mails de l'application (Resend)

L'app envoie déjà ses mails via `sendMail()` (`src/lib/mail.ts`), configuré dans `/admin/parametres/email` (voir `docs/email-resend.md`).

1. **Ajouter le domaine dans Resend** : sur resend.com, aller dans **Domains**, puis « Add domain » et saisir `aupairaeu.com`.
2. **Ajouter les DNS de Resend dans Vercel** : Resend fournit un DKIM `resend._domainkey`, plus un MX et un TXT SPF sur le sous-domaine `send`. Ces enregistrements ne touchent pas la racine, donc **ils n'entrent pas en conflit avec Hostinger**.
3. **Valider** : cliquer sur « Verify » dans Resend.
4. **Régler l'app** : dans `/admin/parametres/email`, renseigner :
   - la clé API Resend ;
   - l'expéditeur : `AuPair A.EU <no-reply@aupairaeu.com>`.
5. **Tester** : lancer « mot de passe oublié » sur son propre compte (`src/app/api/auth/forgot-password/route.ts` envoie déjà le mail).

### Reste à développer

- **Mail de confirmation d'inscription** : il n'existe pas encore, `/api/auth/register` n'envoie aucun mail. Il faut ajouter un modèle de mail dans `src/lib/email-templates.ts` et un appel à `sendMail()` après la création du compte. Si on veut une vraie vérification de l'adresse, il faut aussi un jeton et une page de confirmation.
- **Option** : ajouter un `reply_to: contact@aupairaeu.com` dans `sendMail()`, pour que les utilisateurs qui répondent à un mail automatique arrivent dans la boîte Hostinger.

## 4. App Gmail sur le téléphone

1. Dans l'app Gmail, toucher son avatar, puis **Ajouter un compte**, puis **Autre**.
2. Saisir `contact@aupairaeu.com`, choisir **Personnel (IMAP)**, puis le mot de passe de la boîte.
3. Paramètres du serveur entrant : `imap.hostinger.com`, port **993**, SSL.
4. Paramètres du serveur sortant : `smtp.hostinger.com`, port **465**, SSL. L'identifiant est l'adresse complète.
5. **Test** : envoyer un mail vers `contact@` et y répondre depuis le téléphone. Vérifier que l'expéditeur affiché est bien `contact@aupairaeu.com`.

> Sur ordinateur, Gmail web ne récupère plus les mails des autres comptes (POP) depuis 2026 : utiliser le webmail Hostinger.

## 5. Vérification finale

- Aller sur [mail-tester.com](https://www.mail-tester.com) et envoyer un mail de test **depuis Hostinger**, puis un autre **depuis l'app (Resend)**. Viser un score d'au moins 9/10 pour chacun.
- Après quelques semaines sans problème, passer le DMARC de `p=none` à `p=quarantine`.
