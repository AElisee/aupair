const stats = [
  { value: "5 000+", label: "Au pairs inscrits", emoji: "👤" },
  { value: "1 200+", label: "Familles d'accueil", emoji: "🏡" },
  { value: "14", label: "Pays africains", emoji: "🌍" },
  { value: "6", label: "Pays d'accueil", emoji: "🌍" },
];

export default function StatsSection() {
  return (
    <section className="bg-white py-16 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-4xl mb-2">{stat.emoji}</div>
              <div className="text-3xl md:text-4xl font-extrabold text-[#E87722]">{stat.value}</div>
              <div className="text-gray-500 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
