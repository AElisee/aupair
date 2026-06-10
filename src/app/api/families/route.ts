import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ProfileStatus } from "@/generated/prisma/client";
import { getCountryFlagMap } from "@/lib/countries";

export async function GET() {
  const [profiles, flagMap] = await Promise.all([
    prisma.familyProfile.findMany({
      where: { status: ProfileStatus.ACTIVE },
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true } } },
    }),
    getCountryFlagMap(),
  ]);

  const families = profiles.map((p) => ({
    id: p.userId,
    name: p.user.name ?? "Famille",
    city: p.city,
    country: p.country,
    flag: flagMap[p.country] ?? "",
    kids: p.numberOfKids,
    kidsAges: p.kidsAges,
    tasks: p.auPairTasks ?? "",
    hoursPerWeek: p.hoursPerWeek ?? 0,
    pocketMoney: p.pocketMoney ?? 0,
    languages: p.preferredLanguages,
    description: p.description ?? "",
    familyPhotoUrl: p.familyPhotoUrl ?? "",
  }));

  return NextResponse.json({ families });
}
