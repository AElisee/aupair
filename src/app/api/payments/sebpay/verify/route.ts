import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAppSettings } from "@/lib/settings";
import { prisma } from "@/lib/prisma";
import { SEBPAY_BASE_URL, sebpayHeaders, parseUserIdFromReference, type SebpayCollectionResponse } from "@/lib/sebpay";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const reference: string | undefined = body?.reference;
  if (!reference) {
    return NextResponse.json({ error: "Référence manquante." }, { status: 400 });
  }
  if (parseUserIdFromReference(reference) !== session.user.id) {
    return NextResponse.json({ error: "Référence invalide." }, { status: 403 });
  }

  const settings = await getAppSettings();
  if (!settings.sebpayPublicKey || !settings.sebpaySecretKey) {
    return NextResponse.json({ error: "Le paiement n'est pas configuré." }, { status: 503 });
  }

  const verifyRes = await fetch(`${SEBPAY_BASE_URL}/collections/${encodeURIComponent(reference)}`, {
    headers: sebpayHeaders(settings.sebpayPublicKey, settings.sebpaySecretKey),
  });

  if (!verifyRes.ok) {
    return NextResponse.json({ error: "Impossible de vérifier le paiement." }, { status: 502 });
  }

  const result = (await verifyRes.json()) as SebpayCollectionResponse;

  if (result.status === "rejected") {
    return NextResponse.json({ status: "rejected", error: "Le paiement a été refusé." }, { status: 402 });
  }

  if (result.status === "pending") {
    return NextResponse.json({ status: "pending" });
  }

  const existing = await prisma.subscription.findFirst({
    where: { paymentId: result.transaction_id },
  });

  if (!existing) {
    const now = new Date();
    await prisma.subscription.create({
      data: {
        userId: session.user.id,
        status: "ACTIVE",
        amount: result.amount ?? settings.subscriptionPriceXof,
        currency: "XOF",
        paymentMethod: "SEBPAY",
        paymentId: result.transaction_id,
        startsAt: now,
        expiresAt: new Date(now.getTime() + settings.subscriptionDays * 24 * 60 * 60 * 1000),
      },
    });
  }

  return NextResponse.json({ status: "approved", success: true });
}
