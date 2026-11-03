import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAppSettings } from "@/lib/settings";
import { activateSubscriptionForPayment, revokeSubscriptionForRefund } from "@/lib/payments";
import {
  verifyGeniuspaySignature,
  fetchGeniuspayPayment,
  extractUserIdFromGeniuspayPayment,
  extractReferenceFromGeniuspayEvent,
  resolvePaymentMethodFromGeniuspay,
  GENIUSPAY_SUCCESS_STATUSES,
  type GeniuspayWebhookEvent,
} from "@/lib/geniuspay";

/** Réponse non-2xx : GeniusPay considère la livraison comme échouée et peut la renvoyer. */
function retryLater(message: string) {
  return NextResponse.json({ error: message }, { status: 503 });
}

export async function POST(req: Request) {
  const settings = await getAppSettings();
  if (!settings.geniuspayWebhookSecret || !settings.geniuspayPublicKey || !settings.geniuspaySecretKey) {
    console.error("[geniuspay] webhook reçu mais GeniusPay n'est pas configuré");
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
    console.error("[geniuspay] webhook : signature invalide");
    return NextResponse.json({ error: "Signature invalide." }, { status: 401 });
  }

  let event: GeniuspayWebhookEvent;
  try {
    event = JSON.parse(rawBody) as GeniuspayWebhookEvent;
  } catch {
    console.error("[geniuspay] webhook : corps JSON invalide");
    return NextResponse.json({ error: "Corps invalide." }, { status: 400 });
  }

  const eventName = typeof event.event === "string" ? event.event : "";
  const reference = extractReferenceFromGeniuspayEvent(event);
  console.info(`[geniuspay] webhook ${eventName || "(sans nom)"} reference=${reference ?? "(absente)"}`);

  if (!reference) {
    // Ne pas avaler silencieusement un événement de paiement dont on ne sait pas lire la référence.
    if (eventName.startsWith("payment.")) {
      console.error(`[geniuspay] webhook ${eventName} sans référence lisible : ${rawBody.slice(0, 1000)}`);
      return retryLater("Référence introuvable.");
    }
    return NextResponse.json({ received: true });
  }

  // On ne fait jamais confiance au statut embarqué dans le webhook : on re-vérifie auprès de GeniusPay avant toute écriture.
  const payment = await fetchGeniuspayPayment(reference, settings.geniuspayPublicKey, settings.geniuspaySecretKey);
  if (!payment) {
    console.error(`[geniuspay] webhook : impossible de récupérer le paiement ${reference}`);
    return retryLater("Paiement introuvable.");
  }

  if (GENIUSPAY_SUCCESS_STATUSES.has(payment.status)) {
    const userId = extractUserIdFromGeniuspayPayment(payment);
    const user = userId ? await prisma.user.findUnique({ where: { id: userId }, select: { id: true } }) : null;
    if (!user) {
      console.error(`[geniuspay] webhook : paiement ${reference} réussi mais utilisateur introuvable (${userId ?? "aucun user_id"})`);
      return NextResponse.json({ received: true });
    }

    await activateSubscriptionForPayment({
      userId: user.id,
      paymentId: payment.reference,
      amount: payment.amount ?? settings.subscriptionPriceXof,
      paymentMethod: resolvePaymentMethodFromGeniuspay(payment.payment_method),
      subscriptionDays: settings.subscriptionDays,
    });
    console.info(`[geniuspay] abonnement activé pour ${user.id} (paiement ${reference})`);
  } else if (payment.status === "refunded") {
    await revokeSubscriptionForRefund(payment.reference);
    console.info(`[geniuspay] abonnement révoqué (remboursement ${reference})`);
  } else if (eventName === "payment.success") {
    // Événement de succès reçu avant que l'API ne reflète le statut final : on demande un renvoi.
    console.warn(`[geniuspay] webhook payment.success mais statut API "${payment.status}" pour ${reference}`);
    return retryLater("Statut pas encore final.");
  }

  return NextResponse.json({ received: true });
}
