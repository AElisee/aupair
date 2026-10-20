import type { Dictionary } from "./index";

/**
 * Tous les textes des espaces au pair (/dashboard/au-pair) et famille (/dashboard/famille), en FR et EN.
 *
 * Pour modifier un texte : trouver la section (une par page ou composant) et changer `fr` et/ou `en`.
 * Pour ajouter un texte : ajouter une entrée { fr: "...", en: "..." } puis l'utiliser via `t.section.cle`.
 * Les entrées avec paramètres sont des fonctions (ex : `kids: { fr: (n: number) => ..., en: ... }`).
 *
 * Les valeurs venant de la base (pays, langues, niveaux d'études…) sont traduites dans `values.ts`.
 */
export const dashboard = {
  // ─── Textes partagés ───────────────────────────────────────────────────────
  common: {
    loading: { fr: "Chargement...", en: "Loading..." },
    loadProfileError: { fr: "Impossible de charger ce profil.", en: "Unable to load this profile." },
    genericError: { fr: "Une erreur est survenue.", en: "Something went wrong." },
    networkError: { fr: "Erreur réseau, veuillez réessayer.", en: "Network error, please try again." },
    yes: { fr: "Oui", en: "Yes" },
    no: { fr: "Non", en: "No" },
    select: { fr: "Sélectionner", en: "Select" },
    selectCountry: { fr: "Sélectionner un pays", en: "Select a country" },
    close: { fr: "Fermer", en: "Close" },
    cancel: { fr: "Annuler", en: "Cancel" },
    delete: { fr: "Supprimer", en: "Delete" },
    available: { fr: "Disponible", en: "Available" },
    unavailable: { fr: "Indisponible", en: "Unavailable" },
    filters: { fr: "Filtres", en: "Filters" },
    resetFilters: { fr: "Réinitialiser les filtres", en: "Reset filters" },
    addToFavorites: { fr: "Ajouter aux favoris", en: "Add to favourites" },
    removeFromFavorites: { fr: "Retirer des favoris", en: "Remove from favourites" },
    chat: { fr: "Discuter", en: "Chat" },
    /** Salutation selon l'heure de l'appareil (voir useIsEvening) */
    greeting: {
      fr: (name: string, evening: boolean) => `${evening ? "Bonsoir" : "Bonjour"}, ${name}`,
      en: (name: string, evening: boolean) => `${evening ? "Good evening" : "Hello"}, ${name}`,
    },
    activitySummary: {
      fr: "Voici un résumé de votre activité sur AuPair A.EU",
      en: "Here is a summary of your activity on AuPair A.EU",
    },
    age: { fr: (n: number) => `${n} ans`, en: (n: number) => `${n} years old` },
    /** Liste d'âges, ex : "3, 6 ans" */
    ages: { fr: (list: string) => `${list} ans`, en: (list: string) => `${list} years old` },
    kids: {
      fr: (n: number) => `${n} enfant${n > 1 ? "s" : ""}`,
      en: (n: number) => `${n} ${n === 1 ? "child" : "children"}`,
    },
    /** Suffixe après le nombre d'enfants, ex : " (3, 6 ans)" */
    kidsAges: { fr: (list: string) => ` (${list} ans)`, en: (list: string) => ` (aged ${list})` },
    hoursPerWeek: { fr: (h: number) => `${h}h/semaine`, en: (h: number) => `${h}h/week` },
    hoursPerWeekShort: { fr: (h: number) => `${h} h/sem`, en: (h: number) => `${h} h/wk` },
    pocketMoney: { fr: (m: number) => `${m}€/mois`, en: (m: number) => `€${m}/month` },
    experience: {
      fr: (n: number) => `${n} an${n > 1 ? "s" : ""} d'expérience`,
      en: (n: number) => `${n} year${n === 1 ? "" : "s"} of experience`,
    },
    wishes: { fr: (countries: string) => `Souhaite : ${countries}`, en: (countries: string) => `Looking for: ${countries}` },
    unread: {
      fr: (n: number) => `${n} non lu${n > 1 ? "s" : ""}`,
      en: (n: number) => `${n} unread`,
    },
  },

  // ─── Dates relatives (messagerie, notifications) ───────────────────────────
  time: {
    justNow: { fr: "À l'instant", en: "Just now" },
    minutesAgo: { fr: (n: number) => `Il y a ${n} min`, en: (n: number) => `${n} min ago` },
    hoursAgo: { fr: (n: number) => `Il y a ${n}h`, en: (n: number) => `${n}h ago` },
    yesterday: { fr: "Hier", en: "Yesterday" },
    daysAgo: { fr: (n: number) => `Il y a ${n} jours`, en: (n: number) => `${n} days ago` },
    today: { fr: "Aujourd'hui", en: "Today" },
    lastWeek: { fr: "Semaine dernière", en: "Last week" },
  },

  // ─── Sélecteur de date (DateField) ─────────────────────────────────────────
  datePicker: {
    placeholder: { fr: "jj/mm/aaaa", en: "dd/mm/yyyy" },
    previousMonth: { fr: "Mois précédent", en: "Previous month" },
    nextMonth: { fr: "Mois suivant", en: "Next month" },
    month: { fr: "Mois", en: "Month" },
    year: { fr: "Année", en: "Year" },
  },

  // ─── Menu latéral ──────────────────────────────────────────────────────────
  nav: {
    dashboard: { fr: "Tableau de bord", en: "Dashboard" },
    profile: { fr: "Mon profil", en: "My profile" },
    searchFamily: { fr: "Rechercher une famille", en: "Find a family" },
    searchAuPair: { fr: "Rechercher un au pair", en: "Find an au pair" },
    favorites: { fr: "Mes favoris", en: "My favourites" },
    messages: { fr: "Messages", en: "Messages" },
    notifications: { fr: "Notifications", en: "Notifications" },
    subscription: { fr: "Mon abonnement", en: "My subscription" },
    settings: { fr: "Paramètres", en: "Settings" },
  },

  layout: {
    myAccount: { fr: "Mon compte", en: "My account" },
    roleAuPair: { fr: "Au pair", en: "Au pair" },
    roleFamily: { fr: "Famille d'accueil", en: "Host family" },
    signOut: { fr: "Se déconnecter", en: "Sign out" },
    openMenu: { fr: "Ouvrir le menu", en: "Open menu" },
    closeMenu: { fr: "Fermer le menu", en: "Close menu" },
    notifications: { fr: "Notifications", en: "Notifications" },
    accountMenu: { fr: "Menu du compte", en: "Account menu" },
    myProfile: { fr: "Mon profil", en: "My profile" },
    premium: { fr: "Au pair premium", en: "Premium au pair" },
    premiumDaysLeft: {
      fr: (n: number) => `Encore ${n} jour${n > 1 ? "s" : ""}`,
      en: (n: number) => `${n} day${n === 1 ? "" : "s"} left`,
    },
    breadcrumbLabel: { fr: "Fil d'Ariane", en: "Breadcrumb" },
    breadcrumbHomeAuPair: { fr: "Espace au pair", en: "Au pair space" },
    breadcrumbHomeFamily: { fr: "Espace famille", en: "Family space" },
    breadcrumbFamilyProfile: { fr: "Profil de la famille", en: "Family profile" },
    breadcrumbAuPairProfile: { fr: "Profil de l'au pair", en: "Au pair profile" },
  },

  // ─── Écran "profil en attente de validation" ───────────────────────────────
  pending: {
    title: { fr: "Profil en cours de vérification", en: "Profile under review" },
    text: {
      fr: "Votre tableau de bord sera accessible dès que notre équipe aura validé votre profil. Vous recevrez un email de confirmation dans les 24-48h.",
      en: "Your dashboard will be available as soon as our team has approved your profile. You will receive a confirmation email within 24-48 hours.",
    },
    browseFamilies: { fr: "Consulter les familles d'accueil", en: "Browse host families" },
    browseAuPairs: { fr: "Consulter les au pairs", en: "Browse au pairs" },
  },

  // ─── Bandeaux / cartes "abonnement requis" ─────────────────────────────────
  subscriptionLock: {
    defaultMessage: {
      fr: "Abonnez-vous pour profiter de tous les avantages de la plateforme.",
      en: "Subscribe to enjoy all the benefits of the platform.",
    },
    defaultTitle: { fr: "Fonctionnalité réservée aux abonnés", en: "Subscribers-only feature" },
    subscribe: { fr: "S'abonner", en: "Subscribe" },
    subscribeNow: { fr: "S'abonner maintenant", en: "Subscribe now" },
  },

  // ─── Accueil au pair (/dashboard/au-pair) ──────────────────────────────────
  auPairHome: {
    subscribeBanner: {
      fr: "Abonnez-vous pour profiter de tous les avantages : profil visible par les familles, messagerie, coordonnées des familles, favoris...",
      en: "Subscribe to enjoy all the benefits: profile visible to families, messaging, families' contact details, favourites...",
    },
    visibilityTitle: { fr: "Visibilité auprès des familles", en: "Visibility to families" },
    hiddenByAdmin: {
      fr: "Votre profil a été masqué par notre équipe. Contactez le support pour plus d'informations.",
      en: "Your profile has been hidden by our team. Contact support for more information.",
    },
    visibleAvailable: {
      fr: "Votre profil apparaît comme disponible dans l'annuaire des familles.",
      en: "Your profile is shown as available in the families' directory.",
    },
    visibleUnavailable: {
      fr: "Votre profil apparaît comme indisponible. Activez-le quand vous êtes prêt(e) à recevoir des contacts.",
      en: "Your profile is shown as unavailable. Turn it on when you are ready to be contacted.",
    },
    availabilityError: {
      fr: "Erreur lors de la mise à jour de la disponibilité.",
      en: "Error while updating your availability.",
    },
    findFamily: { fr: "Trouver une famille", en: "Find a family" },
    completionTitle: { fr: "Complétion du profil", en: "Profile completion" },
    completionHint: { fr: "Un profil complet attire 3x plus de familles.", en: "A complete profile attracts 3x more families." },
    completionDone: {
      fr: "Bravo, votre profil est complet ! Les familles ont toutes les informations pour vous contacter.",
      en: "Well done, your profile is complete! Families have everything they need to contact you.",
    },
    missingCount: {
      fr: (n: number) => `${n} information${n > 1 ? "s" : ""} à compléter`,
      en: (n: number) => `${n} detail${n > 1 ? "s" : ""} left to fill in`,
    },
    completeProfile: { fr: "Compléter mon profil", en: "Complete my profile" },
    viewProfile: { fr: "Voir mon profil", en: "View my profile" },
    /** Libellés des champs pris en compte dans la complétion (clés = champs de AuPairProfile) */
    missingFields: {
      gender: { fr: "Genre", en: "Gender" },
      cityOfOrigin: { fr: "Ville d'origine", en: "Home town" },
      educationLevel: { fr: "Niveau d'études", en: "Education level" },
      childcareExperience: { fr: "Expérience en garde d'enfants", en: "Childcare experience" },
      childcareYears: { fr: "Années d'expérience", en: "Years of experience" },
      preferredDuration: { fr: "Durée de séjour souhaitée", en: "Preferred stay duration" },
      description: { fr: "Présentation", en: "About me" },
      motivation: { fr: "Motivation", en: "Motivation" },
      phoneWhatsapp1: { fr: "Numéro WhatsApp", en: "WhatsApp number" },
      profilePhotoUrl: { fr: "Photo de profil", en: "Profile photo" },
      availableFrom: { fr: "Date de disponibilité", en: "Available from" },
    },
    subscriptionTitle: { fr: "Mon abonnement", en: "My subscription" },
    subscriptionActiveHint: {
      fr: "Messagerie et coordonnées des familles débloquées.",
      en: "Messaging and families' contact details unlocked.",
    },
    subscriptionInactiveHint: {
      fr: "Débloquez la messagerie et les coordonnées des familles.",
      en: "Unlock messaging and families' contact details.",
    },
    active: { fr: "Actif", en: "Active" },
    inactive: { fr: "Inactif", en: "Inactive" },
    daysLeft: { fr: "jours restants", en: "days left" },
    manageSubscription: { fr: "Gérer l'abonnement", en: "Manage subscription" },
    subscribe: { fr: "S'abonner", en: "Subscribe" },
    statCompletion: { fr: "Profil complété", en: "Profile completed" },
    statViews: { fr: "Vues du profil", en: "Profile views" },
    statFavorited: { fr: "Mis en favoris", en: "Added to favourites" },
    statMessages: { fr: "Messages reçus", en: "Messages received" },
    captionCompletion: {
      fr: (n: number) => (n === 0 ? "Tout est rempli" : `${n} champ${n > 1 ? "s" : ""} manquant${n > 1 ? "s" : ""}`),
      en: (n: number) => (n === 0 ? "All filled in" : `${n} field${n > 1 ? "s" : ""} missing`),
    },
    captionFavorited: {
      fr: (pct: number) => `${pct}% des visiteurs`,
      en: (pct: number) => `${pct}% of visitors`,
    },
    captionNoUnread: { fr: "Aucun message non lu", en: "No unread messages" },
    suggestedTitle: { fr: "Familles suggérées pour vous", en: "Families suggested for you" },
    suggestedSubtitle: {
      fr: "Selon vos pays souhaités, votre âge et vos langues",
      en: "Based on your target countries, age and languages",
    },
    seeAll: { fr: "Voir toutes", en: "See all" },
    noSuggestions: {
      fr: "Aucune suggestion pour le moment. Complétez votre profil pour de meilleures recommandations.",
      en: "No suggestions yet. Complete your profile to get better recommendations.",
    },
  },

  // ─── Accueil famille (/dashboard/famille) ──────────────────────────────────
  familyHome: {
    completeTitle: {
      fr: (pct: number) => `Complétez votre profil famille (${pct}%)`,
      en: (pct: number) => `Complete your family profile (${pct}%)`,
    },
    completeHint: {
      fr: "Un profil complet avec photo et description attire 5x plus d'au pairs qualifiés.",
      en: "A complete profile with a photo and description attracts 5x more qualified au pairs.",
    },
    completeProfile: { fr: "Compléter mon profil", en: "Complete my profile" },
    statViews: { fr: "Vues du profil", en: "Profile views" },
    statMessages: { fr: "Messages reçus", en: "Messages received" },
    statFavorites: { fr: "Au pairs favoris", en: "Favourite au pairs" },
    suggestedTitle: { fr: "Au pairs suggérés pour vous", en: "Au pairs suggested for you" },
    seeAll: { fr: "Voir tous →", en: "See all →" },
    noSuggestions: {
      fr: "Aucune suggestion pour le moment. Complétez vos préférences pour de meilleures recommandations.",
      en: "No suggestions yet. Complete your preferences to get better recommendations.",
    },
    experienceBadge: { fr: (n: number) => `${n} ans exp.`, en: (n: number) => `${n} yrs exp.` },
  },

  // ─── Abonnement au pair (/dashboard/au-pair/abonnement) ────────────────────
  subscription: {
    title: { fr: "Mon abonnement", en: "My subscription" },
    paymentSuccess: {
      fr: "Paiement réussi ! Votre abonnement sera activé dans quelques instants.",
      en: "Payment successful! Your subscription will be activated in a few moments.",
    },
    paymentCancelled: { fr: "Le paiement a été annulé.", en: "The payment was cancelled." },
    stillPending: {
      fr: "Le paiement est toujours en attente. Vérifiez votre confirmation ou réessayez dans quelques minutes.",
      en: "The payment is still pending. Check your confirmation or try again in a few minutes.",
    },
    paymentFailed: { fr: "Le paiement a échoué ou a été annulé.", en: "The payment failed or was cancelled." },
    verifyError: {
      fr: "Erreur lors de la vérification du paiement. Contactez le support.",
      en: "Error while verifying the payment. Please contact support.",
    },
    currentTitle: { fr: "Abonnement actuel", en: "Current subscription" },
    active: { fr: "Actif", en: "Active" },
    expired: { fr: "Expiré", en: "Expired" },
    inactive: { fr: "Inactif", en: "Inactive" },
    daysCount: {
      fr: (n: number) => `${n} jour${n > 1 ? "s" : ""}`,
      en: (n: number) => `${n} day${n === 1 ? "" : "s"}`,
    },
    remaining: {
      fr: (date: string) => `restants · Expire le ${date}`,
      en: (date: string) => `left · Expires on ${date}`,
    },
    expiredOn: {
      fr: (date: string) => `Votre abonnement a expiré le ${date}.`,
      en: (date: string) => `Your subscription expired on ${date}.`,
    },
    noSubscription: { fr: "Vous n'avez pas encore d'abonnement actif.", en: "You don't have an active subscription yet." },
    subscribeToBeVisible: {
      fr: "Souscrivez pour être visible par toutes les familles d'accueil.",
      en: "Subscribe to be visible to all host families.",
    },
    activateTitle: { fr: "Activer mon abonnement", en: "Activate my subscription" },
    stayVisible: { fr: "Restez visible par toutes les familles d'accueil.", en: "Stay visible to all host families." },
    planLabel: { fr: (days: number) => `Abonnement ${days} jours`, en: (days: number) => `${days}-day subscription` },
    fullAccess: {
      fr: (price: string) => `= ${price} · Accès complet à toutes les fonctionnalités`,
      en: (price: string) => `= ${price} · Full access to all features`,
    },
    waitingConfirmation: { fr: "En attente de confirmation du paiement...", en: "Waiting for payment confirmation..." },
    finishPaymentHint: {
      fr: "Terminez le paiement dans l'onglet ouvert (Mobile Money ou carte).",
      en: "Complete the payment in the tab that opened (Mobile Money or card).",
    },
    openPaymentPage: { fr: "Ouvrir la page de paiement", en: "Open the payment page" },
    cancelPayment: { fr: "Annuler le paiement", en: "Cancel the payment" },
    payNow: { fr: "Payer maintenant", en: "Pay now" },
    includedTitle: { fr: "Inclus dans votre abonnement", en: "Included in your subscription" },
    subtitle: {
      fr: "Suivez votre abonnement, souscrivez et retrouvez vos paiements",
      en: "Track your subscription, subscribe and review your payments",
    },
    tabs: {
      current: { fr: "Abonnement actuel", en: "Current subscription" },
      plan: { fr: "Formule et paiement", en: "Plan & payment" },
      history: { fr: "Historique des paiements", en: "Payment history" },
    },
    daysLeftLabel: { fr: "jours restants", en: "days left" },
    startedOn: { fr: "Début", en: "Start" },
    expiresOn: { fr: "Expiration", en: "Expiry" },
    lastPayment: { fr: "Dernier paiement", en: "Last payment" },
    paymentMethod: { fr: "Moyen de paiement", en: "Payment method" },
    status: { fr: "Statut", en: "Status" },
    seePlan: { fr: "Voir la formule", en: "See the plan" },
    alreadyActive: { fr: "Abonnement en cours", en: "Subscription in progress" },
    renewFrom: {
      fr: (date: string) => `Vous pourrez renouveler votre abonnement à partir du ${date}.`,
      en: (date: string) => `You can renew your subscription from ${date}.`,
    },
    priceLabel: { fr: (days: number) => `pour ${days} jours`, en: (days: number) => `for ${days} days` },
    priceXof: { fr: (price: string) => `soit ${price}`, en: (price: string) => `i.e. ${price}` },
    securePayment: {
      fr: "Paiement sécurisé par Mobile Money ou carte bancaire",
      en: "Secure payment by Mobile Money or bank card",
    },
    historySubtitle: {
      fr: (n: number) => `${n} paiement${n > 1 ? "s" : ""}`,
      en: (n: number) => `${n} payment${n === 1 ? "" : "s"}`,
    },
    noPayments: { fr: "Aucun paiement pour le moment.", en: "No payments yet." },
    colDate: { fr: "Date", en: "Date" },
    colPeriod: { fr: "Période", en: "Period" },
    colAmount: { fr: "Montant", en: "Amount" },
    colMethod: { fr: "Moyen", en: "Method" },
    colReference: { fr: "Référence", en: "Reference" },
    colInvoice: { fr: "Facture", en: "Invoice" },
    methods: {
      MOBILE_MONEY: { fr: "Mobile Money", en: "Mobile Money" },
      CARD: { fr: "Carte bancaire", en: "Bank card" },
      FEDAPAY: { fr: "FedaPay", en: "FedaPay" },
      GENIUSPAY: { fr: "GeniusPay", en: "GeniusPay" },
    },
    statuses: {
      ACTIVE: { fr: "Actif", en: "Active" },
      EXPIRED: { fr: "Expiré", en: "Expired" },
      CANCELLED: { fr: "Annulé", en: "Cancelled" },
      REFUNDED: { fr: "Remboursé", en: "Refunded" },
    },
  },

  // ─── Recherche de familles (/dashboard/au-pair/recherche) ──────────────────
  searchFamilies: {
    title: { fr: "Rechercher une famille d'accueil", en: "Find a host family" },
    availableCount: { fr: (n: number) => `${n} familles disponibles`, en: (n: number) => `${n} families available` },
    searchPlaceholder: { fr: "Rechercher par ville, pays...", en: "Search by city, country..." },
    allHostCountries: { fr: "Tous les pays d'accueil", en: "All host countries" },
    allLanguagesWanted: { fr: "Toutes les langues souhaitées", en: "All requested languages" },
    minKids: { fr: "Nombre d'enfants min.", en: "Min. number of children" },
    minPocketMoney: { fr: "Argent de poche min.", en: "Min. pocket money" },
    foundCount: { fr: (n: number) => `${n} familles trouvées`, en: (n: number) => `${n} families found` },
    noneFound: { fr: "Aucune famille trouvée avec ces critères.", en: "No family matches these criteria." },
  },

  // ─── Recherche d'au pairs (/dashboard/famille/recherche) ───────────────────
  searchAuPairs: {
    title: { fr: "Rechercher un au pair", en: "Find an au pair" },
    availableCount: { fr: (n: number) => `${n} au pairs disponibles`, en: (n: number) => `${n} au pairs available` },
    searchPlaceholder: { fr: "Rechercher par nom, pays...", en: "Search by name, country..." },
    allOriginCountries: { fr: "Tous les pays d'origine", en: "All countries of origin" },
    allLanguages: { fr: "Toutes les langues", en: "All languages" },
    allGenders: { fr: "Tous les genres", en: "All genders" },
    allDestinations: { fr: "Toutes destinations souhaitées", en: "All desired destinations" },
    minAge: { fr: "Âge min.", en: "Min. age" },
    maxAge: { fr: "Âge max.", en: "Max. age" },
    ageOption: { fr: (n: number) => `${n} ans`, en: (n: number) => `${n} years` },
    minExperience: { fr: "Expérience minimale", en: "Minimum experience" },
    experienceOption: {
      fr: (n: number) => `${n}+ an${n > 1 ? "s" : ""}`,
      en: (n: number) => `${n}+ year${n === 1 ? "" : "s"}`,
    },
    foundCount: { fr: (n: number) => `${n} au pairs trouvés`, en: (n: number) => `${n} au pairs found` },
    noneFound: { fr: "Aucun au pair trouvé avec ces critères.", en: "No au pair matches these criteria." },
  },

  // ─── Favoris famille (/dashboard/famille/favoris) ──────────────────────────
  favorites: {
    title: { fr: "Mes au pairs favoris", en: "My favourite au pairs" },
    subtitle: { fr: "Retrouvez ici les profils que vous avez mis en favoris.", en: "All the profiles you have added to your favourites." },
    empty: { fr: "Vous n'avez encore ajouté aucun au pair en favoris.", en: "You haven't added any au pair to your favourites yet." },
    discover: { fr: "Découvrir des au pairs →", en: "Discover au pairs →" },
  },

  // ─── Fiche famille vue par un au pair (/dashboard/au-pair/famille/[id]) ────
  familyDetail: {
    back: { fr: "Retour", en: "Back" },
    lockedTitle: { fr: "Profil complet réservé aux abonnés", en: "Full profile for subscribers only" },
    lockedMessage: {
      fr: "Abonnez-vous pour consulter le profil complet de cette famille et accéder à ses coordonnées.",
      en: "Subscribe to see this family's full profile and contact details.",
    },
    lockedPerks: {
      fr: [
        "Présentation complète de la famille",
        "Tâches confiées, logement et repas",
        "Préférences pour l'au pair",
        "Coordonnées WhatsApp",
      ],
      en: [
        "The family's full introduction",
        "Tasks, accommodation and meals",
        "Au pair preferences",
        "WhatsApp contact details",
      ],
    },
    enlargePhoto: { fr: "Agrandir la photo", en: "Enlarge photo" },
    family: { fr: "La famille", en: "The family" },
    conditions: { fr: "Logement & conditions", en: "Accommodation & terms" },
    noPreference: { fr: "Pas de préférence", en: "No preference" },
    writeOnWhatsapp: { fr: "Écrire sur WhatsApp", en: "Message on WhatsApp" },
    address: { fr: "Adresse", en: "Address" },
    maritalStatus: { fr: "Situation familiale", en: "Marital status" },
    parentsAges: { fr: "Âge des parents", en: "Parents' ages" },
    kidsDaily: { fr: "Enfants & quotidien", en: "Children & daily life" },
    numberOfKids: { fr: "Nombre d'enfants", en: "Number of children" },
    kidsAges: { fr: "Âge des enfants", en: "Children's ages" },
    hoursPerWeek: { fr: "Heures par semaine", en: "Hours per week" },
    pocketMoney: { fr: "Argent de poche", en: "Pocket money" },
    accommodation: { fr: "Logement proposé", en: "Accommodation offered" },
    mealsProvided: { fr: "Repas fournis", en: "Meals provided" },
    tasks: { fr: "Tâches confiées à l'au pair", en: "Au pair's tasks" },
    preferences: { fr: "Préférences pour l'au pair", en: "Au pair preferences" },
    preferredGender: { fr: "Genre préféré", en: "Preferred gender" },
    preferredAgeRange: { fr: "Tranche d'âge préférée", en: "Preferred age range" },
    ageRange: {
      fr: (min: string, max: string) => `${min} - ${max} ans`,
      en: (min: string, max: string) => `${min} - ${max} years old`,
    },
    preferredLanguages: { fr: "Langues souhaitées", en: "Preferred languages" },
    presentation: { fr: "Présentation", en: "About" },
    contact: { fr: "Contact", en: "Contact" },
  },

  // ─── Fiche au pair vue par une famille (/dashboard/famille/au-pair/[id]) ───
  auPairDetail: {
    back: { fr: "Retour à la recherche", en: "Back to search" },
    experienceYears: {
      fr: (n: number) => `${n} ${n >= 5 ? "ans ou plus" : "an(s)"}`,
      en: (n: number) => (n >= 5 ? `${n} years or more` : `${n} year${n === 1 ? "" : "s"}`),
    },
    experienceLine: {
      fr: (n: number) => `${n} ${n >= 5 ? "ans ou plus" : "an(s)"} d'expérience`,
      en: (n: number) => (n >= 5 ? `${n}+ years of experience` : `${n} year${n === 1 ? "" : "s"} of experience`),
    },
    experienceUnknown: { fr: "Expérience non renseignée", en: "Experience not specified" },
    general: { fr: "Informations générales", en: "General information" },
    gender: { fr: "Genre", en: "Gender" },
    nationality: { fr: "Nationalité", en: "Nationality" },
    languages: { fr: "Langues", en: "Languages" },
    educationLevel: { fr: "Niveau d'études", en: "Education level" },
    experienceQualifications: { fr: "Expérience & qualifications", en: "Experience & qualifications" },
    yearsOfExperience: { fr: "Années d'expérience", en: "Years of experience" },
    firstAid: { fr: "Premiers secours", en: "First aid" },
    drivingLicense: { fr: "Permis de conduire", en: "Driving licence" },
    smoker: { fr: "Fumeur", en: "Smoker" },
    childcareExperience: { fr: "Expérience en garde d'enfants", en: "Childcare experience" },
    availability: { fr: "Disponibilité & destination", en: "Availability & destination" },
    targetCountries: { fr: "Pays ciblés", en: "Target countries" },
    preferredDuration: { fr: "Durée souhaitée", en: "Preferred duration" },
    availableFrom: { fr: "Disponible du", en: "Available from" },
    availableTo: { fr: "Disponible jusqu'au", en: "Available until" },
    presentation: { fr: "Présentation", en: "About" },
    description: { fr: "Description", en: "Description" },
    motivation: { fr: "Motivation", en: "Motivation" },
    contact: { fr: "Contact", en: "Contact" },
    addToFavorites: { fr: "Mettre en favoris", en: "Add to favourites" },
  },

  maritalStatus: {
    MARRIED: { fr: "Marié(e)", en: "Married" },
    SINGLE: { fr: "Célibataire", en: "Single" },
    DIVORCED: { fr: "Divorcé(e)", en: "Divorced" },
    OTHER: { fr: "Autre", en: "Other" },
  },

  profileStatus: {
    PENDING: { fr: "En attente de validation", en: "Pending approval" },
    ACTIVE: { fr: "Profil validé", en: "Profile approved" },
    HIDDEN: { fr: "Profil masqué", en: "Profile hidden" },
    SUSPENDED: { fr: "Profil suspendu", en: "Profile suspended" },
    DELETED: { fr: "Profil supprimé", en: "Profile deleted" },
  },

  // ─── Formulaires "Mon profil" (communs au pair & famille) ──────────────────
  profileForm: {
    title: { fr: "Mon profil", en: "My profile" },
    loading: { fr: "Chargement du profil...", en: "Loading profile..." },
    visibleAfterValidation: {
      fr: "Votre profil est visible après validation par notre équipe.",
      en: "Your profile becomes visible once approved by our team.",
    },
    photoHint: {
      fr: "JPG ou PNG, max 5 Mo. Une bonne photo augmente vos chances de contact.",
      en: "JPG or PNG, max 5 MB. A good photo increases your chances of being contacted.",
    },
    uploading: { fr: "Envoi en cours...", en: "Uploading..." },
    uploadPhoto: { fr: "Télécharger une photo", en: "Upload a photo" },
    viewPhoto: { fr: "Voir la photo", en: "View photo" },
    photoUploadError: { fr: "Erreur lors de l'envoi de la photo.", en: "Error while uploading the photo." },
    firstName: { fr: "Prénom", en: "First name" },
    lastName: { fr: "Nom", en: "Last name" },
    whatsappTitle: { fr: "Contact WhatsApp", en: "WhatsApp contact" },
    saving: { fr: "Sauvegarde...", en: "Saving..." },
    saveChanges: { fr: "Sauvegarder les modifications", en: "Save changes" },
    saved: { fr: "Profil sauvegardé !", en: "Profile saved!" },
    saveError: { fr: "Erreur lors de la sauvegarde du profil.", en: "Error while saving your profile." },
  },

  auPairProfile: {
    subtitle: {
      fr: "Un profil complet et soigné attire davantage de familles.",
      en: "A complete, polished profile attracts more families.",
    },
    completionLabel: { fr: "Profil complété", en: "Profile completed" },
    completionMissing: {
      fr: (n: number) => `Il manque ${n} information${n > 1 ? "s" : ""} :`,
      en: (n: number) => `${n} item${n === 1 ? "" : "s"} missing:`,
    },
    completionDone: { fr: "Votre profil est complet, bravo !", en: "Your profile is complete, well done!" },
    changePhoto: { fr: "Changer la photo", en: "Change photo" },
    sectionsNav: { fr: "Sections du profil", en: "Profile sections" },
    nav: {
      personal: { fr: "Identité", en: "Identity" },
      languages: { fr: "Langues", en: "Languages" },
      experience: { fr: "Expérience", en: "Experience" },
      availability: { fr: "Disponibilité", en: "Availability" },
      about: { fr: "Présentation", en: "About me" },
      health: { fr: "Santé", en: "Health" },
      contact: { fr: "Contact", en: "Contact" },
      documents: { fr: "Documents", en: "Documents" },
    },
    languagesHint: { fr: "Touchez une langue pour la sélectionner.", en: "Tap a language to select it." },
    selectedCount: {
      fr: (n: number) => `${n} sélectionné${n > 1 ? "s" : ""}`,
      en: (n: number) => `${n} selected`,
    },
    aboutHint: {
      fr: "C'est la première chose que lisent les familles.",
      en: "This is the first thing families read.",
    },
    healthHint: {
      fr: "Visible uniquement par les familles avec qui vous échangez.",
      en: "Only visible to families you talk with.",
    },
    contactHint: {
      fr: "Les familles vous contacteront sur ce numéro.",
      en: "Families will contact you on this number.",
    },
    privateBadge: { fr: "Privé", en: "Private" },
    docsCount: { fr: (n: number, max: number) => `${n}/${max}`, en: (n: number, max: number) => `${n}/${max}` },
    openDocument: { fr: "Ouvrir", en: "Open" },
    unsavedChanges: { fr: "Modifications non enregistrées", en: "Unsaved changes" },
    upToDate: { fr: "Tout est enregistré", en: "All changes saved" },
    save: { fr: "Enregistrer", en: "Save" },
    photoTitle: { fr: "Photo de profil", en: "Profile photo" },
    addPhoto: { fr: "Ajouter une photo professionnelle", en: "Add a professional photo" },
    idTitle: { fr: "Pièce d'identité", en: "Identity document" },
    docsSent: {
      fr: (n: number) => `${n} document${n > 1 ? "s" : ""} envoyé${n > 1 ? "s" : ""}`,
      en: (n: number) => `${n} document${n === 1 ? "" : "s"} uploaded`,
    },
    noDocs: { fr: "Aucun document envoyé", en: "No document uploaded" },
    idHint: {
      fr: "Carte d'identité, passeport ou titre de séjour (recto et verso). JPG, PNG ou PDF, max 10 Mo par fichier, 4 documents maximum. Ces documents ne sont visibles que par notre équipe.",
      en: "ID card, passport or residence permit (front and back). JPG, PNG or PDF, max 10 MB per file, up to 4 documents. Only our team can see these documents.",
    },
    documentN: { fr: (n: number) => `Document ${n}`, en: (n: number) => `Document ${n}` },
    addDocuments: { fr: "Ajouter des documents", en: "Add documents" },
    docUploadError: { fr: "Erreur lors de l'envoi du document.", en: "Error while uploading the document." },
    docDeleteError: { fr: "Erreur lors de la suppression du document.", en: "Error while deleting the document." },
    personalInfo: { fr: "Informations personnelles", en: "Personal information" },
    dateOfBirth: { fr: "Date de naissance", en: "Date of birth" },
    genderRequired: { fr: "Genre *", en: "Gender *" },
    nationality: { fr: "Nationalité", en: "Nationality" },
    countryOfOrigin: { fr: "Pays d'origine", en: "Country of origin" },
    cityOfOrigin: { fr: "Ville d'origine", en: "City of origin" },
    educationLevel: { fr: "Niveau d'études", en: "Education level" },
    spokenLanguages: { fr: "Langues parlées", en: "Spoken languages" },
    experienceQualifications: { fr: "Expérience & qualifications", en: "Experience & qualifications" },
    experienceYears: { fr: "Expérience (années)", en: "Experience (years)" },
    describeExperience: { fr: "Décrivez votre expérience avec les enfants", en: "Describe your experience with children" },
    firstAidCertified: { fr: "Certifié(e) premiers secours", en: "First aid certified" },
    drivingLicense: { fr: "Permis de conduire", en: "Driving licence" },
    availability: { fr: "Disponibilité & destination", en: "Availability & destination" },
    availableFrom: { fr: "Disponible à partir du", en: "Available from" },
    availableTo: { fr: "Disponible jusqu'au", en: "Available until" },
    preferredDuration: { fr: "Durée souhaitée", en: "Preferred duration" },
    targetCountries: { fr: "Pays de destination souhaités", en: "Desired destination countries" },
    descriptionMotivation: { fr: "Description & Motivation", en: "Description & motivation" },
    personalPresentation: { fr: "Présentation personnelle", en: "About me" },
    whyAuPair: { fr: "Pourquoi souhaitez-vous devenir au pair ?", en: "Why do you want to become an au pair?" },
    healthDeclarations: { fr: "Santé & déclarations", en: "Health & declarations" },
    smoker: { fr: "Fumeur(se)", en: "Smoker" },
    criminalRecord: { fr: "Casier judiciaire non vierge", en: "I have a criminal record" },
    healthDeclaration: {
      fr: "Déclaration de santé (allergies, traitements, etc.)",
      en: "Health declaration (allergies, medication, etc.)",
    },
    whatsappMain: { fr: "Numéro WhatsApp principal", en: "Main WhatsApp number" },
    whatsappSecondary: { fr: "Numéro WhatsApp secondaire (optionnel)", en: "Secondary WhatsApp number (optional)" },
  },

  familyProfile: {
    photoTitle: { fr: "Photo de famille", en: "Family photo" },
    addPhoto: { fr: "Ajouter une photo de famille", en: "Add a family photo" },
    general: { fr: "Informations générales", en: "General information" },
    hostCountry: { fr: "Pays d'accueil", en: "Host country" },
    city: { fr: "Ville", en: "City" },
    address: { fr: "Adresse", en: "Address" },
    maritalStatus: { fr: "Statut marital", en: "Marital status" },
    parentsAges: { fr: "Âge des parents", en: "Parents' ages" },
    parentsAgesPlaceholder: { fr: "ex : 35, 38", en: "e.g. 35, 38" },
    kidsHosting: { fr: "Enfants & accueil de l'au pair", en: "Children & hosting the au pair" },
    numberOfKids: { fr: "Nombre d'enfants", en: "Number of children" },
    kidsAges: { fr: "Âges des enfants", en: "Children's ages" },
    kidsAgesPlaceholder: { fr: "ex : 3, 6, 9", en: "e.g. 3, 6, 9" },
    hoursPerWeek: { fr: "Heures par semaine", en: "Hours per week" },
    pocketMoney: { fr: "Argent de poche (€/mois)", en: "Pocket money (€/month)" },
    accommodation: { fr: "Logement proposé", en: "Accommodation offered" },
    accommodationPlaceholder: { fr: "ex : Chambre privée avec salle de bain", en: "e.g. Private room with bathroom" },
    mealsProvided: { fr: "Repas fournis", en: "Meals provided" },
    tasks: { fr: "Tâches confiées à l'au pair", en: "Au pair's tasks" },
    familyDescription: { fr: "Description de la famille", en: "About the family" },
    preferences: { fr: "Préférences pour l'au pair", en: "Au pair preferences" },
    preferredGender: { fr: "Genre préféré", en: "Preferred gender" },
    noPreference: { fr: "Indifférent", en: "No preference" },
    minAge: { fr: "Âge minimum", en: "Minimum age" },
    maxAge: { fr: "Âge maximum", en: "Maximum age" },
    preferredLanguages: { fr: "Langues souhaitées", en: "Preferred languages" },
    whatsappNumber: { fr: "Numéro WhatsApp", en: "WhatsApp number" },
  },

  // ─── Paramètres (changement de mot de passe) ───────────────────────────────
  settings: {
    title: { fr: "Paramètres", en: "Settings" },
    changePasswordTitle: { fr: "Modifier mon mot de passe", en: "Change my password" },
    changePasswordHint: {
      fr: "Pour votre sécurité, toutes vos autres sessions actives seront déconnectées.",
      en: "For your security, all your other active sessions will be signed out.",
    },
    currentPassword: { fr: "Mot de passe actuel", en: "Current password" },
    newPassword: { fr: "Nouveau mot de passe", en: "New password" },
    confirmPassword: { fr: "Confirmer le nouveau mot de passe", en: "Confirm new password" },
    showPassword: { fr: "Afficher le mot de passe", en: "Show password" },
    hidePassword: { fr: "Masquer le mot de passe", en: "Hide password" },
    tooShort: {
      fr: "Le nouveau mot de passe doit contenir au moins 8 caractères.",
      en: "The new password must be at least 8 characters long.",
    },
    mismatch: { fr: "Les deux mots de passe ne correspondent pas.", en: "The two passwords do not match." },
    success: { fr: "Mot de passe modifié avec succès.", en: "Password changed successfully." },
    submitting: { fr: "Modification en cours...", en: "Updating..." },
    submit: { fr: "Modifier le mot de passe", en: "Change password" },
  },

  // ─── Notifications ─────────────────────────────────────────────────────────
  notifications: {
    title: { fr: "Notifications", en: "Notifications" },
    markAllRead: { fr: "Tout marquer comme lu", en: "Mark all as read" },
    empty: { fr: "Vous n'avez aucune notification pour le moment.", en: "You don't have any notifications yet." },
    profileViewTitle: { fr: "Nouvelle vue de profil", en: "New profile view" },
    profileViewContent: {
      fr: (name: string) => `${name} a consulté votre profil.`,
      en: (name: string) => `${name} viewed your profile.`,
    },
    weeklyDigestTitle: { fr: "Résumé hebdomadaire", en: "Weekly summary" },
    weeklyDigestContent: {
      fr: (n: number) => `${n} personne${n > 1 ? "s" : ""} ${n > 1 ? "ont" : "a"} consulté votre profil la semaine dernière.`,
      en: (n: number) => `${n} ${n === 1 ? "person" : "people"} viewed your profile last week.`,
    },
  },

  // ─── Messagerie ────────────────────────────────────────────────────────────
  messages: {
    title: { fr: "Messages", en: "Messages" },
    roleAuPair: { fr: "Au pair", en: "Au pair" },
    roleFamily: { fr: "Famille d'accueil", en: "Host family" },
    roleAgency: { fr: "Agence", en: "Agency" },
    roleAdmin: { fr: "Admin", en: "Admin" },
    searchPlaceholder: { fr: "Rechercher...", en: "Search..." },
    noConversations: { fr: "Aucune conversation pour le moment.", en: "No conversations yet." },
    youPrefix: { fr: "Vous : ", en: "You: " },
    newConversation: { fr: "Nouvelle conversation", en: "New conversation" },
    selectConversation: { fr: "Sélectionnez une conversation", en: "Select a conversation" },
    backToConversations: { fr: "Retour aux conversations", en: "Back to conversations" },
    report: { fr: "Signaler", en: "Report" },
    reportUser: { fr: "Signaler cet utilisateur", en: "Report this user" },
    block: { fr: "Bloquer", en: "Block" },
    unblock: { fr: "Débloquer", en: "Unblock" },
    blockUser: { fr: "Bloquer cet utilisateur", en: "Block this user" },
    unblockUser: { fr: "Débloquer cet utilisateur", en: "Unblock this user" },
    noMessages: { fr: "Aucun message. Lancez la conversation !", en: "No messages yet. Start the conversation!" },
    cannotMessage: {
      fr: "Vous ne pouvez pas échanger de messages avec cet utilisateur.",
      en: "You cannot exchange messages with this user.",
    },
    subscribeToMessage: {
      fr: "Abonnez-vous pour envoyer des messages aux familles.",
      en: "Subscribe to send messages to families.",
    },
    attach: { fr: "Joindre une photo ou un document", en: "Attach a photo or a document" },
    writeMessage: { fr: "Écrire un message...", en: "Write a message..." },
    sendError: { fr: "Erreur lors de l'envoi du message.", en: "Error while sending the message." },
    fileSendError: { fr: "Erreur lors de l'envoi du fichier.", en: "Error while sending the file." },
    photoPreview: { fr: "📷 Photo", en: "📷 Photo" },
    documentPreview: { fr: "📄 Document", en: "📄 Document" },
    image: { fr: "Image", en: "Image" },
    document: { fr: "Document", en: "Document" },
    reportTitle: { fr: (name: string) => `Signaler ${name}`, en: (name: string) => `Report ${name}` },
    reportSent: {
      fr: "Votre signalement a été envoyé. Merci, notre équipe va l'examiner.",
      en: "Your report has been sent. Thank you, our team will review it.",
    },
    reason: { fr: "Motif", en: "Reason" },
    selectReason: { fr: "Sélectionnez un motif", en: "Select a reason" },
    descriptionOptional: { fr: "Description (optionnel)", en: "Description (optional)" },
    descriptionPlaceholder: {
      fr: "Détails utiles pour notre équipe de modération...",
      en: "Useful details for our moderation team...",
    },
    reportError: { fr: "Erreur lors de l'envoi du signalement.", en: "Error while sending the report." },
    send: { fr: "Envoyer", en: "Send" },
    subtitleAuPair: {
      fr: "Échangez avec les familles d'accueil qui vous intéressent.",
      en: "Chat with the host families you are interested in.",
    },
    subtitleFamily: {
      fr: "Échangez avec les au pairs qui vous intéressent.",
      en: "Chat with the au pairs you are interested in.",
    },
    conversations: { fr: "Conversations", en: "Conversations" },
    filterAll: { fr: "Toutes", en: "All" },
    filterUnread: { fr: "Non lues", en: "Unread" },
    noUnread: { fr: "Aucune conversation non lue.", en: "No unread conversations." },
    noSearchResults: {
      fr: (q: string) => `Aucune conversation pour « ${q} ».`,
      en: (q: string) => `No conversations matching "${q}".`,
    },
    noConversationsHintAuPair: {
      fr: "Trouvez une famille qui vous plaît et envoyez-lui un premier message.",
      en: "Find a family you like and send them a first message.",
    },
    noConversationsHintFamily: {
      fr: "Trouvez un au pair qui vous plaît et envoyez-lui un premier message.",
      en: "Find an au pair you like and send them a first message.",
    },
    findFamily: { fr: "Trouver une famille", en: "Find a family" },
    findAuPair: { fr: "Trouver un au pair", en: "Find an au pair" },
    selectConversationHint: {
      fr: "Choisissez une conversation dans la liste pour afficher vos échanges.",
      en: "Pick a conversation from the list to see your messages.",
    },
    emptyThreadTitle: { fr: "Démarrez la conversation", en: "Start the conversation" },
    emptyThreadHint: {
      fr: (name: string) => `Présentez-vous en quelques mots à ${name}.`,
      en: (name: string) => `Introduce yourself to ${name} in a few words.`,
    },
    viewProfile: { fr: "Voir le profil", en: "View profile" },
    moreActions: { fr: "Plus d'actions", en: "More actions" },
    statusSent: { fr: "Envoyé", en: "Sent" },
    statusRead: { fr: "Lu", en: "Read" },
    blockedByMeNotice: { fr: "Vous avez bloqué cet utilisateur.", en: "You have blocked this user." },
    unreadCount: {
      fr: (n: number) => `${n} message${n > 1 ? "s" : ""} non lu${n > 1 ? "s" : ""}`,
      en: (n: number) => `${n} unread message${n === 1 ? "" : "s"}`,
    },
  },
} satisfies Dictionary;
