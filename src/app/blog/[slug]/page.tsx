import type { Metadata } from "next";
import { getBlogArticle } from "@/content/blog-articles";
import ArticleView from "./ArticleView";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getBlogArticle(slug);
  if (!article) return { title: "Article non trouvé — AuPair A.EU" };
  return {
    title: `${article.fr.title} — AuPair A.EU`,
    description: article.fr.excerpt,
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  return <ArticleView slug={slug} />;
}
