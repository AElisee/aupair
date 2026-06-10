import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileStatus } from "@/generated/prisma/client";
import { calculateAge } from "@/lib/utils";
import { getCountryFlagMap } from "@/lib/countries";
import { rankSuggestions } from "@/lib/suggestions";

/** Champs facultatifs du profil pris en compte pour le taux de complétion. */
const COMPLETION_FIELDS = [
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

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const profile = await prisma.auPairProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) {
    return NextResponse.json({ error: "Profil introuvable." }, { status: 404 });
  }

  const [favoritesCount, totalMessages, unreadMessages, subscription] =
    await Promise.all([
      prisma.favorite.count({ where: { targetId: session.user.id } }),
      prisma.message.count({ where: { receiverId: session.user.id } }),
      prisma.message.count({
        where: { receiverId: session.user.id, status: "SENT" },
      }),
      prisma.subscription.findFirst({
        where: { userId: session.user.id, status: "ACTIVE" },
        orderBy: { expiresAt: "desc" },
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

  let daysLeft = 0;
  let subscriptionActive = false;
  if (subscription) {
    const diffMs = subscription.expiresAt.getTime() - Date.now();
    if (diffMs > 0) {
      daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      subscriptionActive = true;
    }
  }

  // Suggestions de familles : favoris, pays ciblé par l'au pair, âge/genre/langues attendus par la famille
  const [familyProfiles, favorites, flagMap] = await Promise.all([
    prisma.familyProfile.findMany({
      where: { status: ProfileStatus.ACTIVE },
      include: { user: { select: { name: true } } },
    }),
    prisma.favorite.findMany({ where: { userId: session.user.id }, select: { targetId: true } }),
    getCountryFlagMap(),
  ]);

  const favoriteIds = new Set(favorites.map((f) => f.targetId));
  const age = calculateAge(profile.dateOfBirth);

  const scored = familyProfiles.map((p) => {
    const genderMatch = !p.preferredGender || p.preferredGender === profile.gender;
    const ageMatch =
      (p.preferredAgeMin == null && p.preferredAgeMax == null) ||
      (age >= (p.preferredAgeMin ?? 0) && age <= (p.preferredAgeMax ?? 120));
    const countryMatch = profile.targetCountries.includes(p.country);
    const languageMatch =
      p.preferredLanguages.length > 0 && profile.languages.some((l) => p.preferredLanguages.includes(l));

    // Sous-score "favoris + langues", utilisé pour le seuil de moyenne
    const softScore = (favoriteIds.has(p.userId) ? 3 : 0) + (languageMatch ? 1 : 0);

    // Score complet (avec critères pays/âge/genre), utilisé pour le classement et le mode "données insuffisantes"
    let score = softScore;
    if (countryMatch) score += 2;
    if (p.preferredGender && genderMatch) score += 1;
    if ((p.preferredAgeMin != null || p.preferredAgeMax != null) && ageMatch) score += 1;

    return { profile: p, score, softScore, eligible: genderMatch && ageMatch && countryMatch, createdAt: p.createdAt };
  });

  const ranked = rankSuggestions(scored);

  const suggestedFamilies = ranked.slice(0, 3).map((s) => ({
    id: s.profile.userId,
    name: s.profile.user.name ?? "Famille",
    city: s.profile.city,
    country: s.profile.country,
    flag: flagMap[s.profile.country] ?? "",
    kids: s.profile.numberOfKids,
    hoursPerWeek: s.profile.hoursPerWeek ?? 0,
    pocketMoney: s.profile.pocketMoney ?? 0,
  }));

  return NextResponse.json({
    firstName: profile.firstName,
    lastName: profile.lastName,
    profileCompletion,
    profileViews: profile.profileViews,
    favoritesCount,
    totalMessages,
    unreadMessages,
    subscription: { active: subscriptionActive, daysLeft },
    suggestedFamilies,
  });
}
