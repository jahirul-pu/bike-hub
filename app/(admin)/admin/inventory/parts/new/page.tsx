"use client";

import { useFormStatus } from "react-dom";
import { createPart } from "../actions";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Save } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner"; // If sonner is used, or basic alert

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 font-medium disabled:opacity-50 transition-colors"
    >
      <Save size={18} />
      {pending ? "Saving..." : "Save Part"}
    </button>
  );
}

export default function AddPartPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function action(formData: FormData) {
    const rawBikes = formData.get("compatibleBikes") as string;
    const compatibleBikes = rawBikes
      ? rawBikes.split(",").map((s) => s.trim()).filter((s) => s.length > 0)
      : ["Universal"];

    const data = {
      name: formData.get("name") as string,
      sku: formData.get("sku") as string,
      purchasePrice: Number(formData.get("purchasePrice")),
      retailPrice: Number(formData.get("retailPrice")),
      stock: Number(formData.get("stock")),
      category: formData.get("category") as string,
      subcategory: formData.get("subcategory") as string,
      nestedSubcategory: (formData.get("nestedSubcategory") as string) || undefined,
      condition: formData.get("condition") as string,
      fitment: formData.get("fitment") as string,
      compatibleBikes,
    };

    const res = await createPart(data);
    if (!res.success) {
      setError(res.error || "Failed to create part.");
      return;
    }
    
    router.push("/admin/inventory/parts");
  }

  return (
    <div className="p-8 max-w-4xl mx-auto pb-24">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin/inventory/parts" className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            Add New Part <span className="text-sm font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">Catalog Entry</span>
          </h2>
          <p className="text-slate-500 text-sm mt-1">Fill out the details to add a new component, fluid, or accessory to the marketplace.</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-700 border border-red-200">
          {error}
        </div>
      )}

      <form action={action} className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm">
        
        {/* Core Info */}
        <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4">Core Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Part Name *</label>
            <input required name="name" type="text" placeholder="e.g. Chain & Sprocket Kit" className="w-full rounded-lg border-slate-300 border px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">SKU Number *</label>
            <input required name="sku" type="text" placeholder="e.g. MOTO-CS-150" className="w-full rounded-lg border-slate-300 border px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 uppercase" />
          </div>
        </div>

        {/* Categories */}
        <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4 mt-8">Classification & Taxonomy</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Category *</label>
            <select name="category" className="w-full rounded-lg border-slate-300 border px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
              <option value="Parts">Parts</option>
              <option value="Accessories">Accessories</option>
              <option value="Additives">Additives</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Subcategory *</label>
            <input required name="subcategory" type="text" placeholder="e.g. Drivetrain" className="w-full rounded-lg border-slate-300 border px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Nested Subcategory</label>
            <input name="nestedSubcategory" type="text" placeholder="e.g. Chain & Sprocket (Optional)" className="w-full rounded-lg border-slate-300 border px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
          </div>
        </div>

        {/* Fitment & Compatibility */}
        <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4 mt-8 flex items-center gap-2">
          Fitment & Compatibility Engine
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Universal Fitment Note</label>
            <input required name="fitment" type="text" defaultValue="Universal" placeholder="e.g. 150cc - 200cc street bikes" className="w-full rounded-lg border-slate-300 border px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
            <p className="text-xs text-slate-500 mt-1">General fitment description (shown on cards).</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Target Bike Slugs (Frontend Filter)</label>
            <input name="compatibleBikes" type="text" defaultValue="Universal" placeholder="yamaha-r15-v4, mt-15-v2" className="w-full rounded-lg border-slate-300 border px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono text-sm" />
            <p className="text-xs text-slate-500 mt-1">Comma-separated slugs to power the 'Bike-Based Entry' feature. Leave 'Universal' if it fits all models.</p>
          </div>
        </div>

        {/* Pricing & Stock */}
        <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4 mt-8">Pricing & Inventory</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Purchase Price</label>
            <input required name="purchasePrice" type="number" step="0.01" min="0" placeholder="0.00" className="w-full rounded-lg border-slate-300 border px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Retail Price (BDT) *</label>
            <input required name="retailPrice" type="number" step="0.01" min="0" placeholder="0.00" className="w-full rounded-lg border-slate-300 border px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Stock Quantity *</label>
            <input required name="stock" type="number" min="0" defaultValue="0" className="w-full rounded-lg border-slate-300 border px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Condition *</label>
            <select name="condition" className="w-full rounded-lg border-slate-300 border px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
              <option value="New">New</option>
              <option value="Refurbished">Refurbished</option>
              <option value="Used">Used</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100 mt-8 gap-3">
          <Link href="/admin/inventory/parts" className="px-6 py-2.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium transition-colors">
            Cancel
          </Link>
          <SubmitButton />
        </div>
      </form>
    </div>
  );
}
