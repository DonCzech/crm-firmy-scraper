"use client";
import { use } from "react";
import EditablePage from "@/components/EditablePage";

export default function DynamicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  return <EditablePage slug={slug} />;
}
