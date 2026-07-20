"use client";

/** Modul „Porovnávač produktů“ — srovnávací tabulka parametrů. */

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { readCompare, writeCompare } from "./CompareWidget";

interface CompareProduct {
  id: number;
  slug: string;
  title: string;
  brand: string | null;
  price_cents: number;
  image_url: string | null;
  params: { id: number; name: string; value: string; unit: string | null }[];
}

function czk(cents: number): string {
  return new Intl.NumberFormat("cs-CZ", { style: "currency", currency: "CZK", maximumFractionDigits: 0 }).format(cents / 100);
}

export function ComparePageClient({ tenantSlug }: { tenantSlug: string }) {
  const [products, setProducts] = useState<CompareProduct[] | null>(null);
  const storeBase = `/demo/${tenantSlug}/obchod`;

  const load = useCallback(async () => {
    const slugs = readCompare(tenantSlug);
    if (!slugs.length) { setProducts([]); return; }
    try {
      const res = await fetch(`/api/demo/${tenantSlug}/shop/compare?slugs=${slugs.join(",")}`);
      const data = await res.json();
      setProducts(res.ok ? data.products ?? [] : []);
    } catch {
      setProducts([]);
    }
  }, [tenantSlug]);

  useEffect(() => { load(); }, [load]);

  function remove(slug: string) {
    writeCompare(tenantSlug, readCompare(tenantSlug).filter((s) => s !== slug));
    load();
  }

  if (products == null) {
    return <div className="flex justify-center py-24"><div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-950" /></div>;
  }

  if (!products.length) {
    return (
      <div className="flex flex-col items-center py-20 text-center">
        <p className="text-[17px] font-bold text-neutral-950">V porovnání zatím nic není</p>
        <p className="mt-1 text-[14px] text-neutral-500">Přidejte produkty tlačítkem porovnání na detailu produktu.</p>
        <Link href={storeBase} className="mt-6 rounded-lg bg-neutral-950 px-6 py-3 text-[14px] font-semibold text-white transition hover:bg-neutral-700">
          Prohlédnout obchod
        </Link>
      </div>
    );
  }

  // Sjednocené řádky parametrů přes všechny produkty
  const paramNames = [...new Set(products.flatMap((p) => p.params.map((x) => x.name)))];

  return (
    <div className="mt-6 overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-[14px]">
        <thead>
          <tr>
            <th className="w-[180px]" />
            {products.map((p) => (
              <th key={p.id} className="min-w-[200px] px-3 pb-4 text-left align-top font-normal">
                <button onClick={() => remove(p.slug)} className="mb-2 text-[12px] text-neutral-400 underline-offset-2 hover:text-red-500 hover:underline">
                  Odebrat
                </button>
                <Link href={`${storeBase}/${p.slug}`} className="block">
                  <span className="block h-36 w-full overflow-hidden rounded-xl bg-neutral-50">
                    {p.image_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image_url} alt="" className="h-full w-full object-cover" />
                    )}
                  </span>
                  <span className="mt-2 line-clamp-2 text-[14px] font-bold leading-snug text-neutral-950 hover:underline">{p.title}</span>
                </Link>
                <span className="mt-1 block text-[16px] font-extrabold tabular-nums text-neutral-950">{czk(p.price_cents)}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="bg-neutral-50/70">
            <th scope="row" className="px-3 py-3 text-left font-semibold text-neutral-500">Značka</th>
            {products.map((p) => <td key={p.id} className="px-3 py-3 font-medium text-neutral-900">{p.brand ?? "—"}</td>)}
          </tr>
          {paramNames.map((name, i) => (
            <tr key={name} className={i % 2 === 1 ? "bg-neutral-50/70" : "bg-white"}>
              <th scope="row" className="px-3 py-3 text-left font-semibold text-neutral-500">{name}</th>
              {products.map((p) => {
                const pp = p.params.find((x) => x.name === name);
                return (
                  <td key={p.id} className="px-3 py-3 font-medium text-neutral-900">
                    {pp ? `${pp.value}${pp.unit && !pp.value.trim().endsWith(pp.unit) ? ` ${pp.unit}` : ""}` : "—"}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
