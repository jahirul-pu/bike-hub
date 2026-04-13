"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import type { Path } from "react-hook-form";
import * as z from "zod";
import { X, Plus } from "lucide-react";
import { createPart } from "@/app/(admin)/admin/inventory/parts/actions";

const formSchema = z.object({
  name: z.string().min(2),
  sku: z.string().min(3),
  purchasePrice: z.coerce.number(),
  retailPrice: z.coerce.number(),
  stock: z.coerce.number(),
});

export default function AddPartForm({ onSuccess }: { onSuccess: () => void }) {
  const [fitmentTags, setFitmentTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const { register, handleSubmit, reset, setError, formState: { errors, isSubmitting } } = useForm<z.infer<typeof formSchema>>();

  const addTag = () => {
    if (tagInput && !fitmentTags.includes(tagInput)) {
      setFitmentTags([...fitmentTags, tagInput]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFitmentTags(fitmentTags.filter(t => t !== tagToRemove));
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Client-side Zod validation before calling the server action
    const parsed = formSchema.safeParse(values);
    if (!parsed.success) {
      const flat = parsed.error.flatten();
      for (const [key, msgs] of Object.entries(flat.fieldErrors)) {
        if (msgs && msgs.length) {
          // set error on the corresponding field
          setError(key as Path<z.infer<typeof formSchema>>, { type: "manual", message: msgs[0] ?? "" });
        }
      }
      return;
    }

    const result = await createPart({ ...parsed.data, fitment: fitmentTags });
    if (result.success) {
      reset();
      setFitmentTags([]);
      onSuccess();
    } else {
      alert(result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-6 bg-white rounded-xl">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Part Name</label>
          <input {...register("name")} className="w-full border p-2 rounded-md" placeholder="e.g. Motowolf Phone Mount" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">SKU</label>
          <input {...register("sku")} className="w-full border p-2 rounded-md" placeholder="MW-PH-001" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium">Purchase Price</label>
          <input type="number" {...register("purchasePrice")} className="w-full border p-2 rounded-md" />
        </div>
        <div>
          <label className="text-sm font-medium">Retail Price</label>
          <input type="number" {...register("retailPrice")} className="w-full border p-2 rounded-md" />
        </div>
        <div>
          <label className="text-sm font-medium">Stock</label>
          <input type="number" {...register("stock")} className="w-full border p-2 rounded-md" />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-blue-600">Fitment (Bike Models)</label>
        <div className="flex gap-2 mb-2 flex-wrap">
          {fitmentTags.map(tag => (
            <span key={tag} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs flex items-center gap-2">
              {tag} <X size={12} className="cursor-pointer" onClick={() => removeTag(tag)} />
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input 
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            className="flex-1 border p-2 rounded-md" 
            placeholder="Add model (e.g. R15 V4)"
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); }}}
          />
          <button type="button" onClick={addTag} className="bg-slate-100 p-2 rounded-md"><Plus size={20} /></button>
        </div>
      </div>

      <button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:bg-slate-400"
      >
        {isSubmitting ? "Saving..." : "Save to Inventory"}
      </button>
    </form>
  );
}
