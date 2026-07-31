import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAppSettings } from "@/lib/settings";
import { SEBPAY_BASE_URL, sebpayHeaders, buildExternalReference, type SebpayCollectionResponse } from "@/lib/sebpay";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const phone: string | undefined = body?.phone;
  const operator: string | undefined = body?.operator;
  const country: string | undefined = body?.country;
  const otpCode: string | undefined = body?.otpCode;

  if (!phone || !operator || !country) {
    return NextResponse.json({ error: "Téléphone, opérateur et pays sont requis." }, { status: 400 });
  }

  const settings = await getAppSettings();
  if (!settings.sebpayPublicKey || !settings.sebpaySecretKey) {
    return NextResponse.json({ error: "Le paiement n'est pas encore configuré." }, { status: 503 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(req.url).origin;
  const externalReference = buildExternalReference(session.user.id);

  const sebpayRes = await fetch(`${SEBPAY_BASE_URL}/collections`, {
    method: "POST",
    headers: sebpayHeaders(settings.sebpayPublicKey, settings.sebpaySecretKey),
    body: JSON.stringify({
      amount: settings.subscriptionPriceXof,
      currency: "XOF",
      phone,
      operator,
      country,
      external_reference: externalReference,
      callback_url: `${baseUrl}/api/webhooks/sebpay`,
      ...(otpCode ? { otp_code: otpCode } : {}),
    }),
  });

  const result = (await sebpayRes.json().catch(() => null)) as SebpayCollectionResponse | null;

  if (!sebpayRes.ok || !result) {
    return NextResponse.json(
      { error: result?.message ?? "Impossible d'initier le paiement." },
      { status: 502 }
    );
  }

  return NextResponse.json({
    transactionId: result.transaction_id,
    externalReference: result.external_reference,
    status: result.status,
    providerLink: result.provider_link ?? null,
    message: result.message ?? null,
  });
}
