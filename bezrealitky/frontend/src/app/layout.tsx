import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { Providers } from './providers';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

const inter = Inter({ subsets: ['latin', 'latin-ext'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: {
    default: 'Bezrealitky – reality bez provize',
    template: '%s | Bezrealitky',
  },
  description: 'Pronájem a prodej nemovitostí přímo od majitelů bez realitní provize.',
  keywords: ['reality', 'byt', 'pronájem', 'prodej', 'bezrealitky'],
  openGraph: {
    type: 'website',
    locale: 'cs_CZ',
    siteName: 'Bezrealitky',
  },
};

export default function RootLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <html lang="cs" className={inter.variable}>
      <body>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          {modal}
        </Providers>
        <Script
          src="https://backend-jet-seven-94.vercel.app/t.js"
          strategy="afterInteractive"
          data-project="bezrealitky"
          data-endpoint="https://backend-jet-seven-94.vercel.app/api/track"
        />
      </body>
    </html>
  );
}
