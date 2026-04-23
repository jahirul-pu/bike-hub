import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { serializeUsedVehicle } from '@/lib/used-vehicles';

export async function GET() {
  const vehicles = await db.vehicle.findMany({
    include: {
      brand: true,
      inspection: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return NextResponse.json(vehicles.map((vehicle) => serializeUsedVehicle(vehicle)));
}
