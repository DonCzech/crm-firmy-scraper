import Link from 'next/link';
import { DorioLogo } from './DorioLogo';

const LINKS = [
  { group: 'Pro nájemníky', items: [{ label: 'Hledat byty', href: '/vyhledat?offerType=RENT&estateType=APARTMENT' }, { label: 'Hledat domy', href: '/vyhledat?offerType=RENT&estateType=HOUSE' }, { label: 'Hlídací pes', href: '/hlidaci-pes' }] },
  { group: 'Pro majitele', items: [{ label: 'Vložit inzerát', href: '/pridat-inzerat' }, { label: 'Ceník', href: '/cenik' }, { label: 'Premium', href: '/premium' }] },
  { group: 'Účet', items: [{ label: 'Přihlásit se', href: '/auth' }, { label: 'Oblíbené', href: '/oblibene' }, { label: 'Zprávy', href: '/zpravy' }] },
];

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 py-12">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <DorioLogo />
            <p className="mt-3 text-sm text-gray-500">Reality bez provize – přímo od majitelů.</p>
          </div>
          {LINKS.map((group) => (
            <div key={group.group}>
              <h3 className="mb-3 text-sm font-semibold text-gray-900">{group.group}</h3>
              <ul className="space-y-2">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-sm text-gray-500 hover:text-gray-900 transition">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 border-t border-gray-200 pt-6 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} Dorio. Všechna práva vyhrazena.
        </div>
      </div>
    </footer>
  );
}
