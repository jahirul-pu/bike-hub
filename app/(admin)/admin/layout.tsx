import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import AdminSidebar from "@/components/admin/admin-sidebar";

const adminEmail = "admin@bikehub.com";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  if (session?.user?.userRole !== "Admin" || session.user.email?.toLowerCase() !== adminEmail) {
    redirect("/login?callbackUrl=/admin");
  }

  return (
    <div className="relative mx-auto flex w-full max-w-[1600px]">
      <AdminSidebar />
      <div className="min-h-[calc(100vh-4rem)] flex-1 pl-64">
        {children}
      </div>
    </div>
  );
}
