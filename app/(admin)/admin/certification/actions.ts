"use server";

import { db } from "@/lib/db";
import * as z from "zod";
import { revalidatePath } from "next/cache";

const pointSchema = z.object({
  status: z.enum(["Pass", "Warning", "Fail"]),
  note: z.string().optional().nullable(),
});

const icePowerCore = z.object({
  engineOil: pointSchema,
  sparkPlug: pointSchema,
  clutchPlay: pointSchema,
  exhaust: pointSchema,
});

const evPowerCore = z.object({
  batterySoh: pointSchema,
  bmsStatus: pointSchema,
  chargingPort: pointSchema,
  motorController: pointSchema,
});

const inspectionBase = z.object({
  vehicleId: z.string().min(1),
  powerSource: z.enum(["ICE", "EV"]),
  points: z.record(pointSchema),
});

const inspectionSchema = z.discriminatedUnion("powerSource", [
  inspectionBase.extend({ powerSource: z.literal("ICE"), powerCore: icePowerCore }),
  inspectionBase.extend({ powerSource: z.literal("EV"), powerCore: evPowerCore }),
]);

export async function saveInspectionReport(data: unknown) {
  const parsed = inspectionSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: "Validation failed", details: parsed.error.flatten() };
  }

  // ensure exactly 50 points
  const pointCount = Object.keys(parsed.data.points ?? {}).length;
  if (pointCount !== 50) {
    return { success: false, error: `Expected 50 inspection points, received ${pointCount}` };
  }

  try {
    // store report as JSON in inspection table (assumes inspection table accepts JSON-like fields)
    await db.inspection.create({
      data: {
        vehicleId: parsed.data.vehicleId,
        report: parsed.data as any,
        status: "PENDING_APPROVAL",
      },
    });

    // set vehicle status to pending
    await db.vehicle.update({
      where: { id: parsed.data.vehicleId },
      data: { certificationStatus: "PENDING_APPROVAL" },
    });

    revalidatePath(`/admin/inventory/vehicles`);
    revalidatePath(`/admin/certification/${parsed.data.vehicleId}`);

    return { success: true };
  } catch (error) {
    console.error("saveInspectionReport error:", error);
    return { success: false, error: "Failed to save inspection report" };
  }
}
