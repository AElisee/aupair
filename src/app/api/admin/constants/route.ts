import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin";
import { getAppSettings, updateAppSettings, type AppSettingsInput } from "@/lib/settings";
import { isPaymentProvider, isProviderConfigured, resolveActiveProvider } from "@/lib/payments";
import { geniuspayEnvironmentFromKey } from "@/lib/geniuspay";

type Settings = Awaited<ReturnType<typeof getAppSettings>>;

/** Ne renvoie jamais les secrets au client : seulement un booléen "configuré". */
function toPublicSettings(settings: Settings) {
  const {
    resendApiKey,
    fedapayPublicKey,
    fedapaySecretKey,
    fedapayWebhookSecret,
    geniuspayPublicKey,
    geniuspaySecretKey,
    geniuspayWebhookSecret,
    ...rest
  } = settings;
  return {
    ...rest,
    paymentProvider: resolveActiveProvider(settings.paymentProvider),
    resendApiKeyConfigured: !!resendApiKey,
    fedapayPublicKeyConfigured: !!fedapayPublicKey,
    fedapaySecretKeyConfigured: !!fedapaySecretKey,
    fedapayWebhookSecretConfigured: !!fedapayWebhookSecret,
    geniuspayPublicKeyConfigured: !!geniuspayPublicKey,
    geniuspaySecretKeyConfigured: !!geniuspaySecretKey,
    geniuspayWebhookSecretConfigured: !!geniuspayWebhookSecret,
    geniuspayEnvironment: geniuspayEnvironmentFromKey(geniuspayPublicKey),
  };
}

export async function GET() {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const settings = await getAppSettings();
  return NextResponse.json({ settings: toPublicSettings(settings) });
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === "string");
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
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

  for (const key of [
    "notifyProfileViewEnabled",
    "notifyWeeklyViewsDigestEnabled",
    "instagramEnabled",
    "tiktokEnabled",
    "facebookEnabled",
  ] as const) {
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

  if ("fedapayPublicKey" in body) {
    const value = body.fedapayPublicKey;
    if (typeof value !== "string") {
      return NextResponse.json({ error: `Le champ "fedapayPublicKey" doit être une chaîne.` }, { status: 400 });
    }
    data.fedapayPublicKey = value.trim() === "" ? null : value.trim();
  }

  if ("fedapaySecretKey" in body) {
    const value = body.fedapaySecretKey;
    if (typeof value !== "string") {
      return NextResponse.json({ error: `Le champ "fedapaySecretKey" doit être une chaîne.` }, { status: 400 });
    }
    data.fedapaySecretKey = value.trim() === "" ? null : value.trim();
  }

  if ("fedapayWebhookSecret" in body) {
    const value = body.fedapayWebhookSecret;
    if (typeof value !== "string") {
      return NextResponse.json({ error: `Le champ "fedapayWebhookSecret" doit être une chaîne.` }, { status: 400 });
    }
    data.fedapayWebhookSecret = value.trim() === "" ? null : value.trim();
  }

  if ("fedapayEnvironment" in body) {
    const value = body.fedapayEnvironment;
    if (value !== "sandbox" && value !== "live") {
      return NextResponse.json({ error: `Le champ "fedapayEnvironment" doit être "sandbox" ou "live".` }, { status: 400 });
    }
    data.fedapayEnvironment = value;
  }

  for (const key of ["geniuspayPublicKey", "geniuspaySecretKey", "geniuspayWebhookSecret"] as const) {
    if (key in body) {
      const value = body[key];
      if (typeof value !== "string") {
        return NextResponse.json({ error: `Le champ "${key}" doit être une chaîne.` }, { status: 400 });
      }
      data[key] = value.trim() === "" ? null : value.trim();
    }
  }

  if ("paymentProvider" in body) {
    const value = body.paymentProvider;
    if (!isPaymentProvider(value)) {
      return NextResponse.json({ error: `Le champ "paymentProvider" doit être "fedapay" ou "geniuspay".` }, { status: 400 });
    }
    data.paymentProvider = value;
  }

  for (const key of ["instagramUrl", "tiktokUrl", "facebookUrl"] as const) {
    if (key in body) {
      const value = body[key];
      if (typeof value !== "string") {
        return NextResponse.json({ error: `Le champ "${key}" doit être une chaîne.` }, { status: 400 });
      }
      const trimmed = value.trim();
      if (trimmed && !isHttpUrl(trimmed)) {
        return NextResponse.json(
          { error: "Les liens des réseaux sociaux doivent être des URL complètes commençant par https://." },
          { status: 400 }
        );
      }
      data[key] = trimmed === "" ? null : trimmed;
    }
  }

  // Refuse d'activer un agrégateur sans clés : les au pairs verraient un bouton "Payer" qui échoue systématiquement.
  if (isPaymentProvider(data.paymentProvider)) {
    const current = await getAppSettings();
    if (!isProviderConfigured(data.paymentProvider, { ...current, ...data })) {
      return NextResponse.json(
        { error: "Renseignez la clé publique et la clé secrète de cet agrégateur avant de l'activer." },
        { status: 400 }
      );
    }
  }

  const settings = await updateAppSettings(data);
  return NextResponse.json({ settings: toPublicSettings(settings) });
}
