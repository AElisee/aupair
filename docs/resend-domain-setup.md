# Configurer un domaine personnalisé pour les emails (Resend)

À faire **plus tard**, quand un nom de domaine est disponible pour le projet.
Voir aussi `docs/email-resend.md` pour la configuration de `resendApiKey` /
`emailFrom` dans `/admin/parametres/email`.

## Pourquoi

Resend exige que le domaine de l'adresse `From` soit vérifié (DNS SPF/DKIM).
Une adresse `@gmail.com`, `@outlook.com`, etc. ne peut pas être utilisée comme
expéditeur. Ce domaine n'a **pas besoin** d'être celui où le site est hébergé
(le site peut rester sur `*.vercel.app`), mais utiliser le même domaine pour
les deux est recommandé pour la cohérence et la délivrabilité.

## Étapes

1. **Acheter/posséder un nom de domaine** (OVH, Namecheap, Cloudflare, Gandi...).

2. **Ajouter le domaine sur Resend**
   - [resend.com](https://resend.com) → **Domains** → **Add Domain**
   - Entrer le domaine (ex. `aupair-aeu.com`), sans `www.`
   - Choisir une région (ex. `eu-west-1`)

3. **Ajouter les enregistrements DNS fournis par Resend** chez le registrar/DNS
   du domaine — généralement :
   - `MX` (hôte `send`) → `feedback-smtp.resend.com` (priorité 10)
   - `TXT` (hôte `send`) → `v=spf1 include:amazonses.com ~all`
   - `TXT` (hôte `resend._domainkey`) → clé DKIM fournie par Resend
   - `TXT` (hôte `_dmarc`, optionnel) → `v=DMARC1; p=none;`

   ⚠️ Copier les valeurs exactes affichées par Resend (spécifiques au domaine).
   Si le DNS est sur Cloudflare, désactiver le proxy (nuage orange → gris)
   pour ces enregistrements.

4. **Vérifier** : Resend → Domains → **Verify DNS Records** (propagation DNS :
   quelques minutes à 24h, souvent ~15 min). Statut `Pending` → `Verified`.

5. **Configurer l'expéditeur dans l'app**
   - `/admin/parametres/email` → `emailFrom` = `AuPair A.EU <contact@aupair-aeu.com>`
     (n'importe quelle adresse locale sur le domaine vérifié, pas besoin
     d'une vraie boîte mail)

6. **Mettre à jour `NEXT_PUBLIC_APP_URL`** (production) avec l'URL publique
   réelle du site (idéalement le même domaine, ex. `https://aupair-aeu.com`)
   — utilisé pour générer les liens dans les emails (validation de compte,
   réinitialisation de mot de passe...).
