"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { Menu, X, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";
import { LanguageToggle } from "./LanguageToggle";
import { getDefaultRedirectForRole } from "@/lib/safe-redirect";

const navLinks = [
  { href: "/trouver-au-pair", key: "findAuPair" },
  { href: "/trouver-famille", key: "findFamily" },
  { href: "/devenir-au-pair", key: "becomeAuPair" },
  { href: "/tarifs", key: "pricing" },
  { href: "/blog", key: "blog" },
] as const;

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useI18n();
  const { data: session } = useSession();
  const accountLabel = session
    ? session.user.role === "ADMIN"
      ? t.navbar.admin
      : t.navbar.profile
    : t.navbar.login;

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
          <Link href="/" className="flex items-center gap-2 font-bold text-sm sm:text-xl">
            <Image
              src="/Logo_au_pair.png"
              alt="AuPair A.EU"
              width={56}
              height={56}
              className="w-11 h-11 sm:w-14 sm:h-14 rounded-full object-cover"
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
                className="px-3 py-2 text-sm text-gray-600 hover:text-[#E87722] font-medium transition-colors rounded-xl hover:bg-[#FFF3E0]"
              >
                {t.navbar[link.key]}
              </Link>
            ))}
          </div>

          {/* Actions desktop */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageToggle />

            <Link href={profileUrl}>
              <Button variant="ghost" size="sm">
                <User className="w-4 h-4" />
                {accountLabel}
              </Button>
            </Link>

            {session ? (
              <Button size="sm" onClick={() => signOut({ callbackUrl: "/" })}>
                <LogOut className="w-4 h-4" />
                {t.navbar.logout}
              </Button>
            ) : (
              <Link href="/inscription">
                <Button size="sm">{t.navbar.signup}</Button>
              </Link>
            )}
          </div>

          {/* Menu mobile */}
          <div className="md:hidden flex items-center gap-1">
          <LanguageToggle />
          <button
            className="p-2 rounded-xl hover:bg-gray-100"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={t.navbar.openMenu}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          </div>
        </div>
      </div>

      {/* Menu mobile dropdown */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block px-3 py-2 text-sm text-gray-700 hover:text-[#E87722] hover:bg-[#FFF3E0] rounded-xl transition-colors"
              onClick={() => setIsOpen(false)}
            >
              {t.navbar[link.key]}
            </Link>
          ))}
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
            <Link href={profileUrl} className="flex-1" onClick={() => setIsOpen(false)}>
              <Button variant="outline" size="sm" className="w-full">
                {accountLabel}
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
                {t.navbar.logout}
              </Button>
            ) : (
              <Link href="/inscription" className="flex-1" onClick={() => setIsOpen(false)}>
                <Button size="sm" className="w-full">
                  {t.navbar.signup}
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
