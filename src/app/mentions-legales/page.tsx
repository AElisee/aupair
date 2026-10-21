import type { Metadata } from "next";
import LegalDocumentView from "@/components/legal/LegalDocumentView";
import { getPublishedDocument } from "@/lib/legal-documents.server";
import { DEFAULT_LEGAL_NOTICE } from "@/content/mentions-legales";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mentions légales — AuPair A.EU",
};

// Document `mentions-legales` du back-office s'il est publié, sinon le contenu par défaut.
export default async function MentionsLegalesPage() {
  const document = (await getPublishedDocument("mentions-legales")) ?? DEFAULT_LEGAL_NOTICE;
  return <LegalDocumentView document={document} />;
}
