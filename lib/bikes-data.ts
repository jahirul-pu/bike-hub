export type Powertrain = "ICE" | "EV";

export type Bike = {
  slug: string;
  brand: string;
  model: string;
  category: "Commuter" | "Sport" | "Adventure" | "Scooter";
  powertrain: Powertrain;
  images?: string[];
  priceBdt: number;
  displacementCc?: number;
  motorPowerKw?: number;
  topSpeedKph: number;
  mileageKmpl?: number;
  rangeKm?: number;
  chargingTime0100?: string;
  batteryCycleLife?: string;
  ipRating?: string;
  fuelTankLiters?: number;
  gearbox?: string;
  torqueNm: number;
  weightKg: number;
  seatHeightMm: number;
  wheelbaseMm: number;
  groundClearanceMm: number;
  frontTyre: string;
  rearTyre: string;
  summary: string;

  // ─── EV-extended fields ───
  voltageV?: number;
  ampHours?: number;
  peakPowerKw?: number;
  batteryType?: string;
  ridingModes?: string;
  underseatStorage?: string;
  lengthMm?: number;
  widthMm?: number;
  heightMm?: number;
  frontBrake?: string;
  rearBrake?: string;
  absType?: string;
  frontSuspension?: string;
  rearSuspension?: string;
  securityFeatures?: string;
  appSupport?: string;

  // --- Features & Electronics ---
  displayType?: string;
  headlightType?: string;
  bluetoothConnectivity?: string;
  gpsTracking?: string;
  navigation?: string;
  keylessStart?: string;
  usbChargingPort?: string;
  otaUpdates?: string;
  tractionControl?: string;
  cruiseControl?: string;
};

export const bikes: Bike[] = [
  {
    slug: "yamaha-r15-v4",
    brand: "Yamaha",
    model: "R15 V4",
    category: "Sport",
    powertrain: "ICE",
    priceBdt: 650000,
    displacementCc: 155,
    topSpeedKph: 145,
    mileageKmpl: 42,
    fuelTankLiters: 11,
    gearbox: "6-speed",
    torqueNm: 14.2,
    weightKg: 142,
    seatHeightMm: 815,
    wheelbaseMm: 1325,
    groundClearanceMm: 170,
    frontTyre: "100/80-17",
    rearTyre: "140/70-17",
    summary: "Track-inspired fairing, quick steering, and sharp cornering manners.",
  },
  {
    slug: "bajaj-pulsar-n160",
    brand: "Bajaj",
    model: "Pulsar N160",
    category: "Commuter",
    powertrain: "ICE",
    priceBdt: 305000,
    displacementCc: 164.8,
    topSpeedKph: 120,
    mileageKmpl: 45,
    fuelTankLiters: 14,
    gearbox: "5-speed",
    torqueNm: 14.7,
    weightKg: 152,
    seatHeightMm: 795,
    wheelbaseMm: 1358,
    groundClearanceMm: 165,
    frontTyre: "100/80-17",
    rearTyre: "130/70-17",
    summary: "Balanced city and highway setup with stable braking performance.",
  },
  {
    slug: "suzuki-vstrom-250",
    brand: "Suzuki",
    model: "V-Strom 250",
    category: "Adventure",
    powertrain: "ICE",
    priceBdt: 530000,
    displacementCc: 249,
    topSpeedKph: 135,
    mileageKmpl: 35,
    fuelTankLiters: 17,
    gearbox: "6-speed",
    torqueNm: 22.2,
    weightKg: 167,
    seatHeightMm: 800,
    wheelbaseMm: 1440,
    groundClearanceMm: 205,
    frontTyre: "110/80-17",
    rearTyre: "140/70-17",
    summary: "Touring-ready ergonomics with long fuel range and wind protection.",
  },
  {
    slug: "honda-cb350rs",
    brand: "Honda",
    model: "CB350RS",
    category: "Commuter",
    powertrain: "ICE",
    priceBdt: 490000,
    displacementCc: 348,
    topSpeedKph: 130,
    mileageKmpl: 34,
    fuelTankLiters: 15,
    gearbox: "5-speed",
    torqueNm: 30,
    weightKg: 179,
    seatHeightMm: 800,
    wheelbaseMm: 1441,
    groundClearanceMm: 168,
    frontTyre: "100/90-19",
    rearTyre: "150/70-17",
    summary: "Refined torque-rich engine tuned for smooth urban and touring rides.",
  },
  {
    slug: "honda-activa-125",
    brand: "Honda",
    model: "Activa 125",
    category: "Scooter",
    powertrain: "ICE",
    priceBdt: 235000,
    displacementCc: 124,
    topSpeedKph: 95,
    mileageKmpl: 50,
    fuelTankLiters: 5.3,
    gearbox: "CVT",
    torqueNm: 10.4,
    weightKg: 111,
    seatHeightMm: 765,
    wheelbaseMm: 1260,
    groundClearanceMm: 162,
    frontTyre: "90/90-12",
    rearTyre: "90/100-10",
    summary: "Reliable daily-use scooter with smooth transmission and practical storage.",
  },
  {
    slug: "yamaha-rayzr-125",
    brand: "Yamaha",
    model: "RayZR 125",
    category: "Scooter",
    powertrain: "ICE",
    priceBdt: 245000,
    displacementCc: 125,
    topSpeedKph: 99,
    mileageKmpl: 52,
    fuelTankLiters: 5.2,
    gearbox: "CVT",
    torqueNm: 10.3,
    weightKg: 99,
    seatHeightMm: 785,
    wheelbaseMm: 1280,
    groundClearanceMm: 145,
    frontTyre: "90/90-12",
    rearTyre: "110/90-10",
    summary: "Lightweight urban scooter with quick pickup and efficient fuel economy.",
  },

  {
    slug: "revolt-rv400-brz",
    brand: "Revolt",
    model: "RV400 BRZ",
    category: "Commuter",
    powertrain: "EV",
    priceBdt: 360000,
    motorPowerKw: 5,
    topSpeedKph: 85,
    rangeKm: 150,
    chargingTime0100: "4h 30m",
    batteryCycleLife: "1,200 cycles",
    ipRating: "IP65",
    torqueNm: 45,
    weightKg: 108,
    seatHeightMm: 814,
    wheelbaseMm: 1350,
    groundClearanceMm: 215,
    frontTyre: "90/80-17",
    rearTyre: "120/80-17",
    summary: "Urban electric motorcycle with removable battery and practical ergonomics.",
  },


  {
    slug: "yadea-gt60",
    brand: "Yadea",
    model: "GT60",
    category: "Scooter" as const,
    powertrain: "EV" as const,
    priceBdt: 167000,
    topSpeedKph: 70,
    torqueNm: 120,
    weightKg: 120,
    seatHeightMm: 734,
    wheelbaseMm: 1296,
    groundClearanceMm: 132,
    frontTyre: "90/80-12",
    rearTyre: "100/80-10",
    summary: "The Yadea GT60 is positioned as a high-performance, compact electric commuter, specifically designed with a focus on durability (the \"GT\" line DNA) and modern tech features like keyless entry.",
    images: ["/bikes/product_image_gt_60693555b22ae5f-1776073320057.webp"],
    motorPowerKw: 1.5,
    peakPowerKw: 2.5,
    rangeKm: 120,
    batteryType: "Lead-acid",
    voltageV: 72,
    ampHours: 38,
    chargingTime0100: "6–8 hours",
    batteryCycleLife: "800 – 1,000",
    ipRating: "IP67",
    lengthMm: 1952,
    widthMm: 718,
    heightMm: 1123,
    underseatStorage: "32L",
    frontBrake: "Disk",
    rearBrake: "Disk",
    absType: "None",
    frontSuspension: "Hydraulic Fork",
    rearSuspension: "Dual Shock Absorber",
    ridingModes: "Eco, TTFR, Sports",
    securityFeatures: "Geo-fencing",
    appSupport: "Yes",
    displayType: "TFT",
    bluetoothConnectivity: "Yes",
    gpsTracking: "Yes",
    navigation: "No",
    keylessStart: "Yes",
    usbChargingPort: "Yes",
    otaUpdates: "Yes",
    tractionControl: "No",
    cruiseControl: "Yes",
  },
];

export function getBikeBySlug(slug: string): Bike | undefined {
  return bikes.find((bike) => bike.slug === slug);
}

export function metricForSimilarity(bike: Bike): number {
  if (bike.powertrain === "ICE") {
    return bike.displacementCc ?? 125;
  }

  return Math.round((bike.motorPowerKw ?? 4) * 1000);
}

function similarityScore(base: Bike, candidate: Bike): number {
  const priceGap = Math.abs(candidate.priceBdt - base.priceBdt) / Math.max(base.priceBdt, 1);
  const metricGap =
    Math.abs(metricForSimilarity(candidate) - metricForSimilarity(base)) /
    Math.max(metricForSimilarity(base), 1);
  const powertrainPenalty = candidate.powertrain === base.powertrain ? 1 : 1.15;

  return (priceGap * 0.65 + metricGap * 0.35) * powertrainPenalty;
}

export function getSimilarBikes(currentBike: Bike, count = 3): Bike[] {
  return bikes
    .filter((bike) => bike.slug !== currentBike.slug)
    .map((bike) => ({ bike, score: similarityScore(currentBike, bike) }))
    .sort((a, b) => a.score - b.score)
    .slice(0, count)
    .map((entry) => entry.bike);
}

export function formatBdt(value: number): string {
  return `BDT ${new Intl.NumberFormat("en-BD").format(value)}`;
}

export function powertrainBadgeClass(powertrain: Powertrain): string {
  return powertrain === "ICE"
    ? "border-red-200 bg-red-100 text-red-900 hover:bg-red-100"
    : "border-emerald-200 bg-emerald-100 text-emerald-900 hover:bg-emerald-100";
}

export function headlineMetric(bike: Bike): string {
  if (bike.powertrain === "ICE") {
    return `${bike.displacementCc ?? "-"} cc`;
  }

  return `${Math.round((bike.motorPowerKw ?? 0) * 1000)} W`;
}
