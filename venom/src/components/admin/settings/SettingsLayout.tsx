"use client";

import React from "react";
import clsx from "clsx";
import { ArrowLeft, Search, Bell } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
}

interface Props {
  tenantSlug: string;
  activeItem: string;
  title: string;
  actionButton?: React.ReactNode;
  children: React.ReactNode;
}

function getNavItems(tenantSlug: string): { obecne: NavItem[]; pokrocile: NavItem[] } {
  return {
    obecne: [
      { label: "Web", href: `/demo/${tenantSlug}/admin/settings/web` },
      { label: "SEO", href: `/demo/${tenantSlug}/admin/seo` },
      { label: "Cookie lišta", href: `/demo/${tenantSlug}/admin/settings/cookies` },
      { label: "Uživatelské přístupy", href: `/demo/${tenantSlug}/admin/settings/access` },
      { label: "Jazyky", href: `/demo/${tenantSlug}/admin/settings/languages` },
      { label: "E-maily", href: `/demo/${tenantSlug}/admin/settings/emails` },
      { label: "Fakturace a platby", href: `/demo/${tenantSlug}/admin/settings/billing` },
    ],
    pokrocile: [
      { label: "Integrace a API", href: `/demo/${tenantSlug}/admin/settings/api` },
      { label: "Záznam aktivity", href: `/demo/${tenantSlug}/admin/settings/activity` },
      { label: "CSS třídy", href: `/demo/${tenantSlug}/admin/settings/css` },
      { label: "HTTP Hlavičky", href: `/demo/${tenantSlug}/admin/settings/headers` },
      { label: "Přesměrování", href: `/demo/${tenantSlug}/admin/settings/redirects` },
    ],
  };
}

export function SettingsLayout({ tenantSlug, activeItem, title, actionButton, children }: Props) {
  const { obecne, pokrocile } = getNavItems(tenantSlug);

  return (
    <div className="min-h-screen flex bg-[#0a0a0b] text-white">
      {/* Sidebar */}
      <div className="w-[220px] shrink-0 bg-[#0f0f11] border-r border-white/[0.07] flex flex-col">
        {/* Back link */}
        <div className="px-3 py-4 border-b border-white/[0.07]">
          <a
            href={`/demo/${tenantSlug}/admin`}
            className="flex items-center gap-2 text-[12px] text-[#71717a] hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
            Overview
          </a>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-2">
          <div className="px-3 pt-3 pb-1">
            <p className="text-[13px] font-semibold text-white mb-3">Nastavení</p>
          </div>

          <NavSection label="OBECNÉ" items={obecne} activeItem={activeItem} />
          <NavSection label="POKROČILÉ" items={pokrocile} activeItem={activeItem} />
        </nav>

        {/* Bottom icons */}
        <div className="px-3 py-4 border-t border-white/[0.07] flex items-center gap-3">
          <button className="text-[#71717a] hover:text-white transition-colors" title="Hledat">
            <Search className="h-4 w-4" />
          </button>
          <button className="text-[#71717a] hover:text-white transition-colors" title="Notifikace">
            <Bell className="h-4 w-4" />
          </button>
          <div className="ml-auto w-7 h-7 rounded-full bg-[#2563eb] flex items-center justify-center text-[10px] font-bold text-white">
            KA
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header bar */}
        <div className="bg-[#111113] border-b border-white/[0.07] px-8 py-5 flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">{title}</h1>
          {actionButton && <div>{actionButton}</div>}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {children}
        </div>
      </div>
    </div>
  );
}

function NavSection({ label, items, activeItem }: { label: string; items: NavItem[]; activeItem: string }) {
  return (
    <div className="pt-4 pb-1">
      <div className="px-3 pb-1.5 text-[10px] font-bold tracking-[0.10em] text-[#52525b] uppercase">
        {label}
      </div>
      {items.map((item) => {
        const isActive = item.label === activeItem;
        return (
          <a
            key={item.label}
            href={item.href}
            className={clsx(
              "flex w-full items-center px-3 py-[7px] text-[13px] transition-colors duration-100",
              isActive
                ? "bg-[rgba(59,130,246,0.12)] text-white border-l-2 border-blue-500"
                : "text-[#a1a1aa] hover:bg-white/[0.04] hover:text-white"
            )}
          >
            {item.label}
          </a>
        );
      })}
    </div>
  );
}
