import { prisma } from "./prisma";
import type { PaymentMethod } from "@/generated/prisma/client";

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
