import type { Metadata } from "next";
import TrouverAuPairContent from "./TrouverAuPairContent";

export const metadata: Metadata = {
  title: "Trouver un au pair africain — AuPair A.EU",
  description:
    "Parcourez les profils d'au pairs africains vérifiés : pays d'origine, langues, expérience et destinations souhaitées. Inscription gratuite pour les familles.",
};

export default function TrouverAuPairPage() {
  return <TrouverAuPairContent />;
}
