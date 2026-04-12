// Lightweight re-export so pages can import { db } from '@/lib/db'
import { prisma } from "./prisma";

export const db = prisma;
