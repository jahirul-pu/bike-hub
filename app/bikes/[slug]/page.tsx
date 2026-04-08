import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
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

function onRoadPrice(price: number) {
  return Math.round(price * 1.12);
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
  if (bike.category === "Sport") return "Racing Blue, Matte Black, Silver";
  if (bike.category === "Adventure") return "Forest Green, Desert Sand, Black";
  if (bike.category === "Scooter") return "Pearl White, Red, Cyan, Gray";
  return "Black, Red, Gray";
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

function ratings(bike: Bike) {
  const user = Number((4 + (bike.topSpeedKph % 11) / 20).toFixed(1));
  const expert = Number((4.1 + (bike.priceBdt % 7) / 20).toFixed(1));
  const reviews = 80 + Math.round(bike.priceBdt / 12000);
  return { user, expert, reviews };
}

function annualMaintenance(bike: Bike): number {
  if (bike.powertrain === "EV") return 8000 + Math.round((bike.motorPowerKw ?? 4) * 500);
  return 12000 + Math.round((bike.displacementCc ?? 125) * 20);
}

function resaleValue3Years(bike: Bike): number {
  const multiplier = bike.powertrain === "EV" ? 0.56 : 0.62;
  return Math.round(bike.priceBdt * multiplier);
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
  const launchYear = launchYearFromBike(bike);
  const motorPower = bike.motorPowerKw ?? 4;
  const peakPower = Number((motorPower * 1.25).toFixed(1));
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
  const annualCost = annualMaintenance(bike);
  const costPerCharge = Number((batteryKwh * 8).toFixed(1));
  const costPerKm = Number((costPerCharge / Math.max(realWorldRange, 1)).toFixed(2));
  const monthlyCost = Math.round(costPerKm * 600 + annualCost / 12);
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
        { label: "Status (Available / Upcoming / Discontinued)", value: "Available" },
        { label: "Price (BDT)", value: formatBdt(bike.priceBdt) },
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
        { label: "Battery Type (Lithium-ion / LFP / Lead-acid)", value: "Lithium-ion" },
        { label: "Battery Capacity (kWh / Ah)", value: `${batteryKwh} kWh` },
        { label: "Voltage (V)", value: "72V" },
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
        { label: "Riding Modes", value: "Eco, Normal, Sport" },
        { label: "Reverse Mode", value: yesNo(bike.category === "Scooter") },
        { label: "Smart BMS (Battery Management System)", value: yesNo(true) },
      ],
    },
    {
      title: "7. Transmission",
      items: [
        { label: "Gear Type (Automatic / Direct Drive)", value: "Direct Drive" },
        { label: "Transmission Type (Single Speed)", value: "Single Speed" },
      ],
    },
    {
      title: "8. Dimensions & Weight",
      items: [
        { label: "Length (mm)", value: `${geometry.length} mm` },
        { label: "Width (mm)", value: `${geometry.width} mm` },
        { label: "Height (mm)", value: `${geometry.height} mm` },
        { label: "Wheelbase (mm)", value: `${bike.wheelbaseMm} mm` },
        { label: "Ground Clearance (mm)", value: `${bike.groundClearanceMm} mm` },
        { label: "Seat Height (mm)", value: `${bike.seatHeightMm} mm` },
        { label: "Kerb Weight (kg)", value: `${bike.weightKg} kg` },
        { label: "Payload Capacity (kg)", value: bike.category === "Scooter" ? "150 kg" : "180 kg" },
      ],
    },
    {
      title: "9. Suspension",
      items: [
        { label: "Front Suspension (Telescopic / USD)", value: bike.category === "Sport" ? "USD" : "Telescopic" },
        {
          label: "Rear Suspension (Mono-shock / Dual shock)",
          value: bike.category === "Scooter" ? "Dual shock" : "Mono-shock",
        },
      ],
    },
    {
      title: "10. Brakes & Wheels",
      items: [
        { label: "Front Brake (Disc/Drum)", value: bike.topSpeedKph >= 95 ? "Disc" : "Drum" },
        { label: "Rear Brake", value: bike.topSpeedKph >= 120 ? "Disc" : "Drum" },
        { label: "ABS / CBS", value: abs === "None" ? "CBS" : abs },
        { label: "Tyre Type (Tubeless / Tube)", value: "Tubeless" },
        { label: "Front Tyre Size", value: bike.frontTyre },
        { label: "Rear Tyre Size", value: bike.rearTyre },
        { label: "Wheel Type (Alloy / Steel)", value: "Alloy" },
      ],
    },
    {
      title: "11. Features & Smart Tech",
      items: [
        { label: "Digital Display (LCD / TFT)", value: bike.priceBdt >= 500000 ? "TFT" : "LCD" },
        { label: "Bluetooth Connectivity", value: yesNo(true) },
        { label: "Mobile App Integration", value: yesNo(true) },
        { label: "GPS Tracking", value: yesNo(bike.priceBdt >= 350000) },
        { label: "Navigation", value: yesNo(bike.priceBdt >= 330000) },
        { label: "Geo-fencing", value: yesNo(bike.priceBdt >= 330000) },
        { label: "Anti-theft System", value: yesNo(true) },
        { label: "Keyless Start", value: yesNo(bike.priceBdt >= 350000) },
        { label: "USB Charging Port", value: yesNo(true) },
        { label: "OTA Updates", value: yesNo(bike.priceBdt >= 500000) },
      ],
    },
    {
      title: "12. Lighting",
      items: [
        { label: "Headlight (LED / Projector)", value: bike.priceBdt >= 500000 ? "Projector LED" : "LED" },
        { label: "DRL", value: yesNo(true) },
        { label: "Tail Light", value: "LED" },
        { label: "Indicators", value: "LED" },
      ],
    },
    {
      title: "13. Safety",
      items: [
        { label: "Side Stand Sensor", value: yesNo(true) },
        { label: "Kill Switch", value: yesNo(bike.category !== "Scooter") },
        {
          label: "Battery Protection (Overcharge / Thermal / Short Circuit)",
          value: "Overcharge, Thermal, Short Circuit",
        },
        { label: "Water Resistance Rating (IP67 etc.)", value: bike.ipRating ?? "IP67" },
      ],
    },
    {
      title: "14. Warranty & Service",
      items: [
        { label: "Battery Warranty (Years / km)", value: "3 years / 30,000 km" },
        { label: "Motor Warranty", value: "3 years" },
        { label: "Vehicle Warranty", value: "2 years / 24,000 km" },
        { label: "Service Interval", value: "Every 6 months" },
      ],
    },
    {
      title: "15. Cost & Ownership",
      items: [
        { label: "Cost per Charge (BDT)", value: `BDT ${costPerCharge}` },
        { label: "Cost per km", value: `BDT ${costPerKm}` },
        { label: "Estimated Monthly Cost", value: formatBdt(monthlyCost) },
        { label: "Maintenance Cost", value: `${formatBdt(annualCost)} per year` },
      ],
    },
    {
      title: "16. Colors & Variants",
      items: [
        { label: "Available Colors", value: colorPalette(bike) },
        { label: "Variant Differences", value: variantDifferences(bike) },
      ],
    },
    {
      title: "17. Media",
      items: [
        { label: "Images", value: "8 high-resolution images" },
        { label: "Videos", value: "2 walkaround videos" },
        { label: "360° View", value: yesNo(bike.priceBdt >= 350000) },
      ],
    },
    {
      title: "18. Comparisons & Market",
      items: [
        {
          label: "Competitors",
          value:
            similarBikes.length === 0
              ? "No similar bikes found"
              : similarBikes.map((candidate) => `${candidate.brand} ${candidate.model}`).join(" | "),
        },
        { label: "Segment (Budget / Premium / Performance EV)", value: evSegment(bike) },
      ],
    },
  ];
}

function completeIceSpecCategories(bike: Bike, similarBikes: Bike[]): SpecCategory[] {
  const launchYear = launchYearFromBike(bike);
  const showroom = bike.priceBdt;
  const onRoad = onRoadPrice(bike.priceBdt);
  const displacement = bike.displacementCc ?? 125;
  const geometry = geometryByCategory(bike.category);
  const gears = gearCount(bike);
  const rating = ratings(bike);
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
        { label: "Status", value: "Available" },
        { label: "Price (BDT)", value: formatBdt(bike.priceBdt) },
        {
          label: "Showroom Price vs On-road Price",
          value: `${formatBdt(showroom)} vs ${formatBdt(onRoad)}`,
        },
      ],
    },
    {
      title: "2. Engine & Performance (ICE Bikes)",
      items: [
        { label: "Engine Type", value: engineType(displacement) },
        { label: "Displacement (cc)", value: `${displacement} cc` },
        {
          label: "Max Power (HP / PS @ RPM)",
          value: `${estimatedPowerFromCc(displacement)} HP @ ${displacement >= 300 ? "6,500" : "8,000"} RPM`,
        },
        { label: "Max Torque (Nm @ RPM)", value: `${bike.torqueNm} Nm @ ${displacement >= 300 ? "4,000" : "6,500"} RPM` },
        { label: "Cooling System", value: coolingSystem(displacement) },
        { label: "Fuel System", value: fuelSystem(displacement) },
        { label: "Compression Ratio", value: compressionRatio(displacement) },
        { label: "Bore x Stroke", value: boreStroke(displacement) },
        { label: "Emission Standard", value: "BS6 / Euro 5" },
      ],
    },
    {
      title: "4. Transmission",
      items: [
        {
          label: "Gear Type",
          value:
            bike.powertrain === "EV"
              ? "Automatic"
              : bike.gearbox?.toLowerCase().includes("cvt")
                ? "CVT"
                : "Manual",
        },
        { label: "Number of Gears", value: `${gears}` },
        {
          label: "Clutch Type",
          value:
            bike.powertrain === "EV"
              ? "N/A (direct drive)"
              : bike.gearbox?.toLowerCase().includes("cvt")
                ? "Automatic centrifugal"
                : "Wet multi-plate",
        },
        {
          label: "Final Drive",
          value: bike.category === "Scooter" ? "Belt" : "Chain",
        },
      ],
    },
    {
      title: "5. Fuel & Efficiency",
      items: [
        { label: "Fuel Type", value: "Petrol" },
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
          value: `${Number(((bike.fuelTankLiters ?? 6) * 0.12).toFixed(1))} L`,
        },
      ],
    },
    {
      title: "6. Dimensions & Weight",
      items: [
        { label: "Length (mm)", value: `${geometry.length} mm` },
        { label: "Width (mm)", value: `${geometry.width} mm` },
        { label: "Height (mm)", value: `${geometry.height} mm` },
        { label: "Wheelbase (mm)", value: `${bike.wheelbaseMm} mm` },
        { label: "Ground Clearance (mm)", value: `${bike.groundClearanceMm} mm` },
        { label: "Seat Height (mm)", value: `${bike.seatHeightMm} mm` },
        { label: "Kerb Weight (kg)", value: `${bike.weightKg} kg` },
      ],
    },
    {
      title: "7. Chassis & Suspension",
      items: [
        {
          label: "Frame Type",
          value: bike.category === "Sport" ? "Deltabox" : bike.category === "Adventure" ? "Trellis" : "Diamond",
        },
        {
          label: "Front Suspension",
          value: bike.category === "Sport" ? "USD Fork" : "Telescopic Fork",
        },
        {
          label: "Rear Suspension",
          value: bike.category === "Scooter" ? "Twin shock" : "Mono-shock",
        },
      ],
    },
    {
      title: "8. Brakes & Wheels",
      items: [
        {
          label: "Front Brake (Disc/Drum + size)",
          value: bike.topSpeedKph >= 110 ? "Disc 300 mm" : "Disc 240 mm",
        },
        {
          label: "Rear Brake",
          value: bike.topSpeedKph >= 120 ? "Disc 230 mm" : "Drum 130 mm",
        },
        { label: "ABS", value: abs },
        { label: "Front Tyre Size", value: bike.frontTyre },
        { label: "Rear Tyre Size", value: bike.rearTyre },
        { label: "Wheel Type", value: "Alloy" },
        { label: "Tyre Type", value: "Tubeless" },
      ],
    },
    {
      title: "9. Features & Electronics",
      items: [
        { label: "Instrument Console", value: consoleType(bike) },
        { label: "Bluetooth Connectivity", value: yesNo(bike.priceBdt >= 320000) },
        { label: "Navigation", value: yesNo(bike.priceBdt >= 450000) },
        { label: "Riding Modes", value: yesNo(bike.topSpeedKph >= 140) },
        { label: "Traction Control", value: yesNo(bike.topSpeedKph >= 150) },
        { label: "Cruise Control", value: yesNo(bike.category === "Adventure" || bike.priceBdt > 800000) },
        { label: "Quick Shifter", value: yesNo(bike.category === "Sport" && bike.priceBdt > 700000) },
        { label: "USB Charging Port", value: yesNo(true) },
        { label: "Mobile App Support", value: yesNo(bike.priceBdt >= 400000) },
      ],
    },
    {
      title: "10. Lighting",
      items: [
        {
          label: "Headlight Type",
          value: bike.priceBdt >= 300000 ? "LED Projector" : "Halogen",
        },
        { label: "DRL", value: yesNo(bike.priceBdt >= 280000) },
        { label: "Tail Light Type", value: "LED" },
        { label: "Turn Signal Type", value: "LED" },
      ],
    },
    {
      title: "11. Safety",
      items: [
        { label: "ABS", value: abs },
        { label: "CBS (Combined Braking System)", value: yesNo(abs === "None") },
        { label: "Engine Kill Switch", value: yesNo(bike.category !== "Scooter") },
        { label: "Side Stand Engine Cut-off", value: yesNo(bike.category !== "Scooter") },
        { label: "Anti-theft Alarm", value: yesNo(false) },
      ],
    },
    {
      title: "12. Warranty & Service",
      items: [
        { label: "Warranty (Years / km)", value: "2 years / 20,000 km" },
        { label: "Free Service Schedule", value: "500 km, 3,000 km, 6,000 km" },
        { label: "Service Interval", value: "Every 3,000 km" },
      ],
    },
    {
      title: "13. Colors & Variants",
      items: [
        { label: "Available Colors", value: colorPalette(bike) },
        { label: "Special Editions", value: specialEdition(bike) },
        { label: "Variant Differences", value: variantDifferences(bike) },
      ],
    },
    {
      title: "14. Pros & Cons (Review Layer)",
      items: [
        {
          label: "Pros",
          value: "Strong highway stability, predictable handling, service reach",
        },
        {
          label: "Cons",
          value: "Higher fuel dependency, regular engine maintenance",
        },
      ],
    },
    {
      title: "15. Ratings & Reviews",
      items: [
        { label: "User Rating", value: `${rating.user} / 5` },
        { label: "Expert Rating", value: `${rating.expert} / 5` },
        { label: "Review Count", value: `${rating.reviews}` },
      ],
    },
    {
      title: "16. Ownership & Cost",
      items: [
        { label: "Insurance Cost (estimated)", value: formatBdt(Math.round(bike.priceBdt * 0.03)) },
        { label: "Maintenance Cost", value: `${formatBdt(annualMaintenance(bike))} per year` },
        { label: "Resale Value", value: `${formatBdt(resaleValue3Years(bike))} after 3 years` },
      ],
    },
    {
      title: "17. Media",
      items: [
        { label: "Images", value: "10 high-resolution images" },
        { label: "Videos", value: "2 walkaround videos" },
        { label: "360° View", value: yesNo(bike.priceBdt >= 350000) },
      ],
    },
    {
      title: "18. Competitors",
      items: [
        {
          label: "Similar Bikes",
          value:
            similarBikes.length === 0
              ? "No similar bikes found"
              : similarBikes.map((candidate) => `${candidate.brand} ${candidate.model}`).join(" | "),
        },
        { label: "Price Comparison", value: competitorPriceLine(bike, similarBikes) },
        { label: "Spec Comparison", value: competitorSpecLine(bike, similarBikes) },
      ],
    },
  ];

  return categories;
}

function SpecCategoryCard({ title, items }: SpecCategory) {
  return (
    <Card className="border-slate-200 bg-white/90">
      <CardHeader className="pb-3">
        <CardTitle className="font-heading text-3xl uppercase tracking-wide text-slate-900">{title}</CardTitle>
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

  if (!bike) {
    notFound();
  }

  const similarBikes = getSimilarBikes(bike, 3);
  const completeSpecs =
    bike.powertrain === "EV"
      ? completeEvSpecCategories(bike, similarBikes)
      : completeIceSpecCategories(bike, similarBikes);

  const defaultCategoryTitle =
    completeSpecs.find((category) => category.title.startsWith("1."))?.title ?? completeSpecs[0]?.title;
  const defaultCategoryKey = defaultCategoryTitle ? categoryAnchor(defaultCategoryTitle) : "basic-information";

  const specHeading =
    bike.powertrain === "EV"
      ? "Complete EV Bike Specification Categories"
      : "Complete ICE Bike Specification Categories";
  const specDescription =
    bike.powertrain === "EV"
      ? "Dedicated EV sheet covering motor, battery, charging, smart tech, and EV market positioning."
      : "Dedicated ICE sheet covering engine, fuel efficiency, transmission, maintenance, and competitor specs.";

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_320px] lg:px-8">
      <main>
        <section className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-slate-900 text-white hover:bg-slate-900">{bike.category}</Badge>
            <Badge variant="outline" className="border-slate-300 text-slate-700">
              {bike.powertrain}
            </Badge>
          </div>

          <h1 className="mt-3 font-heading text-5xl uppercase tracking-wide text-slate-900 sm:text-6xl">
            {bike.brand} {bike.model}
          </h1>
          <p className="mt-2 max-w-3xl text-slate-600">{bike.summary}</p>

          <div className="mt-5 grid gap-2 sm:grid-cols-3">
            <div className="rounded-lg bg-slate-100 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">Price</p>
              <p className="text-base font-semibold text-slate-900">{formatBdt(bike.priceBdt)}</p>
            </div>
            <div className="rounded-lg bg-slate-100 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                {bike.powertrain === "ICE" ? "Engine CC" : "Motor Output"}
              </p>
              <p className="text-base font-semibold text-slate-900">{headlineMetric(bike)}</p>
            </div>
            <div className="rounded-lg bg-slate-100 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">Top Speed</p>
              <p className="text-base font-semibold text-slate-900">{bike.topSpeedKph} km/h</p>
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
                    {category.title.replace(/^\d+\.\s*/, "")}
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
          <h2 className="font-heading text-3xl uppercase tracking-wide text-amber-900">Check Local Price</h2>
          <p className="mt-2 text-sm text-amber-900/80">
            Price varies by city, registration costs, and stock allocation. See your nearest official outlet for final on-road pricing.
          </p>
          <Link
            href="/showrooms"
            className={cn(buttonVariants(), "mt-4 bg-amber-600 text-white hover:bg-amber-500")}
          >
            Open Showroom Directory
            <ChevronRight className="h-4 w-4" />
          </Link>
        </section>
      </main>

      <aside>
        <Card className="sticky top-20 border-slate-200 bg-white/90">
          <CardHeader>
            <CardTitle className="font-heading text-3xl uppercase tracking-wide text-slate-900">
              Quick Comparison
            </CardTitle>
            <p className="text-xs text-slate-500">
              Suggestions ranked by nearest price and {bike.powertrain === "ICE" ? "engine cc" : "motor output"}.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {similarBikes.map((candidate) => (
              <Link
                key={candidate.slug}
                href={`/bikes/${candidate.slug}`}
                className="block rounded-lg border border-slate-200 bg-slate-50 p-3 transition hover:border-slate-400"
              >
                <p className="font-semibold text-slate-900">
                  {candidate.brand} {candidate.model}
                </p>
                <p className="mt-1 text-xs text-slate-600">{headlineMetric(candidate)}</p>
                <p className="mt-1 text-sm font-medium text-slate-900">{formatBdt(candidate.priceBdt)}</p>
                <p className="mt-1 text-xs text-slate-500">
                  Similarity metric: {metricForSimilarity(candidate)} {candidate.powertrain === "ICE" ? "cc" : "W"}
                </p>
              </Link>
            ))}

            <Link
              href={`/compare?bikes=${[bike.slug, ...similarBikes.map((item) => item.slug)].join(",")}`}
              className={cn(buttonVariants(), "w-full bg-slate-900 text-white hover:bg-slate-700")}
            >
              Compare These Bikes
            </Link>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
