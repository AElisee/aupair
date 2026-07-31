# Plan de construction — Application mobile Flutter · AuPair A.EU

> **But de ce document** : servir de feuille de route unique, étape par étape, pour construire
> l'application mobile Flutter d'AuPair A.EU **par un développeur débutant en Flutter**, avec une
> architecture professionnelle (Clean Architecture), du code maintenable, les dernières versions
> des packages, et **toute la couche base de données isolée** dans une couche dédiée.
>
> **Aucun code n'est écrit ici** — c'est le plan à suivre avant d'écrire la moindre ligne.

---

## 0. Décisions d'architecture (validées) et leurs implications

| Décision | Choix retenu | Conséquence à gérer |
|---|---|---|
| **Authentification** | **Supabase Auth** (séparé de NextAuth du web) | Les comptes web existants (bcrypt dans `public.users`) **ne sont pas** dans `auth.users`. Ils ne pourront pas se connecter sur mobile tant qu'ils n'ont pas (re)créé un mot de passe côté Supabase. **Nouveaux comptes mobile** → un trigger Postgres crée automatiquement la ligne `public.users` + profil. |
| **Accès données** | **Supabase direct partout** (SDK Dart + RLS) | Toute la logique métier qui vivait dans les routes `/api/*` Next.js doit être **réimplémentée** côté base : politiques **RLS**, **fonctions Postgres (RPC)** et **Edge Functions** pour ce qui exige un secret (KKiaPay). |
| **Back-office admin** | **Exclu** du mobile | Aucun écran `/admin`. Les tables restent lues/écrites par le web pour l'admin. |
| **Config** | Variables dans **`.env.local`** | Uniquement des valeurs **publiques** (URL Supabase + clé `anon`). **Jamais** la `service_role` ni la clé privée KKiaPay dans l'app. |

### ⚠️ Points de vigilance critiques (à lire avant de commencer)

1. **Pont d'identités `auth.users` ↔ `public.users`**
   Le schéma actuel utilise des `id` de type **`cuid` (texte)** dans `public.users`, et toutes les clés
   étrangères (profils, messages, favoris…) pointent dessus. Supabase Auth génère des **`uuid`**.
   → Solution : à l'inscription, un **trigger `handle_new_user`** insère dans `public.users` une ligne dont
   `id = NEW.id::text` (l'uuid Supabase stocké comme texte). Les FK restant en texte, tout reste cohérent.

2. **Secrets serveur** : la clé privée KKiaPay et la `SUPABASE_SERVICE_ROLE_KEY` ne doivent **jamais**
   être embarquées dans l'app Flutter (elle est décompilable). Elles restent côté **Edge Functions**.

3. **Parité web/mobile** : chaque règle métier réimplémentée en RLS/RPC doit rester **cohérente** avec le
   comportement des routes Next.js pour éviter une divergence (ex. gating messagerie par abonnement).

---

## 1. Périmètre fonctionnel complet (rien n'est oublié)

Cartographie **route web → écran mobile → source Supabase**. Le back-office admin est **exclu**.

### 1.1 Authentification & compte
| Web | Écran mobile | Source Supabase |
|---|---|---|
| `/inscription` (choix rôle AU_PAIR/FAMILLE) | Inscription (email/mot de passe + rôle) | `auth.signUp` + trigger `handle_new_user` |
| `/connexion` (+ Google/Facebook) | Connexion + OAuth social | `auth.signInWithPassword`, `auth.signInWithOAuth` |
| `/mot-de-passe-oublie` | Mot de passe oublié | `auth.resetPasswordForEmail` |
| `/reinitialiser-mot-de-passe` | Réinitialisation (deep link) | `auth.updateUser` |
| `events.createUser` (auto-profil OAuth) | — (géré par le trigger) | trigger `handle_new_user` |

### 1.2 Rôle AU PAIR
| Web | Écran mobile | Source |
|---|---|---|
| `/dashboard/au-pair` | Accueil au pair (complétion %, vues, favoris reçus, messages, jours d'abonnement, familles suggérées) | RPC `dashboard_au_pair` (ou requêtes + calcul Dart) |
| `/dashboard/au-pair/profil` | Éditer profil au pair | table `au_pair_profiles` |
| `/dashboard/au-pair/recherche` | Rechercher des familles | table `family_profiles` (statut ACTIVE) |
| `/dashboard/au-pair/famille/[id]` | Détail famille (+ enregistre une vue) | `family_profiles` + `profile_views` |
| `/dashboard/au-pair/abonnement` | Abonnement (32 €/30 j) + paiement KKiaPay | `subscriptions`, `app_settings`, Edge Function paiement |
| `/dashboard/au-pair/messages` | Messagerie (bloquée sans abonnement actif) | `messages` (Realtime) |
| `/dashboard/au-pair/notifications` | Notifications | `notifications` |
| `/dashboard/au-pair/parametres` | Paramètres (mot de passe, langue, compte) | `auth`, `users` |

### 1.3 Rôle FAMILLE
| Web | Écran mobile | Source |
|---|---|---|
| `/dashboard/famille` | Accueil famille | RPC `dashboard_famille` |
| `/dashboard/famille/profil` | Éditer profil famille | `family_profiles` |
| `/dashboard/famille/recherche` | Rechercher des au pairs (seulement abonnés actifs) | `au_pair_profiles` + jointure abonnement |
| `/dashboard/famille/au-pair/[id]` | Détail au pair (+ vue, favori) | `au_pair_profiles`, `profile_views`, `favorites` |
| `/dashboard/famille/favoris` | Favoris | `favorites` |
| `/dashboard/famille/messages` | Messagerie (gratuit, illimité) | `messages` (Realtime) |
| `/dashboard/famille/notifications` | Notifications | `notifications` |
| `/dashboard/famille/parametres` | Paramètres | `auth`, `users` |

### 1.4 Fonctions transverses
| Fonction | Écran/comportement | Source |
|---|---|---|
| Photo de profil | Upload avatar | Storage bucket `avatars` |
| Pièces d'identité (au pair) | Upload documents | Storage bucket `id-documents` (à créer) |
| Pièces jointes messages | Image/PDF/DOC dans la conversation | Storage bucket `message-attachments` |
| Signaler un utilisateur | Bouton dans conversation/profil | `reports` |
| Bloquer / débloquer | Bouton dans conversation | `blocks` |
| Compteur messages non lus | Badge onglet Messages | `messages` (status SENT) |
| Compteur notifications non lues | Badge onglet Notifications | `notifications` |
| Vues de profil (hebdo) | Notification digest | Edge Function planifiée (`weekly-profile-views`) |
| Pays (origine/accueil, drapeaux, indicatifs) | Sélecteurs pays | table `countries` |
| Constantes (langues, niveaux, durées, motifs, prix) | Formulaires | table `app_settings` |
| Langue FR/EN | Sélecteur global | `intl` + préférence locale |

### 1.5 Pages « découverte » (public, lecture seule) — priorité basse
| Web | Écran mobile | Source |
|---|---|---|
| `/faq` | FAQ | `faq_items` |
| `/blog`, `/blog/[slug]` | Blog | `blog_posts` |
| `/tarifs` | Tarifs | `app_settings` |
| `/securite`, `/mentions-legales` | Sécurité / Mentions légales | contenu statique |
| `/contact` | Contact | `tickets` (insert) |
| Témoignages page d'accueil | Section témoignages | `testimonials` |

### 1.6 Exclu du mobile
Tout `/admin/*` : dashboard admin, utilisateurs, modération, paiements, analytics, blog admin, FAQ admin, tickets admin, pays admin, paramètres (email Resend, KKiaPay, constantes, compte admin).

---

## 2. Stack technique (dernières versions — à confirmer sur pub.dev avec `flutter pub add`)

> Bonne pratique : ne pas figer les versions à la main. Utiliser `flutter pub add <pkg>` qui récupère la
> dernière version compatible, puis committer le `pubspec.lock`.

### 2.1 Socle
| Outil | Rôle |
|---|---|
| **Flutter** (canal stable, ≥ 3.27) / **Dart** ≥ 3.6 | Framework & langage |
| **Android Studio** ou **VS Code** + extensions Flutter/Dart | IDE |
| **Git** | Versionnement (dépôt séparé ou dossier `mobile/` du monorepo) |

### 2.2 Packages (production)
| Package | Rôle | Pourquoi |
|---|---|---|
| `supabase_flutter` | Client Supabase (Auth, Postgres, Storage, Realtime) | **Seul** point d'accès backend |
| `flutter_riverpod` (+ `riverpod_annotation`) | Gestion d'état & injection de dépendances | Testable, sans BuildContext, code-gen propre |
| `go_router` | Navigation déclarative + deep links (OAuth/reset password) | Routing typé, redirections selon l'auth |
| `freezed_annotation` + `json_annotation` | Modèles immuables + (dé)sérialisation | Sécurité, égalité de valeur, `copyWith` |
| `flutter_dotenv` | Chargement de `.env.local` | Config URL + clé anon Supabase |
| `flutter_secure_storage` | Stockage sécurisé (préférences sensibles) | La session Supabase est déjà persistée par le SDK |
| `cached_network_image` | Affichage/cache des photos | Performance réseau |
| `image_picker` | Choisir/prendre une photo (avatar) | Upload profil |
| `file_picker` | Choisir un document (PDF/DOC, pièces jointes) | Messagerie & pièces d'identité |
| `google_fonts` | Police **Inter** (charte web) | Cohérence visuelle |
| `lucide_icons` (ou `material_symbols_icons`) | Icônes (mêmes que le web Lucide) | Cohérence visuelle |
| `intl` + `flutter_localizations` | Internationalisation FR/EN | Remplace `t(fr, en)` du web |
| `timeago` | Dates relatives (« il y a 3 min ») | Messagerie/notifications |
| `url_launcher` | Ouvrir WhatsApp / liens externes | Contact au pair/famille |
| `kkiapay_flutter_sdk` | Widget de paiement Mobile Money KKiaPay | **À vérifier sur pub.dev** ; sinon WebView du widget officiel |
| `fpdart` *(optionnel)* | `Either`/`Option` pour la gestion d'erreurs fonctionnelle | Peut être remplacé par un type `Result` maison plus simple pour débuter |

### 2.3 Packages (développement)
| Package | Rôle |
|---|---|
| `build_runner` | Génération de code (freezed, json, riverpod) |
| `freezed`, `json_serializable`, `riverpod_generator` | Générateurs |
| `flutter_lints` (ou `very_good_analysis`) | Règles de lint strictes |
| `mocktail` | Mocks pour les tests |
| `integration_test` (SDK) | Tests end-to-end |

---

## 3. Architecture Clean — arborescence cible

> Principe directeur (exigence du projet) : **AUCUN appel Supabase en dehors de `data/datasources/`.**
> Le `presentation` ne connaît que des **repositories abstraits** (interfaces `domain`). C'est la couche
> « base de données isolée » demandée.

```
lib/
├── main.dart                      # Point d'entrée : charge .env.local, init Supabase, runApp
├── app.dart                       # MaterialApp.router + thème + localization + ProviderScope
│
├── core/                          # Fondations transverses (aucune règle métier)
│   ├── config/
│   │   ├── env.dart               # Lecture typée de .env.local (SUPABASE_URL, SUPABASE_ANON_KEY)
│   │   └── supabase_config.dart   # Initialisation du client Supabase (singleton via provider)
│   ├── theme/
│   │   ├── app_colors.dart        # #E87722, #1A1A2E, #FFF3E0, #F5F5F5…
│   │   ├── app_typography.dart    # Inter (google_fonts)
│   │   └── app_theme.dart         # ThemeData Material 3
│   ├── router/
│   │   └── app_router.dart        # go_router : routes + redirections selon rôle/auth
│   ├── localization/
│   │   ├── l10n/                  # fichiers .arb (app_fr.arb, app_en.arb)
│   │   └── language_controller.dart # Provider langue courante (persistée)
│   ├── error/
│   │   ├── failures.dart          # Failure (Auth, Network, Server, NotFound, Permission…)
│   │   └── exceptions.dart        # Exceptions bas niveau (datasource)
│   ├── utils/
│   │   ├── date_utils.dart        # calculateAge, formatage YYYY-MM-DD
│   │   ├── phone_utils.dart       # splitPhoneNumber (indicatif + numéro)
│   │   └── validators.dart        # validation formulaires
│   └── widgets/                   # UI réutilisable (Button, Card, Badge, Avatar, EmptyState…)
│
├── data/                          # ⬅️ SEULE couche qui parle à Supabase
│   ├── models/                    # DTO freezed calqués sur les colonnes des tables
│   │   ├── user_model.dart
│   │   ├── au_pair_profile_model.dart
│   │   ├── family_profile_model.dart
│   │   ├── message_model.dart
│   │   ├── subscription_model.dart
│   │   ├── favorite_model.dart
│   │   ├── notification_model.dart
│   │   ├── country_model.dart
│   │   ├── app_settings_model.dart
│   │   └── … (report, block, blog_post, faq_item, testimonial)
│   ├── datasources/               # ⬅️ Tous les .from(...).select/insert/update, storage, realtime, rpc
│   │   ├── auth_remote_datasource.dart
│   │   ├── profile_remote_datasource.dart
│   │   ├── search_remote_datasource.dart
│   │   ├── message_remote_datasource.dart
│   │   ├── favorite_remote_datasource.dart
│   │   ├── subscription_remote_datasource.dart
│   │   ├── notification_remote_datasource.dart
│   │   ├── moderation_remote_datasource.dart   # reports + blocks
│   │   ├── storage_remote_datasource.dart      # uploads avatars/documents/pièces jointes
│   │   ├── reference_remote_datasource.dart    # countries + app_settings
│   │   └── content_remote_datasource.dart      # blog + faq + testimonials + contact
│   └── repositories/              # Implémentations : DTO → entités, mapping erreurs → Failure
│       ├── auth_repository_impl.dart
│       ├── profile_repository_impl.dart
│       └── … (une par domaine)
│
├── domain/                        # Cœur métier pur (aucune dépendance Flutter/Supabase)
│   ├── entities/                  # Entités immuables (User, AuPairProfile, Conversation…)
│   ├── repositories/              # Interfaces abstraites (contrats) implémentées par data/
│   └── usecases/                  # (Léger pour débuter) ex. SendMessage, ToggleFavorite
│
└── features/                      # UI par fonctionnalité (presentation)
    ├── auth/         {presentation/screens, presentation/controllers, presentation/widgets}
    ├── dashboard/
    ├── profile/
    ├── search/
    ├── messages/
    ├── favorites/
    ├── subscription/
    ├── notifications/
    ├── settings/
    └── discover/     # faq, blog, tarifs, sécurité, contact
```

**Flux d'une action** (ex. « envoyer un message ») :
`Écran` → `Controller (Riverpod Notifier)` → `Repository (interface)` → `Repository Impl` → `DataSource Supabase` → Supabase.
Le retour remonte en sens inverse, converti en **entité** propre, jamais en JSON brut.

---

## 4. Préparation du backend Supabase (prérequis à l'accès direct)

> Ces éléments se posent **côté Supabase** (SQL Editor / Dashboard / CLI). À faire **avant** l'étape data.
> Chaque règle doit refléter le comportement des routes `/api/*` du web pour garder la parité.

### 4.1 Pont d'identités + auto-profil
- Fonction + trigger **`handle_new_user`** sur `auth.users` (AFTER INSERT) :
  - insère dans `public.users` `{ id: NEW.id::text, email, name, role }` (rôle passé via `raw_user_meta_data`).
  - crée le profil correspondant : `au_pair_profiles` **ou** `family_profiles` selon le rôle (mêmes valeurs
    placeholder que `events.createUser` du web pour un au pair : `dateOfBirth 2000-01-01`, chaînes/arrays vides,
    `status PENDING`).

### 4.2 Row Level Security (RLS) — activer sur toutes les tables exposées
Politiques minimales (à affiner) :
- `users` / profils : lecture de son propre profil ; lecture publique des profils **ACTIVE** (pour la recherche).
- `au_pair_profiles` visibles en recherche **uniquement** si l'utilisateur a un abonnement **ACTIVE non expiré**
  (réplique la condition `subscriptions: { some: { status: ACTIVE, expiresAt > now } }`).
- `messages` : lecture/écriture seulement si `senderId = auth.uid()` ou `receiverId = auth.uid()` ;
  **insert bloqué** si l'auteur est `AU_PAIR` sans abonnement actif (gating) et si un `block` existe dans un sens
  ou l'autre.
- `favorites` : réservé au rôle `FAMILLE`, `userId = auth.uid()`.
- `notifications`, `subscriptions` : `userId = auth.uid()`.
- `reports`, `blocks` : insert par l'utilisateur courant ; pas de lecture croisée.
- `countries`, `app_settings`(lecture partielle), `blog_posts`, `faq_items`, `testimonials` : **lecture publique**
  (⚠️ n'exposer de `app_settings` que les colonnes publiques : prix, features, `kkiapayPublicKey`, langues,
  niveaux, durées, motifs — **jamais** `kkiapayPrivateKey`, `resendApiKey`). → créer une **vue** publique
  `app_settings_public` plutôt que d'ouvrir la table entière.

### 4.3 Fonctions Postgres (RPC) — pour la logique complexe
- `register_profile_view(target_id)` : calcule `weekKey`, `upsert` dans `profile_views`, incrémente `profileViews`.
- `dashboard_au_pair()` / `dashboard_famille()` : agrègent complétion %, compteurs, suggestions
  (réplique `rankSuggestions` — le classement des suggestions).
- `has_active_subscription(uid)` : utilisée par les politiques RLS et le client.

### 4.4 Storage (buckets)
- `avatars` (public) — déjà utilisé par le web.
- `message-attachments` (public) — déjà utilisé par le web.
- `id-documents` (**privé** recommandé, URLs signées) — pièces d'identité au pair.
- Politiques Storage : upload limité à `auth.uid()` dans son dossier ; types/tailles contrôlés (répliquer les
  limites web : images 5 Mo, documents 10 Mo).

### 4.5 Edge Functions (Deno) — pour ce qui exige un secret
- `kkiapay-verify` : reçoit `transactionId`, appelle `https://api.kkiapay.me/api/v1/transactions/{id}/status`
  avec la **clé privée** (secret de la fonction), et crée la ligne `subscriptions` si `SUCCESS`
  (réplique `/api/payments/kkiapay/verify`).
- `kkiapay-webhook` : notification serveur-à-serveur (réplique `/api/webhooks/kkiapay`).
- `weekly-profile-views` : planifiée (pg_cron/Scheduled Function) — digest hebdo des vues (réplique le cron).
- `contact` *(optionnel)* : envoi d'email via Resend si l'on veut garder l'email ; sinon simple `insert tickets`.

### 4.6 Realtime
- Activer Realtime sur la table **`messages`** (et éventuellement `notifications`) pour la messagerie live.

### 4.7 Configuration OAuth
- Activer **Google** et **Facebook** dans Supabase Auth (nouvelles apps OAuth ou réutilisation des mêmes
  identifiants, avec l'URL de redirection Supabase).
- Configurer le **deep link** mobile (`redirectTo`) pour le retour OAuth et la réinitialisation de mot de passe.

---

## 5. Étapes de développement (séquentiel, adapté débutant)

> Chaque étape a : **Objectif**, **Livrables**, **Points de vigilance**, **Definition of Done (DoD)**.
> Ne pas passer à l'étape suivante tant que la DoD n'est pas validée.

### Étape 0 — Environnement & prérequis
- **Objectif** : machine prête à développer en Flutter.
- **Livrables** : Flutter SDK installé, `flutter doctor` sans erreur, émulateur Android + (si Mac) simulateur iOS,
  IDE configuré, compte/projet Supabase accessible.
- **DoD** : `flutter create test_app && flutter run` affiche l'app compteur sur l'émulateur.

### Étape 1 — Création du projet & squelette
- **Objectif** : projet propre avec la structure Clean et la config.
- **Livrables** :
  - `flutter create` (org, nom de package Android/iOS définis).
  - Arborescence de dossiers de la section 3 (dossiers vides + README courts).
  - `pubspec.yaml` : ajout des packages de base (`flutter pub add …`) + déclaration de `.env.local` dans `assets`.
  - `.env.local` (SUPABASE_URL, SUPABASE_ANON_KEY) + `.env.local` ajouté au `.gitignore`, un `.env.example` committé.
  - `analysis_options.yaml` (lints), configuration `build_runner`.
- **Points de vigilance** : ne mettre que des valeurs **publiques** dans `.env.local`.
- **DoD** : l'app démarre, lit `.env.local`, aucune clé secrète dans le dépôt.

### Étape 2 — Backend Supabase prêt
- **Objectif** : exécuter la section 4 (RLS, trigger, buckets, RPC de base, OAuth, Realtime).
- **Livrables** : scripts SQL versionnés (dossier `supabase/` ou `docs/`), buckets créés, providers OAuth activés.
- **Points de vigilance** : tester le trigger `handle_new_user` avec une inscription de test (les deux rôles).
- **DoD** : une inscription de test crée bien `auth.users` + `public.users` + le bon profil ; les selects
  publics (countries, app_settings_public) fonctionnent avec la clé anon.

### Étape 3 — Couche `core`
- **Objectif** : fondations UI et techniques.
- **Livrables** : `env.dart`, `supabase_config.dart` (+ provider client), thème (couleurs/typo/ThemeData M3),
  `go_router` minimal (splash + une route), localization FR/EN branchée (`intl`), `failures.dart`,
  widgets partagés de base (bouton, carte, avatar, état vide, loader).
- **DoD** : app avec thème appliqué, navigation entre 2 écrans de démo, bascule FR/EN fonctionnelle.

### Étape 4 — Couche `data` + `domain` (la couche DB isolée)
- **Objectif** : modèles, datasources Supabase et repositories pour chaque domaine.
- **Livrables** :
  - `models/` freezed calqués sur chaque table (+ `fromJson`/`toJson`), génération via `build_runner`.
  - `domain/entities/` + `domain/repositories/` (interfaces).
  - `data/datasources/` : **toutes** les requêtes Supabase (select/insert/update/rpc/storage/realtime).
  - `data/repositories/` : mapping DTO→entité et exceptions→`Failure`.
  - Providers Riverpod exposant chaque repository.
- **Points de vigilance** : c'est **ici** et nulle part ailleurs que Supabase est appelé. Écrire cette couche
  domaine par domaine, en parallèle des étapes UI 5→13 (ne pas tout faire d'un bloc si trop long).
- **DoD** : un test unitaire (mocktail) valide qu'un repository transforme correctement une réponse simulée.

### Étape 5 — Authentification
- **Objectif** : inscription (avec rôle), connexion, OAuth, mot de passe oublié, session persistante, gardes de route.
- **Livrables** : écrans Connexion/Inscription/Mot de passe oublié/Réinitialisation, `auth_controller` (Riverpod),
  redirections `go_router` selon `authState` et `role`, gestion des deep links (OAuth + reset).
- **Points de vigilance** : passer le **rôle** dans `raw_user_meta_data` à `signUp` pour le trigger ;
  gérer l'écran d'attente de vérification email si activée.
- **DoD** : créer un compte au pair et un compte famille, se déconnecter/reconnecter, réinitialiser un mot de passe.

### Étape 6 — Profils (au pair & famille)
- **Objectif** : lecture et édition complète du profil + upload photo + (au pair) pièces d'identité + disponibilité.
- **Livrables** : écrans profil des deux rôles (tous les champs du schéma), upload avatar (`image_picker` → Storage),
  upload documents (`file_picker`), toggle `isAvailable`, sélecteurs pays (`countries`) et constantes (`app_settings`).
- **Points de vigilance** : recomposer les numéros WhatsApp (indicatif + numéro) comme le web ; dates en `YYYY-MM-DD`.
- **DoD** : modifier chaque champ, uploader une photo, recharger → les données persistent.

### Étape 7 — Tableaux de bord
- **Objectif** : accueil au pair et accueil famille.
- **Livrables** : écrans dashboard (complétion %, vues, favoris, messages non lus, jours d'abonnement, suggestions)
  via RPC `dashboard_au_pair` / `dashboard_famille`.
- **DoD** : les chiffres correspondent à ceux du web pour un même compte de test.

### Étape 8 — Recherche & détail de profil
- **Objectif** : recherche familles (côté au pair) et au pairs (côté famille) + fiches détail.
- **Livrables** : listes filtrables, cartes profil, écran détail, enregistrement de la vue (`register_profile_view`),
  bouton favori (famille), bouton contacter (ouvre la conversation).
- **Points de vigilance** : côté famille, ne lister que les au pairs **abonnés actifs** (RLS) ; côté au pair,
  familles **ACTIVE**.
- **DoD** : la recherche renvoie les mêmes profils que le web ; ouvrir une fiche incrémente les vues.

### Étape 9 — Messagerie (Realtime)
- **Objectif** : conversations, envoi texte + pièces jointes, accusés de lecture, blocage/signalement, badges non lus.
- **Livrables** : liste des conversations, écran conversation temps réel (Realtime `messages`), upload pièces jointes
  (Storage), marquage lu, actions bloquer/débloquer/signaler.
- **Points de vigilance** : **gating au pair** — un au pair sans abonnement actif ne peut pas envoyer (bloqué par RLS
  ET par l'UI, avec redirection vers l'abonnement) ; respecter les blocages dans les deux sens.
- **DoD** : deux comptes échangent des messages en temps réel ; un au pair non abonné est bloqué à l'envoi.

### Étape 10 — Abonnement & paiement KKiaPay
- **Objectif** : afficher l'offre (32 €/20 800 XOF/30 j), payer via KKiaPay, activer l'abonnement.
- **Livrables** : écran abonnement (statut, jours restants, features depuis `app_settings`), widget de paiement
  (`kkiapay_flutter_sdk` ou WebView), appel Edge Function **`kkiapay-verify`** au retour, rafraîchissement du statut.
- **Points de vigilance** : la vérification et la création de `subscriptions` se font **exclusivement** côté
  Edge Function (secret) ; ne jamais faire confiance au retour client seul.
- **DoD** : un paiement sandbox réussi crée une `subscription` ACTIVE et débloque la messagerie.

### Étape 11 — Notifications
- **Objectif** : lister/lire les notifications, badge non lus.
- **Livrables** : écran notifications, marquer lu / tout lire, badge sur l'onglet.
- **Optionnel (phase ultérieure)** : push via `firebase_messaging` (à cadrer séparément).
- **DoD** : les notifications s'affichent, le badge se met à jour.

### Étape 12 — Paramètres
- **Objectif** : changer le mot de passe, changer la langue, se déconnecter, (option) supprimer le compte.
- **Livrables** : écran paramètres, `auth.updateUser` (mot de passe), sélecteur langue persisté, déconnexion.
- **DoD** : changer la langue persiste au redémarrage ; changer le mot de passe fonctionne.

### Étape 13 — Découverte (public, lecture seule) — priorité basse
- **Objectif** : FAQ, blog, tarifs, sécurité, mentions légales, contact.
- **Livrables** : écrans lisant `faq_items`, `blog_posts`, `app_settings`, contenu statique, formulaire contact
  (`insert tickets` ou Edge Function email).
- **DoD** : contenu affiché correctement en FR/EN.

### Étape 14 — Tests, finitions & livraison
- **Objectif** : qualité, i18n complète, build stores.
- **Livrables** : tests unitaires (repositories/usecases), quelques tests widget/integration des parcours clés,
  passage lint à 0 warning, icônes/splash de l'app, gestion offline/erreurs, revue accessibilité,
  builds **Android (AAB)** et **iOS** signés.
- **DoD** : `flutter analyze` propre, tests au vert, build release généré.

---

## 6. Sécurité & bonnes pratiques (transverse, à respecter partout)

- **Jamais** de `service_role` ni de clé privée KKiaPay dans l'app ; secrets uniquement en Edge Functions.
- **RLS activée sur toutes les tables** exposées ; ne jamais compter sur la seule validation côté client.
- `app_settings` exposée via une **vue publique** filtrée (pas la table brute).
- Uploads : valider **type + taille** côté client ET via politiques Storage.
- Deep links (OAuth/reset) : restreindre les schémas/hôtes autorisés.
- Modèles **immuables** (freezed), pas de logique métier dans l'UI, appels Supabase **uniquement** en `datasources`.
- Gestion d'erreurs typée (`Failure`) remontée jusqu'à l'UI avec messages FR/EN clairs.

---

## 7. Priorisation (MVP → itérations)

1. **MVP** : Étapes 0–9 (auth, profils, dashboards, recherche, détail, messagerie) → app utilisable pour la mise en relation.
2. **Monétisation** : Étape 10 (abonnement KKiaPay) — indispensable pour la messagerie au pair.
3. **Engagement** : Étape 11 (notifications) + push plus tard.
4. **Confort** : Étape 12 (paramètres), Étape 13 (découverte).
5. **Qualité/Store** : Étape 14.

---

## 8. Checklist finale « ne rien oublier »

- [ ] Trigger `handle_new_user` (pont `auth.users` → `public.users` + profil).
- [ ] RLS sur **toutes** les tables + gating messagerie par abonnement + respect des blocages.
- [ ] Vue publique `app_settings_public` (sans secrets).
- [ ] Buckets `avatars`, `message-attachments`, `id-documents` + politiques.
- [ ] RPC : `register_profile_view`, `dashboard_au_pair`, `dashboard_famille`, `has_active_subscription`.
- [ ] Edge Functions : `kkiapay-verify`, `kkiapay-webhook`, `weekly-profile-views`, (option `contact`).
- [ ] Realtime activé sur `messages`.
- [ ] OAuth Google + Facebook + deep links (OAuth & reset password).
- [ ] Rôles AU_PAIR / FAMILLE complets ; **admin exclu**.
- [ ] i18n FR/EN sur tous les écrans.
- [ ] Pays/drapeaux/indicatifs et constantes chargés depuis la base.
- [ ] `.env.local` = valeurs publiques uniquement, gitignoré.
- [ ] Parité de comportement vérifiée avec le web sur : recherche, gating, vues de profil, abonnement.

---

## 9. Rappel de la contrainte forte du projet

> **Toute interaction avec la base de données (Supabase) est isolée dans `data/datasources/`.**
> Les couches `domain` et `features` n'importent jamais `supabase_flutter`. C'est le point de contrôle
> à vérifier à chaque revue de code (`grep` de `supabase` hors `data/datasources` doit être vide).
