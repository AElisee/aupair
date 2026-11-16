import { GENDERS, getMissingProfileFields } from "./signup-rules";

/**
 * Inscription à finaliser : un compte créé via Google/Facebook (sans profil métier), ou un profil
 * auquel manque un champ obligatoire du formulaire d'inscription (ex. anciens comptes Google créés
 * avec un profil au pair vide). Tant que c'est le cas, l'utilisateur est renvoyé sur
 * `/inscription/completer` (proxy.ts + DashboardLayout) au lieu de son espace.
 */
export const ONBOARDING_PATH = "/inscription/completer";

/** Champs Prisma à lire sur `User` pour `needsOnboarding()`. */
export const ONBOARDING_USER_SELECT = {
  role: true,
  auPairProfile: { select: { gender: true, countryOfOrigin: true, languages: true } },
  familyProfile: { select: { country: true, city: true } },
} as const;

type OnboardingUser = {
  role: string;
  auPairProfile: { gender: string; countryOfOrigin: string; languages: string[] } | null;
  familyProfile: { country: string; city: string } | null;
};

export function needsOnboarding(user: OnboardingUser): boolean {
  if (user.role !== "AU_PAIR" && user.role !== "FAMILLE") return false;
  if (user.auPairProfile) return getMissingProfileFields("AU_PAIR", user.auPairProfile).length > 0;
  if (user.familyProfile) return getMissingProfileFields("FAMILLE", user.familyProfile).length > 0;
  return true;
}

/**
 * Filtre Prisma : profil au pair aux champs obligatoires renseignés (mêmes règles que
 * `getMissingProfileFields`). Un profil incomplet n'est jamais montré aux familles, même actif.
 */
export const COMPLETE_AU_PAIR_WHERE = {
  gender: { in: [...GENDERS] },
  countryOfOrigin: { not: "" },
  languages: { isEmpty: false },
};
