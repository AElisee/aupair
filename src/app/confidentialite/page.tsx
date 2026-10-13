import { notFound } from "next/navigation";
import LegalDocumentView from "@/components/legal/LegalDocumentView";
import { getDocumentMetadata, getPublishedDocument } from "@/lib/legal-documents.server";

export const dynamic = "force-dynamic";

export function generateMetadata() {
  return getDocumentMetadata("confidentialite");
}

export default async function ConfidentialitePage() {
  const document = await getPublishedDocument("confidentialite");
  if (!document) notFound();
  return <LegalDocumentView document={document} />;
}
