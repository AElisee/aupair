import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin";
import { logAdminActivity } from "@/lib/admin-activity";
import { EMAIL_REGEX, getAdminMember, getAdminTeam } from "@/lib/admin-team.server";
import { ADMIN_PASSWORD_MIN_LENGTH } from "@/lib/admin-permissions";

const forbidden = () => NextResponse.json({ error: "Accès refusé" }, { status: 403 });
const badRequest = (error: string) => NextResponse.json({ error }, { status: 400 });
const PASSWORD_ERROR = `Le mot de passe doit contenir au moins ${ADMIN_PASSWORD_MIN_LENGTH} caractères.`;
const validPassword = (p: unknown): p is string => typeof p === "string" && p.length >= ADMIN_PASSWORD_MIN_LENGTH && p.length <= 128;

/** GET — rôles et administrateurs */
export async function GET() {
  const session = await requireAdminSession("team.manage");
  if (!session) return forbidden();
  const team = await getAdminTeam();
  return NextResponse.json({ ...team, currentUserId: session.user.id });
}

/** POST — crée un administrateur avec le mot de passe défini par le superadmin */
export async function POST(req: Request) {
  const session = await requireAdminSession("team.manage");
  if (!session) return forbidden();

  const body = (await req.json().catch(() => ({}))) as {
    name?: string;
    email?: string;
    roleId?: string;
    password?: string;
  };
  const name = body.name?.trim() ?? "";
  const email = body.email?.trim().toLowerCase() ?? "";
  if (!name || !email || !body.roleId) return badRequest("Nom, email et rôle sont obligatoires.");
  if (!EMAIL_REGEX.test(email)) return badRequest("Adresse email invalide.");
  if (!validPassword(body.password)) return badRequest(PASSWORD_ERROR);

  const role = await prisma.adminRole.findUnique({ where: { id: body.roleId } });
  if (!role) return badRequest("Rôle introuvable.");

  const existing = await prisma.user.findUnique({ where: { email }, select: { role: true } });
  if (existing) {
    return NextResponse.json(
      { error: existing.role === "ADMIN" ? "Un administrateur utilise déjà cet email." : "Cet email est déjà utilisé par un compte utilisateur." },
      { status: 409 }
    );
  }

  const user = await prisma.user.create({
    data: { name, email, password: await bcrypt.hash(body.password, 10), role: "ADMIN", isVerified: true, adminRoleId: role.id },
    select: { id: true },
  });

  await logAdminActivity(session, { action: "team.adminCreate", targetType: "ADMIN", targetId: user.id, targetLabel: name, details: { role: role.name } }, req);
  return NextResponse.json({ admin: await getAdminMember(user.id) }, { status: 201 });
}

/** PATCH — modifie le nom, le rôle et/ou le mot de passe, suspend ou réactive */
export async function PATCH(req: Request) {
  const session = await requireAdminSession("team.manage");
  if (!session) return forbidden();

  const body = (await req.json().catch(() => ({}))) as {
    id?: string;
    action?: "update" | "suspend" | "reactivate";
    name?: string;
    roleId?: string;
    /** Optionnel : nouveau mot de passe (vide = inchangé) */
    password?: string;
  };
  if (!body.id || !body.action) return badRequest("Paramètres manquants");

  const target = await prisma.user.findFirst({
    where: { id: body.id, role: "ADMIN" },
    select: { id: true, name: true, email: true, isAdminOwner: true, adminRoleId: true },
  });
  if (!target) return NextResponse.json({ error: "Administrateur introuvable." }, { status: 404 });
  const targetLabel = target.name || target.email;

  const isSelf = target.id === session.user.id;

  if (body.action === "update") {
    const name = body.name?.trim();
    if (!name || !body.roleId) return badRequest("Nom, email et rôle sont obligatoires.");
    if (target.isAdminOwner || isSelf) {
      // Le propriétaire et soi-même gardent leur rôle (évite de se retirer l'accès)
      const current = await prisma.user.findUnique({ where: { id: target.id }, select: { adminRoleId: true } });
      if (current?.adminRoleId !== body.roleId) {
        return badRequest(target.isAdminOwner ? "Le compte propriétaire ne peut pas être modifié." : "Vous ne pouvez pas modifier votre propre rôle.");
      }
    }
    const newPassword = body.password ? body.password : null;
    if (newPassword !== null) {
      if (!validPassword(newPassword)) return badRequest(PASSWORD_ERROR);
      // Son propre mot de passe se change depuis « Mon compte » ; celui du propriétaire est protégé
      if (isSelf) return badRequest("Changez votre propre mot de passe depuis « Mon compte ».");
      if (target.isAdminOwner) return badRequest("Le compte propriétaire ne peut pas être modifié.");
    }
    const role = await prisma.adminRole.findUnique({ where: { id: body.roleId }, select: { id: true, name: true } });
    if (!role) return badRequest("Rôle introuvable.");
    await prisma.user.update({
      where: { id: target.id },
      data: {
        name,
        adminRoleId: role.id,
        // passwordChangedAt déconnecte les sessions ouvertes avec l'ancien mot de passe
        ...(newPassword !== null && { password: await bcrypt.hash(newPassword, 10), passwordChangedAt: new Date() }),
      },
    });
    await logAdminActivity(session, {
      action: "team.adminUpdate", targetType: "ADMIN", targetId: target.id, targetLabel: name,
      details: { ...(target.adminRoleId !== role.id && { role: role.name }), ...(name !== target.name && { name }) },
    }, req);
    // Le mot de passe fait l'objet d'une ligne à part (action sensible)
    if (newPassword !== null) {
      await logAdminActivity(session, { action: "team.adminPassword", targetType: "ADMIN", targetId: target.id, targetLabel: name }, req);
    }
    return NextResponse.json({ admin: await getAdminMember(target.id) });
  }

  // suspend / reactivate
  if (target.isAdminOwner) return badRequest("Le compte propriétaire ne peut pas être modifié.");
  if (isSelf) return badRequest("Vous ne pouvez pas suspendre votre propre compte.");
  await prisma.user.update({ where: { id: target.id }, data: { isActive: body.action === "reactivate" } });
  await logAdminActivity(session, {
    action: body.action === "reactivate" ? "team.adminReactivate" : "team.adminSuspend",
    targetType: "ADMIN", targetId: target.id, targetLabel,
  }, req);
  return NextResponse.json({ admin: await getAdminMember(target.id) });
}

/** DELETE ?id= — retire l'accès : supprime le compte administrateur */
export async function DELETE(req: Request) {
  const session = await requireAdminSession("team.manage");
  if (!session) return forbidden();

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return badRequest("Paramètres manquants");

  const target = await prisma.user.findFirst({
    where: { id, role: "ADMIN" },
    select: { id: true, name: true, email: true, isAdminOwner: true, auPairProfile: { select: { id: true } }, familyProfile: { select: { id: true } } },
  });
  if (!target) return NextResponse.json({ error: "Administrateur introuvable." }, { status: 404 });
  if (target.isAdminOwner) return badRequest("Le compte propriétaire ne peut pas être modifié.");
  if (target.id === session.user.id) return badRequest("Vous ne pouvez pas retirer votre propre accès.");

  if (target.auPairProfile || target.familyProfile) {
    // Compte promu depuis un profil existant : on lui retire seulement le rôle admin
    await prisma.user.update({
      where: { id: target.id },
      data: { role: target.auPairProfile ? "AU_PAIR" : "FAMILLE", adminRoleId: null },
    });
  } else {
    await prisma.user.delete({ where: { id: target.id } });
  }
  await logAdminActivity(session, { action: "team.adminRemove", targetType: "ADMIN", targetId: target.id, targetLabel: target.name || target.email }, req);
  return NextResponse.json({ success: true });
}
