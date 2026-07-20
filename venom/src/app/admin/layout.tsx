import { AdminNav } from "@/components/admin/AdminNav";
import { getPlatformAdmin } from "@/lib/platform-admin";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = (await headers()).get("x-pathname") ?? "";
  const isPublicAdminRoute = pathname === "/admin/login" || pathname === "/admin/setup";
  if (!isPublicAdminRoute && !(await getPlatformAdmin())) redirect("/admin/login");
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminNav />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
