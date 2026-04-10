import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SellBikeWizard } from "@/components/site/sell-bike-wizard";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default async function SellPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/sell");
  }

  if (session.userRole !== "User") {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Card className="border-slate-200 bg-white/90">
          <CardHeader>
            <CardTitle className="font-heading text-3xl uppercase tracking-wide text-slate-900">
              Sell Your Bike
            </CardTitle>
            <CardDescription>
              This wizard is currently available for standard user accounts only.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <Link href="/account" className={cn(buttonVariants(), "bg-slate-900 text-white hover:bg-slate-700")}>Go to My Garage</Link>
            <Link href="/" className={cn(buttonVariants({ variant: "outline" }), "border-slate-300 bg-white")}>Back to Home</Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <SellBikeWizard />
    </div>
  );
}
