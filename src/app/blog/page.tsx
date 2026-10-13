"use client";
import { useState } from "react";
import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
import { BLOG_ARTICLES, type BlogCategory } from "@/content/blog-articles";
import { useI18n } from "@/i18n";

const CATEGORIES: BlogCategory[] = ["guideAuPair", "guideFamily", "testimonial", "regulation", "news"];

export default function BlogPage() {
  const { t, lang, locale } = useI18n();
  const [activeCategory, setActiveCategory] = useState<BlogCategory | "all">("all");
  const filtered = activeCategory === "all" ? BLOG_ARTICLES : BLOG_ARTICLES.filter((a) => a.category === activeCategory);
  const formatDate = (iso: string) =>
    new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));

  return (
    <div className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-[#1A1A2E] mb-3">{t.blog.title}</h1>
          <p className="text-gray-500 text-lg">{t.blog.subtitle}</p>
        </div>

        {/* Filtres catégories */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {(["all", ...CATEGORIES] as const).map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                activeCategory === cat ? "bg-[#E87722] text-white" : "bg-gray-100 text-gray-600 hover:bg-[#FFF3E0] hover:text-[#E87722]"
              }`}>
              {cat === "all" ? t.blog.all : t.blog.categories[cat]}
            </button>
          ))}
        </div>

        {/* Grille articles */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((article) => {
            const text = article[lang];
            return (
              <Link key={article.slug} href={`/blog/${article.slug}`} className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
                <div className="h-40 bg-[#FFF3E0] flex items-center justify-center text-6xl group-hover:bg-[#E87722] transition-colors">
                  {article.emoji}
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold text-[#E87722] bg-[#FFF3E0] px-2 py-1 rounded-full">{t.blog.categories[article.category]}</span>
                    <span className="text-xs text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" />{article.readTime}</span>
                  </div>
                  <h2 className="font-bold text-[#1A1A2E] mb-2 group-hover:text-[#E87722] transition-colors leading-snug">{text.title}</h2>
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">{text.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">{formatDate(article.date)}</span>
                    <span className="text-[#E87722] text-xs font-semibold flex items-center gap-1">{t.blog.read} <ArrowRight className="w-3 h-3" /></span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
