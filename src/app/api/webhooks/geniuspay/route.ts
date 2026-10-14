import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAppSettings } from "@/lib/settings";
import { activateSubscriptionForPayment } from "@/lib/payments";
import {
  verifyGeniuspaySignature,
  fetchGeniuspayPayment,
  extractUserIdFromGeniuspayPayment,
  resolvePaymentMethodFromGeniuspay,
  GENIUSPAY_SUCCESS_STATUSES,
  type GeniuspayWebhookEvent,
} from "@/lib/geniuspay";

export async function POST(req: Request) {
  const settings = await getAppSettings();
  if (!settings.geniuspayWebhookSecret || !settings.geniuspayPublicKey || !settings.geniuspaySecretKey) {
    return NextResponse.json({ error: "Le paiement n'est pas configuré." }, { status: 503 });
  }

  const rawBody = await req.text();
  const valid = verifyGeniuspaySignature(
    rawBody,
    req.headers.get("x-webhook-signature"),
    req.headers.get("x-webhook-timestamp"),
    settings.geniuspayWebhookSecret
  );
  if (!valid) {
    return NextResponse.json({ error: "Signature invalide." }, { status: 401 });
  }

  const event = JSON.parse(rawBody) as GeniuspayWebhookEvent;
  const reference = event.event?.startsWith("payment.") ? event.data?.reference : undefined;

  // On ne fait jamais confiance au statut embarqué dans le webhook : on re-vérifie auprès de GeniusPay avant toute écriture.
  if (reference) {
    const payment = await fetchGeniuspayPayment(reference, settings.geniuspayPublicKey, settings.geniuspaySecretKey);

    if (payment && GENIUSPAY_SUCCESS_STATUSES.has(payment.status)) {
      const userId = extractUserIdFromGeniuspayPayment(payment);
      const user = userId ? await prisma.user.findUnique({ where: { id: userId }, select: { id: true } }) : null;

      if (user) {
        await activateSubscriptionForPayment({
          userId: user.id,
          paymentId: payment.reference,
          amount: payment.amount ?? settings.subscriptionPriceXof,
          paymentMethod: resolvePaymentMethodFromGeniuspay(payment.payment_method),
          subscriptionDays: settings.subscriptionDays,
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}
