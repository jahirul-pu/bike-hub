import Link from "next/link";
import { LogIn } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <Card className="mx-auto w-full max-w-md border-slate-200 bg-white/90">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading text-4xl uppercase tracking-wide text-slate-900">
            <LogIn className="h-8 w-8" />
            Login
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="Enter password" />
          </div>

          <button className={cn(buttonVariants(), "w-full bg-slate-900 text-white hover:bg-slate-700")}>
            Sign In
          </button>

          <p className="text-xs text-slate-500">
            Demo login screen. Authentication backend can be integrated with NextAuth or custom JWT flow.
          </p>

          <Link
            href="/"
            className={cn(buttonVariants({ variant: "outline" }), "w-full border-slate-300 bg-white")}
          >
            Back to Home
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
