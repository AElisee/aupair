import { prisma } from "./prisma";
import { CountryType, ProfileStatus } from "@/generated/prisma/client";

export async function getCountriesByType(type?: CountryType) {
  return prisma.country.findMany({
    where: { isActive: true, ...(type && { type }) },
    orderBy: { name: "asc" },
  });
}

/** Nombre de profils actifs par pays (au pairs par pays d'origine, familles par pays d'accueil). */
export async function getCountryCounts(): Promise<{
  auPairCounts: Record<string, number>;
  familyCounts: Record<string, number>;
}> {
  const [auPairGroups, familyGroups] = await Promise.all([
    prisma.auPairProfile.groupBy({
      by: ["countryOfOrigin"],
      where: { status: { not: ProfileStatus.DELETED } },
      _count: { _all: true },
    }),
    prisma.familyProfile.groupBy({
      by: ["country"],
      where: { status: { not: ProfileStatus.DELETED } },
      _count: { _all: true },
    }),
  ]);

  return {
    auPairCounts: Object.fromEntries(auPairGroups.map((g) => [g.countryOfOrigin, g._count._all])),
    familyCounts: Object.fromEntries(familyGroups.map((g) => [g.country, g._count._all])),
  };
}

/**
 * Pays dont les familles ne sont jamais affichées aux au pairs ni aux visiteurs
 * (liste, fiche détaillée, suggestions). Plusieurs graphies pour couvrir les saisies anciennes.
 */
export const HIDDEN_FAMILY_COUNTRIES = [
  "États-Unis",
  "Etats-Unis",
  "États Unis",
  "Etats Unis",
  "USA",
  "United States",
];

/** Filtre Prisma excluant les familles des pays masqués (`HIDDEN_FAMILY_COUNTRIES`). */
export const VISIBLE_FAMILY_COUNTRY_FILTER = { country: { notIn: HIDDEN_FAMILY_COUNTRIES } };

/**
 * Codes ISO de pays qu'un profil peut encore porter sans ligne `Country` correspondante
 * (ex. « États-Unis », dont la ligne a été renommée en « Italie » par le seed) :
 * repli pour que leur drapeau s'affiche quand même.
 */
const FALLBACK_COUNTRY_CODES: Record<string, string> = {
  "États-Unis": "US",
  Canada: "CA",
  "Royaume-Uni": "GB",
  Espagne: "ES",
  "Pays-Bas": "NL",
  Irlande: "IE",
  Autriche: "AT",
};

/** "US" → "🇺🇸" (regional indicator symbols) */
function isoToFlagEmoji(code: string): string {
  return [...code.toUpperCase()].map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65)).join("");
}

export async function getCountryFlagMap(): Promise<Record<string, string>> {
  // Pays désactivés inclus : un profil peut encore référencer un pays retiré des listes
  const countries = await prisma.country.findMany({
    select: { name: true, flag: true },
  });

  const fallback = Object.fromEntries(
    Object.entries(FALLBACK_COUNTRY_CODES).map(([name, code]) => [name, isoToFlagEmoji(code)])
  );
  return { ...fallback, ...Object.fromEntries(countries.map((c) => [c.name, c.flag])) };
}

/** Sépare un numéro WhatsApp complet ("+237 6XX...") en indicatif + reste. */
export function splitPhoneNumber(
  phone: string | null,
  fallbackCountry: string,
  countries: { name: string; dialCode: string }[]
): { phoneCountryCode: string; phoneNumber: string } {
  const fallbackCode = countries.find((c) => c.name === fallbackCountry)?.dialCode ?? "";
  if (!phone) return { phoneCountryCode: fallbackCode, phoneNumber: "" };

  const trimmed = phone.trim();
  const match = [...countries]
    .sort((a, b) => b.dialCode.length - a.dialCode.length)
    .find((c) => trimmed.startsWith(c.dialCode));

  if (match) return { phoneCountryCode: match.dialCode, phoneNumber: trimmed.slice(match.dialCode.length).trim() };
  return { phoneCountryCode: fallbackCode, phoneNumber: trimmed };
}
