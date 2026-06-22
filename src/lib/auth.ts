import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { checkRateLimit, resetRateLimit } from "./rate-limit";

const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

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
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const normalizedEmail = (credentials.email as string).trim().toLowerCase();
        const rateLimitKey = `login:${normalizedEmail}`;

        const { allowed } = await checkRateLimit(rateLimitKey, LOGIN_MAX_ATTEMPTS, LOGIN_WINDOW_MS);
        if (!allowed) return null;

        const user = await prisma.user.findUnique({
          where: { email: normalizedEmail },
        });

        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isValid) return null;
        if (!user.isActive) return null;

        await resetRateLimit(rateLimitKey);

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
    async jwt({ token, user, trigger }) {
      if (user) {
        token.role = (user as { role?: string }).role;
        token.id = user.id;
        const passwordChangedAt = (
          user as { passwordChangedAt?: Date | string | null }
        ).passwordChangedAt;
        token.pwdAt = passwordChangedAt
          ? new Date(passwordChangedAt).getTime()
          : 0;
        return token;
      }

      if (!token.id) return token;

      // Après un changement de mot de passe, le client appelle update() pour
      // resynchroniser pwdAt et garder sa propre session active.
      if (trigger === "update") {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id },
          select: { passwordChangedAt: true },
        });
        token.pwdAt = dbUser?.passwordChangedAt?.getTime() ?? 0;
        return token;
      }

      // Invalide les tokens émis avant le dernier changement de mot de passe
      // (déconnexion des autres sessions) ou si le compte a été désactivé.
      const dbUser = await prisma.user.findUnique({
        where: { id: token.id },
        select: { passwordChangedAt: true, isActive: true },
      });

      if (!dbUser || !dbUser.isActive) {
        delete token.id;
        delete token.role;
        return token;
      }

      const dbPwdAt = dbUser.passwordChangedAt?.getTime() ?? 0;
      if (dbPwdAt > (token.pwdAt ?? 0)) {
        delete token.id;
        delete token.role;
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
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
  },
  events: {
    /** Lors d'une première connexion OAuth, l'adapter crée le User mais pas son profil métier. */
    async createUser({ user }) {
      if (!user.id) return;

      const parts = (user.name ?? "").trim().split(/\s+/).filter(Boolean);
      const firstName = parts[0] || "Utilisateur";
      const lastName = parts.slice(1).join(" ") || "Au Pair";

      await prisma.auPairProfile.create({
        data: {
          userId: user.id,
          status: "PENDING",
          firstName,
          lastName,
          dateOfBirth: new Date("2000-01-01"),
          gender: "",
          nationality: "",
          countryOfOrigin: "",
          languages: [],
          targetCountries: [],
        },
      });
    },
  },
});
