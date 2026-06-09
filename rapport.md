# Rapport d'analyse du projet AuPair A.EU

Date d'analyse : 09 juin 2026  
Projet analyse : application Next.js `aupair`  
Document de reference : `docs/cahier-des-charges.html` et `docs/cahier-des-charges.pdf`

## 1. Resume executif

AuPair A.EU est une plateforme web de mise en relation entre des jeunes africains souhaitant devenir au pair et des familles d'accueil en Europe ou en Amerique du Nord. Le projet est bien avance sur la partie interface : les pages publiques, les dashboards, les pages d'administration, la charte graphique et les principaux parcours visuels sont deja en place.

En revanche, l'application n'est pas encore finalisee comme produit exploitable en production. Le backend metier reste largement a terminer : donnees reelles, inscription branchee, profils dynamiques, messagerie fonctionnelle, paiement, emails, upload de fichiers, moderation reelle et tests.

Estimation globale d'avancement : **40 %**.

Etat actuel :

- Interface utilisateur : **85 % a 90 %**
- Architecture technique : **55 %**
- Authentification : **35 %**
- Base de donnees / Prisma : **35 %**
- Fonctionnalites metier reelles : **15 %**
- Paiement / emails / stockage : **0 % a 5 %**
- Tests et qualite CI : **20 %**

Conclusion : le projet est un **prototype front-end avance**, avec une bonne base technique, mais il manque encore la majorite du comportement applicatif reel.

## 2. Fonctionnement prevu de l'application

L'application vise trois grands profils d'utilisateurs.

### Au pair

L'au pair cree un compte, complete son profil, renseigne son pays d'origine, ses langues, son experience avec les enfants, sa disponibilite et ses pays cibles. Il peut consulter les familles disponibles. Pour contacter les familles via la messagerie, il doit souscrire un abonnement de **32 EUR pour 30 jours**.

Au taux officiel BCEAO, **1 EUR = 655,957 FCFA**. L'abonnement de 32 EUR equivaut donc a environ **20 991 FCFA**, arrondi commercialement a **21 000 FCFA**.

Source taux de change : BCEAO, cours de reference EUR/XOF : https://www.bceao.int/fr/cours/cours-de-reference-des-principales-devises-contre-Franc-CFA

### Famille d'accueil

La famille cree un compte gratuitement, renseigne son profil, son pays, sa ville, le nombre d'enfants, les besoins, les taches attendues et les preferences. Elle peut parcourir les profils au pair et utiliser la messagerie sans abonnement payant.

### Administrateur

L'administrateur doit pouvoir gerer les utilisateurs, moderer les profils, suivre les paiements, consulter les signalements et piloter les contenus comme le blog, la FAQ et les tickets support.

Dans le code actuel, la zone admin existe visuellement, mais elle n'est pas encore branchee a des donnees reelles.

## 3. Fonctionnalites deja presentes

Les pages publiques principales existent :

- Accueil
- Devenir au pair
- Accueillir un au pair
- Trouver un au pair
- Trouver une famille
- Tarifs
- FAQ
- Contact
- Blog
- Article de blog dynamique
- Mentions legales
- Securite
- Sitemap
- Robots.txt

Les pages d'authentification existent :

- Connexion
- Inscription avec parcours en plusieurs etapes

Les dashboards existent :

- Dashboard au pair
- Profil au pair
- Messages au pair
- Abonnement au pair
- Dashboard famille

La zone admin existe :

- Dashboard admin
- Utilisateurs
- Moderation
- Paiements

La base technique existe :

- Next.js 16 avec App Router
- TypeScript
- Tailwind CSS
- Prisma 7
- NextAuth v5
- PostgreSQL prevu
- Stripe, Supabase, Resend et CinetPay prevus ou declares dans les dependances

## 4. Verification technique realisee

J'ai verifie le projet localement.

Resultat du build :

- `npm run build` : **reussi**
- Le projet compile en production.
- 28 pages statiques ou dynamiques sont generees.
- Les routes API presentes sont seulement :
  - `/api/auth/[...nextauth]`
  - `/api/auth/register`

Resultat du lint :

- `npm run lint` : **echoue**
- 85 problemes detectes :
  - 49 erreurs
  - 36 avertissements

Les erreurs sont principalement :

- Apostrophes et guillemets non echappes dans le JSX
- Imports inutilises
- Regle React sur `setState` appele directement dans un `useEffect`

Ce point doit etre corrige avant livraison professionnelle ou mise en CI.

## 5. Ecarts entre le cahier des charges et l'etat reel

### Inscription

La route `/api/auth/register` existe et cree un utilisateur avec profil associe. En revanche, la page `/inscription` n'appelle pas encore cette API. Elle affiche simplement un succes local apres clic.

Impact : un utilisateur peut croire qu'il est inscrit, alors qu'aucun compte n'est cree depuis l'interface.

### Connexion

La page `/connexion` appelle NextAuth et le fichier `src/lib/auth.ts` est configure avec Credentials, Google et Facebook.

Mais la connexion depend d'une base de donnees reelle et de variables d'environnement valides. Sans base configuree, le parcours ne peut pas fonctionner completement.

### Donnees dynamiques

Les annuaires, dashboards, listes admin, paiements, messages et contenus utilisent encore des donnees en dur dans les composants.

Impact : l'application ressemble a un produit fini, mais ne reflete pas encore les donnees reelles.

### Messagerie

La page de messages existe visuellement. Elle affiche des conversations mockees. Le controle d'abonnement est code en dur avec `hasSubscription = true`.

Impact : aucun message n'est enregistre, aucun destinataire ne recoit de message, et le blocage par abonnement n'est pas securise cote serveur.

### Paiement

Stripe et les references a CinetPay sont presents dans la documentation, les textes et les dependances, mais aucun vrai parcours de paiement n'est implemente.

Impact : aucun abonnement ne peut etre achete reellement.

### Upload

Supabase est prevu, mais l'upload des photos et documents n'est pas encore fonctionnel.

### Admin

Les pages admin sont belles et utiles pour le prototype, mais les actions ne modifient pas la base de donnees.

Impact : moderation, validation de profils, suppression, suivi des paiements et export restent a rendre reels.

### Pages legales

Les mentions legales existent. Les liens vers CGU et confidentialite sont presents dans l'inscription, mais les pages `/cgu` et `/confidentialite` ne sont pas presentes dans le projet.

## 6. Ce qu'il faut finaliser

Priorite 1 : rendre le produit utilisable

- Brancher l'inscription sur `/api/auth/register`
- Configurer PostgreSQL/Supabase et appliquer le schema Prisma
- Ajouter un seed initial : admin, profils au pair, familles, FAQ, blog
- Corriger les erreurs lint bloquantes
- Finaliser la connexion et la deconnexion
- Ajouter `SessionProvider` si necessaire pour les composants clients utilisant la session
- Remplacer les donnees mockees par Prisma sur les annuaires et dashboards
- Creer les API profils : lecture, edition, validation

Priorite 2 : rendre les fonctionnalites metier reelles

- Messagerie persistante en base
- Blocage serveur de la messagerie pour les au pairs sans abonnement actif
- Dashboard famille complet
- Pages de detail profil au pair et famille
- Favoris, signalement et blocage utilisateur
- Formulaire contact branche sur tickets support
- Actions admin reelles : valider, masquer, suspendre, supprimer

Priorite 3 : production et monetisation

- Stripe Checkout
- Webhook Stripe pour activer automatiquement les abonnements
- CinetPay pour Mobile Money en Cote d'Ivoire et Afrique de l'Ouest
- Emails Resend : bienvenue, confirmation, expiration d'abonnement
- Upload Supabase Storage : photos, documents
- Pages legales : CGU, CGV, confidentialite, cookies
- Tests Playwright sur les parcours critiques
- Durcissement securite : validation serveur, rate limiting, logs, erreurs propres

## 7. Estimation d'avancement total

Mon estimation est de **40 % d'avancement global**.

Justification :

- Le front-end est tres avance et couvre presque toute la navigation attendue.
- Le schema Prisma est riche et coherent.
- L'authentification est amorcee.
- Le middleware protege deja `/dashboard` et `/admin`.
- Mais les donnees reelles, les API metier, le paiement, la messagerie, les emails, l'upload et l'admin dynamique ne sont pas encore finalises.

Repartition estimee :

| Domaine | Avancement |
| --- | ---: |
| Pages publiques | 90 % |
| Design / UI / responsive | 85 % |
| Dashboards visuels | 75 % |
| Admin visuel | 70 % |
| Schema base de donnees | 80 % |
| Authentification reelle | 35 % |
| API metier | 10 % |
| Messagerie | 15 % |
| Paiement | 0 % |
| Emails | 0 % |
| Upload fichiers | 0 % |
| Tests / qualite | 20 % |
| Production / deploiement | 25 % |

## 8. Estimation du temps restant

### Option MVP exploitable

Objectif : inscription, connexion, profils reels, annuaires dynamiques, messagerie simple, abonnement simule ou paiement minimal, admin de base.

Temps estime : **18 a 25 jours ouvrables**.

Cela correspond a environ **4 a 5 semaines calendaires** si une seule personne travaille dessus correctement.

### Option version production complete

Objectif : MVP + Stripe, CinetPay, webhooks, emails, upload, pages legales, tests E2E, admin complet, corrections lint, securite et deploiement propre.

Temps estime : **35 a 45 jours ouvrables**.

Cela correspond a environ **7 a 9 semaines calendaires**.

## 9. Somme a facturer au client en Cote d'Ivoire

Je recommande de presenter deux montants.

### Montant recommande pour finaliser un MVP solide

**1 500 000 FCFA**

Ce prix couvre :

- Correction des problemes bloquants
- Base de donnees reelle
- Inscription / connexion fonctionnelles
- Profils dynamiques
- Annuaires dynamiques
- Messagerie simple
- Abonnement minimal
- Dashboard famille complete de base
- Admin branchee sur les donnees principales
- Deploiement initial

### Montant recommande pour finalisation production complete

**2 800 000 FCFA**

Ce prix couvre :

- Tout le MVP
- Stripe
- CinetPay / Mobile Money
- Webhooks de paiement
- Emails transactionnels
- Upload photos et documents
- Moderation complete
- Tickets support
- Pages legales
- Tests Playwright
- Corrections lint et qualite
- Securisation serveur
- Preparation deploiement production

Fourchette acceptable selon niveau d'exigence client :

- Minimum raisonnable : **2 400 000 FCFA**
- Prix recommande : **2 800 000 FCFA**
- Prix confortable avec marge et accompagnement : **3 500 000 FCFA**

Ces montants n'incluent pas forcement les frais externes :

- Nom de domaine
- Hebergement Vercel payant si necessaire
- Supabase payant si necessaire
- Frais Stripe / CinetPay
- Frais email Resend
- Maintenance mensuelle

Maintenance recommandee apres livraison : **150 000 a 300 000 FCFA / mois**, selon le volume de support et d'evolutions.

## 10. Proposition de decoupage de paiement

Pour limiter le risque, je recommande un paiement par jalons.

Pour une livraison production a **2 800 000 FCFA** :

| Jalon | Montant | Livrable |
| --- | ---: | --- |
| Demarrage | 840 000 FCFA | Audit final, corrections urgentes, configuration BDD |
| MVP fonctionnel | 840 000 FCFA | Auth, profils, annuaires, messagerie simple |
| Paiement et integrations | 700 000 FCFA | Stripe, CinetPay, emails, upload |
| Livraison finale | 420 000 FCFA | Tests, corrections, deploiement, documentation |

## 11. Risques principaux

Les principaux risques sont :

- Le front donne une impression de produit fini, alors que le backend est encore peu avance.
- Le schema Prisma est complet, mais il faut verifier qu'il couvre bien tous les formulaires existants.
- Les paiements demandent une attention forte : webhooks, securite, reconciliation, statuts d'abonnement.
- CinetPay peut demander des validations de compte marchand et des tests specifiques.
- Les pages admin contiennent des liens vers des sections non creees : analytics, blog admin, FAQ admin, tickets support.
- Les pages legales doivent etre completees avant exploitation commerciale.
- Le lint echoue actuellement, ce qui doit etre corrige avant livraison propre.

## 12. Plan de finalisation recommande

Semaine 1 :

- Corriger lint et imports inutilises
- Configurer PostgreSQL/Supabase
- Appliquer Prisma
- Ajouter seed
- Brancher inscription et connexion

Semaine 2 :

- Brancher profils au pair et famille
- Brancher annuaires avec filtres
- Creer pages detail profils
- Finaliser dashboard famille

Semaine 3 :

- Implementer messagerie persistante
- Implementer gating abonnement cote serveur
- Brancher contact et tickets support
- Brancher admin utilisateurs et moderation

Semaine 4 :

- Integrer Stripe
- Integrer CinetPay
- Ajouter webhooks
- Ajouter emails Resend

Semaine 5 :

- Upload Supabase Storage
- Pages legales
- Tests Playwright
- Corrections responsive et UX
- Deploiement production

Pour une version production complete, ajouter 2 a 4 semaines de securisation, tests, corrections client et stabilisation.

## 13. Conclusion

Le projet est prometteur et dispose deja d'une tres bonne base visuelle. Il peut etre transforme en application commerciale, mais il faut encore construire la partie qui donne de la valeur reelle : donnees persistantes, profils, messagerie, paiement, moderation et automatisation.

Avancement total retenu : **40 %**.  
Temps restant MVP : **18 a 25 jours ouvrables**.  
Temps restant production complete : **35 a 45 jours ouvrables**.  
Montant recommande a facturer pour finalisation complete : **2 800 000 FCFA**.  
Montant minimum pour MVP solide : **1 500 000 FCFA**.
