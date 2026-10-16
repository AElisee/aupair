"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Clock, Search, SearchX } from "lucide-react";
import { BLOG_ARTICLES, type BlogArticle, type BlogCategory } from "@/content/blog-articles";
import { BlogCover, CATEGORY_COLORS } from "@/components/blog/BlogCover";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";

const CATEGORIES: BlogCategory[] = ["guideAuPair", "guideFamily", "testimonial", "regulation", "news"];

function CategoryBadge({ category }: { category: BlogCategory }) {
  const { t } = useI18n();
  const color = CATEGORY_COLORS[category];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
      style={{ color, backgroundColor: `${color}14` }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
      {t.blog.categories[category]}
    </span>
  );
}

function ArticleMeta({ article }: { article: BlogArticle }) {
  const { locale } = useI18n();
  const date = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" }).format(
    new Date(article.date)
  );
  return (
    <div className="flex items-center gap-3 text-xs text-gray-500">
      <span>{date}</span>
      <span className="w-1 h-1 rounded-full bg-gray-300" />
      <span className="inline-flex items-center gap-1">
        <Clock className="w-3.5 h-3.5" strokeWidth={1.75} />
        {article.readTime}
      </span>
    </div>
  );
}

function FeaturedCard({ article }: { article: BlogArticle }) {
  const { t, lang } = useI18n();
  const text = article[lang];
  return (
    <Link
      href={`/blog/${article.slug}`}
      className="group grid md:grid-cols-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden transition-shadow hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E87722]"
    >
      <BlogCover article={article} size="lg" className="aspect-16/10 md:aspect-auto md:min-h-80" />
      <div className="p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="rounded-full bg-[#1A1A2E] px-2.5 py-1 text-xs font-medium text-white">{t.blog.featured}</span>
          <CategoryBadge category={article.category} />
        </div>
        <h2 className="text-2xl lg:text-3xl font-semibold text-[#1A1A2E] leading-tight group-hover:text-[#E87722] transition-colors">
          {text.title}
        </h2>
        <p className="text-gray-500 mt-3 leading-relaxed line-clamp-3">{text.excerpt}</p>
        <div className="mt-6 flex items-center justify-between gap-4">
          <ArticleMeta article={article} />
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#E87722]">
            {t.blog.read}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function ArticleCard({ article }: { article: BlogArticle }) {
  const { lang } = useI18n();
  const text = article[lang];
  return (
    <Link
      href={`/blog/${article.slug}`}
      className="group flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E87722]"
    >
      <BlogCover article={article} className="aspect-16/9" />
      <div className="flex-1 flex flex-col p-5">
        <div className="mb-3">
          <CategoryBadge category={article.category} />
        </div>
        <h3 className="font-semibold text-[#1A1A2E] leading-snug group-hover:text-[#E87722] transition-colors">
          {text.title}
        </h3>
        <p className="text-sm text-gray-500 mt-2 line-clamp-2">{text.excerpt}</p>
        <div className="mt-auto pt-4 flex items-center justify-between">
          <ArticleMeta article={article} />
          <ArrowRight className="w-4 h-4 text-[#E87722] transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}

export default function BlogPage() {
  const { t, lang } = useI18n();
  const [activeCategory, setActiveCategory] = useState<BlogCategory | "all">("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return BLOG_ARTICLES.filter((a) => {
      if (activeCategory !== "all" && a.category !== activeCategory) return false;
      if (!query) return true;
      const text = a[lang];
      return text.title.toLowerCase().includes(query) || text.excerpt.toLowerCase().includes(query);
    });
  }, [activeCategory, search, lang]);

  // L'article à la une n'apparaît que sur la vue « Tous » sans recherche
  const showFeatured = activeCategory === "all" && !search.trim() && filtered.length > 0;
  const featured = showFeatured ? filtered[0] : undefined;
  const rest = showFeatured ? filtered.slice(1) : filtered;

  const counts = useMemo(() => {
    const map = new Map<BlogCategory, number>();
    BLOG_ARTICLES.forEach((a) => map.set(a.category, (map.get(a.category) ?? 0) + 1));
    return map;
  }, []);

  const reset = () => {
    setSearch("");
    setActiveCategory("all");
  };

  return (
    <div className="bg-[#F5F5F5] min-h-screen">
      {/* ─── Hero ─────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1A1A2E 0%, #16213e 50%, #0f3460 100%)" }}
      >
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#E87722] opacity-15 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#E87722] opacity-5 rounded-full blur-2xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-10 sm:pt-16 sm:pb-12 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">{t.blog.title}</h1>
          <p className="text-gray-300 mt-3 max-w-2xl mx-auto text-sm sm:text-base">{t.blog.subtitle}</p>

          <div className="relative mt-6 max-w-xl mx-auto text-left">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <input
              type="search"
              inputMode="search"
              placeholder={t.blog.searchPlaceholder}
              aria-label={t.blog.searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-12 sm:h-14 pl-12 pr-4 rounded-2xl bg-white text-base text-gray-800 shadow-lg focus:outline-none focus:ring-4 focus:ring-[#E87722]/40"
            />
          </div>

          <div className="mt-5 -mx-4 px-4 sm:mx-auto sm:px-0 w-fit max-w-[calc(100%+2rem)] sm:max-w-full flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {(["all", ...CATEGORIES] as const).map((cat) => {
              const active = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  aria-pressed={active}
                  className={cn(
                    "shrink-0 h-10 px-4 inline-flex items-center gap-2 rounded-full text-sm font-medium transition-colors",
                    active ? "bg-[#E87722] text-white" : "bg-white/10 text-white hover:bg-white/20"
                  )}
                >
                  {cat === "all" ? t.blog.all : t.blog.categories[cat]}
                  <span className="text-xs opacity-70">{cat === "all" ? BLOG_ARTICLES.length : counts.get(cat) ?? 0}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Articles ─────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 py-16 px-6 text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#FFF3E0] flex items-center justify-center">
              <SearchX className="w-6 h-6 text-[#E87722]" strokeWidth={1.75} />
            </div>
            <p className="font-medium text-[#1A1A2E]">{t.blog.noResults}</p>
            <Button variant="outline" className="mt-5" onClick={reset}>
              {t.blog.resetSearch}
            </Button>
          </div>
        ) : (
          <>
            {featured && (
              <div className="mb-8 sm:mb-10">
                <FeaturedCard article={featured} />
              </div>
            )}

            {rest.length > 0 && (
              <>
                <p className="text-sm text-gray-500 mb-4" aria-live="polite">
                  {t.blog.articlesCount(filtered.length)}
                </p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                  {rest.map((article) => (
                    <ArticleCard key={article.slug} article={article} />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
