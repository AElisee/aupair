export const LANGUAGES = [
  "Français",
  "Anglais",
  "Allemand",
  "Espagnol",
  "Arabe",
  "Portugais",
];

export const SUBSCRIPTION_PRICE_EUR = 32;
export const SUBSCRIPTION_PRICE_XOF = 20800;
export const SUBSCRIPTION_DAYS = 30;

/** Base ajoutée au nombre réel d'inscrits pour les compteurs publics (accueil, connexion) — voir `public-stats.ts`. */
export const AU_PAIRS_BASE_COUNT = 2000;
export const FAMILIES_BASE_COUNT = 1500;

export const SUBSCRIPTION_FEATURES = [
  "Profil visible par toutes les familles d'accueil",
  "Messagerie illimitée avec les familles",
  "Accès aux coordonnées des familles",
  "Système de favoris",
  "Notifications de nouveaux profils correspondants",
  "Support prioritaire",
];

export const EDUCATION_LEVELS = [
  "Brevet / BEPC",
  "Baccalauréat",
  "BTS / DUT",
  "Licence / Bachelor",
  "Master",
  "Doctorat",
  "Autre",
];

export const DURATIONS = ["3 mois", "6 mois", "1 an", "2 ans"];

/** Nombre d'enfants maximal accepté à l'inscription d'une famille (saisie libre comprise). */
export const MAX_NUMBER_OF_KIDS = 20;

export const REPORT_REASONS = [
  "Faux profil",
  "Comportement inapproprié",
  "Arnaque ou demande d'argent",
  "Propos injurieux ou discriminatoires",
  "Contenu inapproprié",
  "Autre",
];

/** Durée de vie absolue d'une session ADMIN, indépendante de l'activité — le back-office donne accès
 * aux paiements et à la modération, donc on force une reconnexion régulière même si le JWT est encore valide. */
export const ADMIN_SESSION_MAX_AGE_MS = 8 * 60 * 60 * 1000;

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  MOBILE_MONEY: "Mobile Money",
  CARD: "Carte bancaire",
  FEDAPAY: "FedaPay",
  GENIUSPAY: "GeniusPay",
};

/** Boîte qui reçoit les messages du formulaire /contact (affichée aussi sur la page). */
export const CONTACT_EMAIL = "contact@aupairaeu.com";

/** Boîte de l'équipe qui reçoit les notifications internes (nouvelles inscriptions…). */
export const SUPPORT_EMAIL = "support@aupairaeu.com";

export const CONTACT_SUBJECTS: Record<string, string> = {
  inscription: "Inscription / Compte",
  paiement: "Paiement / Abonnement",
  profil: "Mon profil",
  signalement: "Signalement",
  autre: "Autre",
};
