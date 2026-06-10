import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ProfileStatus } from "@/generated/prisma/client";
import { getCountryFlagMap } from "@/lib/countries";
import { calculateAge } from "@/lib/utils";

export async function GET() {
  const now = new Date();

  const [profiles, flagMap] = await Promise.all([
    prisma.auPairProfile.findMany({
      where: { status: ProfileStatus.ACTIVE },
      orderBy: { createdAt: "desc" },
    }),
    getCountryFlagMap(),
  ]);

  const auPairs = profiles.map((p) => ({
    id: p.userId,
    firstName: p.firstName,
    profilePhotoUrl: p.profilePhotoUrl ?? "",
    age: calculateAge(p.dateOfBirth),
    country: p.countryOfOrigin,
    flag: flagMap[p.countryOfOrigin] ?? "",
    languages: p.languages,
    experience: p.childcareYears ?? 0,
    targetCountries: p.targetCountries,
    description: p.description ?? "",
    available: !p.availableFrom || p.availableFrom <= now,
  }));

  return NextResponse.json({ auPairs });
}
