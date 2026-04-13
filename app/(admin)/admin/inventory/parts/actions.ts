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
  fitment: z.array(z.string()).optional(),
});

export async function createPart(data: z.infer<typeof PartSchema>) {
  try {
    const parsed = PartSchema.parse(data);

    await db.part.create({
      data: {
        name: parsed.name,
        sku: parsed.sku,
        // Persist purchase cost in the existing fallback price column.
        price: parsed.purchasePrice,
        retailPrice: parsed.retailPrice,
        stock: parsed.stock,
      },
    });

    revalidatePath("/admin/inventory/parts");
    return { success: true };
  } catch (error) {
    console.error("Database Error:", error);
    return { success: false, error: "Failed to create part" };
  }
}
