import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAppSettings } from "@/lib/settings";
import {
  fedapayBaseUrl,
  fedapayHeaders,
  parseUserIdFromMerchantReference,
  unwrapFedapayTransaction,
  resolvePaymentMethodFromMode,
} from "@/lib/fedapay";

const FAILED_STATUSES = new Set(["declined", "canceled", "expired"]);
const SUCCESS_STATUSES = new Set(["approved", "transferred"]);

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const transactionId: number | undefined = body?.transactionId;
  if (!transactionId) {
    return NextResponse.json({ error: "Identifiant de transaction manquant." }, { status: 400 });
  }

  const settings = await getAppSettings();
  if (!settings.fedapaySecretKey) {
    return NextResponse.json({ error: "Le paiement n'est pas configuré." }, { status: 503 });
  }

  const res = await fetch(`${fedapayBaseUrl(settings.fedapayEnvironment)}/transactions/${transactionId}`, {
    headers: fedapayHeaders(settings.fedapaySecretKey),
    cache: "no-store",
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json) {
    return NextResponse.json({ error: "Impossible de vérifier le paiement." }, { status: 502 });
  }
  const transaction = unwrapFedapayTransaction(json);

  if (parseUserIdFromMerchantReference(transaction.merchant_reference) !== session.user.id) {
    return NextResponse.json({ error: "Référence invalide." }, { status: 403 });
  }

  if (FAILED_STATUSES.has(transaction.status)) {
    return NextResponse.json({ status: "rejected", error: "Le paiement a échoué ou a été annulé." }, { status: 402 });
  }

  if (!SUCCESS_STATUSES.has(transaction.status)) {
    return NextResponse.json({ status: "pending" });
  }

  const existing = await prisma.subscription.findFirst({
    where: { paymentId: String(transaction.id) },
  });

  if (!existing) {
    const now = new Date();
    await prisma.subscription.create({
      data: {
        userId: session.user.id,
        status: "ACTIVE",
        amount: transaction.amount ?? settings.subscriptionPriceXof,
        currency: "XOF",
        paymentMethod: resolvePaymentMethodFromMode(transaction.mode),
        paymentId: String(transaction.id),
        startsAt: now,
        expiresAt: new Date(now.getTime() + settings.subscriptionDays * 24 * 60 * 60 * 1000),
      },
    });
  }

  return NextResponse.json({ status: "approved", success: true });
}
