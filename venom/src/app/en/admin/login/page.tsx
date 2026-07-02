import type { Metadata } from "next";
import { AdminLoginPageContent } from "@/app/admin/login/AdminLoginPageContent";

export const metadata: Metadata = {
  title: "Log in - Webero",
};

export default function EnglishAdminLoginPage() {
  return <AdminLoginPageContent locale="en" />;
}
