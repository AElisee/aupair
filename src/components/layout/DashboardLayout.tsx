"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { LogOut, ChevronRight, ChevronDown, Menu, X, Bell, Crown, User } from "lucide-react";
import { PendingValidationGate } from "@/components/dashboard/PendingValidationGate";
import { ICON } from "@/components/admin/AdminUI";
import { useI18n } from "@/i18n";
import { formatDisplayName } from "@/lib/utils";
import { LanguageToggle } from "./LanguageToggle";
import { DASHBOARD_NAV, type DashboardNavItem, type DashboardRole } from "./dashboard-nav";

/**
 * Fonds doux des espaces (distincts du fond bleuté du back-office) :
 * famille chaleureux, au pair en dégradé très léger du vert du logo (#3FA45B).
 */
const SPACE_BACKGROUND: Record<DashboardRole, string> = {
  famille:
    "bg-[#FBF8F4] bg-[radial-gradient(1100px_560px_at_90%_-10%,rgba(232,119,34,0.09),transparent_60%),radial-gradient(900px_500px_at_0%_110%,rgba(63,164,91,0.07),transparent_60%),linear-gradient(180deg,#FCFAF7_0%,#F8F4EE_100%)] bg-fixed",
  "au-pair":
    "bg-[#F7FAF7] bg-[radial-gradient(1100px_560px_at_90%_-10%,rgba(63,164,91,0.08),transparent_60%),radial-gradient(900px_500px_at_0%_110%,rgba(63,164,91,0.05),transparent_60%),linear-gradient(180deg,#FAFCFA_0%,#F3F7F4_100%)] bg-fixed",
};

/** Fil d'Ariane de la top bar, déduit de l'URL et des libellés du menu */
function Breadcrumb({ role, navItems, pathname }: { role: DashboardRole; navItems: DashboardNavItem[]; pathname: string }) {
  const { t } = useI18n();
  const l = t.layout;
  const root = `/dashboard/${role}`;
  const crumbs: { label: string; href?: string }[] = [
    { label: role === "au-pair" ? l.breadcrumbHomeAuPair : l.breadcrumbHomeFamily, href: root },
  ];

  // Fiche détaillée d'une famille / d'un au pair : rattachée à la page de recherche
  const detail = role === "au-pair" ? `${root}/famille/` : `${root}/au-pair/`;
  const item = navItems.find((i) => i.href !== root && (pathname === i.href || pathname.startsWith(i.href + "/")));
  if (pathname.startsWith(detail)) {
    const search = navItems.find((i) => i.href === `${root}/recherche`);
    if (search) crumbs.push({ label: t.nav[search.labelKey], href: search.href });
    crumbs.push({ label: role === "au-pair" ? l.breadcrumbFamilyProfile : l.breadcrumbAuPairProfile });
  } else if (item) {
    crumbs.push({ label: t.nav[item.labelKey] });
  } else {
    crumbs.push({ label: t.nav.dashboard });
  }

  return (
    <nav aria-label={l.breadcrumbLabel} className="hidden sm:block min-w-0">
      <ol className="flex items-center gap-1 text-xs text-gray-500 truncate">
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <li key={i} className="flex items-center gap-1 min-w-0">
              {i > 0 && <ChevronRight size={12} strokeWidth={1.25} className="shrink-0 text-gray-400" />}
              {isLast ? (
                <span className="font-medium text-[#1A1A2E] truncate" aria-current="page">{crumb.label}</span>
              ) : crumb.href ? (
                <Link href={crumb.href} className="hover:text-[#E87722] truncate">{crumb.label}</Link>
              ) : (
                <span className="truncate">{crumb.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** Avatar + nom de la top bar ; au clic, menu "Mon profil" / "Se déconnecter" */
function AccountMenu({ role, name, photoUrl }: { role: DashboardRole; name: string; photoUrl: string }) {
  const { t } = useI18n();
  const itemClass =
    "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#1A1A2E] outline-none cursor-pointer data-[highlighted]:bg-[#FFF3E0] data-[highlighted]:text-[#E87722]";
  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger
        className="flex items-center gap-2 min-w-0 rounded-full sm:pr-1 outline-none focus-visible:ring-2 focus-visible:ring-[#E87722]/40"
        aria-label={t.layout.accountMenu}
      >
        <div className="w-8 h-8 bg-[#E87722] rounded-full flex items-center justify-center text-white text-xs font-medium overflow-hidden flex-shrink-0">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoUrl} alt="" className="w-full h-full object-cover object-top" />
          ) : (
            name.charAt(0).toUpperCase()
          )}
        </div>
        <span className="hidden sm:block text-sm font-medium text-[#1A1A2E] truncate max-w-48">{name}</span>
        <ChevronDown size={16} strokeWidth={1.25} className="hidden sm:block shrink-0 text-gray-500" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 min-w-48 p-1.5 rounded-xl bg-white border border-gray-100 shadow-[0_10px_30px_-12px_rgba(26,26,46,0.3)]"
        >
          <DropdownMenu.Item asChild className={itemClass}>
            <Link href={`/dashboard/${role}/profil`}>
              <User {...ICON} size={16} />
              {t.layout.myProfile}
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="my-1 h-px bg-gray-100" />
          <DropdownMenu.Item className={itemClass} onSelect={() => signOut({ callbackUrl: "/connexion" })}>
            <LogOut {...ICON} size={16} />
            {t.layout.signOut}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

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
  premiumDaysLeft,
  onNavigate,
  onClose,
  collapsed = false,
}: {
  navItems: DashboardNavItem[];
  pathname: string;
  favoritesCount: number;
  unreadMessages: number;
  unreadNotifications: number;
  /** Jours restants de l'abonnement au pair actif ; `null` = pas d'abonnement actif */
  premiumDaysLeft: number | null;
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
              <Icon {...ICON} className="shrink-0" />
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

      {/* Statut premium (au pair avec abonnement actif) — la déconnexion est dans le menu de l'avatar.
          Vert profond du logo + doré ; contrastes WCAG AAA sur le point le plus clair du dégradé (#1E4A2C) :
          blanc 10,1:1, doré #F6DFA0 7,7:1. */}
      {premiumDaysLeft !== null && (
        <div className={`border-t border-white/10 ${collapsed ? "p-2" : "p-4"}`}>
          <Link
            href="/dashboard/au-pair/abonnement"
            onClick={onNavigate}
            title={collapsed ? t.layout.premium : undefined}
            className={`flex items-center py-2.5 rounded-xl text-sm font-medium bg-[linear-gradient(135deg,#1E4A2C_0%,#163A22_55%,#0F2A19_100%)] border border-[#D4A93A]/50 text-white shadow-[inset_0_1px_0_rgba(246,223,160,0.15)] hover:border-[#F2C94C] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2C94C] ${itemLayout}`}
          >
            <Crown {...ICON} className="shrink-0 text-[#F2C94C]" />
            {!collapsed && (
              <span className="min-w-0">
                <span className="block truncate">{t.layout.premium}</span>
                <span className="block text-xs font-normal text-[#F6DFA0]">{t.layout.premiumDaysLeft(premiumDaysLeft)}</span>
              </span>
            )}
          </Link>
        </div>
      )}
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
  const [premiumDaysLeft, setPremiumDaysLeft] = useState<number | null>(null);
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
    if (role !== "au-pair") return;
    fetch("/api/subscription")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => setPremiumDaysLeft(json?.active ? (json.daysLeft ?? 0) : null));
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
      <div className={`min-h-dvh flex items-center justify-center ${SPACE_BACKGROUND[role]}`}>
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
    premiumDaysLeft,
  };
  const topBarName = displayName || userName || t.layout.myAccount;

  return (
    <div className={`min-h-dvh flex ${SPACE_BACKGROUND[role]}`}>
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
        <div className="bg-white/70 backdrop-blur-md border-b border-white/80 px-4 sm:px-6 py-3 flex items-center justify-between gap-3 sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="relative md:hidden -ml-1 p-1 text-gray-500 hover:text-[#E87722]"
              aria-label={t.layout.openMenu}
            >
              <Menu {...ICON} />
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
              <Menu {...ICON} />
            </button>
            <Breadcrumb role={role} navItems={navItems} pathname={pathname} />
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <LanguageToggle />
            <Link
              href={`/dashboard/${role}/notifications`}
              className="relative p-2 text-gray-500 hover:text-[#E87722]"
              aria-label={t.layout.notifications}
              title={t.layout.notifications}
            >
              <Bell {...ICON} />
              {unreadNotifications > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </Link>
            <AccountMenu role={role} name={topBarName} photoUrl={photoUrl} />
          </div>
        </div>

        <div className="p-4 sm:p-6">{children}</div>
      </main>
    </div>
  );
}
