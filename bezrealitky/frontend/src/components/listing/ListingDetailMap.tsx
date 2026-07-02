'use client';

import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface Props {
  lat: number;
  lon: number;
  title: string;
}

export function ListingDetailMap({ lat, lon, title }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      center: [lon, lat],
      zoom: 14,
    });

    map.addControl(new maplibregl.NavigationControl(), 'top-right');

    // Custom green marker with popup
    const el = document.createElement('div');
    el.style.cssText = `
      width: 32px; height: 32px; border-radius: 50% 50% 50% 0;
      background: #16a34a; border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      transform: rotate(-45deg);
    `;

    new maplibregl.Marker({ element: el })
      .setLngLat([lon, lat])
      .setPopup(
        new maplibregl.Popup({ offset: 28 }).setHTML(
          `<div style="font-family:sans-serif;font-size:13px;font-weight:600;color:#111;padding:2px 4px">${title}</div>`,
        ),
      )
      .addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [lat, lon, title]);

  return (
    <div
      ref={containerRef}
      style={{ height: '340px', borderRadius: '12px', overflow: 'hidden' }}
    />
  );
}
