"use client";

import Link from "next/link";
import { TestimonialCards } from "@/components/home/TestimonialsSection";
import { useI18n } from "@/i18n";

// Témoignages : `home.testimonials` ; bloc d'appel à l'action : `testimonialsPage` (src/i18n/site.ts)

export default function TemoignagesContent() {
  const { t } = useI18n();

  return (
    <div className="py-20 bg-[#F5F5F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-[#1A1A2E] mb-4">{t.home.testimonials.title}</h1>
          <p className="text-gray-500 text-lg">{t.home.testimonials.subtitle}</p>
        </div>

        <TestimonialCards />

        <div className="mt-16 bg-[#FFF3E0] rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold text-[#1A1A2E] mb-2">{t.testimonialsPage.ctaTitle}</h2>
          <p className="text-gray-500 mb-6 max-w-xl mx-auto">{t.testimonialsPage.ctaText}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/devenir-au-pair"
              className="inline-block bg-[#E87722] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-[#d06619] transition-colors"
            >
              {t.testimonialsPage.becomeAuPair}
            </Link>
            <Link
              href="/accueillir-un-au-pair"
              className="inline-block bg-white text-[#E87722] border border-[#E87722] px-6 py-2.5 rounded-xl font-semibold hover:bg-[#FFF3E0] transition-colors"
            >
              {t.testimonialsPage.hostAuPair}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
