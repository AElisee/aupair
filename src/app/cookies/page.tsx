import { notFound } from "next/navigation";
import LegalDocumentView from "@/components/legal/LegalDocumentView";
import { getDocumentMetadata, getPublishedDocument } from "@/lib/legal-documents.server";

export const dynamic = "force-dynamic";

export function generateMetadata() {
  return getDocumentMetadata("cookies");
}

export default async function CookiesPage() {
  const document = await getPublishedDocument("cookies");
  if (!document) notFound();
  return <LegalDocumentView document={document} />;
}
