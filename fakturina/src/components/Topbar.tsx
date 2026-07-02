"use client";
import { useEffect, useState } from "react";
import { Bell, ChevronDown, LogOut, Menu, Moon, Plus, Search, Sun } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Topbar({ userName, companyName, onMenuClick }: {
  userName: string;
  companyName?: string;
  onMenuClick: () => void;
}) {
  const router = useRouter();
  const [dropOpen, setDropOpen] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("fakturina-theme");
    const shouldDark = saved === "dark";
    setDark(shouldDark);
    document.documentElement.dataset.theme = shouldDark ? "dark" : "light";
  }, []);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.dataset.theme = next ? "dark" : "light";
    localStorage.setItem("fakturina-theme", next ? "dark" : "light");
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <header className="topbar">
      <button onClick={onMenuClick} className="lg:hidden icon-btn" aria-label="Otevřít menu">
        <Menu className="w-5 h-5" />
      </button>

      <div className="company-switch">
        <div className="company-logo">{(companyName ?? "F").slice(0, 2).toUpperCase()}</div>
        <div className="min-w-0">
          <div className="company-name truncate">{companyName ?? "Fakturina"}</div>
          <div className="company-sub">Firemní účet</div>
        </div>
        <ChevronDown className="w-4 h-4 shrink-0" style={{ color: "var(--ink-3)" }} />
      </div>

      <div className="topbar-spacer" />

      <label className="search-pill">
        <Search className="w-4 h-4" />
        <input placeholder="Hledat faktury, klienty..." />
      </label>

      <button className="icon-btn" title="Vzhled" onClick={toggleTheme}>
        {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>
      <Link href="/dashboard/notifications" className="icon-btn" title="Upozornění">
        <Bell className="w-5 h-5" />
      </Link>

      <Link href="/dashboard/invoices/new" className="btn-primary">
        <Plus className="w-4 h-4" />
        <span className="hidden sm:inline">Nová faktura</span>
      </Link>

      <div className="relative">
        <button
          onClick={() => setDropOpen(!dropOpen)}
          className="flex items-center gap-2 py-1.5 pl-1.5 pr-3 rounded-[13px] transition-colors"
          style={{ color: "var(--ink-2)", background: "var(--surface)" }}
        >
          <div className="company-logo !w-8 !h-8 !text-xs">
            {userName.charAt(0).toUpperCase()}
          </div>
          <span className="hidden sm:block font-bold">{userName}</span>
          <ChevronDown className="w-3.5 h-3.5" />
        </button>

        {dropOpen && (
          <div className="absolute right-0 top-full mt-2 w-44 card z-50 py-1">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-colors"
              style={{ color: "var(--overdue)" }}
            >
              <LogOut className="w-4 h-4" />
              Odhlásit se
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
