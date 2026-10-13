import type { Metadata } from "next";
import MentionsLegalesContent from "./MentionsLegalesContent";

export const metadata: Metadata = { title: "Mentions légales — AuPair A.EU" };

export default function MentionsLegalesPage() {
  return <MentionsLegalesContent />;
}
