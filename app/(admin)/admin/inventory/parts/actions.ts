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
    revalidatePath("/marketplace");
    return { success: true };
  } catch (error: any) {
    console.error("Database Error:", error);
    
    let errorMessage = "Failed to create part";
    if (error instanceof z.ZodError) {
      errorMessage = error.issues.map((e: z.ZodIssue) => `${e.path.join('.')}: ${e.message}`).join(', ');
    } else if (error?.message) {
      errorMessage = error.message;
    }
    
    return { success: false, error: errorMessage };
  }
}

export async function updatePart(id: string, data: z.infer<typeof PartSchema>) {
  try {
    const parsed = PartSchema.parse(data);

    await db.part.update({
      where: { id },
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
    revalidatePath("/marketplace");
    return { success: true };
  } catch (error: any) {
    console.error("Database Error:", error);

    let errorMessage = "Failed to update part";
    if (error instanceof z.ZodError) {
      errorMessage = error.issues.map((e: z.ZodIssue) => `${e.path.join('.')}: ${e.message}`).join(', ');
    } else if (error?.message) {
      errorMessage = error.message;
    }

    return { success: false, error: errorMessage };
  }
}

export async function deletePart(id: string) {
  try {
    await db.part.delete({ where: { id } });
    revalidatePath("/admin/inventory/parts");
    revalidatePath("/marketplace");
    return { success: true };
  } catch (error: any) {
    console.error("Database Error:", error);
    return { success: false, error: error?.message ?? "Failed to delete part" };
  }
}

export async function updatePartStock(id: string, stock: number) {
  try {
    await db.part.update({
      where: { id },
      data: { stock },
    });
    revalidatePath("/admin/inventory/parts");
    revalidatePath("/marketplace");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message ?? "Failed to update stock" };
  }
}
