import type { Metadata } from "next";
import TrouverFamilleContent from "./TrouverFamilleContent";

export const metadata: Metadata = {
  title: "Trouver une famille d'accueil — AuPair A.EU",
  description:
    "Parcourez les familles d'accueil vérifiées en Europe et en Amérique : pays, nombre d'enfants, heures de travail et argent de poche.",
};

export default function TrouverFamillePage() {
  return <TrouverFamilleContent />;
}
