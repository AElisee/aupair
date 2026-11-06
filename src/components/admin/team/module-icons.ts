import {
  DollarSign, FileText, Flag, Globe, HelpCircle, History, LayoutDashboard, Mail, MessageSquareQuote, Settings, Shield, Users,
  type LucideIcon,
} from "lucide-react";
import type { AdminModuleKey } from "@/lib/admin-permissions";

/** Icône de chaque module (mêmes icônes que le menu admin) */
export const MODULE_ICONS: Record<AdminModuleKey, LucideIcon> = {
  dashboard: LayoutDashboard,
  users: Users,
  moderation: Shield,
  reports: Flag,
  payments: DollarSign,
  countries: Globe,
  blog: FileText,
  faq: HelpCircle,
  testimonials: MessageSquareQuote,
  tickets: Mail,
  settings: Settings,
  logs: History,
};

/** Initiales d'un nom (ou d'un email) pour les avatars */
export const initials = (name: string, email = "") =>
  (name || email).split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");
