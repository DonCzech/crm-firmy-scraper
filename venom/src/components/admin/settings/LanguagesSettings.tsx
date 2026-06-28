"use client";

import { SettingsLayout } from "./SettingsLayout";

interface Props {
  tenantSlug: string;
}

export function LanguagesSettings({ tenantSlug }: Props) {
  function handleNew() {
    alert("Funkce brzy k dispozici");
  }

  return (
    <SettingsLayout
      tenantSlug={tenantSlug}
      activeItem="Jazyky"
      title="Jazyky"
      actionButton={
        <button
          type="button"
          onClick={handleNew}
          className="rounded-lg bg-[#2563eb] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#1d4ed8] transition-colors"
        >
          Nový záznam
        </button>
      }
    >
      <div className="rounded-xl border border-white/[0.07] bg-[#111113] overflow-hidden">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {["KÓD", "NÁZEV", "VÝCHOZÍ", "AKTIVNÍ"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[10px] font-bold tracking-[0.08em] text-[#52525b] uppercase">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-white/[0.04] hover:bg-white/[0.02] last:border-0">
              <td className="px-4 py-3 font-mono text-[11px] text-white">CS</td>
              <td className="px-4 py-3 text-white">Český</td>
              <td className="px-4 py-3">
                <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-semibold text-green-400">Ano</span>
              </td>
              <td className="px-4 py-3">
                <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-semibold text-green-400">Ano</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </SettingsLayout>
  );
}
