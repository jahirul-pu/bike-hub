'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function createVehicle(formData: FormData) {
  const model = formData.get('model') as string;
  const brand = formData.get('brand') as string;
  const category = formData.get('category') as string;
  const powertrain = formData.get('powertrain') as string;
  const summary = formData.get('summary') as string;
  const priceBdt = parseFloat(formData.get('priceBdt') as string) || 0;
  
  const chassis = formData.get('chassis') as string;
  const askingPrice = parseFloat(formData.get('askingPrice') as string) || 0;

  if (!model || !chassis) {
    throw new Error('Model and chassis are required.');
  }

  // Parse optional float conversions carefully
  const displacementCc = parseFloat(formData.get('displacementCc') as string) || null;
  const motorPowerKw = parseFloat(formData.get('motorPowerKw') as string) || null;
  const topSpeedKph = parseFloat(formData.get('topSpeedKph') as string) || null;
  const mileageKmpl = parseFloat(formData.get('mileageKmpl') as string) || null;
  const rangeKm = parseFloat(formData.get('rangeKm') as string) || null;
  const fuelTankLiters = parseFloat(formData.get('fuelTankLiters') as string) || null;
  const chargingTime0100 = formData.get('chargingTime0100') as string || null;

  // Generate unique slug
  const baseSlug = `${brand}-${model}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  const generatedSlug = `${baseSlug}-${chassis.substring(0, 5)}`.toLowerCase();

  await db.vehicle.create({
    data: {
      slug: generatedSlug,
      brand,
      model,
      name: model,
      category,
      powertrain: powertrain || 'ICE',
      summary,
      priceBdt,
      displacementCc,
      motorPowerKw,
      topSpeedKph,
      mileageKmpl,
      rangeKm,
      fuelTankLiters,
      chargingTime0100,
      
      vin: chassis,
      chassis: chassis,
      askingPrice,
      certificationStatus: 'PENDING_APPROVAL',
      inspection: {
        create: {
          status: 'Processing',
        }
      }
    },
  });

  revalidatePath('/admin/inventory/vehicles');
  revalidatePath('/admin');
  revalidatePath('/');
}
