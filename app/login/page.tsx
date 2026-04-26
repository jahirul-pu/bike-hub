import Link from "next/link";
import { LogIn } from "lucide-react";
import { signInWithCredentials, signInWithGoogle } from "@/app/login/actions";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const callbackUrl =
    typeof resolvedSearchParams.callbackUrl === "string" && resolvedSearchParams.callbackUrl.startsWith("/")
      ? resolvedSearchParams.callbackUrl
      : "/account";
  const hasCredentialsError = resolvedSearchParams.error === "invalid-credentials";

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
          {hasCredentialsError ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              Invalid email or password. Please try again.
            </p>
          ) : null}

          <form action={signInWithCredentials} className="space-y-4">
            <input type="hidden" name="callbackUrl" value={callbackUrl} />

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="you@example.com" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" placeholder="Enter password" required />
            </div>

            <button
              type="submit"
              className={cn(buttonVariants(), "w-full bg-slate-900 text-white hover:bg-slate-700")}
            >
              Sign In with Email
            </button>
          </form>

          <form action={signInWithGoogle}>
            <input type="hidden" name="callbackUrl" value={callbackUrl} />
            <button
              type="submit"
              className={cn(buttonVariants({ variant: "outline" }), "w-full border-slate-300 bg-white")}
            >
              Continue with Google
            </button>
          </form>

          <div className="rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2 text-xs text-slate-600">
            <p className="font-semibold uppercase tracking-[0.08em] text-slate-700">Demo Credentials</p>
            <p>User: r15@bikehub.dev / r15rider123</p>
            <p>Admin: admin@bikehub.com / admin123</p>
            <p>Tech: tech@bikehub.dev / techpass123</p>
          </div>

          <Link
            href="/signup"
            className={cn(buttonVariants({ variant: "outline" }), "w-full border-slate-300 bg-white")}
          >
            Need an account? Signup
          </Link>

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
