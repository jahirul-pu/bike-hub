import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string; paymentMethod?: string }>;
}) {
  const resolved = await searchParams;
  const orderId = resolved.orderId ?? "N/A";
  const paymentMethod = resolved.paymentMethod ?? "bkash";

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-2xl border border-emerald-300 bg-white/90 p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">Thank You</p>
        <h1 className="mt-2 flex items-center gap-2 font-heading text-5xl uppercase tracking-wide text-slate-900 sm:text-6xl">
          <CheckCircle2 className="h-10 w-10 text-emerald-600" />
          Order Confirmed
        </h1>

        <p className="mt-3 text-sm text-slate-700">
          Your order has been placed successfully. Use the details below to continue to payment gateway or track your order.
        </p>

        <dl className="mt-6 grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Order ID</dt>
            <dd className="mt-1 text-sm font-semibold text-slate-900">{orderId}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Payment Method</dt>
            <dd className="mt-1 text-sm font-semibold text-slate-900">{paymentMethod}</dd>
          </div>
        </dl>

        <div className="mt-5 flex flex-wrap gap-2">
          <Link href="/checkout" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "border-slate-300")}>
            Back to Checkout
          </Link>
          <Link href="/marketplace" className={cn(buttonVariants({ size: "sm" }), "bg-slate-900 text-white hover:bg-slate-700")}>
            Continue Shopping
          </Link>
        </div>
      </section>
    </div>
  );
}
