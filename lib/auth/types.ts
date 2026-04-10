export const USER_ROLES = ["User", "Admin", "Tech"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export type BikeProfile = {
  make: string;
  model: string;
  year: number;
};

export type ListingStage = "Draft" | "Review" | "Live" | "Sold";

export type ListingRecord = {
  id: string;
  bikeTitle: string;
  askedPriceInr: number;
  stage: ListingStage;
  stageUpdatedAt: string;
};

export type OrderStatus = "Confirmed" | "Shipped" | "Delivered";

export type OrderRecord = {
  id: string;
  itemName: string;
  category: "Parts" | "Accessories";
  amountInr: number;
  status: OrderStatus;
  orderedAt: string;
};

export type ImsPartRecord = {
  id: string;
  itemName: string;
  priceInr: number;
  rating: number;
};

export type GarageProfile = {
  primaryBike: BikeProfile | null;
  savedBikes: BikeProfile[];
  listings: ListingRecord[];
  orderHistory: OrderRecord[];
};
