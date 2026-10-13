import type { Metadata } from "next";
import { getAppSettings } from "@/lib/settings";
import TarifsContent from "./TarifsContent";

export const metadata: Metadata = {
  title: "Tarifs — AuPair A.EU",
  description: "Abonnement au pair à 32€/30 jours. Inscription famille gratuite. Paiement par Mobile Money via FedaPay.",
};

export default async function TarifsPage() {
  const settings = await getAppSettings();
  return (
    <TarifsContent
      priceEur={settings.subscriptionPriceEur}
      priceXof={settings.subscriptionPriceXof}
      days={settings.subscriptionDays}
    />
  );
}
