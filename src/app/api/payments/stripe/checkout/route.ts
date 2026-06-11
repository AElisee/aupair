import { NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@/lib/auth";
import { getAppSettings } from "@/lib/settings";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Le paiement par carte n'est pas encore configuré." }, { status: 503 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const settings = await getAppSettings();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(req.url).origin;

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "eur",
          unit_amount: Math.round(settings.subscriptionPriceEur * 100),
          product_data: {
            name: `Abonnement AuPair A.EU - ${settings.subscriptionDays} jours`,
          },
        },
        quantity: 1,
      },
    ],
    customer_email: session.user.email ?? undefined,
    success_url: `${appUrl}/dashboard/au-pair/abonnement?payment=success`,
    cancel_url: `${appUrl}/dashboard/au-pair/abonnement?payment=cancelled`,
    metadata: {
      userId: session.user.id,
      subscriptionDays: String(settings.subscriptionDays),
    },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
