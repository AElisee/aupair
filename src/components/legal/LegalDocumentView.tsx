"use client";
import { useI18n } from "@/i18n";

export type LegalDocumentDTO = {
  title: string;
  titleEn: string | null;
  content: string;
  contentEn: string | null;
  updatedAt: string;
};

export default function LegalDocumentView({ document }: { document: LegalDocumentDTO }) {
  const { lang, locale, t } = useI18n();
  const useEn = lang === "en" && !!document.contentEn;
  const title = lang === "en" && document.titleEn ? document.titleEn : document.title;
  const content = useEn ? document.contentEn! : document.content;
  const updatedAt = new Date(document.updatedAt).toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="bg-[#F5F5F5] min-h-screen">
      <header className="bg-gradient-to-br from-[#1A1A2E] to-[#2A2A4A] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-24">
          <h1 className="text-2xl sm:text-3xl font-extrabold mb-2">{title}</h1>
          <p className="text-sm text-white/70">
            {t.legalDocument.lastUpdated} {updatedAt}
          </p>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-14 pb-16">
        <article className="bg-white rounded-2xl shadow-sm border border-gray-100 border-t-4 border-t-[#E87722] p-6 sm:p-10 lg:p-12">
          {/* HTML filtré côté serveur par sanitizeDocumentHtml (legal-documents.server.ts). */}
          <div className="legal-content legal-page" dangerouslySetInnerHTML={{ __html: content }} />
        </article>
      </div>
    </div>
  );
}
