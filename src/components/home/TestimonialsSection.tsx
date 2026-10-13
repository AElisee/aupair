"use client";
import { Star, ArrowRight } from "lucide-react";
import { CountryFlag } from "@/components/ui/CountryFlag";
import { useI18n } from "@/i18n";

// Rôle et texte de chaque témoignage : `home.testimonials.items` (src/i18n/site.ts), dans le même ordre.
const testimonials = [
  { name: "Aminata K.", flags: ["🇨🇲", "🇫🇷"], rating: 5 },
  { name: "Famille Dumont", flags: ["🇩🇪"], rating: 5 },
  { name: "Kofi M.", flags: ["🇬🇭", "🇧🇪"], rating: 5 },
];

export default function TestimonialsSection() {
  const { t } = useI18n();
  return (
    <section className="py-20 bg-[#F5F5F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#1A1A2E] mb-4">{t.home.testimonials.title}</h2>
          <p className="text-gray-500 text-lg">{t.home.testimonials.subtitle}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((item, index) => {
            const text = t.home.testimonials.items[index];
            return (
              <div key={item.name} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: item.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#E87722] text-[#E87722]" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-6 italic">&quot;{text.content}&quot;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#E87722] rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {item.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-[#1A1A2E] text-sm">{item.name}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        {item.flags.map((flag, i) => (
                          <span key={i} className="flex items-center gap-1">
                            {i > 0 && <ArrowRight className="w-3 h-3" />}
                            <CountryFlag flag={flag} className="h-3 w-auto rounded-sm" />
                          </span>
                        ))}
                      </span>
                      <span>{text.role}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
