"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { Globe, Menu, X, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/contexts/LanguageContext";
import { getDefaultRedirectForRole } from "@/lib/safe-redirect";

const navLinks = [
  { href: "/trouver-au-pair", fr: "Trouver un au pair", en: "Find an au pair" },
  { href: "/trouver-famille", fr: "Trouver une famille", en: "Find a family" },
  { href: "/devenir-au-pair", fr: "Devenir au pair", en: "Become an au pair" },
  { href: "/tarifs", fr: "Tarifs", en: "Pricing" },
  { href: "/blog", fr: "Blog", en: "Blog" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { lang, setLang, t } = useLang();
  const { data: session } = useSession();

  const profileUrl = session
    ? session.user.role === "AU_PAIR"
      ? "/dashboard/au-pair"
      : session.user.role === "FAMILLE"
        ? "/dashboard/famille"
        : getDefaultRedirectForRole(session.user.role)
    : "/connexion";

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-lg sm:text-xl">
            <Image
              src="/Logo_au_pair.png"
              alt="AuPair A.EU"
              width={56}
              height={56}
              className="w-11 h-11 sm:w-14 sm:h-14 object-contain"
              priority
            />
            <span className="text-[#1A1A2E]">AuPair</span>
            <span className="text-[#E87722]">A.EU</span>
          </Link>

          {/* Nav desktop */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm text-gray-600 hover:text-[#E87722] font-medium transition-colors rounded-lg hover:bg-[#FFF3E0]"
              >
                {lang === "fr" ? link.fr : link.en}
              </Link>
            ))}
          </div>

          {/* Actions desktop */}
          <div className="hidden md:flex items-center gap-3">
            {/* Sélecteur langue */}
            <button
              onClick={() => setLang(lang === "fr" ? "en" : "fr")}
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-[#E87722] transition-colors px-2 py-1 rounded-lg hover:bg-gray-50"
              title={lang === "fr" ? "Switch to English" : "Passer en français"}
            >
              <Globe className="w-4 h-4" />
              <span className="font-medium">{lang.toUpperCase()}</span>
            </button>

            <Link href={profileUrl}>
              <Button variant="ghost" size="sm">
                <User className="w-4 h-4" />
                {session ? (session.user.role === "ADMIN" ? "Admin" : t("Profil", "Profile")) : t("Connexion", "Login")}
              </Button>
            </Link>

            {session ? (
              <Button size="sm" onClick={() => signOut({ callbackUrl: "/" })}>
                <LogOut className="w-4 h-4" />
                {t("Se déconnecter", "Log out")}
              </Button>
            ) : (
              <Link href="/inscription">
                <Button size="sm">{t("S'inscrire", "Sign up")}</Button>
              </Link>
            )}
          </div>

          {/* Menu mobile */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Menu mobile dropdown */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block px-3 py-2 text-sm text-gray-700 hover:text-[#E87722] hover:bg-[#FFF3E0] rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              {lang === "fr" ? link.fr : link.en}
            </Link>
          ))}
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
            <button
              onClick={() => setLang(lang === "fr" ? "en" : "fr")}
              className="flex items-center gap-1 text-sm text-gray-600 px-3 py-2 border border-gray-200 rounded-lg"
            >
              <Globe className="w-4 h-4" />
              {lang === "fr" ? "EN" : "FR"}
            </button>
            <Link href={profileUrl} className="flex-1" onClick={() => setIsOpen(false)}>
              <Button variant="outline" size="sm" className="w-full">
                {session ? (session.user.role === "ADMIN" ? "Admin" : t("Profil", "Profile")) : t("Connexion", "Login")}
              </Button>
            </Link>
            {session ? (
              <Button
                size="sm"
                className="flex-1 w-full"
                onClick={() => {
                  setIsOpen(false);
                  signOut({ callbackUrl: "/" });
                }}
              >
                {t("Se déconnecter", "Log out")}
              </Button>
            ) : (
              <Link href="/inscription" className="flex-1" onClick={() => setIsOpen(false)}>
                <Button size="sm" className="w-full">
                  {t("S'inscrire", "Sign up")}
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
