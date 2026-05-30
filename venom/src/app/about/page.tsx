import { redirect } from "next/navigation";

// In venom SaaS, the about page redirects to homepage
export default function AboutPage() {
  redirect("/");
}
