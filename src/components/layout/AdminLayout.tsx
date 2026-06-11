"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe, LayoutDashboard, Users, Shield, DollarSign, BarChart2, FileText, HelpCircle, Mail, LogOut, Bell, Settings, ChevronDown, SlidersHorizontal, Menu, X } from "lucide-react";

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/utilisateurs", icon: Users, label: "Utilisateurs" },
  { href: "/admin/moderation", icon: Shield, label: "Modération" },
  { href: "/admin/paiements", icon: DollarSign, label: "Paiements" },
  { href: "/admin/pays", icon: Globe, label: "Pays" },
  { href: "/admin/analytics", icon: BarChart2, label: "Analytics" },
  { href: "/admin/blog", icon: FileText, label: "Blog" },
  { href: "/admin/faq", icon: HelpCircle, label: "FAQ" },
  { href: "/admin/tickets", icon: Mail, label: "Tickets support" },
];

const settingsNav = {
  icon: Settings,
  label: "Paramètres",
  children: [
    { href: "/admin/parametres/constantes", icon: SlidersHorizontal, label: "Constantes" },
  ],
};

function SidebarContent({
  pathname,
  isSettingsActive,
  settingsOpen,
  onToggleSettings,
  onNavigate,
  onClose,
}: {
  pathname: string;
  isSettingsActive: boolean;
  settingsOpen: boolean;
  onToggleSettings: () => void;
  onNavigate?: () => void;
  onClose?: () => void;
}) {
  return (
    <>
      <div className="p-5 border-b border-white/10 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2" onClick={onNavigate}>
          <div className="w-7 h-7 bg-[#E87722] rounded-full flex items-center justify-center">
            <Globe className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-bold text-sm">AuPair<span className="text-[#E87722]">A.EU</span></span>
          <span className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded font-bold">ADMIN</span>
        </Link>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1 ml-2" aria-label="Fermer le menu">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} onClick={onNavigate}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive ? "bg-[#E87722] text-white" : "text-gray-400 hover:bg-white/10 hover:text-white"
              }`}>
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}

        {/* Paramètres (dropdown) */}
        <div>
          <button
            type="button"
            onClick={onToggleSettings}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all w-full ${
              isSettingsActive ? "bg-[#E87722] text-white" : "text-gray-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            <settingsNav.icon className="w-4 h-4" />
            {settingsNav.label}
            <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${settingsOpen ? "rotate-180" : ""}`} />
          </button>
          {settingsOpen && (
            <div className="mt-0.5 ml-4 pl-3 border-l border-white/10 space-y-0.5">
              {settingsNav.children.map((child) => {
                const ChildIcon = child.icon;
                const isChildActive = pathname === child.href || pathname.startsWith(child.href);
                return (
                  <Link key={child.href} href={child.href} onClick={onNavigate}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                      isChildActive ? "text-[#E87722]" : "text-gray-400 hover:bg-white/10 hover:text-white"
                    }`}>
                    <ChildIcon className="w-4 h-4" />
                    {child.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </nav>

      <div className="p-3 border-t border-white/10">
        <button className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-400 hover:bg-white/10 hover:text-white w-full transition-all">
          <LogOut className="w-4 h-4" />
          Déconnexion
        </button>
      </div>
    </>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isSettingsActive = pathname.startsWith("/admin/parametres");
  const [settingsOpen, setSettingsOpen] = useState(isSettingsActive);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);

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
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex flex-col w-60 bg-[#1A1A2E] min-h-screen fixed left-0 top-0 z-40">
        <SidebarContent
          pathname={pathname}
          isSettingsActive={isSettingsActive}
          settingsOpen={settingsOpen}
          onToggleSettings={() => setSettingsOpen((open) => !open)}
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
          onToggleSettings={() => setSettingsOpen((open) => !open)}
          onNavigate={() => setMobileMenuOpen(false)}
          onClose={() => setMobileMenuOpen(false)}
        />
      </aside>

      <main className="md:ml-60 flex-1 min-h-screen">
        {/* Top bar */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden -ml-1 p-1 text-gray-500 hover:text-[#E87722]"
              aria-label="Ouvrir le menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-sm font-semibold text-gray-500">
              <span className="hidden sm:inline">Administration — </span>AuPair A.EU
            </h1>
          </div>
          <div className="flex items-center gap-3">
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
