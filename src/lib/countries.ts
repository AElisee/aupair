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

export async function getCountryFlagMap(): Promise<Record<string, string>> {
  const countries = await prisma.country.findMany({
    where: { isActive: true },
    select: { name: true, flag: true },
  });

  return Object.fromEntries(countries.map((c) => [c.name, c.flag]));
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
