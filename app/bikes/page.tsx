"use client";

import { useMemo, useState } from "react";
import { BikeCard } from "@/components/site/bike-card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Bike, bikes } from "@/lib/bikes-data";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export default function BikesPage() {
  // Navigation Filters
  const [powertrainFilter, setPowertrainFilter] = useState<"All" | "ICE" | "EV">("All");
  const [typeFilter, setTypeFilter] = useState<"All" | "Motorcycle" | "Scooter">("All");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
  const [metricFilter, setMetricFilter] = useState<string>("All");
  const [efficiencyFilter, setEfficiencyFilter] = useState<string>("All");
  const [brandFilter, setBrandFilter] = useState<string>("All");

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

      // Price filter
      if (bike.priceBdt < priceRange[0] || bike.priceBdt > priceRange[1]) return false;

      // Metric filter (CC or kWh)
      if (metricFilter !== "All") {
        if (bike.powertrain === "ICE") {
            const cc = bike.displacementCc ?? 0;
            if (metricFilter === "100-125" && (cc < 100 || cc > 125)) return false;
            if (metricFilter === "126-150" && (cc < 126 || cc > 150)) return false;
            if (metricFilter === "151-200" && (cc < 151 || cc > 200)) return false;
            if (metricFilter === "201-350" && (cc < 201 || cc > 350)) return false;
            if (metricFilter === "350+" && cc <= 350) return false;
        } else {
            const pwr = bike.motorPowerKw ?? 0;
            if (metricFilter === "1-2" && (pwr < 1 || pwr > 2)) return false;
            if (metricFilter === "2-4" && (pwr < 2.1 || pwr > 4)) return false;
            if (metricFilter === "4+" && pwr <= 4) return false;
        }
      }

      // Efficiency filter (Mileage or Range)
      if (efficiencyFilter !== "All") {
        if (bike.powertrain === "ICE") {
            const mileage = bike.mileageKmpl ?? 0;
            if (efficiencyFilter === "40+" && mileage < 40) return false;
            if (efficiencyFilter === "50+" && mileage < 50) return false;
            if (efficiencyFilter === "60+" && mileage < 60) return false;
        } else {
            const range = bike.rangeKm ?? 0;
            if (efficiencyFilter === "60" && range < 60) return false;
            if (efficiencyFilter === "100" && range < 100) return false;
            if (efficiencyFilter === "150+" && range < 150) return false;
        }
      }

      // Brand filter
      if (brandFilter !== "All" && bike.brand !== brandFilter) return false;

      return true;
    });
  }, [powertrainFilter, typeFilter, priceRange, metricFilter, efficiencyFilter, brandFilter]);

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
        {/* Final UX Structure Navigation */}
        <div className="mb-12 space-y-8">
          {/* Level 1: Primary energy navigation */}
          <div className="flex flex-col gap-4">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">01. Energy Source</p>
            <div className="flex items-center gap-4">
              {(["All", "ICE", "EV"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setPowertrainFilter(p);
                    setTypeFilter("All");
                    setPriceRange([0, 1000000]);
                    setMetricFilter("All");
                    setEfficiencyFilter("All");
                    setBrandFilter("All");
                  }}
                  className={cn(
                    "min-w-[100px] px-8 py-3 rounded-2xl text-sm font-black uppercase tracking-widest transition-all duration-300 border-2",
                    powertrainFilter === p
                      ? "bg-slate-900 border-slate-900 text-white shadow-xl scale-[1.05]"
                      : "bg-white border-slate-100 text-slate-400 hover:border-slate-300 hover:text-slate-600"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Level 2: Secondary Filter Bar (Dynamic Grid Layout) */}
          <div className="flex flex-col gap-5 rounded-3xl border border-slate-200 bg-slate-50/50 p-6">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">02. Refined Search</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              {/* Row 1, Col 1: Category Selection */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">01. Vehicle Category</span>
                <div className="flex bg-white rounded-lg p-1 border border-slate-200 w-fit">
                  {["All", "Motorcycle", "Scooter"].map(t => (
                    <button
                      key={t}
                      onClick={() => setTypeFilter(t as any)}
                      className={cn(
                        "px-6 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all",
                        typeFilter === t ? "bg-slate-900 text-white shadow-sm" : "text-slate-400 hover:text-slate-600"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 1, Col 2: Price Range Filter */}
              <div className="flex flex-col gap-2">
                <div className="flex items-end justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">02. Price Range</span>
                  <span className="text-[10px] font-mono font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded leading-none">
                    ৳ {priceRange[0]/1000}K - {priceRange[1] >= 1000000 ? "10L+" : `${priceRange[1]/100000}L`}
                  </span>
                </div>
                
                <div className="flex flex-col gap-3 py-1">
                  <Slider
                    defaultValue={[0, 1000000]}
                    max={1000000}
                    step={10000}
                    value={[priceRange[0], priceRange[1]]}
                    onValueChange={(val) => setPriceRange([val[0], val[1]])}
                    className="py-1"
                  />

                  <div className="flex gap-2">
                    {[
                      { label: "All", range: [0, 1000000] },
                      { label: "Under 1L", range: [0, 100000] },
                      { label: "1L–2L", range: [100000, 200000] },
                      { label: "2L+", range: [200000, 1000000] }
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        onClick={() => setPriceRange(preset.range as [number, number])}
                        className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[8px] font-bold uppercase tracking-tighter text-slate-500 hover:border-slate-900 hover:text-slate-900 transition-all"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Row 2, Col 1: Dynamic Metrics */}
              <div className="flex flex-col gap-5">
                {(powertrainFilter === "All" || powertrainFilter === "ICE") && (
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">03. Engine Displacement (ICE)</span>
                    <div className="flex flex-wrap gap-2">
                      {["All", "100-125", "126-150", "151-200", "201-350", "350+"].map(tier => (
                        <button
                          key={tier}
                          onClick={() => setMetricFilter(tier)}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all border",
                            metricFilter === tier 
                              ? "bg-slate-900 border-slate-900 text-white shadow-md" 
                              : "bg-white border-slate-200 text-slate-400 hover:border-slate-400 hover:text-slate-600"
                          )}
                        >
                          {tier === "All" ? "Any CC" : tier.replace("-", "–") + (tier.includes("+") ? "" : " cc")}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {(powertrainFilter === "All" || powertrainFilter === "EV") && (
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">03. Battery Capacity (EV)</span>
                    <div className="flex flex-wrap gap-2">
                      {["All", "1-2", "2-4", "4+"].map(tier => (
                        <button
                          key={tier}
                          onClick={() => setMetricFilter(tier)}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all border",
                            metricFilter === tier 
                              ? "bg-emerald-600 border-emerald-600 text-white shadow-md" 
                              : "bg-white border-slate-200 text-slate-400 hover:border-slate-400 hover:text-slate-600"
                          )}
                        >
                          {tier === "All" ? "Any Power" : tier.replace("-", "–") + " kWh"}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Row 2, Col 2: Efficiency / Range */}
              <div className="flex flex-col gap-5">
                {(powertrainFilter === "All" || powertrainFilter === "ICE") && (
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">04. Efficiency (Fuel)</span>
                    <div className="flex flex-wrap gap-2">
                      {["All", "40+", "50+", "60+"].map(tier => (
                        <button
                          key={tier}
                          onClick={() => setEfficiencyFilter(tier)}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all border",
                            efficiencyFilter === tier 
                              ? "bg-slate-900 border-slate-900 text-white shadow-md" 
                              : "bg-white border-slate-200 text-slate-400 hover:border-slate-400 hover:text-slate-600"
                          )}
                        >
                          {tier === "All" ? "Any" : tier}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {(powertrainFilter === "All" || powertrainFilter === "EV") && (
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">04. Drive Range (Electric)</span>
                    <div className="flex flex-wrap gap-2">
                      {["All", "60", "100", "150+"].map(tier => (
                        <button
                          key={tier}
                          onClick={() => setEfficiencyFilter(tier)}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all border",
                            efficiencyFilter === tier 
                              ? "bg-emerald-600 border-emerald-600 text-white shadow-md" 
                              : "bg-white border-slate-200 text-slate-400 hover:border-slate-400 hover:text-slate-600"
                          )}
                        >
                          {tier === "All" ? "Any" : tier + (tier.includes("+") ? "" : " km+")}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Row 3: Brand Selection Area (Full Width) */}
              <div className="flex flex-col gap-3 md:col-span-2 pt-6 border-t border-slate-200/60">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">05. Primary Manufacturer</span>
                
                <div className="flex flex-wrap items-center gap-3">
                  {/* Quick Taps */}
                  <div className="flex flex-wrap items-center gap-2">
                    {["Honda", "Yamaha", "Suzuki", "TVS"].map(brand => (
                      <button
                        key={brand}
                        onClick={() => setBrandFilter(brandFilter === brand ? "All" : brand)}
                        className={cn(
                          "px-6 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all border-2",
                          brandFilter === brand 
                            ? "bg-slate-900 border-slate-900 text-white shadow-lg" 
                            : "bg-white border-slate-100 text-slate-500 hover:border-slate-300 hover:text-slate-700"
                        )}
                      >
                        {brand}
                      </button>
                    ))}
                  </div>

                  <div className="h-8 w-px bg-slate-200 mx-2 hidden md:block" />

                  {/* Searchable More Dropdown */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <div 
                        role="button"
                        className={cn(
                          "px-6 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all border-2 flex items-center gap-2 cursor-pointer",
                          brandFilter !== "All" && !["Honda", "Yamaha", "Suzuki", "TVS"].includes(brandFilter)
                            ? "bg-slate-900 border-slate-900 text-white shadow-lg"
                            : "bg-white border-dashed border-slate-300 text-slate-400 hover:border-slate-400"
                        )}
                      >
                        {brandFilter !== "All" && !["Honda", "Yamaha", "Suzuki", "TVS"].includes(brandFilter) 
                          ? brandFilter 
                          : "Explore Brands +"}
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-[240px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search catalog..." className="text-xs" />
                        <CommandList>
                          <CommandEmpty className="py-2 text-center text-[10px] text-slate-500">No results found.</CommandEmpty>
                          <CommandGroup>
                            <CommandItem
                              onSelect={() => setBrandFilter("All")}
                              className="text-xs uppercase font-bold"
                            >
                              Show All Brands
                            </CommandItem>
                            {Array.from(new Set(bikes.map(b => b.brand))).sort().map(brand => (
                              <CommandItem
                                key={brand}
                                onSelect={() => setBrandFilter(brand)}
                                className="text-xs"
                              >
                                {brand}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>

                  {/* Reset Filter Action */}
                  <button 
                    onClick={() => {
                      setTypeFilter("All");
                      setPriceRange([0, 1000000]);
                      setMetricFilter("All");
                      setEfficiencyFilter("All");
                      setBrandFilter("All");
                    }}
                    className="ml-auto flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 hover:text-red-500 transition-colors"
                  >
                    Reset Grid
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Active Filters Row */}
          <div className="flex flex-wrap items-center gap-2 mb-6 min-h-[32px]">
            {(brandFilter !== "All" || typeFilter !== "All" || metricFilter !== "All" || efficiencyFilter !== "All" || powertrainFilter !== "All" || priceRange[0] > 0 || priceRange[1] < 1000000) && (
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mr-2 border-r border-slate-200 pr-4">Active Filters:</span>
            )}
            
            {powertrainFilter !== "All" && (
              <Badge variant="secondary" className="bg-slate-900 text-white pl-3 pr-1 py-1 flex items-center gap-2 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                {powertrainFilter}
                <button onClick={() => setPowertrainFilter("All")} className="hover:bg-white/20 p-0.5 rounded transition-colors"><X className="w-3 h-3" /></button>
              </Badge>
            )}

            {typeFilter !== "All" && (
              <Badge variant="secondary" className="bg-slate-100 text-slate-900 pl-3 pr-1 py-1 flex items-center gap-2 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-slate-200">
                {typeFilter}
                <button onClick={() => setTypeFilter("All")} className="hover:bg-slate-200 p-0.5 rounded transition-colors text-slate-400"><X className="w-3 h-3" /></button>
              </Badge>
            )}

            {brandFilter !== "All" && (
              <Badge variant="secondary" className="bg-slate-100 text-slate-900 pl-3 pr-1 py-1 flex items-center gap-2 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-slate-200">
                {brandFilter}
                <button onClick={() => setBrandFilter("All")} className="hover:bg-slate-200 p-0.5 rounded transition-colors text-slate-400"><X className="w-3 h-3" /></button>
              </Badge>
            )}

            {metricFilter !== "All" && (
              <Badge variant="secondary" className="bg-slate-100 text-slate-900 pl-3 pr-1 py-1 flex items-center gap-2 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-slate-200">
                {metricFilter.replace("-", "–")} CC/kWh
                <button onClick={() => setMetricFilter("All")} className="hover:bg-slate-200 p-0.5 rounded transition-colors text-slate-400"><X className="w-3 h-3" /></button>
              </Badge>
            )}

            {efficiencyFilter !== "All" && (
              <Badge variant="secondary" className="bg-slate-100 text-slate-900 pl-3 pr-1 py-1 flex items-center gap-2 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-slate-200">
                Efficiency: {efficiencyFilter}
                <button onClick={() => setEfficiencyFilter("All")} className="hover:bg-slate-200 p-0.5 rounded transition-colors text-slate-400"><X className="w-3 h-3" /></button>
              </Badge>
            )}

            {(priceRange[0] > 0 || priceRange[1] < 1000000) && (
              <Badge variant="secondary" className="bg-slate-100 text-slate-900 pl-3 pr-1 py-1 flex items-center gap-2 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-slate-200">
                 ৳{priceRange[0]/1000}K - {priceRange[1]/1000 >= 1000 ? "10L+" : priceRange[1]/1000 + "K"}
                <button onClick={() => setPriceRange([0, 1000000])} className="hover:bg-slate-200 p-0.5 rounded transition-colors text-slate-400"><X className="w-3 h-3" /></button>
              </Badge>
            )}
          </div>

          <div className="mb-6 flex items-center gap-3">
            <h2 className="font-heading text-4xl uppercase tracking-wide text-slate-900">
              Results
            </h2>
            <Badge variant="outline" className="border-slate-300 text-slate-600">
              {filteredBikes.length} found
            </Badge>
          </div>

          {filteredBikes.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50/50">
              <p className="text-sm font-medium text-slate-500">
                No bikes found matching your current selection.
              </p>
              <button 
                onClick={() => { setPowertrainFilter("All"); setTypeFilter("All"); setPriceRange([0, 1000000]); setMetricFilter("All"); setEfficiencyFilter("All"); setBrandFilter("All"); }}
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
