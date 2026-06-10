import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** Champs facultatifs du profil pris en compte pour le taux de complétion. */
const COMPLETION_FIELDS = [
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

  return NextResponse.json({
    firstName: profile.firstName,
    lastName: profile.lastName,
    profileCompletion,
    profileViews: profile.profileViews,
    favoritesCount,
    totalMessages,
    unreadMessages,
    subscription: { active: subscriptionActive, daysLeft },
  });
}
