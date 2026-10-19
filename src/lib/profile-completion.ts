/** Champs facultatifs du profil au pair pris en compte pour le taux de complétion. */
export const AU_PAIR_COMPLETION_FIELDS = [
  "gender",
  "cityOfOrigin",
  "educationLevel",
  "childcareExperience",
  "childcareYears",
  "preferredDuration",
  "description",
  "motivation",
  "phoneWhatsapp1",
  "profilePhotoUrl",
  "availableFrom",
] as const;

/** Champs facultatifs du profil famille pris en compte pour le taux de complétion. */
export const FAMILY_COMPLETION_FIELDS = [
  "address",
  "auPairTasks",
  "hoursPerWeek",
  "pocketMoney",
  "accommodation",
  "description",
  "familyPhotoUrl",
  "phoneWhatsapp",
  "preferredGender",
  "preferredLanguages",
] as const;

const isEmpty = (value: unknown) =>
  Array.isArray(value) ? value.length === 0 : value === null || value === undefined || value === "";

/** Champs vides parmi `fields` et taux de complétion (0–100) du profil. */
export function getProfileCompletion<F extends string>(profile: object, fields: readonly F[]) {
  const missingFields = fields.filter((field) => isEmpty((profile as Record<string, unknown>)[field]));
  const completion = Math.round(((fields.length - missingFields.length) / fields.length) * 100);
  return { completion, missingFields };
}
