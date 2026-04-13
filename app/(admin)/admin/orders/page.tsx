import { ShoppingCart } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function OrdersPage() {
  return (
    <div className="space-y-6 p-8">
      <header className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-white">
            <ShoppingCart className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Orders</h1>
            <p className="text-sm text-slate-600">This route now resolves correctly and is ready for the order operations UI.</p>
          </div>
        </div>
      </header>

      <Card className="border-slate-200 bg-white/90">
        <CardHeader>
          <CardTitle className="text-slate-900">Next Step</CardTitle>
          <CardDescription>Wire this page to your checkout and fulfillment data when that workflow is ready.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600">
            There is not an order model in Prisma yet, so this page is acting as a stable placeholder instead of returning a 404.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
