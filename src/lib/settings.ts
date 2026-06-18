import { prisma } from "./prisma";
import {
  LANGUAGES,
  EDUCATION_LEVELS,
  DURATIONS,
  REPORT_REASONS,
  SUBSCRIPTION_PRICE_EUR,
  SUBSCRIPTION_PRICE_XOF,
  SUBSCRIPTION_DAYS,
  SUBSCRIPTION_FEATURES,
} from "./constants";

const SETTINGS_ID = "default";

const DEFAULT_SETTINGS = {
  languages: LANGUAGES,
  educationLevels: EDUCATION_LEVELS,
  durations: DURATIONS,
  reportReasons: REPORT_REASONS,
  subscriptionPriceEur: SUBSCRIPTION_PRICE_EUR,
  subscriptionPriceXof: SUBSCRIPTION_PRICE_XOF,
  subscriptionDays: SUBSCRIPTION_DAYS,
  subscriptionFeatures: SUBSCRIPTION_FEATURES,
  heroImageUrl: "/jeune_aupair.png",
  notifyProfileViewEnabled: true,
  notifyWeeklyViewsDigestEnabled: true,
  resendApiKey: null as string | null,
  emailFrom: null as string | null,
  stripeSecretKey: null as string | null,
  stripeWebhookSecret: null as string | null,
  cinetpayApiKey: null as string | null,
  cinetpaySiteId: null as string | null,
  kkiapayPublicKey: null as string | null,
  kkiapayPrivateKey: null as string | null,
};

/** Récupère les constantes éditables (crée la ligne avec les valeurs par défaut si elle n'existe pas encore). */
export async function getAppSettings() {
  return prisma.appSettings.upsert({
    where: { id: SETTINGS_ID },
    update: {},
    create: { id: SETTINGS_ID, ...DEFAULT_SETTINGS },
  });
}

export interface AppSettingsInput {
  languages?: string[];
  educationLevels?: string[];
  durations?: string[];
  reportReasons?: string[];
  subscriptionPriceEur?: number;
  subscriptionPriceXof?: number;
  subscriptionDays?: number;
  subscriptionFeatures?: string[];
  heroImageUrl?: string;
  notifyProfileViewEnabled?: boolean;
  notifyWeeklyViewsDigestEnabled?: boolean;
  resendApiKey?: string | null;
  emailFrom?: string | null;
  stripeSecretKey?: string | null;
  stripeWebhookSecret?: string | null;
  cinetpayApiKey?: string | null;
  cinetpaySiteId?: string | null;
  kkiapayPublicKey?: string | null;
  kkiapayPrivateKey?: string | null;
}

export async function updateAppSettings(data: AppSettingsInput) {
  return prisma.appSettings.upsert({
    where: { id: SETTINGS_ID },
    update: data,
    create: { id: SETTINGS_ID, ...DEFAULT_SETTINGS, ...data },
  });
}
