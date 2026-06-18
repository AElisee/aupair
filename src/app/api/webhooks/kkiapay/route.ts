import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAppSettings } from "@/lib/settings";

export async function POST(req: Request) {
  const settings = await getAppSettings();

  if (!settings.kkiapayPrivateKey) {
    return NextResponse.json({ error: "KKiaPay n'est pas configuré." }, { status: 503 });
  }

  const body = await req.json();
  const transactionId: string | undefined = body.transactionId;

  if (!transactionId) {
    return NextResponse.json({ error: "Transaction ID manquant." }, { status: 400 });
  }

  // Re-vérification côté serveur — on ne fait jamais confiance au payload seul
  const verifyRes = await fetch(
    `https://api.kkiapay.me/api/v1/transactions/${transactionId}/status`,
    { headers: { "x-secret-key": settings.kkiapayPrivateKey } }
  );

  if (!verifyRes.ok) {
    return NextResponse.json({ received: true });
  }

  const result = await verifyRes.json();

  if (result.status === "SUCCESS") {
    const existing = await prisma.subscription.findFirst({
      where: { paymentId: transactionId },
    });

    if (!existing) {
      // On tente de retrouver l'utilisateur via son email (fourni à KKiaPay lors du paiement)
      const email: string | undefined = body.email ?? result.email;
      if (email) {
        const user = await prisma.user.findUnique({ where: { email } });
        if (user) {
          const now = new Date();
          await prisma.subscription.create({
            data: {
              userId: user.id,
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
      }
    }
  }

  return NextResponse.json({ received: true });
}
