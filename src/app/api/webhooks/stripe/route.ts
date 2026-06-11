import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Stripe n'est pas configuré." }, { status: 503 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Signature manquante" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const checkoutSession = event.data.object as Stripe.Checkout.Session;
    const userId = checkoutSession.metadata?.userId;
    const days = Number(checkoutSession.metadata?.subscriptionDays ?? 30);

    if (userId) {
      const existing = await prisma.subscription.findFirst({
        where: { paymentId: checkoutSession.id },
      });

      if (!existing) {
        const now = new Date();
        await prisma.subscription.create({
          data: {
            userId,
            status: "ACTIVE",
            amount: (checkoutSession.amount_total ?? 0) / 100,
            currency: "EUR",
            paymentMethod: "CARD",
            paymentId: checkoutSession.id,
            startsAt: now,
            expiresAt: new Date(now.getTime() + days * 24 * 60 * 60 * 1000),
          },
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}
