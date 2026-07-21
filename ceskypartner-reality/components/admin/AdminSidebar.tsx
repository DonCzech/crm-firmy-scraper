"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Star,
  LayoutDashboard,
  Building2,
  FileText,
  Image as ImageIcon,
  Inbox,
  Settings,
  Share2,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Users,
  Briefcase,
  ClipboardList,
  SearchCheck,
  Wallet,
  FolderOpen,
  BarChart3,
  MessageSquare,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useState } from "react";

const NAV_GROUPS = [
  {
    label: null,
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Sprava",
    items: [
      { href: "/admin/nemovitosti", label: "Nemovitosti", icon: Building2 },
      { href: "/admin/blog", label: "Blog", icon: FileText },
      { href: "/admin/recenze", label: "Recenze", icon: Star },
      { href: "/admin/media", label: "Media", icon: ImageIcon },
    ],
  },
  {
    label: "Obchod",
    items: [
      { href: "/admin/pripady", label: "Obchodni pripady", icon: Briefcase },
      { href: "/admin/adresar", label: "Adresar", icon: Users },
      { href: "/admin/obecne-poptavky", label: "Obecne poptavky", icon: SearchCheck },
      { href: "/admin/uzaverky", label: "Uzaverky", icon: Wallet },
    ],
  },
  {
    label: "Komunikace",
    items: [
      { href: "/admin/poptavky", label: "Poptavky", icon: Inbox, badge: 2 },
      { href: "/admin/export", label: "Export portaly", icon: Share2 },
      { href: "/admin/nastenka", label: "Nastenka", icon: MessageSquare },
    ],
  },
  {
    label: "Organizace",
    items: [
      { href: "/admin/planovani", label: "Planovani", icon: ClipboardList },
      { href: "/admin/dokumenty", label: "Dokumenty", icon: FolderOpen },
      { href: "/admin/statistiky", label: "Statistiky", icon: BarChart3 },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/admin/nastaveni", label: "Nastaveni", icon: Settings },
    ],
  },
] as const;

export default function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const sidebar = (
    <div
      className="flex h-full w-[264px] flex-col border-r border-white/[0.06]"
      style={{ background: "linear-gradient(180deg, #111114 0%, #0c0c0e 100%)" }}
    >
      {/* Brand */}
      <div className="shrink-0 px-6 pb-6 pt-8">
        <Link href="/admin" className="flex items-center gap-3.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#c4a265] to-[#8a6d43] text-[13px] font-semibold tracking-wide text-[#0a0a0b] shadow-lg shadow-[rgba(196,162,101,0.15)]">
            CP
          </div>
          <div>
            <span className="block text-[15px] font-semibold tracking-[-0.01em] text-[#f0ede8]">
              Cesky Partner
            </span>
            <span className="block text-[10.5px] uppercase tracking-[0.18em] text-white/30">
              Administrace
            </span>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        {NAV_GROUPS.map((group, gi) => (
          <div key={gi} className={gi > 0 ? "mt-6" : ""}>
            {group.label && (
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/25">
                {group.label}
              </p>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`group/item relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] transition-all duration-300 ${
                        active
                          ? "bg-white/[0.06] text-[#f0ede8]"
                          : "text-white/50 hover:bg-white/[0.03] hover:text-white/80"
                      }`}
                    >
                      {active && (
                        <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-[#c4a265]" />
                      )}
                      <item.icon
                        size={17}
                        strokeWidth={active ? 2 : 1.5}
                        className={active ? "text-[#c4a265]" : "transition-colors group-hover/item:text-white/80"}
                      />
                      <span className={active ? "font-semibold" : ""}>{item.label}</span>
                      {"badge" in item && item.badge ? (
                        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-[#c4a265] px-1.5 text-[10px] font-semibold text-[#0a0a0b]">
                          {item.badge}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="shrink-0 border-t border-white/[0.06] px-3 py-4">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[12.5px] text-white/30 transition-all duration-300 hover:bg-white/[0.03] hover:text-white/60"
        >
          <ExternalLink size={15} strokeWidth={1.5} />
          <span>Zobrazit web</span>
        </Link>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[12.5px] text-white/30 transition-all duration-300 hover:bg-red-500/[0.06] hover:text-red-400"
        >
          <LogOut size={15} strokeWidth={1.5} />
          <span>Odhlasit se</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block">{sidebar}</aside>

      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-5 z-50 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-[#131316] text-white shadow-2xl lg:hidden"
        aria-label="Menu"
      >
        <Menu size={18} />
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative h-full">{sidebar}</aside>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="absolute right-4 top-5 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white"
          >
            <X size={18} />
          </button>
        </div>
      )}
    </>
  );
}
