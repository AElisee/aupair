/**
 * Catalogue des permissions du back-office : des modules (une page du menu admin) et, pour
 * chacun, les actions qu'un rôle peut se voir accorder. Une permission s'écrit `module.action`.
 *
 * Aucun rôle métier n'est figé dans le code : seul le rôle système « Superadmin » existe par
 * défaut ; le superadmin crée et nomme les autres rôles et coche leurs actions.
 *
 * Client-safe (aucun import serveur) : partagé par /admin/equipe, `requireAdminSession`, la
 * session JWT et le menu admin.
 */

export const ADMIN_MODULES = [
  { key: "dashboard", actions: ["view"] },
  { key: "users", actions: ["view", "suspend", "delete", "email"] },
  { key: "moderation", actions: ["view", "validate"] },
  { key: "reports", actions: ["view", "resolve"] },
  { key: "payments", actions: ["view", "export"] },
  { key: "countries", actions: ["view", "create", "update", "delete"] },
  { key: "blog", actions: ["view", "create", "update", "delete"] },
  { key: "faq", actions: ["view", "create", "update", "delete"] },
  { key: "testimonials", actions: ["view", "publish", "delete"] },
  { key: "tickets", actions: ["view", "reply"] },
  { key: "settings", actions: ["view", "update"] },
  { key: "logs", actions: ["view"] },
] as const;

type Module = (typeof ADMIN_MODULES)[number];
export type AdminModuleKey = Module["key"];
export type AdminActionKey = Module["actions"][number];
type ModulePermission<M> = M extends { key: infer K extends string; actions: readonly (infer A extends string)[] } ? `${K}.${A}` : never;

/** Gestion de l'équipe (administrateurs, rôles) : réservée au Superadmin, jamais attribuable */
export const TEAM_PERMISSION = "team.manage" as const;

/** Permission attribuable à un rôle */
export type ModuleActionPermission = ModulePermission<Module>;
export type AdminPermission = ModuleActionPermission | typeof TEAM_PERMISSION;

export const modulePermissions = (mod: (typeof ADMIN_MODULES)[number]) =>
  mod.actions.map((a) => `${mod.key}.${a}` as ModuleActionPermission);

/** Toutes les permissions attribuables, dans l'ordre du catalogue */
export const GRANTABLE_PERMISSIONS: ModuleActionPermission[] = ADMIN_MODULES.flatMap(modulePermissions);

export const ALL_ADMIN_PERMISSIONS: AdminPermission[] = [...GRANTABLE_PERMISSIONS, TEAM_PERMISSION];

const moduleOf = (p: string) => p.split(".")[0];
const viewOf = (p: string) => `${moduleOf(p)}.view` as ModuleActionPermission;

export function isGrantablePermission(value: unknown): value is ModuleActionPermission {
  return typeof value === "string" && (GRANTABLE_PERMISSIONS as string[]).includes(value);
}

/**
 * Coche/décoche une action. Toute action d'un module implique « Consulter » ce module ;
 * décocher « Consulter » retire donc tout le module.
 */
export function togglePermission(current: ModuleActionPermission[], permission: ModuleActionPermission, enabled: boolean): ModuleActionPermission[] {
  const set = new Set(current);
  if (enabled) {
    set.add(permission);
    set.add(viewOf(permission));
  } else if (permission === viewOf(permission)) {
    for (const p of [...set]) if (moduleOf(p) === moduleOf(permission)) set.delete(p);
  } else {
    set.delete(permission);
  }
  return GRANTABLE_PERMISSIONS.filter((p) => set.has(p));
}

/** Active ou retire toutes les actions d'un module */
export function toggleModule(current: ModuleActionPermission[], moduleKey: AdminModuleKey, enabled: boolean): ModuleActionPermission[] {
  const mod = ADMIN_MODULES.find((m) => m.key === moduleKey)!;
  const set = new Set(current);
  for (const p of modulePermissions(mod)) {
    if (enabled) set.add(p);
    else set.delete(p);
  }
  return GRANTABLE_PERMISSIONS.filter((p) => set.has(p));
}

/** Nettoie une liste reçue (client ou base) : permissions attribuables connues, « Consulter » inclus, ordre canonique */
export function normalizePermissions(values: unknown): ModuleActionPermission[] {
  if (!Array.isArray(values)) return [];
  return values.filter(isGrantablePermission).reduce<ModuleActionPermission[]>((acc, p) => togglePermission(acc, p, true), []);
}

/**
 * Permissions effectives d'un utilisateur : aucune s'il n'est pas ADMIN ; toutes (dont la
 * gestion de l'équipe) pour le rôle système ou un admin sans rôle (comptes historiques).
 */
export function resolveAdminPermissions(user: {
  role: string;
  adminRole?: { permissions: string[]; isSystem: boolean } | null;
}): AdminPermission[] {
  if (user.role !== "ADMIN") return [];
  if (!user.adminRole || user.adminRole.isSystem) return [...ALL_ADMIN_PERMISSIONS];
  return normalizePermissions(user.adminRole.permissions);
}

/** Permission(s) requise(s) pour ouvrir chaque page du back-office (liste vide = tout admin) */
export const PAGE_PERMISSIONS: { prefix: string; anyOf: AdminPermission[] }[] = [
  { prefix: "/admin/utilisateurs", anyOf: ["users.view"] },
  { prefix: "/admin/moderation", anyOf: ["moderation.view"] },
  { prefix: "/admin/signalements", anyOf: ["reports.view"] },
  { prefix: "/admin/profil", anyOf: ["users.view", "moderation.view", "reports.view"] },
  { prefix: "/admin/paiements", anyOf: ["payments.view"] },
  { prefix: "/admin/pays", anyOf: ["countries.view"] },
  { prefix: "/admin/blog", anyOf: ["blog.view"] },
  { prefix: "/admin/faq", anyOf: ["faq.view"] },
  { prefix: "/admin/avis", anyOf: ["testimonials.view"] },
  { prefix: "/admin/tickets", anyOf: ["tickets.view"] },
  { prefix: "/admin/equipe", anyOf: [TEAM_PERMISSION] },
  { prefix: "/admin/journal", anyOf: ["logs.view"] },
  { prefix: "/admin/parametres/compte", anyOf: [] },
  { prefix: "/admin/parametres", anyOf: ["settings.view"] },
];

/** L'admin peut-il ouvrir cette page ? (le dashboard /admin exige dashboard.view) */
export function canAccessAdminPath(pathname: string, permissions: readonly AdminPermission[]) {
  if (pathname === "/admin" || pathname === "/admin/") return permissions.includes("dashboard.view");
  const rule = PAGE_PERMISSIONS.find((r) => pathname.startsWith(r.prefix));
  if (!rule || rule.anyOf.length === 0) return true;
  return rule.anyOf.some((p) => permissions.includes(p));
}

/** Première page accessible : redirection d'un admin sans accès au dashboard */
export function firstAccessibleAdminPath(permissions: readonly AdminPermission[]) {
  const candidates = [
    "/admin", "/admin/moderation", "/admin/signalements", "/admin/utilisateurs", "/admin/paiements", "/admin/tickets",
    "/admin/avis", "/admin/blog", "/admin/faq", "/admin/pays", "/admin/parametres/constantes", "/admin/journal",
  ];
  return candidates.find((p) => canAccessAdminPath(p, permissions)) ?? "/admin/parametres/compte";
}

export type AdminMemberStatus = "ACTIVE" | "SUSPENDED";

/** Longueur minimale du mot de passe défini par le superadmin (même règle que la réinitialisation) */
export const ADMIN_PASSWORD_MIN_LENGTH = 8;

/** Rôle tel que renvoyé par GET /api/admin/team */
export type AdminRoleDTO = {
  id: string;
  name: string;
  /** Attribuables uniquement (le Superadmin les a toutes, plus la gestion de l'équipe) */
  permissions: ModuleActionPermission[];
  isSystem: boolean;
  memberCount: number;
};

/** Administrateur tel que renvoyé par GET /api/admin/team */
export type AdminMemberDTO = {
  id: string;
  name: string;
  email: string;
  /** null = admin historique sans rôle, traité comme Superadmin */
  roleId: string | null;
  status: AdminMemberStatus;
  isOwner: boolean;
  lastLoginAt: string | null;
  createdAt: string;
};

export const SUPER_ADMIN_SLUG = "super-admin";

/** Seul rôle créé par défaut (seed) : toutes les permissions, non modifiable ni supprimable */
export const SUPER_ADMIN_ROLE = {
  slug: SUPER_ADMIN_SLUG,
  name: "Superadmin",
  description: "Accès complet à la plateforme, y compris la gestion des administrateurs et des rôles.",
  color: "#E87722",
  permissions: GRANTABLE_PERMISSIONS as string[],
  isSystem: true,
};
