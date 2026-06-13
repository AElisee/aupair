import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAppSettings } from "@/lib/settings";

/** Active un abonnement de test (sans paiement réel). */
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const settings = await getAppSettings();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + settings.subscriptionDays * 24 * 60 * 60 * 1000);

  const subscription = await prisma.subscription.create({
    data: {
      userId: session.user.id,
      status: "ACTIVE",
      amount: settings.subscriptionPriceEur,
      currency: "EUR",
      paymentMethod: "CARD",
      paymentId: `dev-${Date.now()}`,
      startsAt: now,
      expiresAt,
    },
  });

  return NextResponse.json({ success: true, subscription });
}
