"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowUpRight, Settings } from "lucide-react";

export default function BillingActions(
  props:
    | { mode: "upgrade"; plan: "start" | "pro" | "business" }
    | { mode: "portal" }
) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleClick() {
    setLoading(true);
    try {
      if (props.mode === "upgrade") {
        const res = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan: props.plan }),
        });
        const data = await res.json();
        if (data.url) window.location.href = data.url;
      } else {
        const res = await fetch("/api/stripe/portal", { method: "POST" });
        const data = await res.json();
        if (data.url) window.location.href = data.url;
      }
    } finally {
      setLoading(false);
    }
  }

  if (props.mode === "portal") {
    return (
      <button onClick={handleClick} disabled={loading} className="btn-secondary flex items-center gap-2">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Settings className="w-4 h-4" />}
        Spravovat předplatné
      </button>
    );
  }

  return (
    <button onClick={handleClick} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUpRight className="w-4 h-4" />}
      Vybrat tarif
    </button>
  );
}
