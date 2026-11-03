import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin";
import { logAdminActivity } from "@/lib/admin-activity";
import { normalizePermissions } from "@/lib/admin-permissions";
import { getAdminTeam } from "@/lib/admin-team.server";

const forbidden = () => NextResponse.json({ error: "Accès refusé" }, { status: 403 });
const badRequest = (error: string) => NextResponse.json({ error }, { status: 400 });

type RoleBody = { id?: string; name?: string; permissions?: unknown };

function parseRole(body: RoleBody) {
  const name = body.name?.trim() ?? "";
  if (!name) return { error: "Le nom du rôle est obligatoire." } as const;
  return {
    data: {
      name: name.slice(0, 60),
      permissions: normalizePermissions(body.permissions),
    },
  } as const;
}

const nameTaken = (name: string, exceptId?: string) =>
  prisma.adminRole.findFirst({ where: { name: { equals: name, mode: "insensitive" }, NOT: exceptId ? { id: exceptId } : undefined } });

/** POST — crée un rôle (nom libre choisi par le superadmin) */
export async function POST(req: Request) {
  const session = await requireAdminSession("team.manage");
  if (!session) return forbidden();

  const parsed = parseRole((await req.json().catch(() => ({}))) as RoleBody);
  if ("error" in parsed) return badRequest(parsed.error!);
  if (await nameTaken(parsed.data.name)) return NextResponse.json({ error: "Un rôle porte déjà ce nom." }, { status: 409 });

  const role = await prisma.adminRole.create({ data: parsed.data, select: { id: true } });
  await logAdminActivity(session, {
    action: "team.roleCreate", targetType: "ROLE", targetId: role.id, targetLabel: parsed.data.name,
    details: { permissions: parsed.data.permissions },
  }, req);
  return NextResponse.json({ id: role.id, ...(await getAdminTeam()) }, { status: 201 });
}

/** PATCH — modifie un rôle (sauf rôle système) */
export async function PATCH(req: Request) {
  const session = await requireAdminSession("team.manage");
  if (!session) return forbidden();

  const body = (await req.json().catch(() => ({}))) as RoleBody;
  if (!body.id) return badRequest("Paramètres manquants");
  const role = await prisma.adminRole.findUnique({ where: { id: body.id } });
  if (!role) return NextResponse.json({ error: "Rôle introuvable." }, { status: 404 });
  if (role.isSystem) return badRequest("Ce rôle ne peut pas être modifié.");

  const parsed = parseRole(body);
  if ("error" in parsed) return badRequest(parsed.error!);
  if (await nameTaken(parsed.data.name, role.id)) return NextResponse.json({ error: "Un rôle porte déjà ce nom." }, { status: 409 });

  await prisma.adminRole.update({ where: { id: role.id }, data: parsed.data });
  // Droits ajoutés / retirés par rapport à la version précédente
  const before = new Set(role.permissions);
  const after = new Set<string>(parsed.data.permissions);
  await logAdminActivity(session, {
    action: "team.roleUpdate", targetType: "ROLE", targetId: role.id, targetLabel: parsed.data.name,
    details: {
      ...(role.name !== parsed.data.name && { previousName: role.name }),
      added: [...after].filter((p) => !before.has(p)),
      removed: [...before].filter((p) => !after.has(p)),
    },
  }, req);
  return NextResponse.json({ id: role.id, ...(await getAdminTeam()) });
}

/** DELETE ?id= — supprime un rôle personnalisé sans membre */
export async function DELETE(req: Request) {
  const session = await requireAdminSession("team.manage");
  if (!session) return forbidden();

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return badRequest("Paramètres manquants");
  const role = await prisma.adminRole.findUnique({
    where: { id },
    include: { _count: { select: { members: true } } },
  });
  if (!role) return NextResponse.json({ error: "Rôle introuvable." }, { status: 404 });
  if (role.isSystem) return badRequest("Ce rôle ne peut pas être modifié.");
  if (role._count.members > 0) return badRequest("Réaffectez les membres de ce rôle avant de le supprimer.");

  await prisma.adminRole.delete({ where: { id } });
  await logAdminActivity(session, { action: "team.roleDelete", targetType: "ROLE", targetId: id, targetLabel: role.name }, req);
  return NextResponse.json(await getAdminTeam());
}
