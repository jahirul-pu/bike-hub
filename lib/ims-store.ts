export type ImsPartCategory = "Parts" | "Accessories";

export type ImsInventoryPart = {
  id: string;
  name: string;
  category: ImsPartCategory;
  unitPriceBdt: number;
  stockQty: number;
};

const inventoryByPartId = new Map<string, ImsInventoryPart>([]);

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
