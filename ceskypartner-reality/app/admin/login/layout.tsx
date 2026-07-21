import type { Metadata } from "next";
import SessionProvider from "@/components/admin/SessionProvider";

export const metadata: Metadata = {
  title: "Přihlášení | Český Partner Admin",
  robots: "noindex, nofollow",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SessionProvider>{children}</SessionProvider>;
}
