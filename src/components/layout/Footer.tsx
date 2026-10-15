"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Instagram, Facebook, Linkedin, Youtube } from "lucide-react";
import { useI18n } from "@/i18n";

const aboutLinks = [
  { href: "/devenir-au-pair", key: "becomeAuPair" },
  { href: "/accueillir-un-au-pair", key: "hostAuPair" },
  { href: "/tarifs", key: "pricing" },
  { href: "/temoignages", key: "testimonials" },
  { href: "/blog", key: "blog" },
  { href: "/faq", key: "faq" },
  { href: "/contact", key: "contact" },
] as const;
const legalLinks = [
  { href: "/cgu", key: "terms" },
  { href: "/cgv", key: "salesTerms" },
  { href: "/confidentialite", key: "privacy" },
  { href: "/cookies", key: "cookies" },
  { href: "/securite", key: "security" },
] as const;

export default function Footer() {
  const { t } = useI18n();
  return (
    <footer className="bg-[#1A1A2E] text-gray-300 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {/* Marque */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Image
                src="/Logo_au_pair.png"
                alt="AuPair A.EU"
                width={56}
                height={56}
                className="w-11 h-11 rounded-full object-cover"
              />
              <span className="text-white font-bold text-base sm:text-xl">AuPair<span className="text-[#E87722]">A.EU</span></span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              {t.footer.tagline}
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a href="#" className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center hover:bg-[#E87722] transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center hover:bg-[#E87722] transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center hover:bg-[#E87722] transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center hover:bg-[#E87722] transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* À propos */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t.footer.about}</h3>
            <ul className="space-y-2">
              {aboutLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-[#E87722] transition-colors">
                    {t.footer.aboutLinks[link.key]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Liens utiles */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t.footer.usefulLinks}</h3>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-[#E87722] transition-colors">
                    {t.footer.legalLinks[link.key]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            {t.footer.copyright}
          </p>
          <p className="text-xs text-gray-500">
            {t.footer.compliance}
          </p>
        </div>
      </div>
    </footer>
  );
}
