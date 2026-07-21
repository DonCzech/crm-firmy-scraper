"use client";

import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Minus, Plus } from "lucide-react";

type Props = {
  lat: number;
  lng: number;
  title: string;
};

/** Kapkový pin — stejný jako na mapě nabídky (S&W styl) */
const PIN_ICON = L.divIcon({
  className: "cp-pin-wrap",
  html: `<svg width="36" height="46" viewBox="0 0 36 46" style="filter:drop-shadow(0 4px 10px rgba(20,24,26,.35))">
    <path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 28 18 28s18-14.5 18-28C36 8.06 27.94 0 18 0Z" fill="#152238"/>
    <circle cx="18" cy="17" r="6" fill="#c5d5c0"/>
  </svg>`,
  iconSize: [36, 46],
  iconAnchor: [18, 46],
});

/** Vlastní minimalistický zoom — vpravo dole, shodný s mapou nabídky */
function CustomZoom() {
  const map = useMap();
  const btn =
    "flex h-[42px] w-[42px] items-center justify-center bg-white text-[#14181A] transition-colors hover:bg-[#faf9f6]";
  return (
    <div className="absolute bottom-4 right-4 z-[1000] flex flex-col shadow-[0_6px_20px_rgba(20,24,26,0.15)]">
      <button type="button" aria-label="Přiblížit" onClick={() => map.zoomIn()} className={`${btn} border-b border-[#edeae3]`}>
        <Plus size={18} strokeWidth={1.6} />
      </button>
      <button type="button" aria-label="Oddálit" onClick={() => map.zoomOut()} className={btn}>
        <Minus size={18} strokeWidth={1.6} />
      </button>
    </div>
  );
}

export default function DetailMapInner({ lat, lng, title }: Props) {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={15}
      scrollWheelZoom={false}
      className="h-full w-full"
      attributionControl={false}
      zoomControl={false}
      aria-label={`Mapa — ${title}`}
    >
      <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
      <CustomZoom />
      <Marker position={[lat, lng]} icon={PIN_ICON} />
    </MapContainer>
  );
}
