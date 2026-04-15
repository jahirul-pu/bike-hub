"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BikeCard } from "@/components/site/bike-card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Bike, bikes } from "@/lib/bikes-data";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, SlidersHorizontal, X, Building2, Map, Package, Wallet } from "lucide-react";

export default function BikesPage() {
  // Navigation Filters
  const [powertrainFilter, setPowertrainFilter] = useState<"All" | "ICE" | "EV">("All");
  const [typeFilter, setTypeFilter] = useState<"All" | "Motorcycle" | "Scooter">("All");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
  const [metricFilter, setMetricFilter] = useState<string>("All");
  const [efficiencyFilter, setEfficiencyFilter] = useState<string>("All");
  const [brandFilter, setBrandFilter] = useState<string>("All");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [quickUseFilter, setQuickUseFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"Price" | "Popularity" | "Range">("Popularity");

  const advancedFilterCount = [metricFilter !== "All", efficiencyFilter !== "All"].filter(Boolean).length;

  const [isScrolledPast, setIsScrolledPast] = useState(false);
  const filterSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolledPast(window.scrollY > 200);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const quickUsePresets: { label: string; icon: React.ReactNode; desc: string; apply: () => void }[] = [
    {
      label: "Daily Use",
      icon: <Building2 className="w-3.5 h-3.5" />,
      desc: "Commuter bikes, good mileage",
      apply: () => {
        setPowertrainFilter("ICE"); setTypeFilter("Motorcycle");
        setPriceRange([0, 350000]); setMetricFilter("100-125");
        setEfficiencyFilter("40+"); setBrandFilter("All");
      },
    },
    {
      label: "Long Ride",
      icon: <Map className="w-3.5 h-3.5" />,
      desc: "Touring & adventure ready",
      apply: () => {
        setPowertrainFilter("ICE"); setTypeFilter("Motorcycle");
        setPriceRange([0, 1000000]); setMetricFilter("151-200");
        setEfficiencyFilter("All"); setBrandFilter("All");
      },
    },
    {
      label: "Delivery",
      icon: <Package className="w-3.5 h-3.5" />,
      desc: "Fuel-efficient workhorses",
      apply: () => {
        setPowertrainFilter("All"); setTypeFilter("All");
        setPriceRange([0, 250000]); setMetricFilter("All");
        setEfficiencyFilter("50+"); setBrandFilter("All");
      },
    },
    {
      label: "Budget",
      icon: <Wallet className="w-3.5 h-3.5" />,
      desc: "Best value under ৳2.5L",
      apply: () => {
        setPowertrainFilter("All"); setTypeFilter("All");
        setPriceRange([0, 250000]); setMetricFilter("All");
        setEfficiencyFilter("All"); setBrandFilter("All");
      },
    },
  ];

  const filteredBikes = useMemo(() => {
    return bikes.filter((bike) => {
      if (powertrainFilter !== "All" && bike.powertrain !== powertrainFilter) return false;
      if (typeFilter !== "All") {
        const isScooter = bike.category === "Scooter";
        if (typeFilter === "Motorcycle" && isScooter) return false;
        if (typeFilter === "Scooter" && !isScooter) return false;
      }
      if (bike.priceBdt < priceRange[0] || bike.priceBdt > priceRange[1]) return false;
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
      if (brandFilter !== "All" && bike.brand !== brandFilter) return false;
      return true;
    }).sort((a, b) => {
      if (sortBy === "Price") return a.priceBdt - b.priceBdt;
      if (sortBy === "Range") {
        const rangeA = a.powertrain === "EV" ? (a.rangeKm || 0) : (a.mileageKmpl || 0);
        const rangeB = b.powertrain === "EV" ? (b.rangeKm || 0) : (b.mileageKmpl || 0);
        return rangeB - rangeA;
      }
      return b.topSpeedKph - a.topSpeedKph;
    });
  }, [powertrainFilter, typeFilter, priceRange, metricFilter, efficiencyFilter, brandFilter, sortBy]);

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

      <section ref={filterSectionRef} className="mt-10">
        {/* Level 1: Energy Source Tabs (Compact Sticky Pill) */}
        <div className="sticky top-[102px] z-[60] flex justify-center py-4 transition-all duration-300 sm:top-[124px]">
          <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/70 p-1.5 shadow-2xl backdrop-blur-xl ring-1 ring-slate-900/5">
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
                  setShowAdvancedFilters(false);
                  setQuickUseFilter(null);
                }}
                className={cn(
                  "min-w-[80px] px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                  powertrainFilter === p
                    ? "bg-slate-900 text-white shadow-lg scale-[1.05]"
                    : "text-slate-500 hover:text-slate-900 hover:bg-white/50"
                )}
              >
                {p}
              </button>
            ))}
            </div>
          </div>
          
          <div className="space-y-6">

          {/* Quick Use Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mr-1">Quick:</span>
            {quickUsePresets.map((preset) => (
              <button
                key={preset.label}
                onClick={() => {
                  if (quickUseFilter === preset.label) {
                    setQuickUseFilter(null);
                    setPowertrainFilter("All"); setTypeFilter("All");
                    setPriceRange([0, 1000000]); setMetricFilter("All");
                    setEfficiencyFilter("All"); setBrandFilter("All");
                  } else {
                    setQuickUseFilter(preset.label);
                    setShowAdvancedFilters(false);
                    preset.apply();
                  }
                }}
                className={cn(
                  "h-9 px-4 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 group",
                  quickUseFilter === preset.label
                    ? "bg-slate-900 border-slate-900 text-white shadow-lg"
                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-400 hover:shadow-sm"
                )}
              >
                <span className="text-slate-400 group-hover:text-inherit transition-colors">{preset.icon}</span>
                <span className="font-black uppercase tracking-wider">{preset.label}</span>
              </button>
            ))}
          </div>

          {/* Level 2: Compact Inline Filter Bar */}
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-4">
            {/* Category Toggle */}
            <div className="flex bg-white rounded-xl p-1 border border-slate-200 h-9 items-center">
              {["All", "Motorcycle", "Scooter"].map(t => (
                <button
                  key={t}
                  onClick={() => { setTypeFilter(t as any); setQuickUseFilter(null); }}
                  className={cn(
                    "px-3 h-7 rounded-lg text-xs font-black uppercase tracking-wider transition-all",
                    typeFilter === t ? "bg-slate-900 text-white shadow-sm" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="h-7 w-px bg-slate-200 hidden md:block" />

            {/* Price Popover */}
            <Popover>
              <PopoverTrigger>
                <div
                  role="button"
                  className={cn(
                    "h-9 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all border flex items-center gap-2 cursor-pointer",
                    priceRange[0] > 0 || priceRange[1] < 1000000
                      ? "bg-slate-900 border-slate-900 text-white shadow-md"
                      : "bg-white border-slate-200 text-slate-500 hover:border-slate-400"
                  )}
                >
                  {priceRange[0] > 0 || priceRange[1] < 1000000
                    ? `৳${priceRange[0]/1000}K – ${priceRange[1] >= 1000000 ? "10L+" : priceRange[1]/100000 + "L"}`
                    : "Price"}
                  <ChevronDown className="w-3.5 h-3.5 opacity-50" />
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-[320px] p-4" align="start">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-900">Price Range</span>
                    <span className="text-[10px] font-mono font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                      ৳ {priceRange[0]/1000}K – {priceRange[1] >= 1000000 ? "10L+" : `${priceRange[1]/100000}L`}
                    </span>
                  </div>
                  <Slider
                    defaultValue={[0, 1000000]}
                    max={1000000}
                    step={10000}
                    value={[priceRange[0], priceRange[1]]}
                    onValueChange={(val) => { setPriceRange([val[0], val[1]]); setQuickUseFilter(null); }}
                    className="py-1"
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: "All", range: [0, 1000000] },
                      { label: "< 1L", range: [0, 100000] },
                      { label: "1L–2L", range: [100000, 200000] },
                      { label: "2L+", range: [200000, 1000000] }
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        onClick={() => { setPriceRange(preset.range as [number, number]); setQuickUseFilter(null); }}
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-tight transition-all border",
                          JSON.stringify(priceRange) === JSON.stringify(preset.range)
                            ? "bg-slate-900 border-slate-900 text-white shadow-sm"
                            : "bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-300 hover:text-slate-600"
                        )}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Brand Popover */}
            <Popover>
              <PopoverTrigger>
                <div
                  role="button"
                  className={cn(
                    "h-9 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all border flex items-center gap-2 cursor-pointer",
                    brandFilter !== "All"
                      ? "bg-slate-900 border-slate-900 text-white shadow-md"
                      : "bg-white border-slate-200 text-slate-500 hover:border-slate-400"
                  )}
                >
                  {brandFilter !== "All" ? brandFilter : "Brand"}
                  <ChevronDown className="w-3.5 h-3.5 opacity-50" />
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-[260px] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search brands..." className="text-xs" />
                  <CommandList>
                    <CommandEmpty className="py-2 text-center text-[10px] text-slate-500">No brand found.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem onSelect={() => { setBrandFilter("All"); setQuickUseFilter(null); }} className="text-xs uppercase font-bold">
                        All Brands
                      </CommandItem>
                      {Array.from(new Set(bikes.map(b => b.brand))).sort().map(brand => (
                        <CommandItem key={brand} onSelect={() => { setBrandFilter(brand); setQuickUseFilter(null); }} className="text-xs">
                          {brand}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            <div className="h-7 w-px bg-slate-200 hidden md:block" />

            {/* More Filters Toggle */}
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={cn(
                "h-9 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all border flex items-center gap-2",
                showAdvancedFilters || advancedFilterCount > 0
                  ? "bg-slate-900 border-slate-900 text-white shadow-md"
                  : "bg-white border-slate-200 text-slate-500 hover:border-slate-400"
              )}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Specs
              {advancedFilterCount > 0 && (
                <span className="ml-0.5 flex items-center justify-center w-4 h-4 rounded-full bg-white/20 text-[9px] font-black">
                  {advancedFilterCount}
                </span>
              )}
              {showAdvancedFilters ? <ChevronUp className="w-3 h-3 opacity-60" /> : <ChevronDown className="w-3 h-3 opacity-60" />}
            </button>
            <div className="h-7 w-px bg-slate-200 hidden md:block" />
            
            {/* Sort Toggle */}
            <div className="flex bg-white rounded-xl p-1 border border-slate-200 h-9 items-center">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-2 border-r border-slate-100 mr-1 hidden sm:inline">Sort:</span>
              {["Price", "Popularity", "Range"].map(s => (
                <button
                  key={s}
                  onClick={() => setSortBy(s as any)}
                  className={cn(
                    "px-2.5 h-7 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all",
                    sortBy === s ? "bg-slate-900 text-white shadow-sm" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Reset — right-aligned */}
            {(typeFilter !== "All" || brandFilter !== "All" || metricFilter !== "All" || efficiencyFilter !== "All" || priceRange[0] > 0 || priceRange[1] < 1000000) && (
              <button
                onClick={() => {
                  setTypeFilter("All");
                  setPriceRange([0, 1000000]);
                  setMetricFilter("All");
                  setEfficiencyFilter("All");
                  setBrandFilter("All");
                  setShowAdvancedFilters(false);
                  setQuickUseFilter(null);
                }}
                className="ml-auto flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 hover:text-red-500 transition-colors"
              >
                Reset
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Level 3: Advanced Filters Panel (Progressive Disclosure) */}
          <div
            className={cn(
              "overflow-hidden transition-all duration-300 ease-in-out",
              showAdvancedFilters ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
            )}
          >
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-center justify-between mb-5">
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-900 border-l-2 border-slate-900 pl-3">
                  Technical Specifications
                </p>
                <button
                  onClick={() => setShowAdvancedFilters(false)}
                  className="text-[10px] font-bold uppercase text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Collapse ↑
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                {/* Engine / Battery */}
                <div className="flex flex-col gap-5">
                  {(powertrainFilter === "All" || powertrainFilter === "ICE") && (
                    <div className="flex flex-col gap-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Engine Displacement</span>
                      <div className="flex flex-wrap gap-2">
                        {["All", "100-125", "126-150", "151-200", "201-350", "350+"].map(tier => (
                          <button
                            key={tier}
                            onClick={() => { setMetricFilter(tier); setQuickUseFilter(null); }}
                            className={cn(
                              "h-9 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all border",
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
                    <div className="flex flex-col gap-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                        Battery Capacity
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/40" />
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {["All", "1-2", "2-4", "4+"].map(tier => (
                          <button
                            key={tier}
                            onClick={() => { setMetricFilter(tier); setQuickUseFilter(null); }}
                            className={cn(
                              "h-9 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all border flex items-center gap-2",
                              metricFilter === tier
                                ? "bg-slate-900 border-slate-900 text-white shadow-md"
                                : "bg-white border-slate-200 text-slate-400 hover:border-slate-400 hover:text-slate-600"
                            )}
                          >
                            {tier !== "All" && (
                              <span className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                metricFilter === tier ? "bg-emerald-400" : "bg-emerald-500/30"
                              )} />
                            )}
                            {tier === "All" ? "Any Power" : tier.replace("-", "–") + " kWh"}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Efficiency / Range */}
                <div className="flex flex-col gap-5">
                  {(powertrainFilter === "All" || powertrainFilter === "ICE") && (
                    <div className="flex flex-col gap-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Fuel Efficiency</span>
                      <div className="flex flex-wrap gap-2">
                        {["All", "40+", "50+", "60+"].map(tier => (
                          <button
                            key={tier}
                            onClick={() => { setEfficiencyFilter(tier); setQuickUseFilter(null); }}
                            className={cn(
                              "h-9 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all border",
                              efficiencyFilter === tier
                                ? "bg-slate-900 border-slate-900 text-white shadow-md"
                                : "bg-white border-slate-200 text-slate-400 hover:border-slate-400 hover:text-slate-600"
                            )}
                          >
                            {tier === "All" ? "Any" : tier + " km/l"}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {(powertrainFilter === "All" || powertrainFilter === "EV") && (
                    <div className="flex flex-col gap-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                        Drive Range
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/40" />
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {["All", "60", "100", "150+"].map(tier => (
                          <button
                            key={tier}
                            onClick={() => { setEfficiencyFilter(tier); setQuickUseFilter(null); }}
                            className={cn(
                              "h-9 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all border flex items-center gap-2",
                              efficiencyFilter === tier
                                ? "bg-slate-900 border-slate-900 text-white shadow-md"
                                : "bg-white border-slate-200 text-slate-400 hover:border-slate-400 hover:text-slate-600"
                            )}
                          >
                            {tier !== "All" && (
                              <span className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                efficiencyFilter === tier ? "bg-emerald-400" : "bg-emerald-500/30"
                              )} />
                            )}
                            {tier === "All" ? "Any" : tier + (tier.includes("+") ? "" : " km+")}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Active Filters Row */}
          <div className="flex flex-wrap items-center gap-2 min-h-[28px]">
            {(brandFilter !== "All" || typeFilter !== "All" || metricFilter !== "All" || efficiencyFilter !== "All" || powertrainFilter !== "All" || priceRange[0] > 0 || priceRange[1] < 1000000) && (
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mr-2 border-r border-slate-200 pr-4">Filters:</span>
            )}

            {powertrainFilter !== "All" && (
              <Badge variant="secondary" className="bg-slate-900 text-white pl-3 pr-1 py-1 flex items-center gap-2 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                {powertrainFilter}
                <button onClick={() => { setPowertrainFilter("All"); setQuickUseFilter(null); }} className="hover:bg-white/20 p-0.5 rounded transition-colors"><X className="w-3 h-3" /></button>
              </Badge>
            )}

            {typeFilter !== "All" && (
              <Badge variant="secondary" className="bg-slate-100 text-slate-900 pl-3 pr-1 py-1 flex items-center gap-2 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-slate-200">
                {typeFilter}
                <button onClick={() => { setTypeFilter("All"); setQuickUseFilter(null); }} className="hover:bg-slate-200 p-0.5 rounded transition-colors text-slate-400"><X className="w-3 h-3" /></button>
              </Badge>
            )}

            {brandFilter !== "All" && (
              <Badge variant="secondary" className="bg-slate-100 text-slate-900 pl-3 pr-1 py-1 flex items-center gap-2 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-slate-200">
                {brandFilter}
                <button onClick={() => { setBrandFilter("All"); setQuickUseFilter(null); }} className="hover:bg-slate-200 p-0.5 rounded transition-colors text-slate-400"><X className="w-3 h-3" /></button>
              </Badge>
            )}

            {metricFilter !== "All" && (
              <Badge variant="secondary" className="bg-slate-100 text-slate-900 pl-3 pr-1 py-1 flex items-center gap-2 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-slate-200">
                {metricFilter.replace("-", "–")} CC/kWh
                <button onClick={() => { setMetricFilter("All"); setQuickUseFilter(null); }} className="hover:bg-slate-200 p-0.5 rounded transition-colors text-slate-400"><X className="w-3 h-3" /></button>
              </Badge>
            )}

            {efficiencyFilter !== "All" && (
              <Badge variant="secondary" className="bg-slate-100 text-slate-900 pl-3 pr-1 py-1 flex items-center gap-2 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-slate-200">
                Efficiency: {efficiencyFilter}
                <button onClick={() => { setEfficiencyFilter("All"); setQuickUseFilter(null); }} className="hover:bg-slate-200 p-0.5 rounded transition-colors text-slate-400"><X className="w-3 h-3" /></button>
              </Badge>
            )}

            {(priceRange[0] > 0 || priceRange[1] < 1000000) && (
              <Badge variant="secondary" className="bg-slate-100 text-slate-900 pl-3 pr-1 py-1 flex items-center gap-2 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-slate-200">
                ৳{priceRange[0]/1000}K – {priceRange[1]/1000 >= 1000 ? "10L+" : priceRange[1]/1000 + "K"}
                <button onClick={() => { setPriceRange([0, 1000000]); setQuickUseFilter(null); }} className="hover:bg-slate-200 p-0.5 rounded transition-colors text-slate-400"><X className="w-3 h-3" /></button>
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
              onClick={() => { setPowertrainFilter("All"); setTypeFilter("All"); setPriceRange([0, 1000000]); setMetricFilter("All"); setEfficiencyFilter("All"); setBrandFilter("All"); setQuickUseFilter(null); }}
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

      {isScrolledPast && (
        <button
          onClick={() => {
            filterSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            setTimeout(() => {
              window.scrollBy({ top: -140, behavior: "smooth" });
            }, 300);
          }}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-white shadow-2xl ring-4 ring-white/20 transition-all duration-300 hover:scale-110 active:scale-95 sm:bottom-10 sm:right-10"
        >
          <SlidersHorizontal className="h-6 w-6" />
        </button>
      )}
    </div>
  );
}
