import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAppSettings } from "@/lib/settings";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  if (!process.env.CINETPAY_API_KEY || !process.env.CINETPAY_SITE_ID) {
    return NextResponse.json({ error: "Le paiement Mobile Money n'est pas encore configuré." }, { status: 503 });
  }

  const settings = await getAppSettings();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(req.url).origin;
  const transactionId = `${session.user.id}-${Date.now()}`;

  const res = await fetch("https://api-checkout.cinetpay.com/v2/payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      apikey: process.env.CINETPAY_API_KEY,
      site_id: process.env.CINETPAY_SITE_ID,
      transaction_id: transactionId,
      amount: settings.subscriptionPriceXof,
      currency: "XOF",
      description: `Abonnement AuPair A.EU - ${settings.subscriptionDays} jours`,
      customer_email: session.user.email,
      notify_url: `${appUrl}/api/webhooks/cinetpay`,
      return_url: `${appUrl}/dashboard/au-pair/abonnement?payment=success`,
      channels: "MOBILE_MONEY",
    }),
  });

  const data = await res.json();

  if (data.code !== "201") {
    return NextResponse.json({ error: data.message ?? "Erreur lors de l'initialisation du paiement." }, { status: 502 });
  }

  return NextResponse.json({ url: data.data.payment_url });
}
