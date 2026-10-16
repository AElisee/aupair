"use client";
import { Users, Home, Globe2, Plane } from "lucide-react";
import { useI18n } from "@/i18n";

// Même ordre que `home.stats` (src/i18n/site.ts)
const stats = [
  { value: "5 000+", icon: Users },
  { value: "1 200+", icon: Home },
  { value: "14", icon: Globe2 },
  { value: "6", icon: Plane },
];

export default function StatsSection() {
  const { t } = useI18n();
  return (
    <section className="bg-white py-16 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="flex flex-col items-center text-center">
                <div className="w-14 h-14 mb-3 rounded-2xl bg-[#FFF3E0] flex items-center justify-center">
                  <Icon className="w-7 h-7 text-[#E87722]" strokeWidth={1.5} />
                </div>
                <div className="text-3xl md:text-4xl font-extrabold text-[#1A1A2E]">{stat.value}</div>
                <div className="text-gray-500 text-sm mt-1">{t.home.stats[i].label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
