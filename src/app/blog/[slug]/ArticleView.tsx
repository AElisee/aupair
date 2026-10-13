"use client";
import Link from "next/link";
import { ArrowLeft, Clock, Calendar, Tag } from "lucide-react";
import { escapeHtml } from "@/lib/utils";
import { getBlogArticle } from "@/content/blog-articles";
import { useI18n } from "@/i18n";

/** Échappe le texte puis ré-autorise seulement le **gras** en <strong> — protège contre
 * une injection HTML si ce contenu venait un jour d'une source éditable (admin/DB). */
function formatInline(text: string): string {
  return escapeHtml(text).replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
}

export default function ArticleView({ slug }: { slug: string }) {
  const { t, lang, locale } = useI18n();
  const article = getBlogArticle(slug);

  if (!article) {
    return (
      <div className="py-20 text-center">
        <p className="text-gray-500 text-lg mb-4">{t.blog.notFoundTitle}</p>
        <Link href="/blog" className="text-[#E87722] font-semibold hover:underline">← {t.blog.back}</Link>
      </div>
    );
  }

  const text = article[lang];
  const paragraphs = text.content.trim().split("\n\n");
  const date = new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric" }).format(new Date(article.date));

  return (
    <div className="py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Retour */}
        <Link href="/blog" className="inline-flex items-center gap-2 text-gray-500 hover:text-[#E87722] mb-8 text-sm font-medium transition-colors">
          <ArrowLeft className="w-4 h-4" /> {t.blog.back}
        </Link>

        {/* Header article */}
        <div className="bg-[#FFF3E0] rounded-2xl h-48 flex items-center justify-center text-7xl mb-8">
          {article.emoji}
        </div>

        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-semibold text-[#E87722] bg-[#FFF3E0] px-3 py-1 rounded-full flex items-center gap-1">
            <Tag className="w-3 h-3" />{t.blog.categories[article.category]}
          </span>
          <span className="text-xs text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" />{article.readTime}</span>
          <span className="text-xs text-gray-400 flex items-center gap-1"><Calendar className="w-3 h-3" />{date}</span>
        </div>

        <h1 className="text-3xl md:text-4xl font-extrabold text-[#1A1A2E] mb-4 leading-tight">{text.title}</h1>
        <p className="text-gray-500 text-sm mb-8">{t.blog.by(text.author)}</p>

        {/* Contenu */}
        <div className="prose max-w-none">
          {paragraphs.map((p, i) => {
            if (p.startsWith("## ")) {
              return <h2 key={i} className="text-xl font-extrabold text-[#1A1A2E] mt-8 mb-3">{p.replace("## ", "")}</h2>;
            }
            if (p.startsWith("- ")) {
              const items = p.split("\n").filter(l => l.startsWith("- "));
              return (
                <ul key={i} className="space-y-1 mb-4">
                  {items.map((item, j) => (
                    <li key={j} className="text-gray-700 flex items-start gap-2">
                      <span className="text-[#E87722] mt-1">•</span>
                      <span dangerouslySetInnerHTML={{ __html: formatInline(item.replace("- ", "")) }} />
                    </li>
                  ))}
                </ul>
              );
            }
            if (p.startsWith("1. ") || p.match(/^\d\./)) {
              const items = p.split("\n").filter(l => l.match(/^\d\./));
              return (
                <ol key={i} className="space-y-1 mb-4 list-none">
                  {items.map((item, j) => (
                    <li key={j} className="text-gray-700 flex items-start gap-2">
                      <span className="text-[#E87722] font-bold">{j + 1}.</span>
                      <span dangerouslySetInnerHTML={{ __html: formatInline(item.replace(/^\d+\.\s/, "")) }} />
                    </li>
                  ))}
                </ol>
              );
            }
            if (p.trim()) {
              return <p key={i} className="text-gray-700 leading-relaxed mb-4"
                dangerouslySetInnerHTML={{ __html: formatInline(p) }} />;
            }
            return null;
          })}
        </div>

        {/* CTA */}
        <div className="bg-[#E87722] rounded-2xl p-6 mt-10 text-center">
          <h3 className="text-xl font-extrabold text-white mb-2">{t.blog.ctaTitle}</h3>
          <p className="text-white/80 mb-4">{t.blog.ctaText}</p>
          <Link href="/inscription?role=au-pair">
            <button className="bg-white text-[#E87722] px-6 py-2.5 rounded-full font-bold text-sm hover:bg-gray-100 transition-colors">
              {t.blog.ctaButton}
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
