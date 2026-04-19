"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Inter } from "next/font/google";
import { useRouter } from "next/navigation";
import { Bike as BikeIcon, ChevronDown, ChevronUp, Megaphone, ShieldCheck, ShoppingBag, ShoppingCart, SlidersHorizontal, User, Wrench, X, Building2, Map, Package, Wallet, Search, CheckCircle2, Sparkles, Target, Star, Truck } from "lucide-react";
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
type SparePartsSortField = "price" | "rating" | "popularity";
type SparePartsSortDirection = "asc" | "desc";

type SparePartListing = {
  id: string;
  name: string;
  fitment: string;
  condition: string;
  priceBdt: number;
  stock: number;
  category: SparePartCategory;
  subcategory: string;
  nestedSubcategory?: string;
  compatibleBikes: string[];
  isUniversal?: boolean;
  brand?: string;
  rating?: number;
  deliveryWindow?: string;
};

const certifiedSlugs = new Set(["yamaha-r15-v4", "suzuki-vstrom-250", "ultraviolette-f77"]);
const promotedSlugs = new Set(["honda-cb350rs", "ather-450x-gen3", "revolt-rv400-brz"]);
const sparePartsSortFields: Array<{ value: SparePartsSortField; label: string }> = [
  { value: "price", label: "Price" },
  { value: "rating", label: "Rating" },
  { value: "popularity", label: "Popularity" },
];
const sparePartsSortDirections: Array<{ value: SparePartsSortDirection; label: string }> = [
  { value: "asc", label: "Low -> High" },
  { value: "desc", label: "High -> Low" },
];
const inter = Inter({ subsets: ["latin"] });

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

function normalizeSearchText(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function getBikeSearchTokens(bike: Bike) {
  return {
    brand: normalizeSearchText(bike.brand),
    model: normalizeSearchText(bike.model),
    full: normalizeSearchText(`${bike.brand}${bike.model}`),
    slug: normalizeSearchText(bike.slug),
  };
}

function getPartBrand(part: SparePartListing): string {
  if (part.brand?.trim()) {
    return part.brand.trim();
  }

  const compatibleBrands = Array.from(
    new Set(
      part.compatibleBikes
        .filter((slug) => slug !== "Universal")
        .map((slug) => bikes.find((bike) => bike.slug === slug)?.brand)
        .filter((brand): brand is string => Boolean(brand))
    )
  );

  if (compatibleBrands.length === 0) {
    return "Universal Fit";
  }

  if (compatibleBrands.length === 1) {
    return compatibleBrands[0];
  }

  if (compatibleBrands.length === 2) {
    return compatibleBrands.join(" + ");
  }

  return `${compatibleBrands[0]} +${compatibleBrands.length - 1} more`;
}

function getPartRating(part: SparePartListing): number {
  if (typeof part.rating === "number" && Number.isFinite(part.rating)) {
    return Number(part.rating.toFixed(1));
  }

  const stockBoost = part.stock > 20 ? 0.3 : part.stock > 8 ? 0.2 : part.stock > 0 ? 0.1 : 0;
  const compatibilityBoost = part.compatibleBikes.includes("Universal") ? 0.2 : part.compatibleBikes.length > 2 ? 0.1 : 0.05;
  const conditionBoost = part.condition === "New" ? 0.25 : 0.05;
  const categoryBoost =
    part.category === "Accessories" ? 0.15 : part.category === "Additives" ? 0.1 : 0.05;

  return Math.min(4.9, Number((4 + stockBoost + compatibilityBoost + conditionBoost + categoryBoost).toFixed(1)));
}

function getCompatibilityLabel(part: SparePartListing, selectedBike: Bike | null): string {
  if (selectedBike && part.compatibleBikes.includes(selectedBike.slug)) {
    return "Exact fit";
  }

  if (part.compatibleBikes.includes("Universal")) {
    return "Universal";
  }

  const bikeCount = part.compatibleBikes.length;
  if (bikeCount <= 1) {
    return "Single-bike fit";
  }

  return `${bikeCount} bike fit`;
}

function getStockMeta(part: SparePartListing): {
  stockLabel: string;
  stockClassName: string;
  deliveryLabel: string;
} {
  if (part.stock <= 0) {
    return {
      stockLabel: "Out of stock",
      stockClassName: "border-red-200 bg-red-50 text-red-700",
      deliveryLabel: part.deliveryWindow ?? "Restock update in 3-5 days",
    };
  }

  if (part.stock < 5) {
    return {
      stockLabel: `Only ${part.stock} left`,
      stockClassName: "border-amber-200 bg-amber-50 text-amber-700",
      deliveryLabel: part.deliveryWindow ?? "Delivery in 2-4 days",
    };
  }

  if (part.stock < 15) {
    return {
      stockLabel: `Low stock (${part.stock})`,
      stockClassName: "border-orange-200 bg-orange-50 text-orange-700",
      deliveryLabel: part.deliveryWindow ?? "Delivery in 1-3 days",
    };
  }

  return {
    stockLabel: `In stock (${part.stock})`,
    stockClassName: "border-emerald-200 bg-emerald-50 text-emerald-700",
    deliveryLabel: part.deliveryWindow ?? "Dispatches within 24 hrs",
  };
}

function getPartSearchText(part: SparePartListing): string {
  const compatibleBikeText = part.compatibleBikes
    .map((slug) => {
      if (slug === "Universal") {
        return slug;
      }

      const matchedBike = bikes.find((bike) => bike.slug === slug);
      return matchedBike ? `${matchedBike.brand} ${matchedBike.model} ${matchedBike.category}` : slug;
    })
    .join(" ");

  return normalizeSearchText(
    [
      part.name,
      part.subcategory,
      part.nestedSubcategory,
      part.fitment,
      part.category,
      compatibleBikeText,
    ]
      .filter(Boolean)
      .join(" ")
  );
}

function getPartPopularityScore(part: SparePartListing, selectedBikeSlug: string): number {
  const ratingScore = getPartRating(part) * 24;
  const stockScore = Math.min(part.stock, 40) * 0.35;
  const universalScore = part.compatibleBikes.includes("Universal") ? 8 : 0;
  const compatibilityScore =
    selectedBikeSlug !== "all" && part.compatibleBikes.includes(selectedBikeSlug)
      ? 16
      : Math.min(part.compatibleBikes.length, 6) * 1.75;

  return ratingScore + stockScore + universalScore + compatibilityScore;
}

// ─── Smart Part Card with Compatibility Badge ────────────────────────────
function SmartPartCard({
  part,
  selectedBike,
  onAddToCart,
  onBuyNow,
  onCheckCompatibility,
}: {
  part: SparePartListing;
  selectedBike: Bike | null;
  onAddToCart: (part: SparePartListing) => void;
  onBuyNow: (part: SparePartListing) => void;
  onCheckCompatibility: () => void;
}) {
  const isExactFit = selectedBike && part.compatibleBikes.includes(selectedBike.slug);
  const isUniversal = part.compatibleBikes.includes("Universal");
  const brand = getPartBrand(part);
  const rating = getPartRating(part);
  const compatibilityLabel = getCompatibilityLabel(part, selectedBike);
  const stockMeta = getStockMeta(part);

  return (
    <Card className={cn(
      "group relative overflow-hidden border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl",
      isExactFit
        ? "border-emerald-300 bg-gradient-to-br from-emerald-50/90 via-white to-white shadow-emerald-100/60"
        : isUniversal
          ? "border-slate-200 bg-gradient-to-br from-white via-white to-slate-50/90"
          : "border-slate-200 bg-gradient-to-br from-white via-white to-slate-100/60"
    )}>
      {/* Compatibility badge strip */}
      {selectedBike && (
        <div className={cn(
          "flex items-center gap-1.5 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest",
          isExactFit
            ? "bg-emerald-500 text-white"
            : "bg-slate-100 text-slate-500"
        )}>
          {isExactFit ? (
            <>
              <CheckCircle2 className="h-3 w-3" />
              Verified fit for {selectedBike.brand} {selectedBike.model}
            </>
          ) : (
            <>
              <Wrench className="h-3 w-3" />
              Universal — fits all bikes
            </>
          )}
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex gap-4">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-inner">
            <img
              src={makeSpareThumb(part)}
              alt={part.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                  {brand}
                </p>
                <CardTitle className="mt-1 line-clamp-2 font-heading text-2xl uppercase tracking-wide leading-tight text-slate-900">
                  {part.name}
                </CardTitle>
              </div>
              <Badge variant="outline" className={cn(
                "border text-[10px] font-bold shrink-0",
                part.condition === "New"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-slate-300 text-slate-700"
              )}>
                {part.condition}
              </Badge>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700 ring-1 ring-amber-200">
                <Star className="h-3.5 w-3.5 fill-current" />
                {rating.toFixed(1)}
              </div>
              <Badge variant="outline" className="border-slate-200 bg-white/80 text-[10px] font-semibold text-slate-600">
                {compatibilityLabel}
              </Badge>
              <Badge variant="outline" className="border-slate-200 bg-white/80 text-[10px] font-semibold text-slate-500">
                {part.category}
              </Badge>
              <Badge variant="outline" className="border-slate-200 bg-white/80 text-[10px] font-semibold text-slate-500">
                {part.subcategory}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Brand</p>
            <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Building2 className="h-4 w-4 text-slate-400" />
              <span>{brand}</span>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Compatibility</p>
            <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Wrench className="h-4 w-4 text-slate-400" />
              <span>{compatibilityLabel}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Target className="h-3.5 w-3.5" />
          <span>{part.fitment}</span>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Stock</p>
            <div className="mt-2">
              <span className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold", stockMeta.stockClassName)}>
                <Package className="mr-1.5 h-3.5 w-3.5" />
                {stockMeta.stockLabel}
              </span>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Delivery</p>
            <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Truck className="h-4 w-4 text-slate-400" />
              <span>{stockMeta.deliveryLabel}</span>
            </div>
          </div>
        </div>

        {/* Compatible bikes list (when no bike is selected) */}
        {!selectedBike && !isUniversal && part.compatibleBikes.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {part.compatibleBikes.slice(0, 3).map((slug) => {
              const bike = bikes.find((b) => b.slug === slug);
              return bike ? (
                <span key={slug} className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                  <BikeIcon className="h-2.5 w-2.5" />
                  {bike.brand} {bike.model}
                </span>
              ) : null;
            })}
            {part.compatibleBikes.length > 3 && (
              <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-400">
                +{part.compatibleBikes.length - 3} more
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between gap-3 border-t border-slate-200/80 pt-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Price</p>
            <p className="text-lg font-black text-slate-900">{formatBdt(part.priceBdt)}</p>
          </div>
          <div className="grid min-w-[220px] gap-2 sm:min-w-[250px]">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onAddToCart(part)}
                className={cn(
                  buttonVariants({ size: "sm" }),
                  "bg-slate-900 text-white transition-all hover:bg-slate-700 group-hover:shadow-md",
                  isExactFit && "bg-emerald-600 hover:bg-emerald-700"
                )}
              >
                <ShoppingCart className="h-3.5 w-3.5" />
                Add to Cart
              </button>
              <button
                type="button"
                onClick={() => onBuyNow(part)}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "border-slate-300 bg-white text-slate-900 transition-all hover:border-slate-400 hover:bg-slate-50"
                )}
              >
                <Wallet className="h-3.5 w-3.5" />
                Buy Now
              </button>
            </div>
            <button
              type="button"
              onClick={onCheckCompatibility}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "w-full border-dashed border-slate-300 bg-white/80 text-slate-700 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-800"
              )}
            >
              <Wrench className="h-3.5 w-3.5" />
              Check Compatibility
            </button>
          </div>
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

export function MarketplacePageContent({ section = "spare" }: { section?: "spare" | "used" }) {
  const router = useRouter();
  const activeSection = section;
  const [selectedBikeSlug, setSelectedBikeSlug] = useState<string>("all");
  const [spareParts, setSpareParts] = useState<SparePartListing[]>([]);
  const [isLoadingParts, setIsLoadingParts] = useState(true);
  const addItem = useCartStore((state) => state.addItem);

  const selectedBike = useMemo(() => {
    if (selectedBikeSlug === "all") return null;
    return bikes.find((b) => b.slug === selectedBikeSlug) ?? null;
  }, [selectedBikeSlug]);

  useEffect(() => {
    setIsLoadingParts(true);
    fetch("/api/parts")
      .then((res) => res.json())
      .then((data: any[]) => {
        const payload: SparePartListing[] = data.map((d) => ({
          id: d.id,
          name: d.name,
          fitment: d.fitment,
          condition: d.condition,
          priceBdt: d.retailPrice ?? d.price ?? 0,
          stock: typeof d.stock === "number" ? d.stock : 0,
          category: d.category as SparePartCategory,
          subcategory: d.subcategory,
          nestedSubcategory: d.nestedSubcategory,
          compatibleBikes: Array.isArray(d.compatibleBikes)
            ? d.compatibleBikes
            : d.compatibleBikes
              ? JSON.parse(d.compatibleBikes)
              : ["Universal"],
          isUniversal: d.isUniversal,
          brand: typeof d.brand === "string" ? d.brand : undefined,
          rating: typeof d.rating === "number" ? d.rating : undefined,
          deliveryWindow: typeof d.deliveryWindow === "string" ? d.deliveryWindow : undefined,
        }));
        setSpareParts(payload);
        setIsLoadingParts(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoadingParts(false);
      });
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const bikeSlug = params.get("bike");
      if (bikeSlug && bikes.find(b => b.slug === bikeSlug)) {
        setSelectedBikeSlug(bikeSlug);
      }
    }
  }, []);

  // Used Vehicles Filters
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

  const [selectedCategory, setSelectedCategory] = useState<SparePartCategory | "All">("All");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("All");
  const [selectedNestedSubcategory, setSelectedNestedSubcategory] = useState<string>("All");
  const [spareSortField, setSpareSortField] = useState<SparePartsSortField>("popularity");
  const [spareSortDirection, setSpareSortDirection] = useState<SparePartsSortDirection>("desc");
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoverCategory, setHoverCategory] = useState<SparePartCategory | "All">("All");
  const [hoverSubcategory, setHoverSubcategory] = useState<string>("All");

  const [isScrolledPast, setIsScrolledPast] = useState(false);
  const filterSectionRef = useRef<HTMLDivElement>(null);
  const [bikeSearchQuery, setBikeSearchQuery] = useState("");
  const [showBikeDropdown, setShowBikeDropdown] = useState(false);
  const bikeSearchRef = useRef<HTMLDivElement>(null);

  // Close bike dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (bikeSearchRef.current && !bikeSearchRef.current.contains(e.target as Node)) {
        setShowBikeDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredBikeOptions = useMemo(() => {
    if (!bikeSearchQuery) return bikes;
    const q = normalizeSearchText(bikeSearchQuery);
    
    return bikes.filter((b) => {
      const { brand, model, full, slug } = getBikeSearchTokens(b);
      return brand.includes(q) || model.includes(q) || full.includes(q) || slug.includes(q);
    });
  }, [bikeSearchQuery]);

  const committedBikeMatchSlugs = useMemo(() => {
    const q = normalizeSearchText(bikeSearchQuery);

    if (!q) {
      return new Set<string>();
    }

    return new Set(
      bikes
        .filter((bike) => {
          const { brand, model, full, slug } = getBikeSearchTokens(bike);
          return brand.includes(q) || model.includes(q) || full.includes(q) || slug.includes(q);
        })
        .map((bike) => bike.slug)
    );
  }, [bikeSearchQuery]);

  function findExactBikeMatch(query: string) {
    const q = normalizeSearchText(query);

    if (!q) {
      return null;
    }

    return bikes.find((bike) => {
      const { model, full, slug } = getBikeSearchTokens(bike);
      return q === model || q === full || q === slug;
    }) ?? null;
  }

  function selectBikeFromSearch(bike: Bike) {
    setSelectedBikeSlug(bike.slug);
    setShowBikeDropdown(false);
    setBikeSearchQuery("");
  }

  function applyBikeSearch(query: string) {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setSelectedBikeSlug("all");
      setBikeSearchQuery("");
      setShowBikeDropdown(false);
      return;
    }

    const exactBikeMatch = findExactBikeMatch(trimmedQuery);

    if (exactBikeMatch) {
      selectBikeFromSearch(exactBikeMatch);
      return;
    }

    setSelectedBikeSlug("all");
    setBikeSearchQuery(trimmedQuery);
    setShowBikeDropdown(false);
  }

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolledPast(window.scrollY > 200);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
  }, [hoverCategory, spareParts]);

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
  }, [hoverCategory, hoverSubcategory, spareParts]);

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

  // Filter spare parts with smart compatibility awareness
  const filteredSpareParts = useMemo(() => {
    return spareParts.filter((item) => {
      // Bike-Based Entry Filter
      if (selectedBikeSlug !== "all") {
        if (!item.compatibleBikes.includes("Universal") && !item.compatibleBikes.includes(selectedBikeSlug)) {
          return false;
        }
      } else if (bikeSearchQuery.trim()) {
        const normalizedQuery = normalizeSearchText(bikeSearchQuery);
        const searchableText = getPartSearchText(item);
        const matchesPartText = searchableText.includes(normalizedQuery);
        const matchesBikeCompatibility =
          committedBikeMatchSlugs.size > 0 &&
          (item.compatibleBikes.includes("Universal") ||
            item.compatibleBikes.some((slug) => committedBikeMatchSlugs.has(slug)));

        if (!matchesPartText && !matchesBikeCompatibility) {
          return false;
        }
      }

      // Mega Menu Category Filters
      if (selectedCategory !== "All" && item.category !== selectedCategory) return false;
      if (selectedSubcategory !== "All" && item.subcategory !== selectedSubcategory) return false;
      if (
        selectedNestedSubcategory !== "All" &&
        item.nestedSubcategory !== selectedNestedSubcategory
      ) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      let comparison = 0;

      if (spareSortField === "price") {
        comparison = a.priceBdt - b.priceBdt;
      } else if (spareSortField === "rating") {
        comparison = getPartRating(a) - getPartRating(b);
      } else {
        comparison =
          getPartPopularityScore(a, selectedBikeSlug) - getPartPopularityScore(b, selectedBikeSlug);
      }

      return spareSortDirection === "asc" ? comparison : -comparison;
    });
  }, [
    bikeSearchQuery,
    committedBikeMatchSlugs,
    selectedCategory,
    selectedSubcategory,
    selectedNestedSubcategory,
    selectedBikeSlug,
    spareParts,
    spareSortDirection,
    spareSortField,
  ]);

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

  const buySparePartNow = (part: SparePartListing) => {
    addSparePartToCart(part);
    router.push("/checkout");
  };

  const scrollToCompatibilitySelector = () => {
    requestAnimationFrame(() => {
      bikeSearchRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
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
          <Link
            href="/marketplace/spare-parts"
            className={cn(
              buttonVariants({ variant: activeSection === "spare" ? "default" : "outline", size: "lg" }),
              "min-w-[210px] justify-center text-base font-semibold",
              activeSection === "spare" ? "bg-slate-900 text-white hover:bg-slate-700" : "border-slate-300"
            )}
          >
            <Wrench className="h-4 w-4" />
            Spare Parts
          </Link>

          <Link
            href="/marketplace/used-vehicles"
            className={cn(
              buttonVariants({ variant: activeSection === "used" ? "default" : "outline", size: "lg" }),
              "min-w-[210px] justify-center text-base font-semibold",
              activeSection === "used" ? "bg-slate-900 text-white hover:bg-slate-700" : "border-slate-300"
            )}
          >
            <BikeIcon className="h-4 w-4" />
            Used Vehicles
          </Link>
        </div>
      </section>

      {activeSection === "spare" ? (
        <section className="mt-8">
          {/* ── SMART BIKE SELECTOR (Hero) ── */}
          <div className="mb-8 relative rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
            {/* Decorative background */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-gradient-to-br from-amber-100/40 to-transparent" />
              <div className="absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-gradient-to-tr from-blue-100/30 to-transparent" />
              <div className="absolute right-10 bottom-10 opacity-[0.02]">
                <Wrench strokeWidth={1} size={200} />
              </div>
            </div>

            <div className="relative p-6 sm:p-8">
              <div className="mx-auto max-w-2xl text-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 mb-4">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-700">
                    Smart Parts Discovery
                  </span>
                </div>

                <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
                  Find the right part for <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">YOUR</span> bike
                </h2>
                <p className="mt-3 text-sm text-slate-500 max-w-md mx-auto">
                  Select your motorcycle below. We{"'"}ll show compatibility-verified parts, smart maintenance recommendations, and exact-fit gear.
                </p>

                {/* Bike Search / Selector */}
                <div ref={bikeSearchRef} className="relative mx-auto mt-6 max-w-lg">
                  <div className={cn(
                    "relative flex items-center rounded-2xl border-2 transition-all duration-300",
                    showBikeDropdown
                      ? "border-amber-400 shadow-lg shadow-amber-100/50 ring-4 ring-amber-500/10"
                      : selectedBike
                        ? "border-emerald-300 bg-emerald-50/50"
                        : "border-slate-200 hover:border-slate-300"
                  )}>
                    {selectedBike ? (
                      <>
                        <div className="flex items-center gap-3 py-3.5 pl-5 pr-2 flex-1">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
                            <BikeIcon className="h-5 w-5 text-emerald-600" />
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-black text-slate-900">
                              {selectedBike.brand} {selectedBike.model}
                            </p>
                            <p className="text-[10px] text-slate-500">
                              {selectedBike.powertrain} • {selectedBike.displacementCc ? `${selectedBike.displacementCc}cc` : `${selectedBike.motorPowerKw}kW`}
                              {selectedBike.category && ` • ${selectedBike.category}`}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedBikeSlug("all");
                            setBikeSearchQuery("");
                          }}
                          className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <Search className="absolute left-5 h-5 w-5 text-slate-400" />
                        <input
                          type="text"
                          value={bikeSearchQuery}
                          onChange={(e) => {
                            setBikeSearchQuery(e.target.value);
                            setShowBikeDropdown(true);
                          }}
                          onFocus={() => setShowBikeDropdown(true)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              applyBikeSearch(bikeSearchQuery);
                            }
                          }}
                          placeholder="Search bike, category, or item... (e.g. Honda NX 200, Honda, Engine Oil)"
                          className="w-full bg-transparent py-4 pl-13 pr-5 text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400"
                        />
                      </>
                    )}
                  </div>

                  {/* Dropdown */}
                  {showBikeDropdown && !selectedBike && (
                    <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[360px] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">
                      {filteredBikeOptions.length === 0 ? (
                        <div className="px-5 py-8 text-center">
                          <p className="text-sm text-slate-400">No bikes match your search</p>
                        </div>
                      ) : (
                        Object.entries(
                          filteredBikeOptions.reduce<Record<string, Bike[]>>((acc, bike) => {
                            if (!acc[bike.brand]) acc[bike.brand] = [];
                            acc[bike.brand].push(bike);
                            return acc;
                          }, {})
                        ).map(([brand, brandBikes]) => (
                          <div key={brand}>
                            <p className="sticky top-0 bg-slate-50/90 px-5 py-2 text-[9px] font-black uppercase tracking-widest text-slate-400 backdrop-blur-sm">
                              {brand}
                            </p>
                            {brandBikes.map((bike) => (
                              <button
                                key={bike.slug}
                                type="button"
                                onClick={() => selectBikeFromSearch(bike)}
                                className="flex w-full items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-amber-50/50"
                              >
                                <div className={cn(
                                  "flex h-9 w-9 items-center justify-center rounded-xl",
                                  bike.powertrain === "EV" ? "bg-emerald-100" : "bg-slate-100"
                                )}>
                                  <BikeIcon className={cn(
                                    "h-4 w-4",
                                    bike.powertrain === "EV" ? "text-emerald-600" : "text-slate-500"
                                  )} />
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-bold text-slate-800">{bike.model}</p>
                                  <p className="text-[10px] text-slate-400">
                                    {bike.powertrain} • {bike.displacementCc ? `${bike.displacementCc}cc` : `${bike.motorPowerKw}kW`} • {bike.category}
                                  </p>
                                </div>
                                <Badge variant="outline" className={cn(
                                  "text-[9px] font-bold",
                                  bike.powertrain === "EV" ? "border-emerald-200 text-emerald-600" : "border-slate-200 text-slate-400"
                                )}>
                                  {bike.powertrain}
                                </Badge>
                              </button>
                            ))}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Quick-select popular bikes */}
                {!selectedBike && (
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-300 self-center mr-1">Popular:</span>
                    {bikes.slice(0, 4).map((bike) => (
                      <button
                        key={bike.slug}
                        type="button"
                        onClick={() => selectBikeFromSearch(bike)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-600 transition-all hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700"
                      >
                        <BikeIcon className="h-3 w-3" />
                        {bike.brand} {bike.model}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <h2 className="flex items-center gap-2 font-heading text-4xl uppercase tracking-wide text-slate-900">
                    <Wrench className="h-7 w-7" />
                    {selectedBike
                      ? `Parts for ${selectedBike.brand} ${selectedBike.model}`
                      : bikeSearchQuery.trim()
                        ? `Results for ${bikeSearchQuery.trim()}`
                        : "Spare Parts"}
                  </h2>
                  <Badge variant="outline" className="border-slate-300 text-slate-700">
                    {filteredSpareParts.length} listings
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white/90 p-2 shadow-sm">
                  <span className="px-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                    Sort
                  </span>
                    <Popover>
                      <PopoverTrigger>
                        <div
                          role="button"
                          className={cn(
                            inter.className,
                            "flex min-w-[172px] cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-700 outline-none transition-colors hover:border-slate-300 focus:border-slate-400 sm:min-w-[188px]"
                          )}
                        >
                          <span>{sparePartsSortFields.find((option) => option.value === spareSortField)?.label ?? "Popularity"}</span>
                          <ChevronDown className="ml-3 h-3.5 w-3.5 shrink-0 text-slate-500" />
                        </div>
                      </PopoverTrigger>
                      <PopoverContent align="start" className={cn(inter.className, "w-[188px] border-slate-200 p-1")}>
                        <div className="flex flex-col">
                          {sparePartsSortFields.map((option) => (
                            <button
                              key={option.value}
                              type="button"
                            onClick={() => setSpareSortField(option.value)}
                            className={cn(
                              "flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-[11px] font-bold uppercase tracking-[0.14em] transition-colors",
                              spareSortField === option.value
                                ? "bg-slate-100 text-slate-900"
                                : "text-slate-700 hover:bg-slate-50"
                            )}
                          >
                            <span>{option.label}</span>
                            {spareSortField === option.value ? <CheckCircle2 className="h-3.5 w-3.5" /> : null}
                          </button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                    <Popover>
                      <PopoverTrigger>
                        <div
                          role="button"
                          className={cn(
                            inter.className,
                            "flex min-w-[168px] cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-700 outline-none transition-colors hover:border-slate-300 focus:border-slate-400 sm:min-w-[182px]"
                          )}
                        >
                          <span>{sparePartsSortDirections.find((option) => option.value === spareSortDirection)?.label ?? "High -> Low"}</span>
                          <ChevronDown className="ml-3 h-3.5 w-3.5 shrink-0 text-slate-500" />
                        </div>
                      </PopoverTrigger>
                      <PopoverContent align="start" className={cn(inter.className, "w-[182px] border-slate-200 p-1")}>
                        <div className="flex flex-col">
                          {sparePartsSortDirections.map((option) => (
                            <button
                              key={option.value}
                              type="button"
                            onClick={() => setSpareSortDirection(option.value)}
                            className={cn(
                              "flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-[11px] font-bold uppercase tracking-[0.14em] transition-colors",
                              spareSortDirection === option.value
                                ? "bg-slate-100 text-slate-900"
                                : "text-slate-700 hover:bg-slate-50"
                            )}
                          >
                            <span>{option.label}</span>
                            {spareSortDirection === option.value ? <CheckCircle2 className="h-3.5 w-3.5" /> : null}
                          </button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Filter Products
                </p>

                {bikeSearchQuery.trim() && !selectedBike ? (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                      Search query: {bikeSearchQuery.trim()}
                    </Badge>
                    <button
                      type="button"
                      onClick={() => {
                        setBikeSearchQuery("");
                      }}
                      className="text-xs font-semibold text-slate-500 transition-colors hover:text-slate-800"
                    >
                      Clear search
                    </button>
                  </div>
                ) : null}

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

                  {/* Active filter indicators */}
                  {selectedCategory !== "All" && (
                    <Badge variant="secondary" className="bg-slate-900 text-white pl-3 pr-1 py-1 flex items-center gap-2 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                      {selectedCategory} {selectedSubcategory !== "All" ? `> ${selectedSubcategory}` : ""}
                      <button onClick={selectAllProducts} className="hover:bg-white/20 p-0.5 rounded transition-colors"><X className="w-3 h-3" /></button>
                    </Badge>
                  )}
                </div>

                <p className="mt-3 text-xs text-slate-600">
                  Selected: {selectedCategory} / {selectedSubcategory} / {selectedNestedSubcategory}
                </p>
              </div>

              {isLoadingParts ? (
                <div className="mt-8 flex flex-col items-center justify-center py-16">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
                  <p className="mt-4 text-sm text-slate-500">Loading parts...</p>
                </div>
              ) : filteredSpareParts.length === 0 ? (
                <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 py-16 text-center">
                  <Package className="mx-auto h-12 w-12 text-slate-300" />
                  <p className="mt-4 text-lg font-bold text-slate-600">No parts found</p>
                  <p className="mt-1 text-sm text-slate-400">
                    {selectedBike
                      ? `No matching parts for ${selectedBike.brand} ${selectedBike.model} in this category yet.`
                      : bikeSearchQuery.trim()
                        ? `No matching parts found for ${bikeSearchQuery.trim()}.`
                      : "Try adjusting your filters or browse all products."
                    }
                  </p>
                  {selectedBike && (
                    <button
                      type="button"
                      onClick={selectAllProducts}
                      className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-4 border-slate-300")}
                    >
                      Show All Categories
                    </button>
                  )}
                </div>
              ) : (
                <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {filteredSpareParts.map((part) => (
                    <SmartPartCard
                      key={part.id}
                      part={part}
                      selectedBike={selectedBike}
                      onAddToCart={addSparePartToCart}
                      onBuyNow={buySparePartNow}
                      onCheckCompatibility={scrollToCompatibilitySelector}
                    />
                  ))}
                </div>
              )}
          </>
        </section>
      ) : null}

      {activeSection === "used" ? (
        <section ref={filterSectionRef} className="mt-8">
          <div className="mb-4 flex items-center justify-between gap-3 px-4 sm:px-0">
            <h2 className="flex items-center gap-2 font-heading text-4xl uppercase tracking-wide text-slate-900">
              <BikeIcon className="h-7 w-7" />
              Used Vehicles
            </h2>
            <Badge variant="outline" className="border-slate-300 text-slate-700">
              {bikes.length} listings
            </Badge>
          </div>

          {/* Progressive Disclosure Navigation */}
          <div className="space-y-6">
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
                      ? `৳${priceRange[0] / 1000}K – ${priceRange[1] >= 1000000 ? "10L+" : priceRange[1] / 100000 + "L"}`
                      : "Price"}
                    <ChevronDown className="w-3.5 h-3.5 opacity-50" />
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-[320px] p-4" align="start">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black uppercase tracking-widest text-slate-900">Price Range</span>
                      <span className="text-[10px] font-mono font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                        ৳ {priceRange[0] / 1000}K – {priceRange[1] >= 1000000 ? "10L+" : `${priceRange[1] / 100000}L`}
                      </span>
                    </div>
                    <Slider
                      defaultValue={[0, 1000000]}
                      max={1000000}
                      step={10000}
                      value={[priceRange[0], priceRange[1]]}
                      onValueChange={(val) => { const v = val as number[]; setPriceRange([v[0], v[1]]); }}
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
                          onClick={() => setPriceRange(preset.range as [number, number])}
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
                        <CommandItem onSelect={() => setBrandFilter("All")} className="text-xs uppercase font-bold">
                          All Brands
                        </CommandItem>
                        {Array.from(new Set(bikes.map(b => b.brand))).sort().map(brand => (
                          <CommandItem key={brand} onSelect={() => setBrandFilter(brand)} className="text-xs">
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
                              onClick={() => setMetricFilter(tier)}
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
                              onClick={() => setMetricFilter(tier)}
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
                              onClick={() => setEfficiencyFilter(tier)}
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
                              onClick={() => setEfficiencyFilter(tier)}
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
                  ৳{priceRange[0] / 1000}K – {priceRange[1] / 1000 >= 1000 ? "10L+" : priceRange[1] / 1000 + "K"}
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
          </div>
        </section>
      ) : null}
      {activeSection === "used" && isScrolledPast && (
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

export default function MarketplacePage() {
  return <MarketplacePageContent section="spare" />;
}
