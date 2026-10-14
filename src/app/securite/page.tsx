import { notFound } from "next/navigation";
import LegalDocumentView from "@/components/legal/LegalDocumentView";
import { getDocumentMetadata, getPublishedDocument } from "@/lib/legal-documents.server";

export const dynamic = "force-dynamic";

export function generateMetadata() {
  return getDocumentMetadata("securite");
}

export default async function SecuritePage() {
  const document = await getPublishedDocument("securite");
  if (!document) notFound();
  return <LegalDocumentView document={document} />;
}
