"use client";

import { useForm } from "react-hook-form";
import type { Path } from "react-hook-form";
import * as z from "zod";
import { createPart } from "@/app/(admin)/admin/inventory/parts/actions";

const formSchema = z.object({
  name: z.string().min(2),
  sku: z.string().min(3),
  purchasePrice: z.coerce.number(),
  retailPrice: z.coerce.number(),
  stock: z.coerce.number(),
});

export default function AddPartForm({ onSuccess }: { onSuccess: () => void }) {
  const { register, handleSubmit, reset, setError, formState: { isSubmitting } } = useForm<z.infer<typeof formSchema>>();

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

    const result = await createPart({ ...parsed.data });
    if (result.success) {
      reset();
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
