import { prisma } from "./prisma";
import {
  SUPER_ADMIN_ROLE,
  normalizePermissions,
  type AdminMemberDTO,
  type AdminMemberStatus,
  type AdminRoleDTO,
} from "./admin-permissions";

/**
 * Garantit le rôle système Superadmin (le seul rôle prédéfini) et lui redonne toutes les
 * permissions du catalogue. Idempotent. Les autres rôles sont créés par le superadmin.
 */
export async function ensureSuperAdminRole() {
  const { slug, ...data } = SUPER_ADMIN_ROLE;
  const existing = await prisma.adminRole.findUnique({ where: { slug } });
  if (existing) {
    return prisma.adminRole.update({ where: { id: existing.id }, data: { permissions: data.permissions, isSystem: true } });
  }
  // Un rôle du même nom créé à la main devient le rôle système plutôt que d'échouer sur l'unicité
  const sameName = await prisma.adminRole.findUnique({ where: { name: data.name } });
  if (sameName) return prisma.adminRole.update({ where: { id: sameName.id }, data: { slug, permissions: data.permissions, isSystem: true } });
  return prisma.adminRole.create({ data: { slug, ...data } });
}

const memberSelect = {
  id: true,
  name: true,
  email: true,
  isActive: true,
  isAdminOwner: true,
  adminRoleId: true,
  lastLoginAt: true,
  createdAt: true,
} as const;

type MemberRow = {
  id: string;
  name: string | null;
  email: string;
  isActive: boolean;
  isAdminOwner: boolean;
  adminRoleId: string | null;
  lastLoginAt: Date | null;
  createdAt: Date;
};

const memberStatus = (u: MemberRow): AdminMemberStatus => (u.isActive ? "ACTIVE" : "SUSPENDED");

export function toMemberDTO(u: MemberRow): AdminMemberDTO {
  return {
    id: u.id,
    name: u.name ?? "",
    email: u.email,
    roleId: u.adminRoleId,
    status: memberStatus(u),
    isOwner: u.isAdminOwner,
    lastLoginAt: u.lastLoginAt?.toISOString() ?? null,
    createdAt: u.createdAt.toISOString(),
  };
}

export async function getAdminMember(id: string) {
  const u = await prisma.user.findFirst({ where: { id, role: "ADMIN" }, select: memberSelect });
  return u ? toMemberDTO(u) : null;
}

/** Rôles + administrateurs, pour /admin/equipe */
export async function getAdminTeam(): Promise<{ roles: AdminRoleDTO[]; admins: AdminMemberDTO[] }> {
  await ensureSuperAdminRole();
  const [roles, admins] = await Promise.all([
    prisma.adminRole.findMany({
      orderBy: [{ isSystem: "desc" }, { createdAt: "asc" }],
      include: { _count: { select: { members: { where: { role: "ADMIN" } } } } },
    }),
    prisma.user.findMany({
      where: { role: "ADMIN" },
      orderBy: [{ isAdminOwner: "desc" }, { createdAt: "asc" }],
      select: memberSelect,
    }),
  ]);

  // Les admins historiques sans rôle comptent comme super administrateurs
  const legacyCount = admins.filter((a) => !a.adminRoleId).length;

  return {
    roles: roles.map((r) => ({
      id: r.id,
      name: r.name,
      permissions: normalizePermissions(r.permissions),
      isSystem: r.isSystem,
      memberCount: r._count.members + (r.isSystem ? legacyCount : 0),
    })),
    admins: admins.map(toMemberDTO),
  };
}

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
