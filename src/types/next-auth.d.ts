import type { DefaultSession } from "next-auth";
import type { AdminPermission } from "@/lib/admin-permissions";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      /** Permissions du back-office (vide si non ADMIN) */
      permissions: AdminPermission[];
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
    /** Permissions du back-office, recalculées depuis la base à chaque requête */
    perms?: AdminPermission[];
  }
}
