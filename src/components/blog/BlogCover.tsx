import { Landmark, Luggage, Mic, ScrollText, Sparkles, Stamp, Users, Wallet, type LucideIcon } from "lucide-react";
import { CountryFlag } from "@/components/ui/CountryFlag";
import type { BlogArticle, BlogCategory, BlogIcon } from "@/content/blog-articles";
import { cn } from "@/lib/utils";

const ICONS: Record<BlogIcon, LucideIcon> = {
  landmark: Landmark,
  scroll: ScrollText,
  mic: Mic,
  sparkles: Sparkles,
  wallet: Wallet,
  users: Users,
  stamp: Stamp,
  luggage: Luggage,
};

/** Couleur de chaque catégorie, tirée de la palette du logo (orange, bleu, vert, indigo, teal). */
export const CATEGORY_COLORS: Record<BlogCategory, string> = {
  guideAuPair: "#E87722",
  guideFamily: "#3A5BA8",
  testimonial: "#3FA45B",
  regulation: "#5B63C9",
  news: "#2A9D8F",
};

/**
 * Couverture d'un article : dégradé de la couleur de sa catégorie, motif de cercles et
 * icône Lucide centrale (+ drapeau du pays concerné le cas échéant).
 */
export function BlogCover({
  article,
  size = "md",
  className,
}: {
  article: Pick<BlogArticle, "icon" | "flag" | "category">;
  size?: "md" | "lg";
  className?: string;
}) {
  const Icon = ICONS[article.icon];
  const color = CATEGORY_COLORS[article.category];
  const lg = size === "lg";

  return (
    <div
      className={cn("relative overflow-hidden flex items-center justify-center", className)}
      style={{ background: `linear-gradient(135deg, ${color} 0%, ${color}CC 55%, #1A1A2E 160%)` }}
    >
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" />
      <div className="absolute -bottom-16 -left-8 w-48 h-48 rounded-full bg-white/[0.07]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 rounded-full border border-white/10" />

      <div
        className={cn(
          "relative flex items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110",
          lg ? "w-24 h-24" : "w-16 h-16"
        )}
      >
        <Icon className={cn("text-white", lg ? "w-11 h-11" : "w-8 h-8")} strokeWidth={1.25} />
        {article.flag && (
          <CountryFlag
            flag={article.flag}
            className={cn(
              "absolute w-auto rounded-[3px] ring-2 ring-white shadow-sm",
              lg ? "-bottom-2 -right-3 h-6" : "-bottom-1.5 -right-2.5 h-4.5"
            )}
          />
        )}
      </div>
    </div>
  );
}
