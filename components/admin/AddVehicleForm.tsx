"use client";

import * as React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Zap, Flame } from "lucide-react";
import { createVehicle } from "@/app/(admin)/admin/inventory/vehicles/actions";

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

type VehicleValues = z.infer<typeof vehicleSchema> & Record<string, any>;

export default function AddVehicleForm({ onSuccess }: { onSuccess?: () => void }) {
  const { register, handleSubmit, reset, setError, formState } = useForm<VehicleValues>({
    defaultValues: { powerSource: "ICE", year: new Date().getFullYear() },
  });

  const { errors, isSubmitting } = formState;
  const [message, setMessage] = useState<string | null>(null);

  const onSubmit = async (values: any) => {
    const parsed = vehicleSchema.safeParse(values);
    if (!parsed.success) {
      const flat = parsed.error.flatten();
      for (const [key, msgs] of Object.entries(flat.fieldErrors)) {
        if (msgs && msgs.length) setError(key as any, { type: "manual", message: msgs[0] } as any);
      }
      return;
    }

    const result = await createVehicle(parsed.data as any);
    if (result.success) {
      reset();
      setMessage("Vehicle registered successfully");
      if (onSuccess) onSuccess();
      setTimeout(() => setMessage(null), 4000);
    } else {
      setMessage(result.error || "Failed to register vehicle");
      setTimeout(() => setMessage(null), 4000);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-6 bg-white rounded-xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Make</label>
          <input {...register("make")} className="w-full border p-2 rounded-md" />
          {errors.make && <p className="text-xs text-red-600">{(errors.make as any).message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium">Model</label>
          <input {...register("model")} className="w-full border p-2 rounded-md" />
          {errors.model && <p className="text-xs text-red-600">{(errors.model as any).message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium">Year</label>
          <input type="number" {...register("year", { valueAsNumber: true })} className="w-full border p-2 rounded-md" />
          {errors.year && <p className="text-xs text-red-600">{(errors.year as any).message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium">VIN</label>
          <input {...register("vin")} className="w-full border p-2 rounded-md" />
          {errors.vin && <p className="text-xs text-red-600">{(errors.vin as any).message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium">Asking Price (BDT)</label>
          <input type="number" {...register("askingPrice", { valueAsNumber: true })} className="w-full border p-2 rounded-md" />
          {errors.askingPrice && <p className="text-xs text-red-600">{(errors.askingPrice as any).message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium">Condition</label>
          <select {...register("condition")} className="w-full border p-2 rounded-md">
            <option>Mint</option>
            <option>Good</option>
            <option>Fair</option>
            <option>Poor</option>
          </select>
          {errors.condition && <p className="text-xs text-red-600">{(errors.condition as any).message}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium">Description</label>
          <textarea {...register("description")} className="w-full border p-2 rounded-md" rows={4} />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-2">Power Source</label>
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2">
              <input type="radio" value="ICE" {...register("powerSource")} />
              <span className="flex items-center gap-1"><Flame size={16} /> ICE</span>
            </label>
            <label className="inline-flex items-center gap-2">
              <input type="radio" value="EV" {...register("powerSource")} />
              <span className="flex items-center gap-1"><Zap size={16} /> EV</span>
            </label>
          </div>
        </div>

        {/* Conditional ICE fields */}
        <div>
          <label className="block text-sm font-medium">Engine Displacement (CC)</label>
          <input type="number" {...register("engineDisplacement", { valueAsNumber: true })} className="w-full border p-2 rounded-md" />
          {errors.engineDisplacement && <p className="text-xs text-red-600">{(errors.engineDisplacement as any).message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium">Fuel System</label>
          <select {...register("fuelSystem")} className="w-full border p-2 rounded-md">
            <option>Carburetor</option>
            <option>FI</option>
          </select>
          {errors.fuelSystem && <p className="text-xs text-red-600">{(errors.fuelSystem as any).message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium">Transmission</label>
          <select {...register("transmission")} className="w-full border p-2 rounded-md">
            <option>Manual</option>
            <option>Automatic</option>
          </select>
          {errors.transmission && <p className="text-xs text-red-600">{(errors.transmission as any).message}</p>}
        </div>

        {/* Conditional EV fields */}
        <div>
          <label className="block text-sm font-medium">Battery Capacity (kWh)</label>
          <input type="number" step="0.1" {...register("batteryCapacity", { valueAsNumber: true })} className="w-full border p-2 rounded-md" />
          {errors.batteryCapacity && <p className="text-xs text-red-600">{(errors.batteryCapacity as any).message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium">Max Range (KM)</label>
          <input type="number" {...register("maxRangeKm", { valueAsNumber: true })} className="w-full border p-2 rounded-md" />
          {errors.maxRangeKm && <p className="text-xs text-red-600">{(errors.maxRangeKm as any).message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium">Motor Power (kW)</label>
          <input type="number" step="0.1" {...register("motorPowerKw", { valueAsNumber: true })} className="w-full border p-2 rounded-md" />
          {errors.motorPowerKw && <p className="text-xs text-red-600">{(errors.motorPowerKw as any).message}</p>}
        </div>

      </div>

      <div className="mt-4">
        <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:bg-slate-400">
          {isSubmitting ? "Registering Vehicle..." : "Register Vehicle"}
        </button>
      </div>

      {message && <div className="mt-3 p-3 rounded bg-green-100 text-green-800">{message}</div>}
    </form>
  );
}
