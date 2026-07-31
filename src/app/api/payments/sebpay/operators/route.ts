import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAppSettings } from "@/lib/settings";
import { SEBPAY_BASE_URL, sebpayHeaders, type SebpayOperator } from "@/lib/sebpay";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const country = new URL(req.url).searchParams.get("country");
  if (!country) {
    return NextResponse.json({ error: "Paramètre 'country' manquant." }, { status: 400 });
  }

  const settings = await getAppSettings();
  if (!settings.sebpayPublicKey || !settings.sebpaySecretKey) {
    return NextResponse.json({ error: "Le paiement n'est pas encore configuré." }, { status: 503 });
  }

  const res = await fetch(`${SEBPAY_BASE_URL}/operators?country=${encodeURIComponent(country)}`, {
    headers: sebpayHeaders(settings.sebpayPublicKey, settings.sebpaySecretKey),
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Impossible de récupérer la liste des opérateurs." }, { status: 502 });
  }

  const operators: SebpayOperator[] = await res.json();
  return NextResponse.json({ operators });
}
