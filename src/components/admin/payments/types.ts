import { Smartphone, Wallet, type LucideIcon } from "lucide-react";
import { BLUE, TEAL } from "@/components/admin/AdminUI";

export type PaymentProvider = "fedapay" | "geniuspay";

export const PROVIDER_NAMES: Record<PaymentProvider, string> = { fedapay: "FedaPay", geniuspay: "GeniusPay" };

export const PROVIDERS = Object.keys(PROVIDER_NAMES) as PaymentProvider[];

/** Icône et couleur de charte de chaque agrégateur dans le back-office */
export const PROVIDER_STYLES: Record<PaymentProvider, { icon: LucideIcon; color: string }> = {
  fedapay: { icon: Smartphone, color: BLUE },
  geniuspay: { icon: Wallet, color: TEAL },
};

/** Champs de `settings` renvoyés par /api/admin/constants utilisés par la page Moyens de paiement. */
export interface PaymentSettings {
  paymentProvider: PaymentProvider;
  fedapayPublicKeyConfigured: boolean;
  fedapaySecretKeyConfigured: boolean;
  fedapayWebhookSecretConfigured: boolean;
  fedapayEnvironment: string;
  geniuspayPublicKeyConfigured: boolean;
  geniuspaySecretKeyConfigured: boolean;
  geniuspayWebhookSecretConfigured: boolean;
  geniuspayEnvironment: "sandbox" | "live" | null;
}

export function isProviderConfigured(settings: PaymentSettings, provider: PaymentProvider): boolean {
  return provider === "fedapay"
    ? settings.fedapayPublicKeyConfigured && settings.fedapaySecretKeyConfigured
    : settings.geniuspayPublicKeyConfigured && settings.geniuspaySecretKeyConfigured;
}

/** Environnement effectif : choisi par l'admin pour FedaPay, déduit des clés pour GeniusPay (null = inconnu). */
export function providerEnvironment(settings: PaymentSettings, provider: PaymentProvider): "sandbox" | "live" | null {
  if (provider === "fedapay") return settings.fedapayEnvironment === "live" ? "live" : "sandbox";
  return settings.geniuspayPublicKeyConfigured ? settings.geniuspayEnvironment : null;
}
