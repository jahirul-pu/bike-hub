import type { GarageProfile, ImsPartRecord, OrderRecord, UserRole } from "@/lib/auth/types";

export type DemoAuthUser = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  userRole: UserRole;
};

const demoAuthUsers: DemoAuthUser[] = [
  {
    id: "usr_r15",
    name: "Raihan Rider",
    email: "r15@bikehub.dev",
    passwordHash: "$2b$10$QMcNt81N.1Ym/xmxWdWn9ul9Bi0GzBUjVY.P9CReCHkEJPHxaTfm2",
    userRole: "User",
  },
  {
    id: "usr_admin",
    name: "Amina Admin",
    email: "admin@bikehub.dev",
    passwordHash: "$2b$10$ZRd2wXaGBdWcfrY.rCQNHeXOKIR172F7abqDhIeAWjaB9bvbaYqQS",
    userRole: "Admin",
  },
  {
    id: "usr_tech",
    name: "Tarek Tech",
    email: "tech@bikehub.dev",
    passwordHash: "$2b$10$6kDGHHxygInLhxviiyNVm.oXDnkz/.5yR2jo0/d1uln0NbuRmXnq6",
    userRole: "Tech",
  },
];

const garageByEmail: Record<string, GarageProfile> = {
  "r15@bikehub.dev": {
    primaryBike: {
      make: "Yamaha",
      model: "R15",
      year: 2023,
    },
    deliveryAddress: {
      line1: "House 14, Road 3",
      area: "Nobinagar",
      city: "Savar",
      zone: "Savar",
    },
    savedBikes: [
      { make: "Yamaha", model: "R15", year: 2023 },
      { make: "Honda", model: "CBR 150R", year: 2022 },
    ],
    listings: [
      {
        id: "lst_101",
        bikeTitle: "Yamaha FZS FI V3",
        askedPriceInr: 205000,
        stage: "Review",
        stageUpdatedAt: "2026-04-10",
      },
    ],
    orderHistory: [
      {
        id: "ord_501",
        itemName: "Motowolf Handle Bar Mobile Holder",
        category: "Accessories",
        amountInr: 1490,
        status: "Delivered",
        orderedAt: "2026-03-18",
      },
      {
        id: "ord_502",
        itemName: "Motowolf Crash Guard",
        category: "Parts",
        amountInr: 3290,
        status: "Shipped",
        orderedAt: "2026-04-05",
      },
    ],
  },
  "admin@bikehub.dev": {
    primaryBike: {
      make: "Kawasaki",
      model: "Ninja 400",
      year: 2024,
    },
    deliveryAddress: {
      line1: "Plot 7, CDA Avenue",
      area: "Panchlaish",
      city: "Chattogram",
      zone: "Nationwide",
    },
    savedBikes: [{ make: "Kawasaki", model: "Ninja 400", year: 2024 }],
    listings: [],
    orderHistory: [
      {
        id: "ord_680",
        itemName: "KYT KYLON Helmet Visor",
        category: "Accessories",
        amountInr: 990,
        status: "Confirmed",
        orderedAt: "2026-04-09",
      },
    ],
  },
  "tech@bikehub.dev": {
    primaryBike: {
      make: "Suzuki",
      model: "Gixxer SF",
      year: 2021,
    },
    deliveryAddress: null,
    savedBikes: [{ make: "Suzuki", model: "Gixxer SF", year: 2021 }],
    listings: [
      {
        id: "lst_901",
        bikeTitle: "Suzuki GSX-S150",
        askedPriceInr: 255000,
        stage: "Live",
        stageUpdatedAt: "2026-04-08",
      },
    ],
    orderHistory: [],
  },
};

const imsMotowolfByModel: Record<string, ImsPartRecord[]> = {
  "Yamaha R15": [
    {
      id: "ims_1",
      itemName: "Motowolf Frame Slider",
      priceInr: 2190,
      rating: 4.8,
    },
    {
      id: "ims_2",
      itemName: "Motowolf Adjustable Brake Lever",
      priceInr: 2590,
      rating: 4.7,
    },
    {
      id: "ims_3",
      itemName: "Motowolf CNC Bar End Mirrors",
      priceInr: 2890,
      rating: 4.6,
    },
  ],
};

export function findDemoAuthUserByEmail(email: string): DemoAuthUser | undefined {
  return demoAuthUsers.find((user) => user.email.toLowerCase() === email.toLowerCase());
}

export function getGarageProfileByEmail(email: string | null | undefined): GarageProfile {
  if (!email) {
    return {
      primaryBike: null,
      deliveryAddress: null,
      savedBikes: [],
      listings: [],
      orderHistory: [],
    };
  }

  return (
    garageByEmail[email.toLowerCase()] ?? {
      primaryBike: null,
      savedBikes: [],
      listings: [],
      orderHistory: [],
    }
  );
}

export function getMotowolfUpsellForR15(email: string | null | undefined): ImsPartRecord[] {
  const garage = getGarageProfileByEmail(email);
  const hasR15 = garage.savedBikes.some(
    (bike) => bike.make.toLowerCase() === "yamaha" && bike.model.toLowerCase() === "r15"
  );

  if (!hasR15) {
    return [];
  }

  return imsMotowolfByModel["Yamaha R15"];
}

function ensureGarageProfile(email: string): GarageProfile {
  const normalizedEmail = email.toLowerCase();

  if (!garageByEmail[normalizedEmail]) {
    garageByEmail[normalizedEmail] = {
      primaryBike: null,
      deliveryAddress: null,
      savedBikes: [],
      listings: [],
      orderHistory: [],
    };
  }

  return garageByEmail[normalizedEmail];
}

type AppendOrderInput = {
  itemName: string;
  category: OrderRecord["category"];
  amountInr: number;
};

export function appendOrderHistoryForUser(email: string, newOrders: AppendOrderInput[]): OrderRecord[] {
  const garage = ensureGarageProfile(email);
  const today = new Date().toISOString().slice(0, 10);

  const appendedOrders = newOrders.map((entry, index) => ({
    id: `ord_${Date.now()}_${index + 1}`,
    itemName: entry.itemName,
    category: entry.category,
    amountInr: entry.amountInr,
    status: "Confirmed" as const,
    orderedAt: today,
  }));

  garage.orderHistory.unshift(...appendedOrders);
  return appendedOrders;
}
