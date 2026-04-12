"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { BadgeCheck, CreditCard, Landmark, ShieldCheck, Smartphone } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCartHydration } from "@/hooks/use-cart-hydration";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/useCartStore";

type ShippingOption = "pickup" | "courier";
type PaymentMethod = "bkash" | "nagad" | "card";

const TAX_RATE = 0.05;

const shippingOptions: Array<{
  value: ShippingOption;
  label: string;
  description: string;
  feeBdt: number;
}> = [
  {
    value: "pickup",
    label: "Savar Local Pickup",
    description: "Collect from Bike Hub Savar counter",
    feeBdt: 0,
  },
  {
    value: "courier",
    label: "Nationwide Courier",
    description: "Home delivery across Bangladesh",
    feeBdt: 120,
  },
];

const paymentMethods: Array<{
  value: PaymentMethod;
  label: string;
  description: string;
  icon: typeof Smartphone;
}> = [
  {
    value: "bkash",
    label: "bKash",
    description: "Instant mobile payment",
    icon: Smartphone,
  },
  {
    value: "nagad",
    label: "Nagad",
    description: "Digital wallet checkout",
    icon: Landmark,
  },
  {
    value: "card",
    label: "Credit/Debit Cards",
    description: "Visa, Mastercard, AMEX",
    icon: CreditCard,
  },
];

function formatBdt(value: number): string {
  return `Tk ${new Intl.NumberFormat("en-BD").format(value)}`;
}

export default function CheckoutPage() {
  const hydrated = useCartHydration();
  const items = useCartStore((state) => state.items);

  const [shippingOption, setShippingOption] = useState<ShippingOption>("pickup");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("bkash");

  const cartItems = useMemo(() => (hydrated ? items : []), [hydrated, items]);

  const selectedShipping = shippingOptions.find((option) => option.value === shippingOption) ?? shippingOptions[0];

  const subtotalBdt = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems]
  );
  const taxBdt = Math.round(subtotalBdt * TAX_RATE);
  const shippingBdt = selectedShipping.feeBdt;
  const totalBdt = subtotalBdt + taxBdt + shippingBdt;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Checkout</p>
        <h1 className="mt-2 font-heading text-5xl uppercase tracking-wide text-slate-900 sm:text-6xl">
          Secure Checkout
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Complete your order with shipping details, preferred payment, and a transparent total breakdown.
        </p>
      </header>

      <div className="mt-7 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.95fr)]">
        <Card className="border-slate-200 bg-white/90">
          <CardHeader>
            <CardTitle className="font-heading text-4xl uppercase tracking-wide text-slate-900">
              Shipping Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1.5 text-sm text-slate-700">
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Full Name</span>
                <input
                  type="text"
                  placeholder="Jahirul Islam"
                  className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                />
              </label>

              <label className="space-y-1.5 text-sm text-slate-700">
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Phone</span>
                <input
                  type="tel"
                  placeholder="01XXXXXXXXX"
                  className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                />
              </label>
            </div>

            <label className="space-y-1.5 text-sm text-slate-700">
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Address</span>
              <textarea
                rows={4}
                placeholder="House, Road, Area, District"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              />
            </label>

            <label className="space-y-1.5 text-sm text-slate-700">
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Delivery Option</span>
              <select
                value={shippingOption}
                onChange={(event) => setShippingOption(event.target.value as ShippingOption)}
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              >
                {shippingOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label} {option.feeBdt === 0 ? "(Free)" : `(Tk ${option.feeBdt})`}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500">
                {selectedShipping.description} {selectedShipping.feeBdt === 0 ? "- Free shipping." : `- Shipping fee ${formatBdt(selectedShipping.feeBdt)}.`}
              </p>
            </label>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white/90">
          <CardHeader>
            <CardTitle className="font-heading text-4xl uppercase tracking-wide text-slate-900">
              Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!hydrated ? (
              <p className="text-sm text-slate-500">Loading your cart...</p>
            ) : cartItems.length === 0 ? (
              <div className="space-y-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
                <p className="text-sm text-slate-600">Your cart is empty. Add parts before checkout.</p>
                <Link
                  href="/marketplace"
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }), "border-slate-300")}
                >
                  Browse Marketplace
                </Link>
              </div>
            ) : (
              <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-2.5">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={52}
                      height={52}
                      unoptimized
                      className="h-13 w-13 rounded-md border border-slate-200 object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">{item.name}</p>
                      <p className="text-xs text-slate-500">
                        Qty {item.quantity} x {formatBdt(item.price)}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">
                      {formatBdt(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-3">
              <div className="flex items-center justify-between text-sm text-slate-700">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">{formatBdt(subtotalBdt)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-700">
                <span>Taxes ({Math.round(TAX_RATE * 100)}%)</span>
                <span className="font-semibold text-slate-900">{formatBdt(taxBdt)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-700">
                <span>Shipping</span>
                <span className="font-semibold text-slate-900">{shippingBdt === 0 ? "Free" : formatBdt(shippingBdt)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200 pt-2 text-base font-bold text-slate-900">
                <span>Total</span>
                <span>{formatBdt(totalBdt)}</span>
              </div>
            </div>

            <section className="space-y-2.5">
              <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Payment Method</h2>
              <div className="grid gap-2">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  const selected = paymentMethod === method.value;

                  return (
                    <button
                      key={method.value}
                      type="button"
                      onClick={() => setPaymentMethod(method.value)}
                      className={cn(
                        "flex items-center justify-between rounded-xl border px-3 py-3 text-left transition",
                        selected
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-300 bg-white text-slate-800 hover:border-slate-400"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <div>
                          <p className="text-sm font-semibold">{method.label}</p>
                          <p className={cn("text-xs", selected ? "text-slate-200" : "text-slate-500")}>{method.description}</p>
                        </div>
                      </div>
                      <span
                        className={cn(
                          "h-4 w-4 rounded-full border",
                          selected ? "border-white bg-white" : "border-slate-400 bg-transparent"
                        )}
                        aria-hidden="true"
                      />
                    </button>
                  );
                })}
              </div>
            </section>

            <Button
              type="button"
              size="lg"
              disabled={!hydrated || cartItems.length === 0}
              className="h-11 w-full bg-slate-900 text-base font-semibold text-white hover:bg-slate-700"
            >
              Confirm and Pay
            </Button>
          </CardContent>
        </Card>
      </div>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white/90 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Trust Bar</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-900">
            <ShieldCheck className="h-3.5 w-3.5" />
            Secure SSL Encryption
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-300 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-900">
            <BadgeCheck className="h-3.5 w-3.5" />
            Authorized Retailer
          </span>
        </div>
      </section>
    </div>
  );
}
