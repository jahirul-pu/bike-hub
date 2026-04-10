import { confirmPaidCheckout } from "@/lib/checkout";

function getPaymentRefFromUrl(request: Request): string | null {
  const url = new URL(request.url);
  return (
    url.searchParams.get("paymentRef") ||
    url.searchParams.get("tran_id") ||
    url.searchParams.get("trxID") ||
    null
  );
}

function successRedirectUrl(request: Request, paymentRef: string): URL {
  const url = new URL("/account", request.url);
  url.searchParams.set("payment", "success");
  url.searchParams.set("paymentRef", paymentRef);
  return url;
}

export async function GET(request: Request) {
  const paymentRef = getPaymentRefFromUrl(request);

  if (!paymentRef) {
    return Response.json({ error: "Missing payment reference." }, { status: 400 });
  }

  try {
    const result = confirmPaidCheckout(paymentRef);

    if (request.headers.get("accept")?.includes("application/json")) {
      return Response.json({
        message: "Payment confirmed. IMS stock updated and order records created.",
        result,
      });
    }

    return Response.redirect(successRedirectUrl(request, paymentRef));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Payment confirmation failed.";
    return Response.json({ error: message }, { status: 400 });
  }
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  let paymentRef: string | null = null;

  if (contentType.includes("application/json")) {
    const body = (await request.json()) as { paymentRef?: string; tran_id?: string; trxID?: string };
    paymentRef = body.paymentRef ?? body.tran_id ?? body.trxID ?? null;
  } else {
    const formData = await request.formData();
    paymentRef =
      String(formData.get("paymentRef") ?? "") ||
      String(formData.get("tran_id") ?? "") ||
      String(formData.get("trxID") ?? "") ||
      null;
  }

  if (!paymentRef) {
    paymentRef = getPaymentRefFromUrl(request);
  }

  if (!paymentRef) {
    return Response.json({ error: "Missing payment reference." }, { status: 400 });
  }

  try {
    const result = confirmPaidCheckout(paymentRef);
    return Response.json({
      message: "Payment confirmed. IMS stock updated and order records created.",
      result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Payment confirmation failed.";
    return Response.json({ error: message }, { status: 400 });
  }
}
