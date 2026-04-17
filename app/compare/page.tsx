"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRightLeft,
  BarChart3,
  Bike as BikeIcon,
  Brain,
  Check,
  ChevronDown,
  Crown,
  Flame,
  ListChecks,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Trophy,
  X,
  Zap,
} from "lucide-react";
import {
  runComparison,
  PROFILE_LABELS,
  METRIC_LABELS,
  type ScoringProfile,
  type ComparisonResult,
} from "@/lib/comparison-engine";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Bike, bikes, formatBdt, powertrainBadgeClass, Powertrain } from "@/lib/bikes-data";
import { cn } from "@/lib/utils";

/* ─────────────────── Spec Row Helpers (preserved from original) ─────────────────── */

type SpecRow = {
  label: string;
  valueFor: (bike: Bike) => string;
};

function yesNo(value: boolean): string {
  return value ? "Yes" : "No";
}

function launchYearFromBike(bike: Bike): number {
  if (bike.launchYear) return bike.launchYear;
  if (bike.model.includes("V4")) return 2024;
  if (bike.model.includes("Gen 3")) return 2023;
  if (bike.model.includes("ST")) return 2023;
  return 2022;
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

function batteryCapacityKwh(bike: Bike): number {
  if (bike.rangeKm) return Number((bike.rangeKm * 0.035).toFixed(1));
  return Number(((bike.motorPowerKw ?? 4) * 0.9).toFixed(1));
}

function parseHours(charging: string | undefined): number {
  if (!charging) return 5;
  const match = charging.match(/(\d+(?:\.\d+)?)h/i);
  if (!match?.[1]) return 5;
  return Number(match[1]);
}

function getIceSpecRows(): SpecRow[] {
  return [
    { label: "Brand", valueFor: (bike) => bike.brand },
    { label: "Model", valueFor: (bike) => bike.model },
    { label: "Category", valueFor: (bike) => bike.category },
    { label: "Launch Year", valueFor: (bike) => String(launchYearFromBike(bike)) },
    { label: "Price", valueFor: (bike) => formatBdt(bike.priceBdt) },
    { label: "Engine Displacement", valueFor: (bike) => `${bike.displacementCc ?? "-"} cc` },
    {
      label: "Power Output",
      valueFor: (bike) => bike.maxPower ?? `${Number((((bike.displacementCc ?? 125) * 0.085)).toFixed(1))} hp`,
    },
    { label: "Torque", valueFor: (bike) => bike.maxTorque ?? `${bike.torqueNm} Nm` },
    { label: "Top Speed", valueFor: (bike) => `${bike.topSpeedKph} km/h` },
    { label: "Fuel Type", valueFor: () => "Petrol" },
    { label: "Fuel Tank", valueFor: (bike) => `${bike.fuelTankLiters ?? "-"} L` },
    { label: "Mileage", valueFor: (bike) => `${bike.mileageKmpl ?? "-"} km/l` },
    {
      label: "Transmission",
      valueFor: (bike) => (bike.gearbox?.toLowerCase().includes("cvt") ? "CVT" : "Manual"),
    },
    { label: "Gearbox", valueFor: (bike) => bike.gearbox ?? "-" },
    {
      label: "Final Drive",
      valueFor: (bike) => bike.finalDrive ?? (bike.category === "Scooter" ? "Belt" : "Chain"),
    },
    {
      label: "Length",
      valueFor: (bike) => `${bike.lengthMm ?? geometryByCategory(bike.category).length} mm`,
    },
    {
      label: "Width",
      valueFor: (bike) => `${bike.widthMm ?? geometryByCategory(bike.category).width} mm`,
    },
    {
      label: "Height",
      valueFor: (bike) => `${bike.heightMm ?? geometryByCategory(bike.category).height} mm`,
    },
    { label: "Wheelbase", valueFor: (bike) => `${bike.wheelbaseMm} mm` },
    { label: "Ground Clearance", valueFor: (bike) => `${bike.groundClearanceMm} mm` },
    { label: "Seat Height", valueFor: (bike) => `${bike.seatHeightMm} mm` },
    { label: "Kerb Weight", valueFor: (bike) => `${bike.weightKg} kg` },
    { label: "Front Tyre", valueFor: (bike) => bike.frontTyre },
    { label: "Rear Tyre", valueFor: (bike) => bike.rearTyre },
    {
      label: "ABS",
      valueFor: (bike) => bike.absType ?? (bike.topSpeedKph >= 140 ? "Dual Channel" : bike.topSpeedKph >= 100 ? "Single Channel" : "None"),
    },
    { label: "Bluetooth", valueFor: (bike) => bike.bluetoothConnectivity ?? yesNo(bike.priceBdt >= 320000) },
    { label: "Navigation", valueFor: (bike) => bike.navigation ?? yesNo(bike.priceBdt >= 450000) },
    { label: "Warranty", valueFor: (bike) => bike.warranty ?? "2 years / 20,000 km" },
  ];
}

function getEvSpecRows(): SpecRow[] {
  return [
    { label: "Brand", valueFor: (bike) => bike.brand },
    { label: "Model", valueFor: (bike) => bike.model },
    { label: "Vehicle Type", valueFor: (bike) => (bike.category === "Scooter" ? "Electric Scooter" : "Electric Bike") },
    { label: "Launch Year", valueFor: (bike) => String(launchYearFromBike(bike)) },
    { label: "Price", valueFor: (bike) => formatBdt(bike.priceBdt) },
    { label: "Motor Type", valueFor: (bike) => (bike.category === "Scooter" ? "Hub Motor" : "Mid Drive BLDC") },
    { label: "Rated Power", valueFor: (bike) => `${bike.motorPowerKw ?? "-"} kW` },
    {
      label: "Peak Power",
      valueFor: (bike) => `${Number(((bike.motorPowerKw ?? 4) * 1.25).toFixed(1))} kW`,
    },
    { label: "Torque", valueFor: (bike) => bike.maxTorque ?? `${bike.torqueNm} Nm` },
    { label: "Top Speed", valueFor: (bike) => `${bike.topSpeedKph} km/h` },
    {
      label: "Acceleration",
      valueFor: (bike) => (bike.category === "Scooter" ? "0-40 km/h in 3.8 sec" : "0-60 km/h in 4.5 sec"),
    },
    {
      label: "Drive Type",
      valueFor: (bike) => (bike.category === "Scooter" ? "Hub" : "Chain"),
    },
    { label: "Battery Type", valueFor: () => "Lithium-ion" },
    {
      label: "Battery Capacity",
      valueFor: (bike) => `${batteryCapacityKwh(bike)} kWh`,
    },
    { label: "Voltage", valueFor: () => "72V" },
    {
      label: "Removable Battery",
      valueFor: (bike) => yesNo(bike.category === "Scooter"),
    },
    {
      label: "Swappable Battery",
      valueFor: (bike) => yesNo(bike.category === "Scooter" && bike.priceBdt < 500000),
    },
    { label: "Charging Time (0-100%)", valueFor: (bike) => bike.chargingTime0100 ?? "5h" },
    {
      label: "Charging Time (0-80%)",
      valueFor: (bike) => `${Number((parseHours(bike.chargingTime0100) * 0.8).toFixed(1))}h`,
    },
    {
      label: "Fast Charging Support",
      valueFor: (bike) => yesNo(parseHours(bike.chargingTime0100) <= 5),
    },
    { label: "Certified Range", valueFor: (bike) => `${bike.rangeKm ?? "-"} km` },
    {
      label: "Real-world Range",
      valueFor: (bike) => `${Math.round((bike.rangeKm ?? 120) * 0.82)} km`,
    },
    {
      label: "Energy Consumption",
      valueFor: (bike) => {
        const wh = Math.round((batteryCapacityKwh(bike) * 1000) / Math.max(bike.rangeKm ?? 120, 1));
        return `${wh} Wh/km`;
      },
    },
    {
      label: "Regenerative Braking",
      valueFor: () => "Yes",
    },
    { label: "Riding Modes", valueFor: (bike) => bike.ridingModes ?? "Eco, Normal, Sport" },
    {
      label: "Reverse Mode",
      valueFor: (bike) => yesNo(bike.category === "Scooter"),
    },
    { label: "Wheelbase", valueFor: (bike) => `${bike.wheelbaseMm} mm` },
    { label: "Ground Clearance", valueFor: (bike) => `${bike.groundClearanceMm} mm` },
    { label: "Seat Height", valueFor: (bike) => `${bike.seatHeightMm} mm` },
    { label: "Kerb Weight", valueFor: (bike) => `${bike.weightKg} kg` },
    { label: "Front Tyre", valueFor: (bike) => bike.frontTyre },
    { label: "Rear Tyre", valueFor: (bike) => bike.rearTyre },
    { label: "Water Resistance", valueFor: (bike) => bike.ipRating ?? "IP67" },
    { label: "Bluetooth", valueFor: (bike) => bike.bluetoothConnectivity ?? "Yes" },
    { label: "Navigation", valueFor: (bike) => bike.navigation ?? yesNo(bike.priceBdt >= 330000) },
    { label: "OTA Updates", valueFor: (bike) => bike.otaUpdates ?? yesNo(bike.priceBdt >= 500000) },
    { label: "Battery Warranty", valueFor: () => "3 years / 30,000 km" },
    {
      label: "Cost per Charge",
      valueFor: (bike) => `BDT ${Number((batteryCapacityKwh(bike) * 8).toFixed(1))}`,
    },
    {
      label: "Cost per km",
      valueFor: (bike) => {
        const perCharge = Number((batteryCapacityKwh(bike) * 8).toFixed(1));
        const realRange = Math.round((bike.rangeKm ?? 120) * 0.82);
        return `BDT ${Number((perCharge / Math.max(realRange, 1)).toFixed(2))}`;
      },
    },
  ];
}

/* ─────────────────── Popular Comparisons ─────────────────── */

type PopularComparison = {
  slug1: string;
  slug2: string;
  label: string;
};

const popularComparisons: PopularComparison[] = [
  { slug1: "yamaha-r15-v4", slug2: "bajaj-pulsar-n160", label: "Yamaha R15 V4 vs Pulsar N160" },
  { slug1: "honda-nx-200", slug2: "suzuki-vstrom-250", label: "Honda NX 200 vs V-Strom 250" },
  { slug1: "bajaj-pulsar-n160", slug2: "honda-nx-200", label: "Pulsar N160 vs NX 200" },
  { slug1: "honda-activa-125", slug2: "yamaha-rayzr-125", label: "Activa 125 vs RayZR 125" },
  { slug1: "honda-cb350rs", slug2: "suzuki-vstrom-250", label: "CB350RS vs V-Strom 250" },
  { slug1: "yamaha-r15-v4", slug2: "honda-nx-200", label: "R15 V4 vs NX 200" },
];

/* ─────────────────── Bike Thumbnail ─────────────────── */

function BikeThumb({ bike, size = "md" }: { bike: Bike; size?: "sm" | "md" | "lg" }) {
  const hasImage = bike.images && bike.images.length > 0;
  const sizeClasses = {
    sm: "h-8 w-8 rounded-lg",
    md: "h-10 w-10 rounded-xl",
    lg: "h-full w-full rounded-xl",
  };
  const iconClasses = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-8 w-8",
  };

  if (hasImage) {
    return (
      <div className={cn("shrink-0 overflow-hidden bg-slate-100", sizeClasses[size])}>
        <img
          src={bike.images![0]}
          alt={`${bike.brand} ${bike.model}`}
          className="h-full w-full object-cover object-center"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center bg-gradient-to-br from-slate-100 to-slate-50",
        sizeClasses[size]
      )}
    >
      <BikeIcon className={cn("text-slate-300", iconClasses[size])} />
    </div>
  );
}

/* ─────────────────── Bike Selector Dropdown ─────────────────── */

function BikeSelector({
  selectedBike,
  onSelect,
  onRemove,
  slotLabel,
  disabledSlugs,
}: {
  selectedBike: Bike | null;
  onSelect: (bike: Bike) => void;
  onRemove: () => void;
  slotLabel: string;
  disabledSlugs: Set<string>;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = useMemo(() => {
    return bikes.filter((bike) => {
      if (disabledSlugs.has(bike.slug)) return false;
      if (!search.trim()) return true;
      const query = search.toLowerCase();
      return (
        bike.brand.toLowerCase().includes(query) ||
        bike.model.toLowerCase().includes(query) ||
        `${bike.brand} ${bike.model}`.toLowerCase().includes(query)
      );
    });
  }, [search, disabledSlugs]);

  if (selectedBike) {
    const hasImage = selectedBike.images && selectedBike.images.length > 0;
    return (
      <div className="group relative">
        <div className="relative overflow-hidden rounded-2xl border-2 border-slate-200 bg-white shadow-sm transition-all duration-300 hover:border-amber-300 hover:shadow-md">
          {/* Powertrain strip */}
          <div
            className={cn(
              "absolute left-0 top-0 z-10 h-1 w-full",
              selectedBike.powertrain === "ICE"
                ? "bg-gradient-to-r from-red-400 to-orange-400"
                : "bg-gradient-to-r from-emerald-400 to-teal-400"
            )}
          />

          {/* Bike Image */}
          <div className="relative h-36 w-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-50">
            {hasImage ? (
              <img
                src={selectedBike.images![0]}
                alt={`${selectedBike.brand} ${selectedBike.model}`}
                className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-slate-300">
                <BikeIcon className="h-10 w-10" />
                <span className="text-[9px] font-medium uppercase tracking-widest text-slate-400">No Image</span>
              </div>
            )}
            {/* Badges overlay on image */}
            <div className="absolute left-2.5 top-3 flex gap-1.5">
              <Badge className="bg-slate-900/75 text-[10px] text-white backdrop-blur-sm hover:bg-slate-900/75">
                {selectedBike.category}
              </Badge>
            </div>
            <div className="absolute right-2.5 top-3">
              <Badge variant="outline" className={cn(powertrainBadgeClass(selectedBike.powertrain), "backdrop-blur-sm text-[10px]")}>
                {selectedBike.powertrain}
              </Badge>
            </div>
            {/* Remove button overlaid on image */}
            <button
              type="button"
              onClick={onRemove}
              className="absolute right-2.5 bottom-2.5 rounded-full bg-white/90 p-1.5 text-slate-400 shadow-sm backdrop-blur-sm transition-colors hover:bg-red-50 hover:text-red-500"
              aria-label="Remove bike"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
              {slotLabel}
            </p>
            <p className="mt-0.5 font-heading text-2xl uppercase tracking-wide text-slate-900 sm:text-3xl">
              {selectedBike.brand} {selectedBike.model}
            </p>

            <div className="mt-2.5 grid grid-cols-2 gap-2 text-xs text-slate-600">
              <div className="rounded-lg bg-slate-50 p-2">
                <span className="text-slate-400">Price</span>
                <p className="font-semibold text-slate-800">{formatBdt(selectedBike.priceBdt)}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-2">
                <span className="text-slate-400">Top Speed</span>
                <p className="font-semibold text-slate-800">{selectedBike.topSpeedKph} km/h</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen(!open);
          setSearch("");
        }}
        className={cn(
          "group flex w-full items-center justify-between gap-3 rounded-2xl border-2 border-dashed p-5 transition-all duration-300",
          open
            ? "border-amber-400 bg-amber-50/50 shadow-lg shadow-amber-100/50"
            : "border-slate-300 bg-white/80 hover:border-amber-300 hover:bg-amber-50/30 hover:shadow-md"
        )}
      >
        <div className="text-left">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
            {slotLabel}
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-500 group-hover:text-slate-700">
            Select a Motorcycle
          </p>
        </div>
        <ChevronDown
          className={cn(
            "h-5 w-5 text-slate-400 transition-transform duration-300",
            open && "rotate-180 text-amber-500"
          )}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[320px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/60">
          {/* Search input */}
          <div className="sticky top-0 z-10 border-b border-slate-100 bg-white/95 p-3 backdrop-blur-sm">
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search bikes..."
                className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
                autoFocus
              />
            </div>
          </div>

          {/* Results */}
          <div className="max-h-[240px] overflow-y-auto">
            {filtered.length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-slate-400">No bikes found</p>
            )}
            {filtered.map((bike) => (
              <button
                key={bike.slug}
                type="button"
                onClick={() => {
                  onSelect(bike);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-3 border-b border-slate-50 px-4 py-3 text-left transition-colors hover:bg-amber-50/60"
              >
                <BikeThumb bike={bike} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {bike.brand} {bike.model}
                  </p>
                  <p className="text-xs text-slate-500">
                    {bike.category} · {formatBdt(bike.priceBdt)}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={cn("shrink-0 text-[10px]", powertrainBadgeClass(bike.powertrain))}
                >
                  {bike.powertrain}
                </Badge>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────── VS Divider ─────────────────── */

function VsDivider() {
  return (
    <div className="flex flex-col items-center justify-center py-2 md:py-0">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-orange-300/40">
        <span className="font-heading text-lg font-black text-white">VS</span>
      </div>
    </div>
  );
}

/* Old generateSmartSummary replaced by lib/comparison-engine.ts */

/* ─────────────────── Main Compare Page ─────────────────── */

export default function ComparePage() {
  const [selectedBikes, setSelectedBikes] = useState<(Bike | null)[]>([null, null]);
  const [showComparison, setShowComparison] = useState(false);
  const [activeProfile, setActiveProfile] = useState<ScoringProfile>("balanced");
  const comparisonRef = useRef<HTMLDivElement>(null);

  const disabledSlugs = useMemo(() => {
    return new Set(selectedBikes.filter(Boolean).map((b) => b!.slug));
  }, [selectedBikes]);

  const validBikes = selectedBikes.filter(Boolean) as Bike[];
  const canCompare = validBikes.length >= 2;

  // Check for mixed powertrains
  const hasMixedPowertrains =
    validBikes.length >= 2 &&
    new Set(validBikes.map((b) => b.powertrain)).size > 1;

  const selectedPowertrain: Powertrain = validBikes[0]?.powertrain ?? "ICE";

  function handleSelectBike(index: number, bike: Bike) {
    setSelectedBikes((prev) => {
      const next = [...prev];
      next[index] = bike;
      return next;
    });
    setShowComparison(false);
  }

  function handleRemoveBike(index: number) {
    setSelectedBikes((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
    setShowComparison(false);
  }

  function addSlot() {
    if (selectedBikes.length < 3) {
      setSelectedBikes((prev) => [...prev, null]);
    }
  }

  function removeSlot(index: number) {
    if (selectedBikes.length > 2) {
      setSelectedBikes((prev) => prev.filter((_, i) => i !== index));
      setShowComparison(false);
    }
  }

  function loadPopularComparison(comp: PopularComparison) {
    const bike1 = bikes.find((b) => b.slug === comp.slug1) ?? null;
    const bike2 = bikes.find((b) => b.slug === comp.slug2) ?? null;
    setSelectedBikes([bike1, bike2]);
    setShowComparison(false);
  }

  function handleCompare() {
    if (!canCompare || hasMixedPowertrains) return;
    setShowComparison(true);
    // Scroll to comparison after a tick
    setTimeout(() => {
      comparisonRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }

  const specRows = selectedPowertrain === "ICE" ? getIceSpecRows() : getEvSpecRows();

  // Highlight rows where values differ
  function isHighlightRow(row: SpecRow): boolean {
    if (validBikes.length < 2) return false;
    const values = validBikes.map((b) => row.valueFor(b));
    return new Set(values).size > 1;
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      {/* ═══════ HERO / ENTRY ═══════ */}
      <section className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
          <ListChecks className="h-3.5 w-3.5" />
          Side-by-Side Comparison
        </div>

        <h1 className="mt-5 font-heading text-6xl uppercase tracking-wide text-slate-900 sm:text-7xl lg:text-8xl">
          Compare Motorcycles
        </h1>

        <p className="mx-auto mt-4 max-w-lg text-base text-slate-500 sm:text-lg">
          Compare specs, costs, and performance side-by-side.
          <br className="hidden sm:block" />
          Select up to 3 bikes to get started.
        </p>
      </section>

      {/* ═══════ BIKE SELECTOR GRID ═══════ */}
      <section className="mt-10">
        <div className="rounded-3xl border border-slate-200/80 bg-gradient-to-b from-white/90 to-slate-50/60 p-6 shadow-sm backdrop-blur-sm sm:p-8">
          {/* Selector cards */}
          <div
            className={cn(
              "grid items-center gap-4",
              selectedBikes.length === 2
                ? "grid-cols-1 md:grid-cols-[1fr_auto_1fr]"
                : "grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto_1fr]"
            )}
          >
            {selectedBikes.map((bike, i) => (
              <div key={i} className="contents">
                <div className="relative">
                  <BikeSelector
                    selectedBike={bike}
                    onSelect={(b) => handleSelectBike(i, b)}
                    onRemove={() =>
                      selectedBikes.length > 2 ? removeSlot(i) : handleRemoveBike(i)
                    }
                    slotLabel={`Bike ${i + 1}`}
                    disabledSlugs={disabledSlugs}
                  />
                  {/* Remove slot button for 3rd bike */}
                  {i >= 2 && (
                    <button
                      type="button"
                      onClick={() => removeSlot(i)}
                      className="absolute -right-2 -top-2 z-10 rounded-full border border-slate-200 bg-white p-1 text-slate-400 shadow-sm transition-colors hover:bg-red-50 hover:text-red-500"
                      aria-label="Remove slot"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* VS divider (between each bike, not after the last) */}
                {i < selectedBikes.length - 1 && <VsDivider />}
              </div>
            ))}
          </div>

          {/* Add another bike */}
          {selectedBikes.length < 3 && (
            <div className="mt-5 flex justify-center">
              <button
                type="button"
                onClick={addSlot}
                className="inline-flex items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white/90 px-5 py-2.5 text-sm font-semibold text-slate-500 transition-all duration-300 hover:border-amber-400 hover:bg-amber-50/60 hover:text-amber-700 hover:shadow-sm"
              >
                <Plus className="h-4 w-4" />
                Add another bike
              </button>
            </div>
          )}

          {/* Mixed powertrain warning */}
          {hasMixedPowertrains && (
            <div className="mt-5 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <p className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                ICE and EV bikes cannot be compared together. Please select bikes of the same
                powertrain type.
              </p>
            </div>
          )}

          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={handleCompare}
              disabled={!canCompare || hasMixedPowertrains}
              suppressHydrationWarning
              className={cn(
                "group relative inline-flex items-center gap-3 rounded-2xl px-10 py-4 text-lg font-bold tracking-wide transition-all duration-300",
                canCompare && !hasMixedPowertrains
                  ? "bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-xl shadow-slate-300/40 hover:shadow-2xl hover:shadow-slate-400/40 hover:from-slate-700 hover:to-slate-800 active:scale-[0.98]"
                  : "cursor-not-allowed bg-slate-200 text-slate-400"
              )}
            >
              <Sparkles
                className={cn(
                  "h-5 w-5 transition-transform duration-500",
                  canCompare && !hasMixedPowertrains && "group-hover:rotate-12 group-hover:scale-110"
                )}
              />
              Compare Now
              {canCompare && !hasMixedPowertrains && (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[10px] font-black text-slate-900">
                  {validBikes.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* ═══════ POPULAR COMPARISONS ═══════ */}
      <section className="mt-10">
        <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-6 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.15em] text-slate-400">
            <Flame className="h-4 w-4 text-orange-400" />
            Popular Comparisons
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {popularComparisons.map((comp) => {
              const bike1 = bikes.find((b) => b.slug === comp.slug1);
              const bike2 = bikes.find((b) => b.slug === comp.slug2);
              if (!bike1 || !bike2) return null;

              return (
                <button
                  key={`${comp.slug1}-${comp.slug2}`}
                  type="button"
                  onClick={() => loadPopularComparison(comp)}
                  className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 text-left transition-all duration-300 hover:border-amber-300 hover:shadow-md hover:shadow-amber-100/40"
                >
                  {/* Gradient accent */}
                  <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-amber-300 via-orange-400 to-amber-300 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                  <div className="flex items-center gap-3">
                    <BikeThumb bike={bike1} size="md" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {bike1.brand} {bike1.model}
                      </p>
                      <p className="text-[10px] uppercase tracking-wider text-slate-400">
                        {bike1.category} · {bike1.powertrain}
                      </p>
                    </div>

                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-[10px] font-black text-amber-700">
                      VS
                    </div>

                    <div className="min-w-0 flex-1 text-right">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {bike2.brand} {bike2.model}
                      </p>
                      <p className="text-[10px] uppercase tracking-wider text-slate-400">
                        {bike2.category} · {bike2.powertrain}
                      </p>
                    </div>
                    <BikeThumb bike={bike2} size="md" />
                  </div>

                  {/* Price comparison */}
                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px] text-slate-500">
                    <span>{formatBdt(bike1.priceBdt)}</span>
                    <ArrowRightLeft className="h-3 w-3 text-slate-300 transition-colors group-hover:text-amber-400" />
                    <span>{formatBdt(bike2.priceBdt)}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════ COMPARISON TABLE (shows after clicking Compare Now) ═══════ */}
      {showComparison && validBikes.length >= 2 && !hasMixedPowertrains && (
        <section ref={comparisonRef} className="mt-10 scroll-mt-24">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <h2 className="font-heading text-4xl uppercase tracking-wide text-slate-900 sm:text-5xl">
              Comparison Results
            </h2>
            <Badge className={powertrainBadgeClass(selectedPowertrain)}>
              {selectedPowertrain} bikes
            </Badge>
            <Badge variant="outline" className="border-slate-300 text-slate-700">
              {validBikes.length} bikes compared
            </Badge>
          </div>

          {/* ═══════ SCORING ENGINE DASHBOARD ═══════ */}
          {(() => {
            const result: ComparisonResult = runComparison(validBikes, activeProfile);
            const { bikes: scoredBikes, winner, scoreDifference, strengths, recommendations, summary } = result;
            const sortedBikes = [...scoredBikes].sort((a, b) => b.weightedScore - a.weightedScore);
            const maxScore = Math.max(...scoredBikes.map((b) => b.weightedScore));

            const bikeColors = [
              { bar: "bg-blue-500", ring: "ring-blue-200", text: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", check: "text-blue-500" },
              { bar: "bg-emerald-500", ring: "ring-emerald-200", text: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", check: "text-emerald-500" },
              { bar: "bg-violet-500", ring: "ring-violet-200", text: "text-violet-600", bg: "bg-violet-50", border: "border-violet-200", check: "text-violet-500" },
            ];

            const metricKeys: (keyof typeof METRIC_LABELS)[] = ["power", "torque", "mileage", "costPerKm", "weight", "features", "price"];

            return (
              <div className="mb-6 space-y-4">
                {/* ── Profile Selector Tabs ── */}
                <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-slate-400">
                    <BarChart3 className="h-3.5 w-3.5" />
                    Scoring Profile
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(["balanced", "commuter", "performance", "budget"] as ScoringProfile[]).map((profile) => (
                      <button
                        key={profile}
                        type="button"
                        onClick={() => setActiveProfile(profile)}
                        className={cn(
                          "rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-300",
                          activeProfile === profile
                            ? "bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-md"
                            : "border border-slate-200 bg-white text-slate-600 hover:border-amber-300 hover:bg-amber-50/50"
                        )}
                      >
                        {PROFILE_LABELS[profile]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ── Smart Summary Card ── */}
                <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50/80 via-white to-orange-50/60 p-6 shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-md shadow-amber-200/50">
                      <Brain className="h-4.5 w-4.5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-heading text-2xl uppercase tracking-wide text-slate-900 sm:text-3xl">
                        Which one should you buy?
                      </h3>
                      <p className="text-xs text-slate-500">Scored for {PROFILE_LABELS[activeProfile].toLowerCase()} riders</p>
                    </div>
                  </div>

                  {/* Overall Summary Text */}
                  <p className="mt-4 rounded-xl bg-white/70 p-3.5 text-sm leading-relaxed text-slate-700 shadow-inner">
                    {summary}
                  </p>

                  {/* Score Cards */}
                  <div className={cn(
                    "mt-5 grid gap-4",
                    validBikes.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3"
                  )}>
                    {sortedBikes.map((scored, idx) => {
                      const colors = bikeColors[scoredBikes.findIndex((b) => b.slug === scored.slug) % bikeColors.length];
                      const isWinner = winner?.slug === scored.slug && winner?.verdict === "clear_winner";
                      const rec = recommendations.find((r) => r.slug === scored.slug);
                      const matchedBike = validBikes.find((b) => b.slug === scored.slug);

                      return (
                        <div
                          key={scored.slug}
                          className={cn(
                            "relative rounded-xl border p-4 transition-all duration-300 hover:shadow-md",
                            isWinner ? "border-amber-300 bg-amber-50/40 ring-1 ring-amber-200" : `${colors.border} ${colors.bg}`
                          )}
                        >
                          {/* Winner Badge */}
                          {isWinner && (
                            <div className="absolute -right-1 -top-1 flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-md">
                              <Crown className="h-3 w-3" />
                              Winner
                            </div>
                          )}

                          {/* Bike Header */}
                          <div className="flex items-center gap-2.5">
                            {matchedBike && <BikeThumb bike={matchedBike} size="sm" />}
                            <div className="min-w-0 flex-1">
                              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                                {isWinner ? "Choose" : idx === 0 ? "Choose" : "Consider"}
                              </p>
                              <p className="truncate font-heading text-xl uppercase tracking-wide text-slate-900">
                                {scored.brand} {scored.model}
                              </p>
                            </div>
                          </div>

                          {/* Score Display */}
                          <div className="mt-3 flex items-center gap-3">
                            <div className="relative h-16 w-16 shrink-0">
                              <svg viewBox="0 0 36 36" className="h-16 w-16 -rotate-90">
                                <circle cx="18" cy="18" r="15" fill="none" stroke="#e2e8f0" strokeWidth="2.5" />
                                <circle
                                  cx="18" cy="18" r="15" fill="none"
                                  strokeWidth="2.5" strokeLinecap="round"
                                  className={isWinner ? "stroke-amber-500" : colors.bar.replace("bg-", "stroke-")}
                                  strokeDasharray={`${(scored.weightedScore / 10) * 94.2} 94.2`}
                                />
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-lg font-black text-slate-900">
                                  {scored.weightedScore.toFixed(1)}
                                </span>
                              </div>
                            </div>
                            <div className="min-w-0 flex-1 text-xs text-slate-500">
                              out of 10
                              <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-200">
                                <div
                                  className={cn(
                                    "h-full rounded-full transition-all duration-700",
                                    isWinner ? "bg-gradient-to-r from-amber-400 to-orange-500" : colors.bar
                                  )}
                                  style={{ width: `${(scored.weightedScore / maxScore) * 100}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Top Strengths */}
                          {rec && rec.topStrengths.length > 0 && (
                            <div className="mt-3 space-y-1.5">
                              {rec.topStrengths.slice(0, 4).map((str) => (
                                <div key={str} className="flex items-start gap-1.5">
                                  <Check className={cn("mt-0.5 h-3 w-3 shrink-0", isWinner ? "text-amber-500" : colors.check)} />
                                  <p className="text-xs text-slate-600">{str}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ── Metric Breakdown Bars ── */}
                <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-sm backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-slate-400">
                    <ListChecks className="h-3.5 w-3.5" />
                    Metric Breakdown
                  </div>

                  <div className="mt-4 space-y-4">
                    {metricKeys.map((key) => (
                      <div key={key}>
                        <div className="mb-1.5 flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-600">{METRIC_LABELS[key]}</span>
                        </div>
                        <div className="space-y-1.5">
                          {scoredBikes.map((scored, idx) => {
                            const colors = bikeColors[idx % bikeColors.length];
                            const normalized = scored.normalizedMetrics[key];
                            return (
                              <div key={scored.slug} className="flex items-center gap-2">
                                <span className="w-20 truncate text-[10px] font-semibold text-slate-500 sm:w-28">
                                  {scored.brand} {scored.model}
                                </span>
                                <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
                                  <div
                                    className={cn("h-full rounded-full transition-all duration-700", colors.bar)}
                                    style={{ width: `${(normalized / 10) * 100}%` }}
                                  />
                                </div>
                                <span className="w-8 text-right text-[10px] font-bold text-slate-700">
                                  {normalized.toFixed(1)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── Strength Comparisons ── */}
                {strengths.length > 0 && (
                  <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-sm backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-slate-400">
                      <Zap className="h-3.5 w-3.5 text-amber-400" />
                      Key Differences
                    </div>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {strengths.map((s) => {
                        const winnerBike = scoredBikes.find((b) => b.slug === s.winnerSlug);
                        return (
                          <div
                            key={s.metric}
                            className="flex items-start gap-2.5 rounded-xl border border-slate-100 bg-slate-50/60 p-3"
                          >
                            <div className={cn(
                              "mt-0.5 rounded-md px-1.5 py-0.5 text-[9px] font-black uppercase",
                              s.tier === "significantly_better"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-slate-200 text-slate-600"
                            )}>
                              {s.tier === "significantly_better" ? "↑↑" : "↑"}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold text-slate-800">
                                {winnerBike?.brand} {winnerBike?.model}
                              </p>
                              <p className="text-[11px] text-slate-500">
                                {s.tier === "significantly_better" ? "Significantly" : "Noticeably"} better {s.metricLabel.toLowerCase()}
                              </p>
                              <p className="text-[10px] text-slate-400">
                                {s.percentDiff.toFixed(0)}% advantage
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/80">
                    <TableHead className="w-[240px] text-slate-700">Specification</TableHead>
                    {validBikes.map((bike) => (
                      <TableHead key={bike.slug} className="min-w-[200px] align-top">
                        <div className="space-y-1">
                          <p className="font-heading text-2xl uppercase tracking-wide text-slate-900">
                            {bike.brand} {bike.model}
                          </p>
                          <Badge
                            variant="outline"
                            className={powertrainBadgeClass(bike.powertrain)}
                          >
                            {bike.powertrain}
                          </Badge>
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {specRows.map((row) => {
                    const highlight = isHighlightRow(row);
                    return (
                      <TableRow
                        key={row.label}
                        className={cn(highlight && "bg-amber-50/40")}
                      >
                        <TableCell className="font-medium text-slate-700">
                          {row.label}
                          {highlight && (
                            <Zap className="ml-1.5 inline-block h-3 w-3 text-amber-500" />
                          )}
                        </TableCell>
                        {validBikes.map((bike) => (
                          <TableCell key={`${bike.slug}-${row.label}`} className="text-slate-800">
                            {row.valueFor(bike)}
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <h3 className="flex items-center gap-2 font-heading text-3xl uppercase tracking-wide text-amber-900">
              <ArrowRightLeft className="h-6 w-6" />
              Need More Details?
            </h3>
            <p className="mt-2 text-sm text-amber-900/80">
              Open individual bike detail pages for complete category breakdowns, gallery, and full
              spec sheets.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {validBikes.map((bike) => (
                <Link
                  key={bike.slug}
                  href={`/bikes/${bike.slug}`}
                  className={cn(
                    buttonVariants({ size: "sm" }),
                    "bg-amber-600 text-white hover:bg-amber-500"
                  )}
                >
                  {bike.brand} {bike.model} Specs →
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
