import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import EditPartForm from "./edit-form";

export default async function EditPartPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const part = await db.part.findUnique({ where: { id } });
  if (!part) notFound();

  // Parse compatible bikes from JSON string
  const compatibleBikes: string[] = part.compatibleBikes
    ? JSON.parse(part.compatibleBikes as string)
    : ["Universal"];

  return (
    <EditPartForm
      part={{
        id: part.id,
        name: part.name,
        sku: part.sku,
        imageUrl: part.imageUrl ?? "",
        purchasePrice: (part.price ?? 0) as number,
        retailPrice: (part.retailPrice ?? 0) as number,
        stock: part.stock,
        category: part.category,
        subcategory: part.subcategory,
        nestedSubcategory: part.nestedSubcategory ?? "",
        condition: part.condition,
        fitment: part.fitment,
        compatibleBikes,
      }}
    />
  );
}
