import { notFound, permanentRedirect } from "next/navigation";
import LegalDocumentView from "@/components/legal/LegalDocumentView";
import { getDocumentMetadata, getPublishedDocument } from "@/lib/legal-documents.server";
import { DEDICATED_DOCUMENT_PATHS } from "@/lib/legal-documents";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return getDocumentMetadata(slug);
}

export default async function DocumentPage({ params }: Props) {
  const { slug } = await params;
  // Les documents ayant une URL dédiée (/cgu, /cgv…) ne sont servis qu'à cette adresse.
  if (Object.hasOwn(DEDICATED_DOCUMENT_PATHS, slug)) permanentRedirect(DEDICATED_DOCUMENT_PATHS[slug]);
  const document = await getPublishedDocument(slug);
  if (!document) notFound();
  return <LegalDocumentView document={document} />;
}
