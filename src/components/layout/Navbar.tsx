"use client";

import React, { useCallback, useEffect, useState } from "react";
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
  const close = useCallback(() => setIsOpen(false), []);

  // Tiroir ouvert : bloque le défilement de la page et ferme avec Échap.
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, close]);
  const { data } = useSession();
  // Une session sans id est invalidée côté serveur : on l'affiche comme déconnectée.
  const session = data?.user?.id ? data : null;
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
              width={40}
              height={40}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover"
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
            onClick={() => setIsOpen(true)}
            aria-label={t.navbar.openMenu}
          >
            <Menu className="w-5 h-5" />
          </button>
          </div>
        </div>
      </div>

      {/* Menu mobile : tiroir latéral */}
      {isOpen && (
        <div className="fixed inset-0 z-60 md:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            aria-label={t.common.close}
            onClick={close}
            className="absolute inset-0 bg-black/40"
          />
          <div className="absolute inset-y-0 right-0 w-[80vw] max-w-xs flex flex-col bg-white shadow-2xl animate-drawer-in-right">
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-100">
              <Link href="/" onClick={close} className="flex items-center gap-2 font-bold text-sm">
                <Image
                  src="/Logo_au_pair.png"
                  alt="AuPair A.EU"
                  width={36}
                  height={36}
                  className="w-9 h-9 rounded-full object-cover"
                />
                <span className="text-[#1A1A2E]">AuPair</span>
                <span className="text-[#E87722]">A.EU</span>
              </Link>
              <button
                type="button"
                onClick={close}
                aria-label={t.common.close}
                className="p-2 rounded-xl hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block px-3 py-2.5 text-sm text-gray-700 hover:text-[#E87722] hover:bg-[#FFF3E0] rounded-xl transition-colors"
                  onClick={close}
                >
                  {t.navbar[link.key]}
                </Link>
              ))}
            </div>

            <div className="flex flex-col gap-2 px-4 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))] border-t border-gray-100">
              <Link href={profileUrl} onClick={close}>
                <Button variant="outline" size="sm" className="w-full">
                  <User className="w-4 h-4" />
                  {accountLabel}
                </Button>
              </Link>
              {session ? (
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    close();
                    signOut({ callbackUrl: "/" });
                  }}
                >
                  <LogOut className="w-4 h-4" />
                  {t.navbar.logout}
                </Button>
              ) : (
                <Link href="/inscription" onClick={close}>
                  <Button size="sm" className="w-full">
                    {t.navbar.signup}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
