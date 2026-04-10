"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";

function safeCallbackUrl(rawValue: FormDataEntryValue | null): string {
  const callbackUrl = typeof rawValue === "string" ? rawValue : "/account";

  if (!callbackUrl.startsWith("/")) {
    return "/account";
  }

  return callbackUrl;
}

export async function signInWithCredentials(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();
  const redirectTo = safeCallbackUrl(formData.get("callbackUrl"));

  try {
    const resultUrl = await signIn("credentials", {
      email,
      password,
      redirect: false,
      redirectTo,
    });

    const parsedUrl = new URL(String(resultUrl), "http://localhost");
    if (parsedUrl.searchParams.get("error")) {
      redirect(`/login?error=invalid-credentials&callbackUrl=${encodeURIComponent(redirectTo)}`);
    }

    redirect(redirectTo);
  } catch (error) {
    if (error instanceof AuthError) {
      redirect(`/login?error=invalid-credentials&callbackUrl=${encodeURIComponent(redirectTo)}`);
    }

    throw error;
  }
}

export async function signInWithGoogle(formData: FormData) {
  const redirectTo = safeCallbackUrl(formData.get("callbackUrl"));
  await signIn("google", { redirectTo });
}
