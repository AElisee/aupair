import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, CheckCircle, Users, Globe, Heart, Zap } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Accueillir un au pair africain — AuPair A.EU",
  description: "Trouvez un au pair africain qualifié, motivé et bilingue pour votre famille. Inscription famille gratuite sur AuPair A.EU.",
};

const reasons = [
  { icon: Zap, title: "Dynamique & motivé(e)", desc: "Les au pairs africains arrivent avec une énergie et une motivation exceptionnelles pour cette expérience." },
  { icon: Globe, title: "Bilingue FR/EN", desc: "La majorité vient de pays francophones ou anglophones, parfait pour votre famille." },
  { icon: Heart, title: "Culturellement riche", desc: "Une rencontre culturelle unique qui enrichira toute votre famille, adultes et enfants." },
  { icon: Users, title: "Expérience avec les enfants", desc: "Tous nos au pairs ont une expérience préalable en garde d'enfants, vérifiée par notre équipe." },
];

const tasks = [
  "Garde et accompagnement des enfants", "Aide aux devoirs", "Activités ludiques et créatives",
  "Sorties et activités sportives", "Légères tâches ménagères liées aux enfants", "Préparation des repas des enfants",
];

const steps = [
  { step: "1", title: "Inscription gratuite", desc: "Créez votre profil famille en quelques minutes. C'est entièrement gratuit." },
  { step: "2", title: "Parcourez les au pairs", desc: "Filtrez par pays, langue, expérience et trouvez les profils qui vous correspondent." },
  { step: "3", title: "Contactez & accueillez", desc: "Échangez directement avec les au pairs qui vous intéressent et organisez leur venue." },
];

export default function AccueillirAuPairPage() {
  return (
    <div>
      {/* Hero */}
      <section style={{ background: "linear-gradient(135deg, #1A1A2E 0%, #0f3460 100%)" }} className="py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            Accueillez un au pair <span className="text-[#E87722]">africain</span>
          </h1>
          <p className="text-gray-300 text-xl mb-8 max-w-2xl mx-auto">
            Inscription famille 100% gratuite. Trouvez le profil idéal parmi nos au pairs africains vérifiés et motivés.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/inscription?role=famille">
              <Button size="lg" className="px-8 text-base font-bold">
                Créer mon profil famille — Gratuit <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/trouver-au-pair">
              <Button variant="outline" size="lg" className="px-8 text-base border-white text-white hover:bg-white hover:text-[#1A1A2E]">
                Voir les profils
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Pourquoi un au pair africain */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-[#1A1A2E] mb-3">Pourquoi choisir un au pair africain ?</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Des jeunes qualifiés, vérifiés, et surtout profondément motivés par cette expérience.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {reasons.map((r) => {
              const Icon = r.icon;
              return (
                <div key={r.title} className="border border-gray-100 rounded-2xl p-6 hover:border-[#E87722] hover:shadow-md transition-all">
                  <div className="w-12 h-12 bg-[#FFF3E0] rounded-full flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-[#E87722]" />
                  </div>
                  <h3 className="font-bold text-[#1A1A2E] mb-2">{r.title}</h3>
                  <p className="text-gray-500 text-sm">{r.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tâches */}
      <section className="py-20 bg-[#F5F5F5]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-[#1A1A2E] mb-3">Que fait un au pair ?</h2>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-sm grid sm:grid-cols-2 gap-4">
            {tasks.map((t) => (
              <div key={t} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-[#E87722] flex-shrink-0" />
                <span className="text-gray-700">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Inscription gratuite */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-[#1A1A2E] mb-3">Inscription famille — 100% gratuite</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-16 h-16 bg-[#E87722] rounded-full flex items-center justify-center text-white text-2xl font-extrabold mx-auto mb-4 shadow-lg">
                  {s.step}
                </div>
                <h3 className="font-bold text-[#1A1A2E] text-lg mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Témoignage */}
      <section className="py-16 bg-[#FFF3E0]">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="flex justify-center gap-1 mb-4">
            {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 fill-[#E87722] text-[#E87722]" />)}
          </div>
          <p className="text-[#1A1A2E] text-lg italic mb-6">
            "Nous avons trouvé notre au pair camerounaise via AuPair A.EU. Elle est formidable avec nos enfants, ponctuelle, et s'est parfaitement intégrée. Une expérience magnifique pour toute la famille !"
          </p>
          <p className="font-bold text-[#E87722]">Famille Martin — Lyon, France 🇫🇷</p>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-16 bg-[#E87722]">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-4">Commencez votre recherche aujourd'hui</h2>
          <p className="text-white/90 mb-8">Inscription gratuite. Accès immédiat aux profils d'au pairs africains vérifiés.</p>
          <Link href="/inscription?role=famille">
            <Button size="lg" className="bg-white text-[#E87722] hover:bg-gray-100 px-10 font-bold">
              Créer mon profil famille — Gratuit
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
