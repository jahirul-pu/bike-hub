import { PrismaClient } from "@prisma/client";

declare global {
  // store the singleton Prisma client with the correct runtime type
  var __bikeHubPrisma: PrismaClient | undefined;
}

export const prisma = globalThis.__bikeHubPrisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__bikeHubPrisma = prisma;
}
