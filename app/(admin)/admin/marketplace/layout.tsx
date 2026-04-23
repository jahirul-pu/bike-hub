import type { ReactNode } from "react";
import MarketplaceTabs from "@/components/admin/marketplace-tabs";

export default function MarketplaceLayout({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-6">
      <section className="border-b border-slate-200 bg-white/80 px-8 pb-6 pt-8">
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Admin Section</p>
          <h1 className="font-heading text-4xl uppercase tracking-wide text-slate-900">Marketplace</h1>
          <p className="max-w-3xl text-sm text-slate-600">
            Manage marketplace inventory across parts listings and used vehicle submissions.
          </p>
        </div>
        <div className="mt-5">
          <MarketplaceTabs />
        </div>
      </section>
      {children}
    </div>
  );
}
