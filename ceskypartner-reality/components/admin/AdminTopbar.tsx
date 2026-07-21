"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Bell, Search, Command, Sun, Moon } from "lucide-react";
import { useTheme } from "./AdminThemeProvider";

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  "/admin": { title: "Dashboard", subtitle: "Prehled vasi realitni kancelare" },
  "/admin/nemovitosti": { title: "Nemovitosti", subtitle: "Sprava inzeratu a nabidek" },
  "/admin/nemovitosti/novy": { title: "Novy inzerat", subtitle: "Vytvorte novou nabidku" },
  "/admin/blog": { title: "Blog", subtitle: "Clanky a novinky" },
  "/admin/media": { title: "Media", subtitle: "Knihovna souboru" },
  "/admin/poptavky": { title: "Poptavky", subtitle: "Zpravy od klientu" },
  "/admin/export": { title: "Export", subtitle: "Synchronizace s portaly" },
  "/admin/nastaveni": { title: "Nastaveni", subtitle: "Konfigurace systemu" },
};

function triggerCmdK() {
  window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true }));
}

export default function AdminTopbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { theme, toggle, mounted } = useTheme();

  const pageInfo = PAGE_TITLES[pathname] || { title: "", subtitle: "" };

  const initials = session?.user?.name
    ?.split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() ?? "A";

  return (
    <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-[var(--a-border)] pl-[72px] pr-4 md:pr-8 lg:pl-8">
      <div className="hidden md:block">
        <h1 className="text-[20px] font-semibold tracking-[-0.02em] text-[var(--a-text)]">
          {pageInfo.title}
        </h1>
        <p className="mt-0.5 text-[11.5px] text-[var(--a-text-3)]">{pageInfo.subtitle}</p>
      </div>

      <div className="ml-auto flex items-center gap-2 md:gap-3">
        <button
          type="button"
          onClick={triggerCmdK}
          aria-label="Hledat"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--a-border)] bg-transparent text-[12.5px] text-[var(--a-text-3)] transition-all duration-300 hover:border-[var(--a-border-hover)] hover:text-[var(--a-text-2)] md:w-[220px] md:justify-start md:px-3.5"
        >
          <Search size={14} strokeWidth={1.5} className="shrink-0 md:mr-2.5" />
          <span className="hidden md:inline">Hledat...</span>
          <kbd className="pointer-events-none ml-auto hidden items-center gap-0.5 rounded-md border border-[var(--a-border)] px-1.5 py-0.5 text-[9px] md:flex">
            <Command size={9} />K
          </kbd>
        </button>

        <div className="hidden h-6 w-px bg-[var(--a-border)] md:block" />

        {mounted && (
          <button
            type="button"
            onClick={toggle}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--a-border)] text-[var(--a-text-2)] transition-all duration-300 hover:border-[var(--a-border-hover)] hover:text-[var(--a-text)]"
            aria-label={theme === "dark" ? "Svetly rezim" : "Tmavy rezim"}
          >
            {theme === "dark" ? <Sun size={16} strokeWidth={1.5} /> : <Moon size={16} strokeWidth={1.5} />}
          </button>
        )}

        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--a-border)] text-[var(--a-text-2)] transition-all duration-300 hover:border-[var(--a-border-hover)] hover:text-[var(--a-text)]"
          aria-label="Notifikace"
        >
          <Bell size={16} strokeWidth={1.5} />
          <span className="pulse-dot absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-[var(--a-bronze)]" />
        </button>

        <button
          type="button"
          className="group flex items-center gap-3 rounded-xl border border-[var(--a-border)] py-1.5 pl-1.5 pr-4 transition-all duration-300 hover:border-[var(--a-border-hover)]"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--a-bronze)] to-[#8a6d43] text-[10px] font-semibold text-[#0a0a0b]">
            {initials}
          </div>
          <div className="hidden text-left md:block">
            <p className="text-[12px] font-semibold leading-tight text-[var(--a-text)]">
              {session?.user?.name ?? "Admin"}
            </p>
            <p className="text-[10px] leading-tight text-[var(--a-text-3)]">
              {(session?.user as any)?.role === "ADMIN" ? "Administrator" : "Makler"}
            </p>
          </div>
        </button>
      </div>
    </header>
  );
}
