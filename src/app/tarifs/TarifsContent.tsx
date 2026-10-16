"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, Smartphone, ArrowRight, ChevronDown, ShieldCheck } from "lucide-react";
import { CountryFlag } from "@/components/ui/CountryFlag";
import { useI18n } from "@/i18n";

const PAYMENT_COUNTRY_FLAGS = ["🇧🇯", "🇹🇬", "🇨🇮", "🇳🇪", "🇸🇳"];
const PAYMENT_OPERATORS = ["MTN", "Moov", "Celtiis", "Mixx by Yas", "Airtel", "Visa / Mastercard"];

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="text-center mb-6 sm:mb-8">
      <h2 className="text-xl sm:text-2xl font-semibold text-[#1A1A2E]">{title}</h2>
      {subtitle && <p className="text-sm text-gray-500 mt-1.5 max-w-xl mx-auto">{subtitle}</p>}
    </div>
  );
}

function FeatureList({ items, color }: { items: readonly string[]; color: string }) {
  return (
    <ul className="space-y-2.5">
      {items.map((f) => (
        <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600">
          <span
            className="mt-0.5 w-4 h-4 shrink-0 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${color}26` }}
          >
            <Check className="w-3 h-3" style={{ color }} strokeWidth={2.25} />
          </span>
          {f}
        </li>
      ))}
    </ul>
  );
}

export default function TarifsContent({ priceEur, priceXof, days }: { priceEur: number; priceXof: number; days: number }) {
  const { t, locale } = useI18n();
  const p = t.pricing;
  const xof = priceXof.toLocaleString(locale);

  return (
    <div>
      {/* ─── Hero ─────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1A1A2E 0%, #16213e 50%, #0f3460 100%)" }}
      >
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#E87722] opacity-15 rounded-full blur-3xl" />
        <div className="relative max-w-3xl mx-auto px-4 pt-10 pb-24 sm:pt-14 sm:pb-28 text-center">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-white leading-tight">{p.title}</h1>
          <p className="text-gray-300 text-sm sm:text-base mt-3 max-w-xl mx-auto">{p.subtitle}</p>
        </div>
      </section>

      {/* ─── Offres ───────────────────────────────────────────────────── */}
      <section className="bg-[#F5F5F5] pb-10 sm:pb-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 sm:-mt-20 relative">
          <div className="grid md:grid-cols-2 gap-4 sm:gap-5">
            {/* Au pair */}
            <div className="flex flex-col bg-white rounded-2xl border border-[#E87722]/40 shadow-sm p-5 sm:p-7 ring-1 ring-[#E87722]/10">
              <span className="self-start rounded-full bg-[#FFF3E0] px-3 py-1 text-[11px] font-medium tracking-wide text-[#E87722]">
                {p.forAuPairs}
              </span>
              <div className="mt-5 flex items-baseline gap-1.5">
                <span className="text-4xl sm:text-5xl font-semibold text-[#1A1A2E] tracking-tight">{priceEur}€</span>
                <span className="text-sm text-gray-400">/ {p.forDays(days)}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">≈ {xof} FCFA</p>
              <div className="my-5 h-px bg-gray-100" />
              <FeatureList items={p.auPairFeatures} color="#E87722" />
              <Link href="/inscription?role=au-pair" className="mt-6 pt-1 md:mt-auto md:pt-6">
                <Button className="w-full font-medium shadow-none">
                  {p.signUpAuPair} <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            {/* Famille */}
            <div className="flex flex-col bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-7">
              <span className="self-start rounded-full bg-[#1A1A2E]/5 px-3 py-1 text-[11px] font-medium tracking-wide text-[#1A1A2E]">
                {p.forFamilies}
              </span>
              <div className="mt-5 flex items-baseline gap-1.5">
                <span className="text-4xl sm:text-5xl font-semibold text-[#1A1A2E] tracking-tight">0€</span>
                <span className="text-sm text-gray-400">/ {p.unlimitedAccess}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">{p.freeSignup}</p>
              <div className="my-5 h-px bg-gray-100" />
              <FeatureList items={p.familyFeatures} color="#3FA45B" />
              <Link href="/inscription?role=famille" className="mt-6 pt-1 md:mt-auto md:pt-6">
                <Button variant="secondary" className="w-full font-medium">
                  {p.signUpFamily} <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Moyens de paiement ───────────────────────────────────────── */}
      <section className="py-10 sm:py-14 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title={p.paymentTitle} />
          <div className="rounded-2xl border border-gray-100 bg-[#FFF3E0]/60 p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-[#E87722] flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-white" strokeWidth={1.75} />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm sm:text-[15px] font-medium text-[#1A1A2E]">{p.paymentName}</h3>
                <p className="text-[13px] text-gray-500">{xof} FCFA</p>
              </div>
              <div className="ml-auto hidden sm:flex items-center gap-1.5">
                {PAYMENT_COUNTRY_FLAGS.map((flag) => (
                  <CountryFlag key={flag} flag={flag} className="h-3.5 w-auto rounded-[2px]" />
                ))}
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {PAYMENT_OPERATORS.map((op) => (
                <span
                  key={op}
                  className="rounded-full border border-gray-200 bg-white px-3 py-1 text-[13px] text-[#1A1A2E]"
                >
                  {op}
                </span>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
              <p className="flex items-center gap-1.5 text-[13px] text-gray-500 min-w-0">
                <ShieldCheck className="w-4 h-4 shrink-0 text-[#3FA45B]" strokeWidth={1.75} />
                {p.paymentSecure}
              </p>
              <div className="flex sm:hidden shrink-0 items-center gap-1.5">
                {PAYMENT_COUNTRY_FLAGS.map((flag) => (
                  <CountryFlag key={flag} flag={flag} className="h-3.5 w-auto rounded-[2px]" />
                ))}
              </div>
            </div>
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
    </div>
  );
}
