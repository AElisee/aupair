import { getAppSettings } from "@/lib/settings";
import { resolveActiveProvider } from "@/lib/payments";
import { POST as fedapayCheckout } from "../fedapay/checkout/route";
import { POST as geniuspayCheckout } from "../geniuspay/checkout/route";

/**
 * Point d'entrée unique du paiement d'abonnement : délègue à l'agrégateur actif choisi par l'admin
 * (`AppSettings.paymentProvider`). La réponse inclut `provider`, que le client utilise pour appeler
 * la route verify correspondante (`/api/payments/{provider}/verify`).
 */
export async function POST(req: Request) {
  const settings = await getAppSettings();
  return resolveActiveProvider(settings.paymentProvider) === "geniuspay" ? geniuspayCheckout(req) : fedapayCheckout(req);
}
