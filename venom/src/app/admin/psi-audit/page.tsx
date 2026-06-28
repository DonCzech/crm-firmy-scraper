import type { Metadata } from "next";
import { PsiAuditClient } from "./PsiAuditClient";

export const metadata: Metadata = {
  title: "PageSpeed audit — Webero admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function PsiAuditPage() {
  return <PsiAuditClient />;
}
