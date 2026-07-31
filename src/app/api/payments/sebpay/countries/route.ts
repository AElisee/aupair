import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAppSettings } from "@/lib/settings";
import { SEBPAY_BASE_URL, sebpayHeaders, type SebpayCountry } from "@/lib/sebpay";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const settings = await getAppSettings();
  if (!settings.sebpayPublicKey || !settings.sebpaySecretKey) {
    return NextResponse.json({ error: "Le paiement n'est pas encore configuré." }, { status: 503 });
  }

  const res = await fetch(`${SEBPAY_BASE_URL}/countries`, {
    headers: sebpayHeaders(settings.sebpayPublicKey, settings.sebpaySecretKey),
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Impossible de récupérer la liste des pays." }, { status: 502 });
  }

  const countries: SebpayCountry[] = await res.json();
  return NextResponse.json({ countries });
}
