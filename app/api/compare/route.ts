import { NextRequest, NextResponse } from "next/server";
import { bikes, getBikeBySlug } from "@/lib/bikes-data";
import {
  runComparison,
  runAllProfiles,
  type ScoringProfile,
} from "@/lib/comparison-engine";

/**
 * POST /api/compare
 *
 * Body:
 *   { slugs: string[], profile?: ScoringProfile | "all" }
 *
 * Returns:
 *   - Single profile result  (when profile is one of the 4 profiles)
 *   - All profile results    (when profile is "all" or omitted)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slugs, profile } = body as {
      slugs?: string[];
      profile?: ScoringProfile | "all";
    };

    // --- Validation ---
    if (!slugs || !Array.isArray(slugs) || slugs.length < 2 || slugs.length > 3) {
      return NextResponse.json(
        { error: "Provide 2–3 bike slugs in the `slugs` array." },
        { status: 400 }
      );
    }

    const resolvedBikes = slugs
      .map((slug) => getBikeBySlug(slug))
      .filter(Boolean);

    if (resolvedBikes.length < 2) {
      return NextResponse.json(
        { error: "Could not resolve at least 2 valid bikes from the provided slugs." },
        { status: 404 }
      );
    }

    // Check for mixed powertrains
    const powertrains = new Set(resolvedBikes.map((b) => b!.powertrain));
    if (powertrains.size > 1) {
      return NextResponse.json(
        { error: "Cannot compare ICE and EV bikes together." },
        { status: 422 }
      );
    }

    const bikesToCompare = resolvedBikes as NonNullable<typeof resolvedBikes[number]>[];

    // --- Run engine ---
    if (profile && profile !== "all") {
      const validProfiles: ScoringProfile[] = ["balanced", "commuter", "performance", "budget"];
      if (!validProfiles.includes(profile)) {
        return NextResponse.json(
          { error: `Invalid profile. Choose from: ${validProfiles.join(", ")}` },
          { status: 400 }
        );
      }
      const result = runComparison(bikesToCompare, profile);
      return NextResponse.json({ result });
    }

    // Default: run all profiles
    const results = runAllProfiles(bikesToCompare);
    return NextResponse.json({ results });
  } catch (err) {
    console.error("[compare-api]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/compare?slugs=yamaha-r15-v4,bajaj-pulsar-n160&profile=balanced
 *
 * Convenience GET endpoint.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slugsParam = searchParams.get("slugs");
  const profileParam = searchParams.get("profile") ?? "all";

  if (!slugsParam) {
    return NextResponse.json(
      { error: "Provide bike slugs as comma-separated `slugs` query parameter." },
      { status: 400 }
    );
  }

  const slugs = slugsParam.split(",").map((s) => s.trim()).filter(Boolean);

  // Reuse POST logic via internal construction
  const fakeRequest = new NextRequest(request.url, {
    method: "POST",
    body: JSON.stringify({ slugs, profile: profileParam }),
  });

  return POST(fakeRequest);
}
