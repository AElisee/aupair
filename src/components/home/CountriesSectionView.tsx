"use client";
import Link from "next/link";
import { CountryFlag } from "@/components/ui/CountryFlag";
import { useI18n } from "@/i18n";

export default function CountriesSectionView({ hostCountries }: { hostCountries: { name: string; flag: string }[] }) {
  const { t, tValue } = useI18n();
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-[#1A1A2E] mb-3">{t.home.countries.title}</h2>
          <p className="text-gray-500">{t.home.countries.subtitle}</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {hostCountries.map((country) => (
            <Link
              key={country.name}
              href={`/trouver-famille?pays=${encodeURIComponent(country.name)}`}
              className="bg-[#1A1A2E] rounded-xl p-4 text-center hover:bg-[#E87722] transition-all duration-200 group cursor-pointer"
            >
              <CountryFlag flag={country.flag} className="h-8 w-auto mx-auto mb-2 rounded shadow-sm" />
              <div className="text-sm font-semibold text-white">{tValue(country.name)}</div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
