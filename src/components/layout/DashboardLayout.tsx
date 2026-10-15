"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LogOut, ChevronRight, Menu, X, Bell } from "lucide-react";
import { PendingValidationGate } from "@/components/dashboard/PendingValidationGate";
import { useI18n } from "@/i18n";
import { formatDisplayName } from "@/lib/utils";
import { LanguageToggle } from "./LanguageToggle";
import { DASHBOARD_NAV, type DashboardNavItem, type DashboardRole } from "./dashboard-nav";

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: DashboardRole;
  userName?: string;
}

const UNREAD_POLL_INTERVAL_MS = 5000;
const UNREAD_NOTIFICATIONS_POLL_INTERVAL_MS = 5000;

function CountBadge({ count }: { count: number }) {
  return (
    <span className="ml-auto bg-[#E87722] text-white text-xs font-bold rounded-full px-2 py-0.5 min-w-5 text-center">
      {count}
    </span>
  );
}

function SidebarContent({
  navItems,
  pathname,
  favoritesCount,
  unreadMessages,
  unreadNotifications,
  onNavigate,
  onClose,
  collapsed = false,
}: {
  navItems: DashboardNavItem[];
  pathname: string;
  favoritesCount: number;
  unreadMessages: number;
  unreadNotifications: number;
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
      {/* Logo */}
      <div className={`border-b border-white/10 flex items-center justify-between ${collapsed ? "py-4 px-2 justify-center" : "p-6"}`}>
        <Link href="/" className="flex items-center gap-2" onClick={onNavigate}>
          <Image
            src="/Logo_au_pair.png"
            alt="AuPair A.EU"
            width={56}
            height={56}
            className={`rounded-full object-cover ${collapsed ? "w-10 h-10" : "w-11 h-11 sm:w-14 sm:h-14"}`}
          />
          {!collapsed && <span className="text-white font-bold">AuPair<span className="text-[#E87722]">A.EU</span></span>}
        </Link>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1" aria-label={t.layout.closeMenu}>
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className={`flex-1 space-y-1 overflow-y-auto overflow-x-hidden sidebar-scroll ${collapsed ? "p-2" : "p-4"}`}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isDashboardRoot = item.href === "/dashboard/au-pair" || item.href === "/dashboard/famille";
          const isActive = isDashboardRoot ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + "/");
          const count =
            item.href === "/dashboard/famille/favoris"
              ? favoritesCount
              : item.href.endsWith("/messages")
                ? unreadMessages
                : item.href.endsWith("/notifications")
                  ? unreadNotifications
                  : 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              title={collapsed ? t.nav[item.labelKey] : undefined}
              className={`relative flex items-center py-2.5 rounded-xl text-sm font-medium transition-all ${itemLayout} ${
                isActive
                  ? "bg-[#E87722] text-white"
                  : "text-gray-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && t.nav[item.labelKey]}
              {count > 0 &&
                (collapsed ? (
                  <span className={`absolute top-1.5 right-2 w-2 h-2 rounded-full ${isActive ? "bg-white" : "bg-[#E87722]"}`} />
                ) : (
                  <CountBadge count={count} />
                ))}
              {isActive && !collapsed && <ChevronRight className="w-3 h-3 ml-auto" />}
            </Link>
          );
        })}
      </nav>

      {/* Déconnexion */}
      <div className={`border-t border-white/10 ${collapsed ? "p-2" : "p-4"}`}>
        <button
          onClick={() => signOut({ callbackUrl: "/connexion" })}
          title={collapsed ? t.layout.signOut : undefined}
          className={`flex items-center py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-white/10 hover:text-white w-full transition-all ${itemLayout}`}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && t.layout.signOut}
        </button>
      </div>
    </>
  );
}

export default function DashboardLayout({ children, role, userName }: DashboardLayoutProps) {
  const pathname = usePathname();
  const { t } = useI18n();
  const navItems = DASHBOARD_NAV[role];
  const [photoUrl, setPhotoUrl] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [profileStatus, setProfileStatus] = useState<string | null | undefined>(undefined);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
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
          setDisplayName(formatDisplayName(json.firstName, json.lastName));
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
      <div className="min-h-dvh bg-[#F5F5F5] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#E87722] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (profileStatus === "PENDING") {
    return <PendingValidationGate role={role} />;
  }

  const collapsed = !sidebarOpen;
  const sidebarProps = {
    navItems,
    pathname,
    favoritesCount,
    unreadMessages,
    unreadNotifications,
  };
  const topBarName = displayName || userName || t.layout.myAccount;

  return (
    <div className="min-h-dvh bg-[#F5F5F5] flex">
      {/* Sidebar desktop */}
      <aside
        className={`hidden md:flex flex-col bg-[#1A1A2E] h-dvh fixed left-0 top-0 z-40 transition-[width] duration-300 ease-in-out ${
          collapsed ? "w-16" : "w-64"
        }`}
      >
        <SidebarContent {...sidebarProps} collapsed={collapsed} />
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
          {...sidebarProps}
          onNavigate={() => setMobileMenuOpen(false)}
          onClose={() => setMobileMenuOpen(false)}
        />
      </aside>

      {/* Contenu principal */}
      <main
        className={`flex-1 min-w-0 min-h-dvh transition-[margin] duration-300 ease-in-out ${collapsed ? "md:ml-16" : "md:ml-64"}`}
      >
        {/* Top bar (même structure que celle du back-office) */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between gap-3 sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="relative md:hidden -ml-1 p-1 text-gray-500 hover:text-[#E87722]"
              aria-label={t.layout.openMenu}
            >
              <Menu className="w-5 h-5" />
              {unreadMessages > 0 && (
                <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-[#E87722] rounded-full" />
              )}
            </button>
            <button
              onClick={() => setSidebarOpen((open) => !open)}
              className="hidden md:block -ml-1 p-1 text-gray-500 hover:text-[#E87722]"
              aria-label={sidebarOpen ? t.layout.closeMenu : t.layout.openMenu}
              title={sidebarOpen ? t.layout.closeMenu : t.layout.openMenu}
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-sm font-semibold text-gray-500 truncate">
              <span className="hidden sm:inline">{role === "au-pair" ? t.layout.topTitleAuPair : t.layout.topTitleFamily}</span>AuPair A.EU
            </h1>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <LanguageToggle />
            <Link
              href={`/dashboard/${role}/notifications`}
              className="relative p-2 text-gray-500 hover:text-[#E87722]"
              aria-label={t.layout.notifications}
              title={t.layout.notifications}
            >
              <Bell className="w-5 h-5" />
              {unreadNotifications > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </Link>
            <Link href={`/dashboard/${role}/profil`} className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 bg-[#E87722] rounded-full flex items-center justify-center text-white text-xs font-bold overflow-hidden flex-shrink-0">
                {photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photoUrl} alt="" className="w-full h-full object-cover object-top" />
                ) : (
                  topBarName.charAt(0).toUpperCase()
                )}
              </div>
              <span className="hidden sm:block text-sm font-semibold text-[#1A1A2E] truncate max-w-48">{topBarName}</span>
            </Link>
          </div>
        </div>

        <div className="p-4 sm:p-6">{children}</div>
      </main>
    </div>
  );
}
