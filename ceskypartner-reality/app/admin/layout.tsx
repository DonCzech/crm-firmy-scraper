import type { Metadata } from "next";
import SessionProvider from "@/components/admin/SessionProvider";

export const metadata: Metadata = {
  title: "Admin | Český Partner",
  robots: "noindex, nofollow",
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SessionProvider>{children}</SessionProvider>;
}
