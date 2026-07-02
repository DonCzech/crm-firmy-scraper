'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { Bell, Heart, MessageSquare, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getClient } from '@/lib/graphql-client';
import { MY_INQUIRIES } from '@/graphql/queries';
import { DorioLogo } from './DorioLogo';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/vyhledat',    label: 'Hledat' },
  { href: '/hlidaci-pes', label: 'Hlídací pes' },
  { href: '/cenik',       label: 'Ceník' },
  { href: '/premium',     label: 'Premium' },
];

export function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated, accessToken, user, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const { data: inquiriesData } = useQuery({
    queryKey: ['myInquiries'],
    queryFn: () => getClient().request(MY_INQUIRIES),
    enabled: !!accessToken,
    refetchInterval: 30_000,
  });

  const unreadCount = ((inquiriesData as any)?.myInquiries ?? [])
    .filter((i: any) => !i.read).length;

  /* Avatar initials from stored user object */
  const initials = user
    ? ((user as any).firstName?.[0] ?? (user.email?.[0] ?? 'U')).toUpperCase()
    : 'U';

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      {/* ── Main bar: 64 px tall ── */}
      <div className="mx-auto flex h-16 max-w-7xl items-center px-4 lg:px-6">

        {/* Logo */}
        <Link href="/" className="flex-shrink-0 mr-8">
          <DorioLogo />
        </Link>

        {/* ── Primary nav links (desktop) — Zillow tab-underline style ── */}
        <nav className="hidden h-full items-center md:flex">
          {NAV_LINKS.map(({ href, label }) => {
            const active = pathname === href || pathname?.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex h-full items-center px-4 text-[14px] font-medium border-b-[3px] transition-colors',
                  active
                    ? 'border-primary-600 text-primary-700'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300',
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* ── Right side ── */}
        <div className="flex items-center gap-1.5">

          {/* Vložit inzerát — filled primary button */}
          <Link
            href="/pridat-inzerat"
            className="hidden sm:inline-flex items-center rounded-lg bg-primary-600 px-4 py-2 text-[13px] font-semibold text-white hover:bg-primary-700 transition mr-2"
          >
            Vložit inzerát
          </Link>

          {isAuthenticated ? (
            <>
              {/* Bell */}
              <Link
                href="/notifikace"
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition"
                title="Notifikace"
              >
                <Bell size={20} />
              </Link>

              {/* Messages */}
              <Link
                href="/zpravy"
                className="relative rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition"
                title="Zprávy"
              >
                <MessageSquare size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white leading-none">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>

              {/* Saved */}
              <Link
                href="/oblibene"
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition"
                title="Oblíbené"
              >
                <Heart size={20} />
              </Link>

              {/* Avatar with dropdown — Zillow-style initials circle */}
              <div className="relative ml-1">
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600 text-[13px] font-bold text-white hover:bg-primary-700 transition"
                  aria-label="Uživatelské menu"
                >
                  {initials}
                </button>

                {userMenuOpen && (
                  <>
                    {/* Click-outside overlay */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-11 z-50 w-52 rounded-xl border border-gray-100 bg-white py-1 shadow-xl">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Účet</p>
                        <p className="text-sm text-gray-800 truncate">{user?.email}</p>
                      </div>
                      {[
                        { href: '/ucet',        label: 'Nastavení účtu' },
                        { href: '/oblibene',    label: 'Oblíbené' },
                        { href: '/hlidaci-pes', label: 'Hlídací pes' },
                        { href: '/zpravy',      label: 'Zprávy' },
                        { href: '/cenik',       label: 'Členství a platby' },
                      ].map(({ href, label }) => (
                        <Link
                          key={href}
                          href={href}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                        >
                          {label}
                        </Link>
                      ))}
                      <hr className="my-1 border-gray-100" />
                      <button
                        onClick={() => { logout(); setUserMenuOpen(false); }}
                        className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition text-left"
                      >
                        Odhlásit se
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            /* Sign-in button — Zillow outlined style */
            <Link
              href="/auth"
              className="rounded-lg border-2 border-primary-600 px-4 py-1.5 text-[13px] font-semibold text-primary-600 hover:bg-primary-50 transition"
            >
              Přihlásit se
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="ml-1 rounded-full p-2 text-gray-500 hover:bg-gray-100 transition md:hidden"
            aria-label="Menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* ── Mobile dropdown ── */}
      {mobileOpen && (
        <div className="border-t border-gray-100 bg-white px-4 pb-4 pt-2 md:hidden space-y-1">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {label}
            </Link>
          ))}
          <div className="pt-2 space-y-1">
            <Link
              href="/pridat-inzerat"
              onClick={() => setMobileOpen(false)}
              className="block rounded-lg bg-primary-600 px-3 py-2.5 text-center text-sm font-semibold text-white"
            >
              Vložit inzerát
            </Link>
            {isAuthenticated ? (
              <>
                <Link href="/zpravy"    onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50">Zprávy</Link>
                <Link href="/oblibene"  onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50">Oblíbené</Link>
                <Link href="/notifikace" onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50">Notifikace</Link>
                <Link href="/ucet"      onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50">Účet</Link>
                <button
                  onClick={() => { logout(); setMobileOpen(false); }}
                  className="block w-full rounded-lg px-3 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  Odhlásit se
                </button>
              </>
            ) : (
              <Link
                href="/auth"
                onClick={() => setMobileOpen(false)}
                className="block rounded-lg border-2 border-primary-600 px-3 py-2.5 text-center text-sm font-semibold text-primary-600"
              >
                Přihlásit se
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
