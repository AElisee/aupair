import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAppSettings } from "@/lib/settings";
import {
  fedapayBaseUrl,
  fedapayHeaders,
  buildMerchantReference,
  unwrapFedapayTransaction,
  type FedapayTokenResponse,
} from "@/lib/fedapay";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const settings = await getAppSettings();
  if (!settings.fedapayPublicKey || !settings.fedapaySecretKey) {
    return NextResponse.json({ error: "Le paiement n'est pas encore configuré." }, { status: 503 });
  }

  const profile = await prisma.auPairProfile.findUnique({
    where: { userId: session.user.id },
    select: { firstName: true, lastName: true },
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(req.url).origin;
  const baseApiUrl = fedapayBaseUrl(settings.fedapayEnvironment);
  const headers = fedapayHeaders(settings.fedapaySecretKey);
  const merchantReference = buildMerchantReference(session.user.id);

  const createRes = await fetch(`${baseApiUrl}/transactions`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      description: `Abonnement AuPair A.EU (${settings.subscriptionDays} jours)`,
      amount: settings.subscriptionPriceXof,
      currency: { iso: "XOF" },
      callback_url: `${baseUrl}/dashboard/au-pair/abonnement?payment=return`,
      merchant_reference: merchantReference,
      customer: {
        email: session.user.email,
        firstname: profile?.firstName ?? session.user.name ?? "Au pair",
        lastname: profile?.lastName ?? "-",
      },
      custom_metadata: { userId: session.user.id },
    }),
    cache: "no-store",
  });

  const createJson = await createRes.json().catch(() => null);
  if (!createRes.ok || !createJson) {
    return NextResponse.json({ error: "Impossible d'initier le paiement." }, { status: 502 });
  }
  const transaction = unwrapFedapayTransaction(createJson);
  if (!transaction?.id) {
    return NextResponse.json({ error: "Impossible d'initier le paiement." }, { status: 502 });
  }

  const tokenRes = await fetch(`${baseApiUrl}/transactions/${transaction.id}/token`, {
    method: "POST",
    headers,
    cache: "no-store",
  });
  const tokenJson = (await tokenRes.json().catch(() => null)) as FedapayTokenResponse | null;
  if (!tokenRes.ok || !tokenJson?.url) {
    return NextResponse.json({ error: "Impossible de générer le lien de paiement." }, { status: 502 });
  }

  return NextResponse.json({
    transactionId: transaction.id,
    checkoutUrl: tokenJson.url,
    reference: merchantReference,
  });
}
