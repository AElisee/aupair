import type { Metadata } from "next";
import TemoignagesContent from "./TemoignagesContent";

export const metadata: Metadata = {
  title: "Témoignages — AuPair A.EU",
  description: "Au pairs africains et familles d'accueil racontent leur expérience avec AuPair A.EU.",
};

export default function TemoignagesPage() {
  return <TemoignagesContent />;
}
