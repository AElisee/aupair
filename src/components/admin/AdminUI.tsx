import type { LucideIcon } from "lucide-react";

// Charte : orange de marque + bleu et vert du logo (palette validée daltonisme)
export const ORANGE = "#E87722";
export const BLUE = "#3A5BA8";
export const GREEN = "#3FA45B";
// Teintes froides d'accompagnement : sarcelle (entre le bleu et le vert du logo) et indigo
export const INDIGO = "#5B63C9";
export const NAVY = "#1E3570";
export const TEAL = "#2A9D8F";

/** Taille et graisse uniques des icônes Lucide du back-office */
export const ICON = { size: 20, strokeWidth: 1.25 } as const;

/** Classe du titre de page (h1) du back-office */
export const PAGE_TITLE = "text-2xl sm:text-[28px] font-medium text-[#1A1A2E] tracking-tight";

export const pct = (part: number, total: number) => (total > 0 ? Math.round((part / total) * 100) : 0);

/** Carte du back-office ; `tint` = couleur de marque diffusée en léger dégradé depuis le coin haut gauche */
export function Panel({ className = "", tint, children }: { className?: string; tint?: string; children: React.ReactNode }) {
  return (
    <section
      className={`bg-white/85 backdrop-blur-sm rounded-2xl border border-white shadow-[0_10px_30px_-18px_rgba(30,53,112,0.35)] ${className}`}
      style={tint ? { backgroundImage: `linear-gradient(160deg, ${tint}14 0%, ${tint}06 45%, rgba(255,255,255,0.9) 100%)` } : undefined}
    >
      {children}
    </section>
  );
}

export function IconChip({ icon: Icon, color }: { icon: LucideIcon; color: string }) {
  return (
    <span className="w-9 h-9 shrink-0 rounded-xl flex items-center justify-center" style={{ background: `${color}1F`, color }}>
      <Icon {...ICON} />
    </span>
  );
}

export function PanelHeader({ title, subtitle, action, icon: Icon, color = ORANGE }: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  icon?: LucideIcon;
  color?: string;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
      <div className="flex items-center gap-3">
        {Icon && <IconChip icon={Icon} color={color} />}
        <div>
          <h2 className="text-[15px] font-medium text-[#1A1A2E]">{title}</h2>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

/** KPI façon anneau : l'arc représente un ratio (0–100), l'icône est au centre */
export function KpiCard({ icon: Icon, value, label, caption, ratio, color }: {
  icon: LucideIcon;
  value: number | string;
  label: string;
  caption?: string;
  ratio: number;
  color: string;
}) {
  const r = 23;
  const circumference = 2 * Math.PI * r;
  const filled = Math.max(0, Math.min(100, ratio)) / 100 * circumference;
  return (
    <section
      className="relative overflow-hidden rounded-2xl p-4 flex items-center gap-3.5 border shadow-[0_10px_30px_-18px_rgba(30,53,112,0.35)]"
      style={{
        borderColor: `${color}33`,
        backgroundImage: `linear-gradient(135deg, ${color}24 0%, ${color}0D 55%, #ffffff 100%)`,
      }}
    >
      <div className="relative w-14 h-14 shrink-0" title={caption}>
        <svg viewBox="0 0 56 56" className="w-14 h-14 -rotate-90">
          <circle cx="28" cy="28" r="19" fill="#ffffff" />
          <circle cx="28" cy="28" r={r} fill="none" stroke="#ffffff" strokeWidth={4} />
          <circle
            cx="28" cy="28" r={r} fill="none" stroke={color} strokeWidth={4} strokeLinecap="round"
            strokeDasharray={`${filled} ${circumference}`}
            className="transition-[stroke-dasharray] duration-700"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center" style={{ color }}>
          <Icon {...ICON} />
        </span>
      </div>
      <div className="relative min-w-0">
        <p className="text-2xl font-semibold text-[#1A1A2E] leading-tight tabular-nums truncate">{value}</p>
        <p className="text-sm text-gray-700 leading-snug">{label}</p>
        {caption && <p className="text-xs text-gray-500 leading-snug">{caption}</p>}
      </div>
    </section>
  );
}

export type KpiItem = React.ComponentProps<typeof KpiCard>;

/** Rangée de KPI responsive (même grille que le dashboard) */
export function KpiGrid({ items }: { items: KpiItem[] }) {
  const cols = { 3: "lg:grid-cols-3", 4: "lg:grid-cols-4" }[items.length] ?? "lg:grid-cols-3 xl:grid-cols-5";
  return (
    <div className={`grid grid-cols-1 min-[480px]:grid-cols-2 ${cols} gap-4`}>
      {items.map((kpi) => (
        <KpiCard key={kpi.label} {...kpi} />
      ))}
    </div>
  );
}

/** Anneau de progression (0–100) avec contenu centré */
export function Ring({ ratio, color, size = 112, children }: {
  ratio: number;
  color: string;
  size?: number;
  children: React.ReactNode;
}) {
  const r = 46;
  const circumference = 2 * Math.PI * r;
  const filled = (Math.max(0, Math.min(100, ratio)) / 100) * circumference;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 104 104" className="w-full h-full -rotate-90">
        <circle cx="52" cy="52" r={r} fill="none" stroke={`${color}1F`} strokeWidth={7} />
        <circle
          cx="52" cy="52" r={r} fill="none" stroke={color} strokeWidth={7} strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference}`}
          className="transition-[stroke-dasharray] duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{children}</div>
    </div>
  );
}
