import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileStatus } from "@/generated/prisma/client";
import { calculateAge } from "@/lib/utils";
import { getCountryFlagMap } from "@/lib/countries";
import { rankSuggestions } from "@/lib/suggestions";

/** Champs facultatifs du profil pris en compte pour le taux de complétion. */
const COMPLETION_FIELDS = [
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

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const [user, profile] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id } }),
    prisma.familyProfile.findUnique({ where: { userId: session.user.id } }),
  ]);

  if (!user || !profile) {
    return NextResponse.json({ error: "Profil introuvable." }, { status: 404 });
  }

  const [favoritesCount, totalMessages, unreadMessages] = await Promise.all([
    prisma.favorite.count({ where: { userId: session.user.id } }),
    prisma.message.count({ where: { receiverId: session.user.id } }),
    prisma.message.count({
      where: { receiverId: session.user.id, status: "SENT" },
    }),
  ]);

  let filledCount = 0;
  for (const field of COMPLETION_FIELDS) {
    const value = profile[field as keyof typeof profile];
    if (Array.isArray(value) ? value.length > 0 : value !== null && value !== undefined && value !== "") {
      filledCount++;
    }
  }
  const profileCompletion = Math.round(
    (filledCount / COMPLETION_FIELDS.length) * 100
  );

  // Suggestions d'au pairs : favoris, pays ciblé, âge/genre/langues préférés
  const [auPairProfiles, favorites, flagMap] = await Promise.all([
    prisma.auPairProfile.findMany({ where: { status: ProfileStatus.ACTIVE } }),
    prisma.favorite.findMany({ where: { userId: session.user.id }, select: { targetId: true } }),
    getCountryFlagMap(),
  ]);

  const favoriteIds = new Set(favorites.map((f) => f.targetId));

  const scored = auPairProfiles.map((p) => {
    const age = calculateAge(p.dateOfBirth);

    const genderMatch = !profile.preferredGender || p.gender === profile.preferredGender;
    const ageMatch =
      (profile.preferredAgeMin == null && profile.preferredAgeMax == null) ||
      (age >= (profile.preferredAgeMin ?? 0) && age <= (profile.preferredAgeMax ?? 120));
    const countryMatch = p.targetCountries.includes(profile.country);
    const languageMatch =
      profile.preferredLanguages.length > 0 && p.languages.some((l) => profile.preferredLanguages.includes(l));

    // Sous-score "favoris + langues", utilisé pour le seuil de moyenne
    const softScore = (favoriteIds.has(p.userId) ? 3 : 0) + (languageMatch ? 1 : 0);

    // Score complet (avec critères pays/âge/genre), utilisé pour le classement et le mode "données insuffisantes"
    let score = softScore;
    if (countryMatch) score += 2;
    if (profile.preferredGender && genderMatch) score += 1;
    if ((profile.preferredAgeMin != null || profile.preferredAgeMax != null) && ageMatch) score += 1;

    return { profile: p, age, score, softScore, eligible: genderMatch && ageMatch && countryMatch, createdAt: p.createdAt };
  });

  const ranked = rankSuggestions(scored);

  const suggestedAuPairs = ranked.slice(0, 3).map((s) => ({
    id: s.profile.userId,
    firstName: s.profile.firstName,
    profilePhotoUrl: s.profile.profilePhotoUrl ?? "",
    age: s.age,
    country: s.profile.countryOfOrigin,
    flag: flagMap[s.profile.countryOfOrigin] ?? "",
    languages: s.profile.languages,
    experience: s.profile.childcareYears ?? 0,
  }));

  return NextResponse.json({
    name: user.name ?? "",
    city: profile.city,
    country: profile.country,
    profileCompletion,
    profileViews: profile.profileViews,
    favoritesCount,
    totalMessages,
    unreadMessages,
    suggestedAuPairs,
  });
}
