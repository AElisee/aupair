/**
 * Actions enregistrées dans le journal d'activité du back-office (client-safe).
 * Le code est `module.verbe` ; le préfixe sert de filtre « module » dans /admin/journal.
 * Libellés FR/EN : `adminLogs.actions` dans src/i18n/admin.ts.
 */
export const ADMIN_LOG_ACTIONS = [
  "auth.login",
  "users.validate",
  "users.hide",
  "users.unhide",
  "users.suspend",
  "users.delete",
  "users.restore",
  "users.purge",
  "users.email",
  "moderation.validate",
  "moderation.reject",
  "moderation.report",
  "payments.export",
  "countries.create",
  "countries.update",
  "countries.delete",
  "blog.create",
  "blog.update",
  "blog.delete",
  "faq.create",
  "faq.update",
  "faq.delete",
  "testimonials.publish",
  "testimonials.unpublish",
  "testimonials.delete",
  "tickets.update",
  "tickets.reply",
  "settings.update",
  "settings.documentCreate",
  "settings.documentUpdate",
  "settings.documentDelete",
  "settings.heroImage",
  "team.adminCreate",
  "team.adminUpdate",
  "team.adminPassword",
  "team.adminSuspend",
  "team.adminReactivate",
  "team.adminRemove",
  "team.roleCreate",
  "team.roleUpdate",
  "team.roleDelete",
] as const;

export type AdminLogAction = (typeof ADMIN_LOG_ACTIONS)[number];

/** Modules filtrables (ordre d'affichage) */
export const ADMIN_LOG_MODULES = [
  "auth", "users", "moderation", "payments", "countries", "blog", "faq", "testimonials", "tickets", "settings", "team",
] as const;

export type AdminLogModule = (typeof ADMIN_LOG_MODULES)[number];

export const isAdminLogModule = (v: unknown): v is AdminLogModule =>
  typeof v === "string" && (ADMIN_LOG_MODULES as readonly string[]).includes(v);

/** Ligne du journal telle que renvoyée par GET /api/admin/activity */
export type AdminLogDTO = {
  id: string;
  adminId: string | null;
  adminName: string | null;
  adminEmail: string | null;
  action: string;
  module: string;
  targetType: string | null;
  targetId: string | null;
  targetLabel: string | null;
  details: Record<string, unknown> | null;
  ip: string | null;
  createdAt: string;
};

/** Nombre de lignes par page dans /admin/journal */
export const ADMIN_LOG_PAGE_SIZE = 30;
