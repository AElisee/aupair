"use client";
import { useI18n } from "@/i18n";

export default function MentionsLegalesContent() {
  const { t } = useI18n();
  const p = t.legalNotice;

  return (
    <div className="py-16 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold text-[#1A1A2E] mb-8">{p.title}</h1>
      <div className="prose max-w-none space-y-6 text-gray-700">
        <section>
          <h2 className="text-xl font-bold text-[#1A1A2E] mb-3">{p.publisher}</h2>
          <p><strong>{p.companyName}</strong> AUPAIR A.EU</p>
          <p><strong>{p.siret}</strong> 02025527692</p>
          <p><strong>{p.director}</strong> BODOU SERVICE</p>
          <p><strong>{p.email}</strong> contact@aupair-aeu.com</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-[#1A1A2E] mb-3">{p.hosting}</h2>
          <p><strong>{p.host}</strong> Vercel Inc.</p>
          <p><strong>{p.address}</strong> 340 Pine Street, Suite 701, San Francisco, CA 94104, USA</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-[#1A1A2E] mb-3">{p.ipTitle}</h2>
          <p>{p.ipText}</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-[#1A1A2E] mb-3">{p.dataTitle}</h2>
          <p>
            {p.dataText} <a href="mailto:rgpd@aupair-aeu.com" className="text-[#E87722]">rgpd@aupair-aeu.com</a>
          </p>
          <p>
            {p.authority} <a href="https://www.cnil.fr" className="text-[#E87722]">CNIL</a>
          </p>
        </section>
      </div>
    </div>
  );
}
