"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";
import JsonLd from "./JsonLd";

type Props = {
  children: React.ReactNode;
  fontVariable: string;
  plausibleDomain: string;
  organizationData: Record<string, unknown>;
};

export default function LocalizedDocument({
  children,
  fontVariable,
  plausibleDomain,
  organizationData,
}: Props) {
  const pathname = usePathname();
  const lang = pathname === "/en" || pathname.startsWith("/en/") ? "en-GB" : "cs";
  const localizedOrganization =
    lang === "en-GB"
      ? {
          ...organizationData,
          name: "Český Partner Real Estate",
          url: "https://ceskypartner.cz/en",
          areaServed: "Czech Republic",
          address: {
            ...(organizationData.address as Record<string, unknown>),
            addressLocality: "Prague 1",
          },
        }
      : organizationData;

  return (
    <html lang={lang} className={fontVariable}>
      <body className="font-sans">
        {plausibleDomain && (
          <Script
            defer
            data-domain={plausibleDomain}
            src="https://plausible.io/js/script.js"
            strategy="afterInteractive"
          />
        )}
        <JsonLd data={localizedOrganization} />
        {children}
      </body>
    </html>
  );
}
