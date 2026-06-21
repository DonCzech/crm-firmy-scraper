import type { Metadata } from "next";
import { TemplateQueueClient } from "./TemplateQueueClient";

export const metadata: Metadata = {
  title: "Review fronta — Webero admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function TemplateQueuePage() {
  return <TemplateQueueClient />;
}
