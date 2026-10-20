import type { Metadata } from "next";
import ContactContent from "./ContactContent";

export const metadata: Metadata = {
  title: "Contact — AuPair A.EU",
  description: "Une question sur votre inscription, votre paiement ou votre profil ? Écrivez à l'équipe AuPair A.EU, réponse sous 24h ouvrées.",
};

export default function ContactPage() {
  return <ContactContent />;
}
