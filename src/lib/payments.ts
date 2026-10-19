import { prisma } from "./prisma";
import type { PaymentMethod, SubscriptionStatus } from "@/generated/prisma/client";

export const PAYMENT_PROVIDERS = ["fedapay", "geniuspay"] as const;
export type PaymentProvider = (typeof PAYMENT_PROVIDERS)[number];

export function isPaymentProvider(value: unknown): value is PaymentProvider {
  return typeof value === "string" && (PAYMENT_PROVIDERS as readonly string[]).includes(value);
}

/** Agrégateur actif pour les nouveaux paiements ; une valeur inconnue en base retombe sur FedaPay. */
export function resolveActiveProvider(value: string | null | undefined): PaymentProvider {
  return isPaymentProvider(value) ? value : "fedapay";
}

type SettingsWithKeys = {
  fedapayPublicKey: string | null;
  fedapaySecretKey: string | null;
  geniuspayPublicKey: string | null;
  geniuspaySecretKey: string | null;
};

/** Un agrégateur ne peut être activé que si ses clés API (publique + secrète) sont renseignées. */
export function isProviderConfigured(provider: PaymentProvider, settings: SettingsWithKeys) {
  return provider === "fedapay"
    ? !!settings.fedapayPublicKey && !!settings.fedapaySecretKey
    : !!settings.geniuspayPublicKey && !!settings.geniuspaySecretKey;
}

/** Rien ne bascule le statut en base à l'échéance : un abonnement "ACTIVE" dont la date est passée est expiré. */
export function effectiveSubscriptionStatus(
  s: { status: SubscriptionStatus; expiresAt: Date },
  now: Date = new Date(),
): SubscriptionStatus {
  return s.status === "ACTIVE" && s.expiresAt <= now ? "EXPIRED" : s.status;
}

/** Crée l'abonnement lié à un paiement confirmé — idempotent sur `paymentId` (verify et webhook peuvent arriver tous les deux). */
export async function activateSubscriptionForPayment(params: {
  userId: string;
  paymentId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  subscriptionDays: number;
}) {
  const existing = await prisma.subscription.findFirst({ where: { paymentId: params.paymentId } });
  if (existing) return existing;

  const now = new Date();
  return prisma.subscription.create({
    data: {
      userId: params.userId,
      status: "ACTIVE",
      amount: params.amount,
      currency: "XOF",
      paymentMethod: params.paymentMethod,
      paymentId: params.paymentId,
      startsAt: now,
      expiresAt: new Date(now.getTime() + params.subscriptionDays * 24 * 60 * 60 * 1000),
    },
  });
}

/**
 * Révoque l'abonnement lié à un paiement remboursé : le statut passe à REFUNDED, ce qui coupe l'accès
 * (les contrôles exigent ACTIVE). Idempotent — seul un abonnement encore ACTIVE est modifié.
 */
export async function revokeSubscriptionForRefund(paymentId: string) {
  return prisma.subscription.updateMany({
    where: { paymentId, status: "ACTIVE" },
    data: { status: "REFUNDED" },
  });
}
