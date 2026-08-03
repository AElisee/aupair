import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }

  interface User {
    role?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    /** Timestamp (ms) de `User.passwordChangedAt` au moment de l'émission/rafraîchissement du token. */
    pwdAt?: number;
    /** Timestamp (ms) de connexion initiale — sert à plafonner la durée de vie des sessions ADMIN. */
    loginAt?: number;
  }
}
