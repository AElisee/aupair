"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Circle,
  Eye,
  Heart,
  MapPin,
  MessageCircle,
  Search,
  Users,
  Clock,
  Wallet,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { CountryFlag } from "@/components/ui/CountryFlag";
import { SubscriptionBanner } from "@/components/dashboard/SubscriptionLock";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { BLUE, GREEN, ICON, INDIGO, ORANGE, TEAL, KpiGrid, Panel, PanelHeader, Ring, pct } from "@/components/admin/AdminUI";
import { SUBSCRIPTION_DAYS } from "@/lib/constants";
import { useIsEvening } from "@/hooks/useIsEvening";
import { useI18n } from "@/i18n";

const VIEWS_POLL_INTERVAL_MS = 5000;

interface SuggestedFamily {
  id: string;
  name: string;
  city: string;
  country: string;
  flag: string;
  kids: number;
  hoursPerWeek: number;
  pocketMoney: number;
  photoUrl: string;
}

type MissingField =
  | "gender"
  | "cityOfOrigin"
  | "educationLevel"
  | "childcareExperience"
  | "childcareYears"
  | "preferredDuration"
  | "description"
  | "motivation"
  | "phoneWhatsapp1"
  | "profilePhotoUrl"
  | "availableFrom";

interface DashboardData {
  firstName: string;
  lastName: string;
  status: string;
  isAvailable: boolean;
  profileCompletion: number;
  missingFields: MissingField[];
  profileViews: number;
  favoritesCount: number;
  totalMessages: number;
  unreadMessages: number;
  subscription: { active: boolean; daysLeft: number };
  suggestedFamilies: SuggestedFamily[];
}

function FamilyAvatar({ name, photoUrl }: { name: string; photoUrl: string }) {
  if (photoUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={photoUrl} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0" />;
  }
  return (
    <span className="w-12 h-12 rounded-xl shrink-0 flex items-center justify-center text-base font-medium text-white bg-gradient-to-br from-[#5B7BC8] to-[#3A5BA8]">
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

export default function AuPairDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isAvailable, setIsAvailable] = useState(true);
  const [togglingAvailability, setTogglingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState("");
  const { t, tValue, tError } = useI18n();
  const h = t.auPairHome;
  const isEvening = useIsEvening();

  useEffect(() => {
    let cancelled = false;
    fetch("/api/dashboard/au-pair")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!cancelled && json) {
          setData(json);
          setIsAvailable(json.isAvailable);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const fetchViews = () => {
      fetch("/api/profile/views-count")
        .then((res) => (res.ok ? res.json() : null))
        .then((json) => {
          if (json && !cancelled) {
            setData((prev) => (prev ? { ...prev, profileViews: json.views } : prev));
          }
        });
    };
    const interval = setInterval(fetchViews, VIEWS_POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const handleToggleAvailability = async () => {
    const next = !isAvailable;
    setTogglingAvailability(true);
    setAvailabilityError("");
    try {
      const res = await fetch("/api/profile/availability", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: next }),
      });
      const json = await res.json().catch(() => null);
      if (res.ok) {
        setIsAvailable(next);
      } else {
        setAvailabilityError(tError(json?.error, h.availabilityError));
      }
    } catch {
      setAvailabilityError(t.common.networkError);
    } finally {
      setTogglingAvailability(false);
    }
  };

  const profileCompletion = data?.profileCompletion ?? 0;
  const missingFields = data?.missingFields ?? [];
  const completionColor = profileCompletion >= 80 ? GREEN : ORANGE;
  const subscriptionActive = data?.subscription.active ?? false;
  const daysLeft = data?.subscription.daysLeft ?? 0;
  const expiringSoon = subscriptionActive && daysLeft <= 7;
  const subscriptionColor = !subscriptionActive ? "#D64545" : expiringSoon ? ORANGE : TEAL;
  const userName = data ? `${data.firstName} ${data.lastName.charAt(0)}.` : "";
  const isHiddenByAdmin = data?.status === "HIDDEN";
  const views = data?.profileViews ?? 0;
  const favorites = data?.favoritesCount ?? 0;
  const totalMessages = data?.totalMessages ?? 0;
  const unread = data?.unreadMessages ?? 0;

  const kpis = [
    { icon: BadgeCheck, value: `${profileCompletion}%`, label: h.statCompletion, caption: h.captionCompletion(missingFields.length), ratio: profileCompletion, color: completionColor },
    { icon: Eye, value: views, label: h.statViews, ratio: views > 0 ? 100 : 0, color: BLUE },
    { icon: Heart, value: favorites, label: h.statFavorited, caption: h.captionFavorited(pct(favorites, views)), ratio: pct(favorites, views), color: INDIGO },
    { icon: MessageCircle, value: totalMessages, label: h.statMessages, caption: unread > 0 ? t.common.unread(unread) : h.captionNoUnread, ratio: pct(unread, totalMessages), color: TEAL },
  ];

  const visibilityText = isHiddenByAdmin
    ? h.hiddenByAdmin
    : isAvailable
      ? h.visibleAvailable
      : h.visibleUnavailable;

  return (
    <DashboardLayout role="au-pair" userName={userName}>
      <div className="space-y-6">
        <PageHeader
          title={t.common.greeting(data?.firstName ?? "", isEvening)}
          subtitle={t.common.activitySummary}
          action={
            <Link
              href="/dashboard/au-pair/recherche"
              className="inline-flex items-center gap-2 h-9 px-3.5 rounded-xl bg-gradient-to-r from-[#F08A3C] to-[#E87722] text-white text-sm shadow-[0_6px_16px_-6px_rgba(232,119,34,0.7)] hover:brightness-105 transition"
            >
              <Search {...ICON} size={16} />
              {h.findFamily}
            </Link>
          }
        />

        {data && !subscriptionActive && <SubscriptionBanner message={h.subscribeBanner} />}

        <KpiGrid items={kpis} />

        {/* Complétion du profil + visibilité */}
        <div className="grid lg:grid-cols-3 gap-4">
          <Panel className="p-5 lg:col-span-2" tint={completionColor}>
            <PanelHeader
              title={h.completionTitle}
              subtitle={missingFields.length > 0 ? h.missingCount(missingFields.length) : undefined}
            />
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              <Ring ratio={profileCompletion} color={completionColor}>
                <span className="text-2xl font-semibold text-[#1A1A2E] tabular-nums leading-none">{profileCompletion}%</span>
              </Ring>
              <div className="flex-1 min-w-0">
                {missingFields.length > 0 ? (
                  <>
                    <p className="text-sm text-gray-500 mb-3">{h.completionHint}</p>
                    <ul className="flex flex-wrap gap-2 mb-4">
                      {missingFields.map((field) => (
                        <li key={field}>
                          <Link
                            href="/dashboard/au-pair/profil"
                            className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-lg border border-dashed border-gray-300 bg-white/70 text-xs text-gray-600 hover:border-[#E87722] hover:text-[#E87722] transition-colors"
                          >
                            <Circle className="w-2.5 h-2.5" strokeWidth={2} />
                            {h.missingFields[field]}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <p className="text-sm text-gray-600 mb-4">{h.completionDone}</p>
                )}
                <Link
                  href="/dashboard/au-pair/profil"
                  className="inline-flex items-center gap-1.5 text-sm text-[#E87722] hover:gap-2.5 transition-all"
                >
                  {missingFields.length > 0 ? h.completeProfile : h.viewProfile}
                  <ArrowRight {...ICON} size={16} />
                </Link>
              </div>
            </div>
          </Panel>

          <Panel className="p-5 flex flex-col" tint={isAvailable && !isHiddenByAdmin ? GREEN : undefined}>
            <PanelHeader
              title={h.visibilityTitle}
            />
            <div className="flex items-center justify-between gap-3 rounded-xl bg-white/70 border border-gray-100 px-4 py-3">
              <span className="flex items-center gap-2 text-sm text-[#1A1A2E]">
                <span className={`w-2 h-2 rounded-full ${isAvailable && !isHiddenByAdmin ? "bg-[#3FA45B] animate-pulse" : "bg-gray-300"}`} />
                {isAvailable ? t.common.available : t.common.unavailable}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={isAvailable}
                aria-label={h.visibilityTitle}
                onClick={handleToggleAvailability}
                disabled={togglingAvailability || isHiddenByAdmin}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  isAvailable ? "bg-[#3FA45B]" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow transition-transform ${
                    isAvailable ? "translate-x-[22px]" : "translate-x-[3px]"
                  }`}
                />
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-3">{visibilityText}</p>
            {availabilityError && <p className="text-xs text-red-500 mt-2">{availabilityError}</p>}
          </Panel>
        </div>

        {/* Suggestions + abonnement */}
        <div className="grid lg:grid-cols-3 gap-4">
          <Panel className="p-5 lg:col-span-2" tint={BLUE}>
            <PanelHeader
              title={h.suggestedTitle}
              subtitle={h.suggestedSubtitle}
              action={
                <Link
                  href="/dashboard/au-pair/recherche"
                  className="inline-flex items-center gap-1 text-sm text-[#E87722] whitespace-nowrap hover:gap-2 transition-all"
                >
                  {h.seeAll}
                  <ArrowRight {...ICON} size={16} />
                </Link>
              }
            />
            {data && data.suggestedFamilies.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 bg-white/60 p-6 text-center">
                <Search className="mx-auto mb-2 text-gray-300" {...ICON} />
                <p className="text-sm text-gray-500">{h.noSuggestions}</p>
              </div>
            ) : (
              <ul className="space-y-2.5">
                {(data?.suggestedFamilies ?? []).map((f) => (
                  <li key={f.id}>
                    <Link
                      href={`/dashboard/au-pair/famille/${f.id}`}
                      className="group flex items-center gap-3 p-3 rounded-xl bg-white/80 border border-gray-100 hover:border-[#3A5BA8]/30 hover:shadow-[0_8px_24px_-16px_rgba(30,53,112,0.5)] transition-all"
                    >
                      <FamilyAvatar name={f.name} photoUrl={f.photoUrl} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#1A1A2E] truncate">{f.name}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                          {f.flag ? (
                            <CountryFlag flag={f.flag} className="h-3 w-auto rounded-[2px] shrink-0" />
                          ) : (
                            <MapPin className="w-3 h-3 shrink-0" />
                          )}
                          <span className="truncate">{f.city}, {tValue(f.country)}</span>
                        </p>
                        <div className="flex flex-wrap gap-1.5 mt-2 sm:hidden">
                          <span className="text-[11px] text-gray-500">{t.common.kids(f.kids)} · {t.common.hoursPerWeekShort(f.hoursPerWeek)}</span>
                        </div>
                      </div>
                      <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                        <span className="inline-flex items-center gap-1 h-6 px-2 rounded-md bg-[#3A5BA8]/8 text-[11px] text-[#3A5BA8]">
                          <Users className="w-3 h-3" strokeWidth={1.5} />
                          {t.common.kids(f.kids)}
                        </span>
                        <span className="inline-flex items-center gap-1 h-6 px-2 rounded-md bg-[#2A9D8F]/10 text-[11px] text-[#2A9D8F]">
                          <Clock className="w-3 h-3" strokeWidth={1.5} />
                          {t.common.hoursPerWeekShort(f.hoursPerWeek)}
                        </span>
                      </div>
                      <div className="text-right shrink-0 pl-1">
                        <p className="text-sm font-semibold text-[#E87722] tabular-nums flex items-center gap-1 justify-end">
                          <Wallet className="w-3.5 h-3.5" strokeWidth={1.5} />
                          {t.common.pocketMoney(f.pocketMoney)}
                        </p>
                      </div>
                      <ArrowRight className="hidden sm:block text-gray-300 group-hover:text-[#3A5BA8] group-hover:translate-x-0.5 transition-all shrink-0" {...ICON} size={16} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel className="p-5 flex flex-col" tint={subscriptionColor}>
            <PanelHeader
              title={h.subscriptionTitle}
              action={
                <Badge variant={!subscriptionActive ? "destructive" : expiringSoon ? "warning" : "success"}>
                  {subscriptionActive ? h.active : h.inactive}
                </Badge>
              }
            />
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 py-2">
              <Ring ratio={pct(daysLeft, SUBSCRIPTION_DAYS)} color={subscriptionColor} size={120}>
                <span className="text-3xl font-semibold text-[#1A1A2E] tabular-nums leading-none">{daysLeft}</span>
                <span className="text-[11px] text-gray-500 mt-1 px-4 leading-tight">{h.daysLeft}</span>
              </Ring>
              <p className="text-sm text-gray-500 max-w-[16rem]">
                {subscriptionActive ? h.subscriptionActiveHint : h.subscriptionInactiveHint}
              </p>
            </div>
            <Link
              href="/dashboard/au-pair/abonnement"
              className={`mt-3 inline-flex items-center justify-center gap-2 h-9 rounded-xl text-sm transition ${
                !subscriptionActive || expiringSoon
                  ? "bg-gradient-to-r from-[#F08A3C] to-[#E87722] text-white shadow-[0_6px_16px_-6px_rgba(232,119,34,0.7)] hover:brightness-105"
                  : "border border-gray-200 bg-white/80 text-[#1A1A2E] hover:border-[#E87722]/40"
              }`}
            >
              {subscriptionActive ? h.manageSubscription : h.subscribe}
            </Link>
          </Panel>
        </div>
      </div>
    </DashboardLayout>
  );
}
