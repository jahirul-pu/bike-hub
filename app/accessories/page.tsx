"use client";

import { useEffect, useState } from "react";
import { Wrench, Shield, Zap, Search, Settings2, SlidersHorizontal, Package, PlusCircle, Star } from "lucide-react";
import { bikes } from "@/lib/bikes-data";
import { ACCESSORIES, type Accessory } from "@/lib/accessories-data";
import { formatBdt } from "@/lib/bikes-data";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function AccessoriesPage() {
  const [selectedBikeSlug, setSelectedBikeSlug] = useState<string>("all");
  
  useEffect(() => {
    // Read URL query parameter for pre-selection
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const bikeSlug = params.get("bike");
      if (bikeSlug && bikes.find(b => b.slug === bikeSlug)) {
        setSelectedBikeSlug(bikeSlug);
      }
    }
  }, []);

  // Filter logic
  const filteredAccessories = ACCESSORIES.filter(acc => {
    if (selectedBikeSlug === "all") return true; // show all
    return acc.compatibleBikes.includes("Universal") || acc.compatibleBikes.includes(selectedBikeSlug);
  });

  const selectedBike = bikes.find(b => b.slug === selectedBikeSlug);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* ── Page Header ── */}
      <section className="mb-10 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-500">
          Modifications & Gear
        </p>
        <h1 className="mt-3 font-heading text-5xl uppercase tracking-wide text-slate-900 sm:text-6xl">
          Parts & Accessories
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-slate-600">
          Upgrade your ride with premium exhaust systems, crash protection, cosmetics, and electronics. 
          Select your bike below to instantly filter for guaranteed compatible parts.
        </p>
      </section>

      {/* ── Bike-Based Entry Selector (The Core UX Feature) ── */}
      <section className="mb-12">
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8">
          <div className="absolute -right-20 -top-20 opacity-[0.03]">
            <Wrench strokeWidth={1} size={250} />
          </div>
          
          <div className="relative mx-auto max-w-2xl text-center">
            <h2 className="flex items-center justify-center gap-2 text-2xl font-bold tracking-tight text-slate-900">
              <SlidersHorizontal className="h-6 w-6 text-amber-500" />
              Find parts for your bike
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Pick your exact model to see modifications that fit perfectly.
            </p>
            
            <div className="mx-auto mt-6 flex max-w-sm items-center justify-center">
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <select
                  value={selectedBikeSlug}
                  onChange={(e) => setSelectedBikeSlug(e.target.value)}
                  className="w-full appearance-none rounded-xl border-2 border-slate-200 bg-slate-50 py-4 pl-12 pr-10 text-sm font-bold text-slate-700 outline-none transition-all hover:border-amber-300 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 cursor-pointer"
                >
                  <option value="all">Browse All Parts & Universal Gear</option>
                  <optgroup label="Select Your Motorcycle">
                    {bikes.map(bike => (
                      <option key={bike.slug} value={bike.slug}>
                        {bike.brand} {bike.model}
                      </option>
                    ))}
                  </optgroup>
                </select>
                <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                  ▼
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Results Header ── */}
      <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4">
        <h3 className="text-xl font-bold text-slate-800">
          {selectedBike ? (
            <span className="flex items-center gap-2">
              Showing parts compatible with <span className="rounded bg-amber-100 px-2 py-1 text-amber-800">{selectedBike.brand} {selectedBike.model}</span>
            </span>
          ) : (
            "All Accessories & Gear"
          )}
        </h3>
        <Badge variant="outline" className="text-slate-500">
          {filteredAccessories.length} items found
        </Badge>
      </div>

      {/* ── Product Grid ── */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {filteredAccessories.map((item) => (
          <div key={item.id} className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all hover:-translate-y-1 hover:border-amber-300 hover:shadow-xl hover:shadow-amber-100/50">
            {/* Image placeholder */}
            <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
              <div className="absolute inset-0 flex items-center justify-center">
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-700 backdrop-blur-sm">
                {item.category}
              </div>
            </div>

            <div className="flex flex-1 flex-col p-4">
              <div className="mb-2 flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                <span className="text-slate-600">{item.rating}</span> ({item.reviews} reviews)
              </div>
              
              <h4 className="line-clamp-2 text-sm font-bold leading-snug text-slate-900 group-hover:text-amber-600">
                {item.name}
              </h4>
              
              <div className="mt-auto pt-4">
                <p className="text-lg font-black text-slate-800">
                  {formatBdt(item.priceBdt)}
                </p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {item.compatibleBikes.includes("Universal") ? (
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-slate-500">
                      Universal Fit
                    </span>
                  ) : (
                    <span className="rounded bg-sky-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-sky-600">
                      Bike Specific Fit
                    </span>
                  )}
                </div>
              </div>

              <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white transition-colors hover:bg-slate-800 active:scale-95">
                <PlusCircle className="h-3.5 w-3.5" />
                Add to Cart
              </button>
            </div>
          </div>
        ))}
        {filteredAccessories.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <Package className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-4 text-lg font-bold text-slate-700">No compatible parts found</h3>
            <p className="mt-1 text-sm text-slate-500">Try selecting a different motorcycle or browse universal parts.</p>
          </div>
        )}
      </div>
    </div>
  );
}
