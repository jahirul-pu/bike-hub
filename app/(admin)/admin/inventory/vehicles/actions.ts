"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import * as z from "zod";

const vehicleSchema = z.discriminatedUnion("powerSource", [
  z.object({
    powerSource: z.literal("ICE"),
    make: z.string().min(1),
    model: z.string().min(1),
    year: z.coerce.number().int().min(1900).max(new Date().getFullYear() + 1),
    vin: z.string().min(1),
    askingPrice: z.coerce.number().min(0),
    condition: z.enum(["Mint", "Good", "Fair", "Poor"]),
    description: z.string().optional(),
    engineDisplacement: z.coerce.number().min(50),
    fuelSystem: z.enum(["Carburetor", "FI"]),
    transmission: z.enum(["Manual", "Automatic"]),
  }),
  z.object({
    powerSource: z.literal("EV"),
    make: z.string().min(1),
    model: z.string().min(1),
    year: z.coerce.number().int().min(1900).max(new Date().getFullYear() + 1),
    vin: z.string().min(1),
    askingPrice: z.coerce.number().min(0),
    condition: z.enum(["Mint", "Good", "Fair", "Poor"]),
    description: z.string().optional(),
    batteryCapacity: z.coerce.number().min(0.1),
    maxRangeKm: z.coerce.number().min(1),
    motorPowerKw: z.coerce.number().min(0.1),
  }),
]);

export async function createVehicle(data: unknown) {
  const parsed = vehicleSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: "Validation failed", details: parsed.error.flatten() };
  }

  try {
    const payload: any = {
      make: parsed.data.make,
      model: parsed.data.model,
      year: parsed.data.year,
      vin: parsed.data.vin,
      askingPrice: parsed.data.askingPrice,
      condition: parsed.data.condition,
      description: parsed.data.description ?? null,
      powerSource: parsed.data.powerSource,
      certificationStatus: "PENDING_APPROVAL",
    };

    if (parsed.data.powerSource === "ICE") {
      payload.engineDisplacement = parsed.data.engineDisplacement;
      payload.fuelSystem = parsed.data.fuelSystem;
      payload.transmission = parsed.data.transmission;
    } else {
      payload.batteryCapacity = parsed.data.batteryCapacity;
      payload.maxRangeKm = parsed.data.maxRangeKm;
      payload.motorPowerKw = parsed.data.motorPowerKw;
    }

    await db.vehicle.create({ data: payload });
    revalidatePath("/admin/inventory/vehicles");
    return { success: true };
  } catch (error) {
    console.error("createVehicle error:", error);
    return { success: false, error: "Failed to create vehicle" };
  }
}
