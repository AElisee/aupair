import { NextResponse } from "next/server";
import { getAppSettings } from "@/lib/settings";

export async function GET() {
  const settings = await getAppSettings();

  return NextResponse.json({
    languages: settings.languages,
    educationLevels: settings.educationLevels,
    durations: settings.durations,
    reportReasons: settings.reportReasons,
    heroImageUrl: settings.heroImageUrl,
    subscription: {
      priceEur: settings.subscriptionPriceEur,
      priceXof: settings.subscriptionPriceXof,
      days: settings.subscriptionDays,
      features: settings.subscriptionFeatures,
    },
  });
}
