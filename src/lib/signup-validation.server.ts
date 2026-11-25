import { prisma } from "./prisma";
import { getAppSettings } from "./settings";
import { calculateAge } from "./utils";
import { MAX_NUMBER_OF_KIDS } from "./constants";
import {
  EMAIL_MAX_LENGTH,
  EMAIL_REGEX,
  FREE_TEXT_MAX_LENGTH,
  GENDERS,
  MAX_AGE,
  MIN_AU_PAIR_AGE,
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
  PASSWORD_MAX_BYTES,
  PASSWORD_MIN_LENGTH,
  passwordByteLength,
} from "./signup-rules";

/**
 * Validation serveur de `POST /api/auth/register`. Le formulaire valide déjà chaque étape,
 * mais l'API est appelable directement : tout champ obligatoire est revérifié ici, et les
 * valeurs de liste (pays, langues, genre) doivent appartenir aux listes proposées.
 * Les messages d'erreur sont en français (traduits côté client par `tError`).
 */

type Names = { firstName: string; lastName: string };
type Common = Names & { email: string; password: string };

export type AuPairFields = {
  role: "au-pair";
  gender: (typeof GENDERS)[number];
  dateOfBirth: Date;
  country: string;
  languages: string[];
  educationLevel: string | null;
  experience: string | null;
};

export type FamilyFields = {
  role: "famille";
  hostCountry: string;
  city: string;
  numberOfKids: number;
};

export type ProfileFields = AuPairFields | FamilyFields;
export type SignupData = Common & ProfileFields;

type Result<T> = { ok: true; data: T } | { ok: false; error: string };

/** Valeur texte nettoyée : les champs absents ou non textuels deviennent "". */
function text(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

function parseLanguages(raw: string): string[] | null {
  try {
    const parsed: unknown = JSON.parse(raw || "[]");
    if (!Array.isArray(parsed) || !parsed.every((l) => typeof l === "string")) return null;
    return [...new Set(parsed)];
  } catch {
    return null;
  }
}

/** Date `YYYY-MM-DD` réelle (rejette 2000-02-31, les formats libres…), sinon `null`. */
function parseIsoDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value) ? date : null;
}

const fail = (error: string) => ({ ok: false as const, error });

async function activeCountryNames(type: "ORIGIN" | "HOST"): Promise<Set<string>> {
  const rows = await prisma.country.findMany({ where: { isActive: true, type }, select: { name: true } });
  return new Set(rows.map((r) => r.name));
}

/** Prénom et nom (formulaire d'inscription et finalisation d'un compte Google/Facebook). */
export function validateNames(form: FormData): Result<Names> {
  const firstName = text(form.get("firstName"));
  const lastName = text(form.get("lastName"));
  if (!firstName || !lastName) return fail("Champs obligatoires manquants.");
  if (
    firstName.length < NAME_MIN_LENGTH ||
    lastName.length < NAME_MIN_LENGTH ||
    firstName.length > NAME_MAX_LENGTH ||
    lastName.length > NAME_MAX_LENGTH
  ) {
    return fail("Nom ou prénom invalide.");
  }
  return { ok: true, data: { firstName, lastName } };
}

/**
 * Champs de l'étape « Votre profil au pair » / « Votre famille » selon `role`
 * (la pièce d'identité est vérifiée à part : `validateIdDocumentServer`).
 */
export async function validateProfileFields(form: FormData): Promise<Result<ProfileFields>> {
  const role = text(form.get("role"));
  if (role !== "au-pair" && role !== "famille") return fail("Rôle invalide.");

  if (role === "famille") {
    const hostCountry = text(form.get("hostCountry"));
    const city = text(form.get("city"));
    const kids = text(form.get("numberOfKids"));

    if (!hostCountry) return fail("Le pays d'accueil est obligatoire.");
    if (!(await activeCountryNames("HOST")).has(hostCountry)) return fail("Pays invalide.");
    if (!city) return fail("La ville est obligatoire.");
    if (city.length > FREE_TEXT_MAX_LENGTH) return fail("Ville invalide.");
    if (!/^\d+$/.test(kids) || Number(kids) > MAX_NUMBER_OF_KIDS) return fail("Nombre d'enfants invalide.");

    return { ok: true, data: { role, hostCountry, city, numberOfKids: Number(kids) } };
  }

  const gender = text(form.get("gender"));
  const country = text(form.get("country"));
  const rawDate = text(form.get("dateOfBirth"));
  const languages = parseLanguages(text(form.get("languages")));
  const educationLevel = text(form.get("educationLevel"));
  const experience = text(form.get("experience"));

  if (!(GENDERS as readonly string[]).includes(gender)) return fail("Le genre est obligatoire.");
  if (!country) return fail("Le pays d'origine est obligatoire.");
  if (!(await activeCountryNames("ORIGIN")).has(country)) return fail("Pays invalide.");

  if (!rawDate) return fail("La date de naissance est obligatoire.");
  const dateOfBirth = parseIsoDate(rawDate);
  if (!dateOfBirth) return fail("Date de naissance invalide.");
  const age = calculateAge(dateOfBirth);
  if (age > MAX_AGE) return fail("Date de naissance invalide.");
  if (age < MIN_AU_PAIR_AGE) return fail("Vous devez avoir au moins 18 ans pour vous inscrire en tant qu'au pair.");

  if (!languages || languages.length === 0) return fail("Sélectionnez au moins une langue.");
  const allowedLanguages = new Set((await getAppSettings()).languages);
  if (!languages.every((l) => allowedLanguages.has(l))) return fail("Langue invalide.");

  // Facultatifs, mais champ libre possible (« Autre ») : longueur bornée.
  if (educationLevel.length > FREE_TEXT_MAX_LENGTH || experience.length > FREE_TEXT_MAX_LENGTH) {
    return fail("Requête invalide.");
  }

  return {
    ok: true,
    data: {
      role,
      gender: gender as AuPairFields["gender"],
      dateOfBirth,
      country,
      languages,
      educationLevel: educationLevel || null,
      experience: experience || null,
    },
  };
}

/** Formulaire d'inscription complet (`POST /api/auth/register`). */
export async function validateSignup(form: FormData): Promise<Result<SignupData>> {
  const names = validateNames(form);
  if (!names.ok) return names;

  const email = text(form.get("email")).toLowerCase();
  // Le mot de passe n'est pas nettoyé : les espaces en font partie.
  const rawPassword = form.get("password");
  const password = typeof rawPassword === "string" ? rawPassword : "";
  if (!email || !password) return fail("Champs obligatoires manquants.");
  if (email.length > EMAIL_MAX_LENGTH || !EMAIL_REGEX.test(email)) return fail("Adresse email invalide.");
  if (password.length < PASSWORD_MIN_LENGTH) return fail("Le mot de passe doit contenir au moins 8 caractères.");
  if (passwordByteLength(password) > PASSWORD_MAX_BYTES) return fail("Le mot de passe est trop long.");

  const profile = await validateProfileFields(form);
  if (!profile.ok) return profile;

  return { ok: true, data: { ...names.data, email, password, ...profile.data } };
}

/** Données Prisma de création / mise à jour du profil à partir des champs validés. */
export function auPairProfileData(names: Names, p: AuPairFields) {
  return {
    firstName: names.firstName,
    lastName: names.lastName,
    dateOfBirth: p.dateOfBirth,
    gender: p.gender,
    nationality: p.country,
    countryOfOrigin: p.country,
    languages: p.languages,
    educationLevel: p.educationLevel,
    childcareExperience: p.experience,
  };
}

export function familyProfileData(p: FamilyFields) {
  return { country: p.hostCountry, city: p.city, numberOfKids: p.numberOfKids };
}
