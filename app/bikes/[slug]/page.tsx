import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Search, ChevronLeft, ArrowRight, Zap, Gauge, BatteryCharging, Fuel } from "lucide-react";
import Image from "next/image";
import { BikeGallery } from "@/components/site/bike-gallery";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bike,
  bikes,
  formatBdt,
  getBikeBySlug,
  getSimilarBikes,
  headlineMetric,
  metricForSimilarity,
  powertrainBadgeClass,
} from "@/lib/bikes-data";
import { cn } from "@/lib/utils";

type SpecItem = {
  label: string;
  value: string;
};

type SpecCategory = {
  title: string;
  items: SpecItem[];
};

function categoryAnchor(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function displayCategoryTitle(title: string): string {
  return title.replace(/^\d+\.\s*/, "");
}

function estimatedPowerFromCc(cc: number) {
  return Number((cc * 0.085).toFixed(1));
}

function yesNo(value: boolean) {
  return value ? "Yes" : "No";
}

function launchYearFromBike(bike: Bike): number {
  if (bike.model.includes("V4")) return 2024;
  if (bike.model.includes("Gen 3")) return 2023;
  if (bike.model.includes("ST")) return 2023;
  return 2022;
}

function bikeTypeLabel(bike: Bike): string {
  if (bike.powertrain === "EV") {
    return bike.category === "Scooter" ? "EV Scooter" : "EV Motorcycle";
  }

  return bike.category === "Scooter" ? "Scooter" : `${bike.category} Motorcycle`;
}



function geometryByCategory(category: Bike["category"]) {
  const map: Record<Bike["category"], { length: number; width: number; height: number }> = {
    Commuter: { length: 2040, width: 760, height: 1080 },
    Sport: { length: 1990, width: 725, height: 1135 },
    Adventure: { length: 2150, width: 880, height: 1360 },
    Scooter: { length: 1860, width: 700, height: 1160 },
  };

  return map[category];
}

function engineType(displacementCc: number) {
  if (displacementCc >= 500) return "Parallel Twin";
  return "Single-cylinder";
}

function coolingSystem(displacementCc: number) {
  if (displacementCc >= 300) return "Liquid-cooled";
  if (displacementCc >= 160) return "Oil-cooled";
  return "Air-cooled";
}

function fuelSystem(displacementCc: number) {
  return displacementCc >= 150 ? "Fuel Injection" : "Carburetor";
}

function compressionRatio(displacementCc: number) {
  if (displacementCc >= 300) return "10.5:1";
  if (displacementCc >= 160) return "10.2:1";
  return "11.6:1";
}

function boreStroke(displacementCc: number) {
  if (displacementCc >= 300) return "70.0 mm x 90.5 mm";
  if (displacementCc >= 200) return "72.0 mm x 61.2 mm";
  return "57.3 mm x 58.7 mm";
}

function parseHours(charging: string | undefined): number | null {
  if (!charging) return null;
  const hoursMatch = charging.match(/(\d+(?:\.\d+)?)h/i);
  if (!hoursMatch?.[1]) return null;
  return Number(hoursMatch[1]);
}

function batteryCapacityKwh(bike: Bike): number {
  if (bike.rangeKm) {
    return Number((bike.rangeKm * 0.035).toFixed(1));
  }

  return Number(((bike.motorPowerKw ?? 4) * 0.9).toFixed(1));
}

function gearCount(bike: Bike): number {
  if (bike.powertrain === "EV") return 1;
  const matched = bike.gearbox?.match(/(\d+)/);
  if (!matched?.[1]) return bike.category === "Scooter" ? 1 : 5;
  return Number(matched[1]);
}

function consoleType(bike: Bike): string {
  if (bike.priceBdt >= 700000) return "TFT";
  if (bike.priceBdt >= 300000) return "Digital";
  return "Analog + Digital";
}

function absType(bike: Bike): string {
  if (bike.topSpeedKph >= 140) return "Dual Channel";
  if (bike.topSpeedKph >= 100) return "Single Channel";
  return "None";
}

function colorPalette(bike: Bike): string {
  if (bike.colors && bike.colors.length > 0) {
    return bike.colors.join(", ");
  }

  if (bike.category === "Sport") return "Racing Blue, Matte Black, Silver";
  if (bike.category === "Adventure") return "Forest Green, Desert Sand, Black";
  if (bike.category === "Scooter") return "Pearl White, Red, Cyan, Gray";
  return "Black, Red, Gray";
}

function swatchHex(colorName: string): string {
  const normalized = colorName.toLowerCase();

  if (normalized.includes("white")) return "#f8fafc";
  if (normalized.includes("black")) return "#0f172a";
  if (normalized.includes("silver")) return "#cbd5e1";
  if (normalized.includes("gray") || normalized.includes("grey")) return "#94a3b8";
  if (normalized.includes("red")) return "#dc2626";
  if (normalized.includes("blue")) return "#2563eb";
  if (normalized.includes("green")) return "#166534";
  if (normalized.includes("cyan")) return "#06b6d4";
  if (normalized.includes("sand") || normalized.includes("desert")) return "#d6b37a";

  return "#64748b";
}

function swatchPalette(colors: string): Array<{ name: string; hex: string }> {
  return colors
    .split(",")
    .map((color) => color.trim())
    .filter(Boolean)
    .map((name) => ({ name, hex: swatchHex(name) }));
}

function specialEdition(bike: Bike): string {
  if (bike.category === "Sport") return "Racing Edition";
  if (bike.powertrain === "EV") return "Connected Tech Edition";
  return "Standard";
}

function variantDifferences(bike: Bike): string {
  if (bike.powertrain === "EV") {
    return "Base vs Pro: range and connected feature pack";
  }

  return "Standard vs ABS: braking package and console upgrades";
}



function competitorPriceLine(base: Bike, candidates: Bike[]) {
  if (candidates.length === 0) return "No close competitors available";

  return candidates
    .map((candidate) => {
      const gap = candidate.priceBdt - base.priceBdt;
      const direction = gap >= 0 ? "+" : "-";
      return `${candidate.brand} ${candidate.model} (${direction}${formatBdt(Math.abs(gap))})`;
    })
    .join(" | ");
}

function competitorSpecLine(base: Bike, candidates: Bike[]) {
  if (candidates.length === 0) return "No comparison data";

  return candidates
    .map((candidate) => {
      const metric = candidate.powertrain === "ICE" ? `${candidate.displacementCc ?? "-"} cc` : `${Math.round((candidate.motorPowerKw ?? 0) * 1000)} W`;
      return `${candidate.brand} ${candidate.model}: ${metric}`;
    })
    .join(" | ");
}

function evSegment(bike: Bike): string {
  if (bike.priceBdt >= 700000 || bike.topSpeedKph >= 140) return "Performance EV";
  if (bike.priceBdt >= 380000) return "Premium";
  return "Budget";
}

function completeEvSpecCategories(bike: Bike, similarBikes: Bike[]): SpecCategory[] {
  const launchYear = bike.launchYear ?? launchYearFromBike(bike);
  const motorPower = bike.motorPowerKw ?? 4;
  const peakPower = bike.peakPowerKw ?? Number((motorPower * 1.25).toFixed(1));
  const chargingHours = parseHours(bike.chargingTime0100) ?? 5;
  const charging80 = Number((chargingHours * 0.8).toFixed(1));
  const batteryKwh = batteryCapacityKwh(bike);
  const batteryWeight = Number((batteryKwh * 7.6).toFixed(1));
  const geometry = geometryByCategory(bike.category);
  const certifiedRange = bike.rangeKm ?? 120;
  const realWorldRange = Math.round(certifiedRange * 0.82);
  const ecoRange = Math.round(certifiedRange * 1.08);
  const normalRange = Math.round(certifiedRange * 0.9);
  const sportRange = Math.round(certifiedRange * 0.72);
  const energyUse = Math.round((batteryKwh * 1000) / Math.max(certifiedRange, 1));
  const abs = absType(bike);

  return [
    {
      title: "1. Basic Information",
      items: [
        { label: "Brand", value: bike.brand },
        { label: "Model Name", value: bike.model },
        { label: "Variant", value: "Standard" },
        {
          label: "Vehicle Type (Electric Bike / Scooter)",
          value: bike.category === "Scooter" ? "Electric Scooter" : "Electric Bike",
        },
        { label: "Launch Year", value: String(launchYear) },
      ],
    },
    {
      title: "2. Motor & Performance",
      items: [
        { label: "Motor Type (BLDC / Hub Motor / Mid Drive)", value: bike.category === "Scooter" ? "Hub Motor" : "Mid Drive BLDC" },
        { label: "Rated Power (kW)", value: `${motorPower} kW` },
        { label: "Peak Power (kW)", value: `${peakPower} kW` },
        { label: "Torque (Nm)", value: `${bike.torqueNm} Nm` },
        { label: "Top Speed (km/h)", value: `${bike.topSpeedKph} km/h` },
        {
          label: "Acceleration (0-40 km/h or 0-60 km/h time)",
          value: bike.category === "Scooter" ? "0-40 km/h in 3.8 sec" : "0-60 km/h in 4.5 sec",
        },
        { label: "Drive Type (Hub / Chain / Belt)", value: bike.category === "Scooter" ? "Hub" : "Chain" },
      ],
    },
    {
      title: "3. Battery",
      items: [
        { label: "Battery Type", value: bike.batteryType ?? "Lithium-ion" },
        { label: "Battery Capacity (kWh)", value: `${batteryKwh} kWh` },
        { label: "Battery Capacity (Ah)", value: bike.ampHours ? `${bike.ampHours} Ah` : "N/A" },
        { label: "Voltage (V)", value: bike.voltageV ? `${bike.voltageV}V` : "72V" },
        { label: "Battery Lifecycle", value: bike.batteryCycleLife ? `${bike.batteryCycleLife} (N.B: at 25°C ideal condition)` : "1000 Cycles (N.B: at 25°C ideal condition)" },
        { label: "Number of Batteries", value: batteryKwh >= 8 ? "2" : "1" },
        { label: "Removable Battery (Yes/No)", value: yesNo(bike.category === "Scooter") },
        { label: "Swappable Battery (Yes/No)", value: yesNo(bike.category === "Scooter" && bike.priceBdt < 500000) },
        { label: "Battery Weight (kg)", value: `${batteryWeight} kg` },
      ],
    },
    {
      title: "4. Charging",
      items: [
        { label: "Charging Time (0-100%)", value: bike.chargingTime0100 ?? "5h" },
        { label: "Charging Time (0-80%)", value: `${charging80}h` },
        {
          label: "Charger Type (Portable / Fast Charger / Home Charger)",
          value: chargingHours <= 4.5 ? "Fast Charger" : bike.category === "Scooter" ? "Portable" : "Home Charger",
        },
        { label: "Fast Charging Support (Yes/No)", value: yesNo(chargingHours <= 5) },
        { label: "Charging Port Type", value: "Smart AC Port" },
        { label: "Charging Input (Socket type)", value: "220V AC / 5A socket" },
      ],
    },
    {
      title: "5. Range & Efficiency",
      items: [
        { label: "Certified Range (km)", value: `${certifiedRange} km` },
        { label: "Real-world Range (km)", value: `${realWorldRange} km` },
        {
          label: "Range per Mode (Eco / Normal / Sport)",
          value: `${ecoRange} / ${normalRange} / ${sportRange} km`,
        },
        { label: "Energy Consumption (Wh/km)", value: `${energyUse} Wh/km` },
      ],
    },
    {
      title: "6. Controller & Electronics",
      items: [
        { label: "Controller Type", value: "FOC Controller" },
        { label: "Regenerative Braking (Yes/No)", value: yesNo(true) },
        { label: "Riding Modes", value: bike.ridingModes ?? "Eco, Normal, Sport" },
        { label: "Reverse Mode", value: yesNo(bike.category === "Scooter") },
        { label: "Smart BMS (Battery Management System)", value: yesNo(true) },
      ],
    },
    {
      title: "7. Dimensions & Weight",
      items: [
        { label: "Length (mm)", value: `${bike.lengthMm ?? geometry.length} mm` },
        { label: "Width (mm)", value: `${bike.widthMm ?? geometry.width} mm` },
        { label: "Height (mm)", value: `${bike.heightMm ?? geometry.height} mm` },
        { label: "Wheelbase (mm)", value: `${bike.wheelbaseMm} mm` },
        { label: "Ground Clearance (mm)", value: `${bike.groundClearanceMm} mm` },
        { label: "Seat Height (mm)", value: `${bike.seatHeightMm} mm` },
        { label: "Underseat Storage", value: bike.underseatStorage ?? (bike.category === "Scooter" ? "20L" : "N/A") },
        { label: "Kerb Weight (kg)", value: `${bike.weightKg} kg` },
        { label: "Payload Capacity (kg)", value: bike.category === "Scooter" ? "150 kg" : "180 kg" },
      ],
    },
    {
      title: "8. Suspension",
      items: [
        { label: "Front Suspension", value: bike.frontSuspension ?? (bike.category === "Sport" ? "USD" : "Telescopic") },
        {
          label: "Rear Suspension",
          value: bike.rearSuspension ?? (bike.category === "Scooter" ? "Dual shock" : "Mono-shock"),
        },
      ],
    },
    {
      title: "9. Brakes & Wheels",
      items: [
        { label: "Front Brake", value: bike.frontBrake ?? (bike.topSpeedKph >= 95 ? "Disc" : "Drum") },
        { label: "Rear Brake", value: bike.rearBrake ?? (bike.topSpeedKph >= 120 ? "Disc" : "Drum") },
        { label: "ABS / CBS", value: bike.absType ?? (abs === "None" ? "CBS" : abs) },
        { label: "Tyre Type (Tubeless / Tube)", value: bike.tyreType ?? "Tubeless" },
        { label: "Front Tyre Size", value: bike.frontTyre },
        { label: "Rear Tyre Size", value: bike.rearTyre },
        { label: "Wheel Type (Alloy / Steel)", value: bike.wheelType ?? "Alloy" },
      ],
    },
    {
      title: "10. Features & Smart Tech",
      items: [
        { label: "Digital Display (LCD / TFT)", value: bike.displayType ?? (bike.priceBdt >= 500000 ? "TFT" : "LCD") },
        { label: "Bluetooth Connectivity", value: bike.bluetoothConnectivity ?? yesNo(true) },
        { label: "Mobile App Integration", value: bike.appSupport ? `Yes (${bike.appSupport})` : yesNo(true) },
        { label: "GPS Tracking", value: bike.gpsTracking ?? yesNo(bike.priceBdt >= 350000) },
        { label: "Navigation", value: bike.navigation ?? yesNo(bike.priceBdt >= 330000) },
        { label: "Geo-fencing", value: bike.geoFencing ?? (bike.securityFeatures?.toLowerCase().includes('geo') ? "Yes" : yesNo(bike.priceBdt >= 330000)) },
        { label: "Anti-theft System", value: bike.securityFeatures ?? yesNo(true) },
        { label: "Keyless Start", value: bike.keylessStart ?? yesNo(bike.priceBdt >= 350000) },
        { label: "USB Charging Port", value: bike.usbChargingPort ?? yesNo(true) },
        { label: "OTA Updates", value: bike.otaUpdates ?? yesNo(bike.priceBdt >= 500000) },
        { label: "Cruise Control", value: bike.cruiseControl ?? yesNo(bike.priceBdt >= 500000) },
      ],
    },
    {
      title: "11. Lighting",
      items: [
        { label: "Headlight (LED / Projector)", value: bike.headlightType ?? (bike.priceBdt >= 500000 ? "Projector LED" : "LED") },
        { label: "DRL", value: bike.drl ?? yesNo(true) },
        { label: "Tail Light", value: bike.tailLightType ?? "LED" },
        { label: "Indicators", value: bike.turnSignalType ?? "LED" },
      ],
    },
    {
      title: "12. Safety",
      items: [
        { label: "Side Stand Sensor", value: bike.sideStandCutOff ?? yesNo(true) },
        { label: "Kill Switch", value: bike.engineKillSwitch ?? yesNo(bike.category !== "Scooter") },
        { label: "TCS (Traction Control System)", value: bike.tractionControl ?? yesNo(bike.topSpeedKph >= 120) },
        {
          label: "Battery Protection (Overcharge / Thermal / Short Circuit)",
          value: "Overcharge, Thermal, Short Circuit",
        },
        { label: "Water Resistance Rating (IP67 etc.)", value: bike.ipRating ?? "IP67" },
      ],
    }
  ];
}

function completeIceSpecCategories(bike: Bike, similarBikes: Bike[]): SpecCategory[] {
  const launchYear = bike.launchYear ?? launchYearFromBike(bike);
  const displacement = bike.displacementCc ?? 125;
  const geometry = geometryByCategory(bike.category);
  const gears = gearCount(bike);
  const abs = absType(bike);

  const categories: SpecCategory[] = [
    {
      title: "1. Basic Information",
      items: [
        { label: "Brand", value: bike.brand },
        { label: "Model Name", value: bike.model },
        { label: "Variant / Trim", value: "Standard" },
        { label: "Bike Type", value: bikeTypeLabel(bike) },
        { label: "Launch Year", value: String(launchYear) },
      ],
    },
    {
      title: "2. Engine & Performance",
      items: [
        { label: "Engine Type", value: bike.engineType ?? "SOHC" },
        { label: "No. of Cylinders", value: bike.noOfCylinders ?? "Single Cylinder" },
        { label: "Displacement (cc)", value: `${displacement} cc` },
        {
          label: "Max Power (HP / PS @ RPM)",
          value: bike.maxPower ?? `${estimatedPowerFromCc(displacement)} HP @ ${displacement >= 300 ? "6,500" : "8,000"} RPM`,
        },
        { label: "Max Torque (Nm @ RPM)", value: bike.maxTorque ?? `${bike.torqueNm} Nm @ ${displacement >= 300 ? "4,000" : "6,500"} RPM` },
        { label: "Top Speed (km/h)", value: `${bike.topSpeedKph} km/h` },
        { label: "Cooling System", value: bike.coolingSystem ?? coolingSystem(displacement) },
        { label: "Fuel System", value: bike.fuelSystem ?? fuelSystem(displacement) },
        { label: "Compression Ratio", value: bike.compressionRatio ?? compressionRatio(displacement) },
        { label: "Bore x Stroke", value: bike.boreStroke ?? boreStroke(displacement) },
        { label: "Emission Standard", value: bike.emissionStandard ?? "BS6 / Euro 5" },
      ],
    },
    {
      title: "3. Transmission",
      items: [
        {
          label: "Gear Type",
          value: bike.gearbox?.toLowerCase().includes("cvt") ? "CVT" : "Manual",
        },
        { label: "Number of Gears", value: bike.gearbox?.match(/\d+/) ? `${bike.gearbox.match(/\d+/)} Speed` : "5 Speed" },
        {
          label: "Clutch Type",
          value: bike.clutchType ?? (bike.gearbox?.toLowerCase().includes("cvt") ? "Automatic centrifugal" : "Wet multi-plate"),
        },
        {
          label: "Final Drive",
          value: bike.finalDrive ?? (bike.category === "Scooter" ? "Belt" : "Chain"),
        },
      ],
    },
    {
      title: "4. Fuel & Efficiency",
      items: [
        { label: "Fuel Type", value: bike.fuelType ?? "Petrol" },
        {
          label: "Fuel Tank Capacity (liters)",
          value: `${bike.fuelTankLiters ?? "-"} L`,
        },
        {
          label: "Mileage (km/l)",
          value: `${bike.mileageKmpl ?? "-"} km/l`,
        },
        {
          label: "Reserve Fuel Capacity",
          value: bike.reserveFuelCapacity ?? `${Number(((bike.fuelTankLiters ?? 6) * 0.12).toFixed(1))} L`,
        },
      ],
    },
    {
      title: "5. Dimensions & Weight",
      items: [
        { label: "Length (mm)", value: `${bike.lengthMm ?? geometry.length} mm` },
        { label: "Width (mm)", value: `${bike.widthMm ?? geometry.width} mm` },
        { label: "Height (mm)", value: `${bike.heightMm ?? geometry.height} mm` },
        { label: "Wheelbase (mm)", value: `${bike.wheelbaseMm} mm` },
        { label: "Ground Clearance (mm)", value: `${bike.groundClearanceMm} mm` },
        { label: "Seat Height (mm)", value: `${bike.seatHeightMm} mm` },
        { label: "Kerb Weight (kg)", value: `${bike.weightKg} kg` },
      ],
    },
    {
      title: "6. Chassis & Suspension",
      items: [
        {
          label: "Frame Type",
          value: bike.frameType ?? (bike.category === "Sport" ? "Deltabox" : bike.category === "Adventure" ? "Trellis" : "Diamond"),
        },
        {
          label: "Front Suspension",
          value: bike.frontSuspension ?? (bike.category === "Sport" ? "USD Fork" : "Telescopic Fork"),
        },
        {
          label: "Rear Suspension",
          value: bike.rearSuspension ?? (bike.category === "Scooter" ? "Twin shock" : "Mono-shock"),
        },
      ],
    },
    {
      title: "7. Brakes & Wheels",
      items: [
        {
          label: "Front Brake (Disc/Drum + size)",
          value: bike.frontBrake ?? (bike.topSpeedKph >= 110 ? "Disc 300 mm" : "Disc 240 mm"),
        },
        {
          label: "Rear Brake",
          value: bike.rearBrake ?? (bike.topSpeedKph >= 120 ? "Disc 230 mm" : "Drum 130 mm"),
        },
        { label: "ABS", value: bike.absType ?? abs },
        { label: "Front Tyre Size", value: bike.frontTyre },
        { label: "Rear Tyre Size", value: bike.rearTyre },
        { label: "Wheel Type", value: bike.wheelType ?? "Alloy" },
        { label: "Tyre Type", value: bike.tyreType ?? "Tubeless" },
      ],
    },
    {
      title: "8. Features & Electronics",
      items: [
        { label: "Instrument Console", value: bike.displayType ?? consoleType(bike) },
        { label: "Bluetooth Connectivity", value: bike.bluetoothConnectivity ?? yesNo(bike.priceBdt >= 320000) },
        { label: "Navigation", value: bike.navigation ?? yesNo(bike.priceBdt >= 450000) },
        { label: "Riding Modes", value: bike.ridingModes ?? yesNo(bike.topSpeedKph >= 140) },
        { label: "Traction Control", value: bike.tractionControl ?? yesNo(bike.topSpeedKph >= 150) },
        { label: "Cruise Control", value: bike.cruiseControl ?? yesNo(bike.category === "Adventure" || bike.priceBdt > 800000) },
        { label: "Quick Shifter", value: bike.quickShifter ?? yesNo(bike.category === "Sport" && bike.priceBdt > 700000) },
        { label: "USB Charging Port", value: bike.usbChargingPort ?? yesNo(true) },
        { label: "Mobile App Support", value: bike.appSupport ? `Yes (${bike.appSupport})` : yesNo(bike.priceBdt >= 400000) },
      ],
    },
    {
      title: "9. Lighting",
      items: [
        {
          label: "Headlight Type",
          value: bike.headlightType ?? (bike.priceBdt >= 300000 ? "LED Projector" : "Halogen"),
        },
        { label: "DRL", value: bike.drl ?? yesNo(bike.priceBdt >= 280000) },
        { label: "Tail Light Type", value: bike.tailLightType ?? "LED" },
        { label: "Turn Signal Type", value: bike.turnSignalType ?? "LED" },
      ],
    },
    {
      title: "10. Safety",
      items: [
        { label: "ABS", value: bike.absType ?? abs },
        { label: "CBS (Combined Braking System)", value: bike.cbs ?? yesNo((bike.absType ?? abs) === "None") },
        { label: "TCS (Traction Control System)", value: bike.tractionControl ?? yesNo(bike.topSpeedKph >= 150) },
        { label: "Engine Kill Switch", value: bike.engineKillSwitch ?? yesNo(bike.category !== "Scooter") },
        { label: "Side Stand Engine Cut-off", value: bike.sideStandCutOff ?? yesNo(bike.category !== "Scooter") },
        { label: "Anti-theft Alarm", value: bike.securityFeatures ?? yesNo(false) },
      ],
    }
  ];

  return categories;
}

function SpecCategoryCard({ title, items }: SpecCategory) {
  return (
    <Card className="border-slate-200 bg-white/90">
      <CardHeader className="pb-3">
        <CardTitle className="font-heading text-3xl uppercase tracking-wide text-slate-900">
          {displayCategoryTitle(title)}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((item) => (
          <div key={item.label} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">{item.label}</p>
            <p className="mt-1 text-sm font-medium text-slate-900">{item.value}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export async function generateStaticParams() {
  return bikes.map((bike) => ({ slug: bike.slug }));
}

export default async function BikeDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolved = await params;
  const bike = getBikeBySlug(resolved.slug);
  if (!bike) notFound();
  const similarBikes = getSimilarBikes(bike, 3);
  const completeSpecs = bike.powertrain === "EV"
    ? completeEvSpecCategories(bike, similarBikes)
    : completeIceSpecCategories(bike, similarBikes);
  const defaultCategoryTitle = completeSpecs.find((category) => category.title.startsWith("1."))?.title ?? completeSpecs[0]?.title;
  const defaultCategoryKey = defaultCategoryTitle ? categoryAnchor(defaultCategoryTitle) : "basic-information";
  const specHeading = bike.powertrain === "EV"
    ? "Complete EV Bike Specification Categories"
    : "Complete ICE Bike Specification Categories";
  const specDescription = bike.powertrain === "EV"
    ? "Dedicated EV sheet covering motor, battery, charging, smart tech, and EV market positioning."
    : "Dedicated ICE sheet covering engine, fuel efficiency, transmission, maintenance, and competitor specs.";
  const colors = swatchPalette(colorPalette(bike));
  const primarySpecs = [
    {
      label: bike.powertrain === "ICE" ? "Engine" : "Motor",
      value: headlineMetric(bike),
      Icon: Zap,
    },
    { label: "Top Speed", value: `${bike.topSpeedKph} km/h`, Icon: Gauge },
    {
      label: bike.powertrain === "ICE" ? "Mileage" : "Range",
      value: bike.powertrain === "ICE" ? `${bike.mileageKmpl} km/l` : `${bike.rangeKm} km`,
      Icon: bike.powertrain === "EV" ? BatteryCharging : Fuel,
    },
  ];
  const warrantyItems = [
    {
      label: bike.powertrain === "EV" ? "Battery" : "Warranty",
      value: bike.powertrain === "EV" ? "3 yrs / 30,000 km" : "2 yrs / 20,000 km",
    },
    {
      label: bike.powertrain === "EV" ? "Motor" : "Service",
      value: bike.powertrain === "EV" ? "3 years" : "500 / 3k / 6k km",
    },
  ];

  // --- PAGE LAYOUT ---
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <main>
        <section className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm sm:p-6">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Gallery left */}
            <div className="mx-auto w-full max-w-lg flex-shrink-0 lg:mx-0 lg:w-[400px]">
              <BikeGallery images={bike.images && bike.images.length > 0 ? bike.images : ["/placeholder-bike.jpg"]} />
            </div>
            {/* Details right */}
            <div className="flex-1">
              <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
                <h1 className="font-heading text-5xl uppercase tracking-wide text-slate-900 sm:text-6xl">
                  {bike.brand} {bike.model}
                </h1>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <Badge className="bg-slate-900 text-white hover:bg-slate-900">{bike.category}</Badge>
                  <Badge variant="outline" className={powertrainBadgeClass(bike.powertrain)}>
                    {bike.powertrain}
                  </Badge>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Price</p>
                <p className="mt-1 font-heading text-4xl uppercase tracking-wide text-slate-900 sm:text-5xl">
                  {formatBdt(bike.priceBdt)}
                </p>
              </div>
              <div className="mt-5 flex flex-col gap-4">
                <Link
                  href={{
                    pathname: "/marketplace",
                    query: { model: bike.model }
                  }}
                  className={cn(buttonVariants({ size: "lg" }), "w-full bg-slate-900 text-white hover:bg-slate-800 text-lg py-3 text-center")}
                >
                  Buy Parts
                </Link>
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                  <div className="flex flex-wrap divide-y divide-slate-200 sm:divide-x sm:divide-y-0">
                    {primarySpecs.map((spec, index) => {
                      const Icon = spec.Icon;

                      return (
                        <div
                          key={spec.label}
                          className={cn(
                            "flex min-w-[10rem] flex-1 items-center gap-3 px-4 py-3",
                            index === 1 && "sm:min-w-[9.5rem]"
                          )}
                        >
                          <div className="rounded-full bg-white p-2 text-slate-700 shadow-sm">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                              {spec.label}
                            </p>
                            <p className="text-sm font-semibold text-slate-900">{spec.value}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <p className="max-w-3xl text-slate-600">{bike.summary}</p>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Colors</p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    {colors.map((color) => (
                      <div key={color.name} className="flex items-center gap-2 rounded-full bg-white px-2.5 py-1.5 shadow-sm">
                        <span
                          className="h-4 w-4 rounded-full border border-slate-200"
                          style={{ backgroundColor: color.hex }}
                          aria-hidden="true"
                        />
                        <span className="text-sm font-medium text-slate-700">{color.name}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-200 pt-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Warranty</p>
                    {warrantyItems.map((item) => (
                      <div key={item.label} className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                          {item.label}
                        </span>
                        <span className="font-semibold text-slate-900">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6">
          <h2 className="font-heading text-4xl uppercase tracking-wide text-slate-900">
            {specHeading}
          </h2>
          <p className="mt-2 text-sm text-slate-600">{specDescription}</p>

          <Tabs
            orientation="vertical"
            defaultValue={defaultCategoryKey}
            className="mt-4 grid gap-4 lg:grid-cols-[250px_1fr]"
          >
            <aside className="h-fit self-start rounded-2xl border border-slate-200 bg-white/90 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Categories</p>
              <TabsList className="mt-3 h-auto w-full flex-col items-stretch gap-2 bg-transparent p-0">
                {completeSpecs.map((category) => (
                  <TabsTrigger
                    key={category.title}
                    value={categoryAnchor(category.title)}
                    className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-left text-xs font-medium text-slate-700 data-[state=active]:border-slate-400 data-[state=active]:bg-white"
                  >
                    {displayCategoryTitle(category.title)}
                  </TabsTrigger>
                ))}
              </TabsList>
            </aside>

            <div>
              {completeSpecs.map((category) => (
                <TabsContent
                  key={category.title}
                  value={categoryAnchor(category.title)}
                  className="mt-0"
                >
                  <SpecCategoryCard title={category.title} items={category.items} />
                </TabsContent>
              ))}
            </div>
          </Tabs>
        </section>

        <section className="mt-6 rounded-2xl border border-amber-300 bg-amber-50 p-5">
          <p className="text-sm text-amber-900/80">
            Disclaimer: this information may not be 100% accurate — please verify pricing and availability with official showrooms.
          </p>
        </section>
      </main>
    </div>
  );
}
