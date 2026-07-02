"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Users,
  CreditCard,
  Bell,
  Building2,
  X,
  Zap,
  BarChart3,
  RefreshCw,
  Receipt,
  FileCheck,
  Tag,
  Landmark,
  Hash,
  Palette,
  Copy,
  Activity,
} from "lucide-react";

const nav = [
  { label: "Přehled", href: "/dashboard", icon: LayoutDashboard },
  { label: "Faktury", href: "/dashboard/invoices", icon: FileText },
  { label: "Nabídky", href: "/dashboard/quotes", icon: FileCheck },
  { label: "Náklady", href: "/dashboard/expenses", icon: Receipt },
  { label: "Pravidelné faktury", href: "/dashboard/invoices/recurring", icon: RefreshCw },
  { label: "Klienti", href: "/dashboard/clients", icon: Users },
  { label: "Statistiky", href: "/dashboard/statistiky", icon: BarChart3 },
  { label: "Automatizace", href: "/dashboard/automation", icon: Activity },
  { label: "Upozornění", href: "/dashboard/notifications", icon: Bell },
];

const settingsNav = [
  { label: "Moje firma", href: "/dashboard/settings/company", icon: Building2 },
  { label: "Číslování", href: "/dashboard/settings/numbering", icon: Hash },
  { label: "Vzhled faktur", href: "/dashboard/settings/appearance", icon: Palette },
  { label: "Šablony", href: "/dashboard/settings/templates", icon: Copy },
  { label: "Bankovní účty", href: "/dashboard/settings/bank-accounts", icon: Landmark },
  { label: "Štítky", href: "/dashboard/settings/tags", icon: Tag },
  { label: "Předplatné", href: "/dashboard/settings/billing", icon: CreditCard },
];

export default function Sidebar({ open, onClose, plan }: {
  open: boolean;
  onClose: () => void;
  plan: string;
}) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname.startsWith(href);

  return (
    <aside
      className={`design-sidebar ${open ? "open" : ""}`}
    >
      <div className="brand">
        <Link href="/dashboard" onClick={onClose} className="flex items-center gap-3">
          <div className="brand-mark">
            <Zap className="w-5 h-5" />
          </div>
          <span className="brand-name">Fakturina<span className="brand-dot">.</span></span>
        </Link>
        <button onClick={onClose} className="ml-auto lg:hidden icon-btn" aria-label="Zavřít menu">
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="nav-group overflow-y-auto">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`nav-item ${active ? "active" : ""}`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {item.label}
              {item.href === "/dashboard/notifications" && <span className="nav-badge">!</span>}
            </Link>
          );
        })}

        <div className="nav-label">Nastavení</div>

        {settingsNav.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`nav-item ${active ? "active" : ""}`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="upgrade">
        <div className="upgrade-title">Tarif {plan === "free" ? "Zdarma" : plan}</div>
        <div className="upgrade-sub">Neomezené faktury, statistiky a automatizace jsou připravené v Pro tarifu.</div>
        <Link href="/dashboard/settings/billing" onClick={onClose} className="upgrade-btn inline-flex items-center justify-center gap-2">
          <Zap className="w-3.5 h-3.5" /> Upgradovat
        </Link>
      </div>
    </aside>
  );
}
