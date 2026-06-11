import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileStatus } from "@/generated/prisma/client";
import { getCountryFlagMap } from "@/lib/countries";
import { calculateAge } from "@/lib/utils";

export async function GET() {
  const session = await auth();

  const [profiles, flagMap, favorites] = await Promise.all([
    prisma.auPairProfile.findMany({
      where: { status: ProfileStatus.ACTIVE },
      orderBy: { createdAt: "desc" },
    }),
    getCountryFlagMap(),
    session?.user?.role === "FAMILLE"
      ? prisma.favorite.findMany({ where: { userId: session.user.id }, select: { targetId: true } })
      : Promise.resolve([]),
  ]);

  const favoriteIds = new Set(favorites.map((f) => f.targetId));

  const auPairs = profiles.map((p) => ({
    id: p.userId,
    firstName: p.firstName,
    profilePhotoUrl: p.profilePhotoUrl ?? "",
    age: calculateAge(p.dateOfBirth),
    gender: p.gender,
    country: p.countryOfOrigin,
    flag: flagMap[p.countryOfOrigin] ?? "",
    languages: p.languages,
    experience: p.childcareYears ?? 0,
    drivingLicense: p.drivingLicense,
    targetCountries: p.targetCountries,
    description: p.description ?? "",
    available: p.isAvailable,
    isFavorite: favoriteIds.has(p.userId),
  }));

  return NextResponse.json({ auPairs });
}
