'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const VehicleInputSchema = z.object({
  model: z.string().min(1),
  brand: z.string().optional(),
  make: z.string().optional(),
  category: z.string().optional(),
  powertrain: z.string().optional(),
  powerSource: z.string().optional(),
  summary: z.string().optional(),
  description: z.string().optional(),
  priceBdt: z.coerce.number().optional(),
  askingPrice: z.coerce.number().optional(),
  chassis: z.string().optional(),
  vin: z.string().optional(),
  displacementCc: z.coerce.number().optional(),
  engineDisplacement: z.coerce.number().optional(),
  motorPowerKw: z.coerce.number().optional(),
  topSpeedKph: z.coerce.number().optional(),
  mileageKmpl: z.coerce.number().optional(),
  rangeKm: z.coerce.number().optional(),
  maxRangeKm: z.coerce.number().optional(),
  fuelTankLiters: z.coerce.number().optional(),
  chargingTime0100: z.string().optional(),
});

function normalizeInput(input: FormData | Record<string, unknown>) {
  if (input instanceof FormData) {
    return Object.fromEntries(input.entries());
  }

  return input;
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

export async function createVehicle(input: FormData | Record<string, unknown>) {
  try {
    const parsed = VehicleInputSchema.parse(normalizeInput(input));
    const brandName = parsed.brand || parsed.make;
    const chassis = parsed.chassis || parsed.vin;

    if (!brandName || !chassis) {
      return { success: false, error: 'Brand/make and chassis/VIN are required.' };
    }

    const powertrain = parsed.powertrain || parsed.powerSource || 'ICE';
    const baseSlug = slugify(`${brandName}-${parsed.model}`);
    const generatedSlug = `${baseSlug}-${chassis.substring(0, 5).toLowerCase()}`;

    await db.vehicle.create({
      data: {
        slug: generatedSlug,
        brand: {
          connectOrCreate: {
            where: { slug: slugify(brandName) },
            create: {
              name: brandName,
              slug: slugify(brandName),
              powertrain: powertrain === 'EV' ? 'EV' : 'ICE',
            },
          },
        },
        model: parsed.model,
        name: parsed.model,
        category: parsed.category || 'Commuter',
        powertrain,
        summary: parsed.summary || parsed.description || null,
        priceBdt: parsed.priceBdt ?? parsed.askingPrice ?? 0,
        displacementCc: parsed.displacementCc ?? parsed.engineDisplacement ?? null,
        motorPowerKw: parsed.motorPowerKw ?? null,
        topSpeedKph: parsed.topSpeedKph ?? null,
        mileageKmpl: parsed.mileageKmpl ?? null,
        rangeKm: parsed.rangeKm ?? parsed.maxRangeKm ?? null,
        fuelTankLiters: parsed.fuelTankLiters ?? null,
        chargingTime0100: parsed.chargingTime0100 || null,
        vin: parsed.vin || chassis,
        chassis,
        askingPrice: parsed.askingPrice ?? 0,
        certificationStatus: 'PENDING_APPROVAL',
        inspection: {
          create: {
            status: 'Processing',
          },
        },
      },
    });

    revalidatePath('/admin/inventory/vehicles');
    revalidatePath('/admin');
    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error('Vehicle creation failed:', error);
    return { success: false, error: 'Failed to create vehicle' };
  }
}
