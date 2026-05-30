"use client";

import { ExternalLink } from "lucide-react";
import type { StudioState } from "../TenantStudioView";

export function SettingsPanel({ state }: { state: StudioState }) {
  const items: Array<{ href: string; label: string; desc: string }> = [
    { href: `/demo/${state.tenant.slug}/admin/seo`, label: "SEO", desc: "Title, popis, sitemap" },
    { href: `/demo/${state.tenant.slug}/admin/blog`, label: "Blog", desc: "Články a publikace" },
    { href: `/demo/${state.tenant.slug}/admin/contact`, label: "Zprávy", desc: "Příchozí formuláře" },
    { href: `/demo/${state.tenant.slug}/admin/analytics`, label: "Analytics", desc: "Návštěvy a konverze" },
    { href: `/demo/${state.tenant.slug}/admin/modules`, label: "Moduly", desc: "Aktivní funkce" },
    { href: `/demo/${state.tenant.slug}/admin/revisions`, label: "Verze", desc: "Historie změn" },
    { href: `/demo/${state.tenant.slug}/admin/audit`, label: "Audit", desc: "Záznamy úprav" },
    { href: `/account/dashboard`, label: "Můj účet", desc: "Profil a předplatné" },
  ];
  return (
    <div className="p-2">
      {items.map((item) => (
        <a
          key={item.href}
          href={item.href}
          className="group flex items-center gap-2 rounded-md px-2 py-2 text-xs text-[#d4d4d8] transition-colors duration-150 hover:bg-[#1f1f22]"
        >
          <div className="flex-1 min-w-0">
            <div className="truncate font-medium text-white">{item.label}</div>
            <div className="truncate text-[10.5px] text-[#71717a]">{item.desc}</div>
          </div>
          <ExternalLink className="h-3.5 w-3.5 text-[#52525b] group-hover:text-white" strokeWidth={1.75} />
        </a>
      ))}
    </div>
  );
}
