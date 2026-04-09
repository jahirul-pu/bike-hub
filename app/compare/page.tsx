import Link from "next/link";
import { AlertTriangle, ArrowRightLeft } from "lucide-react";
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

type SpecRow = {
  label: string;
  valueFor: (bike: Bike) => string;
};

function yesNo(value: boolean): string {
  return value ? "Yes" : "No";
}

function launchYearFromBike(bike: Bike): number {
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
      valueFor: (bike) => `${Number((((bike.displacementCc ?? 125) * 0.085)).toFixed(1))} hp`,
    },
    { label: "Torque", valueFor: (bike) => `${bike.torqueNm} Nm` },
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
      valueFor: (bike) => (bike.category === "Scooter" ? "Belt" : "Chain"),
    },
    {
      label: "Length",
      valueFor: (bike) => `${geometryByCategory(bike.category).length} mm`,
    },
    {
      label: "Width",
      valueFor: (bike) => `${geometryByCategory(bike.category).width} mm`,
    },
    {
      label: "Height",
      valueFor: (bike) => `${geometryByCategory(bike.category).height} mm`,
    },
    { label: "Wheelbase", valueFor: (bike) => `${bike.wheelbaseMm} mm` },
    { label: "Ground Clearance", valueFor: (bike) => `${bike.groundClearanceMm} mm` },
    { label: "Seat Height", valueFor: (bike) => `${bike.seatHeightMm} mm` },
    { label: "Kerb Weight", valueFor: (bike) => `${bike.weightKg} kg` },
    { label: "Front Tyre", valueFor: (bike) => bike.frontTyre },
    { label: "Rear Tyre", valueFor: (bike) => bike.rearTyre },
    {
      label: "ABS",
      valueFor: (bike) => (bike.topSpeedKph >= 140 ? "Dual Channel" : bike.topSpeedKph >= 100 ? "Single Channel" : "None"),
    },
    { label: "Bluetooth", valueFor: (bike) => yesNo(bike.priceBdt >= 320000) },
    { label: "Navigation", valueFor: (bike) => yesNo(bike.priceBdt >= 450000) },
    { label: "Warranty", valueFor: () => "2 years / 20,000 km" },
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
    { label: "Torque", valueFor: (bike) => `${bike.torqueNm} Nm` },
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
    { label: "Riding Modes", valueFor: () => "Eco, Normal, Sport" },
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
    { label: "Bluetooth", valueFor: () => "Yes" },
    { label: "Navigation", valueFor: (bike) => yesNo(bike.priceBdt >= 330000) },
    { label: "OTA Updates", valueFor: (bike) => yesNo(bike.priceBdt >= 500000) },
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

function getDefaultSelection(powertrain: Powertrain): Bike[] {
  return bikes.filter((bike) => bike.powertrain === powertrain).slice(0, 3);
}

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ bikes?: string }>;
}) {
  const resolved = await searchParams;

  const requestedSlugs = (resolved.bikes ?? "")
    .split(",")
    .map((slug) => slug.trim())
    .filter(Boolean);

  const requestedBikes = Array.from(new Set(requestedSlugs))
    .map((slug) => bikes.find((bike) => bike.slug === slug))
    .filter((bike): bike is Bike => Boolean(bike));

  const selectedPowertrain: Powertrain = requestedBikes[0]?.powertrain ?? "ICE";
  const filteredByPowertrain = requestedBikes.filter((bike) => bike.powertrain === selectedPowertrain);
  const removedMixed = requestedBikes.some((bike) => bike.powertrain !== selectedPowertrain);

  let selectedBikes = filteredByPowertrain.slice(0, 3);

  if (selectedBikes.length < 2) {
    const fallback = bikes.filter(
      (bike) =>
        bike.powertrain === selectedPowertrain &&
        !selectedBikes.some((selected) => selected.slug === bike.slug)
    );

    selectedBikes = [...selectedBikes, ...fallback].slice(0, 3);
  }

  if (selectedBikes.length === 0) {
    selectedBikes = getDefaultSelection(selectedPowertrain);
  }

  const specRows = selectedPowertrain === "ICE" ? getIceSpecRows() : getEvSpecRows();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Quick Comparison</p>
        <h1 className="mt-2 font-heading text-5xl uppercase tracking-wide text-slate-900 sm:text-6xl">
          Compare All Specifications
        </h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Compare up to 3 bikes with full specs. ICE and EV cannot be compared together.
        </p>

        <div className="mt-3 flex items-center gap-2">
          <Badge className={powertrainBadgeClass(selectedPowertrain)}>{selectedPowertrain} only</Badge>
          <Badge variant="outline" className="border-slate-300 text-slate-700">
            {selectedBikes.length} bikes
          </Badge>
        </div>

        {removedMixed ? (
          <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <p className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4" />
              Mixed ICE and EV selections were detected. The comparison has been restricted to {selectedPowertrain} bikes only.
            </p>
          </div>
        ) : null}
      </section>

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[260px] text-slate-700">Specification</TableHead>
              {selectedBikes.map((bike) => (
                <TableHead key={bike.slug} className="min-w-[220px] align-top">
                  <div className="space-y-1">
                    <p className="font-heading text-2xl uppercase tracking-wide text-slate-900">
                      {bike.brand} {bike.model}
                    </p>
                    <Badge variant="outline" className={powertrainBadgeClass(bike.powertrain)}>
                      {bike.powertrain}
                    </Badge>
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {specRows.map((row) => (
              <TableRow key={row.label}>
                <TableCell className="font-medium text-slate-700">{row.label}</TableCell>
                {selectedBikes.map((bike) => (
                  <TableCell key={`${bike.slug}-${row.label}`} className="text-slate-800">
                    {row.valueFor(bike)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <section className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <h2 className="flex items-center gap-2 font-heading text-3xl uppercase tracking-wide text-amber-900">
          <ArrowRightLeft className="h-6 w-6" />
          Need Category-Level Details?
        </h2>
        <p className="mt-2 text-sm text-amber-900/80">
          Open bike detail pages for complete category breakdowns. Use compare links from cards to prefill this page.
        </p>
        <Link
          href="/bikes"
          className={cn(buttonVariants(), "mt-4 bg-amber-600 text-white hover:bg-amber-500")}
        >
          Browse Bike Specs
        </Link>
      </section>
    </div>
  );
}
