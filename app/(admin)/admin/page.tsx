import { db } from '@/lib/db';
import DashboardClient from './dashboard-client';

export default async function AdminOverviewPage() {
  // Parallel fetch of all Dashboard critical data
  const [vehicles, parts, pendingPipeline, funnelData] = await Promise.all([
    db.vehicle.findMany({
      select: {
        id: true,
        powertrain: true,
        askingPrice: true,
        price: true,
      },
    }),
    db.part.findMany({
      select: {
        id: true,
        name: true,
        sku: true,
        stock: true,
        retailPrice: true,
        price: true,
      },
      orderBy: { stock: 'asc' },
    }),
    db.vehicle.findMany({
      where: { certificationStatus: 'PENDING_APPROVAL' },
      include: { inspection: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    db.vehicle.groupBy({
      by: ['certificationStatus'],
      _count: true,
    }),
  ]);

  // Aggregation & Processing
  const totalMarketplaceValue =
    vehicles.reduce((sum, v) => sum + (Number(v.askingPrice) || Number(v.price) || 0), 0) +
    parts.reduce((sum, p) => sum + (Number(p.retailPrice) || Number(p.price) || 0) * (p.stock || 0), 0);

  const evCount = vehicles.filter((v) => v.powertrain === 'EV').length;
  const iceCount = vehicles.filter((v) => v.powertrain === 'ICE').length;
  const totalPowertrain = evCount + iceCount || 1; // Prevent div by 0

  const certificationQueueCount = vehicles.filter((v) => (v as any).certificationStatus === 'PENDING_APPROVAL').length;
  const criticalLowStockCount = parts.filter((p) => p.stock < 10).length;

  const lowStockParts = parts.filter((p) => p.stock < 10).slice(0, 5);

  const stats = {
    totalValue: totalMarketplaceValue,
    queueCount:
      funnelData.find((f) => f.certificationStatus === 'PENDING_APPROVAL')?._count || certificationQueueCount,
    lowStockCount: criticalLowStockCount,
    fleetMix: {
      ev: Math.round((evCount / totalPowertrain) * 100),
      ice: Math.round((iceCount / totalPowertrain) * 100),
    },
  };

  // Funnel Mapping
  const chartFunnel = [
    { name: 'Draft', value: funnelData.find((f) => f.certificationStatus === 'DRAFT')?._count || 0 },
    { name: 'Pending', value: funnelData.find((f) => f.certificationStatus === 'PENDING_APPROVAL')?._count || 0 },
    { name: 'Certified', value: funnelData.find((f) => f.certificationStatus === 'CERTIFIED')?._count || 0 },
  ];

  // Category Value Mapping (Mocked Category Split based on Name since field isn't clear)
  let gearValue = 0;
  let partValue = 0;
  parts.forEach((p) => {
    const val = (Number(p.retailPrice) || Number(p.price) || 0) * (p.stock || 0);
    if (p.name.toLowerCase().includes('helmet') || p.name.toLowerCase().includes('jacket')) {
      gearValue += val;
    } else {
      partValue += val;
    }
  });

  const chartCategories = [
    { name: 'Motowolf Gear', value: gearValue },
    { name: 'Spare Parts', value: partValue },
  ];

  return (
    <DashboardClient
      stats={stats}
      pendingPipeline={pendingPipeline}
      lowStockParts={lowStockParts}
      chartFunnel={chartFunnel}
      chartCategories={chartCategories}
    />
  );
}
