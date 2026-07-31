import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAppSettings } from "@/lib/settings";
import { verifySebpaySignature, parseUserIdFromReference } from "@/lib/sebpay";

export async function POST(req: Request) {
  const settings = await getAppSettings();
  if (!settings.sebpaySecretKey) {
    return NextResponse.json({ error: "Le paiement n'est pas configuré." }, { status: 503 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get("x-sebpay-signature");

  if (!verifySebpaySignature(rawBody, signature, settings.sebpaySecretKey)) {
    return NextResponse.json({ error: "Signature invalide." }, { status: 401 });
  }

  const body = JSON.parse(rawBody) as {
    transaction_id: string;
    external_reference: string;
    status: "pending" | "approved" | "rejected";
    amount?: number;
  };

  if (body.status === "approved") {
    const existing = await prisma.subscription.findFirst({
      where: { paymentId: body.transaction_id },
    });

    if (!existing) {
      const userId = parseUserIdFromReference(body.external_reference);
      const user = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null;

      if (user) {
        const now = new Date();
        await prisma.subscription.create({
          data: {
            userId: user.id,
            status: "ACTIVE",
            amount: body.amount ?? settings.subscriptionPriceXof,
            currency: "XOF",
            paymentMethod: "SEBPAY",
            paymentId: body.transaction_id,
            startsAt: now,
            expiresAt: new Date(now.getTime() + settings.subscriptionDays * 24 * 60 * 60 * 1000),
          },
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}
