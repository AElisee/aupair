"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Shield, Globe, Users, CheckCircle } from "lucide-react";
import { useLang } from "@/contexts/LanguageContext";

interface HeroSectionProps {
  heroImageUrl?: string;
}

export default function HeroSection({ heroImageUrl }: HeroSectionProps) {
  const { t } = useLang();

  return (
    <section className="relative min-h-[600px] flex items-center overflow-hidden" style={{ background: "linear-gradient(135deg, #1A1A2E 0%, #16213e 50%, #0f3460 100%)" }}>
      {heroImageUrl && (
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={heroImageUrl} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A2E] via-[#1A1A2E]/80 to-[#1A1A2E]/30" />
        </div>
      )}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#E87722] opacity-10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#E87722] opacity-5 rounded-full blur-2xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        {/* Badge top */}
        <div className="inline-flex items-center gap-2 bg-[#E87722]/20 text-[#E87722] text-sm font-medium px-4 py-2 rounded-full mb-6 border border-[#E87722]/30">
          <Globe className="w-4 h-4" />
          {t(
            "Première plateforme mondiale dédiée aux au pairs africains",
            "The first global platform dedicated to African au pairs"
          )}
        </div>

        {/* Titre */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
          {t("Trouvez un", "Find an")}{" "}
          <span style={{ color: "#E87722" }}>{t("au pair africain", "African au pair")}</span>
          <br />
          {t("ou une famille d'accueil", "or a host family")}
        </h1>

        <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
          {t(
            "Simple, direct et en toute sécurité. Connectez-vous avec des jeunes africains qualifiés et des familles en Europe et en Amérique.",
            "Simple, direct and safe. Connect with qualified African youth and families in Europe and America."
          )}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
          <Link href="/trouver-famille">
            <Button size="lg" className="whitespace-normal text-center text-base px-6 sm:px-8 py-6 sm:text-lg shadow-lg shadow-[#E87722]/30">
              🏡 {t("Trouver une famille d'accueil", "Find a host family")}
            </Button>
          </Link>
          <Link href="/trouver-au-pair">
            <Button variant="outline" size="lg" className="whitespace-normal text-center text-base px-6 sm:px-8 py-6 sm:text-lg border-white text-white hover:bg-white hover:text-[#1A1A2E]">
              👤 {t("Trouver un au pair", "Find an au pair")}
            </Button>
          </Link>
        </div>

        {/* Badges réassurance */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-gray-300">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-[#E87722]" />
            <span className="text-sm font-medium">{t("14 pays africains", "14 African countries")}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#E87722]" />
            <span className="text-sm font-medium">{t("6 pays d'accueil", "6 host countries")}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-[#E87722]" />
            <span className="text-sm font-medium">{t("Profils vérifiés", "Verified profiles")}</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#E87722]" />
            <span className="text-sm font-medium">{t("Paiement sécurisé", "Secure payment")}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
