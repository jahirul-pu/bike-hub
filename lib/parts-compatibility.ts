import { Bike, bikes } from "./bikes-data";

// ─── Compatibility Intelligence Engine ─────────────────────────────────────
// Maps bike specifications to recommended part categories and generates
// smart suggestions based on the bike's technical profile.

export type PartRecommendation = {
  category: string;
  subcategory: string;
  reason: string;
  priority: "essential" | "recommended" | "upgrade";
  icon: string; // emoji
};

export type BikeProfile = {
  slug: string;
  brand: string;
  model: string;
  powertrain: string;
  category: string;
  engineType?: string;
  displacementCc?: number;
  coolingSystem?: string;
  brakeType?: string;
  recommendations: PartRecommendation[];
  maintenanceSchedule: MaintenanceItem[];
  compatibilityTags: string[];
};

export type MaintenanceItem = {
  part: string;
  intervalKm: number;
  intervalMonths: number;
  urgency: "routine" | "important" | "critical";
  note: string;
};

// Generate compatibility tags for matching parts to bikes
export function getCompatibilityTags(bike: Bike): string[] {
  const tags: string[] = [bike.slug, "Universal"];

  // Brand-level compatibility
  tags.push(`brand:${bike.brand.toLowerCase()}`);

  // Engine displacement class
  if (bike.displacementCc) {
    if (bike.displacementCc <= 125) tags.push("cc:100-125");
    else if (bike.displacementCc <= 160) tags.push("cc:126-160");
    else if (bike.displacementCc <= 200) tags.push("cc:161-200");
    else if (bike.displacementCc <= 350) tags.push("cc:201-350");
    else tags.push("cc:350+");
  }

  // Powertrain type
  tags.push(`powertrain:${bike.powertrain.toLowerCase()}`);

  // Category
  tags.push(`type:${bike.category.toLowerCase()}`);

  // Brake type
  if (bike.absType) tags.push(`abs:${bike.absType.toLowerCase().replace(/\s/g, "-")}`);
  if (bike.frontBrake?.toLowerCase().includes("disc")) tags.push("brake:disc");
  else tags.push("brake:drum");

  // Cooling system
  if (bike.coolingSystem?.toLowerCase().includes("liquid")) tags.push("cooling:liquid");
  else tags.push("cooling:air");

  // Tyre sizes
  if (bike.frontTyre) tags.push(`front-tyre:${bike.frontTyre}`);
  if (bike.rearTyre) tags.push(`rear-tyre:${bike.rearTyre}`);

  // Chain/belt drive
  if (bike.finalDrive?.toLowerCase().includes("chain")) tags.push("drive:chain");
  else if (bike.finalDrive?.toLowerCase().includes("belt")) tags.push("drive:belt");

  return tags;
}

// Smart recommendations based on bike profile
export function getSmartRecommendations(bike: Bike): PartRecommendation[] {
  const recs: PartRecommendation[] = [];

  if (bike.powertrain === "ICE") {
    // Engine oil recommendation based on cooling system
    const oilType = bike.coolingSystem?.toLowerCase().includes("liquid")
      ? "10W-40 or 10W-50 Fully Synthetic"
      : "10W-30 or 20W-40 Semi-Synthetic";
    recs.push({
      category: "Additives",
      subcategory: "Engine Oil",
      reason: `Your ${bike.model} uses a ${bike.coolingSystem?.toLowerCase() ?? "standard"} engine — ${oilType} is ideal`,
      priority: "essential",
      icon: "🛢️",
    });

    // Chain maintenance for chain-drive bikes
    if (bike.finalDrive?.toLowerCase().includes("chain")) {
      recs.push({
        category: "Parts",
        subcategory: "Chain Kit",
        reason: `Chain-driven ${bike.model} needs regular chain lubrication and replacement every 20,000-30,000 km`,
        priority: "essential",
        icon: "⛓️",
      });
    }

    // Air filter based on displacement
    recs.push({
      category: "Parts",
      subcategory: "Air Filter",
      reason: `${bike.displacementCc ?? 0}cc engine — replace air filter every 10,000 km for optimal performance`,
      priority: "recommended",
      icon: "🌬️",
    });

    // Brake pads based on brake type
    if (bike.frontBrake?.toLowerCase().includes("disc")) {
      recs.push({
        category: "Parts",
        subcategory: "Brake Pads",
        reason: `Disc brake system (${bike.frontBrake}) — check pads every 8,000 km`,
        priority: "essential",
        icon: "🛑",
      });
    }

    // Spark plug
    recs.push({
      category: "Parts",
      subcategory: "Spark Plug",
      reason: `Replace spark plug every 10,000-15,000 km for clean combustion`,
      priority: "recommended",
      icon: "⚡",
    });

    // Sport bikes get performance parts recommendations
    if (bike.category === "Sport") {
      recs.push({
        category: "Accessories",
        subcategory: "Performance Exhaust",
        reason: `Sport-oriented ${bike.model} — an aftermarket exhaust can improve power delivery and reduce weight`,
        priority: "upgrade",
        icon: "🔥",
      });
      recs.push({
        category: "Accessories",
        subcategory: "Frame Sliders",
        reason: `Protect your ${bike.model}'s fairings during track days or unexpected slides`,
        priority: "recommended",
        icon: "🛡️",
      });
    }

    // Adventure bikes get touring gear recommendations
    if (bike.category === "Adventure") {
      recs.push({
        category: "Accessories",
        subcategory: "Crash Guard",
        reason: `Adventure riding demands engine protection — essential for off-road conditions`,
        priority: "essential",
        icon: "🏔️",
      });
      recs.push({
        category: "Accessories",
        subcategory: "Luggage",
        reason: `${bike.model} is touring-capable — panniers or a tail bag unlock long-distance potential`,
        priority: "recommended",
        icon: "🎒",
      });
    }

    // Fuel octane booster for high-compression engines
    if (bike.compressionRatio) {
      const ratio = parseFloat(bike.compressionRatio);
      if (ratio > 11) {
        recs.push({
          category: "Additives",
          subcategory: "Octane Booster",
          reason: `High compression ratio (${bike.compressionRatio}) — octane booster prevents knocking with local fuel`,
          priority: "recommended",
          icon: "⛽",
        });
      }
    }

    // Coolant for liquid-cooled engines
    if (bike.coolingSystem?.toLowerCase().includes("liquid")) {
      recs.push({
        category: "Additives",
        subcategory: "Coolant",
        reason: `Liquid-cooled engine requires coolant flush every 20,000 km or 2 years`,
        priority: "recommended",
        icon: "❄️",
      });
    }
  } else {
    // EV-specific recommendations
    recs.push({
      category: "Parts",
      subcategory: "Brake Pads",
      reason: `Even with regenerative braking, mechanical pads need inspection every 15,000 km`,
      priority: "recommended",
      icon: "🛑",
    });

    recs.push({
      category: "Accessories",
      subcategory: "Charger",
      reason: `A portable charger extends your ${bike.model}'s usability for longer commutes`,
      priority: "recommended",
      icon: "🔌",
    });

    if (bike.rangeKm && bike.rangeKm < 100) {
      recs.push({
        category: "Parts",
        subcategory: "Battery",
        reason: `With ${bike.rangeKm}km range, consider a battery upgrade for extended commute range`,
        priority: "upgrade",
        icon: "🔋",
      });
    }
  }

  // Universal recommendations
  recs.push({
    category: "Accessories",
    subcategory: "Phone Mount",
    reason: `Universal fit — essential for navigation on any ride`,
    priority: "recommended",
    icon: "📱",
  });

  // Tyre recommendations (always relevant)
  recs.push({
    category: "Parts",
    subcategory: "Tyres",
    reason: `Front: ${bike.frontTyre}, Rear: ${bike.rearTyre} — replace when tread depth drops below 1mm`,
    priority: "essential",
    icon: "🛞",
  });

  return recs;
}

// Generate maintenance schedule for a bike
export function getMaintenanceSchedule(bike: Bike): MaintenanceItem[] {
  const schedule: MaintenanceItem[] = [];

  if (bike.powertrain === "ICE") {
    schedule.push({
      part: "Engine Oil",
      intervalKm: 3000,
      intervalMonths: 3,
      urgency: "critical",
      note: bike.coolingSystem?.toLowerCase().includes("liquid")
        ? "Use 10W-40 fully synthetic for liquid-cooled engines"
        : "Use 10W-30 or 20W-40 for air-cooled engines",
    });
    schedule.push({
      part: "Oil Filter",
      intervalKm: 6000,
      intervalMonths: 6,
      urgency: "important",
      note: "Replace with every other oil change",
    });
    schedule.push({
      part: "Air Filter",
      intervalKm: 10000,
      intervalMonths: 12,
      urgency: "important",
      note: "Clean every 5,000 km, replace at 10,000 km",
    });
    schedule.push({
      part: "Spark Plug",
      intervalKm: 12000,
      intervalMonths: 12,
      urgency: "routine",
      note: "Iridium plugs last longer but cost more",
    });

    if (bike.finalDrive?.toLowerCase().includes("chain")) {
      schedule.push({
        part: "Chain Lube",
        intervalKm: 500,
        intervalMonths: 1,
        urgency: "routine",
        note: "Clean and lubricate — extends chain life significantly",
      });
      schedule.push({
        part: "Chain Kit",
        intervalKm: 25000,
        intervalMonths: 24,
        urgency: "important",
        note: "Replace chain and sprockets together",
      });
    }

    if (bike.coolingSystem?.toLowerCase().includes("liquid")) {
      schedule.push({
        part: "Coolant",
        intervalKm: 20000,
        intervalMonths: 24,
        urgency: "important",
        note: "Flush and replace to prevent corrosion",
      });
    }
  }

  // Universal
  schedule.push({
    part: "Brake Pads",
    intervalKm: bike.powertrain === "EV" ? 15000 : 10000,
    intervalMonths: 12,
    urgency: "critical",
    note: "Inspect every 5,000 km — replace when pad thickness < 2mm",
  });
  schedule.push({
    part: "Brake Fluid",
    intervalKm: 20000,
    intervalMonths: 24,
    urgency: "important",
    note: "DOT 4 recommended — moisture absorption degrades braking",
  });
  schedule.push({
    part: "Tyres",
    intervalKm: 15000,
    intervalMonths: 24,
    urgency: "critical",
    note: `Front: ${bike.frontTyre}, Rear: ${bike.rearTyre}`,
  });

  return schedule.sort((a, b) => a.intervalKm - b.intervalKm);
}

// Build a full bike profile
export function getBikeProfile(slug: string): BikeProfile | null {
  const bike = bikes.find((b) => b.slug === slug);
  if (!bike) return null;

  return {
    slug: bike.slug,
    brand: bike.brand,
    model: bike.model,
    powertrain: bike.powertrain,
    category: bike.category,
    engineType: bike.engineType,
    displacementCc: bike.displacementCc,
    coolingSystem: bike.coolingSystem,
    brakeType: bike.frontBrake,
    recommendations: getSmartRecommendations(bike),
    maintenanceSchedule: getMaintenanceSchedule(bike),
    compatibilityTags: getCompatibilityTags(bike),
  };
}

// Priority badge colors
export const priorityConfig = {
  essential: { label: "Essential", class: "bg-red-500/10 text-red-700 border-red-200", dot: "bg-red-500" },
  recommended: { label: "Recommended", class: "bg-amber-500/10 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  upgrade: { label: "Upgrade", class: "bg-blue-500/10 text-blue-700 border-blue-200", dot: "bg-blue-500" },
} as const;

export const urgencyConfig = {
  critical: { label: "Critical", class: "text-red-600 bg-red-50 border-red-200" },
  important: { label: "Important", class: "text-amber-600 bg-amber-50 border-amber-200" },
  routine: { label: "Routine", class: "text-slate-600 bg-slate-50 border-slate-200" },
} as const;
