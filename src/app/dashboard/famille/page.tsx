"use client";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, MessageCircle, Eye, Heart } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/i18n";

const VIEWS_POLL_INTERVAL_MS = 5000;

interface SuggestedAuPair {
  id: string;
  firstName: string;
  profilePhotoUrl: string;
  age: number;
  country: string;
  flag: string;
  languages: string[];
  experience: number;
}

interface DashboardData {
  name: string;
  city: string;
  country: string;
  profileCompletion: number;
  profileViews: number;
  favoritesCount: number;
  totalMessages: number;
  unreadMessages: number;
  suggestedAuPairs: SuggestedAuPair[];
}

export default function FamilleDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const { t, tValue, tList } = useI18n();

  useEffect(() => {
    let cancelled = false;
    fetch("/api/dashboard/famille")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!cancelled && json) setData(json);
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

  const profileCompletion = data?.profileCompletion ?? 0;

  const stats = [
    { icon: Eye, label: t.familyHome.statViews, value: data?.profileViews ?? 0 },
    {
      icon: MessageCircle,
      label: t.familyHome.statMessages,
      value: data?.totalMessages ?? 0,
      trend: data && data.unreadMessages > 0 ? t.common.unread(data.unreadMessages) : undefined,
    },
    {
      icon: Heart,
      label: t.familyHome.statFavorites,
      value: data?.favoritesCount ?? 0,
    },
  ];

  return (
    <DashboardLayout
      role="famille"
      userName={data?.name ?? ""}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1A1A2E]">
            {t.common.greeting(data?.name ?? "")}
          </h1>
          <p className="text-gray-500">{t.common.activitySummary}</p>
        </div>

        {/* Alerte profil incomplet */}
        {profileCompletion < 100 && (
          <div className="bg-[#FFF3E0] border border-[#E87722]/30 rounded-2xl p-5 flex items-start gap-4">
            <div className="w-10 h-10 bg-[#E87722] rounded-full flex items-center justify-center  shrink-0">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-[#1A1A2E] mb-1">
                {t.familyHome.completeTitle(profileCompletion)}
              </p>
              <p className="text-sm text-gray-500 mb-3">
                {t.familyHome.completeHint}
              </p>
              <Link href="/dashboard/famille/profil">
                <Button size="sm">{t.familyHome.completeProfile}</Button>
              </Link>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-center"
              >
                <div className="w-10 h-10 bg-[#FFF3E0] rounded-full flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-5 h-5 text-[#E87722]" />
                </div>
                <div className="text-2xl font-extrabold text-[#1A1A2E]">
                  {s.value}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                {s.trend && (
                  <div className="text-xs text-[#E87722] mt-1 font-medium">
                    {s.trend}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Au pairs suggérés */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between gap-2 flex-wrap mb-4">
            <h3 className="font-bold text-[#1A1A2E]">
              {t.familyHome.suggestedTitle}
            </h3>
            <Link
              href="/dashboard/famille/recherche"
              className="text-[#E87722] text-sm font-semibold whitespace-nowrap"
            >
              {t.familyHome.seeAll}
            </Link>
          </div>
          {data && data.suggestedAuPairs.length === 0 ? (
            <p className="text-sm text-gray-500">
              {t.familyHome.noSuggestions}
            </p>
          ) : (
            <div className="space-y-3">
              {(data?.suggestedAuPairs ?? []).map((ap) => (
                <Link
                  key={ap.id}
                  href={`/dashboard/famille/au-pair/${ap.id}`}
                  className="flex items-center justify-between gap-2 p-3 bg-[#F5F5F5] rounded-xl hover:bg-[#FFF3E0] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-[#E87722] rounded-full flex items-center justify-center text-white font-bold text-sm overflow-hidden shrink-0">
                      {ap.profilePhotoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={ap.profilePhotoUrl}
                          alt={ap.firstName}
                          className="w-full h-full object-cover object-top"
                        />
                      ) : (
                        ap.firstName.charAt(0)
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-[#1A1A2E] text-sm truncate">
                        {ap.firstName}, {t.common.age(ap.age)}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {ap.flag} {tValue(ap.country)} · {tList(ap.languages)}
                      </p>
                    </div>
                  </div>
                  <Badge variant="success" className="shrink-0">{t.familyHome.experienceBadge(ap.experience)}</Badge>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
