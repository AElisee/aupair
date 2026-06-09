import type { Metadata } from "next";

export const metadata: Metadata = { title: "Mentions légales — AuPair A.EU" };

export default function MentionsLegalesPage() {
  return (
    <div className="py-16 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold text-[#1A1A2E] mb-8">Mentions légales</h1>
      <div className="prose max-w-none space-y-6 text-gray-700">
        <section>
          <h2 className="text-xl font-bold text-[#1A1A2E] mb-3">Éditeur du site</h2>
          <p><strong>Raison sociale :</strong> AUPAIR A.EU</p>
          <p><strong>SIRET :</strong> 02025527692</p>
          <p><strong>Directeur de publication :</strong> BODOU SERVICE</p>
          <p><strong>Email :</strong> contact@aupair-aeu.com</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-[#1A1A2E] mb-3">Hébergement</h2>
          <p><strong>Hébergeur :</strong> Vercel Inc.</p>
          <p><strong>Adresse :</strong> 340 Pine Street, Suite 701, San Francisco, CA 94104, USA</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-[#1A1A2E] mb-3">Propriété intellectuelle</h2>
          <p>L'ensemble du contenu de ce site (textes, images, logo) est protégé par les droits de propriété intellectuelle. Toute reproduction est interdite sans autorisation préalable écrite.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-[#1A1A2E] mb-3">Données personnelles</h2>
          <p>Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, de suppression et d'opposition à vos données. Contact : <a href="mailto:rgpd@aupair-aeu.com" className="text-[#E87722]">rgpd@aupair-aeu.com</a></p>
          <p>Autorité de contrôle : <a href="https://www.cnil.fr" className="text-[#E87722]">CNIL</a></p>
        </section>
      </div>
    </div>
  );
}
