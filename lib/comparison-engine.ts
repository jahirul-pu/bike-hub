import { type Bike, bikes, formatBdt } from "@/lib/bikes-data";

/* ═══════════════════════════════════════════════════════════════════
 *  TYPES
 * ═══════════════════════════════════════════════════════════════════ */

export type ScoringProfile = "balanced" | "commuter" | "performance" | "budget";

export type MetricKey =
  | "power"
  | "torque"
  | "range"
  | "costPerKm"
  | "weight"
  | "features"
  | "price";

export type ProfileWeights = Record<MetricKey, number>;

export type NormalizedMetrics = Record<MetricKey, number>;

export type StrengthTier = "significantly_better" | "better" | "similar";

export type StrengthComparison = {
  metric: MetricKey;
  metricLabel: string;
  tier: StrengthTier;
  winnerSlug: string;
  winnerValue: number;
  loserValue: number;
  percentDiff: number;
};

export type BikeScore = {
  slug: string;
  brand: string;
  model: string;
  rawMetrics: Record<MetricKey, number>;
  normalizedMetrics: NormalizedMetrics;
  weightedScore: number;
  metricScores: Record<MetricKey, number>; // individual weighted scores
};

export type ComparisonVerdict = "clear_winner" | "balanced";

export type SmartRecommendation = {
  slug: string;
  brand: string;
  model: string;
  topStrengths: string[];
};

export type ComparisonResult = {
  profile: ScoringProfile;
  profileLabel: string;
  bikes: BikeScore[];
  winner: { slug: string; verdict: ComparisonVerdict } | null;
  scoreDifference: number;
  strengths: StrengthComparison[];
  recommendations: SmartRecommendation[];
  summary: string;
  computedAt: string;
};

/* ═══════════════════════════════════════════════════════════════════
 *  SCORING PROFILES
 * ═══════════════════════════════════════════════════════════════════ */

export const PROFILE_WEIGHTS: Record<ScoringProfile, ProfileWeights> = {
  balanced: {
    power: 0.20,
    torque: 0.10,
    range: 0.15,
    costPerKm: 0.20,
    weight: 0.10,
    features: 0.10,
    price: 0.15,
  },
  commuter: {
    power: 0.025,
    torque: 0.025,
    range: 0.15,
    costPerKm: 0.40,
    weight: 0.10,
    features: 0.10,
    price: 0.20,
  },
  performance: {
    power: 0.35,
    torque: 0.20,
    range: 0.10,
    costPerKm: 0.05,
    weight: 0.15,
    features: 0.10,
    price: 0.05,
  },
  budget: {
    power: 0.025,
    torque: 0.025,
    range: 0.15,
    costPerKm: 0.35,
    weight: 0.05,
    features: 0.10,
    price: 0.35,
  },
};

export const PROFILE_LABELS: Record<ScoringProfile, string> = {
  balanced: "Balanced",
  commuter: "Daily Commuter",
  performance: "Performance",
  budget: "Budget Friendly",
};

export const METRIC_LABELS: Record<MetricKey, string> = {
  power: "Power Output",
  torque: "Torque",
  range: "Estimated Range",
  costPerKm: "Running Cost",
  weight: "Weight",
  features: "Features & Tech",
  price: "Price",
};

// Metrics where lower values are better (inverted scoring)
const INVERTED_METRICS: Set<MetricKey> = new Set(["costPerKm", "weight", "price"]);

/* ═══════════════════════════════════════════════════════════════════
 *  RAW METRIC EXTRACTION
 * ═══════════════════════════════════════════════════════════════════ */

/**
 * Compute a 0–10 feature score based on available features.
 * Each feature present adds to the score.
 */
function computeFeatureScore(bike: Bike): number {
  let score = 0;
  const checks: [string | undefined, number][] = [
    // Electronics & display
    [bike.displayType === "Digital" ? "yes" : undefined, 0.5],
    [bike.headlightType === "LED" ? "yes" : undefined, 0.5],
    [bike.drl, 0.3],
    [bike.tailLightType === "LED" ? "yes" : undefined, 0.3],
    [bike.turnSignalType === "LED" ? "yes" : undefined, 0.3],
    // Connectivity
    [bike.bluetoothConnectivity?.toLowerCase() !== "no" ? bike.bluetoothConnectivity : undefined, 0.8],
    [bike.navigation?.toLowerCase() !== "no" ? bike.navigation : undefined, 0.8],
    [bike.gpsTracking, 0.6],
    [bike.usbChargingPort?.toLowerCase() !== "no" ? bike.usbChargingPort : undefined, 0.5],
    [bike.appSupport?.toLowerCase() !== "no" ? bike.appSupport : undefined, 0.6],
    [bike.otaUpdates?.toLowerCase() !== "no" ? bike.otaUpdates : undefined, 0.5],
    // Safety
    [bike.absType && bike.absType !== "None" ? bike.absType : undefined, 1.0],
    [bike.tractionControl?.toLowerCase() !== "no" ? bike.tractionControl : undefined, 0.8],
    [bike.cbs?.toLowerCase() !== "no" ? bike.cbs : undefined, 0.4],
    [bike.engineKillSwitch?.toLowerCase() !== "no" ? bike.engineKillSwitch : undefined, 0.3],
    [bike.sideStandCutOff?.toLowerCase() !== "no" ? bike.sideStandCutOff : undefined, 0.3],
    // Performance features
    [bike.ridingModes?.toLowerCase() !== "no" ? bike.ridingModes : undefined, 0.8],
    [bike.cruiseControl?.toLowerCase() !== "no" ? bike.cruiseControl : undefined, 0.5],
    [bike.quickShifter?.toLowerCase() !== "no" ? bike.quickShifter : undefined, 0.5],
    [bike.keylessStart?.toLowerCase() !== "no" ? bike.keylessStart : undefined, 0.5],
  ];

  for (const [value, weight] of checks) {
    if (value && value.toLowerCase() !== "no") {
      score += weight;
    }
  }

  // Clamp to 0–10
  return Math.min(10, Math.round(score * 10) / 10);
}

/**
 * Extract power metric (hp-equivalent, unified for ICE and EV).
 */
function extractPower(bike: Bike): number {
  // Use maxPower if available (parse "18.9 HP @ 10000 RPM")
  if (bike.maxPower) {
    const match = bike.maxPower.match(/([\d.]+)\s*HP/i);
    if (match?.[1]) return Number(match[1]);
  }
  // For ICE: approximate from displacement
  if (bike.powertrain === "ICE" && bike.displacementCc) {
    return Number(((bike.displacementCc * 0.085)).toFixed(1));
  }
  // For EV: convert kW to hp (1 kW ≈ 1.34 hp)
  if (bike.motorPowerKw) {
    return Number((bike.motorPowerKw * 1.34).toFixed(1));
  }
  return 0;
}

/**
 * Compute cost per km in BDT.
 * ICE: fuel_price / mileage. EV: electricity_cost * battery_kWh / range.
 */
function computeCostPerKm(bike: Bike): number {
  const FUEL_PRICE_BDT = 117; // approximate petrol price per liter in BD
  const ELEC_PRICE_BDT = 8;   // approximate per kWh in BD

  if (bike.powertrain === "ICE") {
    const mileage = bike.mileageKmpl ?? 40;
    return Number((FUEL_PRICE_BDT / mileage).toFixed(2));
  } else {
    const range = bike.rangeKm ?? 100;
    const batteryKwh = bike.rangeKm ? Number((bike.rangeKm * 0.035).toFixed(1)) : Number(((bike.motorPowerKw ?? 4) * 0.9).toFixed(1));
    return Number(((batteryKwh * ELEC_PRICE_BDT) / range).toFixed(2));
  }
}

/**
 * Extract torque metric (unified for ICE and EV).
 */
function extractTorque(bike: Bike): number {
  if (bike.torqueNm) return bike.torqueNm;
  
  if (bike.maxTorque) {
    const match = bike.maxTorque.match(/([\d.]+)\s*Nm/i);
    if (match?.[1]) return Number(match[1]);
  }
  return 0;
}

/**
 * Extract all raw metric values from a bike.
 */
export function extractRawMetrics(bike: Bike): Record<MetricKey, number> {
  // Common sense fallback for ICE range calculation if data is missing
  const iceRange = (bike.mileageKmpl ?? 40) * (bike.fuelTankLiters ?? 10);
  
  return {
    power: extractPower(bike),
    torque: extractTorque(bike),
    range: bike.powertrain === "ICE" ? iceRange : (bike.rangeKm ?? 0),
    costPerKm: computeCostPerKm(bike),
    weight: bike.weightKg,
    features: computeFeatureScore(bike),
    price: bike.priceBdt,
  };
}

/* ═══════════════════════════════════════════════════════════════════
 *  MIN-MAX NORMALIZATION
 * ═══════════════════════════════════════════════════════════════════ */

/**
 * Normalize raw values to a 0–10 scale using min-max normalization.
 * For inverted metrics (lower is better), the scale is reversed.
 */
export function normalizeMetrics(
  bikesRawMetrics: Record<MetricKey, number>[],
  referenceRawMetrics: Record<MetricKey, number>[]
): NormalizedMetrics[] {
  const metricKeys: MetricKey[] = ["power", "torque", "range", "costPerKm", "weight", "features", "price"];

  // Compute min/max for each metric using the global reference
  const mins: Record<string, number> = {};
  const maxs: Record<string, number> = {};

  for (const key of metricKeys) {
    const refValues = referenceRawMetrics.map((m) => m[key]);
    mins[key] = Math.min(...refValues);
    maxs[key] = Math.max(...refValues);
  }

  return bikesRawMetrics.map((raw) => {
    const normalized: Partial<NormalizedMetrics> = {};

    for (const key of metricKeys) {
      const range = maxs[key] - mins[key];

      if (range === 0) {
        // All bikes have the same value → mid-score
        normalized[key] = 5;
      } else {
        const base = (raw[key] - mins[key]) / range; // 0..1

        if (INVERTED_METRICS.has(key)) {
          // Lower is better → invert
          normalized[key] = Number(((1 - base) * 10).toFixed(2));
        } else {
          // Higher is better
          normalized[key] = Number((base * 10).toFixed(2));
        }
      }
    }

    return normalized as NormalizedMetrics;
  });
}

/* ═══════════════════════════════════════════════════════════════════
 *  WEIGHTED SCORE COMPUTATION
 * ═══════════════════════════════════════════════════════════════════ */

export function computeWeightedScore(
  normalized: NormalizedMetrics,
  weights: ProfileWeights
): { total: number; breakdown: Record<MetricKey, number> } {
  const metricKeys: MetricKey[] = ["power", "torque", "range", "costPerKm", "weight", "features", "price"];
  let total = 0;
  const breakdown: Partial<Record<MetricKey, number>> = {};

  for (const key of metricKeys) {
    const score = normalized[key] * weights[key];
    breakdown[key] = Number(score.toFixed(3));
    total += score;
  }

  return {
    total: Number(total.toFixed(2)),
    breakdown: breakdown as Record<MetricKey, number>,
  };
}

/* ═══════════════════════════════════════════════════════════════════
 *  STRENGTH DETECTION
 * ═══════════════════════════════════════════════════════════════════ */

export function detectStrengths(bikeScores: BikeScore[]): StrengthComparison[] {
  if (bikeScores.length < 2) return [];

  const metricKeys: MetricKey[] = ["power", "torque", "range", "costPerKm", "weight", "features", "price"];
  const strengths: StrengthComparison[] = [];

  for (const key of metricKeys) {
    // Find best and worst normalized scores
    const sorted = [...bikeScores].sort((a, b) => b.normalizedMetrics[key] - a.normalizedMetrics[key]);
    const best = sorted[0];
    const worst = sorted[sorted.length - 1];

    const bestScore = best.normalizedMetrics[key];
    const worstScore = worst.normalizedMetrics[key];

    const bestRaw = best.rawMetrics[key];
    const worstRaw = worst.rawMetrics[key];

    if (bestRaw === worstRaw) continue;

    // Use raw values for difference calculation to prevent artificial inflation from 0-10 normalization
    const diff = Math.abs(bestRaw - worstRaw);
    const denominator = Math.max(bestRaw, worstRaw);
    
    const percentDiff = denominator > 0 ? (diff / denominator) * 100 : 0;

    let tier: StrengthTier = "similar";
    // Adjust thresholds for raw metrics
    if (percentDiff > 18) {
      tier = "significantly_better";
    } else if (percentDiff > 8) {
      tier = "better";
    }

    if (tier !== "similar") {
      strengths.push({
        metric: key,
        metricLabel: METRIC_LABELS[key],
        tier,
        winnerSlug: best.slug,
        winnerValue: best.rawMetrics[key],
        loserValue: worst.rawMetrics[key],
        percentDiff: Number(percentDiff.toFixed(1)),
      });
    }
  }

  // Sort by percent difference descending
  return strengths.sort((a, b) => b.percentDiff - a.percentDiff);
}

/* ═══════════════════════════════════════════════════════════════════
 *  SMART SUMMARY GENERATION
 * ═══════════════════════════════════════════════════════════════════ */

function generateRecommendations(
  bikeScores: BikeScore[],
  strengths: StrengthComparison[]
): SmartRecommendation[] {
  return bikeScores.map((bike) => {
    const bikeStrengths = strengths
      .filter((s) => s.winnerSlug === bike.slug)
      .map((s) => {
        const prefix = s.tier === "significantly_better" ? "significantly" : "noticeably";
        return `${prefix} better ${s.metricLabel.toLowerCase()}`;
      });

    return {
      slug: bike.slug,
      brand: bike.brand,
      model: bike.model,
      topStrengths: bikeStrengths.slice(0, 5),
    };
  });
}

function generateSummaryText(
  bikeScores: BikeScore[],
  winner: { slug: string; verdict: ComparisonVerdict } | null,
  recommendations: SmartRecommendation[],
  profile: ScoringProfile
): string {
  const sorted = [...bikeScores].sort((a, b) => b.weightedScore - a.weightedScore);
  const top = sorted[0];
  const profileLabel = PROFILE_LABELS[profile];

  if (!winner || winner.verdict === "balanced") {
    return `Both bikes are very closely matched for ${profileLabel.toLowerCase()} use. ${top.brand} ${top.model} edges ahead marginally with a score of ${top.weightedScore.toFixed(1)}/10, but the difference is negligible. Choose based on personal preference and brand affinity.`;
  }

  const winnerBike = sorted.find((b) => b.slug === winner.slug)!;
  const winnerRec = recommendations.find((r) => r.slug === winner.slug);
  const strengthText = winnerRec?.topStrengths.slice(0, 3).join(", ") ?? "overall metrics";

  return `For ${profileLabel.toLowerCase()} riding, ${winnerBike.brand} ${winnerBike.model} is the clear winner with a score of ${winnerBike.weightedScore.toFixed(1)}/10 — offering ${strengthText}. It provides the best value proposition for this riding profile.`;
}

/* ═══════════════════════════════════════════════════════════════════
 *  MAIN ENGINE
 * ═══════════════════════════════════════════════════════════════════ */

export function runComparison(
  bikesToCompare: Bike[],
  profile: ScoringProfile = "balanced"
): ComparisonResult {
  const weights = PROFILE_WEIGHTS[profile];

  // 1. Extract raw metrics
  const allRaw = bikesToCompare.map((bike) => extractRawMetrics(bike));
  
  // Create global reference by extracting raw metrics for all valid bikes
  const globalRaw = bikes.map((bike) => extractRawMetrics(bike));

  // 2. Normalize to 0-10 relative to the global dataset
  const allNormalized = normalizeMetrics(allRaw, globalRaw);

  // 3. Compute weighted scores
  const bikeScores: BikeScore[] = bikesToCompare.map((bike, i) => {
    const { total, breakdown } = computeWeightedScore(allNormalized[i], weights);
    return {
      slug: bike.slug,
      brand: bike.brand,
      model: bike.model,
      rawMetrics: allRaw[i],
      normalizedMetrics: allNormalized[i],
      weightedScore: total,
      metricScores: breakdown,
    };
  });

  // 4. Determine winner
  const sorted = [...bikeScores].sort((a, b) => b.weightedScore - a.weightedScore);
  const scoreDifference = sorted.length >= 2
    ? Number((sorted[0].weightedScore - sorted[1].weightedScore).toFixed(2))
    : 0;

  let winner: { slug: string; verdict: ComparisonVerdict } | null = null;
  if (sorted.length >= 2) {
    winner = {
      slug: sorted[0].slug,
      verdict: scoreDifference > 0.7 ? "clear_winner" : "balanced",
    };
  }

  // 5. Detect strengths
  const strengths = detectStrengths(bikeScores);

  // 6. Generate recommendations & summary
  const recommendations = generateRecommendations(bikeScores, strengths);
  const summary = generateSummaryText(bikeScores, winner, recommendations, profile);

  return {
    profile,
    profileLabel: PROFILE_LABELS[profile],
    bikes: bikeScores,
    winner,
    scoreDifference,
    strengths,
    recommendations,
    summary,
    computedAt: new Date().toISOString(),
  };
}

/* ═══════════════════════════════════════════════════════════════════
 *  MULTI-PROFILE COMPARISON (run all 4 profiles at once)
 * ═══════════════════════════════════════════════════════════════════ */

export type MultiProfileResult = Record<ScoringProfile, ComparisonResult>;

export function runAllProfiles(bikesToCompare: Bike[]): MultiProfileResult {
  const profiles: ScoringProfile[] = ["balanced", "commuter", "performance", "budget"];
  const results: Partial<MultiProfileResult> = {};

  for (const profile of profiles) {
    results[profile] = runComparison(bikesToCompare, profile);
  }

  return results as MultiProfileResult;
}
