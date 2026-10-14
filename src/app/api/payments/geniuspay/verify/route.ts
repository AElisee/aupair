import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAppSettings } from "@/lib/settings";
import { activateSubscriptionForPayment } from "@/lib/payments";
import {
  fetchGeniuspayPayment,
  extractUserIdFromGeniuspayPayment,
  resolvePaymentMethodFromGeniuspay,
  GENIUSPAY_SUCCESS_STATUSES,
  GENIUSPAY_FAILED_STATUSES,
} from "@/lib/geniuspay";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const reference: unknown = body?.transactionId;
  if (typeof reference !== "string" || !reference) {
    return NextResponse.json({ error: "Identifiant de transaction manquant." }, { status: 400 });
  }

  // Reste fonctionnel même si GeniusPay n'est plus l'agrégateur actif : un paiement déjà initié doit pouvoir aboutir.
  const settings = await getAppSettings();
  if (!settings.geniuspayPublicKey || !settings.geniuspaySecretKey) {
    return NextResponse.json({ error: "Le paiement n'est pas configuré." }, { status: 503 });
  }

  const payment = await fetchGeniuspayPayment(reference, settings.geniuspayPublicKey, settings.geniuspaySecretKey);
  if (!payment) {
    return NextResponse.json({ error: "Impossible de vérifier le paiement." }, { status: 502 });
  }

  if (extractUserIdFromGeniuspayPayment(payment) !== session.user.id) {
    return NextResponse.json({ error: "Référence invalide." }, { status: 403 });
  }

  if (GENIUSPAY_FAILED_STATUSES.has(payment.status)) {
    return NextResponse.json({ status: "rejected", error: "Le paiement a échoué ou a été annulé." }, { status: 402 });
  }

  if (!GENIUSPAY_SUCCESS_STATUSES.has(payment.status)) {
    return NextResponse.json({ status: "pending" });
  }

  await activateSubscriptionForPayment({
    userId: session.user.id,
    paymentId: payment.reference,
    amount: payment.amount ?? settings.subscriptionPriceXof,
    paymentMethod: resolvePaymentMethodFromGeniuspay(payment.payment_method),
    subscriptionDays: settings.subscriptionDays,
  });

  return NextResponse.json({ status: "approved", success: true });
}
