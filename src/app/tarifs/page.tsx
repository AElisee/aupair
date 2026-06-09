import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle, Smartphone, CreditCard, Globe, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tarifs — AuPair A.EU",
  description: "Abonnement au pair à 32€/30 jours. Inscription famille gratuite. Paiement par Mobile Money, carte bancaire ou PayPal.",
};

const auPairFeatures = [
  "Profil visible par toutes les familles",
  "Messagerie illimitée",
  "Accès aux coordonnées des familles",
  "Filtres de recherche avancés",
  "Sauvegarde de favoris",
  "Notifications de nouveaux profils",
  "Support prioritaire",
];

const familyFeatures = [
  "Profil visible par tous les au pairs",
  "Parcourir les profils d'au pairs",
  "Recevoir des messages des au pairs",
  "Filtres de recherche avancés",
  "Sauvegarde de favoris",
  "Support standard",
];

const paymentMethods = [
  { icon: Smartphone, name: "Mobile Money", desc: "Orange Money, MTN MoMo, Wave, Moov Money — 20 800 FCFA", countries: "🇨🇲 🇨🇮 🇲🇱 🇧🇯 🇹🇬 🇬🇭 🇸🇳" },
  { icon: CreditCard, name: "Carte bancaire", desc: "Visa, Mastercard — 32€ via Stripe", countries: "🌍 Tous pays" },
  { icon: Globe, name: "PayPal", desc: "Paiement PayPal sécurisé — 32€", countries: "🌍 Tous pays" },
];

const faqs = [
  { q: "Y a-t-il un remboursement possible ?", a: "Non, conformément à nos CGV, les abonnements ne sont pas remboursables. L'abonnement est activé dès la validation du paiement." },
  { q: "L'abonnement se renouvelle-t-il automatiquement ?", a: "Non. L'abonnement ne se renouvelle pas automatiquement. Vous recevrez un rappel 7 jours, 3 jours et 1 jour avant expiration." },
  { q: "Pourquoi les familles s'inscrivent-elles gratuitement ?", a: "Nous croyons que les familles d'accueil doivent avoir accès aux profils librement. C'est l'au pair qui investit dans son projet de vie à l'étranger." },
];

export default function TarifsPage() {
  return (
    <div className="py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-[#1A1A2E] mb-4">Tarifs simples et transparents</h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">Un seul abonnement pour les au pairs. Inscription gratuite pour les familles.</p>
        </div>

        {/* Cards tarifaires */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Au pair */}
          <div className="border-2 border-[#E87722] rounded-2xl p-8 relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="bg-[#E87722] text-white text-xs font-bold px-4 py-1.5 rounded-full">POUR LES AU PAIRS</span>
            </div>
            <div className="text-center mb-8">
              <div className="text-5xl font-extrabold text-[#1A1A2E] mb-1">32€</div>
              <div className="text-gray-500">= 20 800 FCFA</div>
              <div className="text-sm text-gray-400 mt-1">pour 30 jours</div>
            </div>
            <ul className="space-y-3 mb-8">
              {auPairFeatures.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-[#E87722] flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/inscription?role=au-pair">
              <Button className="w-full" size="lg">S'inscrire comme au pair <ArrowRight className="w-4 h-4" /></Button>
            </Link>
          </div>

          {/* Famille */}
          <div className="border border-gray-200 rounded-2xl p-8 relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="bg-[#1A1A2E] text-white text-xs font-bold px-4 py-1.5 rounded-full">POUR LES FAMILLES</span>
            </div>
            <div className="text-center mb-8">
              <div className="text-5xl font-extrabold text-[#1A1A2E] mb-1">0€</div>
              <div className="text-gray-500">Inscription gratuite</div>
              <div className="text-sm text-gray-400 mt-1">accès illimité</div>
            </div>
            <ul className="space-y-3 mb-8">
              {familyFeatures.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/inscription?role=famille">
              <Button variant="secondary" className="w-full" size="lg">S'inscrire comme famille <ArrowRight className="w-4 h-4" /></Button>
            </Link>
          </div>
        </div>

        {/* Moyens de paiement */}
        <div className="mb-16">
          <h2 className="text-2xl font-extrabold text-[#1A1A2E] mb-6 text-center">Moyens de paiement acceptés</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {paymentMethods.map((m) => {
              const Icon = m.icon;
              return (
                <div key={m.name} className="bg-[#FFF3E0] rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-[#E87722] rounded-full flex items-center justify-center">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-bold text-[#1A1A2E]">{m.name}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{m.desc}</p>
                  <p className="text-xs text-gray-400">{m.countries}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* FAQ */}
        <div>
          <h2 className="text-2xl font-extrabold text-[#1A1A2E] mb-6 text-center">Questions sur les tarifs</h2>
          <div className="space-y-4">
            {faqs.map((f) => (
              <div key={f.q} className="bg-gray-50 rounded-xl p-5">
                <h3 className="font-bold text-[#1A1A2E] mb-2">{f.q}</h3>
                <p className="text-gray-600 text-sm">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
