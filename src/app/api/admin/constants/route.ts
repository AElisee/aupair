import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin";
import { getAppSettings, updateAppSettings, type AppSettingsInput } from "@/lib/settings";

export async function GET() {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const settings = await getAppSettings();
  const { resendApiKey, stripeSecretKey, stripeWebhookSecret, cinetpayApiKey, cinetpaySiteId, ...rest } = settings;
  return NextResponse.json({
    settings: {
      ...rest,
      resendApiKeyConfigured: !!resendApiKey,
      stripeSecretKeyConfigured: !!stripeSecretKey,
      stripeWebhookSecretConfigured: !!stripeWebhookSecret,
      cinetpayApiKeyConfigured: !!cinetpayApiKey,
      cinetpaySiteIdConfigured: !!cinetpaySiteId,
    },
  });
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === "string");
}

export async function PUT(req: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  const data: AppSettingsInput = {};

  for (const key of ["languages", "educationLevels", "durations", "reportReasons", "subscriptionFeatures"] as const) {
    if (key in body) {
      const value = body[key];
      if (!isStringArray(value) || value.some((v) => !v.trim())) {
        return NextResponse.json({ error: `Le champ "${key}" doit être une liste de textes non vides.` }, { status: 400 });
      }
      data[key] = value.map((v) => v.trim());
    }
  }

  if ("subscriptionPriceEur" in body) {
    const value = body.subscriptionPriceEur;
    if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
      return NextResponse.json({ error: "Le prix de l'abonnement (EUR) est invalide." }, { status: 400 });
    }
    data.subscriptionPriceEur = value;
  }

  if ("subscriptionPriceXof" in body) {
    const value = body.subscriptionPriceXof;
    if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
      return NextResponse.json({ error: "Le prix de l'abonnement (XOF) est invalide." }, { status: 400 });
    }
    data.subscriptionPriceXof = value;
  }

  if ("subscriptionDays" in body) {
    const value = body.subscriptionDays;
    if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
      return NextResponse.json({ error: "La durée de l'abonnement (jours) est invalide." }, { status: 400 });
    }
    data.subscriptionDays = value;
  }

  if ("heroImageUrl" in body) {
    const value = body.heroImageUrl;
    if (typeof value !== "string" || !value.trim()) {
      return NextResponse.json({ error: `Le champ "heroImageUrl" doit être une URL ou un chemin non vide.` }, { status: 400 });
    }
    data.heroImageUrl = value.trim();
  }

  for (const key of ["notifyProfileViewEnabled", "notifyWeeklyViewsDigestEnabled"] as const) {
    if (key in body) {
      const value = body[key];
      if (typeof value !== "boolean") {
        return NextResponse.json({ error: `Le champ "${key}" doit être un booléen.` }, { status: 400 });
      }
      data[key] = value;
    }
  }

  // resendApiKey : une valeur vide efface la clé, "in body" mais non vide la met à jour.
  // Une valeur absente ne touche pas la clé existante (évite d'écraser un secret par accident).
  if ("resendApiKey" in body) {
    const value = body.resendApiKey;
    if (typeof value !== "string") {
      return NextResponse.json({ error: `Le champ "resendApiKey" doit être une chaîne.` }, { status: 400 });
    }
    data.resendApiKey = value.trim() === "" ? null : value.trim();
  }

  if ("emailFrom" in body) {
    const value = body.emailFrom;
    if (typeof value !== "string") {
      return NextResponse.json({ error: `Le champ "emailFrom" doit être une chaîne.` }, { status: 400 });
    }
    const trimmed = value.trim();
    const EMAIL = /[^\s<>]+@[^\s<>]+\.[^\s<>]+/;
    const isValid =
      !trimmed || EMAIL.test(trimmed) && (!trimmed.includes("<") || new RegExp(`^[^<>]+<${EMAIL.source}>$`).test(trimmed));
    if (!isValid) {
      return NextResponse.json(
        { error: `Le champ "emailFrom" doit être une adresse email, ex: "AuPair A.EU <contact@domaine.com>".` },
        { status: 400 }
      );
    }
    data.emailFrom = trimmed === "" ? null : trimmed;
  }

  // stripeSecretKey / stripeWebhookSecret : même logique que resendApiKey —
  // une valeur vide efface la clé, une valeur absente ne la modifie pas.
  if ("stripeSecretKey" in body) {
    const value = body.stripeSecretKey;
    if (typeof value !== "string") {
      return NextResponse.json({ error: `Le champ "stripeSecretKey" doit être une chaîne.` }, { status: 400 });
    }
    data.stripeSecretKey = value.trim() === "" ? null : value.trim();
  }

  if ("stripeWebhookSecret" in body) {
    const value = body.stripeWebhookSecret;
    if (typeof value !== "string") {
      return NextResponse.json({ error: `Le champ "stripeWebhookSecret" doit être une chaîne.` }, { status: 400 });
    }
    data.stripeWebhookSecret = value.trim() === "" ? null : value.trim();
  }

  // cinetpayApiKey / cinetpaySiteId : même logique que stripeSecretKey —
  // une valeur vide efface la clé, une valeur absente ne la modifie pas.
  if ("cinetpayApiKey" in body) {
    const value = body.cinetpayApiKey;
    if (typeof value !== "string") {
      return NextResponse.json({ error: `Le champ "cinetpayApiKey" doit être une chaîne.` }, { status: 400 });
    }
    data.cinetpayApiKey = value.trim() === "" ? null : value.trim();
  }

  if ("cinetpaySiteId" in body) {
    const value = body.cinetpaySiteId;
    if (typeof value !== "string") {
      return NextResponse.json({ error: `Le champ "cinetpaySiteId" doit être une chaîne.` }, { status: 400 });
    }
    data.cinetpaySiteId = value.trim() === "" ? null : value.trim();
  }

  const settings = await updateAppSettings(data);
  const { resendApiKey, stripeSecretKey, stripeWebhookSecret, cinetpayApiKey, cinetpaySiteId, ...rest } = settings;
  return NextResponse.json({
    settings: {
      ...rest,
      resendApiKeyConfigured: !!resendApiKey,
      stripeSecretKeyConfigured: !!stripeSecretKey,
      stripeWebhookSecretConfigured: !!stripeWebhookSecret,
      cinetpayApiKeyConfigured: !!cinetpayApiKey,
      cinetpaySiteIdConfigured: !!cinetpaySiteId,
    },
  });
}
