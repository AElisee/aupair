import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";

const articles = [
  {
    slug: "comment-devenir-au-pair-en-france",
    title: "Comment devenir au pair en France en 2026 ?",
    excerpt: "Toutes les étapes pour réussir votre demande de visa, trouver une famille et vous préparer à votre aventure française.",
    category: "Guide au pair",
    readTime: "5 min",
    date: "5 mars 2026",
  },
  {
    slug: "regles-au-pair-europe",
    title: "Les règles à connaître avant votre séjour au pair en Europe",
    excerpt: "Visa, contrat, droits et devoirs : tout ce que vous devez savoir avant de vous envoler vers votre famille d'accueil.",
    category: "Réglementation",
    readTime: "7 min",
    date: "28 fév. 2026",
  },
  {
    slug: "temoignage-aupair-cameroun",
    title: "Mon expérience au pair depuis le Cameroun : le secret d'une réussite",
    excerpt: "Aminata partage son parcours depuis Yaoundé jusqu'à Lyon, ses conseils et les pièges à éviter.",
    category: "Témoignage",
    readTime: "4 min",
    date: "20 fév. 2026",
  },
];

export default function BlogPreview() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-extrabold text-[#1A1A2E] mb-2">
              Notre blog AuPair A.EU
            </h2>
            <p className="text-gray-500">Guides, conseils et témoignages pour votre aventure</p>
          </div>
          <Link
            href="/blog"
            className="hidden sm:flex items-center gap-2 text-[#E87722] font-semibold hover:gap-3 transition-all text-sm"
          >
            Voir tous les articles <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {articles.map((article) => (
            <Link key={article.slug} href={`/blog/${article.slug}`} className="group">
              <div className="bg-[#FFF3E0] rounded-2xl h-40 mb-4 flex items-center justify-center group-hover:bg-[#E87722] transition-colors">
                <span className="text-4xl">📖</span>
              </div>
              <div className="px-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-semibold text-[#E87722] bg-[#FFF3E0] px-2 py-1 rounded-full">
                    {article.category}
                  </span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {article.readTime}
                  </span>
                </div>
                <h3 className="font-bold text-[#1A1A2E] mb-2 group-hover:text-[#E87722] transition-colors leading-snug">
                  {article.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">{article.excerpt}</p>
                <p className="text-xs text-gray-400 mt-3">{article.date}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="sm:hidden mt-6 text-center">
          <Link href="/blog" className="text-[#E87722] font-semibold text-sm flex items-center gap-1 justify-center">
            Voir tous les articles <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
