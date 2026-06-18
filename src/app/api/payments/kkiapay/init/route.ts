import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAppSettings } from "@/lib/settings";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const settings = await getAppSettings();

  if (!settings.kkiapayPublicKey || !settings.kkiapayPrivateKey) {
    return NextResponse.json({ error: "Le paiement n'est pas encore configuré." }, { status: 503 });
  }

  return NextResponse.json({
    publicKey: settings.kkiapayPublicKey,
    amount: settings.subscriptionPriceXof,
    sandbox: settings.kkiapaySandbox,
  });
}
