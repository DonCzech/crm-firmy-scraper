"use client";
import dynamic from "next/dynamic";
import { useContent } from "@/astera/context/ContentContext";

const LiveEditor = dynamic(() => import("./LiveEditor"), {
  ssr: false,
  loading: () => null,
});

export default function LiveEditorLoader() {
  const { admin } = useContent();
  if (!admin.isAdmin) return null;
  return <LiveEditor />;
}
