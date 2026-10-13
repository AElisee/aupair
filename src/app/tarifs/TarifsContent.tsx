"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle, Smartphone, ArrowRight } from "lucide-react";
import { CountryFlag } from "@/components/ui/CountryFlag";
import { useI18n } from "@/i18n";

const PAYMENT_COUNTRY_FLAGS = ["🇧🇯", "🇹🇬", "🇨🇮", "🇳🇪", "🇸🇳"];

export default function TarifsContent({ priceEur, priceXof, days }: { priceEur: number; priceXof: number; days: number }) {
  const { t, locale } = useI18n();
  const p = t.pricing;
  const xof = priceXof.toLocaleString(locale);

  return (
    <div className="py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-[#1A1A2E] mb-4">{p.title}</h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">{p.subtitle}</p>
        </div>

        {/* Cards tarifaires */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Au pair */}
          <div className="border-2 border-[#E87722] rounded-2xl p-8 relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="bg-[#E87722] text-white text-xs font-bold px-4 py-1.5 rounded-full whitespace-nowrap">{p.forAuPairs}</span>
            </div>
            <div className="text-center mb-8">
              <div className="text-5xl font-extrabold text-[#1A1A2E] mb-1">{priceEur}€</div>
              <div className="text-gray-500">= {xof} FCFA</div>
              <div className="text-sm text-gray-400 mt-1">{p.forDays(days)}</div>
            </div>
            <ul className="space-y-3 mb-8">
              {p.auPairFeatures.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-[#E87722] flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/inscription?role=au-pair">
              <Button className="w-full" size="lg">{p.signUpAuPair} <ArrowRight className="w-4 h-4" /></Button>
            </Link>
          </div>

          {/* Famille */}
          <div className="border border-gray-200 rounded-2xl p-8 relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="bg-[#1A1A2E] text-white text-xs font-bold px-4 py-1.5 rounded-full whitespace-nowrap">{p.forFamilies}</span>
            </div>
            <div className="text-center mb-8">
              <div className="text-5xl font-extrabold text-[#1A1A2E] mb-1">0€</div>
              <div className="text-gray-500">{p.freeSignup}</div>
              <div className="text-sm text-gray-400 mt-1">{p.unlimitedAccess}</div>
            </div>
            <ul className="space-y-3 mb-8">
              {p.familyFeatures.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/inscription?role=famille">
              <Button variant="secondary" className="w-full" size="lg">{p.signUpFamily} <ArrowRight className="w-4 h-4" /></Button>
            </Link>
          </div>
        </div>

        {/* Moyens de paiement */}
        <div className="mb-16">
          <h2 className="text-2xl font-extrabold text-[#1A1A2E] mb-6 text-center">{p.paymentTitle}</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-[#FFF3E0] rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-[#E87722] rounded-full flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-[#1A1A2E]">{p.paymentName}</h3>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                MTN, Moov, Celtiis, Mixx by Yas, Airtel, Visa/Mastercard — {xof} FCFA
              </p>
              <div className="flex items-center gap-1.5">
                {PAYMENT_COUNTRY_FLAGS.map((flag) => (
                  <CountryFlag key={flag} flag={flag} className="h-3.5 w-auto rounded-sm" />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div>
          <h2 className="text-2xl font-extrabold text-[#1A1A2E] mb-6 text-center">{p.faqTitle}</h2>
          <div className="space-y-4">
            {p.faqs.map((f, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-5">
                <h3 className="font-bold text-[#1A1A2E] mb-2">{f.q}</h3>
                <p className="text-gray-600 text-sm">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
