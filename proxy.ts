import { NextResponse } from "next/server";
import { auth } from "@/auth";

const adminEmail = "admin@bikehub.com";

export default auth((request) => {
  const pathname = request.nextUrl.pathname;
  const isAdminPath = pathname === "/admin" || pathname.startsWith("/admin/");
  const isAllowed = isAdminPath
    ? request.auth?.user?.userRole === "Admin" && request.auth.user.email?.toLowerCase() === adminEmail
    : Boolean(request.auth?.user);

  if (isAllowed) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.nextUrl.origin);
  loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname + request.nextUrl.search);

  return NextResponse.redirect(loginUrl);
});

export const config = {
  matcher: ["/admin/:path*", "/account/:path*", "/sell/:path*"],
};
