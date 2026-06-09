import type { Metadata } from "next";
import { Shield, Eye, Lock, AlertTriangle, CheckCircle, UserCheck } from "lucide-react";

export const metadata: Metadata = { title: "Sécurité — AuPair A.EU" };

const standards = [
  { icon: UserCheck, title: "Vérification manuelle des profils", desc: "Chaque profil est vérifié manuellement par notre équipe avant publication : photo d'identité, cohérence des informations, détection des faux profils." },
  { icon: Eye, title: "Modération de la messagerie", desc: "Notre IA analyse les messages pour détecter les contenus inappropriés, le harcèlement et les tentatives d'arnaque." },
  { icon: Lock, title: "Données chiffrées", desc: "Toutes vos données sont chiffrées en transit (HTTPS/TLS) et au repos. Nous respectons les standards RGPD." },
  { icon: AlertTriangle, title: "Signalement & suspension", desc: "Chaque utilisateur peut signaler un profil ou un message. Les comptes signalés sont examinés sous 24h." },
  { icon: Shield, title: "Paiements sécurisés", desc: "Les paiements sont traités par Stripe (PCI DSS Level 1) et CinetPay. Aucune donnée bancaire n'est stockée sur nos serveurs." },
  { icon: CheckCircle, title: "Conformité RGPD", desc: "Vous avez le droit d'accéder, modifier ou supprimer vos données à tout moment. Contactez rgpd@aupair-aeu.com." },
];

export default function SecuritePage() {
  return (
    <div className="py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-[#E87722] rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-[#1A1A2E] mb-3">Votre sécurité, notre priorité</h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">AuPair A.EU met tout en œuvre pour garantir un environnement sûr pour les au pairs et les familles.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {standards.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.title} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#FFF3E0] rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-[#E87722]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1A1A2E] mb-2">{s.title}</h3>
                    <p className="text-gray-500 text-sm">{s.desc}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 bg-[#1A1A2E] rounded-2xl p-6 text-center">
          <p className="text-white font-semibold mb-1">Vous avez constaté un problème de sécurité ?</p>
          <p className="text-gray-400 text-sm mb-4">Contactez immédiatement notre équipe de sécurité.</p>
          <a href="mailto:securite@aupair-aeu.com" className="bg-[#E87722] text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-[#d06619] transition-colors inline-block">
            securite@aupair-aeu.com
          </a>
        </div>
      </div>
    </div>
  );
}
