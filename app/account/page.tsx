import { Bike, ClipboardList, ShoppingBag, Sparkles } from "lucide-react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Progress,
} from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getGarageProfileByEmail, getMotowolfUpsellForR15 } from "@/lib/auth/demo-store";
import type { ListingStage, UserRole } from "@/lib/auth/types";
import { cn } from "@/lib/utils";

const listingProgressByStage: Record<ListingStage, number> = {
  Draft: 25,
  Review: 55,
  Live: 85,
  Sold: 100,
};

const roleBadgeClass: Record<UserRole, string> = {
  User: "border-slate-300 bg-slate-100 text-slate-800",
  Admin: "border-emerald-300 bg-emerald-100 text-emerald-800",
  Tech: "border-amber-300 bg-amber-100 text-amber-800",
};

function formatInr(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.email) {
    redirect("/login?callbackUrl=/account");
  }

  const garage = getGarageProfileByEmail(session.user.email);
  const motowolfUpsell = getMotowolfUpsellForR15(session.user.email);
  const role: UserRole = session.userRole ?? "User";

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Dashboard</p>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-heading text-4xl uppercase tracking-wide text-slate-900">My Garage</h1>
          <Badge variant="outline" className={cn("rounded-full px-3", roleBadgeClass[role])}>
            {role}
          </Badge>
        </div>
        <p className="text-sm text-slate-600">
          Welcome back{session?.user?.name ? `, ${session.user.name}` : ""}. Track your bike, listings, and parts orders in one place.
        </p>
      </header>

      <Card className="border-slate-200 bg-white/90">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl text-slate-900">
            <Bike className="h-5 w-5" />
            Primary Bike
          </CardTitle>
          <CardDescription>Your current ride profile.</CardDescription>
        </CardHeader>
        <CardContent>
          {garage.primaryBike ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3">
              <p className="text-sm text-slate-600">Current Ride</p>
              <p className="font-heading text-3xl uppercase tracking-wide text-slate-900">
                {garage.primaryBike.make} {garage.primaryBike.model}
              </p>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Model Year {garage.primaryBike.year}</p>
            </div>
          ) : (
            <p className="text-sm text-slate-600">No primary bike selected yet.</p>
          )}
        </CardContent>
      </Card>

      {motowolfUpsell.length > 0 ? (
        <Card className="border-amber-200 bg-amber-50/70">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-amber-900">
              <Sparkles className="h-5 w-5" />
              Top Rated Motowolf Parts for your R15
            </CardTitle>
            <CardDescription>Prices synced from IMS.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              {motowolfUpsell.map((item) => (
                <div key={item.id} className="rounded-xl border border-amber-200 bg-white px-3 py-2">
                  <p className="text-sm font-semibold text-slate-900">{item.itemName}</p>
                  <p className="text-xs text-slate-600">Rating {item.rating.toFixed(1)} / 5</p>
                  <p className="mt-1 text-sm font-semibold text-amber-800">{formatInr(item.priceInr)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Tabs defaultValue="listings" className="gap-4">
        <TabsList variant="line" className="w-full justify-start rounded-none border-b border-slate-200 p-0 pb-1">
          <TabsTrigger value="listings" className="max-w-48 px-3">
            <ClipboardList className="h-4 w-4" />
            Listing Status
          </TabsTrigger>
          <TabsTrigger value="orders" className="max-w-48 px-3">
            <ShoppingBag className="h-4 w-4" />
            Order History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="listings" className="space-y-4">
          {garage.listings.length > 0 ? (
            garage.listings.map((listing) => {
              const progress = listingProgressByStage[listing.stage];

              return (
                <Card key={listing.id} className="border-slate-200 bg-white/90">
                  <CardHeader>
                    <CardTitle className="text-lg text-slate-900">{listing.bikeTitle}</CardTitle>
                    <CardDescription>
                      Asking Price: {formatInr(listing.askedPriceInr)} • Last update: {listing.stageUpdatedAt}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="rounded-full border-slate-300 bg-slate-100 text-slate-800">
                        {listing.stage}
                      </Badge>
                      <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Listing Tracker {progress}%</p>
                    </div>

                    <Progress value={progress} />
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card className="border-dashed border-slate-300 bg-white/60">
              <CardContent className="pt-4 text-sm text-slate-600">
                You do not have any active listings yet.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="orders">
          <Card className="border-slate-200 bg-white/90">
            <CardHeader>
              <CardTitle className="text-lg text-slate-900">Parts & Accessories Purchases</CardTitle>
              <CardDescription>Your recent checkout history.</CardDescription>
            </CardHeader>
            <CardContent>
              {garage.orderHistory.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {garage.orderHistory.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>
                          <p className="font-medium text-slate-900">{order.itemName}</p>
                          <p className="text-xs text-slate-500">{order.orderedAt}</p>
                        </TableCell>
                        <TableCell>{order.category}</TableCell>
                        <TableCell>{order.status}</TableCell>
                        <TableCell className="text-right font-medium">{formatInr(order.amountInr)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-slate-600">No parts or accessories orders yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
