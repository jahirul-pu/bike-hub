import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Pinging database to keep it alive...");
  try {
    const result = await prisma.$queryRaw`SELECT 1 as ping`;
    console.log("Successfully pinged database:", result);
  } catch (error) {
    console.error("Failed to ping database:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
