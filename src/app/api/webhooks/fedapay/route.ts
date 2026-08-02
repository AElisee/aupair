import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAppSettings } from "@/lib/settings";
import {
  fedapayBaseUrl,
  fedapayHeaders,
  verifyFedapaySignature,
  extractTransactionId,
  parseUserIdFromMerchantReference,
  unwrapFedapayTransaction,
  type FedapayWebhookEvent,
} from "@/lib/fedapay";

const SUCCESS_STATUSES = new Set(["approved", "transferred"]);

export async function POST(req: Request) {
  const settings = await getAppSettings();
  if (!settings.fedapayWebhookSecret || !settings.fedapaySecretKey) {
    return NextResponse.json({ error: "Le paiement n'est pas configuré." }, { status: 503 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get("x-fedapay-signature");

  if (!verifyFedapaySignature(rawBody, signature, settings.fedapayWebhookSecret)) {
    return NextResponse.json({ error: "Signature invalide." }, { status: 401 });
  }

  const event = JSON.parse(rawBody) as FedapayWebhookEvent;
  const transactionId = extractTransactionId(event);

  // On ne fait jamais confiance au payload webhook seul : on re-vérifie le statut canonique
  // auprès de FedaPay avant toute écriture (le statut embarqué dans l'event n'est pas garanti fiable).
  if (transactionId) {
    const res = await fetch(`${fedapayBaseUrl(settings.fedapayEnvironment)}/transactions/${transactionId}`, {
      headers: fedapayHeaders(settings.fedapaySecretKey),
      cache: "no-store",
    });
    const json = await res.json().catch(() => null);

    if (res.ok && json) {
      const transaction = unwrapFedapayTransaction(json);

      if (SUCCESS_STATUSES.has(transaction.status)) {
        const existing = await prisma.subscription.findFirst({
          where: { paymentId: String(transaction.id) },
        });

        if (!existing) {
          const userId = parseUserIdFromMerchantReference(transaction.merchant_reference);
          const user = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null;

          if (user) {
            const now = new Date();
            await prisma.subscription.create({
              data: {
                userId: user.id,
                status: "ACTIVE",
                amount: transaction.amount ?? settings.subscriptionPriceXof,
                currency: "XOF",
                paymentMethod: "FEDAPAY",
                paymentId: String(transaction.id),
                startsAt: now,
                expiresAt: new Date(now.getTime() + settings.subscriptionDays * 24 * 60 * 60 * 1000),
              },
            });
          }
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
