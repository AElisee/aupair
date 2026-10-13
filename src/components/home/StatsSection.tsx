"use client";
import { useI18n } from "@/i18n";

const stats = [
  { value: "5 000+", emoji: "👤" },
  { value: "1 200+", emoji: "🏡" },
  { value: "14", emoji: "🌍" },
  { value: "6", emoji: "🌍" },
];

export default function StatsSection() {
  const { t } = useI18n();
  return (
    <section className="bg-white py-16 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-4xl mb-2">{stat.emoji}</div>
              <div className="text-3xl md:text-4xl font-extrabold text-[#E87722]">{stat.value}</div>
              <div className="text-gray-500 text-sm mt-1">{t.home.stats[i].label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
