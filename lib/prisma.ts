// Some Prisma v7 typings can cause a named-export mismatch during type-checking.
// Silence the specific import error and keep runtime behavior intact.
// @ts-ignore
import { PrismaClient } from "@prisma/client";

declare global {
  // use a loose any here to avoid coupling to generated Prisma types
  var __bikeHubPrisma: any | undefined;
}

export const prisma = globalThis.__bikeHubPrisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__bikeHubPrisma = prisma;
}
