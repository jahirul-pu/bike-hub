"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";

const cartItemSchema = z.object({
  partId: z.string().min(1),
  quantity: z.number().int().positive(),
});

const shippingInfoSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(7),
  address: z.string().min(5),
  city: z.string().min(2),
  postalCode: z.string().optional(),
  deliveryOption: z.enum(["pickup", "courier"]).default("pickup"),
});

const processOrderSchema = z.object({
  cartItems: z.array(cartItemSchema).min(1),
  shippingInfo: shippingInfoSchema,
});

export type ProcessOrderInput = z.infer<typeof processOrderSchema>;

export type ProcessOrderResult =
  | {
      success: true;
      message: string;
      orderId: string;
    }
  | {
      success: false;
      message: string;
    };

class SoldOutError extends Error {
  constructor(partName: string) {
    super(`Sorry, ${partName} just sold out!`);
    this.name = "SoldOutError";
  }
}

type DbPartRecord = {
  id: string;
  name: string;
  stock: number;
  price?: number;
  priceBdt?: number;
  unitPriceBdt?: number;
};

type TransactionClient = {
  part: {
    findMany: (args: {
      where: { id: { in: string[] } };
      select: {
        id: true;
        name: true;
        stock: true;
        price: true;
        priceBdt: true;
        unitPriceBdt: true;
      };
    }) => Promise<DbPartRecord[]>;
    updateMany: (args: {
      where: { id: string; stock: { gte: number } };
      data: { stock: { decrement: number } };
    }) => Promise<{ count: number }>;
  };
  order: {
    create: (args: {
      data: Record<string, unknown>;
      select: { id: true };
    }) => Promise<{ id: string | number }>;
  };
  orderItem?: {
    createMany?: (args: {
      data: Array<{
        orderId: string | number;
        partId: string;
        partName: string;
        quantity: number;
        unitPriceBdt: number;
      }>;
    }) => Promise<unknown>;
  };
};

function aggregateCartItems(cartItems: ProcessOrderInput["cartItems"]): ProcessOrderInput["cartItems"] {
  const byPartId = new Map<string, number>();

  for (const item of cartItems) {
    byPartId.set(item.partId, (byPartId.get(item.partId) ?? 0) + item.quantity);
  }

  return Array.from(byPartId.entries()).map(([partId, quantity]) => ({ partId, quantity }));
}

function readPartPrice(part: Record<string, unknown>): number {
  const candidates = [part.price, part.priceBdt, part.unitPriceBdt];
  for (const candidate of candidates) {
    if (typeof candidate === "number" && Number.isFinite(candidate)) {
      return candidate;
    }
  }

  return 0;
}

export async function processOrder(
  cartItems: ProcessOrderInput["cartItems"],
  shippingInfo: ProcessOrderInput["shippingInfo"]
): Promise<ProcessOrderResult> {
  const parsed = processOrderSchema.safeParse({ cartItems, shippingInfo });

  if (!parsed.success) {
    return {
      success: false,
      message: "Invalid order payload.",
    };
  }

  const normalizedCart = aggregateCartItems(parsed.data.cartItems);
  const normalizedShipping = parsed.data.shippingInfo;

  try {
    const transactionResult = await prisma.$transaction(async (tx) => {
      const db = tx as unknown as TransactionClient;
      const partIds = normalizedCart.map((item) => item.partId);

      const parts = await db.part.findMany({
        where: { id: { in: partIds } },
        select: { id: true, name: true, stock: true, price: true, priceBdt: true, unitPriceBdt: true },
      });

      const partsById = new Map(parts.map((part) => [String(part.id), part]));

      for (const item of normalizedCart) {
        const part = partsById.get(item.partId);
        const partName = part ? String(part.name ?? item.partId) : item.partId;
        const stockValueRaw = part?.stock;
        const stockValue = typeof stockValueRaw === "number" ? stockValueRaw : 0;

        if (!part || stockValue < item.quantity) {
          throw new SoldOutError(partName);
        }
      }

      for (const item of normalizedCart) {
        const part = partsById.get(item.partId);
        const partName = String(part?.name ?? item.partId);

        const updateResult = await db.part.updateMany({
          where: {
            id: item.partId,
            stock: { gte: item.quantity },
          },
          data: {
            stock: { decrement: item.quantity },
          },
        });

        if (!updateResult || updateResult.count === 0) {
          throw new SoldOutError(partName);
        }
      }

      const subtotalBdt = normalizedCart.reduce((sum, item) => {
        const part = partsById.get(item.partId);
        return sum + readPartPrice(part ?? {}) * item.quantity;
      }, 0);

      const shippingBdt = normalizedShipping.deliveryOption === "courier" ? 120 : 0;
      const taxBdt = Math.round(subtotalBdt * 0.05);
      const totalBdt = subtotalBdt + shippingBdt + taxBdt;

      const orderPayloads: Array<Record<string, unknown>> = [
        {
          customerName: normalizedShipping.fullName,
          phone: normalizedShipping.phone,
          address: normalizedShipping.address,
          city: normalizedShipping.city,
          postalCode: normalizedShipping.postalCode ?? null,
          shippingMethod: normalizedShipping.deliveryOption,
          subtotalBdt,
          shippingBdt,
          taxBdt,
          totalBdt,
          status: "PENDING",
          itemsJson: normalizedCart,
          shippingInfo: normalizedShipping,
        },
        {
          shippingInfo: normalizedShipping,
          subtotalBdt,
          shippingBdt,
          taxBdt,
          totalBdt,
          status: "PENDING",
        },
        {
          totalBdt,
        },
      ];

      let order: { id: string | number } | null = null;
      let lastError: unknown;

      for (const payload of orderPayloads) {
        try {
          order = await db.order.create({
            data: payload,
            select: { id: true },
          });
          break;
        } catch (error) {
          lastError = error;
        }
      }

      if (!order) {
        throw lastError instanceof Error ? lastError : new Error("Failed to create order.");
      }

      if (db.orderItem?.createMany) {
        await db.orderItem.createMany({
          data: normalizedCart.map((item) => {
            const part = partsById.get(item.partId);
            return {
              orderId: order.id,
              partId: item.partId,
              partName: String(part?.name ?? item.partId),
              quantity: item.quantity,
              unitPriceBdt: readPartPrice(part ?? {}),
            };
          }),
        });
      }

      return {
        orderId: String(order.id),
      };
    });

    return {
      success: true,
      message: "Order processed successfully. Redirect to payment.",
      orderId: transactionResult.orderId,
    };
  } catch (error) {
    if (error instanceof SoldOutError) {
      return {
        success: false,
        message: error.message,
      };
    }

    return {
      success: false,
      message: "Unable to process order right now.",
    };
  }
}
