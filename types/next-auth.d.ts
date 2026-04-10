import { DefaultSession } from "next-auth";
import type { UserRole } from "@/lib/auth/types";

declare module "next-auth" {
  interface Session {
    userRole: UserRole;
    user?: DefaultSession["user"] & {
      userRole: UserRole;
    };
  }

  interface User {
    userRole: UserRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userRole?: UserRole;
  }
}
