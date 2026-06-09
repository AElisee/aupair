import Link from "next/link";

const originCountries = [
  { name: "Cameroun", flag: "🇨🇲", count: 450 },
  { name: "Côte d'Ivoire", flag: "🇨🇮", count: 380 },
  { name: "Sénégal", flag: "🇸🇳", count: 290 },
  { name: "Mali", flag: "🇲🇱", count: 210 },
  { name: "Bénin", flag: "🇧🇯", count: 180 },
  { name: "Togo", flag: "🇹🇬", count: 160 },
  { name: "Madagascar", flag: "🇲🇬", count: 140 },
  { name: "Ghana", flag: "🇬🇭", count: 130 },
  { name: "Gabon", flag: "🇬🇦", count: 90 },
  { name: "Congo", flag: "🇨🇬", count: 80 },
  { name: "Burkina Faso", flag: "🇧🇫", count: 75 },
  { name: "Maroc", flag: "🇲🇦", count: 200 },
];

const hostCountries = [
  { name: "France", flag: "🇫🇷", count: 620 },
  { name: "Allemagne", flag: "🇩🇪", count: 310 },
  { name: "Belgique", flag: "🇧🇪", count: 180 },
  { name: "Luxembourg", flag: "🇱🇺", count: 95 },
  { name: "Suisse", flag: "🇨🇭", count: 140 },
  { name: "États-Unis", flag: "🇺🇸", count: 85 },
];

export default function CountriesSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Pays d'origine */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-[#1A1A2E] mb-3">
              Au pairs disponibles par pays
            </h2>
            <p className="text-gray-500">Découvrez les au pairs qualifiés venant de toute l'Afrique</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {originCountries.map((country) => (
              <Link
                key={country.name}
                href={`/trouver-au-pair?pays=${encodeURIComponent(country.name)}`}
                className="bg-[#FFF3E0] rounded-xl p-4 text-center hover:bg-[#E87722] hover:text-white transition-all duration-200 group cursor-pointer"
              >
                <div className="text-3xl mb-2">{country.flag}</div>
                <div className="text-sm font-semibold text-[#1A1A2E] group-hover:text-white">{country.name}</div>
                <div className="text-xs text-gray-400 group-hover:text-white/80 mt-1">{country.count} au pairs</div>
              </Link>
            ))}
          </div>
        </div>

        {/* Pays d'accueil */}
        <div>
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-[#1A1A2E] mb-3">
              Familles d'accueil par pays
            </h2>
            <p className="text-gray-500">Des familles qui vous attendent en Europe et en Amérique</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {hostCountries.map((country) => (
              <Link
                key={country.name}
                href={`/trouver-famille?pays=${encodeURIComponent(country.name)}`}
                className="bg-[#1A1A2E] rounded-xl p-4 text-center hover:bg-[#E87722] transition-all duration-200 group cursor-pointer"
              >
                <div className="text-3xl mb-2">{country.flag}</div>
                <div className="text-sm font-semibold text-white">{country.name}</div>
                <div className="text-xs text-gray-400 group-hover:text-white/80 mt-1">{country.count} familles</div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
