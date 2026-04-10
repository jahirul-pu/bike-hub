export type ImsPartCategory = "Parts" | "Accessories";

export type ImsInventoryPart = {
  id: string;
  name: string;
  category: ImsPartCategory;
  unitPriceBdt: number;
  stockQty: number;
};

const inventoryByPartId = new Map<string, ImsInventoryPart>([
  [
    "part-001",
    {
      id: "part-001",
      name: "Chain & Sprocket Kit",
      category: "Parts",
      unitPriceBdt: 6500,
      stockQty: 14,
    },
  ],
  [
    "part-002",
    {
      id: "part-002",
      name: "Front Brake Pads",
      category: "Parts",
      unitPriceBdt: 1800,
      stockQty: 28,
    },
  ],
  [
    "part-003",
    {
      id: "part-003",
      name: "Touring Windshield",
      category: "Accessories",
      unitPriceBdt: 4200,
      stockQty: 10,
    },
  ],
  [
    "part-004",
    {
      id: "part-004",
      name: "Phone Mount with USB",
      category: "Accessories",
      unitPriceBdt: 2100,
      stockQty: 45,
    },
  ],
  [
    "part-010",
    {
      id: "part-010",
      name: "Tubeless Tyre Pair",
      category: "Parts",
      unitPriceBdt: 7600,
      stockQty: 9,
    },
  ],
]);

export function getImsPartById(partId: string): ImsInventoryPart | undefined {
  return inventoryByPartId.get(partId);
}

export function reduceImsPartStock(partId: string, quantity: number): ImsInventoryPart {
  const part = inventoryByPartId.get(partId);
  if (!part) {
    throw new Error(`Unknown IMS part id: ${partId}`);
  }

  if (quantity <= 0) {
    throw new Error(`Invalid quantity for stock update: ${quantity}`);
  }

  if (part.stockQty < quantity) {
    throw new Error(`Insufficient stock for ${part.name}. Available: ${part.stockQty}`);
  }

  const updated = {
    ...part,
    stockQty: part.stockQty - quantity,
  };

  inventoryByPartId.set(partId, updated);
  return updated;
}

export function getImsInventorySnapshot(): ImsInventoryPart[] {
  return Array.from(inventoryByPartId.values());
}
