import type { Metadata } from "next";
import { getCountriesByType } from "@/lib/countries";
import DevenirAuPairContent from "./DevenirAuPairContent";

export const metadata: Metadata = {
  title: "Devenir au pair en Europe — AuPair A.EU",
  description: "Découvrez comment devenir au pair en Europe depuis l'Afrique. Programme, conditions, processus d'inscription et avantages.",
};

export default async function DevenirAuPairPage() {
  const originCountries = await getCountriesByType("ORIGIN");
  return <DevenirAuPairContent originCountries={originCountries.map((c) => ({ name: c.name, flag: c.flag }))} />;
}
