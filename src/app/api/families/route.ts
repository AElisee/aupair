import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ProfileStatus } from "@/generated/prisma/client";
import { getCountryFlagMap } from "@/lib/countries";
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

  const [allProfiles, flagMap] = await Promise.all([
    prisma.familyProfile.findMany({
      where: { status: ProfileStatus.ACTIVE },
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true } } },
    }),
    getCountryFlagMap(),
  ]);

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
    tasks: p.auPairTasks ?? "",
    hoursPerWeek: p.hoursPerWeek ?? 0,
    pocketMoney: p.pocketMoney ?? 0,
    languages: p.preferredLanguages,
    description: p.description ?? "",
    familyPhotoUrl: p.familyPhotoUrl ?? "",
  }));

  return NextResponse.json({ families, limited, total: allProfiles.length });
}
