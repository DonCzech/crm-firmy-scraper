import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";
import AdminThemeProvider from "@/components/admin/AdminThemeProvider";
import CmdKSearch from "@/components/admin/CmdKSearch";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminThemeProvider>
      <div className="flex h-full overflow-hidden">
        <AdminSidebar />
        <div
          className="flex flex-1 flex-col overflow-hidden transition-colors duration-500"
          style={{ background: "var(--a-bg)" }}
        >
          <AdminTopbar />
          <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-8">{children}</main>
        </div>
      </div>
      <CmdKSearch />
    </AdminThemeProvider>
  );
}
