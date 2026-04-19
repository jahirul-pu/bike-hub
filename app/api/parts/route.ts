import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bikeSlug = searchParams.get("bike");
    const category = searchParams.get("category");
    const subcategory = searchParams.get("subcategory");

    const parts = await db.part.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Enrich and filter server-side
    let enriched = parts.map((p) => {
      const compatible: string[] = p.compatibleBikes
        ? JSON.parse(p.compatibleBikes)
        : ["Universal"];

      return {
        ...p,
        compatibleBikes: compatible,
        isUniversal: compatible.includes("Universal"),
      };
    });

    // Filter by bike compatibility
    if (bikeSlug && bikeSlug !== "all") {
      enriched = enriched.filter(
        (p) => p.isUniversal || p.compatibleBikes.includes(bikeSlug)
      );
    }

    // Filter by category
    if (category && category !== "All") {
      enriched = enriched.filter((p) => p.category === category);
    }

    // Filter by subcategory
    if (subcategory && subcategory !== "All") {
      enriched = enriched.filter((p) => p.subcategory === subcategory);
    }

    return NextResponse.json(enriched);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch parts" }, { status: 500 });
  }
}
