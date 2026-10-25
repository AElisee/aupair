import type { Lang } from "@/contexts/LanguageContext";

/**
 * Traductions anglaises des VALEURS stockées en base en français (et non des textes de l'interface,
 * qui sont dans `dashboard.ts`). Ces valeurs restent enregistrées en français — on ne traduit qu'à
 * l'affichage. Une valeur absente de ces listes (ex : langue ajoutée par l'admin) s'affiche telle quelle :
 * il suffit d'ajouter une ligne "valeur française": "English label" ci-dessous.
 */

// Langues parlées (constantes éditables dans /admin/parametres)
const LANGUAGES: Record<string, string> = {
  "Français": "French",
  "Anglais": "English",
  "Allemand": "German",
  "Espagnol": "Spanish",
  "Arabe": "Arabic",
  "Portugais": "Portuguese",
  "Italien": "Italian",
  "Néerlandais": "Dutch",
  "Chinois": "Chinese",
  "Russe": "Russian",
  "Wolof": "Wolof",
  "Lingala": "Lingala",
  "Swahili": "Swahili",
};

// Niveaux d'études
const EDUCATION_LEVELS: Record<string, string> = {
  "Brevet / BEPC": "Middle school certificate (Brevet / BEPC)",
  "Baccalauréat": "High school diploma (Baccalauréat)",
  "BTS / DUT": "Two-year technical degree (BTS / DUT)",
  "Licence / Bachelor": "Bachelor's degree",
  "Master": "Master's degree",
  "Doctorat": "PhD",
};

// Durées de séjour (les formats "N mois" / "N an(s)" non listés sont gérés par PATTERNS plus bas)
const DURATIONS: Record<string, string> = {
  "3 mois": "3 months",
  "6 mois": "6 months",
  "1 an": "1 year",
  "2 ans": "2 years",
};

// Motifs de signalement
const REPORT_REASONS: Record<string, string> = {
  "Faux profil": "Fake profile",
  "Comportement inapproprié": "Inappropriate behaviour",
  "Arnaque ou demande d'argent": "Scam or request for money",
  "Propos injurieux ou discriminatoires": "Abusive or discriminatory language",
  "Contenu inapproprié": "Inappropriate content",
};

// Avantages de l'abonnement
const SUBSCRIPTION_FEATURES: Record<string, string> = {
  "Profil visible par toutes les familles d'accueil": "Profile visible to all host families",
  "Messagerie illimitée avec les familles": "Unlimited messaging with families",
  "Accès aux coordonnées des familles": "Access to families' contact details",
  "Système de favoris": "Favourites",
  "Notifications de nouveaux profils correspondants": "Alerts for new matching profiles",
  "Support prioritaire": "Priority support",
};

// Pays (table Country, éditable dans /admin/pays)
const COUNTRIES: Record<string, string> = {
  "Algérie": "Algeria",
  "Bénin": "Benin",
  "Burkina Faso": "Burkina Faso",
  "Burundi": "Burundi",
  "Cameroun": "Cameroon",
  "Congo": "Congo",
  "Côte d'Ivoire": "Côte d'Ivoire",
  "Gabon": "Gabon",
  "Ghana": "Ghana",
  "Guinée": "Guinea",
  "Kenya": "Kenya",
  "Koweït": "Kuwait",
  "Madagascar": "Madagascar",
  "Mali": "Mali",
  "Maroc": "Morocco",
  "Niger": "Niger",
  "Nigeria": "Nigeria",
  "République démocratique du Congo": "Democratic Republic of the Congo",
  "RDC": "DR Congo",
  "Rwanda": "Rwanda",
  "Sénégal": "Senegal",
  "Tchad": "Chad",
  "Togo": "Togo",
  "Tunisie": "Tunisia",
  "Allemagne": "Germany",
  "Autriche": "Austria",
  "Belgique": "Belgium",
  "Canada": "Canada",
  "Espagne": "Spain",
  "États-Unis": "United States",
  "France": "France",
  "Irlande": "Ireland",
  "Italie": "Italy",
  "Luxembourg": "Luxembourg",
  "Pays-Bas": "Netherlands",
  "Royaume-Uni": "United Kingdom",
  "Suisse": "Switzerland",
};

// Divers
const MISC: Record<string, string> = {
  "Femme": "Female",
  "Homme": "Male",
  "Autre": "Other",
  "Nouvelle conversation": "New conversation",
  // Expérience déclarée à l'inscription ("1 an", "2 ans"… sont gérés par VALUE_PATTERNS)
  "Moins d'1 an": "Less than 1 year",
  "5 ans et plus": "5 years or more",
};

const VALUES: Record<string, string> = {
  ...LANGUAGES,
  ...EDUCATION_LEVELS,
  ...DURATIONS,
  ...REPORT_REASONS,
  ...SUBSCRIPTION_FEATURES,
  ...COUNTRIES,
  ...MISC,
};

const VALUE_PATTERNS: [RegExp, (m: RegExpMatchArray) => string][] = [
  [/^(\d+) mois$/, (m) => `${m[1]} month${m[1] === "1" ? "" : "s"}`],
  [/^(\d+) ans?$/, (m) => `${m[1]} year${m[1] === "1" ? "" : "s"}`],
];

export function translateValue(value: string | null | undefined, lang: Lang): string {
  if (!value) return "";
  if (lang === "fr") return value;
  const exact = VALUES[value];
  if (exact) return exact;
  for (const [pattern, build] of VALUE_PATTERNS) {
    const match = value.match(pattern);
    if (match) return build(match);
  }
  return value;
}

/**
 * Messages d'erreur renvoyés par les routes /api (toujours en français) qui peuvent s'afficher
 * dans les espaces au pair & famille. Un message absent de la liste s'affiche en français.
 */
const SERVER_ERRORS: Record<string, string> = {
  "Non authentifié": "You are not signed in.",
  "Non authentifié.": "You are not signed in.",
  "Non autorisé.": "Not allowed.",
  "Accès refusé": "Access denied.",
  "Accès réservé aux au pairs.": "Only au pairs can do this.",
  "Requête invalide.": "Invalid request.",
  "Profil introuvable.": "Profile not found.",
  "Utilisateur introuvable": "User not found.",
  "Destinataire introuvable": "Recipient not found.",
  "Document introuvable.": "Document not found.",
  "Conversation invalide": "Invalid conversation.",
  "Paramètres manquants": "Missing parameters.",
  "L'envoi d'emails n'est pas configuré (Paramètres > Email).": "Email sending is not configured (Settings > Email).",
  "Échec de l'envoi de l'email.": "Failed to send the email.",
  "Tous les champs sont obligatoires.": "All fields are required.",
  "Le genre est obligatoire.": "Gender is required.",
  "Erreur lors de la sauvegarde du profil.": "Error while saving your profile.",
  "Le champ isAvailable est requis.": "Invalid request.",
  "Votre profil a été masqué par un administrateur. Vous ne pouvez pas le rendre disponible vous-même.":
    "Your profile has been hidden by an administrator. You cannot make it available yourself.",
  "Aucun fichier reçu.": "No file received.",
  "Le fichier dépasse 5 Mo.": "The file exceeds 5 MB.",
  "Format invalide. Utilisez un JPG ou PNG.": "Invalid format. Please use a JPG or PNG.",
  "Format invalide. Utilisez un JPG, PNG ou PDF.": "Invalid format. Please use a JPG, PNG or PDF.",
  "Type de fichier non supporté. Utilisez une image (JPG, PNG, WEBP) ou un document (PDF, DOC, DOCX).":
    "Unsupported file type. Please use an image (JPG, PNG, WEBP) or a document (PDF, DOC, DOCX).",
  "Échec de l'envoi de la photo.": "Failed to upload the photo.",
  "Échec de l'envoi du document.": "Failed to upload the document.",
  "Échec de l'envoi du fichier.": "Failed to upload the file.",
  "Fichier et destinataire requis": "A file and a recipient are required.",
  "Mot de passe actuel incorrect.": "Current password is incorrect.",
  "Le nouveau mot de passe doit contenir au moins 8 caractères.":
    "The new password must be at least 8 characters long.",
  "Aucun mot de passe n'est défini pour ce compte.": "No password is set for this account.",
  "Un abonnement actif est requis pour envoyer des messages.": "An active subscription is required to send messages.",
  "Vous ne pouvez pas vous envoyer un message à vous-même": "You cannot send a message to yourself.",
  "Impossible d'envoyer un message à cet utilisateur": "You cannot send a message to this user.",
  "receiverId et content sont requis": "Invalid request.",
  "Vous ne pouvez pas vous signaler vous-même": "You cannot report yourself.",
  "Vous ne pouvez pas vous bloquer vous-même": "You cannot block yourself.",
  "reportedId et reason sont requis": "Invalid request.",
  "Le paiement n'est pas configuré.": "Payment is not configured.",
  "Le paiement n'est pas encore configuré.": "Payment is not configured yet.",
  "Renseignez la clé publique et la clé secrète de cet agrégateur avant de l'activer.":
    "Enter this provider's public key and secret key before enabling it.",
  "Les liens des réseaux sociaux doivent être des URL complètes commençant par https://.":
    "Social network links must be full URLs starting with https://.",
  "Impossible d'initier le paiement.": "Unable to start the payment.",
  "Impossible de générer le lien de paiement.": "Unable to generate the payment link.",
  "Impossible de vérifier le paiement.": "Unable to verify the payment.",
  "Le paiement a échoué ou a été annulé.": "The payment failed or was cancelled.",
  "Identifiant de transaction manquant.": "Missing transaction ID.",
  "Référence invalide.": "Invalid reference.",
  "Votre abonnement est déjà actif.": "Your subscription is already active.",
  // Inscription, mot de passe oublié, contact
  "Adresse email invalide.": "Invalid email address.",
  "Champs obligatoires manquants.": "Required fields are missing.",
  "Date de naissance invalide.": "Invalid date of birth.",
  "La date de naissance est obligatoire.": "Date of birth is required.",
  "Le pays d'accueil est obligatoire.": "Host country is required.",
  "Nombre d'enfants invalide.": "Invalid number of children.",
  "Rôle invalide.": "Invalid role.",
  "Un compte existe déjà avec cet email.": "An account already exists with this email.",
  "Vous devez avoir au moins 18 ans pour vous inscrire en tant qu'au pair.":
    "You must be at least 18 years old to sign up as an au pair.",
  "Erreur lors de la création du compte.": "Error while creating the account.",
  "Impossible de contacter la base de données.": "Unable to reach the database.",
  "Trop de tentatives d'inscription. Merci de réessayer plus tard.": "Too many sign-up attempts. Please try again later.",
  "Ce lien de réinitialisation est invalide ou a expiré.": "This reset link is invalid or has expired.",
  "Lien de réinitialisation invalide.": "Invalid reset link.",
  "Le mot de passe doit contenir au moins 8 caractères.": "The password must be at least 8 characters long.",
  "Le message doit contenir au moins 10 caractères.": "The message must be at least 10 characters long.",
  "Sujet invalide.": "Invalid subject.",
  "Merci de préciser l'objet (100 caractères max).": "Please specify the subject (100 characters max).",
  "Trop de messages envoyés. Merci de réessayer plus tard.": "Too many messages sent. Please try again later.",
  "Le nom est obligatoire.": "Name is required.",
  "Profil invalide.": "Invalid profile.",
  "Pays invalide.": "Invalid country.",
  "La note doit être comprise entre 1 et 5.": "The rating must be between 1 and 5.",
  "Trop d'avis envoyés. Merci de réessayer plus tard.": "Too many reviews sent. Please try again later.",
  "Une pièce d'identité est obligatoire.": "An identity document is required.",
  // Back-office
  "Article introuvable": "Article not found.",
  "Ce pays existe déjà": "This country already exists.",
  "Corps de requête invalide": "Invalid request body.",
  "Échec de l'envoi de l'image.": "Failed to upload the image.",
  "Format invalide. Utilisez une image JPG, PNG ou WEBP.": "Invalid format. Please use a JPG, PNG or WEBP image.",
  "Identifiant invalide.": "Invalid identifier.",
  "Identifiant, titre et contenu sont obligatoires.": "Identifier, title and content are required.",
  "La durée de l'abonnement (jours) est invalide.": "The subscription length (days) is invalid.",
  "Le contenu est obligatoire.": "Content is required.",
  "Le prix de l'abonnement (EUR) est invalide.": "The subscription price (EUR) is invalid.",
  "Le prix de l'abonnement (XOF) est invalide.": "The subscription price (XOF) is invalid.",
  "Le titre est obligatoire.": "Title is required.",
  "Priorité invalide": "Invalid priority.",
  "Profil introuvable": "Profile not found.",
  "Question, réponse et catégorie sont obligatoires.": "Question, answer and category are required.",
  "Rôle invalide": "Invalid role.",
  "Statut invalide": "Invalid status.",
  "Ticket introuvable": "Ticket not found.",
  "Titre, contenu, catégorie et auteur sont obligatoires.": "Title, content, category and author are required.",
  "Type invalide": "Invalid type.",
};

const SERVER_ERROR_PATTERNS: [RegExp, (m: RegExpMatchArray) => string][] = [
  [
    /^Le fichier dépasse la taille maximale autorisée \((\d+) Mo\)\.$/,
    (m) => `The file exceeds the maximum allowed size (${m[1]} MB).`,
  ],
  [
    /^L'avis doit contenir entre (\d+) et (\d+) caractères\.$/,
    (m) => `The review must be between ${m[1]} and ${m[2]} characters long.`,
  ],
  [
    /^Vous ne pouvez pas envoyer plus de (\d+) documents au total\.$/,
    (m) => `You cannot upload more than ${m[1]} documents in total.`,
  ],
  // Back-office (paramètres)
  [/^Le champ "(.+)" doit être un booléen\.$/, (m) => `The "${m[1]}" field must be a boolean.`],
  [/^Le champ "(.+)" doit être une liste de textes non vides\.$/, (m) => `The "${m[1]}" field must be a list of non-empty texts.`],
  [/^Le champ "(.+)" doit être une chaîne\.$/, (m) => `The "${m[1]}" field must be a string.`],
  [/^Le champ "emailFrom" doit être une adresse email/, () => `The "emailFrom" field must be an email address, e.g. "AuPair A.EU <contact@domain.com>".`],
  [/^Le champ "fedapayEnvironment" doit être/, () => `The "fedapayEnvironment" field must be "sandbox" or "live".`],
  [/^Le champ "paymentProvider" doit être/, () => `The "paymentProvider" field must be "fedapay" or "geniuspay".`],
  [/^Le champ "heroImageUrl" doit être/, () => `The "heroImageUrl" field must be a non-empty URL or path.`],
  [/^Un document avec l'identifiant « (.+) » existe déjà\.$/, (m) => `A document with the identifier "${m[1]}" already exists.`],
];

export function translateServerError(message: string, lang: Lang): string {
  if (lang === "fr") return message;
  const exact = SERVER_ERRORS[message];
  if (exact) return exact;
  for (const [pattern, build] of SERVER_ERROR_PATTERNS) {
    const match = message.match(pattern);
    if (match) return build(match);
  }
  return message;
}
