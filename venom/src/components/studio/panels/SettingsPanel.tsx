"use client";

import { ExternalLink, FileText, MessageSquare, BarChart3, Puzzle, History, ShieldCheck, User } from "lucide-react";
import type { StudioState } from "../TenantStudioView";

interface Item {
  href: string;
  label: string;
  desc: string;
  Icon: React.ComponentType<{ className?: string }>;
}

export function SettingsPanel({ state }: { state: StudioState }) {
  const items: Item[] = [
    { href: `/demo/${state.tenant.slug}/admin/seo`,       label: "SEO",        desc: "Title, popis, sitemap",  Icon: FileText },
    { href: `/demo/${state.tenant.slug}/admin/blog`,      label: "Blog",       desc: "Články a publikace",     Icon: FileText },
    { href: `/demo/${state.tenant.slug}/admin/contact`,   label: "Zprávy",     desc: "Příchozí formuláře",     Icon: MessageSquare },
    { href: `/demo/${state.tenant.slug}/admin/analytics`, label: "Analytics",  desc: "Návštěvy a konverze",    Icon: BarChart3 },
    { href: `/demo/${state.tenant.slug}/admin/modules`,   label: "Moduly",     desc: "Aktivní funkce",         Icon: Puzzle },
    { href: `/demo/${state.tenant.slug}/admin/revisions`, label: "Verze",      desc: "Historie změn",          Icon: History },
    { href: `/demo/${state.tenant.slug}/admin/audit`,     label: "Audit",      desc: "Záznamy úprav",          Icon: ShieldCheck },
    { href: `/account/dashboard`,                          label: "Můj účet",  desc: "Profil a předplatné",    Icon: User },
  ];
  return (
    <div className="vs-enter p-2">
      {items.map(({ href, label, desc, Icon }) => (
        <a
          key={href}
          href={href}
          className="group mb-0.5 flex items-center gap-2.5 rounded-md px-2 py-2 text-xs transition-colors duration-100 hover:bg-[var(--vs-surface-2)]"
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[var(--vs-surface-2)] text-[var(--vs-text-muted)] transition-colors group-hover:bg-[var(--vs-accent-bg)] group-hover:text-[var(--vs-accent-hi)]">
            <Icon className="h-3.5 w-3.5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="truncate text-[12.5px] font-medium text-[var(--vs-text)]">{label}</div>
            <div className="truncate text-[10.5px] text-[var(--vs-text-muted)]">{desc}</div>
          </div>
          <ExternalLink className="h-3.5 w-3.5 text-[var(--vs-text-dim)] group-hover:text-[var(--vs-text-soft)]" strokeWidth={1.75} />
        </a>
      ))}
    </div>
  );
}
