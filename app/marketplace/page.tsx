"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Bike as BikeIcon, ChevronDown, Megaphone, ShieldCheck, ShoppingBag, ShoppingCart, User, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
        <p>{bike.summary}</p>
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

  const bikeHubCertified = bikes.filter((bike) => certifiedSlugs.has(bike.slug));
  const promoted = bikes.filter((bike) => promotedSlugs.has(bike.slug) && !certifiedSlugs.has(bike.slug));
  const userListed = bikes.filter(
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
