"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const categories = [
  {
    name: "Au pairs",
    items: [
      { q: "Qui peut devenir au pair via AuPair A.EU ?", a: "Tout jeune africain âgé de 18 à 30 ans, motivé, avec une expérience en garde d'enfants, une bonne santé et un casier judiciaire vierge peut s'inscrire." },
      { q: "Combien coûte l'abonnement au pair ?", a: "L'abonnement est de 32€ ou 20 800 FCFA pour 30 jours. Vous pouvez payer par Mobile Money, carte bancaire ou PayPal." },
      { q: "Mon profil est-il visible immédiatement ?", a: "Non. Chaque profil est vérifié manuellement par notre équipe de modération avant publication. Ce processus prend généralement 24 à 48h ouvrées." },
      { q: "Comment contacter une famille ?", a: "Une fois votre abonnement actif, vous pouvez envoyer des messages directement aux familles via notre messagerie intégrée." },
    ],
  },
  {
    name: "Familles",
    items: [
      { q: "L'inscription famille est-elle vraiment gratuite ?", a: "Oui, totalement gratuite et sans limite de temps. Vous pouvez créer votre profil, parcourir les au pairs et recevoir des messages sans aucun frais." },
      { q: "Comment choisir mon au pair ?", a: "Parcourez les profils filtrés par pays, langue, expérience. Consultez les descriptions, photos et contactez directement les au pairs qui vous intéressent." },
      { q: "Puis-je faire une vidéoconférence avec un au pair ?", a: "Oui. Notre plateforme permet de partager des liens de visioconférence (Zoom, Google Meet) directement dans la messagerie." },
    ],
  },
  {
    name: "Paiement",
    items: [
      { q: "Quels moyens de paiement acceptez-vous ?", a: "Mobile Money via KKiaPay (Orange Money, MTN MoMo, Moov Money, et plus)." },
      { q: "Y a-t-il des remboursements ?", a: "Non. Conformément à nos CGV, aucun remboursement n'est accordé une fois l'abonnement activé." },
      { q: "L'abonnement se renouvelle-t-il automatiquement ?", a: "Non. Vous recevrez des rappels par email à J-7, J-3 et J-1 avant expiration pour vous permettre de renouveler." },
    ],
  },
  {
    name: "Sécurité",
    items: [
      { q: "Comment vérifiez-vous les profils ?", a: "Chaque profil est vérifié manuellement par notre équipe : photo d'identité, informations personnelles, cohérence du profil. Nous utilisons également une IA pour détecter les faux profils." },
      { q: "Que faire si je reçois un message inapproprié ?", a: "Utilisez le bouton 'Signaler' sur n'importe quel message ou profil. Notre équipe examine chaque signalement sous 24h et peut suspendre le compte concerné." },
      { q: "Mes données sont-elles protégées ?", a: "Oui. AuPair A.EU est conforme au RGPD. Vous avez le droit d'accès, de rectification et de suppression de vos données. Consultez notre politique de confidentialité." },
    ],
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <span className="font-semibold text-[#1A1A2E] pr-4">{q}</span>
        {open ? <ChevronUp className="w-5 h-5 text-[#E87722] flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-5 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-4">
          {a}
        </div>
      )}
    </div>
  );
}

export default function FaqPage() {
  const [activeCategory, setActiveCategory] = useState("Au pairs");
  const current = categories.find(c => c.name === activeCategory)!;

  return (
    <div className="py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-[#1A1A2E] mb-4">Questions fréquentes</h1>
          <p className="text-gray-500 text-lg">Trouvez rapidement les réponses à vos questions</p>
        </div>

        {/* Filtres catégories */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {categories.map((c) => (
            <button
              key={c.name}
              onClick={() => setActiveCategory(c.name)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                activeCategory === c.name
                  ? "bg-[#E87722] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-[#FFF3E0] hover:text-[#E87722]"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Questions */}
        <div className="space-y-3">
          {current.items.map((item) => (
            <FaqItem key={item.q} q={item.q} a={item.a} />
          ))}
        </div>

        {/* Contact */}
        <div className="mt-12 bg-[#FFF3E0] rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold text-[#1A1A2E] mb-2">Vous n'avez pas trouvé votre réponse ?</h2>
          <p className="text-gray-500 mb-4">Notre équipe est disponible pour vous aider.</p>
          <a href="/contact">
            <button className="bg-[#E87722] text-white px-6 py-2.5 rounded-full font-semibold hover:bg-[#d06619] transition-colors">
              Nous contacter
            </button>
          </a>
        </div>
      </div>
    </div>
  );
}
