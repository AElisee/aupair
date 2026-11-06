import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CountryType, ProfileStatus } from "@/generated/prisma/client";
import { getCountriesByType, getCountryFlagMap } from "@/lib/countries";
import { auth } from "@/lib/auth";
import { hasActiveSubscription } from "@/lib/subscription";

/** Nombre de familles visibles par un visiteur ou un au pair sans abonnement actif. */
const FREE_FAMILIES_LIMIT = 5;

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export async function GET() {
  const session = await auth();
  // Visiteur non connecté ou au pair sans abonnement actif : liste limitée
  const limited = !session?.user?.id
    ? true
    : session.user.role === "AU_PAIR" && !(await hasActiveSubscription(session.user.id));

  const [allProfiles, flagMap, hostCountries] = await Promise.all([
    prisma.familyProfile.findMany({
      where: { status: ProfileStatus.ACTIVE },
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true } } },
    }),
    getCountryFlagMap(),
    getCountriesByType(CountryType.HOST),
  ]);
  // Seuls les pays d'accueil actifs (gérés dans /admin/pays) apparaissent en raccourci
  const hostNames = new Set(hostCountries.map((c) => c.name));

  // 5 familles tirées au hasard à chaque chargement
  const profiles = limited ? shuffle(allProfiles).slice(0, FREE_FAMILIES_LIMIT) : allProfiles;

  const families = profiles.map((p) => ({
    id: p.userId,
    name: p.user.name ?? "Famille",
    city: p.city,
    country: p.country,
    flag: flagMap[p.country] ?? "",
    kids: p.numberOfKids,
    kidsAges: p.kidsAges,
    // Présentation et tâches réservées aux au pairs abonnés
    tasks: limited ? "" : p.auPairTasks ?? "",
    hoursPerWeek: p.hoursPerWeek ?? 0,
    pocketMoney: p.pocketMoney ?? 0,
    languages: p.preferredLanguages,
    description: limited ? "" : p.description ?? "",
    familyPhotoUrl: p.familyPhotoUrl ?? "",
  }));

  // Compteurs par pays calculés sur toutes les familles, même quand la liste est limitée
  const countryCounts = new Map<string, number>();
  allProfiles.forEach((p) => {
    if (p.country && hostNames.has(p.country)) countryCounts.set(p.country, (countryCounts.get(p.country) ?? 0) + 1);
  });
  // Sans abonnement, aucun nombre de familles n'est exposé : seulement s'il en existe d'autres que l'échantillon
  const shownByCountry = new Map<string, number>();
  profiles.forEach((p) => shownByCountry.set(p.country, (shownByCountry.get(p.country) ?? 0) + 1));
  const countries = [...countryCounts]
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({
      name,
      flag: flagMap[name] ?? "",
      ...(limited ? { hasMore: count > (shownByCountry.get(name) ?? 0) } : { count }),
    }));

  return NextResponse.json({
    families,
    limited,
    freeLimit: FREE_FAMILIES_LIMIT,
    ...(limited ? { hasMore: allProfiles.length > profiles.length } : { total: allProfiles.length }),
    countries,
  });
}
