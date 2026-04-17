import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const parts = await db.part.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(parts);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch parts" }, { status: 500 });
  }
}
