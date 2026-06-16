import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Instagram, Facebook, Linkedin, Youtube } from "lucide-react";

const hostCountries = ["France", "Allemagne", "Belgique", "Luxembourg", "Suisse", "États-Unis"];
const aboutLinks = [
  { href: "/devenir-au-pair", label: "Devenir au pair" },
  { href: "/accueillir-un-au-pair", label: "Accueillir un au pair" },
  { href: "/tarifs", label: "Tarifs" },
  { href: "/temoignages", label: "Témoignages" },
  { href: "/blog", label: "Blog" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];
const legalLinks = [
  { href: "/mentions-legales", label: "Mentions légales" },
  { href: "/cgu", label: "CGU" },
  { href: "/cgv", label: "CGV" },
  { href: "/confidentialite", label: "Confidentialité" },
  { href: "/cookies", label: "Cookies" },
  { href: "/securite", label: "Sécurité" },
];

export default function Footer() {
  return (
    <footer className="bg-[#1A1A2E] text-gray-300 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Marque */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Image
                src="/Logo_au_pair.png"
                alt="AuPair A.EU"
                width={56}
                height={56}
                className="w-11 h-11 object-contain"
              />
              <span className="text-white font-bold text-xl">AuPair<span className="text-[#E87722]">A.EU</span></span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              La première plateforme mondiale dédiée aux au pairs africains. Trouvez votre famille d&apos;accueil idéale en Europe.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a href="#" className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#E87722] transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#E87722] transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#E87722] transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#E87722] transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Pays d'accueil */}
          <div>
            <h3 className="text-white font-semibold mb-4">Pays d&apos;accueil</h3>
            <ul className="space-y-2">
              {hostCountries.map((country) => (
                <li key={country}>
                  <Link
                    href={`/trouver-famille/${country.toLowerCase().replace(" ", "-")}`}
                    className="text-sm hover:text-[#E87722] transition-colors"
                  >
                    {country}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* À propos */}
          <div>
            <h3 className="text-white font-semibold mb-4">À propos d&apos;AuPair A.EU</h3>
            <ul className="space-y-2">
              {aboutLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-[#E87722] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Liens utiles */}
          <div>
            <h3 className="text-white font-semibold mb-4">Liens utiles</h3>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-[#E87722] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            © 2026 AuPair A.EU — SIRET : 02025527692 — Éditeur : BODOU SERVICE
          </p>
          <p className="text-xs text-gray-500">
            Conforme RGPD · Hébergé sur Vercel
          </p>
        </div>
      </div>
    </footer>
  );
}
