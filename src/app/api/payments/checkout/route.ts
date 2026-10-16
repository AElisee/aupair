import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAppSettings } from "@/lib/settings";
import { resolveActiveProvider } from "@/lib/payments";
import { POST as fedapayCheckout } from "../fedapay/checkout/route";
import { POST as geniuspayCheckout } from "../geniuspay/checkout/route";

/**
 * Point d'entrée unique du paiement d'abonnement : délègue à l'agrégateur actif choisi par l'admin
 * (`AppSettings.paymentProvider`). La réponse inclut `provider`, que le client utilise pour appeler
 * la route verify correspondante (`/api/payments/{provider}/verify`).
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  // Pas de nouveau paiement tant que l'abonnement en cours n'a pas expiré
  const activeSubscription = await prisma.subscription.findFirst({
    where: { userId: session.user.id, status: "ACTIVE", expiresAt: { gt: new Date() } },
    select: { id: true },
  });
  if (activeSubscription) {
    return NextResponse.json({ error: "Votre abonnement est déjà actif." }, { status: 409 });
  }

  const settings = await getAppSettings();
  return resolveActiveProvider(settings.paymentProvider) === "geniuspay" ? geniuspayCheckout(req) : fedapayCheckout(req);
}
