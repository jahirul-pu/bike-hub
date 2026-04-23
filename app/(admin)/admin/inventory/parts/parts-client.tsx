"use client";

import Image from "next/image";
import Link from "next/link";
import { useDeferredValue, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, BikeIcon, Check, CheckCircle2, Loader2, Minus, Package, Plus, Trash2, Wrench } from "lucide-react";
import { deletePart, updatePartStock } from "./actions";
import { bikes } from "@/lib/bikes-data";

export type InventoryPart = {
  id: string;
  name: string;
  sku: string;
  imageUrl: string | null;
  category: string;
  subcategory: string;
  nestedSubcategory: string | null;
  condition: string;
  compatibleBikes: string | null;
  stock: number;
  retailPrice: number | null;
  price: number | null;
};

type PartsInventoryTableProps = {
  parts: InventoryPart[];
  categoryEntries: Array<[string, number]>;
  initialCategory: string | null;
  initialQuery: string;
};

export function DeletePartButton({ partId, partName }: { partId: string; partName: string }) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (confirming) {
    return (
      <div className="flex items-center gap-1.5">
        <button
          disabled={isPending}
          onClick={() => {
            startTransition(async () => {
              const res = await deletePart(partId);
              if (res.success) {
                router.refresh();
              } else {
                alert(res.error);
              }
              setConfirming(false);
            });
          }}
          className="px-2.5 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-1"
        >
          {isPending ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
          Confirm
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="px-3 py-1.5 rounded-lg border border-red-200 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
      title={`Delete ${partName}`}
    >
      Delete
    </button>
  );
}

export function QuickStockEditor({ partId, currentStock }: { partId: string; currentStock: number }) {
  const [editing, setEditing] = useState(false);
  const [stock, setStock] = useState(currentStock);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const save = () => {
    if (stock === currentStock) {
      setEditing(false);
      return;
    }
    startTransition(async () => {
      const res = await updatePartStock(partId, stock);
      if (res.success) {
        router.refresh();
      } else {
        alert(res.error);
        setStock(currentStock);
      }
      setEditing(false);
    });
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => setStock(Math.max(0, stock - 1))}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
        >
          <Minus size={12} />
        </button>
        <input
          type="number"
          value={stock}
          onChange={(e) => setStock(Math.max(0, parseInt(e.target.value) || 0))}
          className="w-14 h-7 rounded-lg border border-slate-200 px-2 text-center text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape") { setStock(currentStock); setEditing(false); }
          }}
          autoFocus
        />
        <button
          type="button"
          onClick={() => setStock(stock + 1)}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
        >
          <Plus size={12} />
        </button>
        <button
          type="button"
          onClick={save}
          disabled={isPending}
          className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-50"
        >
          {isPending ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className={`font-bold text-sm tabular-nums cursor-pointer px-2 py-1 rounded-lg transition-colors hover:bg-slate-100 ${
        currentStock === 0
          ? "text-red-600"
          : currentStock < 10
            ? "text-amber-600"
            : "text-slate-900"
      }`}
      title="Click to edit stock"
    >
      {currentStock}
    </button>
  );
}

export function PartsInventoryTable({
  parts,
  categoryEntries,
  initialCategory,
  initialQuery,
}: PartsInventoryTableProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory);
  const [query, setQuery] = useState(initialQuery);
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());

  const syncUrl = (nextCategory: string | null, nextQuery: string) => {
    const params = new URLSearchParams();
    const trimmedQuery = nextQuery.trim();

    if (nextCategory) {
      params.set("category", nextCategory);
    }

    if (trimmedQuery) {
      params.set("query", trimmedQuery);
    }

    const nextUrl = params.size > 0 ? `/admin/inventory/parts?${params.toString()}` : "/admin/inventory/parts";
    window.history.replaceState(null, "", nextUrl);
  };

  const visibleParts = parts.filter((part) => {
    if (selectedCategory && part.category !== selectedCategory) {
      return false;
    }

    if (!deferredQuery) {
      return true;
    }

    const searchHaystack = [
      part.name,
      part.sku,
      part.category,
      part.subcategory,
      part.nestedSubcategory,
      part.condition,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchHaystack.includes(deferredQuery);
  });

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-6">
        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 self-center mr-1">By Category:</span>
        <button
          type="button"
          onClick={() => {
            setSelectedCategory(null);
            syncUrl(null, query);
          }}
          className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors ${
            selectedCategory === null
              ? "border-slate-900 bg-slate-900 text-white shadow-lg shadow-slate-900/10"
              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
          }`}
        >
          All
          <span
            className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-black ${
              selectedCategory === null ? "bg-white/15 text-white" : "bg-slate-100 text-slate-500"
            }`}
          >
            {parts.length}
          </span>
        </button>
        {categoryEntries.map(([cat, count]) => {
          const isActive = selectedCategory === cat;

          return (
            <button
              key={cat}
              type="button"
              aria-pressed={isActive}
              onClick={() => {
                const nextCategory = isActive ? null : cat;
                setSelectedCategory(nextCategory);
                syncUrl(nextCategory, query);
              }}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors ${
                isActive
                  ? "border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-600/15"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              {cat}
              <span
                className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-black ${
                  isActive ? "bg-white/15 text-white" : "bg-slate-100 text-slate-500"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          name="query"
          value={query}
          onChange={(event) => {
            const nextQuery = event.target.value;
            setQuery(nextQuery);
            syncUrl(selectedCategory, nextQuery);
          }}
          placeholder="Search by part name, SKU, or category"
          className="h-11 flex-1 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
        />
        {(query || selectedCategory) ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setSelectedCategory(null);
              syncUrl(null, "");
            }}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50"
          >
            Clear
          </button>
        ) : null}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/80 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-500">Part Name</th>
                <th className="px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-500">SKU</th>
                <th className="px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-500">Category</th>
                <th className="px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-500">Compatibility</th>
                <th className="px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-500">Stock</th>
                <th className="px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-500">Price</th>
                <th className="px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-500">Status</th>
                <th className="px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleParts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-16 text-center">
                    <Package className="mx-auto h-10 w-10 text-slate-300" />
                    <p className="mt-3 text-sm font-bold text-slate-500">No matching parts found</p>
                    <p className="text-xs text-slate-400 mt-1">Try another search term or clear the active filter.</p>
                  </td>
                </tr>
              ) : (
                visibleParts.map((part) => {
                  const compatibleBikes: string[] = part.compatibleBikes
                    ? JSON.parse(part.compatibleBikes)
                    : ["Universal"];
                  const isUniversal = compatibleBikes.includes("Universal");
                  const price = part.retailPrice ?? part.price ?? 0;
                  const stockStatus = part.stock === 0
                    ? "out"
                    : part.stock < 10
                      ? "low"
                      : "ok";

                  return (
                    <tr key={part.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                            {part.imageUrl ? (
                              <Image
                                src={part.imageUrl}
                                alt={part.name}
                                fill
                                unoptimized
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[9px] font-bold uppercase tracking-widest text-slate-400">
                                No Image
                              </div>
                            )}
                          </div>
                          <p className="font-bold text-slate-900 text-sm">{part.name}</p>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{part.name}</p>
                            <div className="mt-1 flex items-center gap-1.5">
                              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                part.condition === "New"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : part.condition === "Refurbished"
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-slate-100 text-slate-600"
                              }`}>
                                {part.condition}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <code className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{part.sku}</code>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-sm font-medium text-slate-700">{part.category}</p>
                        <p className="text-[10px] text-slate-400">
                          {part.subcategory}
                          {part.nestedSubcategory ? ` > ${part.nestedSubcategory}` : ""}
                        </p>
                      </td>
                      <td className="px-5 py-3.5">
                        {isUniversal ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500">
                            <Wrench className="h-3 w-3" />
                            Universal
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {compatibleBikes.slice(0, 3).map((slug) => {
                              const bike = bikes.find((entry) => entry.slug === slug);

                              return (
                                <span key={slug} className="inline-flex items-center gap-1 rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-700">
                                  <BikeIcon className="h-2.5 w-2.5" />
                                  {bike ? `${bike.brand} ${bike.model}` : slug}
                                </span>
                              );
                            })}
                            {compatibleBikes.length > 3 ? (
                              <span className="inline-flex items-center rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-400">
                                +{compatibleBikes.length - 3}
                              </span>
                            ) : null}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <QuickStockEditor partId={part.id} currentStock={part.stock} />
                      </td>
                      <td className="px-5 py-3.5 font-bold text-slate-900 text-sm">
                        ৳{price.toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5">
                        {stockStatus === "ok" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                            <CheckCircle2 className="h-3 w-3" /> In Stock
                          </span>
                        ) : null}
                        {stockStatus === "low" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold text-amber-700">
                            <AlertTriangle className="h-3 w-3" /> Low Stock
                          </span>
                        ) : null}
                        {stockStatus === "out" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-[10px] font-bold text-red-700">
                            <AlertTriangle className="h-3 w-3" /> Out of Stock
                          </span>
                        ) : null}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link
                            href={`/admin/inventory/parts/${part.id}/edit`}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                          >
                            Edit
                          </Link>
                          <DeletePartButton partId={part.id} partName={part.name} />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
