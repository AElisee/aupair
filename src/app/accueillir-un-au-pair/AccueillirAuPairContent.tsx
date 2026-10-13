"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, CheckCircle, Users, Globe, Heart, Zap } from "lucide-react";
import { CountryFlag } from "@/components/ui/CountryFlag";
import { useI18n } from "@/i18n";

// Icônes des arguments, dans le même ordre que `hostAuPair.reasons` (src/i18n/site.ts)
const reasonIcons = [Zap, Globe, Heart, Users];

export default function AccueillirAuPairContent() {
  const { t } = useI18n();
  const p = t.hostAuPair;

  return (
    <div>
      {/* Hero */}
      <section style={{ background: "linear-gradient(135deg, #1A1A2E 0%, #0f3460 100%)" }} className="py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            {p.heroTitleStart} <span className="text-[#E87722]">{p.heroTitleHighlight}</span>
          </h1>
          <p className="text-gray-300 text-xl mb-8 max-w-2xl mx-auto">{p.heroSubtitle}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/inscription?role=famille">
              <Button size="lg" className="px-8 text-base font-bold">
                {p.ctaFree} <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/trouver-au-pair">
              <Button variant="outline" size="lg" className="px-8 text-base border-white text-white hover:bg-white hover:text-[#1A1A2E]">
                {p.seeProfiles}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Pourquoi un au pair africain */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-[#1A1A2E] mb-3">{p.whyTitle}</h2>
            <p className="text-gray-500 max-w-xl mx-auto">{p.whySubtitle}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {p.reasons.map((r, i) => {
              const Icon = reasonIcons[i];
              return (
                <div key={i} className="border border-gray-100 rounded-2xl p-6 hover:border-[#E87722] hover:shadow-md transition-all">
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
            <h2 className="text-3xl font-extrabold text-[#1A1A2E] mb-3">{p.tasksTitle}</h2>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-sm grid sm:grid-cols-2 gap-4">
            {p.tasks.map((task) => (
              <div key={task} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-[#E87722] flex-shrink-0" />
                <span className="text-gray-700">{task}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Inscription gratuite */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-[#1A1A2E] mb-3">{p.freeTitle}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {p.steps.map((s, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 bg-[#E87722] rounded-full flex items-center justify-center text-white text-2xl font-extrabold mx-auto mb-4 shadow-lg">
                  {i + 1}
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
            {[1, 2, 3, 4, 5].map((i) => <Star key={i} className="w-5 h-5 fill-[#E87722] text-[#E87722]" />)}
          </div>
          <p className="text-[#1A1A2E] text-lg italic mb-6">{p.testimonial}</p>
          <p className="font-bold text-[#E87722] inline-flex items-center gap-2">
            {p.testimonialAuthor} <CountryFlag flag="🇫🇷" className="h-4 w-auto rounded-sm" />
          </p>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-16 bg-[#E87722]">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-4">{p.finalTitle}</h2>
          <p className="text-white/90 mb-8">{p.finalSubtitle}</p>
          <Link href="/inscription?role=famille">
            <Button size="lg" className="bg-white text-[#E87722] hover:bg-gray-100 px-10 font-bold">
              {p.ctaFree}
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
