import NextAuth, { CredentialsSignin } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { checkRateLimit, resetRateLimit } from "./rate-limit";
import { ADMIN_SESSION_MAX_AGE_MS } from "./constants";
import { resolveAdminPermissions } from "./admin-permissions";
import { logAdminActivity } from "./admin-activity";
import { needsOnboarding, ONBOARDING_USER_SELECT } from "./onboarding";

/** "jean.dupont@gmail.com" → "je***@gmail.com" (logs). */
function maskEmail(email?: string | null) {
  if (!email) return "(sans email)";
  const at = email.indexOf("@");
  return `${email.slice(0, Math.min(2, Math.max(at, 0)))}***${at >= 0 ? email.slice(at) : ""}`;
}

/** Inscription à finaliser (compte Google/Facebook sans profil, ou profil incomplet). */
async function readOnboarding(userId: string): Promise<boolean> {
  const u = await prisma.user.findUnique({ where: { id: userId }, select: ONBOARDING_USER_SELECT });
  return u ? needsOnboarding(u) : false;
}

const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

/** Identifiants valides mais profil pas encore validé par l'admin (code lu par /connexion). */
class PendingValidationError extends CredentialsSignin {
  code = "pending_validation";
}

/** Identifiants valides mais inscription refusée par la modération (code lu par /connexion). */
class AccountRejectedError extends CredentialsSignin {
  code = "account_rejected";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    FacebookProvider({
      clientId: process.env.AUTH_FACEBOOK_ID!,
      clientSecret: process.env.AUTH_FACEBOOK_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials, request) {
        if (!credentials?.email || !credentials?.password) return null;

        const normalizedEmail = (credentials.email as string).trim().toLowerCase();
        const rateLimitKey = `login:${normalizedEmail}`;

        const { allowed } = await checkRateLimit(rateLimitKey, LOGIN_MAX_ATTEMPTS, LOGIN_WINDOW_MS);
        if (!allowed) return null;

        const user = await prisma.user.findUnique({
          where: { email: normalizedEmail },
          include: {
            auPairProfile: { select: { status: true } },
            familyProfile: { select: { status: true } },
          },
        });

        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isValid) return null;
        if (!user.isActive) return null;

        await resetRateLimit(rateLimitKey);

        if (user.role === "ADMIN") {
          await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
          await logAdminActivity({ user }, { action: "auth.login", targetType: "ADMIN", targetId: user.id, targetLabel: user.name ?? user.email }, request);
        }

        // Pas de connexion tant que l'admin n'a pas validé le profil. Vérifié après le
        // mot de passe pour ne pas révéler le statut d'un compte à un tiers.
        const profileStatus =
          user.auPairProfile?.status ?? user.familyProfile?.status;
        if (profileStatus === "PENDING") throw new PendingValidationError();
        if (profileStatus === "REJECTED") throw new AccountRejectedError();

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          passwordChangedAt: user.passwordChangedAt,
        };
      },
    }),
  ],
  callbacks: {
    /**
     * Connexion OAuth (Google/Facebook). Une première connexion crée le compte (User seul, sans
     * profil métier) : l'utilisateur doit ensuite remplir les champs obligatoires du formulaire
     * d'inscription sur `/inscription/completer` (cf. `needsOnboarding`, imposé par proxy.ts) avant
     * d'accéder à son espace. Pour un compte existant, mêmes refus que la connexion par mot de
     * passe (inactif, rejeté, en attente — sauf s'il doit encore finaliser son inscription).
     */
    async signIn({ user, account, profile }) {
      if (account?.type === "credentials") return true;

      const email = user.email?.trim().toLowerCase();
      // Raison du refus dans les logs serveur (adresse masquée) : l'utilisateur ne voit qu'un message générique.
      const refuse = (reason: string, error: string) => {
        console.warn(`[auth] Connexion ${account?.provider ?? "OAuth"} refusée (${reason}) pour ${maskEmail(email)}`);
        return `/connexion?error=${error}`;
      };

      if (!email) return refuse("email absent", "oauth_not_allowed");
      // Google : l'adresse doit être vérifiée, sinon la liaison automatique par email
      // (allowDangerousEmailAccountLinking) permettrait de prendre le contrôle d'un compte.
      if (account?.provider === "google" && profile?.email_verified !== true) {
        return refuse("email Google non vérifié", "oauth_not_allowed");
      }

      const existing = await prisma.user.findUnique({
        where: { email },
        select: {
          ...ONBOARDING_USER_SELECT,
          isActive: true,
          auPairProfile: { select: { ...ONBOARDING_USER_SELECT.auPairProfile.select, status: true } },
          familyProfile: { select: { ...ONBOARDING_USER_SELECT.familyProfile.select, status: true } },
        },
      });
      if (!existing) return true; // nouveau compte → finalisation de l'inscription
      // Le back-office reste accessible uniquement par mot de passe (journalisé, session plafonnée).
      if (existing.role === "ADMIN") return refuse("compte administrateur", "oauth_not_allowed");
      if (!existing.isActive) return refuse("compte désactivé", "oauth_not_allowed");

      const status = existing.auPairProfile?.status ?? existing.familyProfile?.status;
      if (status === "REJECTED") return refuse("inscription rejetée", "account_rejected");
      if (needsOnboarding(existing)) return true;
      if (status === "PENDING") return refuse("profil en attente de validation", "pending_validation");
      return true;
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        token.role = (user as { role?: string }).role;
        token.id = user.id;
        if (token.role === "ADMIN" && user.id) {
          const admin = await prisma.user.findUnique({
            where: { id: user.id },
            select: { role: true, adminRole: { select: { permissions: true, isSystem: true } } },
          });
          token.perms = admin ? resolveAdminPermissions(admin) : [];
        }
        token.loginAt = Date.now();
        const passwordChangedAt = (
          user as { passwordChangedAt?: Date | string | null }
        ).passwordChangedAt;
        token.pwdAt = passwordChangedAt
          ? new Date(passwordChangedAt).getTime()
          : 0;
        token.onboarding = user.id ? await readOnboarding(user.id) : false;
        return token;
      }

      // Retourner null invalide la session : Auth.js supprime alors le cookie, au lieu
      // de laisser traîner un token sans id/rôle que le client prendrait pour une
      // session encore valide (bouton « Profil » qui ne mène nulle part).
      if (!token.id) return null;

      // Après un changement de mot de passe, le client appelle update() pour
      // resynchroniser pwdAt et garder sa propre session active.
      if (trigger === "update") {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id },
          select: { passwordChangedAt: true, ...ONBOARDING_USER_SELECT },
        });
        token.pwdAt = dbUser?.passwordChangedAt?.getTime() ?? 0;
        // Aussi appelé par /inscription/completer une fois l'inscription finalisée
        token.onboarding = dbUser ? needsOnboarding(dbUser) : false;
        return token;
      }

      // Session ADMIN à durée de vie plafonnée, indépendamment de l'activité — le
      // back-office donne accès aux paiements et à la modération, donc on force une
      // reconnexion régulière même si le token est encore valide par ailleurs.
      if (
        token.role === "ADMIN" &&
        Date.now() - (token.loginAt ?? 0) > ADMIN_SESSION_MAX_AGE_MS
      ) {
        return null;
      }

      // Invalide les tokens émis avant le dernier changement de mot de passe
      // (déconnexion des autres sessions) ou si le compte a été désactivé.
      const dbUser = await prisma.user.findUnique({
        where: { id: token.id },
        select: {
          passwordChangedAt: true,
          isActive: true,
          role: true,
          adminRole: { select: { permissions: true, isSystem: true } },
          auPairProfile: { select: { ...ONBOARDING_USER_SELECT.auPairProfile.select, status: true } },
          familyProfile: { select: { ...ONBOARDING_USER_SELECT.familyProfile.select, status: true } },
        },
      });

      if (!dbUser || !dbUser.isActive) return null;

      // Inscription rejetée par la modération : la session déjà ouverte est fermée.
      const profileStatus = dbUser.auPairProfile?.status ?? dbUser.familyProfile?.status;
      if (profileStatus === "REJECTED") return null;

      // Rôle et permissions relus à chaque requête : un changement de rôle ou de
      // permissions par un autre admin s'applique immédiatement côté API.
      token.role = dbUser.role;
      token.perms = resolveAdminPermissions(dbUser);
      token.onboarding = needsOnboarding(dbUser);

      const dbPwdAt = dbUser.passwordChangedAt?.getTime() ?? 0;
      if (dbPwdAt > (token.pwdAt ?? 0)) return null;

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.permissions = token.perms ?? [];
        session.user.onboarding = token.onboarding === true;
      }
      return session;
    },
  },
  pages: {
    signIn: "/connexion",
    error: "/connexion",
  },
  session: {
    strategy: "jwt",
    // Session glissante de 30 jours pour les utilisateurs classiques (confort attendu sur ce
    // type de plateforme) ; la session ADMIN est en plus plafonnée à ADMIN_SESSION_MAX_AGE_MS
    // ci-dessus, indépendamment de cette valeur.
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
});
