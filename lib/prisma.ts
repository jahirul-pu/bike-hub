import { PrismaClient } from "@prisma/client";

declare global {
  var __bikeHubPrisma: PrismaClient | undefined;
}

export const prisma = globalThis.__bikeHubPrisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__bikeHubPrisma = prisma;
}
