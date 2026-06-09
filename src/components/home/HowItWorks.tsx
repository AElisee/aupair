import { UserPlus, Search, MessageCircle, Home, Star } from "lucide-react";

const auPairSteps = [
  { icon: UserPlus, step: "1", title: "Créez votre profil", desc: "Inscription gratuite en quelques minutes. Téléchargez votre photo et remplissez votre profil." },
  { icon: Search, step: "2", title: "Trouvez votre famille", desc: "Parcourez les profils de familles et contactez celles qui vous correspondent." },
  { icon: MessageCircle, step: "3", title: "Échangez & partez", desc: "Discutez directement avec la famille, organisez votre séjour et lancez-vous !" },
];

const familySteps = [
  { icon: Home, step: "1", title: "Inscription gratuite", desc: "Créez votre profil famille gratuitement en quelques minutes." },
  { icon: Search, step: "2", title: "Parcourez les au pairs", desc: "Filtrez par pays, langue, expérience et trouvez le profil idéal." },
  { icon: Star, step: "3", title: "Accueillez votre au pair", desc: "Contactez et accueillez votre au pair africain qualifié et motivé." },
];

export default function HowItWorks() {
  return (
    <section className="py-20 bg-[#F5F5F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#1A1A2E] mb-4">
            Comment ça marche ?
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            AuPair A.EU, c'est simple. Que vous soyez au pair ou famille d'accueil, tout commence ici.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Au pairs */}
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-[#E87722] rounded-full flex items-center justify-center">
                <span className="text-white font-bold">AP</span>
              </div>
              <h3 className="text-xl font-bold text-[#1A1A2E]">Pour les au pairs</h3>
            </div>
            <div className="space-y-6">
              {auPairSteps.map((step) => {
                const Icon = step.icon;
                return (
                  <div key={step.step} className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-[#FFF3E0] rounded-full flex items-center justify-center">
                      <Icon className="w-5 h-5 text-[#E87722]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#1A1A2E] mb-1">
                        <span className="text-[#E87722] mr-2">{step.step}.</span>{step.title}
                      </h4>
                      <p className="text-gray-500 text-sm">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Familles */}
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-[#1A1A2E] rounded-full flex items-center justify-center">
                <span className="text-white font-bold">FA</span>
              </div>
              <h3 className="text-xl font-bold text-[#1A1A2E]">Pour les familles</h3>
            </div>
            <div className="space-y-6">
              {familySteps.map((step) => {
                const Icon = step.icon;
                return (
                  <div key={step.step} className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-[#F5F5F5] rounded-full flex items-center justify-center">
                      <Icon className="w-5 h-5 text-[#1A1A2E]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#1A1A2E] mb-1">
                        <span className="text-[#E87722] mr-2">{step.step}.</span>{step.title}
                      </h4>
                      <p className="text-gray-500 text-sm">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
