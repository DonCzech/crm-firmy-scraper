import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TemplateReviewClient } from "./TemplateReviewClient";

interface Props { params: Promise<{ key: string }> }

export const metadata: Metadata = {
  title: "Review šablony — Webero admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function TemplateReviewPage({ params }: Props) {
  const { key } = await params;
  if (!key || !/^[a-z0-9-]+$/.test(key)) return notFound();
  return <TemplateReviewClient templateKey={key} />;
}
