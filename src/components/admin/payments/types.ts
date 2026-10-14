export type PaymentProvider = "fedapay" | "geniuspay";

export const PROVIDER_NAMES: Record<PaymentProvider, string> = { fedapay: "FedaPay", geniuspay: "GeniusPay" };

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
