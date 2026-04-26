import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { compare } from "bcryptjs";
import { z } from "zod";
import { findDemoAuthUserByEmail } from "@/lib/auth/demo-store";
import type { UserRole } from "@/lib/auth/types";

const credentialsSchema = z.object({
  email: z.email().trim(),
  password: z.string().min(1),
});

const adminEmail = "admin@bikehub.com";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Google,
    Credentials({
      name: "Email and Password",
      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      async authorize(rawCredentials) {
        const parsed = credentialsSchema.safeParse(rawCredentials);

        if (!parsed.success) {
          return null;
        }

        const user = findDemoAuthUserByEmail(parsed.data.email);
        if (!user) {
          return null;
        }

        const isValidPassword = await compare(parsed.data.password, user.passwordHash);
        if (!isValidPassword) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          userRole: user.userRole,
        };
      },
    }),
  ],
  callbacks: {
    authorized({ auth, request }) {
      const pathname = request.nextUrl.pathname;
      const isAdminPath = pathname === "/admin" || pathname.startsWith("/admin/");
      if (isAdminPath) {
        return auth?.user?.userRole === "Admin" && auth.user.email?.toLowerCase() === adminEmail;
      }

      const isProtectedPath = ["/account", "/sell"].some(
        (path) => pathname === path || pathname.startsWith(`${path}/`)
      );

      if (!isProtectedPath) {
        return true;
      }

      return Boolean(auth?.user);
    },
    jwt({ token, user }) {
      if (user) {
        token.userRole = (user as { userRole?: UserRole }).userRole ?? "User";
      }

      return token;
    },
    session({ session, token }) {
      const userRole = (token.userRole as UserRole | undefined) ?? "User";
      session.userRole = userRole;

      if (session.user) {
        session.user.userRole = userRole;
      }

      return session;
    },
  },
});
