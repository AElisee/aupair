import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
    prisma.favorite.count({ where: { targetId: session.user.id } }),
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

  return NextResponse.json({
    name: user.name ?? "",
    city: profile.city,
    country: profile.country,
    profileCompletion,
    profileViews: profile.profileViews,
    favoritesCount,
    totalMessages,
    unreadMessages,
  });
}
