"use client";

import { useMemo, useState } from "react";
import { BikeCard } from "@/components/site/bike-card";
import { Badge } from "@/components/ui/badge";
import { Bike, bikes } from "@/lib/bikes-data";
import { cn } from "@/lib/utils";

export default function BikesPage() {
  // Navigation Filters
  const [powertrainFilter, setPowertrainFilter] = useState<"All" | "ICE" | "EV">("All");
  const [typeFilter, setTypeFilter] = useState<"All" | "Motorcycle" | "Scooter">("All");

  const filteredBikes = useMemo(() => {
    return bikes.filter((bike) => {
      // Powertrain filter
      if (powertrainFilter !== "All" && bike.powertrain !== powertrainFilter) return false;

      // Type filter
      if (typeFilter !== "All") {
        const isScooter = bike.category === "Scooter";
        if (typeFilter === "Motorcycle" && isScooter) return false;
        if (typeFilter === "Scooter" && !isScooter) return false;
      }

      return true;
    });
  }, [powertrainFilter, typeFilter]);

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

      <section className="mt-10">
        {/* Two-Level Navigation */}
        <div className="mb-10 space-y-6">
          {/* Level 1: Powertrain Category */}
          <div className="flex flex-col gap-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Section</p>
            <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
              {(["All", "ICE", "EV"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setPowertrainFilter(p);
                    setTypeFilter("All"); // Reset type filter when powertrain changes for best UX
                  }}
                  className={cn(
                    "relative px-6 py-2 rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-300 border-2",
                    powertrainFilter === p
                      ? "bg-slate-900 border-slate-900 text-white shadow-[0_8px_20px_-6px_rgba(15,23,42,0.3)] scale-[1.02]"
                      : "bg-white border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-700"
                  )}
                >
                  {p}
                  {powertrainFilter === p && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-slate-500"></span>
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Level 2: Dynamic Vehicle Type */}
          <div className="flex flex-col gap-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Form Factor</p>
            <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
              {(["All", "Motorcycle", "Scooter"] as const).map((t) => {
                // Count matches for this type under current powertrain
                const count = bikes.filter(b => {
                  const matchesPowertrain = powertrainFilter === "All" || b.powertrain === powertrainFilter;
                  const isScooter = b.category === "Scooter";
                  const matchesType = t === "All" || (t === "Motorcycle" && !isScooter) || (t === "Scooter" && isScooter);
                  return matchesPowertrain && matchesType;
                }).length;

                if (count === 0 && t !== "All") return null;

                return (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(t)}
                    className={cn(
                      "group relative flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all border-b-2",
                      typeFilter === t
                        ? "bg-slate-50 border-slate-900 text-slate-900"
                        : "bg-white border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-200"
                    )}
                  >
                    {t === "All" ? "All Forms" : t}
                    <span className={cn(
                      "px-1.5 py-0.5 rounded-full text-[9px] transition-colors",
                      typeFilter === t ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                    )}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="mb-6 flex items-center gap-3">
            <h2 className="font-heading text-4xl uppercase tracking-wide text-slate-900">
              Results
            </h2>
            <Badge variant="outline" className="border-slate-300 text-slate-600">
              {filteredBikes.length} found
            </Badge>
          </div>

          {filteredBikes.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50">
              <p className="text-sm font-medium text-slate-500">
                No bikes found matching your current selection.
              </p>
              <button 
                onClick={() => { setPowertrainFilter("All"); setTypeFilter("All"); }}
                className="mt-2 text-xs font-bold text-slate-900 underline"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredBikes.map((bike) => (
                <BikeCard key={bike.slug} bike={bike} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
