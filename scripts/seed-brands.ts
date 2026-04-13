import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const brands = [
  // ICE Brands
  { name: 'Yamaha', slug: 'yamaha', powertrain: 'ICE', origin: 'Japan', description: 'Premium motorcycles and scooters.' },
  { name: 'Honda', slug: 'honda', powertrain: 'ICE', origin: 'Japan', description: 'Reliable and fuel-efficient motorcycles.' },
  { name: 'Suzuki', slug: 'suzuki', powertrain: 'ICE', origin: 'Japan', description: 'Performance and commuter motorcycles.' },
  { name: 'Bajaj', slug: 'bajaj', powertrain: 'ICE', origin: 'India', description: 'Popular commuter and sports-commuter bikes.' },
  { name: 'TVS', slug: 'tvs', powertrain: 'ICE', origin: 'India', description: 'Wide range of commuter and sports bikes.' },
  { name: 'Hero', slug: 'hero', powertrain: 'ICE', origin: 'India', description: 'High-mileage commuter motorcycles.' },
  { name: 'KTM', slug: 'ktm', powertrain: 'ICE', origin: 'Austria', description: 'High-performance street and off-road bikes.' },
  { name: 'Royal Enfield', slug: 'royal-enfield', powertrain: 'ICE', origin: 'UK/India', description: 'Classic and cruiser motorcycles.' },
  { name: 'Lifan', slug: 'lifan', powertrain: 'ICE', origin: 'China', description: 'Affordable sports and commuter bikes.' },
  { name: 'Keeway', slug: 'keeway', powertrain: 'ICE', origin: 'Hungary/China', description: 'Stylish and affordable motorcycles.' },
  { name: 'Taro', slug: 'taro', powertrain: 'ICE', origin: 'Italy/China', description: 'Aggressive and sporty motorcycles.' },
  { name: 'GPX', slug: 'gpx', powertrain: 'ICE', origin: 'Thailand', description: 'Sports and naked bikes.' },
  { name: 'Zontes', slug: 'zontes', powertrain: 'ICE', origin: 'China', description: 'Feature-rich premium motorcycles.' },
  { name: 'Aprilia', slug: 'aprilia', powertrain: 'ICE', origin: 'Italy', description: 'Performance scooters and motorcycles.' },
  { name: 'Vespa', slug: 'vespa', powertrain: 'ICE', origin: 'Italy', description: 'Classic and premium scooters.' },
  { name: 'Benelli', slug: 'benelli', powertrain: 'ICE', origin: 'Italy/China', description: 'Premium sports and naked bikes.' },
  { name: 'Kawasaki', slug: 'kawasaki', powertrain: 'ICE', origin: 'Japan', description: 'High-performance premium motorcycles.' },
  { name: 'FKM', slug: 'fkm', powertrain: 'ICE', origin: 'Germany/China', description: 'Stylish modern motorcycles.' },
  { name: 'H Power', slug: 'h-power', powertrain: 'ICE', origin: 'Bangladesh/China', description: 'Local and imported motorcycles.' },

  // Both
  { name: 'Runner', slug: 'runner', powertrain: 'BOTH', origin: 'Bangladesh', description: 'Local manufacturer of ICE and EV bikes.' },

  // EV Brands
  { name: 'Walton', slug: 'walton', powertrain: 'EV', origin: 'Bangladesh', description: 'Local electronics giant manufacturing EV bikes (TAKIYO).' },
  { name: 'Green Tiger', slug: 'green-tiger', powertrain: 'EV', origin: 'Bangladesh/China', description: 'Pioneer of EV scooters in Bangladesh.' },
  { name: 'Akij', slug: 'akij', powertrain: 'EV', origin: 'Bangladesh', description: 'Local conglomerate manufacturing electric motorcycles and scooters.' },
  { name: 'Exploit', slug: 'exploit', powertrain: 'EV', origin: 'China/Bangladesh', description: 'Affordable electric scooters.' },
  { name: 'Intex', slug: 'intex', powertrain: 'EV', origin: 'China', description: 'Electric scooters for daily commuting.' },
  { name: 'Yadea', slug: 'yadea', powertrain: 'EV', origin: 'China', description: 'Global leader in electric two-wheelers.' },
  { name: 'Aima', slug: 'aima', powertrain: 'EV', origin: 'China', description: 'Popular electric scooters.' },
  { name: 'Pegasus', slug: 'pegasus', powertrain: 'ICE', origin: 'Bangladesh/China', description: 'Affordable local motorcycles.' },
  { name: 'Atlas Zongshen', slug: 'atlas-zongshen', powertrain: 'ICE', origin: 'Bangladesh/China', description: 'Joint venture producing motorcycles.' }
];

async function main() {
  console.log('Seeding brands...');
  for (const brand of brands) {
    await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: {
        name: brand.name,
        powertrain: brand.powertrain,
        origin: brand.origin,
        description: brand.description
      },
      create: brand
    });
  }
  console.log('Finished seeding brands!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
