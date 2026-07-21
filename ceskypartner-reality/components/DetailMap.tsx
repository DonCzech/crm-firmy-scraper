"use client";

import dynamic from "next/dynamic";

/** Leaflet jen na klientu — stejná mapa jako v „Zobrazit na mapě" na výpisu nabídky */
const DetailMapInner = dynamic(() => import("./DetailMapInner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-stone/60 text-[13px] text-muted">
      <span className="h-2 w-2 animate-pulse rounded-full bg-bronze" aria-hidden="true" />
    </div>
  ),
});

type Props = {
  lat: number;
  lng: number;
  title: string;
  locale?: import("@/lib/locale").SiteLocale;
};

export default function DetailMap({ locale: _locale, ...props }: Props) {
  return <DetailMapInner {...props} />;
}
