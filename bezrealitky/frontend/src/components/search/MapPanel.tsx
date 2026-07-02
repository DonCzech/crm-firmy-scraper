'use client';

import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { formatPrice } from '@/lib/utils';

interface Listing {
  id: string;
  slug: string;
  title: string;
  price: number;
  city?: string;
  lat?: number;
  lon?: number;
  media?: { url: string; isCover: boolean }[];
}

export function MapPanel({ listings }: { listings: Listing[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  // Init map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapRef.current = new maplibregl.Map({
      container: containerRef.current,
      style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      center: [15.5, 49.8],
      zoom: 7,
    });

    mapRef.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // Update markers when listings change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const withCoords = listings.filter((l) => l.lat && l.lon);
    if (withCoords.length === 0) return;

    const bounds = new maplibregl.LngLatBounds();

    withCoords.forEach((l) => {
      const coverUrl = l.media?.find((m) => m.isCover)?.url ?? l.media?.[0]?.url;

      const popup = new maplibregl.Popup({ offset: 28, maxWidth: '220px' }).setHTML(`
        <div style="font-family:sans-serif;font-size:13px;line-height:1.4">
          ${coverUrl ? `<img src="${coverUrl}" style="width:100%;height:100px;object-fit:cover;border-radius:6px;margin-bottom:6px" />` : ''}
          <a href="/inzerat/${l.slug}" target="_blank" style="font-weight:600;color:#111;text-decoration:none;display:block;margin-bottom:2px">${l.title}</a>
          ${l.city ? `<span style="color:#6b7280;font-size:11px">${l.city}</span>` : ''}
          <div style="color:#16a34a;font-weight:700;margin-top:4px">${formatPrice(l.price)}</div>
        </div>
      `);

      const el = document.createElement('div');
      el.style.cssText = `
        background:#16a34a;color:white;font-weight:700;font-size:11px;
        padding:3px 7px;border-radius:12px;white-space:nowrap;
        box-shadow:0 2px 6px rgba(0,0,0,.25);cursor:pointer;
        font-family:sans-serif;
      `;
      el.textContent = formatPrice(l.price);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([l.lon!, l.lat!])
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(marker);
      bounds.extend([l.lon!, l.lat!]);
    });

    // Auto-fit to markers
    if (withCoords.length === 1) {
      map.flyTo({ center: [withCoords[0].lon!, withCoords[0].lat!], zoom: 14 });
    } else {
      map.fitBounds(bounds, { padding: 60, maxZoom: 14 });
    }
  }, [listings]);

  return (
    <div style={{ position: 'relative', height: '100%', minHeight: '600px' }}>
      <div ref={containerRef} style={{ height: '100%', width: '100%', borderRadius: '12px' }} />
    </div>
  );
}
