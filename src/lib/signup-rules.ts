/**
 * Règles d'inscription et champs obligatoires d'un profil — partagées par le formulaire
 * `/inscription` (client), `POST /api/auth/register` et la modération (serveur).
 * Aucune dépendance serveur : importable côté client.
 */

export const NAME_MIN_LENGTH = 2;
export const NAME_MAX_LENGTH = 60;
export const PASSWORD_MIN_LENGTH = 8;
/** bcrypt ignore tout ce qui dépasse 72 octets : au-delà, deux mots de passe différents se valideraient. */
export const PASSWORD_MAX_BYTES = 72;
export const EMAIL_MAX_LENGTH = 254;
/** Champs libres (« Autre » du niveau d'études / de l'expérience, ville). */
export const FREE_TEXT_MAX_LENGTH = 100;
export const MIN_AU_PAIR_AGE = 18;
export const MAX_AGE = 100;

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const GENDERS = ["Femme", "Homme"] as const;

export function passwordByteLength(password: string): number {
  return new TextEncoder().encode(password).length;
}

/** Champs obligatoires d'un profil au pair (étape « Votre profil au pair » du formulaire). */
type AuPairRequired = { gender: string; countryOfOrigin: string; languages: string[] };
/** Champs obligatoires d'un profil famille (étape « Votre famille » du formulaire). */
type FamilyRequired = { country: string; city: string };

export type ProfileRequiredField = "gender" | "countryOfOrigin" | "languages" | "country" | "city";

/**
 * Champs obligatoires manquants d'un profil. Un profil incomplet ne peut pas être validé
 * en modération (ex. comptes créés par l'ancienne inscription Google, sans formulaire).
 */
export function getMissingProfileFields(
  role: "AU_PAIR" | "FAMILLE",
  profile: AuPairRequired | FamilyRequired,
): ProfileRequiredField[] {
  const missing: ProfileRequiredField[] = [];
  if (role === "AU_PAIR") {
    const p = profile as AuPairRequired;
    if (!(GENDERS as readonly string[]).includes(p.gender)) missing.push("gender");
    if (!p.countryOfOrigin?.trim()) missing.push("countryOfOrigin");
    if (!p.languages?.length) missing.push("languages");
  } else {
    const p = profile as FamilyRequired;
    if (!p.country?.trim()) missing.push("country");
    if (!p.city?.trim()) missing.push("city");
  }
  return missing;
}

/** Erreur renvoyée par l'API admin quand on tente de valider un profil incomplet (traduite par `tError`). */
export const INCOMPLETE_PROFILE_ERROR = "Profil incomplet : les champs obligatoires de l'inscription ne sont pas renseignés.";
