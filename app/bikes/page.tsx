"use client";

import { BikeCard } from "@/components/site/bike-card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bike, bikes } from "@/lib/bikes-data";

type FilterKey = "all" | "ice-motorcycle" | "ice-scooter" | "ev-motorcycle" | "ev-scooter";

const filters: {
  key: FilterKey;
  label: string;
  predicate: (bike: Bike) => boolean;
}[] = [
  {
    key: "all",
    label: "All Bikes",
    predicate: () => true,
  },
  {
    key: "ice-motorcycle",
    label: "ICE Motorcycle",
    predicate: (bike) => bike.powertrain === "ICE" && bike.category !== "Scooter",
  },
  {
    key: "ice-scooter",
    label: "ICE Scooter",
    predicate: (bike) => bike.powertrain === "ICE" && bike.category === "Scooter",
  },
  {
    key: "ev-motorcycle",
    label: "EV Motorcycle",
    predicate: (bike) => bike.powertrain === "EV" && bike.category !== "Scooter",
  },
  {
    key: "ev-scooter",
    label: "EV Scooter",
    predicate: (bike) => bike.powertrain === "EV" && bike.category === "Scooter",
  },
];

export default function BikesPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Bike Directory</p>
        <h1 className="mt-2 font-heading text-5xl uppercase tracking-wide text-slate-900 sm:text-6xl">
          Bike Information Hub
        </h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Browse major commuter, sport, adventure, and EV options with specs focused on real buying decisions.
        </p>
      </section>

      <section className="mt-8">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="h-auto w-full flex-wrap justify-start gap-2 rounded-xl border border-slate-200 bg-white/80 p-2">
            {filters.map((filter) => (
              <TabsTrigger
                key={filter.key}
                value={filter.key}
                className="rounded-md border border-transparent px-3 py-1.5 text-xs uppercase tracking-[0.08em] data-[state=active]:border-slate-300 data-[state=active]:bg-white"
              >
                {filter.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {filters.map((filter) => {
            const filtered = bikes.filter(filter.predicate);

            return (
              <TabsContent key={filter.key} value={filter.key} className="mt-5">
                <div className="mb-3 flex items-center gap-2">
                  <h2 className="font-heading text-3xl uppercase tracking-wide text-slate-900">
                    {filter.label}
                  </h2>
                  <Badge variant="outline" className="border-slate-300 text-slate-600">
                    {filtered.length} found
                  </Badge>
                </div>

                {filtered.length === 0 ? (
                  <p className="rounded-lg border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-600">
                    No bikes available for this filter yet.
                  </p>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {filtered.map((bike) => (
                      <BikeCard key={bike.slug} bike={bike} />
                    ))}
                  </div>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </section>
    </div>
  );
}
