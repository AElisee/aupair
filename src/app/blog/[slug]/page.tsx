import Link from "next/link";
import { ArrowLeft, Clock, Calendar, Tag } from "lucide-react";
import type { Metadata } from "next";

const articles: Record<string, {
  title: string; category: string; readTime: string; date: string;
  author: string; emoji: string; content: string;
}> = {
  "comment-devenir-au-pair-en-france-2026": {
    title: "Comment devenir au pair en France en 2026 ?",
    category: "Guide au pair", readTime: "5 min", date: "5 mars 2026",
    author: "Équipe AuPair A.EU", emoji: "🇫🇷",
    content: `
## Qu'est-ce qu'un au pair ?

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

  "regles-aupair-europe": {
    title: "Les règles à connaître avant votre séjour au pair en Europe",
    category: "Réglementation", readTime: "7 min", date: "28 fév. 2026",
    author: "Équipe AuPair A.EU", emoji: "📋",
    content: `
## Le cadre légal du programme au pair en Europe

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

  "temoignage-cameroun-lyon": {
    title: "Mon expérience au pair depuis le Cameroun jusqu'à Lyon",
    category: "Témoignage", readTime: "4 min", date: "20 fév. 2026",
    author: "Aminata K., au pair à Lyon", emoji: "🎙️",
    content: `
## Mon parcours : de Yaoundé à Lyon

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

  "matching-aupair-famille-conseils": {
    title: "Comment AuPair A.EU améliore la mise en relation au pair/famille",
    category: "Nouveautés", readTime: "3 min", date: "15 fév. 2026",
    author: "Équipe AuPair A.EU", emoji: "✨",
    content: `
## Un algorithme pensé pour l'Afrique et l'Europe

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

  "argent-poche-aupair-europe": {
    title: "Combien gagne un au pair en Europe ? Comparatif par pays",
    category: "Guide au pair", readTime: "6 min", date: "10 fév. 2026",
    author: "Équipe AuPair A.EU", emoji: "💰",
    content: `
## L'argent de poche au pair : de quoi s'agit-il ?

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

  "visa-au-pair-cameroun-senegal-cotedivoire": {
    title: "Visa au pair : guide complet pour les ressortissants africains",
    category: "Réglementation", readTime: "8 min", date: "25 jan. 2026",
    author: "Équipe AuPair A.EU", emoji: "🛂",
    content: `
## Le visa au pair : spécificités pour les ressortissants africains

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

  "preparer-valise-au-pair-europe": {
    title: "Comment préparer sa valise pour partir au pair en Europe ?",
    category: "Guide au pair", readTime: "4 min", date: "18 jan. 2026",
    author: "Équipe AuPair A.EU", emoji: "🧳",
    content: `
## La règle d'or : voyager léger, acheter sur place

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

  "temoignage-kofi-berlin": {
    title: "Kofi, 23 ans, au pair à Berlin : 'Je n'aurais jamais imaginé vivre ça'",
    category: "Témoignage", readTime: "5 min", date: "10 jan. 2026",
    author: "Kofi M., au pair à Berlin", emoji: "🇩🇪",
    content: `
## Mon départ du Ghana : une décision qui fait peur

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

  "famille-accueil-choisir-aupair": {
    title: "Familles d'accueil : comment bien choisir votre au pair africain ?",
    category: "Guide famille", readTime: "5 min", date: "3 fév. 2026",
    author: "Équipe AuPair A.EU", emoji: "👨‍👩‍👧",
    content: `
## Pourquoi choisir un au pair via AuPair A.EU ?

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
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = articles[slug];
  if (!article) return { title: "Article non trouvé — AuPair A.EU" };
  return {
    title: `${article.title} — AuPair A.EU`,
    description: article.title,
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = articles[slug];

  if (!article) {
    return (
      <div className="py-20 text-center">
        <p className="text-gray-500 text-lg mb-4">Article non trouvé.</p>
        <Link href="/blog" className="text-[#E87722] font-semibold hover:underline">← Retour au blog</Link>
      </div>
    );
  }

  const paragraphs = article.content.trim().split("\n\n");

  return (
    <div className="py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Retour */}
        <Link href="/blog" className="inline-flex items-center gap-2 text-gray-500 hover:text-[#E87722] mb-8 text-sm font-medium transition-colors">
          <ArrowLeft className="w-4 h-4" /> Retour au blog
        </Link>

        {/* Header article */}
        <div className="bg-[#FFF3E0] rounded-2xl h-48 flex items-center justify-center text-7xl mb-8">
          {article.emoji}
        </div>

        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-semibold text-[#E87722] bg-[#FFF3E0] px-3 py-1 rounded-full flex items-center gap-1">
            <Tag className="w-3 h-3" />{article.category}
          </span>
          <span className="text-xs text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" />{article.readTime}</span>
          <span className="text-xs text-gray-400 flex items-center gap-1"><Calendar className="w-3 h-3" />{article.date}</span>
        </div>

        <h1 className="text-3xl md:text-4xl font-extrabold text-[#1A1A2E] mb-4 leading-tight">{article.title}</h1>
        <p className="text-gray-500 text-sm mb-8">Par {article.author}</p>

        {/* Contenu */}
        <div className="prose max-w-none">
          {paragraphs.map((p, i) => {
            if (p.startsWith("## ")) {
              return <h2 key={i} className="text-xl font-extrabold text-[#1A1A2E] mt-8 mb-3">{p.replace("## ", "")}</h2>;
            }
            if (p.startsWith("- ")) {
              const items = p.split("\n").filter(l => l.startsWith("- "));
              return (
                <ul key={i} className="space-y-1 mb-4">
                  {items.map((item, j) => (
                    <li key={j} className="text-gray-700 flex items-start gap-2">
                      <span className="text-[#E87722] mt-1">•</span>
                      <span dangerouslySetInnerHTML={{ __html: item.replace("- ", "").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }} />
                    </li>
                  ))}
                </ul>
              );
            }
            if (p.startsWith("1. ") || p.match(/^\d\./)) {
              const items = p.split("\n").filter(l => l.match(/^\d\./));
              return (
                <ol key={i} className="space-y-1 mb-4 list-none">
                  {items.map((item, j) => (
                    <li key={j} className="text-gray-700 flex items-start gap-2">
                      <span className="text-[#E87722] font-bold">{j + 1}.</span>
                      <span dangerouslySetInnerHTML={{ __html: item.replace(/^\d+\.\s/, "").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }} />
                    </li>
                  ))}
                </ol>
              );
            }
            if (p.trim()) {
              return <p key={i} className="text-gray-700 leading-relaxed mb-4"
                dangerouslySetInnerHTML={{ __html: p.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }} />;
            }
            return null;
          })}
        </div>

        {/* CTA */}
        <div className="bg-[#E87722] rounded-2xl p-6 mt-10 text-center">
          <h3 className="text-xl font-extrabold text-white mb-2">Prêt(e) à commencer votre aventure ?</h3>
          <p className="text-white/80 mb-4">Créez votre profil sur AuPair A.EU et trouvez votre famille idéale.</p>
          <Link href="/inscription?role=au-pair">
            <button className="bg-white text-[#E87722] px-6 py-2.5 rounded-full font-bold text-sm hover:bg-gray-100 transition-colors">
              S&apos;inscrire gratuitement
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
