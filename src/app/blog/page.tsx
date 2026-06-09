"use client";
import { useState } from "react";
import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";

const articles = [
  { slug: "comment-devenir-au-pair-en-france-2026", title: "Comment devenir au pair en France en 2026 ?", excerpt: "Visa, contrat, droits et démarches : le guide complet pour réussir votre candidature au pair en France depuis l'Afrique.", category: "Guide au pair", readTime: "5 min", date: "5 mars 2026", emoji: "🇫🇷" },
  { slug: "regles-aupair-europe", title: "Les règles à connaître avant votre séjour au pair en Europe", excerpt: "Conditions de travail, visa de long séjour, assurance santé, droits et devoirs : tout ce qu'il faut savoir.", category: "Réglementation", readTime: "7 min", date: "28 fév. 2026", emoji: "📋" },
  { slug: "temoignage-cameroun-lyon", title: "Mon expérience au pair depuis le Cameroun jusqu'à Lyon", excerpt: "Aminata partage son parcours, les pièges à éviter et ses conseils pour trouver une bonne famille.", category: "Témoignage", readTime: "4 min", date: "20 fév. 2026", emoji: "🎙️" },
  { slug: "matching-aupair-famille-conseils", title: "Comment AuPair A.EU améliore la mise en relation au pair/famille", excerpt: "Algorithme de matching, messagerie sécurisée, profils vérifiés : les nouvelles fonctionnalités de la plateforme.", category: "Nouveautés", readTime: "3 min", date: "15 fév. 2026", emoji: "✨" },
  { slug: "argent-poche-aupair-europe", title: "Combien gagne un au pair en Europe ? Comparatif par pays", excerpt: "France : 350-400€/mois, Allemagne : 380-500€, Suisse : 500-700€... Le comparatif complet des argents de poche.", category: "Guide au pair", readTime: "6 min", date: "10 fév. 2026", emoji: "💰" },
  { slug: "famille-accueil-choisir-aupair", title: "Familles d'accueil : comment bien choisir votre au pair africain ?", excerpt: "Les critères essentiels pour choisir un au pair qualifié, de confiance et compatible avec votre famille.", category: "Guide famille", readTime: "5 min", date: "3 fév. 2026", emoji: "👨‍👩‍👧" },
  { slug: "visa-au-pair-cameroun-senegal-cotedivoire", title: "Visa au pair : guide complet pour les ressortissants africains", excerpt: "Toutes les étapes pour obtenir votre visa au pair depuis le Cameroun, le Sénégal, la Côte d'Ivoire et 11 autres pays africains.", category: "Réglementation", readTime: "8 min", date: "25 jan. 2026", emoji: "🛂" },
  { slug: "preparer-valise-au-pair-europe", title: "Comment préparer sa valise pour partir au pair en Europe ?", excerpt: "Vêtements, documents, médicaments, budget de départ : la checklist complète pour partir serein depuis l'Afrique.", category: "Guide au pair", readTime: "4 min", date: "18 jan. 2026", emoji: "🧳" },
  { slug: "temoignage-kofi-berlin", title: "Kofi, 23 ans, au pair à Berlin : 'Je n'aurais jamais imaginé vivre ça'", excerpt: "Un jeune Ghanéen raconte son quotidien dans une famille allemande, ses galères avec la langue et ses plus belles découvertes.", category: "Témoignage", readTime: "5 min", date: "10 jan. 2026", emoji: "🇩🇪" },
];

const categories = ["Tous", "Guide au pair", "Guide famille", "Témoignage", "Réglementation", "Nouveautés", "Checklist"];

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState("Tous");
  const filtered = activeCategory === "Tous" ? articles : articles.filter(a => a.category === activeCategory);

  return (
    <div className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-[#1A1A2E] mb-3">Blog AuPair A.EU</h1>
          <p className="text-gray-500 text-lg">Guides, témoignages et actualités pour votre aventure au pair</p>
        </div>

        {/* Filtres catégories */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {categories.map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                activeCategory === cat ? "bg-[#E87722] text-white" : "bg-gray-100 text-gray-600 hover:bg-[#FFF3E0] hover:text-[#E87722]"
              }`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Grille articles */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((article) => (
            <Link key={article.slug} href={`/blog/${article.slug}`} className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
              <div className="h-40 bg-[#FFF3E0] flex items-center justify-center text-6xl group-hover:bg-[#E87722] transition-colors">
                {article.emoji}
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold text-[#E87722] bg-[#FFF3E0] px-2 py-1 rounded-full">{article.category}</span>
                  <span className="text-xs text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" />{article.readTime}</span>
                </div>
                <h2 className="font-bold text-[#1A1A2E] mb-2 group-hover:text-[#E87722] transition-colors leading-snug">{article.title}</h2>
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{article.excerpt}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{article.date}</span>
                  <span className="text-[#E87722] text-xs font-semibold flex items-center gap-1">Lire <ArrowRight className="w-3 h-3" /></span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
