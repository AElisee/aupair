"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Globe, LogOut, ChevronRight } from "lucide-react";

interface NavItem {
  href: string;
  icon: React.ElementType;
  label: string;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  navItems: NavItem[];
  role: "au-pair" | "famille";
  userName?: string;
}

export default function DashboardLayout({ children, navItems, role, userName }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [photoUrl, setPhotoUrl] = useState("");
  const [favoritesCount, setFavoritesCount] = useState(0);

  useEffect(() => {
    const endpoint = role === "famille" ? "/api/profile/famille" : "/api/profile/au-pair";
    fetch(endpoint)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json) setPhotoUrl(json.profilePhotoUrl || json.familyPhotoUrl || "");
      });
  }, [role]);

  useEffect(() => {
    if (role !== "famille") return;
    fetch("/api/dashboard/famille")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json) setFavoritesCount(json.favoritesCount ?? 0);
      });
  }, [role]);

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-[#1A1A2E] min-h-screen fixed left-0 top-0 z-40">
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#E87722] rounded-full flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold">AuPair<span className="text-[#E87722]">A.EU</span></span>
          </Link>
        </div>

        {/* User info */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#E87722] rounded-full flex items-center justify-center text-white font-bold overflow-hidden">
              {photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoUrl} alt="" className="w-full h-full object-cover object-top" />
              ) : (
                userName?.charAt(0) || "U"
              )}
            </div>
            <div>
              <p className="text-white text-sm font-semibold">{userName || "Mon compte"}</p>
              <p className="text-gray-400 text-xs capitalize">{role === "au-pair" ? "Au pair" : "Famille d'accueil"}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isDashboardRoot = item.href === "/dashboard/au-pair" || item.href === "/dashboard/famille";
            const isActive = isDashboardRoot ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#E87722] text-white"
                    : "text-gray-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
                {item.href === "/dashboard/famille/favoris" && favoritesCount > 0 && (
                  <span className="ml-auto bg-[#E87722] text-white text-xs font-bold rounded-full px-2 py-0.5 min-w-5 text-center">
                    {favoritesCount}
                  </span>
                )}
                {isActive && <ChevronRight className="w-3 h-3 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* Déconnexion */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={() => signOut({ callbackUrl: "/connexion" })}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-white/10 hover:text-white w-full transition-all"
          >
            <LogOut className="w-4 h-4" />
            Se déconnecter
          </button>
        </div>
      </aside>

      {/* Contenu principal */}
      <main className="md:ml-64 flex-1 min-h-screen">
        {/* Header mobile */}
        <div className="md:hidden bg-[#1A1A2E] px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#E87722] rounded-full flex items-center justify-center">
              <Globe className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold text-sm">AuPair<span className="text-[#E87722]">A.EU</span></span>
          </Link>
          <div className="flex items-center gap-2">
            {navItems.slice(0, 4).map(item => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}
                  className={`p-2 rounded-lg ${isActive ? "bg-[#E87722] text-white" : "text-gray-400"}`}>
                  <Icon className="w-4 h-4" />
                </Link>
              );
            })}
          </div>
        </div>

        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
