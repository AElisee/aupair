"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useI18n } from "@/i18n";
import type { admin } from "@/i18n/admin";
import { LanguageToggle } from "./LanguageToggle";
import { Globe, LayoutDashboard, Users, Shield, DollarSign, BarChart2, FileText, HelpCircle, Mail, LogOut, Bell, Settings, ChevronDown, SlidersHorizontal, Menu, X, PanelLeftClose, PanelLeftOpen, Send, Wallet, KeyRound, FileCheck } from "lucide-react";

// Libellés : section `adminNav` de src/i18n/admin.ts
type NavKey = keyof typeof admin.adminNav;

const navItems: { href: string; icon: React.ElementType; labelKey: NavKey; badge?: boolean }[] = [
  { href: "/admin", icon: LayoutDashboard, labelKey: "dashboard" },
  { href: "/admin/utilisateurs", icon: Users, labelKey: "users" },
  { href: "/admin/moderation", icon: Shield, labelKey: "moderation", badge: true },
  { href: "/admin/paiements", icon: DollarSign, labelKey: "payments" },
  { href: "/admin/pays", icon: Globe, labelKey: "countries" },
  { href: "/admin/analytics", icon: BarChart2, labelKey: "analytics" },
  { href: "/admin/blog", icon: FileText, labelKey: "blog" },
  { href: "/admin/faq", icon: HelpCircle, labelKey: "faq" },
  { href: "/admin/tickets", icon: Mail, labelKey: "tickets" },
];

const settingsNav: { icon: React.ElementType; labelKey: NavKey; children: { href: string; icon: React.ElementType; labelKey: NavKey }[] } = {
  icon: Settings,
  labelKey: "settings",
  children: [
    { href: "/admin/parametres/constantes", icon: SlidersHorizontal, labelKey: "constants" },
    { href: "/admin/parametres/notifications", icon: Bell, labelKey: "notifications" },
    { href: "/admin/parametres/email", icon: Send, labelKey: "email" },
    { href: "/admin/parametres/paiements", icon: Wallet, labelKey: "paymentMethods" },
    { href: "/admin/parametres/documents", icon: FileCheck, labelKey: "documents" },
    { href: "/admin/parametres/compte", icon: KeyRound, labelKey: "account" },
  ],
};

function SidebarContent({
  pathname,
  isSettingsActive,
  settingsOpen,
  pendingCount,
  onToggleSettings,
  onNavigate,
  onClose,
  collapsed = false,
}: {
  pathname: string;
  isSettingsActive: boolean;
  settingsOpen: boolean;
  pendingCount: number;
  onToggleSettings: () => void;
  onNavigate?: () => void;
  onClose?: () => void;
  /** Sidebar desktop réduite : seulement le logo et les icônes */
  collapsed?: boolean;
}) {
  const { t } = useI18n();
  // En mode réduit, les libellés sont masqués et passent en infobulle (title)
  const itemLayout = collapsed ? "justify-center px-0" : "gap-3 px-3";
  return (
    <>
      <div className={`relative border-b border-white/10 ${collapsed ? "py-4 px-2" : "p-5"}`}>
        <Link href="/" className="flex flex-col items-center gap-2" onClick={onNavigate}>
          <Image
            src="/Logo_au_pair.png"
            alt="AuPair A.EU"
            width={56}
            height={56}
            className={`rounded-full object-cover ${collapsed ? "w-10 h-10" : "w-14 h-14"}`}
          />
          {!collapsed && (
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-sm">AuPair<span className="text-[#E87722]">A.EU</span></span>
              <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded font-bold">ADMIN</span>
            </div>
          )}
        </Link>
        {onClose && (
          <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-white p-1" aria-label={t.adminNav.closeMenu}>
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className={`flex-1 space-y-0.5 overflow-y-auto overflow-x-hidden sidebar-scroll ${collapsed ? "p-2" : "p-3"}`}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} onClick={onNavigate}
              title={collapsed ? t.adminNav[item.labelKey] : undefined}
              className={`relative flex items-center py-2.5 rounded-xl text-sm font-medium transition-all ${itemLayout} ${
                isActive ? "bg-[#E87722] text-white" : "text-gray-400 hover:bg-white/10 hover:text-white"
              }`}>
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && t.adminNav[item.labelKey]}
              {item.badge && pendingCount > 0 && collapsed && (
                <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full" />
              )}
              {item.badge && pendingCount > 0 && !collapsed && (
                <span className="ml-auto bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                  {pendingCount > 99 ? "99+" : pendingCount}
                </span>
              )}
            </Link>
          );
        })}

        {/* Paramètres (dropdown) */}
        <div>
          <button
            type="button"
            onClick={onToggleSettings}
            title={collapsed ? t.adminNav[settingsNav.labelKey] : undefined}
            className={`flex items-center py-2.5 rounded-xl text-sm font-medium transition-all w-full ${itemLayout} ${
              isSettingsActive ? "bg-[#E87722] text-white" : "text-gray-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            <settingsNav.icon className="w-4 h-4 shrink-0" />
            {!collapsed && t.adminNav[settingsNav.labelKey]}
            {!collapsed && <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${settingsOpen ? "rotate-180" : ""}`} />}
          </button>
          {settingsOpen && (
            <div className={`mt-0.5 space-y-0.5 ${collapsed ? "pt-0.5 border-t border-white/10" : "ml-4 pl-3 border-l border-white/10"}`}>
              {settingsNav.children.map((child) => {
                const ChildIcon = child.icon;
                const isChildActive = pathname === child.href || pathname.startsWith(child.href);
                return (
                  <Link key={child.href} href={child.href} onClick={onNavigate}
                    title={collapsed ? t.adminNav[child.labelKey] : undefined}
                    className={`flex items-center py-2 rounded-xl text-sm font-medium transition-all ${itemLayout} ${
                      isChildActive ? "text-[#E87722]" : "text-gray-400 hover:bg-white/10 hover:text-white"
                    }`}>
                    <ChildIcon className="w-4 h-4 shrink-0" />
                    {!collapsed && t.adminNav[child.labelKey]}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </nav>

      <div className={`border-t border-white/10 ${collapsed ? "p-2" : "p-3"}`}>
        <button
          onClick={() => signOut({ callbackUrl: "/connexion" })}
          title={collapsed ? t.adminNav.signOut : undefined}
          className={`flex items-center py-2 rounded-xl text-sm text-gray-400 hover:bg-white/10 hover:text-white w-full transition-all ${itemLayout}`}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && t.adminNav.signOut}
        </button>
      </div>
    </>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t } = useI18n();
  const isSettingsActive = pathname.startsWith("/admin/parametres");
  const [settingsOpen, setSettingsOpen] = useState(isSettingsActive);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [prevPathname, setPrevPathname] = useState(pathname);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    fetch("/api/admin/moderation/count")
      .then((r) => r.json())
      .then((d) => setPendingCount(d.count ?? 0))
      .catch(() => {});
  }, [pathname]);

  // Ferme le menu mobile à chaque changement de page
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setMobileMenuOpen(false);
  }

  // Empêche le scroll du fond quand le menu mobile est ouvert
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <div className="min-h-dvh bg-gray-50 flex">
      {/* Sidebar desktop */}
      <aside
        className={`hidden md:flex flex-col bg-[#1A1A2E] h-dvh fixed left-0 top-0 z-40 transition-[width] duration-300 ease-in-out ${
          sidebarOpen ? "w-60" : "w-16"
        }`}
      >
        <SidebarContent
          pathname={pathname}
          isSettingsActive={isSettingsActive}
          settingsOpen={settingsOpen}
          pendingCount={pendingCount}
          onToggleSettings={() => setSettingsOpen((open) => !open)}
          collapsed={!sidebarOpen}
        />
      </aside>

      {/* Overlay mobile */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar mobile (drawer) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[80vw] bg-[#1A1A2E] flex flex-col transform transition-transform duration-300 ease-in-out md:hidden ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent
          pathname={pathname}
          isSettingsActive={isSettingsActive}
          settingsOpen={settingsOpen}
          pendingCount={pendingCount}
          onToggleSettings={() => setSettingsOpen((open) => !open)}
          onNavigate={() => setMobileMenuOpen(false)}
          onClose={() => setMobileMenuOpen(false)}
        />
      </aside>

      <main className={`flex-1 min-w-0 min-h-dvh transition-[margin] duration-300 ease-in-out ${sidebarOpen ? "md:ml-60" : "md:ml-16"}`}>
        {/* Top bar */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden -ml-1 p-1 text-gray-500 hover:text-[#E87722]"
              aria-label={t.adminNav.openMenu}
            >
              <Menu className="w-5 h-5" />
            </button>
            <button
              onClick={() => setSidebarOpen((open) => !open)}
              className="hidden md:block -ml-1 p-1 text-gray-500 hover:text-[#E87722]"
              aria-label={sidebarOpen ? t.adminNav.closeMenu : t.adminNav.openMenu}
              title={sidebarOpen ? t.adminNav.closeMenu : t.adminNav.openMenu}
            >
              {sidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
            </button>
            <h1 className="text-sm font-semibold text-gray-500">
              <span className="hidden sm:inline">{t.adminNav.topTitle}</span>AuPair A.EU
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <button className="relative p-2 text-gray-500 hover:text-[#E87722]">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="w-8 h-8 bg-[#E87722] rounded-full flex items-center justify-center text-white text-xs font-bold">A</div>
          </div>
        </div>

        <div className="p-4 sm:p-6">{children}</div>
      </main>
    </div>
  );
}
