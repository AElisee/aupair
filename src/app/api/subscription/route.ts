import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAppSettings } from "@/lib/settings";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const [settings, subscriptions, profile] = await Promise.all([
    getAppSettings(),
    prisma.subscription.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.auPairProfile.findUnique({
      where: { userId: session.user.id },
      select: { countryOfOrigin: true },
    }),
  ]);

  const subscription = subscriptions[0] ?? null;
  const now = new Date();
  const active = !!subscription && subscription.status === "ACTIVE" && subscription.expiresAt > now;
  const daysLeft = active && subscription
    ? Math.max(0, Math.ceil((subscription.expiresAt.getTime() - now.getTime()) / 86400000))
    : 0;

  return NextResponse.json({
    active,
    status: subscription?.status ?? null,
    startsAt: subscription?.startsAt ?? null,
    expiresAt: subscription?.expiresAt ?? null,
    daysLeft,
    amount: subscription?.amount ?? null,
    currency: subscription?.currency ?? null,
    paymentMethod: subscription?.paymentMethod ?? null,
    countryOfOrigin: profile?.countryOfOrigin ?? null,
    // Historique des paiements : un abonnement "ACTIVE" dont la date est passée est renvoyé "EXPIRED"
    history: subscriptions.map((s) => ({
      id: s.id,
      date: s.createdAt,
      startsAt: s.startsAt,
      expiresAt: s.expiresAt,
      amount: s.amount,
      currency: s.currency,
      method: s.paymentMethod,
      status: s.status === "ACTIVE" && s.expiresAt <= now ? "EXPIRED" : s.status,
      reference: s.paymentId,
      invoiceUrl: s.invoiceUrl,
    })),
    constants: {
      priceEur: settings.subscriptionPriceEur,
      priceXof: settings.subscriptionPriceXof,
      days: settings.subscriptionDays,
      features: settings.subscriptionFeatures,
    },
  });
}
