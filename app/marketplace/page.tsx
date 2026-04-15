"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Bike as BikeIcon, ChevronDown, Megaphone, ShieldCheck, ShoppingBag, ShoppingCart, User, Wrench, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { bikes, Bike, formatBdt, headlineMetric, powertrainBadgeClass } from "@/lib/bikes-data";
import { useCartStore } from "@/store/useCartStore";
import { cn } from "@/lib/utils";

type SparePartCategory = "Parts" | "Accessories" | "Additives";

type SparePartListing = {
  id: string;
  name: string;
  fitment: string;
  condition: string;
  priceBdt: number;
  category: SparePartCategory;
  subcategory: string;
  nestedSubcategory?: string;
};

const spareParts = [
  {
    id: "part-001",
    name: "Chain & Sprocket Kit",
    fitment: "150cc - 200cc street bikes",
    condition: "New",
    priceBdt: 6500,
    category: "Parts",
    subcategory: "Drivetrain",
    nestedSubcategory: "Chain & Sprocket",
  },
  {
    id: "part-002",
    name: "Front Brake Pads",
    fitment: "Dual-piston caliper setup",
    condition: "New",
    priceBdt: 1800,
    category: "Parts",
    subcategory: "Braking",
    nestedSubcategory: "Brake Pads",
  },
  {
    id: "part-003",
    name: "Touring Windshield",
    fitment: "Universal street and adventure bikes",
    condition: "New",
    priceBdt: 4200,
    category: "Accessories",
    subcategory: "Touring",
    nestedSubcategory: "Wind Protection",
  },
  {
    id: "part-004",
    name: "Phone Mount with USB",
    fitment: "Handlebar 22mm - 32mm",
    condition: "New",
    priceBdt: 2100,
    category: "Accessories",
    subcategory: "Electronics",
    nestedSubcategory: "Mobile Holder",
  },
  {
    id: "part-005",
    name: "10W40 Semi-Synthetic Engine Oil",
    fitment: "125cc - 250cc motorcycles",
    condition: "New",
    priceBdt: 950,
    category: "Additives",
    subcategory: "Engine Oil",
    nestedSubcategory: "Semi Synthetic",
  },
  {
    id: "part-006",
    name: "Engine Flush Oil Treatment",
    fitment: "All ICE engines before oil change",
    condition: "New",
    priceBdt: 780,
    category: "Additives",
    subcategory: "Engine Flush Oil",
    nestedSubcategory: "Pre-Service Flush",
  },
  {
    id: "part-007",
    name: "Octane Booster Concentrate",
    fitment: "Petrol bikes and scooters",
    condition: "New",
    priceBdt: 620,
    category: "Additives",
    subcategory: "Octane Booster",
    nestedSubcategory: "Performance Boost",
  },
  {
    id: "part-008",
    name: "Fuel System Cleaner",
    fitment: "Injector and fuel line cleaning",
    condition: "New",
    priceBdt: 690,
    category: "Additives",
    subcategory: "Fuel Cleaner",
    nestedSubcategory: "Injector Cleaner",
  },
  {
    id: "part-009",
    name: "DOT 4 Brake Fluid",
    fitment: "Disc brake hydraulic systems",
    condition: "New",
    priceBdt: 540,
    category: "Additives",
    subcategory: "Brake Fluid",
    nestedSubcategory: "DOT 4",
  },
  {
    id: "part-010",
    name: "Tubeless Tyre Pair",
    fitment: "Front 90/90-17 | Rear 120/80-17",
    condition: "New",
    priceBdt: 7600,
    category: "Parts",
    subcategory: "Tyres",
    nestedSubcategory: "Tubeless Tyres",
  },
] satisfies SparePartListing[];

const certifiedSlugs = new Set(["yamaha-r15-v4", "suzuki-vstrom-250", "ultraviolette-f77"]);
const promotedSlugs = new Set(["honda-cb350rs", "ather-450x-gen3", "revolt-rv400-brz"]);

function escapeSvgText(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function makeSpareThumb(part: SparePartListing): string {
  const hueByCategory: Record<SparePartCategory, number> = {
    Parts: 212,
    Accessories: 165,
    Additives: 36,
  };

  const hue = hueByCategory[part.category];
  const bg = `hsl(${hue} 72% 94%)`;
  const accent = `hsl(${hue} 48% 24%)`;
  const label = escapeSvgText(part.name.toUpperCase().slice(0, 14));

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160" fill="none">
      <rect width="160" height="160" rx="20" fill="${bg}"/>
      <rect x="16" y="16" width="128" height="128" rx="14" fill="white" opacity="0.75"/>
      <circle cx="48" cy="104" r="15" stroke="${accent}" stroke-width="6"/>
      <circle cx="108" cy="104" r="15" stroke="${accent}" stroke-width="6"/>
      <path d="M42 98h18l13-20h24l13 20h10l-9-28H49l-7 28z" fill="${accent}" opacity="0.88"/>
      <text x="80" y="43" text-anchor="middle" fill="${accent}" font-family="Arial, sans-serif" font-size="11" font-weight="700">${label}</text>
      <text x="80" y="58" text-anchor="middle" fill="${accent}" font-family="Arial, sans-serif" font-size="10" font-weight="600">${escapeSvgText(part.category.toUpperCase())}</text>
    </svg>
  `;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function SparePartCard({
  part,
  onAddToCart,
}: {
  part: SparePartListing;
  onAddToCart: (part: SparePartListing) => void;
}) {
  return (
    <Card className="border-slate-200 bg-white/90">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="font-heading text-3xl uppercase tracking-wide text-slate-900">
            {part.name}
          </CardTitle>
          <Badge variant="outline" className="border-slate-300 text-slate-700">
            {part.condition}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-slate-700">
        <p>{part.fitment}</p>
        <p className="font-semibold text-slate-900">{formatBdt(part.priceBdt)}</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onAddToCart(part)}
            className={cn(buttonVariants({ size: "sm" }), "bg-slate-900 text-white hover:bg-slate-700")}
          >
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

type UsedPriority = "certified" | "promoted" | "user-listed";

const usedPriorityStyles: Record<
  UsedPriority,
  {
    cardClass: string;
    badgeClass: string;
  }
> = {
  certified: {
    cardClass: "border-emerald-300 bg-emerald-50/70 shadow-md",
    badgeClass: "bg-emerald-600 text-white hover:bg-emerald-600",
  },
  promoted: {
    cardClass: "border-amber-300 bg-amber-50/60 shadow-sm",
    badgeClass: "bg-amber-500 text-amber-950 hover:bg-amber-500",
  },
  "user-listed": {
    cardClass: "border-slate-200 bg-white/90",
    badgeClass: "bg-slate-700 text-white hover:bg-slate-700",
  },
};

function UsedBikeCard({
  bike,
  badgeLabel,
  priority,
}: {
  bike: Bike;
  badgeLabel: string;
  priority: UsedPriority;
}) {
  const style = usedPriorityStyles[priority];

  return (
    <Card className={cn("border shadow-sm", style.cardClass)}>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="font-heading text-3xl uppercase tracking-wide text-slate-900">
            {bike.brand} {bike.model}
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline" className={powertrainBadgeClass(bike.powertrain)}>
              {bike.powertrain}
            </Badge>
            <Badge className={style.badgeClass}>{badgeLabel}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-slate-700">
        <p className="font-semibold text-slate-900">{formatBdt(bike.priceBdt)}</p>
        <p className="text-xs uppercase tracking-wide text-slate-500">{headlineMetric(bike)}</p>
        <div className="flex gap-2">
          <Link
            href={`/bikes/${bike.slug}`}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "border-slate-300")}
          >
            View Specs
          </Link>
          <Link
            href={`/compare?bikes=${bike.slug}`}
            className={cn(buttonVariants({ size: "sm" }), "bg-slate-900 text-white hover:bg-slate-700")}
          >
            Compare
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MarketplacePage() {
  const [activeSection, setActiveSection] = useState<"spare" | "used">("spare");
  const addItem = useCartStore((state) => state.addItem);

  // Used Vehicles Filters
  const [powertrainFilter, setPowertrainFilter] = useState<"All" | "ICE" | "EV">("All");
  const [typeFilter, setTypeFilter] = useState<"All" | "Motorcycle" | "Scooter">("All");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
  const [metricFilter, setMetricFilter] = useState<string>("All");
  const [efficiencyFilter, setEfficiencyFilter] = useState<string>("All");
  const [brandFilter, setBrandFilter] = useState<string>("All");

  const [selectedCategory, setSelectedCategory] = useState<SparePartCategory | "All">("All");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("All");
  const [selectedNestedSubcategory, setSelectedNestedSubcategory] = useState<string>("All");
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoverCategory, setHoverCategory] = useState<SparePartCategory | "All">("All");
  const [hoverSubcategory, setHoverSubcategory] = useState<string>("All");
  const closeMenuTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const categoryOptions: Array<SparePartCategory | "All"> = [
    "All",
    "Parts",
    "Accessories",
    "Additives",
  ];

  const hoverSubcategoryOptions = useMemo(() => {
    const base = spareParts.filter(
      (item) => hoverCategory === "All" || item.category === hoverCategory
    );

    return ["All", ...Array.from(new Set(base.map((item) => item.subcategory)))];
  }, [hoverCategory]);

  const hoverNestedSubcategoryOptions = useMemo(() => {
    const base = spareParts.filter(
      (item) =>
        (hoverCategory === "All" || item.category === hoverCategory) &&
        (hoverSubcategory === "All" || item.subcategory === hoverSubcategory)
    );

    const nested = Array.from(
      new Set(base.map((item) => item.nestedSubcategory).filter((value): value is string => Boolean(value)))
    );

    return ["All", ...nested];
  }, [hoverCategory, hoverSubcategory]);

  function cancelScheduledClose() {
    if (closeMenuTimerRef.current) {
      clearTimeout(closeMenuTimerRef.current);
      closeMenuTimerRef.current = null;
    }
  }

  function openMenu() {
    cancelScheduledClose();
    setHoverCategory(selectedCategory);
    setHoverSubcategory(selectedSubcategory);
    setMenuOpen(true);
  }

  function closeMenu() {
    cancelScheduledClose();
    setMenuOpen(false);
  }

  function scheduleCloseMenu() {
    cancelScheduledClose();
    closeMenuTimerRef.current = setTimeout(() => {
      setMenuOpen(false);
      closeMenuTimerRef.current = null;
    }, 180);
  }

  useEffect(() => {
    return () => {
      cancelScheduledClose();
    };
  }, []);

  function selectAllProducts() {
    setSelectedCategory("All");
    setSelectedSubcategory("All");
    setSelectedNestedSubcategory("All");
    setHoverCategory("All");
    setHoverSubcategory("All");
    closeMenu();
  }

  function selectCategory(category: SparePartCategory | "All") {
    setSelectedCategory(category);
    setSelectedSubcategory("All");
    setSelectedNestedSubcategory("All");
    setHoverCategory(category);
    setHoverSubcategory("All");
    closeMenu();
  }

  function selectSubcategory(subcategory: string) {
    setSelectedCategory(hoverCategory);
    setSelectedSubcategory(subcategory);
    setSelectedNestedSubcategory("All");
    setHoverSubcategory(subcategory);
    closeMenu();
  }

  function selectNestedSubcategory(nestedSubcategory: string) {
    setSelectedCategory(hoverCategory);
    setSelectedSubcategory(hoverSubcategory);
    setSelectedNestedSubcategory(nestedSubcategory);
    closeMenu();
  }

  const filteredSpareParts = useMemo(() => {
    return spareParts.filter((item) => {
      if (selectedCategory !== "All" && item.category !== selectedCategory) return false;
      if (selectedSubcategory !== "All" && item.subcategory !== selectedSubcategory) return false;
      if (
        selectedNestedSubcategory !== "All" &&
        item.nestedSubcategory !== selectedNestedSubcategory
      ) {
        return false;
      }

      return true;
    });
  }, [selectedCategory, selectedSubcategory, selectedNestedSubcategory]);

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

      // Metric filter (CC or Range)
      if (metricFilter !== "All") {
        if (bike.powertrain === "ICE") {
            const cc = bike.displacementCc ?? 0;
            if (metricFilter === "100-125" && (cc < 100 || cc > 125)) return false;
            if (metricFilter === "126-150" && (cc < 126 || cc > 150)) return false;
            if (metricFilter === "151-200" && (cc < 151 || cc > 200)) return false;
            if (metricFilter === "201-350" && (cc < 201 || cc > 350)) return false;
            if (metricFilter === "350+" && cc <= 350) return false;
        } else {
            // For EV, we'll approximate battery kWh based on motor power for filtering if not explicitly present, 
            // but the user requested battery kWh chips.
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
  }, [powertrainFilter, typeFilter, priceRange, metricFilter, brandFilter]);

  const bikeHubCertified = filteredBikes.filter((bike) => certifiedSlugs.has(bike.slug));
  const promoted = filteredBikes.filter((bike) => promotedSlugs.has(bike.slug) && !certifiedSlugs.has(bike.slug));
  const userListed = filteredBikes.filter(
    (bike) => !certifiedSlugs.has(bike.slug) && !promotedSlugs.has(bike.slug)
  );

  const addSparePartToCart = (part: SparePartListing) => {
    addItem({
      id: part.id,
      name: part.name,
      price: part.priceBdt,
      quantity: 1,
      image: makeSpareThumb(part),
    });
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Marketplace</p>
        <h1 className="mt-2 flex items-center gap-2 font-heading text-5xl uppercase tracking-wide text-slate-900 sm:text-6xl">
          <ShoppingBag className="h-10 w-10" />
          Bike Marketplace
        </h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Browse two dedicated sections for spare parts and used vehicles.
        </p>

        <div className="mt-6 flex flex-wrap gap-3 md:gap-4">
          <button
            type="button"
            onClick={() => setActiveSection("spare")}
            className={cn(
              buttonVariants({ variant: activeSection === "spare" ? "default" : "outline", size: "lg" }),
              "min-w-[210px] justify-center text-base font-semibold",
              activeSection === "spare" ? "bg-slate-900 text-white hover:bg-slate-700" : "border-slate-300"
            )}
          >
            <Wrench className="h-4 w-4" />
            Spare Parts
          </button>

          <button
            type="button"
            onClick={() => setActiveSection("used")}
            className={cn(
              buttonVariants({ variant: activeSection === "used" ? "default" : "outline", size: "lg" }),
              "min-w-[210px] justify-center text-base font-semibold",
              activeSection === "used" ? "bg-slate-900 text-white hover:bg-slate-700" : "border-slate-300"
            )}
          >
            <BikeIcon className="h-4 w-4" />
            Used Vehicles
          </button>
        </div>
      </section>

      {activeSection === "spare" ? (
      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 font-heading text-4xl uppercase tracking-wide text-slate-900">
            <Wrench className="h-7 w-7" />
            Spare Parts
          </h2>
          <Badge variant="outline" className="border-slate-300 text-slate-700">
            {filteredSpareParts.length} listings
          </Badge>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Filter Products
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <div
              className="relative pb-1"
              onMouseEnter={openMenu}
              onMouseLeave={scheduleCloseMenu}
            >
              <button
                type="button"
                onClick={() => {
                  if (menuOpen) {
                    closeMenu();
                  } else {
                    openMenu();
                  }
                }}
                className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800"
              >
                Browse Categories
                <ChevronDown className="h-4 w-4" />
              </button>

              {menuOpen ? (
                <div
                  className="absolute left-0 top-full z-30 grid w-[min(92vw,760px)] grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-xl md:grid-cols-3"
                  onMouseEnter={openMenu}
                  onMouseLeave={scheduleCloseMenu}
                >
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Category</p>
                    <div className="mt-2 space-y-1">
                      <button
                        type="button"
                        onClick={selectAllProducts}
                        onMouseEnter={() => {
                          setHoverCategory("All");
                          setHoverSubcategory("All");
                        }}
                        className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-left text-sm text-slate-700 hover:bg-slate-50"
                      >
                        All Products
                      </button>

                      {categoryOptions
                        .filter((category) => category !== "All")
                        .map((category) => (
                          <button
                            type="button"
                            key={category}
                            onClick={() => selectCategory(category as SparePartCategory)}
                            onMouseEnter={() => {
                              setHoverCategory(category as SparePartCategory);
                              setHoverSubcategory("All");
                            }}
                            className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-left text-sm text-slate-700 hover:bg-slate-50"
                          >
                            {category}
                          </button>
                        ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Subcategory</p>
                    <div className="mt-2 space-y-1">
                      {hoverSubcategoryOptions.map((subcategory) => (
                        <button
                          type="button"
                          key={subcategory}
                          onClick={() => selectSubcategory(subcategory)}
                          onMouseEnter={() => setHoverSubcategory(subcategory)}
                          className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-left text-sm text-slate-700 hover:bg-slate-50"
                        >
                          {subcategory}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Nested Subcategory</p>
                    <div className="mt-2 space-y-1">
                      {hoverNestedSubcategoryOptions.map((nestedSubcategory) => (
                        <button
                          type="button"
                          key={nestedSubcategory}
                          onClick={() => selectNestedSubcategory(nestedSubcategory)}
                          className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-left text-sm text-slate-700 hover:bg-slate-50"
                        >
                          {nestedSubcategory}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            <button
              type="button"
              onClick={selectAllProducts}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700"
            >
              All Products
            </button>
          </div>

          <p className="mt-3 text-xs text-slate-600">
            Selected: {selectedCategory} / {selectedSubcategory} / {selectedNestedSubcategory}
          </p>

          <p className="mt-3 text-xs text-slate-500">
            Additives include subcategories such as Engine Oil, Engine Flush Oil, Octane Booster, Fuel Cleaner, and Brake Fluid.
          </p>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredSpareParts.map((part) => (
            <SparePartCard key={part.id} part={part} onAddToCart={addSparePartToCart} />
          ))}
        </div>
      </section>
      ) : null}

      {activeSection === "used" ? (
      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 font-heading text-4xl uppercase tracking-wide text-slate-900">
            <BikeIcon className="h-7 w-7" />
            Used Vehicles
          </h2>
          <Badge variant="outline" className="border-slate-300 text-slate-700">
            {bikes.length} listings
          </Badge>
        </div>

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

          {/* Level 2: Secondary Filter Bar (Dynamic) */}
          <div className="flex flex-col gap-5 rounded-3xl border border-slate-200 bg-slate-50/50 p-6">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">02. Refined Search</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              {/* Row 1, Col 1: Type Selection */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">01. Vehicle Category</span>
                <div className="flex bg-white rounded-xl p-1 border border-slate-200 w-fit h-9 items-center">
                  {["All", "Motorcycle", "Scooter"].map(t => (
                    <button
                      key={t}
                      onClick={() => setTypeFilter(t as any)}
                      className={cn(
                        "px-4 h-7 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all",
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
                            "h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border",
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
                            "h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border flex items-center gap-2",
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
                            "h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border",
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
                            "h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border flex items-center gap-2",
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
                          "h-9 px-4 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all border-2",
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
                          "h-9 px-4 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all border-2 flex items-center gap-2 cursor-pointer",
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

        <div className="space-y-8">
          <section className="rounded-2xl border-2 border-emerald-300 bg-emerald-50/40 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="flex items-center gap-2 font-heading text-3xl uppercase tracking-wide text-slate-900">
                <ShieldCheck className="h-6 w-6" />
                BikeHub Certified
              </h3>
              <Badge variant="outline" className="border-slate-300 text-slate-700">
                {bikeHubCertified.length} listings
              </Badge>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {bikeHubCertified.map((bike) => (
                <UsedBikeCard key={bike.slug} bike={bike} badgeLabel="Certified" priority="certified" />
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-amber-300 bg-amber-50/40 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="flex items-center gap-2 font-heading text-3xl uppercase tracking-wide text-slate-900">
                <Megaphone className="h-6 w-6" />
                Promoted
              </h3>
              <Badge variant="outline" className="border-slate-300 text-slate-700">
                {promoted.length} listings
              </Badge>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {promoted.map((bike) => (
                <UsedBikeCard key={bike.slug} bike={bike} badgeLabel="Promoted" priority="promoted" />
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white/70 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="flex items-center gap-2 font-heading text-3xl uppercase tracking-wide text-slate-900">
                <User className="h-6 w-6" />
                User Listed
              </h3>
              <Badge variant="outline" className="border-slate-300 text-slate-700">
                {userListed.length} listings
              </Badge>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {userListed.map((bike) => (
                <UsedBikeCard key={bike.slug} bike={bike} badgeLabel="User Listed" priority="user-listed" />
              ))}
            </div>
          </section>
        </div>
      </section>
      ) : null}
    </div>
  );
}
