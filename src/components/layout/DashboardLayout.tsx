"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Globe, LogOut, ChevronRight, Menu, X } from "lucide-react";
import { PendingValidationGate } from "@/components/dashboard/PendingValidationGate";

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

const UNREAD_POLL_INTERVAL_MS = 5000;
const UNREAD_NOTIFICATIONS_POLL_INTERVAL_MS = 5000;

function SidebarContent({
  navItems,
  pathname,
  photoUrl,
  userName,
  role,
  favoritesCount,
  unreadMessages,
  unreadNotifications,
  onNavigate,
  onClose,
}: {
  navItems: NavItem[];
  pathname: string;
  photoUrl: string;
  userName?: string;
  role: "au-pair" | "famille";
  favoritesCount: number;
  unreadMessages: number;
  unreadNotifications: number;
  onNavigate?: () => void;
  onClose?: () => void;
}) {
  return (
    <>
      {/* Logo */}
      <div className="p-6 border-b border-white/10 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2" onClick={onNavigate}>
          <div className="w-8 h-8 bg-[#E87722] rounded-full flex items-center justify-center">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold">AuPair<span className="text-[#E87722]">A.EU</span></span>
        </Link>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1" aria-label="Fermer le menu">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* User info */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#E87722] rounded-full flex items-center justify-center text-white font-bold overflow-hidden flex-shrink-0">
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoUrl} alt="" className="w-full h-full object-cover object-top" />
            ) : (
              userName?.charAt(0) || "U"
            )}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold truncate">{userName || "Mon compte"}</p>
            <p className="text-gray-400 text-xs capitalize">{role === "au-pair" ? "Au pair" : "Famille d'accueil"}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isDashboardRoot = item.href === "/dashboard/au-pair" || item.href === "/dashboard/famille";
          const isActive = isDashboardRoot ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
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
              {item.href.endsWith("/messages") && unreadMessages > 0 && (
                <span className="ml-auto bg-[#E87722] text-white text-xs font-bold rounded-full px-2 py-0.5 min-w-5 text-center">
                  {unreadMessages}
                </span>
              )}
              {item.href.endsWith("/notifications") && unreadNotifications > 0 && (
                <span className="ml-auto bg-[#E87722] text-white text-xs font-bold rounded-full px-2 py-0.5 min-w-5 text-center">
                  {unreadNotifications}
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
    </>
  );
}

export default function DashboardLayout({ children, navItems, role, userName }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [photoUrl, setPhotoUrl] = useState("");
  const [profileStatus, setProfileStatus] = useState<string | null | undefined>(undefined);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);

  // Ferme le menu mobile à chaque changement de page
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setMobileMenuOpen(false);
  }

  useEffect(() => {
    const endpoint = role === "famille" ? "/api/profile/famille" : "/api/profile/au-pair";
    fetch(endpoint)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json) {
          setPhotoUrl(json.profilePhotoUrl || json.familyPhotoUrl || "");
          setProfileStatus(json.status ?? null);
        } else {
          setProfileStatus(null);
        }
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

  useEffect(() => {
    let cancelled = false;
    const fetchUnread = () => {
      fetch("/api/messages/unread-count")
        .then((res) => (res.ok ? res.json() : null))
        .then((json) => {
          if (json && !cancelled) setUnreadMessages(json.count ?? 0);
        });
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, UNREAD_POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const fetchUnreadNotifications = () => {
      fetch("/api/notifications/unread-count")
        .then((res) => (res.ok ? res.json() : null))
        .then((json) => {
          if (json && !cancelled) setUnreadNotifications(json.count ?? 0);
        });
    };
    fetchUnreadNotifications();
    const interval = setInterval(fetchUnreadNotifications, UNREAD_NOTIFICATIONS_POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  // Empêche le scroll du fond quand le menu mobile est ouvert
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  if (profileStatus === undefined) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#E87722] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (profileStatus === "PENDING") {
    return <PendingValidationGate role={role} />;
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-[#1A1A2E] min-h-screen fixed left-0 top-0 z-40">
        <SidebarContent
          navItems={navItems}
          pathname={pathname}
          photoUrl={photoUrl}
          userName={userName}
          role={role}
          favoritesCount={favoritesCount}
          unreadMessages={unreadMessages}
          unreadNotifications={unreadNotifications}
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
          navItems={navItems}
          pathname={pathname}
          photoUrl={photoUrl}
          userName={userName}
          role={role}
          favoritesCount={favoritesCount}
          unreadMessages={unreadMessages}
          unreadNotifications={unreadNotifications}
          onNavigate={() => setMobileMenuOpen(false)}
          onClose={() => setMobileMenuOpen(false)}
        />
      </aside>

      {/* Contenu principal */}
      <main className="md:ml-64 flex-1 min-h-screen">
        {/* Header mobile */}
        <div className="md:hidden bg-[#1A1A2E] px-4 py-3 flex items-center justify-between sticky top-0 z-30">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="relative p-2 -ml-2 text-white"
            aria-label="Ouvrir le menu"
          >
            <Menu className="w-5 h-5" />
            {unreadMessages > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#E87722] rounded-full" />
            )}
          </button>
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#E87722] rounded-full flex items-center justify-center">
              <Globe className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold text-sm">AuPair<span className="text-[#E87722]">A.EU</span></span>
          </Link>
          <div className="w-9" aria-hidden="true" />
        </div>

        <div className="p-4 sm:p-6">{children}</div>
      </main>
    </div>
  );
}
