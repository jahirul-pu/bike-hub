"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const PartSchema = z.object({
  name: z.string().min(2, "Name is required"),
  sku: z.string().min(3, "SKU is required"),
  brand: z.string().min(2, "Brand is required"),
  purchasePrice: z.number().min(0),
  retailPrice: z.number().min(0),
  stock: z.number().int().min(0),
  fitment: z.array(z.string()),
});

export async function createPart(data: z.infer<typeof PartSchema>) {
  try {
    await db.part.create({
      data: {
        name: data.name,
        sku: data.sku,
        brand: data.brand,
        purchasePrice: data.purchasePrice,
        retailPrice: data.retailPrice,
        stock: data.stock,
        fitment: data.fitment,
      },
    });

    revalidatePath("/admin/inventory/parts");
    return { success: true };
  } catch (error) {
    console.error("Database Error:", error);
    return { success: false, error: "Failed to create part" };
  }
}
