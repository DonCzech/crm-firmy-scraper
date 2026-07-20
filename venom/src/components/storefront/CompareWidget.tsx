"use client";

/**
 * Modul „Porovnávač produktů“ — přidání do porovnání (localStorage, max 4)
 * + plovoucí lišta s odkazem na /obchod/porovnani.
 */

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

const MAX_COMPARE = 4;
const EVENT = "webero-compare-updated";

function storageKey(tenantSlug: string) {
  return `webero_compare_${tenantSlug}`;
}

export function readCompare(tenantSlug: string): string[] {
  try {
    const raw = localStorage.getItem(storageKey(tenantSlug));
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list.filter((s) => typeof s === "string") : [];
  } catch {
    return [];
  }
}

export function writeCompare(tenantSlug: string, slugs: string[]) {
  localStorage.setItem(storageKey(tenantSlug), JSON.stringify(slugs.slice(0, MAX_COMPARE)));
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function CompareButton({ tenantSlug, productSlug }: { tenantSlug: string; productSlug: string }) {
  const [inCompare, setInCompare] = useState(false);
  const [full, setFull] = useState(false);

  const sync = useCallback(() => {
    const list = readCompare(tenantSlug);
    setInCompare(list.includes(productSlug));
    setFull(list.length >= MAX_COMPARE);
  }, [tenantSlug, productSlug]);

  useEffect(() => {
    sync();
    window.addEventListener(EVENT, sync);
    return () => window.removeEventListener(EVENT, sync);
  }, [sync]);

  function toggle() {
    const list = readCompare(tenantSlug);
    if (list.includes(productSlug)) {
      writeCompare(tenantSlug, list.filter((s) => s !== productSlug));
    } else {
      if (list.length >= MAX_COMPARE) return;
      writeCompare(tenantSlug, [...list, productSlug]);
    }
  }

  return (
    <button type="button" onClick={toggle} disabled={!inCompare && full}
      title={!inCompare && full ? `Porovnat lze max. ${MAX_COMPARE} produkty` : "Přidat do porovnání"}
      className={`flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-xl border transition ${
        inCompare
          ? "border-neutral-950 bg-neutral-950 text-white"
          : "border-neutral-200 text-neutral-400 hover:border-neutral-400 hover:text-neutral-950 disabled:opacity-40"
      }`}
      aria-label={inCompare ? "Odebrat z porovnání" : "Přidat do porovnání"}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 3v18M16 3v18M3 8h5M3 16h5M16 8h5M16 16h5" />
      </svg>
    </button>
  );
}

export function CompareBar({ tenantSlug }: { tenantSlug: string }) {
  const [slugs, setSlugs] = useState<string[]>([]);

  const sync = useCallback(() => setSlugs(readCompare(tenantSlug)), [tenantSlug]);

  useEffect(() => {
    sync();
    window.addEventListener(EVENT, sync);
    return () => window.removeEventListener(EVENT, sync);
  }, [sync]);

  if (slugs.length < 1) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2">
      <div className="flex items-center gap-3 rounded-full bg-neutral-950 py-2.5 pl-5 pr-2.5 text-white shadow-[0_10px_35px_rgba(0,0,0,0.35)]">
        <span className="text-[13px] font-semibold">
          Porovnání <span className="text-white/60">({slugs.length}/{MAX_COMPARE})</span>
        </span>
        <button onClick={() => writeCompare(tenantSlug, [])} className="text-[12px] text-white/50 underline-offset-2 hover:underline">
          Vymazat
        </button>
        <Link href={`/demo/${tenantSlug}/obchod/porovnani`}
          className={`rounded-full px-4 py-2 text-[13px] font-bold transition ${slugs.length >= 2 ? "bg-white text-neutral-950 hover:bg-neutral-200" : "pointer-events-none bg-white/20 text-white/50"}`}>
          Porovnat
        </Link>
      </div>
    </div>
  );
}
