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
    // Un réseau désactivé depuis l'admin est renvoyé à null : son icône disparaît du footer
    socialLinks: {
      instagram: settings.instagramEnabled ? settings.instagramUrl : null,
      tiktok: settings.tiktokEnabled ? settings.tiktokUrl : null,
      facebook: settings.facebookEnabled ? settings.facebookUrl : null,
    },
    subscription: {
      priceEur: settings.subscriptionPriceEur,
      priceXof: settings.subscriptionPriceXof,
      days: settings.subscriptionDays,
      features: settings.subscriptionFeatures,
    },
  });
}
