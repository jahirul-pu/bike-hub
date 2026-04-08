import Link from "next/link";
import { UserPlus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export default function SignupPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <Card className="mx-auto w-full max-w-md border-slate-200 bg-white/90">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading text-4xl uppercase tracking-wide text-slate-900">
            <UserPlus className="h-8 w-8" />
            Signup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full-name">Full Name</Label>
            <Input id="full-name" type="text" placeholder="Your full name" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-email">Email</Label>
            <Input id="signup-email" type="email" placeholder="you@example.com" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-password">Password</Label>
            <Input id="signup-password" type="password" placeholder="Create password" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input id="confirm-password" type="password" placeholder="Re-enter password" />
          </div>

          <button className={cn(buttonVariants(), "w-full bg-slate-900 text-white hover:bg-slate-700")}>
            Create Account
          </button>

          <p className="text-xs text-slate-500">
            Demo signup screen. Connect this form to your auth backend (NextAuth, Clerk, Supabase, or custom API).
          </p>

          <Link
            href="/login"
            className={cn(buttonVariants({ variant: "outline" }), "w-full border-slate-300 bg-white")}
          >
            Already have an account? Login
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
