import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAppSettings } from "@/lib/settings";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const [settings, subscription] = await Promise.all([
    getAppSettings(),
    prisma.subscription.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const now = new Date();
  const active = !!subscription && subscription.status === "ACTIVE" && subscription.expiresAt > now;
  const daysLeft = active && subscription
    ? Math.max(0, Math.ceil((subscription.expiresAt.getTime() - now.getTime()) / 86400000))
    : 0;

  return NextResponse.json({
    active,
    status: subscription?.status ?? null,
    expiresAt: subscription?.expiresAt ?? null,
    daysLeft,
    amount: subscription?.amount ?? null,
    currency: subscription?.currency ?? null,
    constants: {
      priceEur: settings.subscriptionPriceEur,
      priceXof: settings.subscriptionPriceXof,
      days: settings.subscriptionDays,
      features: settings.subscriptionFeatures,
    },
  });
}
