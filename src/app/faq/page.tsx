"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useI18n } from "@/i18n";

// Questions et réponses : section `faq.categories` de src/i18n/site.ts

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
  const { t } = useI18n();
  const [activeIndex, setActiveIndex] = useState(0);
  const current = t.faq.categories[activeIndex];

  return (
    <div className="py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-[#1A1A2E] mb-4">{t.faq.title}</h1>
          <p className="text-gray-500 text-lg">{t.faq.subtitle}</p>
        </div>

        {/* Filtres catégories */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {t.faq.categories.map((c, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeIndex === i
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
          {current.items.map((item, i) => (
            <FaqItem key={`${activeIndex}-${i}`} q={item.q} a={item.a} />
          ))}
        </div>

        {/* Contact */}
        <div className="mt-12 bg-[#FFF3E0] rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold text-[#1A1A2E] mb-2">{t.faq.notFoundTitle}</h2>
          <p className="text-gray-500 mb-4">{t.faq.notFoundText}</p>
          <Link
            href="/contact"
            className="inline-block bg-[#E87722] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-[#d06619] transition-colors"
          >
            {t.faq.contactUs}
          </Link>
        </div>
      </div>
    </div>
  );
}
