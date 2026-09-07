import type { Role } from "@prisma/client";
import type { DefaultSession, DefaultUser } from "next-auth";
import type { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface User extends DefaultUser {
    id: string;
    role: Role;
    businessUnitId: string | null;
    businessUnitName: string | null;
  }

  interface Session {
    user: {
      id: string;
      role: Role;
      businessUnitId: string | null;
      businessUnitName: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    role: Role;
    businessUnitId: string | null;
    businessUnitName: string | null;
  }
}
