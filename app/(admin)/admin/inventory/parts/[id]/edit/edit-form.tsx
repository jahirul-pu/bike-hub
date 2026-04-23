"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Bike as BikeIcon, CheckCircle2, Search, X, Wrench, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { bikes } from "@/lib/bikes-data";
import { updatePart } from "../../actions";

type PartData = {
  id: string;
  name: string;
  sku: string;
  imageUrl: string;
  purchasePrice: number;
  retailPrice: number;
  stock: number;
  category: string;
  subcategory: string;
  nestedSubcategory: string;
  condition: string;
  compatibleBikes: string[];
};

const SUBCATEGORY_MAP: Record<string, string[]> = {
  Parts: ["General", "Engine Oil", "Air Filter", "Brake Pads", "Chain Kit", "Spark Plug", "Tyres", "Battery", "Clutch Plates", "Gaskets", "Bearings", "Cables", "Sprocket"],
  Accessories: ["Phone Mount", "Frame Sliders", "Crash Guard", "Performance Exhaust", "Luggage", "Charger", "Visor", "LED Lights", "Handlebar Grips", "Mirrors", "Seat Cover"],
  Additives: ["Engine Oil", "Engine Flush Oil", "Octane Booster", "Fuel Cleaner", "Brake Fluid", "Coolant", "Chain Lube", "Gear Oil"],
};

const NESTED_SUBCATEGORY_MAP: Record<string, string[]> = {
  "Engine Oil": ["10W-30", "10W-40", "10W-50", "20W-40", "20W-50", "5W-30", "5W-40"],
  "Tyres": ["Front Tyre", "Rear Tyre", "Tube", "Tubeless"],
  "Brake Pads": ["Front Brake Pad", "Rear Brake Pad", "Disc Brake Pad", "Drum Brake Shoe"],
};

export default function EditPartForm({ part }: { part: PartData }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Core fields
  const [name, setName] = useState(part.name);
  const [sku, setSku] = useState(part.sku);
  const [imageUrl, setImageUrl] = useState(part.imageUrl);
  const [purchasePrice, setPurchasePrice] = useState(part.purchasePrice);
  const [retailPrice, setRetailPrice] = useState(part.retailPrice);
  const [stock, setStock] = useState(part.stock);
  const [condition, setCondition] = useState(part.condition);

  // Taxonomy state
  const [category, setCategory] = useState(part.category);
  const [subcategory, setSubcategory] = useState(part.subcategory);
  const [nestedSubcategory, setNestedSubcategory] = useState(part.nestedSubcategory);

  // Custom entry mode toggles
  const [customCategory, setCustomCategory] = useState(!["Parts", "Accessories", "Additives"].includes(part.category));
  const [customSubcategory, setCustomSubcategory] = useState(
    part.category ? (!SUBCATEGORY_MAP[part.category]?.includes(part.subcategory)) : false
  );
  const [customNested, setCustomNested] = useState(
    part.subcategory && NESTED_SUBCATEGORY_MAP[part.subcategory] 
      ? (!NESTED_SUBCATEGORY_MAP[part.subcategory].includes(part.nestedSubcategory) && part.nestedSubcategory !== "") 
      : false
  );

  // Bike compatibility state
  const [isUniversal, setIsUniversal] = useState(part.compatibleBikes.includes("Universal"));
  const [selectedBikeSlugs, setSelectedBikeSlugs] = useState<string[]>(
    part.compatibleBikes.filter((s) => s !== "Universal")
  );
  const [bikeSearch, setBikeSearch] = useState("");

  const subcategoryOptions = SUBCATEGORY_MAP[category] ?? ["General"];
  const nestedOptions = NESTED_SUBCATEGORY_MAP[subcategory] ?? [];

  const filteredBikes = useMemo(() => {
    if (!bikeSearch) return bikes;
    const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, "");
    const q = normalize(bikeSearch);
    return bikes.filter((b) => {
      const matchBrand = normalize(b.brand);
      const matchModel = normalize(b.model);
      const matchFull = normalize(`${b.brand}${b.model}`);
      return matchBrand.includes(q) || matchModel.includes(q) || matchFull.includes(q);
    });
  }, [bikeSearch]);

  const groupedBikes = useMemo(() => {
    const groups: Record<string, typeof bikes> = {};
    filteredBikes.forEach((b) => {
      if (!groups[b.brand]) groups[b.brand] = [];
      groups[b.brand].push(b);
    });
    return groups;
  }, [filteredBikes]);

  const toggleBike = (slug: string) => {
    setSelectedBikeSlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  async function handleSave() {
    const compatibleBikes = isUniversal ? ["Universal"] : selectedBikeSlugs;

    if (!isUniversal && selectedBikeSlugs.length === 0) {
      setError("Please select at least one compatible bike, or mark the part as Universal.");
      return;
    }

    setSaving(true);
    setError(null);

    const res = await updatePart(part.id, {
      name,
      sku,
      imageUrl,
      purchasePrice,
      retailPrice,
      stock,
      category,
      subcategory,
      nestedSubcategory: nestedSubcategory || undefined,
      condition,
      compatibleBikes,
    });

    setSaving(false);

    if (!res.success) {
      setError(res.error || "Failed to update part.");
      return;
    }

    router.push("/admin/marketplace/parts");
  }

  return (
    <div className="p-8 max-w-4xl mx-auto pb-24">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin/marketplace/parts" className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h2 className="text-2xl font-black flex items-center gap-2">
            Edit Part
            <span className="text-sm font-normal text-slate-500 bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
              Editing
            </span>
          </h2>
          <p className="text-slate-500 text-sm mt-1">Update part details, compatibility, and inventory.</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-700 border border-red-200 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-sm">Error</p>
            <p className="text-sm mt-0.5">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="ml-auto"><X size={16} /></button>
        </div>
      )}

      <div className="space-y-8">
        {/* ─── Section 1: Core Info ─── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 border-l-2 border-slate-900 pl-3 mb-5">
            Core Information
          </h3>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Part Name *</label>
              <input
                value={name} onChange={(e) => setName(e.target.value)}
                type="text"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">SKU Number *</label>
              <input
                value={sku} onChange={(e) => setSku(e.target.value)}
                type="text"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-mono uppercase outline-none transition-all focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 focus:bg-white"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Product Image URL</label>
              <input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                type="url"
                placeholder="/parts/engine-oil.webp or https://..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 focus:bg-white"
              />
              <p className="mt-1 text-[10px] text-slate-400">
                This image is used on the marketplace product card and in the admin inventory list.
              </p>
            </div>
          </div>
        </div>

        {/* ─── Section 2: Classification ─── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 border-l-2 border-slate-900 pl-3 mb-5">
            Classification & Taxonomy
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Category */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Category *</label>
              {customCategory ? (
                <div className="flex gap-1.5">
                  <input
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    type="text"
                    placeholder="Enter custom category"
                    autoFocus
                    className="flex-1 rounded-xl border border-blue-300 bg-blue-50/30 px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setCustomCategory(false);
                      setCategory("Parts");
                    }}
                    className="shrink-0 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                    title="Back to presets"
                  >
                    ← List
                  </button>
                </div>
              ) : (
                <select
                  value={category}
                  onChange={(e) => {
                    if (e.target.value === "__add_new__") {
                      setCustomCategory(true);
                      setCategory("");
                      return;
                    }
                    setCategory(e.target.value);
                    setCustomSubcategory(false);
                    setSubcategory(SUBCATEGORY_MAP[e.target.value]?.[0] ?? "General");
                    setNestedSubcategory("");
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 focus:bg-white"
                >
                  <option value="Parts">Parts</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Additives">Additives</option>
                  <option value="__add_new__" className="text-blue-600">+ Add New Category</option>
                </select>
              )}
            </div>

            {/* Subcategory */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Subcategory *</label>
              {customSubcategory ? (
                <div className="flex gap-1.5">
                  <input
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    type="text"
                    placeholder="Enter custom subcategory"
                    autoFocus
                    className="flex-1 rounded-xl border border-blue-300 bg-blue-50/30 px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setCustomSubcategory(false);
                      setSubcategory(subcategoryOptions[0] ?? "General");
                    }}
                    className="shrink-0 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                    title="Back to presets"
                  >
                    ← List
                  </button>
                </div>
              ) : (
                <select
                  value={subcategory}
                  onChange={(e) => {
                    if (e.target.value === "__add_new__") {
                      setCustomSubcategory(true);
                      setSubcategory("");
                      return;
                    }
                    setSubcategory(e.target.value);
                    setCustomNested(false);
                    setNestedSubcategory("");
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 focus:bg-white"
                >
                  {subcategoryOptions.map((sub) => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                  <option value="__add_new__" className="text-blue-600">+ Add New Subcategory</option>
                </select>
              )}
            </div>

            {/* Nested Subcategory */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Nested Subcategory</label>
              {customNested ? (
                <div className="flex gap-1.5">
                  <input
                    value={nestedSubcategory}
                    onChange={(e) => setNestedSubcategory(e.target.value)}
                    type="text"
                    placeholder="Enter custom nested sub"
                    autoFocus
                    className="flex-1 rounded-xl border border-blue-300 bg-blue-50/30 px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setCustomNested(false);
                      setNestedSubcategory("");
                    }}
                    className="shrink-0 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                    title="Back to presets"
                  >
                    ← List
                  </button>
                </div>
              ) : nestedOptions.length > 0 ? (
                <select
                  value={nestedSubcategory}
                  onChange={(e) => {
                    if (e.target.value === "__add_new__") {
                      setCustomNested(true);
                      setNestedSubcategory("");
                      return;
                    }
                    setNestedSubcategory(e.target.value);
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 focus:bg-white"
                >
                  <option value="">None</option>
                  {nestedOptions.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                  <option value="__add_new__" className="text-blue-600">+ Add New</option>
                </select>
              ) : (
                <input
                  value={nestedSubcategory}
                  onChange={(e) => setNestedSubcategory(e.target.value)}
                  type="text"
                  placeholder="Optional"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 focus:bg-white"
                />
              )}
            </div>
          </div>
        </div>

        {/* ─── Section 3: Bike Compatibility ─── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 border-l-2 border-emerald-500 pl-3 mb-2">
            Bike Compatibility Engine
          </h3>
          <p className="text-xs text-slate-400 mb-5 pl-5">
            This powers the &quot;Find the right part for YOUR bike&quot; feature on the marketplace.
          </p>

          <div className="mb-5">
            <button
              type="button"
              onClick={() => {
                setIsUniversal(!isUniversal);
                if (!isUniversal) setSelectedBikeSlugs([]);
              }}
              className={`flex items-center gap-3 rounded-xl border-2 px-5 py-3.5 w-full text-left transition-all ${
                isUniversal
                  ? "border-emerald-400 bg-emerald-50"
                  : "border-slate-200 bg-slate-50 hover:border-slate-300"
              }`}
            >
              <div className={`flex h-6 w-6 items-center justify-center rounded-full transition-all ${
                isUniversal ? "bg-emerald-500" : "bg-slate-200"
              }`}>
                {isUniversal && <CheckCircle2 className="h-4 w-4 text-white" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-900">Universal Fit</p>
                <p className="text-[11px] text-slate-500">This part works with all bikes</p>
              </div>
              <Wrench className={`h-5 w-5 ${isUniversal ? "text-emerald-500" : "text-slate-300"}`} />
            </button>
          </div>

          {!isUniversal && (
            <div className="space-y-4">
              {selectedBikeSlugs.length > 0 && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                    Selected ({selectedBikeSlugs.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedBikeSlugs.map((slug) => {
                      const bike = bikes.find((b) => b.slug === slug);
                      return (
                        <span key={slug} className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                          <BikeIcon className="h-3 w-3" />
                          {bike ? `${bike.brand} ${bike.model}` : slug}
                          <button type="button" onClick={() => toggleBike(slug)} className="ml-0.5 hover:text-red-500 transition-colors">
                            <X size={12} />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text" value={bikeSearch} onChange={(e) => setBikeSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                    }
                  }}
                  placeholder="Search bikes..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 focus:bg-white"
                />
              </div>

              <div className="max-h-[320px] overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/50">
                {Object.entries(groupedBikes).map(([brand, brandBikes]) => (
                  <div key={brand}>
                    <p className="sticky top-0 bg-slate-100/90 px-4 py-2 text-[9px] font-black uppercase tracking-widest text-slate-400 backdrop-blur-sm border-b border-slate-200/50">
                      {brand}
                    </p>
                    {brandBikes.map((bike) => {
                      const isSelected = selectedBikeSlugs.includes(bike.slug);
                      return (
                        <button
                          key={bike.slug} type="button"
                          onClick={() => toggleBike(bike.slug)}
                          className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors border-b border-slate-100/50 ${
                            isSelected ? "bg-emerald-50" : "hover:bg-white"
                          }`}
                        >
                          <div className={`flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all ${
                            isSelected ? "border-emerald-500 bg-emerald-500" : "border-slate-300 bg-white"
                          }`}>
                            {isSelected && <CheckCircle2 className="h-3 w-3 text-white" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-slate-800">{bike.model}</p>
                            <p className="text-[10px] text-slate-400">
                              {bike.powertrain} • {bike.displacementCc ? `${bike.displacementCc}cc` : `${bike.motorPowerKw}kW`} • {bike.category}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <button type="button" onClick={() => setSelectedBikeSlugs(bikes.map((b) => b.slug))} className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">
                  Select All
                </button>
                <span className="text-slate-300">•</span>
                <button type="button" onClick={() => setSelectedBikeSlugs([])} className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">
                  Clear All
                </button>
              </div>
            </div>
          )}

        </div>

        {/* ─── Section 4: Pricing & Stock ─── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 border-l-2 border-slate-900 pl-3 mb-5">
            Pricing & Inventory
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Purchase Price</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">৳</span>
                <input
                  value={purchasePrice} onChange={(e) => setPurchasePrice(Number(e.target.value))}
                  type="number" step="0.01" min="0"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-4 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 focus:bg-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Retail Price *</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">৳</span>
                <input
                  value={retailPrice} onChange={(e) => setRetailPrice(Number(e.target.value))}
                  type="number" step="0.01" min="0"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-4 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 focus:bg-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Stock Quantity *</label>
              <input
                value={stock} onChange={(e) => setStock(Number(e.target.value))}
                type="number" min="0"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Condition *</label>
              <select
                value={condition} onChange={(e) => setCondition(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 focus:bg-white"
              >
                <option value="New">New</option>
                <option value="Refurbished">Refurbished</option>
                <option value="Used">Used</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-2">
          <Link
            href="/admin/marketplace/parts"
            className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-sm transition-colors"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="bg-slate-900 hover:bg-slate-700 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 font-bold text-sm disabled:opacity-50 transition-colors shadow-lg shadow-slate-900/10"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {saving ? "Saving..." : "Update Part"}
          </button>
        </div>
      </div>
    </div>
  );
}
