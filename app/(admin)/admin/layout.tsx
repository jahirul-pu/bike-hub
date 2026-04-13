import type { ReactNode } from "react";
import AdminSidebar from "@/components/admin/admin-sidebar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative mx-auto flex w-full max-w-[1600px]">
      <AdminSidebar />
      <div className="min-h-[calc(100vh-4rem)] flex-1 pl-64">
        {children}
      </div>
    </div>
  );
}
