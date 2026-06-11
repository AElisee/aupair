import { prisma } from "./prisma";
import {
  LANGUAGES,
  EDUCATION_LEVELS,
  DURATIONS,
  REPORT_REASONS,
  SUBSCRIPTION_PRICE_EUR,
  SUBSCRIPTION_PRICE_XOF,
  SUBSCRIPTION_DAYS,
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
}

export async function updateAppSettings(data: AppSettingsInput) {
  return prisma.appSettings.upsert({
    where: { id: SETTINGS_ID },
    update: data,
    create: { id: SETTINGS_ID, ...DEFAULT_SETTINGS, ...data },
  });
}
