import type { Dictionary } from "./index";

/**
 * Textes du site public (visiteurs non connectés) en FR et EN.
 *
 * Pour modifier un texte : trouver la section (une par page ou composant) et changer `fr` et/ou `en`.
 * Les listes (avantages, étapes, FAQ…) sont des tableaux : un objet par élément, dans l'ordre d'affichage.
 * Les articles du blog sont dans `blog-articles.ts`.
 */
export const site = {
  // ─── Barre de navigation ───────────────────────────────────────────────────
  navbar: {
    findAuPair: { fr: "Trouver un au pair", en: "Find an au pair" },
    findFamily: { fr: "Trouver une famille", en: "Find a family" },
    becomeAuPair: { fr: "Devenir au pair", en: "Become an au pair" },
    pricing: { fr: "Tarifs", en: "Pricing" },
    blog: { fr: "Blog", en: "Blog" },
    admin: { fr: "Admin", en: "Admin" },
    profile: { fr: "Profil", en: "Profile" },
    login: { fr: "Connexion", en: "Log in" },
    logout: { fr: "Se déconnecter", en: "Log out" },
    signup: { fr: "S'inscrire", en: "Sign up" },
    openMenu: { fr: "Ouvrir le menu", en: "Open menu" },
  },

  // ─── Pied de page ──────────────────────────────────────────────────────────
  footer: {
    tagline: {
      fr: "La première plateforme mondiale dédiée aux au pairs africains. Trouvez votre famille d'accueil idéale en Europe.",
      en: "The first global platform dedicated to African au pairs. Find your ideal host family in Europe.",
    },
    about: { fr: "À propos d'AuPair A.EU", en: "About AuPair A.EU" },
    usefulLinks: { fr: "Liens utiles", en: "Useful links" },
    aboutLinks: {
      becomeAuPair: { fr: "Devenir au pair", en: "Become an au pair" },
      hostAuPair: { fr: "Accueillir un au pair", en: "Host an au pair" },
      pricing: { fr: "Tarifs", en: "Pricing" },
      testimonials: { fr: "Témoignages", en: "Testimonials" },
      blog: { fr: "Blog", en: "Blog" },
      faq: { fr: "FAQ", en: "FAQ" },
      contact: { fr: "Contact", en: "Contact" },
    },
    legalLinks: {
      terms: { fr: "CGU", en: "Terms of use" },
      salesTerms: { fr: "CGV", en: "Terms of sale" },
      privacy: { fr: "Confidentialité", en: "Privacy" },
      cookies: { fr: "Cookies", en: "Cookies" },
      security: { fr: "Sécurité", en: "Security" },
    },
    copyright: {
      fr: "© 2026 AuPair A.EU — SIRET : 02025527692 — Éditeur : BODOU SERVICE",
      en: "© 2026 AuPair A.EU — SIRET: 02025527692 — Publisher: BODOU SERVICE",
    },
    compliance: { fr: "Conforme RGPD", en: "GDPR compliant" },
  },

  // ─── Page d'accueil ────────────────────────────────────────────────────────
  home: {
    hero: {
      badge: {
        fr: "Première plateforme mondiale dédiée aux au pairs africains",
        en: "The first global platform dedicated to African au pairs",
      },
      titleStart: { fr: "Trouvez un", en: "Find an" },
      titleHighlight: { fr: "au pair africain", en: "African au pair" },
      titleEnd: { fr: "ou une famille d'accueil", en: "or a host family" },
      subtitle: {
        fr: "Simple, direct et en toute sécurité. Connectez-vous avec des jeunes africains qualifiés et des familles en Europe et en Amérique.",
        en: "Simple, direct and safe. Connect with qualified young Africans and families in Europe and America.",
      },
      ctaFamily: { fr: "Trouver une famille d'accueil", en: "Find a host family" },
      ctaAuPair: { fr: "Trouver un au pair", en: "Find an au pair" },
      africanCountries: { fr: "14 pays africains", en: "14 African countries" },
      hostCountries: { fr: "6 pays d'accueil", en: "6 host countries" },
      verifiedProfiles: { fr: "Profils vérifiés", en: "Verified profiles" },
      securePayment: { fr: "Paiement sécurisé", en: "Secure payment" },
    },
    stats: [
      { label: { fr: "Au pairs inscrits", en: "Registered au pairs" } },
      { label: { fr: "Familles d'accueil", en: "Host families" } },
      { label: { fr: "Pays africains", en: "African countries" } },
      { label: { fr: "Pays d'accueil", en: "Host countries" } },
    ],
    howItWorks: {
      title: { fr: "Comment ça marche ?", en: "How does it work?" },
      subtitle: {
        fr: "AuPair A.EU, c'est simple. Que vous soyez au pair ou famille d'accueil, tout commence ici.",
        en: "AuPair A.EU is simple. Whether you are an au pair or a host family, it all starts here.",
      },
      forAuPairs: { fr: "Pour les au pairs", en: "For au pairs" },
      forFamilies: { fr: "Pour les familles", en: "For families" },
      auPairSteps: [
        {
          title: { fr: "Créez votre profil", en: "Create your profile" },
          desc: {
            fr: "Inscription gratuite en quelques minutes. Téléchargez votre photo et remplissez votre profil.",
            en: "Free sign-up in a few minutes. Upload your photo and fill in your profile.",
          },
        },
        {
          title: { fr: "Trouvez votre famille", en: "Find your family" },
          desc: {
            fr: "Parcourez les profils de familles et contactez celles qui vous correspondent.",
            en: "Browse family profiles and contact the ones that suit you.",
          },
        },
        {
          title: { fr: "Échangez & partez", en: "Chat & go" },
          desc: {
            fr: "Discutez directement avec la famille, organisez votre séjour et lancez-vous !",
            en: "Talk directly with the family, plan your stay and take the leap!",
          },
        },
      ],
      familySteps: [
        {
          title: { fr: "Inscription gratuite", en: "Free sign-up" },
          desc: {
            fr: "Créez votre profil famille gratuitement en quelques minutes.",
            en: "Create your family profile for free in a few minutes.",
          },
        },
        {
          title: { fr: "Parcourez les au pairs", en: "Browse au pairs" },
          desc: {
            fr: "Filtrez par pays, langue, expérience et trouvez le profil idéal.",
            en: "Filter by country, language and experience to find the ideal profile.",
          },
        },
        {
          title: { fr: "Accueillez votre au pair", en: "Welcome your au pair" },
          desc: {
            fr: "Contactez et accueillez votre au pair africain qualifié et motivé.",
            en: "Contact and welcome your qualified, motivated African au pair.",
          },
        },
      ],
    },
    countries: {
      title: { fr: "Familles d'accueil par pays", en: "Host families by country" },
      subtitle: {
        fr: "Des familles qui vous attendent en Europe et en Amérique",
        en: "Families waiting for you in Europe and America",
      },
    },
    testimonials: {
      title: { fr: "Voici ce qu'ils disent de nous", en: "Here's what they say about us" },
      subtitle: { fr: "Des témoignages authentiques de notre communauté", en: "Genuine testimonials from our community" },
      items: [
        {
          role: { fr: "Au pair camerounaise en France", en: "Cameroonian au pair in France" },
          content: {
            fr: "AuPair A.EU m'a permis de trouver une famille formidable à Lyon en seulement 2 semaines. Le processus était simple et l'équipe très réactive. Je recommande à toutes mes sœurs africaines !",
            en: "AuPair A.EU helped me find a wonderful family in Lyon in just 2 weeks. The process was simple and the team very responsive. I recommend it to all my African sisters!",
          },
        },
        {
          role: { fr: "Famille d'accueil en Allemagne", en: "Host family in Germany" },
          content: {
            fr: "Nous avons trouvé notre au pair ivoirienne via cette plateforme. Elle est fantastique avec nos enfants, parle un français impeccable et s'est intégrée parfaitement à notre famille.",
            en: "We found our Ivorian au pair through this platform. She is fantastic with our children, speaks flawless French and fitted perfectly into our family.",
          },
        },
        {
          role: { fr: "Au pair ghanéen en Belgique", en: "Ghanaian au pair in Belgium" },
          content: {
            fr: "Grâce à AuPair A.EU, j'ai réalisé mon rêve de vivre en Europe. La plateforme est sérieuse, les profils sont vérifiés, et la messagerie est très pratique pour communiquer avec les familles.",
            en: "Thanks to AuPair A.EU, I made my dream of living in Europe come true. The platform is reliable, profiles are verified and the messaging makes it easy to talk with families.",
          },
        },
      ],
    },
    blogPreview: {
      title: { fr: "Notre blog AuPair A.EU", en: "The AuPair A.EU blog" },
      subtitle: { fr: "Guides, conseils et témoignages pour votre aventure", en: "Guides, tips and stories for your adventure" },
      seeAll: { fr: "Voir tous les articles", en: "See all articles" },
    },
    cta: {
      title: { fr: "Prêt(e) à commencer votre aventure ?", en: "Ready to start your adventure?" },
      subtitle: {
        fr: "Rejoignez des milliers d'au pairs africains et de familles d'accueil sur la plateforme la plus dédiée à votre communauté.",
        en: "Join thousands of African au pairs and host families on the platform most dedicated to your community.",
      },
      auPair: { fr: "Créer un profil d'au pair", en: "Create an au pair profile" },
      family: { fr: "Créer un profil famille", en: "Create a family profile" },
    },
  },

  // ─── Devenir au pair ───────────────────────────────────────────────────────
  becomeAuPair: {
    heroTitle: { fr: "Devenez au pair en Europe", en: "Become an au pair in Europe" },
    heroSubtitle: {
      fr: "AuPair A.EU est la première plateforme mondiale dédiée aux jeunes africains qui souhaitent vivre une expérience au pair inoubliable.",
      en: "AuPair A.EU is the first global platform dedicated to young Africans who want to live an unforgettable au pair experience.",
    },
    heroCta: { fr: "Créer mon profil gratuitement", en: "Create my profile for free" },
    whyTitle: { fr: "Pourquoi devenir au pair ?", en: "Why become an au pair?" },
    whySubtitle: { fr: "Une expérience qui change une vie", en: "A life-changing experience" },
    advantages: [
      {
        title: { fr: "Expérience internationale", en: "International experience" },
        desc: {
          fr: "Vivez dans une famille européenne et découvrez une nouvelle culture au quotidien.",
          en: "Live with a European family and discover a new culture every day.",
        },
      },
      {
        title: { fr: "Apprentissage linguistique", en: "Language learning" },
        desc: {
          fr: "Améliorez votre français, anglais ou allemand en immersion totale.",
          en: "Improve your French, English or German through full immersion.",
        },
      },
      {
        title: { fr: "Argent de poche garanti", en: "Guaranteed pocket money" },
        desc: {
          fr: "Recevez un argent de poche mensuel en plus du logement et des repas.",
          en: "Receive monthly pocket money on top of accommodation and meals.",
        },
      },
      {
        title: { fr: "Logement & repas inclus", en: "Accommodation & meals included" },
        desc: {
          fr: "Logé(e) et nourri(e) par votre famille d'accueil durant tout votre séjour.",
          en: "Your host family provides room and board throughout your stay.",
        },
      },
    ],
    whoTitle: { fr: "Qui peut devenir au pair ?", en: "Who can become an au pair?" },
    conditions: {
      fr: [
        "Âge : 18 à 30 ans",
        "Expérience avec les enfants (garde, baby-sitting)",
        "Niveau de langue suffisant (français ou anglais)",
        "Casier judiciaire vierge",
        "Bonne santé physique et mentale",
        "Motivé(e) et ouvert(e) à une nouvelle culture",
      ],
      en: [
        "Age: 18 to 30",
        "Experience with children (childcare, babysitting)",
        "Sufficient language level (French or English)",
        "Clean criminal record",
        "Good physical and mental health",
        "Motivated and open to a new culture",
      ],
    },
    howTitle: { fr: "Comment s'inscrire ?", en: "How to sign up?" },
    howSubtitle: { fr: "3 étapes simples pour commencer votre aventure", en: "3 simple steps to start your adventure" },
    steps: [
      {
        title: { fr: "Créez votre profil", en: "Create your profile" },
        desc: {
          fr: "Inscription gratuite, téléchargez vos photos et remplissez votre profil complet.",
          en: "Free sign-up: upload your photos and fill in your full profile.",
        },
      },
      {
        title: { fr: "Souscrivez à l'abonnement", en: "Subscribe" },
        desc: {
          fr: "Activez votre profil pour 30 jours à 32€ et devenez visible par toutes les familles.",
          en: "Activate your profile for 30 days for €32 and become visible to all families.",
        },
      },
      {
        title: { fr: "Contactez les familles", en: "Contact families" },
        desc: {
          fr: "Parcourez les profils, envoyez des messages et organisez votre départ !",
          en: "Browse profiles, send messages and plan your departure!",
        },
      },
    ],
    countriesTitle: { fr: "Vous venez d'un de ces pays ?", en: "Are you from one of these countries?" },
    countriesSubtitle: { fr: "AuPair A.EU vous accompagne depuis toute l'Afrique", en: "AuPair A.EU supports you from all over Africa" },
    faqTitle: { fr: "Questions fréquentes", en: "Frequently asked questions" },
    faqs: [
      {
        q: { fr: "Combien coûte l'abonnement au pair ?", en: "How much does the au pair subscription cost?" },
        a: {
          fr: "L'abonnement pour les au pairs est de 32€ (ou 20 800 FCFA) pour 30 jours. Les familles s'inscrivent gratuitement.",
          en: "The au pair subscription costs €32 (or 20,800 FCFA) for 30 days. Families sign up for free.",
        },
      },
      {
        q: { fr: "Mon profil est-il visible immédiatement ?", en: "Is my profile visible immediately?" },
        a: {
          fr: "Non. Chaque profil est vérifié manuellement par notre équipe avant d'être publié, pour garantir la qualité et la sécurité.",
          en: "No. Every profile is manually checked by our team before it is published, to guarantee quality and safety.",
        },
      },
      {
        q: { fr: "Quels pays d'accueil sont disponibles ?", en: "Which host countries are available?" },
        a: {
          fr: "France, Allemagne, Belgique, Luxembourg, Suisse et États-Unis. D'autres pays seront ajoutés prochainement.",
          en: "France, Germany, Belgium, Luxembourg, Switzerland and the United States. More countries will be added soon.",
        },
      },
    ],
    finalTitle: { fr: "Prêt(e) à vous lancer ?", en: "Ready to get started?" },
    finalSubtitle: {
      fr: "Créez votre profil gratuitement et commencez à explorer les familles d'accueil dès aujourd'hui.",
      en: "Create your profile for free and start exploring host families today.",
    },
    finalCta: { fr: "Créer mon profil au pair", en: "Create my au pair profile" },
  },

  // ─── Accueillir un au pair ─────────────────────────────────────────────────
  hostAuPair: {
    heroTitleStart: { fr: "Accueillez un au pair", en: "Host an" },
    heroTitleHighlight: { fr: "africain", en: "African au pair" },
    heroSubtitle: {
      fr: "Inscription famille 100% gratuite. Trouvez le profil idéal parmi nos au pairs africains vérifiés et motivés.",
      en: "100% free family sign-up. Find the ideal profile among our verified, motivated African au pairs.",
    },
    ctaFree: { fr: "Créer mon profil famille — Gratuit", en: "Create my family profile — Free" },
    seeProfiles: { fr: "Voir les profils", en: "See profiles" },
    whyTitle: { fr: "Pourquoi choisir un au pair africain ?", en: "Why choose an African au pair?" },
    whySubtitle: {
      fr: "Des jeunes qualifiés, vérifiés, et surtout profondément motivés par cette expérience.",
      en: "Qualified, verified young people who are deeply motivated by this experience.",
    },
    reasons: [
      {
        title: { fr: "Dynamique & motivé(e)", en: "Energetic & motivated" },
        desc: {
          fr: "Les au pairs africains arrivent avec une énergie et une motivation exceptionnelles pour cette expérience.",
          en: "African au pairs arrive with exceptional energy and motivation for this experience.",
        },
      },
      {
        title: { fr: "Bilingue FR/EN", en: "Bilingual FR/EN" },
        desc: {
          fr: "La majorité vient de pays francophones ou anglophones, parfait pour votre famille.",
          en: "Most come from French- or English-speaking countries, perfect for your family.",
        },
      },
      {
        title: { fr: "Culturellement riche", en: "Culturally rich" },
        desc: {
          fr: "Une rencontre culturelle unique qui enrichira toute votre famille, adultes et enfants.",
          en: "A unique cultural encounter that will enrich your whole family, adults and children alike.",
        },
      },
      {
        title: { fr: "Expérience avec les enfants", en: "Experience with children" },
        desc: {
          fr: "Tous nos au pairs ont une expérience préalable en garde d'enfants, vérifiée par notre équipe.",
          en: "All our au pairs have prior childcare experience, checked by our team.",
        },
      },
    ],
    tasksTitle: { fr: "Que fait un au pair ?", en: "What does an au pair do?" },
    tasks: {
      fr: [
        "Garde et accompagnement des enfants",
        "Aide aux devoirs",
        "Activités ludiques et créatives",
        "Sorties et activités sportives",
        "Légères tâches ménagères liées aux enfants",
        "Préparation des repas des enfants",
      ],
      en: [
        "Looking after and accompanying the children",
        "Homework help",
        "Fun and creative activities",
        "Outings and sports activities",
        "Light housework related to the children",
        "Preparing the children's meals",
      ],
    },
    freeTitle: { fr: "Inscription famille — 100% gratuite", en: "Family sign-up — 100% free" },
    steps: [
      {
        title: { fr: "Inscription gratuite", en: "Free sign-up" },
        desc: {
          fr: "Créez votre profil famille en quelques minutes. C'est entièrement gratuit.",
          en: "Create your family profile in a few minutes. It's completely free.",
        },
      },
      {
        title: { fr: "Parcourez les au pairs", en: "Browse au pairs" },
        desc: {
          fr: "Filtrez par pays, langue, expérience et trouvez les profils qui vous correspondent.",
          en: "Filter by country, language and experience to find the profiles that suit you.",
        },
      },
      {
        title: { fr: "Contactez & accueillez", en: "Contact & welcome" },
        desc: {
          fr: "Échangez directement avec les au pairs qui vous intéressent et organisez leur venue.",
          en: "Talk directly with the au pairs you like and organise their arrival.",
        },
      },
    ],
    testimonial: {
      fr: "« Nous avons trouvé notre au pair camerounaise via AuPair A.EU. Elle est formidable avec nos enfants, ponctuelle, et s'est parfaitement intégrée. Une expérience magnifique pour toute la famille ! »",
      en: "“We found our Cameroonian au pair through AuPair A.EU. She is wonderful with our children, punctual, and fitted in perfectly. A wonderful experience for the whole family!”",
    },
    testimonialAuthor: { fr: "Famille Martin — Lyon, France", en: "The Martin family — Lyon, France" },
    finalTitle: { fr: "Commencez votre recherche aujourd'hui", en: "Start your search today" },
    finalSubtitle: {
      fr: "Inscription gratuite. Accès immédiat aux profils d'au pairs africains vérifiés.",
      en: "Free sign-up. Instant access to verified African au pair profiles.",
    },
  },

  // ─── Tarifs ────────────────────────────────────────────────────────────────
  pricing: {
    title: { fr: "Tarifs simples et transparents", en: "Simple, transparent pricing" },
    subtitle: {
      fr: "Un seul abonnement pour les au pairs. Inscription gratuite pour les familles.",
      en: "A single subscription for au pairs. Free sign-up for families.",
    },
    forAuPairs: { fr: "POUR LES AU PAIRS", en: "FOR AU PAIRS" },
    forFamilies: { fr: "POUR LES FAMILLES", en: "FOR FAMILIES" },
    forDays: { fr: (days: number) => `pour ${days} jours`, en: (days: number) => `for ${days} days` },
    freeSignup: { fr: "Inscription gratuite", en: "Free sign-up" },
    unlimitedAccess: { fr: "accès illimité", en: "unlimited access" },
    auPairFeatures: {
      fr: [
        "Profil visible par toutes les familles",
        "Messagerie illimitée",
        "Accès aux coordonnées des familles",
        "Filtres de recherche avancés",
        "Sauvegarde de favoris",
        "Notifications de nouveaux profils",
        "Support prioritaire",
      ],
      en: [
        "Profile visible to all families",
        "Unlimited messaging",
        "Access to families' contact details",
        "Advanced search filters",
        "Save favourites",
        "New profile alerts",
        "Priority support",
      ],
    },
    familyFeatures: {
      fr: [
        "Profil visible par tous les au pairs",
        "Parcourir les profils d'au pairs",
        "Recevoir des messages des au pairs",
        "Filtres de recherche avancés",
        "Sauvegarde de favoris",
        "Support standard",
      ],
      en: [
        "Profile visible to all au pairs",
        "Browse au pair profiles",
        "Receive messages from au pairs",
        "Advanced search filters",
        "Save favourites",
        "Standard support",
      ],
    },
    signUpAuPair: { fr: "S'inscrire comme au pair", en: "Sign up as an au pair" },
    signUpFamily: { fr: "S'inscrire comme famille", en: "Sign up as a family" },
    paymentTitle: { fr: "Moyens de paiement acceptés", en: "Accepted payment methods" },
    paymentName: { fr: "Mobile Money & carte bancaire", en: "Mobile Money & bank card" },
    faqTitle: { fr: "Questions sur les tarifs", en: "Pricing questions" },
    faqs: [
      {
        q: { fr: "Y a-t-il un remboursement possible ?", en: "Can I get a refund?" },
        a: {
          fr: "Non, conformément à nos CGV, les abonnements ne sont pas remboursables. L'abonnement est activé dès la validation du paiement.",
          en: "No. In line with our terms of sale, subscriptions are non-refundable. The subscription is activated as soon as the payment is confirmed.",
        },
      },
      {
        q: { fr: "L'abonnement se renouvelle-t-il automatiquement ?", en: "Does the subscription renew automatically?" },
        a: {
          fr: "Non. L'abonnement ne se renouvelle pas automatiquement. Vous recevrez un rappel 7 jours, 3 jours et 1 jour avant expiration.",
          en: "No. The subscription does not renew automatically. You will receive a reminder 7 days, 3 days and 1 day before it expires.",
        },
      },
      {
        q: { fr: "Pourquoi les familles s'inscrivent-elles gratuitement ?", en: "Why do families sign up for free?" },
        a: {
          fr: "Nous croyons que les familles d'accueil doivent avoir accès aux profils librement. C'est l'au pair qui investit dans son projet de vie à l'étranger.",
          en: "We believe host families should have free access to profiles. It is the au pair who invests in their project of living abroad.",
        },
      },
    ],
  },

  // ─── Blog ──────────────────────────────────────────────────────────────────
  blog: {
    title: { fr: "Blog AuPair A.EU", en: "AuPair A.EU blog" },
    subtitle: {
      fr: "Guides, témoignages et actualités pour votre aventure au pair",
      en: "Guides, stories and news for your au pair adventure",
    },
    all: { fr: "Tous", en: "All" },
    // Catégories des articles (clé utilisée dans src/content/blog-articles.ts)
    categories: {
      guideAuPair: { fr: "Guide au pair", en: "Au pair guide" },
      guideFamily: { fr: "Guide famille", en: "Family guide" },
      testimonial: { fr: "Témoignage", en: "Testimonial" },
      regulation: { fr: "Réglementation", en: "Regulations" },
      news: { fr: "Nouveautés", en: "What's new" },
    },
    read: { fr: "Lire", en: "Read" },
    back: { fr: "Retour au blog", en: "Back to blog" },
    by: { fr: (author: string) => `Par ${author}`, en: (author: string) => `By ${author}` },
    notFoundTitle: { fr: "Article introuvable", en: "Article not found" },
    ctaTitle: { fr: "Prêt(e) à commencer votre aventure ?", en: "Ready to start your adventure?" },
    ctaText: {
      fr: "Créez votre profil sur AuPair A.EU et trouvez votre famille idéale.",
      en: "Create your profile on AuPair A.EU and find your ideal family.",
    },
    ctaButton: { fr: "S'inscrire gratuitement", en: "Sign up for free" },
  },

  // ─── FAQ ───────────────────────────────────────────────────────────────────
  faq: {
    title: { fr: "Questions fréquentes", en: "Frequently asked questions" },
    subtitle: { fr: "Trouvez rapidement les réponses à vos questions", en: "Quickly find answers to your questions" },
    notFoundTitle: { fr: "Vous n'avez pas trouvé votre réponse ?", en: "Didn't find your answer?" },
    notFoundText: { fr: "Notre équipe est disponible pour vous aider.", en: "Our team is here to help." },
    contactUs: { fr: "Nous contacter", en: "Contact us" },
    categories: [
      {
        name: { fr: "Au pairs", en: "Au pairs" },
        items: [
          {
            q: { fr: "Qui peut devenir au pair via AuPair A.EU ?", en: "Who can become an au pair through AuPair A.EU?" },
            a: {
              fr: "Tout jeune africain âgé de 18 à 30 ans, motivé, avec une expérience en garde d'enfants, une bonne santé et un casier judiciaire vierge peut s'inscrire.",
              en: "Any motivated young African aged 18 to 30 with childcare experience, good health and a clean criminal record can sign up.",
            },
          },
          {
            q: { fr: "Combien coûte l'abonnement au pair ?", en: "How much does the au pair subscription cost?" },
            a: {
              fr: "L'abonnement est de 32€ ou 20 800 FCFA pour 30 jours. Vous pouvez payer par Mobile Money ou carte bancaire.",
              en: "The subscription costs €32 or 20,800 FCFA for 30 days. You can pay by Mobile Money or bank card.",
            },
          },
          {
            q: { fr: "Mon profil est-il visible immédiatement ?", en: "Is my profile visible immediately?" },
            a: {
              fr: "Non. Chaque profil est vérifié manuellement par notre équipe de modération avant publication. Ce processus prend généralement 24 à 48h ouvrées.",
              en: "No. Every profile is manually checked by our moderation team before publication. This usually takes 24 to 48 working hours.",
            },
          },
          {
            q: { fr: "Comment contacter une famille ?", en: "How do I contact a family?" },
            a: {
              fr: "Une fois votre abonnement actif, vous pouvez envoyer des messages directement aux familles via notre messagerie intégrée.",
              en: "Once your subscription is active, you can message families directly through our built-in messaging.",
            },
          },
        ],
      },
      {
        name: { fr: "Familles", en: "Families" },
        items: [
          {
            q: { fr: "L'inscription famille est-elle vraiment gratuite ?", en: "Is family sign-up really free?" },
            a: {
              fr: "Oui, totalement gratuite et sans limite de temps. Vous pouvez créer votre profil, parcourir les au pairs et recevoir des messages sans aucun frais.",
              en: "Yes, completely free with no time limit. You can create your profile, browse au pairs and receive messages at no cost.",
            },
          },
          {
            q: { fr: "Comment choisir mon au pair ?", en: "How do I choose my au pair?" },
            a: {
              fr: "Parcourez les profils filtrés par pays, langue, expérience. Consultez les descriptions, photos et contactez directement les au pairs qui vous intéressent.",
              en: "Browse profiles filtered by country, language and experience. Read the descriptions, see the photos and contact the au pairs you like directly.",
            },
          },
          {
            q: { fr: "Puis-je faire une vidéoconférence avec un au pair ?", en: "Can I have a video call with an au pair?" },
            a: {
              fr: "Oui. Notre plateforme permet de partager des liens de visioconférence (Zoom, Google Meet) directement dans la messagerie.",
              en: "Yes. You can share video call links (Zoom, Google Meet) directly in the messaging.",
            },
          },
        ],
      },
      {
        name: { fr: "Paiement", en: "Payment" },
        items: [
          {
            q: { fr: "Quels moyens de paiement acceptez-vous ?", en: "Which payment methods do you accept?" },
            a: {
              fr: "Mobile Money et carte bancaire (MTN, Moov, Celtiis, Mixx by Yas, Airtel, Visa/Mastercard, et plus).",
              en: "Mobile Money and bank card (MTN, Moov, Celtiis, Mixx by Yas, Airtel, Visa/Mastercard and more).",
            },
          },
          {
            q: { fr: "Y a-t-il des remboursements ?", en: "Are there refunds?" },
            a: {
              fr: "Non. Conformément à nos CGV, aucun remboursement n'est accordé une fois l'abonnement activé.",
              en: "No. In line with our terms of sale, no refund is given once the subscription is activated.",
            },
          },
          {
            q: { fr: "L'abonnement se renouvelle-t-il automatiquement ?", en: "Does the subscription renew automatically?" },
            a: {
              fr: "Non. Vous recevrez des rappels par email à J-7, J-3 et J-1 avant expiration pour vous permettre de renouveler.",
              en: "No. You will receive email reminders 7, 3 and 1 day(s) before expiry so you can renew.",
            },
          },
        ],
      },
      {
        name: { fr: "Sécurité", en: "Safety" },
        items: [
          {
            q: { fr: "Comment vérifiez-vous les profils ?", en: "How do you check profiles?" },
            a: {
              fr: "Chaque profil est vérifié manuellement par notre équipe : photo d'identité, informations personnelles, cohérence du profil. Nous utilisons également une IA pour détecter les faux profils.",
              en: "Every profile is manually checked by our team: ID photo, personal information, profile consistency. We also use AI to detect fake profiles.",
            },
          },
          {
            q: { fr: "Que faire si je reçois un message inapproprié ?", en: "What should I do if I receive an inappropriate message?" },
            a: {
              fr: "Utilisez le bouton 'Signaler' sur n'importe quel message ou profil. Notre équipe examine chaque signalement sous 24h et peut suspendre le compte concerné.",
              en: "Use the 'Report' button on any message or profile. Our team reviews every report within 24 hours and can suspend the account concerned.",
            },
          },
          {
            q: { fr: "Mes données sont-elles protégées ?", en: "Is my data protected?" },
            a: {
              fr: "Oui. AuPair A.EU est conforme au RGPD. Vous avez le droit d'accès, de rectification et de suppression de vos données. Consultez notre politique de confidentialité.",
              en: "Yes. AuPair A.EU is GDPR compliant. You have the right to access, rectify and delete your data. See our privacy policy.",
            },
          },
        ],
      },
    ],
  },

  // ─── Contact ───────────────────────────────────────────────────────────────
  contact: {
    title: { fr: "Contactez-nous", en: "Contact us" },
    subtitle: { fr: "Notre équipe répond sous 24h ouvrées", en: "Our team replies within 24 working hours" },
    sentTitle: { fr: "Message envoyé !", en: "Message sent!" },
    sentText: { fr: "Nous vous répondrons dans les 24h ouvrées.", en: "We will reply within 24 working hours." },
    fullName: { fr: "Nom complet *", en: "Full name *" },
    namePlaceholder: { fr: "Votre nom", en: "Your name" },
    email: { fr: "Email *", en: "Email *" },
    emailPlaceholder: { fr: "votre@email.com", en: "your@email.com" },
    subject: { fr: "Sujet *", en: "Subject *" },
    chooseSubject: { fr: "Choisir un sujet", en: "Choose a subject" },
    subjects: {
      inscription: { fr: "Inscription / Compte", en: "Sign-up / Account" },
      paiement: { fr: "Paiement / Abonnement", en: "Payment / Subscription" },
      profil: { fr: "Mon profil", en: "My profile" },
      signalement: { fr: "Signalement", en: "Report" },
      autre: { fr: "Autre", en: "Other" },
    },
    message: { fr: "Message *", en: "Message *" },
    messagePlaceholder: { fr: "Décrivez votre question ou problème...", en: "Describe your question or problem..." },
    send: { fr: "Envoyer le message", en: "Send message" },
    error: { fr: "Une erreur est survenue. Veuillez réessayer.", en: "Something went wrong. Please try again." },
    serverError: { fr: "Impossible de contacter le serveur. Veuillez réessayer.", en: "Unable to reach the server. Please try again." },
    emailReply: { fr: "Réponse sous 24h ouvrées", en: "Reply within 24 working hours" },
    whatsappText: { fr: "Disponible pour les urgences", en: "Available for emergencies" },
    whatsappHours: { fr: "Lun–Ven, 9h–18h (CET)", en: "Mon–Fri, 9am–6pm (CET)" },
    hoursTitle: { fr: "Horaires de support", en: "Support hours" },
    hoursDays: { fr: "Lundi – Vendredi", en: "Monday – Friday" },
    hoursTime: { fr: "9h00 – 18h00 (CET)", en: "9:00am – 6:00pm (CET)" },
  },

  // ─── Annuaires publics (/trouver-au-pair, /trouver-famille) ────────────────
  // Les filtres et libellés communs viennent de `searchAuPairs`, `searchFamilies` et `common` (dashboard.ts).
  publicSearch: {
    auPairTitle: { fr: "Trouver un au pair africain", en: "Find an African au pair" },
    auPairFreeHint: {
      fr: " • Inscription famille gratuite pour accéder aux profils complets",
      en: " • Free family sign-up to access full profiles",
    },
    familyTitle: { fr: "Trouver une famille d'accueil", en: "Find a host family" },
    familySubscriptionHint: {
      fr: " · Abonnement 32€/30 jours pour contacter les familles",
      en: " · €32/30-day subscription to contact families",
    },
    seeFullProfile: { fr: "Voir le profil complet", en: "See full profile" },
    signUpFree: { fr: "S'inscrire gratuitement", en: "Sign up for free" },
    signUpPaid: { fr: "S'inscrire — 32€/30j", en: "Sign up — €32/30 days" },
    familyBannerTitle: {
      fr: "👨‍👩‍👧 Inscrivez-vous gratuitement pour voir les profils complets",
      en: "👨‍👩‍👧 Sign up for free to see full profiles",
    },
    familyBannerText: {
      fr: "Accès aux coordonnées, messagerie, favoris — 100% gratuit pour les familles.",
      en: "Access to contact details, messaging, favourites — 100% free for families.",
    },
    freeSignup: { fr: "Inscription gratuite", en: "Free sign-up" },
    auPairBannerTitle: { fr: "👤 Inscrivez-vous pour contacter les familles", en: "👤 Sign up to contact families" },
    auPairBannerText: {
      fr: "Abonnement au pair à 32€ pour 30 jours. Messagerie illimitée incluse.",
      en: "Au pair subscription: €32 for 30 days. Unlimited messaging included.",
    },
  },

  // ─── Documents légaux (CGU, confidentialité…) ──────────────────────────────
  legalDocument: {
    lastUpdated: { fr: "Dernière mise à jour :", en: "Last updated:" },
  },

  // ─── Page 404 ──────────────────────────────────────────────────────────────
  notFound: {
    title: { fr: "Page introuvable", en: "Page not found" },
    text: {
      fr: "La page que vous cherchez n'existe pas, a été déplacée ou n'est plus disponible.",
      en: "The page you are looking for doesn't exist, has been moved or is no longer available.",
    },
    home: { fr: "Retour à l'accueil", en: "Back to home" },
    back: { fr: "Page précédente", en: "Previous page" },
    mySpace: { fr: "Mon espace", en: "My dashboard" },
    help: { fr: "Besoin d'aide ?", en: "Need help?" },
    contact: { fr: "Contactez-nous", en: "Contact us" },
  },
} satisfies Dictionary;
