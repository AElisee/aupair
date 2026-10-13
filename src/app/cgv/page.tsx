import { notFound } from "next/navigation";
import LegalDocumentView from "@/components/legal/LegalDocumentView";
import { getDocumentMetadata, getPublishedDocument } from "@/lib/legal-documents.server";

export const dynamic = "force-dynamic";

export function generateMetadata() {
  return getDocumentMetadata("cgv");
}

export default async function CgvPage() {
  const document = await getPublishedDocument("cgv");
  if (!document) notFound();
  return <LegalDocumentView document={document} />;
}
