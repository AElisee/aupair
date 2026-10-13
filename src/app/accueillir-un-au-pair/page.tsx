import type { Metadata } from "next";
import AccueillirAuPairContent from "./AccueillirAuPairContent";

export const metadata: Metadata = {
  title: "Accueillir un au pair africain — AuPair A.EU",
  description: "Trouvez un au pair africain qualifié, motivé et bilingue pour votre famille. Inscription famille gratuite sur AuPair A.EU.",
};

export default function AccueillirAuPairPage() {
  return <AccueillirAuPairContent />;
}
