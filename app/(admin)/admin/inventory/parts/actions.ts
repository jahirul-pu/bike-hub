"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const PartSchema = z.object({
  name: z.string().min(2, "Name is required"),
  sku: z.string().min(3, "SKU is required"),
  purchasePrice: z.number().min(0),
  retailPrice: z.number().min(0),
  stock: z.number().int().min(0),
  category: z.string().default("Parts"),
  subcategory: z.string().default("General"),
  nestedSubcategory: z.string().optional(),
  condition: z.string().default("New"),
  fitment: z.string().default("Universal"),
  compatibleBikes: z.array(z.string()).default(["Universal"]),
});

export async function createPart(data: z.infer<typeof PartSchema>) {
  try {
    const parsed = PartSchema.parse(data);

    await db.part.create({
      data: {
        name: parsed.name,
        sku: parsed.sku,
        price: parsed.purchasePrice,
        retailPrice: parsed.retailPrice,
        stock: parsed.stock,
        category: parsed.category,
        subcategory: parsed.subcategory,
        nestedSubcategory: parsed.nestedSubcategory,
        condition: parsed.condition,
        fitment: parsed.fitment,
        compatibleBikes: JSON.stringify(parsed.compatibleBikes),
      },
    });

    revalidatePath("/admin/inventory/parts");
    return { success: true };
  } catch (error: any) {
    console.error("Database Error:", error);
    
    // Safely extract error string for diagnostic UI display
    let errorMessage = "Failed to create part";
    if (error instanceof z.ZodError) {
      errorMessage = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
    } else if (error?.message) {
      errorMessage = error.message;
    }
    
    return { success: false, error: errorMessage };
  }
}
