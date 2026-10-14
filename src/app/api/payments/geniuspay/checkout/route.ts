import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAppSettings } from "@/lib/settings";
import { GENIUSPAY_BASE_URL, geniuspayHeaders, geniuspayErrorMessage, unwrapGeniuspayPayment } from "@/lib/geniuspay";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const settings = await getAppSettings();
  if (!settings.geniuspayPublicKey || !settings.geniuspaySecretKey) {
    return NextResponse.json({ error: "Le paiement n'est pas encore configuré." }, { status: 503 });
  }

  const profile = await prisma.auPairProfile.findUnique({
    where: { userId: session.user.id },
    select: { firstName: true, lastName: true },
  });
  const customerName = [profile?.firstName, profile?.lastName].filter(Boolean).join(" ") || session.user.name || "Au pair";

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(req.url).origin;
  const returnUrl = `${baseUrl}/dashboard/au-pair/abonnement?payment=return`;

  // Mode checkout (sans payment_method) : le client choisit Wave / Orange / MTN / Moov / carte sur la page hébergée GeniusPay.
  const res = await fetch(`${GENIUSPAY_BASE_URL}/payments`, {
    method: "POST",
    headers: geniuspayHeaders(settings.geniuspayPublicKey, settings.geniuspaySecretKey),
    body: JSON.stringify({
      amount: settings.subscriptionPriceXof,
      currency: "XOF",
      description: `Abonnement AuPair A.EU (${settings.subscriptionDays} jours)`,
      customer: {
        name: customerName,
        ...(session.user.email ? { email: session.user.email } : {}),
      },
      success_url: returnUrl,
      error_url: returnUrl,
      metadata: { user_id: session.user.id },
    }),
    cache: "no-store",
  });

  const json = await res.json().catch(() => null);
  const payment = res.ok ? unwrapGeniuspayPayment(json) : null;
  const checkoutUrl = payment?.checkout_url ?? payment?.payment_url;
  if (!payment || !checkoutUrl) {
    console.error(`[geniuspay] création du paiement refusée (${res.status}) : ${geniuspayErrorMessage(json)}`);
    return NextResponse.json({ error: "Impossible d'initier le paiement." }, { status: 502 });
  }

  return NextResponse.json({
    provider: "geniuspay",
    transactionId: payment.reference,
    checkoutUrl,
    reference: payment.reference,
  });
}
