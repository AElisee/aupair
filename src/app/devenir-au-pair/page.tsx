import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle, Globe, Heart, DollarSign, Home, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Devenir au pair en Europe — AuPair A.EU",
  description: "Découvrez comment devenir au pair en Europe depuis l'Afrique. Programme, conditions, processus d'inscription et avantages.",
};

const advantages = [
  { icon: Globe, title: "Expérience internationale", desc: "Vivez dans une famille européenne et découvrez une nouvelle culture au quotidien." },
  { icon: Heart, title: "Apprentissage linguistique", desc: "Améliorez votre français, anglais ou allemand en immersion totale." },
  { icon: DollarSign, title: "Argent de poche garanti", desc: "Recevez un argent de poche mensuel en plus du logement et des repas." },
  { icon: Home, title: "Logement & repas inclus", desc: "Logé(e) et nourri(e) par votre famille d'accueil durant tout votre séjour." },
];

const conditions = [
  "Âge : 18 à 30 ans",
  "Expérience avec les enfants (garde, baby-sitting)",
  "Niveau de langue suffisant (français ou anglais)",
  "Casier judiciaire vierge",
  "Bonne santé physique et mentale",
  "Motivé(e) et ouvert(e) à une nouvelle culture",
];

const steps = [
  { step: "1", title: "Créez votre profil", desc: "Inscription gratuite, téléchargez vos photos et remplissez votre profil complet." },
  { step: "2", title: "Souscrivez à l'abonnement", desc: "Activez votre profil pour 30 jours à 32€ et devenez visible par toutes les familles." },
  { step: "3", title: "Contactez les familles", desc: "Parcourez les profils, envoyez des messages et organisez votre départ !" },
];

const originCountries = [
  { name: "Cameroun", flag: "🇨🇲" }, { name: "Côte d'Ivoire", flag: "🇨🇮" },
  { name: "Sénégal", flag: "🇸🇳" }, { name: "Mali", flag: "🇲🇱" },
  { name: "Bénin", flag: "🇧🇯" }, { name: "Togo", flag: "🇹🇬" },
  { name: "Madagascar", flag: "🇲🇬" }, { name: "Ghana", flag: "🇬🇭" },
  { name: "Gabon", flag: "🇬🇦" }, { name: "Congo", flag: "🇨🇬" },
  { name: "Burkina Faso", flag: "🇧🇫" }, { name: "Maroc", flag: "🇲🇦" },
];

const faqs = [
  { q: "Combien coûte l'abonnement au pair ?", a: "L'abonnement pour les au pairs est de 32€ (ou 20 800 FCFA) pour 30 jours. Les familles s'inscrivent gratuitement." },
  { q: "Mes profil est-il visible immédiatement ?", a: "Non. Chaque profil est vérifié manuellement par notre équipe avant d'être publié, pour garantir la qualité et la sécurité." },
  { q: "Quels pays d'accueil sont disponibles ?", a: "France, Allemagne, Belgique, Luxembourg, Suisse et États-Unis. D'autres pays seront ajoutés prochainement." },
];

export default function DevenirAuPairPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-[#E87722] py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            Devenez au pair en Europe
          </h1>
          <p className="text-white/90 text-xl mb-8 max-w-2xl mx-auto">
            AuPair A.EU est la première plateforme mondiale dédiée aux jeunes africains qui souhaitent vivre une expérience au pair inoubliable.
          </p>
          <Link href="/inscription?role=au-pair">
            <Button size="lg" className="bg-white text-[#E87722] hover:bg-gray-100 px-8 text-base font-bold">
              Créer mon profil gratuitement <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Avantages */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-[#1A1A2E] mb-3">Pourquoi devenir au pair ?</h2>
            <p className="text-gray-500">Une expérience qui change une vie</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {advantages.map((a) => {
              const Icon = a.icon;
              return (
                <div key={a.title} className="bg-[#FFF3E0] rounded-2xl p-6 text-center">
                  <div className="w-14 h-14 bg-[#E87722] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-bold text-[#1A1A2E] mb-2">{a.title}</h3>
                  <p className="text-gray-500 text-sm">{a.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Conditions */}
      <section className="py-20 bg-[#F5F5F5]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-[#1A1A2E] mb-3">Qui peut devenir au pair ?</h2>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <div className="grid sm:grid-cols-2 gap-4">
              {conditions.map((c) => (
                <div key={c} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-[#E87722] flex-shrink-0" />
                  <span className="text-gray-700">{c}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Processus */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-[#1A1A2E] mb-3">Comment s'inscrire ?</h2>
            <p className="text-gray-500">3 étapes simples pour commencer votre aventure</p>
          </div>
          <div className="relative">
            <div className="hidden md:block absolute left-1/2 top-8 w-0.5 h-full bg-[#E87722]/20 -translate-x-1/2" />
            <div className="space-y-8">
              {steps.map((s) => (
                <div key={s.step} className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  <div className="flex-shrink-0 w-16 h-16 bg-[#E87722] rounded-full flex items-center justify-center text-white text-2xl font-extrabold shadow-lg">
                    {s.step}
                  </div>
                  <div className="bg-[#FFF3E0] rounded-xl p-5 flex-1">
                    <h3 className="font-bold text-[#1A1A2E] text-lg mb-1">{s.title}</h3>
                    <p className="text-gray-500">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pays d'origine */}
      <section className="py-20 bg-[#F5F5F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-[#1A1A2E] mb-3">Vous venez d'un de ces pays ?</h2>
            <p className="text-gray-500">AuPair A.EU vous accompagne depuis toute l'Afrique</p>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {originCountries.map((c) => (
              <div key={c.name} className="bg-white rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="text-3xl mb-2">{c.flag}</div>
                <div className="text-sm font-medium text-[#1A1A2E]">{c.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-[#1A1A2E] mb-3">Questions fréquentes</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((f) => (
              <div key={f.q} className="bg-[#FFF3E0] rounded-xl p-6">
                <h3 className="font-bold text-[#1A1A2E] mb-2">{f.q}</h3>
                <p className="text-gray-600 text-sm">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-16 bg-[#1A1A2E]">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-4">Prêt(e) à vous lancer ?</h2>
          <p className="text-gray-400 mb-8">Créez votre profil gratuitement et commencez à explorer les familles d'accueil dès aujourd'hui.</p>
          <Link href="/inscription?role=au-pair">
            <Button size="lg" className="px-10">
              Créer mon profil au pair <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
