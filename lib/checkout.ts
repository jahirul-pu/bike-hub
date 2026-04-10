import { randomUUID } from "node:crypto";
import { appendOrderHistoryForUser } from "@/lib/auth/demo-store";
import { getImsPartById, reduceImsPartStock } from "@/lib/ims-store";

export const SHIPPING_RATES_2026 = {
  Savar: 120,
  Nationwide: 180,
} as const;

export type ShippingZone = keyof typeof SHIPPING_RATES_2026;
export type PaymentGateway = "sslcommerz" | "bkash";

export type CheckoutCartItem = {
  partId: string;
  quantity: number;
};

export type CheckoutLineItem = {
  partId: string;
  partName: string;
  category: "Parts" | "Accessories";
  unitPriceBdt: number;
  quantity: number;
  lineTotalBdt: number;
};

export type CheckoutComputation = {
  lineItems: CheckoutLineItem[];
  subtotalBdt: number;
  shippingZone: ShippingZone;
  shippingBdt: number;
  totalBdt: number;
};

type CheckoutStatus = "pending" | "paid" | "failed" | "cancelled";

type PendingCheckoutSession = CheckoutComputation & {
  paymentRef: string;
  userEmail: string;
  gateway: PaymentGateway;
  status: CheckoutStatus;
  createdAt: string;
  paidAt?: string;
};

export type GatewaySessionResult = {
  paymentRef: string;
  gateway: PaymentGateway;
  paymentUrl: string;
  rawProviderResponse?: unknown;
};

const pendingCheckoutByPaymentRef = new Map<string, PendingCheckoutSession>();

function normalizeQty(quantity: number): number {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error(`Invalid quantity: ${quantity}`);
  }

  return quantity;
}

export function calculateCheckoutTotals(cart: CheckoutCartItem[], shippingZone: ShippingZone): CheckoutComputation {
  if (!cart.length) {
    throw new Error("Cart is empty.");
  }

  const lineItems = cart.map((entry) => {
    const quantity = normalizeQty(entry.quantity);
    const part = getImsPartById(entry.partId);

    if (!part) {
      throw new Error(`Part not found in IMS: ${entry.partId}`);
    }

    if (part.stockQty < quantity) {
      throw new Error(`Insufficient stock for ${part.name}. Requested ${quantity}, available ${part.stockQty}.`);
    }

    return {
      partId: part.id,
      partName: part.name,
      category: part.category,
      unitPriceBdt: part.unitPriceBdt,
      quantity,
      lineTotalBdt: part.unitPriceBdt * quantity,
    } satisfies CheckoutLineItem;
  });

  const subtotalBdt = lineItems.reduce((sum, item) => sum + item.lineTotalBdt, 0);
  const shippingBdt = SHIPPING_RATES_2026[shippingZone];

  return {
    lineItems,
    subtotalBdt,
    shippingZone,
    shippingBdt,
    totalBdt: subtotalBdt + shippingBdt,
  };
}

type CreateGatewaySessionInput = {
  gateway: PaymentGateway;
  order: CheckoutComputation;
  userEmail: string;
  baseUrl: string;
};

type GatewayPayload = {
  paymentRef: string;
  amount: number;
  currency: "BDT";
  customer: {
    email: string;
  };
  orderMeta: {
    shippingZone: ShippingZone;
    itemCount: number;
  };
  redirectUrls: {
    success: string;
    fail: string;
    cancel: string;
  };
};

function getGatewayEndpoint(gateway: PaymentGateway): string | undefined {
  return gateway === "sslcommerz"
    ? process.env.SSLCOMMERZ_SESSION_URL
    : process.env.BKASH_PGW_SESSION_URL;
}

export async function createPaymentSession(input: CreateGatewaySessionInput): Promise<GatewaySessionResult> {
  const paymentRef = randomUUID();
  const redirectUrls = {
    success: `${input.baseUrl}/api/payment/success?paymentRef=${paymentRef}`,
    fail: `${input.baseUrl}/api/payment/fail?paymentRef=${paymentRef}`,
    cancel: `${input.baseUrl}/api/payment/cancel?paymentRef=${paymentRef}`,
  };

  const sessionRecord: PendingCheckoutSession = {
    paymentRef,
    userEmail: input.userEmail,
    gateway: input.gateway,
    status: "pending",
    createdAt: new Date().toISOString(),
    ...input.order,
  };

  pendingCheckoutByPaymentRef.set(paymentRef, sessionRecord);

  const payload: GatewayPayload = {
    paymentRef,
    amount: input.order.totalBdt,
    currency: "BDT",
    customer: {
      email: input.userEmail,
    },
    orderMeta: {
      shippingZone: input.order.shippingZone,
      itemCount: input.order.lineItems.reduce((sum, item) => sum + item.quantity, 0),
    },
    redirectUrls,
  };

  const endpoint = getGatewayEndpoint(input.gateway);
  if (!endpoint) {
    return {
      paymentRef,
      gateway: input.gateway,
      paymentUrl: redirectUrls.success,
      rawProviderResponse: {
        mode: "mock",
        reason: "Set SSLCOMMERZ_SESSION_URL or BKASH_PGW_SESSION_URL for live session creation.",
      },
    };
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const rawProviderResponse = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(`${input.gateway} session creation failed with status ${response.status}`);
  }

  const paymentUrl =
    (rawProviderResponse as { paymentUrl?: string; GatewayPageURL?: string } | null)?.paymentUrl ??
    (rawProviderResponse as { paymentUrl?: string; GatewayPageURL?: string } | null)?.GatewayPageURL;

  if (!paymentUrl) {
    throw new Error(`Missing payment URL from ${input.gateway} session response.`);
  }

  return {
    paymentRef,
    gateway: input.gateway,
    paymentUrl,
    rawProviderResponse,
  };
}

export function markCheckoutFailed(paymentRef: string): PendingCheckoutSession {
  const session = pendingCheckoutByPaymentRef.get(paymentRef);
  if (!session) {
    throw new Error("Payment session not found.");
  }

  session.status = "failed";
  pendingCheckoutByPaymentRef.set(paymentRef, session);
  return session;
}

export function markCheckoutCancelled(paymentRef: string): PendingCheckoutSession {
  const session = pendingCheckoutByPaymentRef.get(paymentRef);
  if (!session) {
    throw new Error("Payment session not found.");
  }

  session.status = "cancelled";
  pendingCheckoutByPaymentRef.set(paymentRef, session);
  return session;
}

export function confirmPaidCheckout(paymentRef: string): {
  paymentRef: string;
  status: CheckoutStatus;
  orderCount: number;
} {
  const session = pendingCheckoutByPaymentRef.get(paymentRef);
  if (!session) {
    throw new Error("Payment session not found.");
  }

  if (session.status === "paid") {
    return {
      paymentRef,
      status: session.status,
      orderCount: session.lineItems.length,
    };
  }

  if (session.status !== "pending") {
    throw new Error(`Cannot confirm payment from ${session.status} state.`);
  }

  for (const line of session.lineItems) {
    reduceImsPartStock(line.partId, line.quantity);
  }

  appendOrderHistoryForUser(
    session.userEmail,
    session.lineItems.map((line) => ({
      itemName: line.partName,
      category: line.category,
      amountInr: line.lineTotalBdt,
    }))
  );

  session.status = "paid";
  session.paidAt = new Date().toISOString();
  pendingCheckoutByPaymentRef.set(paymentRef, session);

  return {
    paymentRef,
    status: session.status,
    orderCount: session.lineItems.length,
  };
}

export function getCheckoutSession(paymentRef: string): PendingCheckoutSession | undefined {
  return pendingCheckoutByPaymentRef.get(paymentRef);
}
