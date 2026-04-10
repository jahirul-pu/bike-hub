import { z } from "zod";
import { auth } from "@/auth";
import {
  calculateCheckoutTotals,
  createPaymentSession,
  SHIPPING_RATES_2026,
  type ShippingZone,
} from "@/lib/checkout";

const checkoutSchema = z.object({
  cart: z
    .array(
      z.object({
        partId: z.string().min(1),
        quantity: z.int().min(1),
      })
    )
    .min(1),
  shippingZone: z.enum(["Savar", "Nationwide"]),
  paymentGateway: z.enum(["sslcommerz", "bkash"]),
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        {
          error: "Invalid checkout payload",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const order = calculateCheckoutTotals(parsed.data.cart, parsed.data.shippingZone as ShippingZone);
    const requestUrl = new URL(request.url);
    const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`;

    const gatewaySession = await createPaymentSession({
      gateway: parsed.data.paymentGateway,
      order,
      userEmail: session.user.email,
      baseUrl,
    });

    return Response.json({
      payment: gatewaySession,
      orderSummary: order,
      shippingRates2026: SHIPPING_RATES_2026,
      message: "Checkout calculated. Redirect customer to paymentUrl.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Checkout failed.";
    return Response.json({ error: message }, { status: 400 });
  }
}
