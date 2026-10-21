"use client";
import Link from "next/link";
import { Star, MessageSquarePlus, ArrowRight } from "lucide-react";
import { useI18n } from "@/i18n";
import type { TestimonialDTO } from "@/lib/testimonials-shared";

// Grille des avis publiés, partagée par la section d'accueil et la page /temoignages.
export function TestimonialCards({ testimonials }: { testimonials: TestimonialDTO[] }) {
  const { t, tValue } = useI18n();
  const tt = t.home.testimonials;

  if (testimonials.length === 0) {
    return <p className="text-center text-gray-500 bg-white rounded-2xl p-8 shadow-sm">{tt.empty}</p>;
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {testimonials.map((item) => {
        const role = tt.roles[item.authorRole as keyof typeof tt.roles] ?? tt.roles.AUTRE;
        return (
          <div key={item.id} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col">
            <div className="flex items-center gap-1 mb-4" role="img" aria-label={tt.ratingLabel(item.rating)}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i < item.rating ? "fill-[#E87722] text-[#E87722]" : "text-gray-200"}`}
                />
              ))}
            </div>
            <p className="text-gray-600 text-sm leading-relaxed mb-6 italic whitespace-pre-line break-words flex-1">
              &quot;{item.content}&quot;
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 shrink-0 bg-[#E87722] rounded-full flex items-center justify-center text-white font-bold text-sm">
                {item.authorName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-[#1A1A2E] text-sm truncate">{item.authorName}</p>
                <p className="text-xs text-gray-400 truncate">
                  {role}
                  {item.authorCountry && ` · ${tValue(item.authorCountry)}`}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function TestimonialsSection({ testimonials }: { testimonials: TestimonialDTO[] }) {
  const { t } = useI18n();
  const tt = t.home.testimonials;
  return (
    <section className="py-20 bg-[#F5F5F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#1A1A2E] mb-4">{tt.title}</h2>
          <p className="text-gray-500 text-lg">{tt.subtitle}</p>
        </div>

        <TestimonialCards testimonials={testimonials} />

        <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/temoignages#laisser-un-avis"
            className="inline-flex items-center justify-center gap-2 bg-[#E87722] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-[#d06619] transition-colors"
          >
            <MessageSquarePlus className="w-4 h-4" /> {tt.leaveReview}
          </Link>
          {testimonials.length > 0 && (
            <Link
              href="/temoignages"
              className="inline-flex items-center justify-center gap-2 bg-white text-[#E87722] border border-[#E87722] px-6 py-2.5 rounded-xl font-semibold hover:bg-[#FFF3E0] transition-colors"
            >
              {tt.seeAll} <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
