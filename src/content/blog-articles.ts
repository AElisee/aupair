/**
 * Articles du blog public, en FR et EN. Utilisés par /blog, /blog/[slug] et l'aperçu de la page d'accueil
 * (les 3 premiers de la liste).
 *
 * Format du contenu : paragraphes séparés par une ligne vide ; "## " pour un titre ; lignes "- " pour une
 * liste à puces ; lignes "1. " pour une liste numérotée ; **gras**.
 * Pour ajouter un article : copier un bloc, changer le slug (URL) et remplir `fr` et `en`.
 */

export type BlogCategory = "guideAuPair" | "guideFamily" | "testimonial" | "regulation" | "news";

type Localized = { title: string; excerpt: string; author: string; content: string };

/** Icône de couverture (Lucide), rendue par `BlogCover` (src/components/blog/). */
export type BlogIcon = "landmark" | "scroll" | "mic" | "sparkles" | "wallet" | "users" | "stamp" | "luggage";

export type BlogArticle = {
  slug: string;
  icon: BlogIcon;
  /** Drapeau (emoji) du pays concerné, affiché en image sur la couverture. */
  flag?: string;
  category: BlogCategory;
  readTime: string;
  /** Date de publication (AAAA-MM-JJ), affichée selon la langue. */
  date: string;
  fr: Localized;
  en: Localized;
};

export const BLOG_ARTICLES: BlogArticle[] = [
  {
    slug: "comment-devenir-au-pair-en-france-2026",
    icon: "landmark",
    flag: "🇫🇷",
    category: "guideAuPair",
    readTime: "5 min",
    date: "2026-03-05",
    fr: {
      title: "Comment devenir au pair en France en 2026 ?",
      excerpt: "Visa, contrat, droits et démarches : le guide complet pour réussir votre candidature au pair en France depuis l'Afrique.",
      author: "Équipe AuPair A.EU",
      content: `## Qu'est-ce qu'un au pair ?

Un au pair est un(e) jeune adulte qui séjourne dans une famille d'accueil en échange d'une aide à la garde des enfants et de quelques tâches ménagères légères. En contrepartie, la famille fournit le logement, les repas et un argent de poche mensuel.

## Les conditions pour devenir au pair en France

Pour être au pair en France, vous devez :
- Avoir entre **18 et 30 ans**
- Posséder un niveau de **français suffisant** (A2 minimum)
- Ne pas avoir de casier judiciaire
- Souscrire une **assurance maladie**
- Obtenir un **visa de long séjour "au pair"**

## Le visa au pair : comment l'obtenir ?

1. **Trouver une famille d'accueil** via AuPair A.EU
2. **Signer une convention de placement** (disponible en préfecture)
3. **Déposer votre demande de visa** au consulat de France de votre pays
4. **Joindre les documents** : convention, extrait de casier judiciaire, assurance, lettre de motivation

## L'argent de poche

En France, l'argent de poche minimum légal est d'environ **350€ par mois** pour 30 heures de travail par semaine. De nombreuses familles proposent plus.

## Conseils pour réussir votre candidature

- **Soignez votre profil** : photo professionnelle, description détaillée, motivation sincère
- **Répondez rapidement** aux messages des familles
- **Préparez une vidéo de présentation** si possible
- **Soyez patient(e)** : le processus peut prendre 2 à 4 mois

## Conclusion

Devenir au pair en France est une expérience enrichissante qui vous permettra d'améliorer votre français, de découvrir la culture française et de gagner une expérience internationale précieuse. Avec AuPair A.EU, vous avez accès aux meilleures familles françaises.
`,
    },
    en: {
      title: "How to become an au pair in France in 2026",
      excerpt: "Visa, contract, rights and paperwork: the complete guide to a successful au pair application in France from Africa.",
      author: "The AuPair A.EU team",
      content: `## What is an au pair?

An au pair is a young adult who stays with a host family in exchange for help with childcare and some light housework. In return, the family provides accommodation, meals and monthly pocket money.

## The requirements to become an au pair in France

To be an au pair in France, you must:
- Be between **18 and 30 years old**
- Have a **sufficient level of French** (A2 minimum)
- Have no criminal record
- Take out **health insurance**
- Obtain a **long-stay "au pair" visa**

## The au pair visa: how to get it

1. **Find a host family** through AuPair A.EU
2. **Sign a placement agreement** (available from the prefecture)
3. **Submit your visa application** at the French consulate in your country
4. **Attach the documents**: agreement, criminal record extract, insurance, cover letter

## Pocket money

In France, the legal minimum pocket money is about **€350 per month** for 30 hours of work per week. Many families offer more.

## Tips for a successful application

- **Take care of your profile**: professional photo, detailed description, sincere motivation
- **Reply quickly** to families' messages
- **Prepare a video introduction** if possible
- **Be patient**: the process can take 2 to 4 months

## Conclusion

Becoming an au pair in France is an enriching experience that will help you improve your French, discover French culture and gain valuable international experience. With AuPair A.EU, you have access to the best French families.
`,
    },
  },
  {
    slug: "regles-aupair-europe",
    icon: "scroll",
    category: "regulation",
    readTime: "7 min",
    date: "2026-02-28",
    fr: {
      title: "Les règles à connaître avant votre séjour au pair en Europe",
      excerpt: "Conditions de travail, visa de long séjour, assurance santé, droits et devoirs : tout ce qu'il faut savoir.",
      author: "Équipe AuPair A.EU",
      content: `## Le cadre légal du programme au pair en Europe

Le programme au pair en Europe est régi par l'**Accord européen sur le placement au pair** signé à Strasbourg. Chaque pays a ensuite ses propres règles nationales, qu'il est impératif de connaître avant de partir.

## Les droits fondamentaux de l'au pair

En tant qu'au pair en Europe, vous bénéficiez de droits fondamentaux :
- **Un logement individuel** dans la famille (chambre privée)
- **Les repas** fournis par la famille
- **Un argent de poche mensuel** (variable selon le pays)
- **Un jour de repos complet** par semaine (généralement le dimanche)
- **Des cours de langue** payés ou remboursés partiellement
- **Une couverture maladie** (à vérifier selon le contrat)

## Les obligations de l'au pair

- Travailler maximum **30 heures par semaine** (25h en Allemagne)
- Prendre soin des enfants avec bienveillance
- Respecter les règles de la maison
- Prévenir en cas d'absence ou de retard

## Comparatif par pays

**France :** 350€/mois minimum, 30h/semaine max, visa "au pair" obligatoire
**Allemagne :** 280€/mois minimum, 25-30h/semaine, visa national D
**Belgique :** 450€/mois minimum, 20h/semaine max, permis de séjour
**Suisse :** 700-900 CHF/mois, 30h/semaine, forte demande en allemand
**Luxembourg :** 500€/mois, 25h/semaine, idéal pour trilingues
**États-Unis :** programme J-1 visa, 195,75$/semaine, 45h/semaine max

## Le contrat au pair : ce qu'il doit contenir

Le contrat est **obligatoire** dans tous les pays européens. Il doit préciser :
- La durée du séjour (généralement 6 à 24 mois)
- Le nombre d'heures de travail par semaine
- Le montant de l'argent de poche
- Les jours de congés (minimum 2 jours par mois)
- Les conditions de résiliation

## En cas de problème avec votre famille

Si votre relation avec la famille d'accueil se dégrade :
1. **Communiquez** d'abord directement avec la famille
2. **Contactez AuPair A.EU** pour une médiation
3. **Signalez aux autorités compétentes** si vos droits sont bafoués
4. **Rentrez au pays** si nécessaire — votre sécurité prime

## Conclusion

Connaître vos droits et obligations vous permettra de vivre votre expérience au pair en toute sérénité. AuPair A.EU vous accompagne à chaque étape de votre démarche.
`,
    },
    en: {
      title: "The rules to know before your au pair stay in Europe",
      excerpt: "Working conditions, long-stay visa, health insurance, rights and duties: everything you need to know.",
      author: "The AuPair A.EU team",
      content: `## The legal framework of the au pair programme in Europe

The au pair programme in Europe is governed by the **European Agreement on "au pair" Placement** signed in Strasbourg. Each country also has its own national rules, which you must know before leaving.

## The au pair's fundamental rights

As an au pair in Europe, you are entitled to fundamental rights:
- **Your own room** in the family home
- **Meals** provided by the family
- **Monthly pocket money** (varies by country)
- **One full day off** per week (usually Sunday)
- **Language classes** paid for or partly reimbursed
- **Health cover** (check your contract)

## The au pair's obligations

- Work a maximum of **30 hours per week** (25h in Germany)
- Look after the children with kindness
- Respect the house rules
- Give notice in case of absence or lateness

## Country comparison

**France:** €350/month minimum, 30h/week max, "au pair" visa required
**Germany:** €280/month minimum, 25-30h/week, national D visa
**Belgium:** €450/month minimum, 20h/week max, residence permit
**Switzerland:** CHF 700-900/month, 30h/week, high demand for German speakers
**Luxembourg:** €500/month, 25h/week, ideal for trilingual candidates
**United States:** J-1 visa programme, $195.75/week, 45h/week max

## The au pair contract: what it must include

A contract is **mandatory** in every European country. It must specify:
- The length of the stay (usually 6 to 24 months)
- The number of working hours per week
- The amount of pocket money
- Days off (minimum 2 days per month)
- The termination conditions

## If you have a problem with your family

If your relationship with the host family deteriorates:
1. **Talk** directly with the family first
2. **Contact AuPair A.EU** for mediation
3. **Report to the relevant authorities** if your rights are not respected
4. **Go home** if necessary — your safety comes first

## Conclusion

Knowing your rights and obligations will let you enjoy your au pair experience with peace of mind. AuPair A.EU supports you at every step.
`,
    },
  },
  {
    slug: "temoignage-cameroun-lyon",
    icon: "mic",
    flag: "🇫🇷",
    category: "testimonial",
    readTime: "4 min",
    date: "2026-02-20",
    fr: {
      title: "Mon expérience au pair depuis le Cameroun jusqu'à Lyon",
      excerpt: "Aminata partage son parcours, les pièges à éviter et ses conseils pour trouver une bonne famille.",
      author: "Aminata K., au pair à Lyon",
      content: `## Mon parcours : de Yaoundé à Lyon

Je m'appelle Aminata, j'ai 24 ans et je suis originaire de Yaoundé, au Cameroun. En septembre 2025, j'ai pris l'avion pour la première fois de ma vie pour rejoindre la famille Moreau à Lyon, en France. Ce que je vais vous raconter, c'est une aventure extraordinaire — avec ses joies et ses défis.

## Comment j'ai découvert AuPair A.EU

J'avais entendu parler du programme au pair par une amie qui travaillait en Belgique. Mais tous les sites que je trouvais étaient en anglais ou en allemand, avec des centaines de profils d'au pairs européens. Je ne savais pas par où commencer.

C'est une cousine qui m'a parlé d'AuPair A.EU. La plateforme était conçue pour des jeunes comme moi — africains, francophones, motivés. En quelques semaines, j'avais reçu 3 messages de familles françaises.

## Le processus de sélection

La famille Moreau m'a contactée en premier. Nous avons échangé par messages pendant deux semaines, puis fait un appel vidéo avec les enfants (Léa, 4 ans, et Thomas, 7 ans). Ils étaient adorables. Madame Moreau m'a expliqué clairement leurs attentes : 30h/semaine, garde des enfants après l'école, aide aux devoirs.

Le plus difficile a été le visa. J'ai dû obtenir un extrait de casier judiciaire, passer une visite médicale et rassembler tous les documents en moins de 3 semaines. Le consulat de France à Yaoundé était débordé. Mais j'y suis arrivée !

## Les premières semaines à Lyon

Arriver dans une nouvelle ville, une nouvelle famille, une nouvelle culture — c'est un choc, même quand on parle déjà français. Il m'a fallu deux semaines pour me sentir à l'aise dans la maison.

Ce qui m'a le plus surprise :
- **La nourriture** : j'ai dû apprendre à cuisiner des plats français (quiche, gratin dauphinois...)
- **Le froid** : Lyon en octobre, c'est une autre réalité que Yaoundé !
- **Le rythme** : tout va très vite en France

## Ce que j'ai appris

Après 6 mois, je parle un français beaucoup plus fluide, j'ai découvert une autre culture, et j'ai des amies au pair venues du Sénégal, du Bénin et du Maroc. Lyon est une ville fantastique pour sortir, visiter, et apprendre.

## Mes conseils pour les futures au pairs

- **Soyez honnête dans votre profil** : décrivez vos vraies compétences
- **Posez des questions** avant de signer quoi que ce soit
- **Rejoignez des groupes d'au pairs** dans votre ville d'accueil
- **Ne vous isolez pas** : c'est le piège numéro 1

## Conclusion

Je ne regrette rien. Cette expérience a changé ma vie. Si vous hésitez encore, lancez-vous — AuPair A.EU vous donnera toutes les chances de réussir.
`,
    },
    en: {
      title: "My au pair experience from Cameroon to Lyon",
      excerpt: "Aminata shares her journey, the pitfalls to avoid and her tips for finding a good family.",
      author: "Aminata K., au pair in Lyon",
      content: `## My journey: from Yaoundé to Lyon

My name is Aminata, I'm 24 and I come from Yaoundé, Cameroon. In September 2025, I took a plane for the first time in my life to join the Moreau family in Lyon, France. What I'm about to tell you is an extraordinary adventure — with its joys and its challenges.

## How I discovered AuPair A.EU

I had heard about the au pair programme from a friend who worked in Belgium. But every site I found was in English or German, with hundreds of profiles of European au pairs. I didn't know where to start.

A cousin told me about AuPair A.EU. The platform was designed for young people like me — African, French-speaking, motivated. Within a few weeks, I had received 3 messages from French families.

## The selection process

The Moreau family contacted me first. We exchanged messages for two weeks, then had a video call with the children (Léa, 4, and Thomas, 7). They were adorable. Mrs Moreau clearly explained what they expected: 30h/week, looking after the children after school, homework help.

The hardest part was the visa. I had to get a criminal record extract, have a medical check-up and gather all the documents in less than 3 weeks. The French consulate in Yaoundé was overwhelmed. But I made it!

## The first weeks in Lyon

Arriving in a new city, a new family, a new culture — it's a shock, even when you already speak French. It took me two weeks to feel comfortable in the house.

What surprised me most:
- **The food**: I had to learn to cook French dishes (quiche, gratin dauphinois...)
- **The cold**: Lyon in October is a very different reality from Yaoundé!
- **The pace**: everything moves very fast in France

## What I learned

After 6 months, my French is much more fluent, I have discovered another culture, and I have au pair friends from Senegal, Benin and Morocco. Lyon is a fantastic city for going out, sightseeing and learning.

## My tips for future au pairs

- **Be honest in your profile**: describe your real skills
- **Ask questions** before signing anything
- **Join au pair groups** in your host city
- **Don't isolate yourself**: it's the number 1 trap

## Conclusion

I have no regrets. This experience changed my life. If you are still hesitating, go for it — AuPair A.EU will give you every chance of success.
`,
    },
  },
  {
    slug: "matching-aupair-famille-conseils",
    icon: "sparkles",
    category: "news",
    readTime: "3 min",
    date: "2026-02-15",
    fr: {
      title: "Comment AuPair A.EU améliore la mise en relation au pair/famille",
      excerpt: "Algorithme de matching, messagerie sécurisée, profils vérifiés : les nouvelles fonctionnalités de la plateforme.",
      author: "Équipe AuPair A.EU",
      content: `## Un algorithme pensé pour l'Afrique et l'Europe

Depuis le lancement d'AuPair A.EU, notre équipe a travaillé sur un système de matching intelligent qui tient compte des réalités culturelles, linguistiques et géographiques propres à notre communauté.

## Les critères de compatibilité

Notre algorithme analyse **12 critères de compatibilité** pour suggérer les meilleures correspondances :
- Pays d'origine et langue(s) parlée(s)
- Expérience avec les enfants (âge, nombre)
- Disponibilité et durée souhaitée
- Spécialités (cuisine, aide aux devoirs, activités sportives)
- Valeurs et style de vie déclarés
- Budget de la famille vs aspirations de l'au pair

## La messagerie sécurisée

Toutes les communications passent par notre messagerie interne, chiffrée de bout en bout. Cela garantit :
- La **protection de vos données personnelles**
- La **traçabilité** des échanges en cas de litige
- Un environnement **sans harcèlement** (modération active)

## Les profils vérifiés

Chaque profil est soumis à une **vérification manuelle** par notre équipe avant d'être rendu visible :
- Vérification de l'identité (pièce d'identité)
- Validation de l'expérience déclarée
- Vérification de l'authenticité de la photo

## Ce qui arrive en 2026

Nous travaillons sur de nouvelles fonctionnalités :
- **Appel vidéo intégré** directement dans la plateforme
- **Contrats numériques** signés électroniquement
- **Suivi en temps réel** du dossier visa
- **Communauté au pairs** : forum, conseils, événements

## Conclusion

AuPair A.EU n'est pas qu'une plateforme de mise en relation — c'est un écosystème complet qui accompagne l'au pair et la famille du premier contact jusqu'à la fin du séjour.
`,
    },
    en: {
      title: "How AuPair A.EU improves au pair/family matching",
      excerpt: "Matching algorithm, secure messaging, verified profiles: the platform's new features.",
      author: "The AuPair A.EU team",
      content: `## An algorithm designed for Africa and Europe

Since AuPair A.EU launched, our team has worked on a smart matching system that takes into account the cultural, linguistic and geographical realities of our community.

## The compatibility criteria

Our algorithm analyses **12 compatibility criteria** to suggest the best matches:
- Country of origin and language(s) spoken
- Experience with children (ages, number)
- Availability and preferred duration
- Specialities (cooking, homework help, sports activities)
- Stated values and lifestyle
- Family budget vs au pair expectations

## Secure messaging

All communication goes through our internal messaging, encrypted end to end. This guarantees:
- The **protection of your personal data**
- **Traceability** of exchanges in case of dispute
- A **harassment-free** environment (active moderation)

## Verified profiles

Every profile goes through a **manual check** by our team before it becomes visible:
- Identity check (ID document)
- Validation of the stated experience
- Check that the photo is genuine

## Coming in 2026

We are working on new features:
- **Built-in video calls** directly on the platform
- **Digital contracts** signed electronically
- **Real-time tracking** of the visa application
- **Au pair community**: forum, tips, events

## Conclusion

AuPair A.EU is not just a matching platform — it is a complete ecosystem that supports the au pair and the family from the first contact to the end of the stay.
`,
    },
  },
  {
    slug: "argent-poche-aupair-europe",
    icon: "wallet",
    category: "guideAuPair",
    readTime: "6 min",
    date: "2026-02-10",
    fr: {
      title: "Combien gagne un au pair en Europe ? Comparatif par pays",
      excerpt: "France : 350-400€/mois, Allemagne : 380-500€, Suisse : 500-700€... Le comparatif complet des argents de poche.",
      author: "Équipe AuPair A.EU",
      content: `## L'argent de poche au pair : de quoi s'agit-il ?

L'argent de poche au pair n'est pas un salaire au sens légal du terme. C'est une **allocation mensuelle** versée par la famille en contrepartie des services rendus. Il s'y ajoute le logement et les repas, ce qui représente une valeur importante à ne pas négliger.

## Comparatif des argents de poche en Europe

**🇫🇷 France**
- Minimum légal : **350€/mois**
- Heures : 30h/semaine maximum
- La plupart des familles : 350-450€
- Valeur logement + repas estimée : ~700-900€/mois

**🇩🇪 Allemagne**
- Minimum : **280€/mois**
- Heures : 25-30h/semaine
- Familles premium : jusqu'à 500€
- Forte demande en Bavière et à Berlin

**🇧🇪 Belgique**
- Minimum : **450€/mois**
- Heures : 20h/semaine
- Avantage : accès aux transports en commun souvent inclus

**🇨🇭 Suisse**
- Minimum : **700-900 CHF/mois** (env. 730-940€)
- Heures : 30h/semaine
- Niveau de vie très élevé, mais coût de la vie aussi
- Langues : français, allemand ou italien selon la région

**🇱🇺 Luxembourg**
- Minimum : **500€/mois**
- Heures : 25h/semaine
- Idéal pour les trilingues (FR/EN/DE)

**🇺🇸 États-Unis**
- Programme J-1 visa obligatoire
- **195,75$/semaine** (environ 850$/mois)
- 45h/semaine maximum, 10h/jour max
- Logement fourni, voiture souvent partagée

## Ce que vaut vraiment votre rémunération totale

Ne regardez pas seulement l'argent de poche ! Calculez la **rémunération totale** :
- Argent de poche mensuel
- + Valeur du logement (chambre individuelle)
- + Valeur des repas (3 repas/jour)
- + Éventuels transports payés
- + Cours de langue remboursés

Pour la France, cela représente souvent **1 200 à 1 400€ équivalents** par mois.

## Comment négocier son argent de poche ?

- Mettez en avant vos **compétences spécifiques** (enseignement, musique, sport)
- Acceptez plus d'heures en échange d'un argent de poche plus élevé
- N'hésitez pas à comparer plusieurs offres avant de vous décider
- Vérifiez que le montant proposé respecte le **minimum légal du pays**

## Conseils pratiques pour gérer votre budget

- Ouvrez un compte bancaire local rapidement
- Utilisez **Revolut ou Wise** pour les transferts vers l'Afrique sans frais
- Évitez les dépenses impulsives les premiers mois
- Économisez pour votre retour ou un projet personnel

## Conclusion

Être au pair en Europe n'est pas une façon de "s'enrichir" rapidement, mais c'est une expérience qui combine rémunération, logement, apprentissage et ouverture culturelle. Choisissez votre pays selon vos priorités personnelles.
`,
    },
    en: {
      title: "How much does an au pair earn in Europe? Country comparison",
      excerpt: "France: €350-400/month, Germany: €380-500, Switzerland: €500-700... The complete pocket money comparison.",
      author: "The AuPair A.EU team",
      content: `## Au pair pocket money: what is it?

Au pair pocket money is not a salary in the legal sense. It is a **monthly allowance** paid by the family in return for the services provided. On top of it come accommodation and meals, which represent significant value that should not be overlooked.

## Pocket money comparison in Europe

**🇫🇷 France**
- Legal minimum: **€350/month**
- Hours: 30h/week maximum
- Most families: €350-450
- Estimated value of room + board: ~€700-900/month

**🇩🇪 Germany**
- Minimum: **€280/month**
- Hours: 25-30h/week
- Premium families: up to €500
- High demand in Bavaria and Berlin

**🇧🇪 Belgium**
- Minimum: **€450/month**
- Hours: 20h/week
- Bonus: public transport often included

**🇨🇭 Switzerland**
- Minimum: **CHF 700-900/month** (approx. €730-940)
- Hours: 30h/week
- Very high standard of living, but also a high cost of living
- Languages: French, German or Italian depending on the region

**🇱🇺 Luxembourg**
- Minimum: **€500/month**
- Hours: 25h/week
- Ideal for trilingual candidates (FR/EN/DE)

**🇺🇸 United States**
- J-1 visa programme required
- **$195.75/week** (about $850/month)
- 45h/week maximum, 10h/day max
- Accommodation provided, car often shared

## What your total compensation is really worth

Don't just look at the pocket money! Calculate your **total compensation**:
- Monthly pocket money
- + Value of the accommodation (private room)
- + Value of the meals (3 meals/day)
- + Any transport paid for
- + Reimbursed language classes

For France, this often amounts to **€1,200 to €1,400 equivalent** per month.

## How to negotiate your pocket money

- Highlight your **specific skills** (teaching, music, sport)
- Accept more hours in exchange for higher pocket money
- Don't hesitate to compare several offers before deciding
- Check that the amount offered meets the **country's legal minimum**

## Practical tips for managing your budget

- Open a local bank account quickly
- Use **Revolut or Wise** for fee-free transfers to Africa
- Avoid impulse spending in the first months
- Save for your return or a personal project

## Conclusion

Being an au pair in Europe is not a way to "get rich" quickly, but it is an experience that combines pay, accommodation, learning and cultural discovery. Choose your country according to your personal priorities.
`,
    },
  },
  {
    slug: "famille-accueil-choisir-aupair",
    icon: "users",
    category: "guideFamily",
    readTime: "5 min",
    date: "2026-02-03",
    fr: {
      title: "Familles d'accueil : comment bien choisir votre au pair africain ?",
      excerpt: "Les critères essentiels pour choisir un au pair qualifié, de confiance et compatible avec votre famille.",
      author: "Équipe AuPair A.EU",
      content: `## Pourquoi choisir un au pair via AuPair A.EU ?

AuPair A.EU est la première plateforme spécialisée dans la mise en relation entre familles européennes et américaines et jeunes au pairs africains. Les profils sont vérifiés, les motivations authentiques, et notre équipe vous accompagne tout au long du processus.

## Les critères essentiels pour choisir votre au pair

**1. L'expérience avec les enfants**
Regardez le nombre d'années d'expérience déclaré et les références. Un au pair qui a déjà gardé des enfants en bas âge sera plus à l'aise qu'un premier débutant.

**2. La maîtrise du français**
Pour les familles francophones, vérifiez le niveau de langue. Un au pair qui parle couramment le français s'intégrera plus facilement à votre quotidien.

**3. La compatibilité culturelle**
Chaque pays africain a sa propre culture. Un au pair du Cameroun, du Sénégal ou de Côte d'Ivoire n'aura pas exactement le même background. Échangez sur vos valeurs et votre quotidien.

**4. La motivation réelle**
La vraie question : pourquoi veut-il/elle être au pair ? Les meilleures candidatures mentionnent une envie d'apprendre, de découvrir, et un projet de vie concret.

**5. Les compétences complémentaires**
Certains au pairs ont des compétences précieuses : aide aux devoirs, enseignement d'une langue africaine, activités sportives, cuisine africaine, musique.

## Comment mener le premier entretien vidéo

- **Présentez votre famille** : composition, maison, quartier, rythme de vie
- **Expliquez clairement vos attentes** : horaires, tâches, règles de la maison
- **Laissez parler le candidat** : posez des questions ouvertes
- **Impliquez vos enfants** si possible — leur feeling compte !

## Les questions à poser absolument

- "Qu'est-ce qui vous a donné envie de devenir au pair ?"
- "Comment réagissez-vous si un enfant fait une crise ?"
- "Avez-vous de l'expérience avec des enfants de [âge de vos enfants] ?"
- "Quels sont vos projets après votre séjour au pair ?"

## Les signaux d'alerte

Méfiez-vous des profils qui :
- Ne répondent pas aux messages depuis plus de 48h sans explication
- Cherchent uniquement à "s'établir" en Europe (motivation peu alignée avec le rôle)
- Refusent de faire un appel vidéo avant la signature
- Ont des références impossibles à vérifier

## Préparer l'arrivée de votre au pair

- Aménagez une **chambre confortable** avec accès à internet
- Prévoyez une **semaine d'intégration** avant le plein rythme
- Créez un **guide de la maison** (règles, habitudes, contacts utiles)
- Désignez un **référent** si vous êtes souvent absents

## Conclusion

Le bon au pair n'est pas forcément le plus qualifié sur le papier, mais celui avec qui votre famille se sentira en confiance. Prenez le temps de bien choisir — c'est une relation humaine avant tout.
`,
    },
    en: {
      title: "Host families: how to choose the right African au pair",
      excerpt: "The key criteria for choosing a qualified, trustworthy au pair who is a good fit for your family.",
      author: "The AuPair A.EU team",
      content: `## Why choose an au pair through AuPair A.EU?

AuPair A.EU is the first platform specialised in connecting European and American families with young African au pairs. Profiles are verified, motivations are genuine, and our team supports you throughout the process.

## The key criteria for choosing your au pair

**1. Experience with children**
Look at the number of years of experience stated and the references. An au pair who has already looked after young children will be more at ease than a complete beginner.

**2. Command of French**
For French-speaking families, check the language level. An au pair who speaks fluent French will fit into your daily life more easily.

**3. Cultural compatibility**
Every African country has its own culture. An au pair from Cameroon, Senegal or Côte d'Ivoire will not have exactly the same background. Talk about your values and your daily life.

**4. Genuine motivation**
The real question: why does he/she want to be an au pair? The best applications mention a desire to learn, to discover, and a concrete life project.

**5. Additional skills**
Some au pairs have valuable skills: homework help, teaching an African language, sports activities, African cooking, music.

## How to run the first video interview

- **Introduce your family**: members, home, neighbourhood, daily rhythm
- **Explain your expectations clearly**: hours, tasks, house rules
- **Let the candidate talk**: ask open questions
- **Involve your children** if possible — their feeling matters!

## Questions you must ask

- "What made you want to become an au pair?"
- "How do you react if a child has a tantrum?"
- "Do you have experience with children aged [your children's ages]?"
- "What are your plans after your au pair stay?"

## Warning signs

Be wary of profiles that:
- Don't reply to messages for more than 48h without explanation
- Only want to "settle" in Europe (motivation poorly aligned with the role)
- Refuse a video call before signing
- Have references that cannot be checked

## Preparing for your au pair's arrival

- Set up a **comfortable room** with internet access
- Plan an **induction week** before the full routine
- Write a **house guide** (rules, habits, useful contacts)
- Appoint a **contact person** if you are often away

## Conclusion

The right au pair is not necessarily the most qualified on paper, but the one your family feels confident with. Take the time to choose well — it is a human relationship above all.
`,
    },
  },
  {
    slug: "visa-au-pair-cameroun-senegal-cotedivoire",
    icon: "stamp",
    category: "regulation",
    readTime: "8 min",
    date: "2026-01-25",
    fr: {
      title: "Visa au pair : guide complet pour les ressortissants africains",
      excerpt: "Toutes les étapes pour obtenir votre visa au pair depuis le Cameroun, le Sénégal, la Côte d'Ivoire et 11 autres pays africains.",
      author: "Équipe AuPair A.EU",
      content: `## Le visa au pair : spécificités pour les ressortissants africains

Obtenir un visa au pair depuis l'Afrique subsaharienne est possible, mais cela nécessite une préparation rigoureuse. Voici le guide complet, pays par pays, pour les ressortissants camerounais, sénégalais, ivoiriens et de 11 autres nationalités africaines.

## Les pays qui acceptent des au pairs africains en Europe

La bonne nouvelle : la plupart des pays d'accueil européens n'imposent pas de restriction de nationalité pour les au pairs. Ce qui compte, c'est votre dossier, votre motivation et votre contrat avec la famille.

- **France** : ouverte à toutes nationalités — visa "étudiant/au pair" ou visa de long séjour
- **Allemagne** : ouverte, visa national D requis
- **Belgique** : ouverte, permis de séjour via commune d'accueil
- **Suisse** : plus sélective, préférence pour les ressortissants de pays avec accord bilatéral
- **Luxembourg** : ouverte, carte de séjour obligatoire

## Étapes pour obtenir votre visa au pair (France)

1. **Trouver votre famille via AuPair A.EU** et obtenir la convention de placement signée
2. **Télécharger et compléter le formulaire de demande de visa** (site france-visas.gouv.fr)
3. **Rassembler les documents requis** :
   - Passeport valide (min. 6 mois après la date de retour prévue)
   - Photos d'identité conformes
   - Convention de placement signée par la famille et vous
   - Lettre de motivation
   - Justificatif de niveau de français (Alliance Française, Institut Français)
   - Attestation d'assurance maladie
   - Extrait de casier judiciaire (moins de 3 mois)
   - Justificatif de domicile de la famille d'accueil
4. **Prendre rendez-vous au consulat** de France de votre pays
5. **Attendre la décision** (2 à 8 semaines selon les consulats)

## Délais selon les pays

- Yaoundé (Cameroun) : 4 à 8 semaines
- Dakar (Sénégal) : 3 à 6 semaines
- Abidjan (Côte d'Ivoire) : 4 à 7 semaines
- Cotonou (Bénin) : 3 à 5 semaines
- Lomé (Togo) : 3 à 5 semaines

## Les erreurs à éviter

- **Ne pas mentionner votre candidature au pair** lors de la demande de visa touriste
- **Sous-estimer les délais** : commencez les démarches au moins 3 mois avant la date souhaitée
- **Dossier incomplet** : une pièce manquante peut entraîner un refus ou un délai supplémentaire
- **Famille non enregistrée** : assurez-vous que la famille a bien fait les démarches en France

## Que faire en cas de refus ?

Un refus n'est pas définitif. Vous pouvez :
- Demander les **motifs du refus** par écrit
- **Compléter votre dossier** et refaire une demande
- **Changer de pays d'accueil** si plusieurs familles vous ont contacté

## AuPair A.EU vous accompagne

Notre équipe peut vous aider à :
- Vérifier que votre dossier est complet avant le dépôt
- Vous mettre en contact avec des au pairs qui ont déjà vécu le même parcours
- Identifier les consulats les plus réactifs dans votre pays

Contactez-nous via la page Contact si vous avez des questions spécifiques à votre situation.
`,
    },
    en: {
      title: "Au pair visa: the complete guide for African nationals",
      excerpt: "Every step to get your au pair visa from Cameroon, Senegal, Côte d'Ivoire and 11 other African countries.",
      author: "The AuPair A.EU team",
      content: `## The au pair visa: specifics for African nationals

Getting an au pair visa from sub-Saharan Africa is possible, but it requires careful preparation. Here is the complete guide, country by country, for nationals of Cameroon, Senegal, Côte d'Ivoire and 11 other African countries.

## The countries that accept African au pairs in Europe

The good news: most European host countries do not restrict au pairs by nationality. What matters is your application, your motivation and your contract with the family.

- **France**: open to all nationalities — "student/au pair" visa or long-stay visa
- **Germany**: open, national D visa required
- **Belgium**: open, residence permit through the host municipality
- **Switzerland**: more selective, preference for nationals of countries with a bilateral agreement
- **Luxembourg**: open, residence card required

## Steps to get your au pair visa (France)

1. **Find your family through AuPair A.EU** and get the signed placement agreement
2. **Download and fill in the visa application form** (france-visas.gouv.fr)
3. **Gather the required documents**:
   - Valid passport (at least 6 months after the planned return date)
   - Compliant ID photos
   - Placement agreement signed by the family and you
   - Cover letter
   - Proof of French level (Alliance Française, Institut Français)
   - Health insurance certificate
   - Criminal record extract (less than 3 months old)
   - Proof of address of the host family
4. **Book an appointment at the French consulate** in your country
5. **Wait for the decision** (2 to 8 weeks depending on the consulate)

## Processing times by country

- Yaoundé (Cameroon): 4 to 8 weeks
- Dakar (Senegal): 3 to 6 weeks
- Abidjan (Côte d'Ivoire): 4 to 7 weeks
- Cotonou (Benin): 3 to 5 weeks
- Lomé (Togo): 3 to 5 weeks

## Mistakes to avoid

- **Not mentioning your au pair application** when applying for a tourist visa
- **Underestimating the timeline**: start the process at least 3 months before your preferred date
- **Incomplete application**: a single missing document can lead to a refusal or extra delay
- **Family not registered**: make sure the family has completed its own steps in France

## What to do if you are refused

A refusal is not final. You can:
- Ask for the **reasons for the refusal** in writing
- **Complete your application** and apply again
- **Change host country** if several families have contacted you

## AuPair A.EU is here to help

Our team can help you:
- Check that your application is complete before submitting it
- Put you in touch with au pairs who have been through the same process
- Identify the most responsive consulates in your country

Contact us through the Contact page if you have questions specific to your situation.
`,
    },
  },
  {
    slug: "preparer-valise-au-pair-europe",
    icon: "luggage",
    category: "guideAuPair",
    readTime: "4 min",
    date: "2026-01-18",
    fr: {
      title: "Comment préparer sa valise pour partir au pair en Europe ?",
      excerpt: "Vêtements, documents, médicaments, budget de départ : la checklist complète pour partir serein depuis l'Afrique.",
      author: "Équipe AuPair A.EU",
      content: `## La règle d'or : voyager léger, acheter sur place

La tentation de tout emporter est grande. Résistez-y ! Les compagnies aériennes limitent souvent les bagages à 23 kg, et vous aurez besoin de place pour ramener des souvenirs.

## Les documents indispensables (NE JAMAIS METTRE EN SOUTE)

Gardez toujours avec vous dans votre bagage à main :
- Passeport + visa
- Convention au pair signée
- Coordonnées de la famille d'accueil (imprimées, pas seulement sur téléphone)
- Carte de groupe sanguin / ordonnances médicales importantes
- Carte de paiement internationale (Visa/Mastercard)
- Assurance maladie (carte + numéro d'urgence)

## Vêtements : la vraie réalité du climat européen

C'est souvent la grande surprise des au pairs africains : le froid européen en automne/hiver est **brutal** comparé à l'Afrique sub-saharienne.

**À emporter impérativement :**
- 1 manteau chaud (acheté en Afrique peut coûter moins cher)
- Des sous-vêtements thermiques
- Des chaussettes épaisses
- 1 paire de chaussures imperméables

**À ne pas surcharger :**
- Vêtements d'été (vous en aurez peu l'usage d'octobre à avril)
- Tenues habillées (vous en achèterez sur place si besoin)

## La trousse de premiers secours

Emportez vos médicaments habituels pour les 3 premiers mois :
- Antipaludéens (si votre médecin les recommande)
- Médicaments contre le mal de ventre
- Anti-douleurs
- Crème solaire haute protection (la peau africaine réagit aussi au soleil européen en été)
- Votre contraception habituelle (les marques diffèrent en Europe)

## Les produits cosmétiques pour cheveux africains

**Bonne nouvelle :** les grandes villes européennes (Paris, Lyon, Berlin, Bruxelles) ont d'excellents salons et magasins afro. Mais les premières semaines, prévoyez :
- Vos shampooings et soins habituels pour 1 mois
- Bonnet de nuit
- Peigne/brosse adaptés à votre type de cheveux

## L'argent de départ

Ne partez jamais sans un matelas de sécurité :
- **Minimum 300-500€** en arrivant pour les premières dépenses
- Ouvrez un compte Wise ou Revolut avant de partir (accepte les virements africains)
- Demandez à la famille si elle peut vous avancer l'argent de poche du premier mois

## Ce que vous trouverez facilement sur place

Ne chargez pas votre valise avec :
- Produits alimentaires (amendes douanières possibles)
- Livres (achetez sur place ou lisez en numérique)
- Appareils électriques (prises différentes en Europe)

## La checklist finale

Avant de fermer votre valise :
- Documents vitaux dans le bagage à main ✓
- Manteau chaud ✓
- Médicaments pour 3 mois ✓
- Adaptateur de prise électrique ✓
- Chargeur de téléphone ✓
- Photo de votre famille pour les moments de nostalgie ✓

Bon voyage et bienvenue dans votre nouvelle aventure !
`,
    },
    en: {
      title: "How to pack your suitcase for your au pair stay in Europe",
      excerpt: "Clothes, documents, medication, starting budget: the complete checklist to leave Africa with peace of mind.",
      author: "The AuPair A.EU team",
      content: `## The golden rule: travel light, buy there

The temptation to take everything is strong. Resist it! Airlines often limit luggage to 23 kg, and you will need space to bring back souvenirs.

## Essential documents (NEVER IN CHECKED LUGGAGE)

Always keep these in your hand luggage:
- Passport + visa
- Signed au pair agreement
- Host family's contact details (printed, not just on your phone)
- Blood group card / important medical prescriptions
- International payment card (Visa/Mastercard)
- Health insurance (card + emergency number)

## Clothes: the reality of the European climate

This is often the big surprise for African au pairs: the European cold in autumn/winter is **harsh** compared to sub-Saharan Africa.

**Must take:**
- 1 warm coat (buying it in Africa can be cheaper)
- Thermal underwear
- Thick socks
- 1 pair of waterproof shoes

**Don't overload:**
- Summer clothes (you'll hardly use them from October to April)
- Formal outfits (you can buy them there if needed)

## The first-aid kit

Take your usual medication for the first 3 months:
- Antimalarials (if your doctor recommends them)
- Stomach-ache medication
- Painkillers
- High-protection sunscreen (African skin also reacts to the European summer sun)
- Your usual contraception (brands differ in Europe)

## Cosmetics for African hair

**Good news:** big European cities (Paris, Lyon, Berlin, Brussels) have excellent Afro salons and shops. But for the first weeks, bring:
- Your usual shampoos and treatments for 1 month
- A night bonnet
- A comb/brush suited to your hair type

## Starting money

Never leave without a safety cushion:
- **At least €300-500** on arrival for the first expenses
- Open a Wise or Revolut account before leaving (accepts transfers from Africa)
- Ask the family whether they can advance the first month's pocket money

## What you will easily find there

Don't fill your suitcase with:
- Food products (customs fines are possible)
- Books (buy them there or read digitally)
- Electrical appliances (plugs are different in Europe)

## The final checklist

Before closing your suitcase:
- Vital documents in hand luggage ✓
- Warm coat ✓
- Medication for 3 months ✓
- Plug adapter ✓
- Phone charger ✓
- A photo of your family for homesick moments ✓

Have a good trip and welcome to your new adventure!
`,
    },
  },
  {
    slug: "temoignage-kofi-berlin",
    icon: "mic",
    flag: "🇩🇪",
    category: "testimonial",
    readTime: "5 min",
    date: "2026-01-10",
    fr: {
      title: "Kofi, 23 ans, au pair à Berlin : 'Je n'aurais jamais imaginé vivre ça'",
      excerpt: "Un jeune Ghanéen raconte son quotidien dans une famille allemande, ses galères avec la langue et ses plus belles découvertes.",
      author: "Kofi M., au pair à Berlin",
      content: `## Mon départ du Ghana : une décision qui fait peur

Quand j'ai dit à mes parents que je partais en Allemagne comme au pair, ils ont d'abord cru que c'était une arnaque. "Kofi, personne ne paie un jeune Africain pour garder des enfants en Europe." Il m'a fallu deux heures pour leur expliquer ce qu'était le programme au pair.

J'avais 22 ans, j'avais fini mes études en communication à l'Université de Accra, et je voulais voir le monde. J'avais trouvé AuPair A.EU par hasard, en cherchant des infos sur les visa de travail en Europe. La plateforme m'a immédiatement rassuré : les profils étaient vérifiés, les familles aussi, et le processus était clair.

## La famille Weber : une rencontre inattendue

La famille Weber habite à Charlottenburg, un quartier chic de Berlin. Monsieur Weber est ingénieur, Madame Weber est avocate. Ils ont deux garçons : Felix (8 ans) et Maximilian (5 ans). Avant de m'accepter, ils ont fait trois entretiens vidéo avec moi, dont un avec les enfants.

Felix m'a demandé si je connaissais les Lego Technic. Par chance, j'avais un neveu fan de Lego. On a parlé pendant vingt minutes. C'est lui qui a convaincu ses parents de me prendre.

## L'allemand : le vrai défi

Je ne parlais pas un mot d'allemand quand je suis arrivé. La famille parlait anglais, donc les premiers mois, on communiquait dans ma langue. Mais Berlin, c'est compliqué pour un anglophone : les supermarchés, les transports, les médecins — tout est en allemand.

La famille Weber m'a inscrit à des cours d'allemand 3 fois par semaine. En 6 mois, je pouvais avoir une vraie conversation avec les voisins. En 12 mois, je comprenais les infos à la télé. C'est une fierté immense.

## Ce que personne ne m'avait dit

**Le froid.** Berlin en janvier, c'est -10°C certains jours. Je venais d'Accra où il ne fait jamais moins de 20°C. La première fois que j'ai vu de la neige, j'ai pris 15 photos. Les semaines suivantes, je maudissais ce même froid.

**La solitude.** Les premières semaines, même si la famille était accueillante, le soir dans ma chambre, l'absence de ma famille, de mes amis, de mon quartier — c'est physiquement douloureux. C'est normal. Ça passe.

**La liberté.** Et puis, peu à peu, cette liberté que je n'avais jamais vraiment eue. Prendre le U-Bahn tout seul, découvrir Kreuzberg et ses restaurants du monde entier, me faire des amis au pairs venus du Sénégal, du Mexique, de l'Inde...

## Mes plus beaux souvenirs

- Le premier Noël avec la famille Weber : le sapin, les cadeaux sous la neige, le Glühwein sur les marchés de Noël
- La semaine de vacances à Hambourg avec les enfants — Felix et Max ont chanté mes chansons ghanéennes tout le voyage
- Ma première soirée "Berlin by night" avec d'autres au pairs — une ville qui ne dort jamais

## Ce que ça m'a apporté

J'ai maintenant 23 ans. Mon contrat au pair se termine dans 4 mois. J'ai décidé de rester en Allemagne — j'ai trouvé un stage dans une agence de communication à Berlin. Mon allemand est maintenant suffisant pour travailler.

Mais surtout, j'ai grandi. J'ai appris à me débrouiller seul, à gérer l'adversité, à m'adapter. Ce sont des compétences qu'aucune école ne m'aurait données.

## Mon conseil aux jeunes Africains qui hésitent

Le monde a besoin de nous. Nos cultures, notre énergie, notre créativité — tout ça a une valeur immense en Europe. N'attendez pas que quelqu'un vous en donne la permission. Créez votre profil sur AuPair A.EU et faites le premier pas. Le reste suivra.
`,
    },
    en: {
      title: "Kofi, 23, au pair in Berlin: 'I never imagined I would live this'",
      excerpt: "A young Ghanaian talks about daily life with a German family, his struggles with the language and his best discoveries.",
      author: "Kofi M., au pair in Berlin",
      content: `## Leaving Ghana: a scary decision

When I told my parents I was leaving for Germany as an au pair, they first thought it was a scam. "Kofi, nobody pays a young African to look after children in Europe." It took me two hours to explain to them what the au pair programme was.

I was 22, I had finished my communication studies at the University of Accra, and I wanted to see the world. I found AuPair A.EU by chance while looking for information on work visas in Europe. The platform reassured me straight away: profiles were verified, families too, and the process was clear.

## The Weber family: an unexpected encounter

The Weber family lives in Charlottenburg, an upmarket district of Berlin. Mr Weber is an engineer, Mrs Weber is a lawyer. They have two boys: Felix (8) and Maximilian (5). Before accepting me, they had three video interviews with me, including one with the children.

Felix asked me if I knew Lego Technic. Luckily, I had a nephew who loved Lego. We talked for twenty minutes. He is the one who convinced his parents to choose me.

## German: the real challenge

I didn't speak a word of German when I arrived. The family spoke English, so for the first months we communicated in my language. But Berlin is complicated for an English speaker: supermarkets, transport, doctors — everything is in German.

The Weber family signed me up for German classes 3 times a week. After 6 months, I could have a real conversation with the neighbours. After 12 months, I understood the news on TV. It's a huge source of pride.

## What nobody had told me

**The cold.** Berlin in January means -10°C on some days. I came from Accra, where it is never below 20°C. The first time I saw snow, I took 15 photos. The following weeks, I cursed that same cold.

**Loneliness.** In the first weeks, even though the family was welcoming, at night in my room, missing my family, my friends, my neighbourhood — it physically hurts. It's normal. It passes.

**Freedom.** And then, little by little, a freedom I had never really had. Taking the U-Bahn on my own, discovering Kreuzberg and its restaurants from all over the world, making au pair friends from Senegal, Mexico, India...

## My best memories

- The first Christmas with the Weber family: the tree, presents under the snow, Glühwein at the Christmas markets
- The holiday week in Hamburg with the children — Felix and Max sang my Ghanaian songs the whole trip
- My first "Berlin by night" with other au pairs — a city that never sleeps

## What it gave me

I'm 23 now. My au pair contract ends in 4 months. I have decided to stay in Germany — I found an internship at a communication agency in Berlin. My German is now good enough to work.

But above all, I have grown. I learned to manage on my own, to deal with adversity, to adapt. These are skills no school would have given me.

## My advice to young Africans who are hesitating

The world needs us. Our cultures, our energy, our creativity — all of this has immense value in Europe. Don't wait for someone to give you permission. Create your profile on AuPair A.EU and take the first step. The rest will follow.
`,
    },
  },
];

export function getBlogArticle(slug: string): BlogArticle | undefined {
  return BLOG_ARTICLES.find((a) => a.slug === slug);
}
