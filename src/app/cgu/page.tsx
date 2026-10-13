import { notFound } from "next/navigation";
import LegalDocumentView from "@/components/legal/LegalDocumentView";
import { getDocumentMetadata, getPublishedDocument } from "@/lib/legal-documents.server";

export const dynamic = "force-dynamic";

export function generateMetadata() {
  return getDocumentMetadata("cgu");
}

export default async function CguPage() {
  const document = await getPublishedDocument("cgu");
  if (!document) notFound();
  return <LegalDocumentView document={document} />;
}
