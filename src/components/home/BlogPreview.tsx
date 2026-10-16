"use client";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { BLOG_ARTICLES } from "@/content/blog-articles";
import { BlogCover } from "@/components/blog/BlogCover";
import { useI18n } from "@/i18n";

// Les 3 premiers articles du blog (src/content/blog-articles.ts)
const articles = BLOG_ARTICLES.slice(0, 3);

export default function BlogPreview() {
  const { t, lang, locale } = useI18n();
  const formatDate = (iso: string) =>
    new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-extrabold text-[#1A1A2E] mb-2">{t.home.blogPreview.title}</h2>
            <p className="text-gray-500">{t.home.blogPreview.subtitle}</p>
          </div>
          <Link
            href="/blog"
            className="hidden sm:flex items-center gap-2 text-[#E87722] font-semibold hover:gap-3 transition-all text-sm"
          >
            {t.home.blogPreview.seeAll} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {articles.map((article) => {
            const text = article[lang];
            return (
              <Link key={article.slug} href={`/blog/${article.slug}`} className="group">
                <BlogCover article={article} className="rounded-2xl h-40 mb-4" />
                <div className="px-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-semibold text-[#E87722] bg-[#FFF3E0] px-2 py-1 rounded-full">
                      {t.blog.categories[article.category]}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {article.readTime}
                    </span>
                  </div>
                  <h3 className="font-bold text-[#1A1A2E] mb-2 group-hover:text-[#E87722] transition-colors leading-snug">
                    {text.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{text.excerpt}</p>
                  <p className="text-xs text-gray-400 mt-3">{formatDate(article.date)}</p>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="sm:hidden mt-6 text-center">
          <Link href="/blog" className="text-[#E87722] font-semibold text-sm flex items-center gap-1 justify-center">
            {t.home.blogPreview.seeAll} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
