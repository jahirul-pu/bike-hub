import { markCheckoutCancelled } from "@/lib/checkout";

function getPaymentRef(request: Request): string | null {
  const url = new URL(request.url);
  return url.searchParams.get("paymentRef") || url.searchParams.get("tran_id") || null;
}

function cancelRedirectUrl(request: Request, paymentRef: string): URL {
  const url = new URL("/marketplace", request.url);
  url.searchParams.set("payment", "cancelled");
  url.searchParams.set("paymentRef", paymentRef);
  return url;
}

export async function GET(request: Request) {
  const paymentRef = getPaymentRef(request);

  if (!paymentRef) {
    return Response.json({ error: "Missing payment reference." }, { status: 400 });
  }

  try {
    const result = markCheckoutCancelled(paymentRef);

    if (request.headers.get("accept")?.includes("application/json")) {
      return Response.json({ message: "Payment cancelled.", result });
    }

    return Response.redirect(cancelRedirectUrl(request, paymentRef));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update payment status.";
    return Response.json({ error: message }, { status: 400 });
  }
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  let paymentRef: string | null = null;

  if (contentType.includes("application/json")) {
    const body = (await request.json()) as { paymentRef?: string; tran_id?: string };
    paymentRef = body.paymentRef ?? body.tran_id ?? null;
  } else {
    const formData = await request.formData();
    paymentRef =
      String(formData.get("paymentRef") ?? "") ||
      String(formData.get("tran_id") ?? "") ||
      null;
  }

  if (!paymentRef) {
    paymentRef = getPaymentRef(request);
  }

  if (!paymentRef) {
    return Response.json({ error: "Missing payment reference." }, { status: 400 });
  }

  try {
    const result = markCheckoutCancelled(paymentRef);
    return Response.json({ message: "Payment cancelled.", result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update payment status.";
    return Response.json({ error: message }, { status: 400 });
  }
}
