import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAppSettings } from "@/lib/settings";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await req.json();
  const transactionId: string | undefined = body.transactionId;

  if (!transactionId) {
    return NextResponse.json({ error: "Transaction ID manquant." }, { status: 400 });
  }

  const settings = await getAppSettings();

  if (!settings.kkiapayPrivateKey) {
    return NextResponse.json({ error: "KKiaPay n'est pas configuré." }, { status: 503 });
  }

  const verifyRes = await fetch(
    `https://api.kkiapay.me/api/v1/transactions/${transactionId}/status`,
    { headers: { "x-secret-key": settings.kkiapayPrivateKey } }
  );

  if (!verifyRes.ok) {
    return NextResponse.json({ error: "Impossible de vérifier le paiement." }, { status: 502 });
  }

  const result = await verifyRes.json();

  if (result.status !== "SUCCESS") {
    return NextResponse.json({ error: "Paiement non confirmé par KKiaPay." }, { status: 402 });
  }

  const existing = await prisma.subscription.findFirst({
    where: { paymentId: transactionId },
  });

  if (!existing) {
    const now = new Date();
    await prisma.subscription.create({
      data: {
        userId: session.user.id,
        status: "ACTIVE",
        amount: result.amount ?? settings.subscriptionPriceXof,
        currency: "XOF",
        paymentMethod: "KKIAPAY",
        paymentId: transactionId,
        startsAt: now,
        expiresAt: new Date(now.getTime() + settings.subscriptionDays * 24 * 60 * 60 * 1000),
      },
    });
  }

  return NextResponse.json({ success: true });
}
