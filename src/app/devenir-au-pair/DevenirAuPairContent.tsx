"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, Globe, Heart, DollarSign, Home, ArrowRight, ChevronDown } from "lucide-react";
import { CountryFlag } from "@/components/ui/CountryFlag";
import { useI18n } from "@/i18n";

// Icônes des avantages, dans le même ordre que `becomeAuPair.advantages` (src/i18n/site.ts)
const advantageIcons = [Globe, Heart, DollarSign, Home];

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="text-center mb-6 sm:mb-8">
      <h2 className="text-xl sm:text-2xl font-bold text-[#1A1A2E]">{title}</h2>
      {subtitle && <p className="text-sm text-gray-500 mt-1.5 max-w-xl mx-auto">{subtitle}</p>}
    </div>
  );
}

export default function DevenirAuPairContent({ originCountries }: { originCountries: { name: string; flag: string }[] }) {
  const { t, tValue } = useI18n();
  const p = t.becomeAuPair;

  return (
    <div>
      {/* ─── Hero ─────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1A1A2E 0%, #16213e 50%, #0f3460 100%)" }}
      >
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#E87722] opacity-15 rounded-full blur-3xl" />
        <div className="relative max-w-3xl mx-auto px-4 py-10 sm:py-14 text-center">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">{p.heroTitle}</h1>
          <p className="text-gray-300 text-sm sm:text-base mt-3 max-w-xl mx-auto">{p.heroSubtitle}</p>
          <Link href="/inscription?role=au-pair" className="inline-block mt-6">
            <Button className="px-5">
              {p.heroCta} <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ─── Avantages ────────────────────────────────────────────────── */}
      <section className="py-10 sm:py-14 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title={p.whyTitle} subtitle={p.whySubtitle} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {p.advantages.map((a, i) => {
              const Icon = advantageIcons[i];
              return (
                <div key={i} className="flex gap-3 rounded-xl border border-gray-100 bg-[#FFF3E0]/60 p-4">
                  <div className="w-9 h-9 shrink-0 rounded-lg bg-[#E87722] flex items-center justify-center">
                    <Icon className="w-[18px] h-[18px] text-white" strokeWidth={1.75} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-[#1A1A2E]">{a.title}</h3>
                    <p className="text-[13px] text-gray-500 mt-0.5 leading-snug">{a.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Conditions + Processus ───────────────────────────────────── */}
      <section className="py-10 sm:py-14 bg-[#F5F5F5]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-6 lg:gap-8">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#1A1A2E] mb-4">{p.whoTitle}</h2>
            <ul className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5 space-y-2.5">
              {p.conditions.map((c) => (
                <li key={c} className="flex items-start gap-2.5 text-sm text-gray-700">
                  <span className="mt-0.5 w-4 h-4 shrink-0 rounded-full bg-[#E87722]/15 flex items-center justify-center">
                    <Check className="w-3 h-3 text-[#E87722]" strokeWidth={2.5} />
                  </span>
                  {c}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#1A1A2E]">{p.howTitle}</h2>
            <p className="text-sm text-gray-500 mt-1 mb-4">{p.howSubtitle}</p>
            <ol className="relative space-y-3">
              {p.steps.map((s, i) => (
                <li key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className="w-7 h-7 shrink-0 rounded-full bg-[#E87722] text-white text-xs font-semibold flex items-center justify-center">
                      {i + 1}
                    </span>
                    {i < p.steps.length - 1 && <span className="w-px flex-1 bg-[#E87722]/25 mt-1" />}
                  </div>
                  <div className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex-1">
                    <h3 className="text-sm font-semibold text-[#1A1A2E]">{s.title}</h3>
                    <p className="text-[13px] text-gray-500 mt-0.5 leading-snug">{s.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ─── Pays d'origine ───────────────────────────────────────────── */}
      <section className="py-10 sm:py-14 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title={p.countriesTitle} subtitle={p.countriesSubtitle} />
          <div className="flex flex-wrap justify-center gap-2">
            {originCountries.map((c) => (
              <span
                key={c.name}
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[13px] font-medium text-[#1A1A2E]"
              >
                <CountryFlag flag={c.flag} className="h-3.5 w-auto rounded-[2px]" />
                {tValue(c.name)}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ──────────────────────────────────────────────────────── */}
      <section className="py-10 sm:py-14 bg-[#F5F5F5]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title={p.faqTitle} />
          <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-100">
            {p.faqs.map((f, i) => (
              <details key={i} className="group px-4 sm:px-5" open={i === 0}>
                <summary className="flex items-center justify-between gap-3 py-3.5 cursor-pointer list-none text-sm font-medium text-[#1A1A2E] [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <ChevronDown className="w-4 h-4 shrink-0 text-gray-400 transition-transform group-open:rotate-180" />
                </summary>
                <p className="pb-4 -mt-1 text-[13px] text-gray-600 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA final ────────────────────────────────────────────────── */}
      <section className="py-10 sm:py-12 bg-[#1A1A2E]">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-white">{p.finalTitle}</h2>
          <p className="text-sm text-gray-400 mt-2 mb-6">{p.finalSubtitle}</p>
          <Link href="/inscription?role=au-pair" className="inline-block">
            <Button className="px-5">
              {p.finalCta} <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
