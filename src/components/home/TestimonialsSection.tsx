import { Star } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Aminata K.",
    role: "Au pair camerounaise en France",
    country: "🇨🇲→🇫🇷",
    content: "AuPair A.EU m'a permis de trouver une famille formidable à Lyon en seulement 2 semaines. Le processus était simple et l'équipe très réactive. Je recommande à toutes mes sœurs africaines !",
    rating: 5,
  },
  {
    id: 2,
    name: "Famille Dumont",
    role: "Famille d'accueil en Allemagne",
    country: "🇩🇪",
    content: "Nous avons trouvé notre au pair ivoirienne via cette plateforme. Elle est fantastique avec nos enfants, parle un français impeccable et s'est intégrée parfaitement à notre famille.",
    rating: 5,
  },
  {
    id: 3,
    name: "Kofi M.",
    role: "Au pair ghanéen en Belgique",
    country: "🇬🇭→🇧🇪",
    content: "Grâce à AuPair A.EU, j'ai réalisé mon rêve de vivre en Europe. La plateforme est sérieuse, les profils sont vérifiés, et la messagerie est très pratique pour communiquer avec les familles.",
    rating: 5,
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 bg-[#F5F5F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#1A1A2E] mb-4">
            Voici ce qu'ils disent de nous
          </h2>
          <p className="text-gray-500 text-lg">Des témoignages authentiques de notre communauté</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.id} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#E87722] text-[#E87722]" />
                ))}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-6 italic">"{t.content}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#E87722] rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-[#1A1A2E] text-sm">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.country} {t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
