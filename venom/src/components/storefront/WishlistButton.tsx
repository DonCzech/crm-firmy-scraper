"use client";

import { useEffect, useState } from "react";

export function WishlistButton({ tenantSlug, productId, size = 22 }: { tenantSlug: string; productId: number; size?: number }) {
  const [liked, setLiked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [pop, setPop] = useState(false);

  // Počáteční stav ze serveru (session wishlist cookie)
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/demo/${tenantSlug}/shop/wishlist`)
      .then((r) => r.json())
      .then((d: { items?: { product_id: number }[] }) => {
        if (!cancelled && d.items?.some((i) => i.product_id === productId)) setLiked(true);
      })
      .catch(() => { /* noop */ });
    return () => { cancelled = true; };
  }, [tenantSlug, productId]);

  async function toggle() {
    if (busy) return;
    setBusy(true);
    const action = liked ? "remove" : "add";
    try {
      await fetch(`/api/demo/${tenantSlug}/shop/wishlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, action }),
      });
      setLiked(!liked);
      if (!liked) { setPop(true); setTimeout(() => setPop(false), 500); }
      window.dispatchEvent(new CustomEvent("webero-wishlist-updated"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <style>{`
        @keyframes wishPop { 0% { transform: scale(1); } 35% { transform: scale(1.45); } 65% { transform: scale(0.9); } 100% { transform: scale(1); } }
        @keyframes wishNudge { 0%, 88%, 100% { transform: scale(1); } 91% { transform: scale(1.12); } 94% { transform: scale(0.96); } 97% { transform: scale(1.06); } }
        .wish-idle svg { animation: wishNudge 9s ease-in-out 4s infinite; }
      `}</style>
      <button
        onClick={toggle}
        aria-label={liked ? "Odebrat z oblíbených" : "Přidat do oblíbených"}
        title={liked ? "Odebrat z oblíbených" : "Přidat do oblíbených"}
        className={liked ? "" : "wish-idle"}
        style={{
          width: 48, height: 48, borderRadius: 10, flexShrink: 0,
          border: liked ? "1.5px solid #fca5a5" : "1.5px solid #d4d4d4",
          background: liked ? "#fef2f2" : "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", transition: "all 0.2s",
          color: liked ? "#ef4444" : "#525252",
        }}
      >
        <svg width={size} height={size} viewBox="0 0 24 24"
          fill={liked ? "#ef4444" : "none"}
          stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"
          style={{ transition: "fill 0.2s, stroke 0.2s", animation: pop ? "wishPop 0.5s ease" : undefined }}>
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>
    </>
  );
}
