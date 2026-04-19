import { db } from '@/lib/db';
import { Plus, Package, AlertTriangle, CheckCircle2, Wrench, BikeIcon } from 'lucide-react';
import * as React from 'react';
import Link from 'next/link';
import { bikes } from '@/lib/bikes-data';
import { DeletePartButton, QuickStockEditor } from './parts-client';

export default async function PartsPage() {
  const parts = await db.part.findMany({
    orderBy: { createdAt: 'desc' },
  });

  // Stats
  const totalParts = parts.length;
  const inStockCount = parts.filter(p => p.stock > 0).length;
  const lowStockCount = parts.filter(p => p.stock > 0 && p.stock < 10).length;
  const outOfStockCount = parts.filter(p => p.stock === 0).length;
  const totalValue = parts.reduce((sum, p) => sum + ((p.retailPrice ?? p.price ?? 0) as number) * p.stock, 0);

  // Category breakdown
  const categories = parts.reduce<Record<string, number>>((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-bold">Inventory</p>
          <h2 className="text-3xl font-black text-slate-900 mt-1">Parts Inventory</h2>
          <p className="text-slate-500 text-sm mt-1">
            Manage spare parts, accessories, and additives for the Smart Parts Discovery system.
          </p>
        </div>
        <Link
          href="/admin/inventory/parts/new"
          className="bg-slate-900 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-colors font-bold text-sm shadow-lg shadow-slate-900/10"
        >
          <Plus size={18} /> Add New Part
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Parts</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{totalParts}</p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">In Stock</p>
          <p className="text-2xl font-black text-emerald-700 mt-1">{inStockCount}</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600">Low Stock</p>
          <p className="text-2xl font-black text-amber-700 mt-1">{lowStockCount}</p>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50/50 p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-red-600">Out of Stock</p>
          <p className="text-2xl font-black text-red-700 mt-1">{outOfStockCount}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Inventory Value</p>
          <p className="text-2xl font-black text-slate-900 mt-1">৳{totalValue.toLocaleString()}</p>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 self-center mr-1">By Category:</span>
        {Object.entries(categories).map(([cat, count]) => (
          <span key={cat} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600">
            {cat}
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-100 px-1 text-[10px] font-black text-slate-500">
              {count}
            </span>
          </span>
        ))}
      </div>

      {/* Parts Table */}
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
              {parts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-16 text-center">
                    <Package className="mx-auto h-10 w-10 text-slate-300" />
                    <p className="mt-3 text-sm font-bold text-slate-500">No parts in inventory</p>
                    <p className="text-xs text-slate-400 mt-1">Add your first part to get started.</p>
                    <Link
                      href="/admin/inventory/parts/new"
                      className="mt-4 inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold"
                    >
                      <Plus size={16} /> Add First Part
                    </Link>
                  </td>
                </tr>
              ) : (
                parts.map((part) => {
                  const compatibleBikes: string[] = part.compatibleBikes
                    ? JSON.parse(part.compatibleBikes as string)
                    : ["Universal"];
                  const isUniversal = compatibleBikes.includes("Universal");
                  const price = (part.retailPrice ?? part.price ?? 0) as number;
                  const stockStatus = part.stock === 0
                    ? "out"
                    : part.stock < 10
                      ? "low"
                      : "ok";

                  return (
                    <tr key={part.id} className="group hover:bg-slate-50/50 transition-colors">
                      {/* Name + Condition */}
                      <td className="px-5 py-3.5">
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{part.name}</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                              part.condition === "New"
                                ? "bg-emerald-100 text-emerald-700"
                                : part.condition === "Refurbished"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-slate-100 text-slate-600"
                            }`}>
                              {part.condition}
                            </span>
                            <span className="text-[10px] text-slate-400">{part.fitment}</span>
                          </div>
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="px-5 py-3.5">
                        <code className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{part.sku}</code>
                      </td>

                      {/* Category */}
                      <td className="px-5 py-3.5">
                        <p className="text-sm font-medium text-slate-700">{part.category}</p>
                        <p className="text-[10px] text-slate-400">{part.subcategory}{part.nestedSubcategory ? ` > ${part.nestedSubcategory}` : ''}</p>
                      </td>

                      {/* Compatibility */}
                      <td className="px-5 py-3.5">
                        {isUniversal ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500">
                            <Wrench className="h-3 w-3" />
                            Universal
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {compatibleBikes.slice(0, 3).map((slug) => {
                              const bike = bikes.find(b => b.slug === slug);
                              return (
                                <span key={slug} className="inline-flex items-center gap-1 rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-700">
                                  <BikeIcon className="h-2.5 w-2.5" />
                                  {bike ? `${bike.brand} ${bike.model}` : slug}
                                </span>
                              );
                            })}
                            {compatibleBikes.length > 3 && (
                              <span className="inline-flex items-center rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-400">
                                +{compatibleBikes.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Stock — Inline editable */}
                      <td className="px-5 py-3.5">
                        <QuickStockEditor partId={part.id} currentStock={part.stock} />
                      </td>

                      {/* Price */}
                      <td className="px-5 py-3.5 font-bold text-slate-900 text-sm">
                        ৳{price.toLocaleString()}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5">
                        {stockStatus === "ok" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                            <CheckCircle2 className="h-3 w-3" /> In Stock
                          </span>
                        )}
                        {stockStatus === "low" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold text-amber-700">
                            <AlertTriangle className="h-3 w-3" /> Low Stock
                          </span>
                        )}
                        {stockStatus === "out" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-[10px] font-bold text-red-700">
                            <AlertTriangle className="h-3 w-3" /> Out of Stock
                          </span>
                        )}
                      </td>

                      {/* Actions */}
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
    </div>
  );
}
