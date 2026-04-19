import { db } from '@/lib/db';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { PartsInventoryTable } from './parts-client';

type PartsPageProps = {
  searchParams: Promise<{
    category?: string;
    query?: string;
  }>;
};

export default async function PartsPage({ searchParams }: PartsPageProps) {
  const resolvedSearchParams = await searchParams;
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
  const categoryEntries = Object.entries(categories).sort((a, b) => {
    if (b[1] !== a[1]) {
      return b[1] - a[1];
    }

    return a[0].localeCompare(b[0]);
  });
  const selectedCategory =
    typeof resolvedSearchParams.category === 'string' &&
    Object.hasOwn(categories, resolvedSearchParams.category)
      ? resolvedSearchParams.category
      : null;
  const searchQuery = typeof resolvedSearchParams.query === 'string' ? resolvedSearchParams.query.trim() : '';

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
      <PartsInventoryTable
        parts={parts}
        categoryEntries={categoryEntries}
        initialCategory={selectedCategory}
        initialQuery={searchQuery}
      />
    </div>
  );
}
