"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type CartItem = {
  id: string;
  name: string;
  unitPriceBdt: number;
  quantity: number;
  imageSrc: string;
};

type DeliveryApiResponse = {
  isLoggedIn: boolean;
  hasAddress: boolean;
  message?: string;
  shippingZone?: "Savar" | "Nationwide";
  deliveryChargeBdt?: number;
  addressSummary?: string;
};

type DeliveryState =
  | { status: "idle" | "loading" }
  | { status: "guest" | "missing-address" | "error"; message: string }
  | {
      status: "ready";
      shippingZone: "Savar" | "Nationwide";
      deliveryChargeBdt: number;
      addressSummary: string;
    };

function makeBikeThumb(label: string, hue: number): string {
  const bg = `hsl(${hue} 68% 94%)`;
  const stripe = `hsl(${hue} 74% 82%)`;
  const accent = `hsl(${hue} 52% 26%)`;
  const encodedLabel = label.toUpperCase().slice(0, 18);

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160" fill="none">
      <rect width="160" height="160" rx="18" fill="${bg}"/>
      <rect x="16" y="16" width="128" height="128" rx="14" fill="${stripe}"/>
      <path d="M40 105h10l14-25h31l11 25h12l-13-30h7c5 0 8-5 6-9l-5-10h-10l4 9H89l-8-15h-9l8 15H63l-9 16h-7z" fill="${accent}"/>
      <circle cx="57" cy="111" r="13" stroke="${accent}" stroke-width="6"/>
      <circle cx="106" cy="111" r="13" stroke="${accent}" stroke-width="6"/>
      <text x="80" y="34" text-anchor="middle" fill="${accent}" font-family="Arial, sans-serif" font-size="14" font-weight="700">${encodedLabel}</text>
    </svg>
  `;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const initialItems: CartItem[] = [
  {
    id: "cart-r15-v4",
    name: "Yamaha R15 V4",
    unitPriceBdt: 650000,
    quantity: 1,
    imageSrc: makeBikeThumb("R15 V4", 206),
  },
  {
    id: "cart-vstrom",
    name: "Suzuki V-Strom 250",
    unitPriceBdt: 530000,
    quantity: 1,
    imageSrc: makeBikeThumb("V-Strom", 156),
  },
  {
    id: "cart-450x",
    name: "Ather 450X Gen 3",
    unitPriceBdt: 340000,
    quantity: 1,
    imageSrc: makeBikeThumb("450X", 34),
  },
];

function formatBdt(value: number): string {
  return `BDT ${new Intl.NumberFormat("en-BD").format(value)}`;
}

export function CartDrawer() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<CartItem[]>(initialItems);
  const [delivery, setDelivery] = useState<DeliveryState>({ status: "idle" });

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const itemCount = useMemo(
    () => items.reduce((total, item) => total + item.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () => items.reduce((total, item) => total + item.unitPriceBdt * item.quantity, 0),
    [items]
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;

    const fetchDeliveryCharge = async () => {
      setDelivery({ status: "loading" });

      try {
        const response = await fetch("/api/cart/delivery", {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load delivery details.");
        }

        const payload = (await response.json()) as DeliveryApiResponse;

        if (cancelled) {
          return;
        }

        if (!payload.isLoggedIn) {
          setDelivery({
            status: "guest",
            message: payload.message ?? "Login to see delivery charge.",
          });
          return;
        }

        if (!payload.hasAddress) {
          setDelivery({
            status: "missing-address",
            message: payload.message ?? "Add an address to see delivery charge.",
          });
          return;
        }

        if (typeof payload.deliveryChargeBdt !== "number" || !payload.shippingZone) {
          setDelivery({
            status: "error",
            message: "Unable to calculate delivery charge right now.",
          });
          return;
        }

        setDelivery({
          status: "ready",
          shippingZone: payload.shippingZone,
          deliveryChargeBdt: payload.deliveryChargeBdt,
          addressSummary: payload.addressSummary ?? "Saved address",
        });
      } catch {
        if (!cancelled) {
          setDelivery({
            status: "error",
            message: "Unable to load delivery charge.",
          });
        }
      }
    };

    void fetchDeliveryCharge();

    return () => {
      cancelled = true;
    };
  }, [open]);

  const deliveryChargeBdt = delivery.status === "ready" ? delivery.deliveryChargeBdt : 0;
  const totalWithDelivery = subtotal + deliveryChargeBdt;
  const deliveryNotice =
    delivery.status === "guest" || delivery.status === "missing-address" || delivery.status === "error"
      ? delivery.message
      : null;

  const increaseQty = (id: string) => {
    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQty = (id: string) => {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity - 1) }
          : item
      )
    );
  };

  const removeItem = (id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label="Open cart"
        render={
          <Button
            variant="outline"
            size="icon"
            className="relative h-9 w-9 border-slate-300 bg-white/80 text-slate-900 hover:bg-slate-100"
          />
        }
      >
        <ShoppingCart className="h-4 w-4" />
        {itemCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-900 px-1.5 text-[10px] font-semibold text-white">
            {itemCount}
          </span>
        )}
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-full gap-0 border-l border-slate-200 bg-white/85 p-0 text-slate-900 backdrop-blur-xl sm:max-w-md"
      >
        <SheetHeader className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/75 pr-14 backdrop-blur-md">
          <SheetTitle className="font-heading text-3xl uppercase tracking-wide text-slate-900">
            Cart
          </SheetTitle>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            {itemCount} item{itemCount === 1 ? "" : "s"} ready to roll
          </p>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {items.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500">
                Your cart is empty. Add an item to continue.
              </div>
            ) : (
              items.map((item, index) => {
                const lineTotal = item.unitPriceBdt * item.quantity;

                return (
                  <article
                    key={item.id}
                    className={cn(
                      "grid grid-cols-[84px_minmax(0,1fr)] gap-3 rounded-2xl border border-slate-200 bg-white p-2.5 shadow-sm",
                      open && "cart-item-stagger"
                    )}
                    style={open ? { animationDelay: `${index * 70}ms` } : undefined}
                  >
                    <Image
                      src={item.imageSrc}
                      alt={item.name}
                      width={84}
                      height={84}
                      unoptimized
                      className="h-[84px] w-[84px] rounded-xl border border-slate-200 object-cover"
                    />

                    <div className="min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="truncate text-sm font-semibold text-slate-900">{item.name}</p>
                          <p className="mt-0.5 text-xs text-slate-500">{formatBdt(item.unitPriceBdt)}</p>
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Remove ${item.name}`}
                          onClick={() => removeItem(item.id)}
                          className="shrink-0 text-slate-500 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-2">
                        <div className="inline-flex items-center rounded-full border border-slate-300 bg-slate-50">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Decrease quantity for ${item.name}`}
                            className="rounded-full"
                            onClick={() => decreaseQty(item.id)}
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </Button>
                          <span className="min-w-8 text-center text-sm font-semibold text-slate-900">
                            {item.quantity}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Increase quantity for ${item.name}`}
                            className="rounded-full"
                            onClick={() => increaseQty(item.id)}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </Button>
                        </div>

                        <p className="text-sm font-semibold text-slate-900">
                          {formatBdt(lineTotal)}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>

          <div className="sticky bottom-0 mt-auto border-t border-slate-200 bg-white/90 px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-md">
            <div className="flex items-end justify-between">
              <p className="text-sm text-slate-600">Subtotal</p>
              <p className="text-base font-semibold text-slate-900">{formatBdt(subtotal)}</p>
            </div>

            <div className="mt-1.5 flex items-center justify-between gap-3">
              <p className="text-sm text-slate-600">Delivery</p>
              {delivery.status === "ready" ? (
                <p className="text-sm font-semibold text-slate-900">{formatBdt(delivery.deliveryChargeBdt)}</p>
              ) : delivery.status === "guest" ? (
                <p className="text-xs text-slate-500">
                  <Link href="/login" className="font-semibold text-slate-700 underline underline-offset-2 hover:text-slate-900">
                    Login
                  </Link>{" "}
                  to see delivery charge.
                </p>
              ) : delivery.status === "loading" || delivery.status === "idle" ? (
                <p className="text-xs font-medium uppercase tracking-[0.1em] text-slate-500">Calculating...</p>
              ) : (
                <p className="text-xs font-medium text-slate-600">{deliveryNotice}</p>
              )}
            </div>

            {delivery.status === "ready" ? (
              <p className="mt-1 text-xs uppercase tracking-[0.13em] text-slate-500">
                {delivery.shippingZone} rate • {delivery.addressSummary}
              </p>
            ) : null}

            <div className="mt-2 flex items-end justify-between border-t border-slate-200 pt-2">
              <p className="text-sm font-semibold text-slate-700">Total</p>
              <p className="text-xl font-extrabold text-slate-900">{formatBdt(totalWithDelivery)}</p>
            </div>

            <Button
              type="button"
              size="lg"
              className="mt-3 h-13 w-full bg-slate-900 text-base font-bold text-white shadow-[0_18px_35px_-18px_rgba(15,23,42,0.75)] hover:bg-slate-700"
              disabled={items.length === 0}
            >
              Proceed to Checkout
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
