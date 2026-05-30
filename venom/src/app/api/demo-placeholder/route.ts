import { NextRequest } from "next/server";

function clampSize(value: string | null, fallback: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(1, Math.min(3000, Math.round(parsed)));
}

function escapeText(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;");
}

export function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const width = clampSize(searchParams.get("w"), 1200);
  const height = clampSize(searchParams.get("h"), 800);
  const label = escapeText(searchParams.get("label") ?? "Demo image");
  const tone = searchParams.get("tone") === "dark" ? "dark" : "light";

  const bg = tone === "dark" ? "#251d2c" : "#f4eef7";
  const grid = tone === "dark" ? "#3c3144" : "#dfd3e6";
  const text = tone === "dark" ? "#f8f2fb" : "#5f3f70";
  const accent = tone === "dark" ? "#b98add" : "#8d5aa8";

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${label}">
  <rect width="${width}" height="${height}" fill="${bg}"/>
  <defs>
    <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M48 0H0V48" fill="none" stroke="${grid}" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#grid)" opacity="0.55"/>
  <rect x="${Math.max(24, width * 0.05)}" y="${Math.max(24, height * 0.08)}" width="${Math.max(1, width * 0.9)}" height="${Math.max(1, height * 0.84)}" rx="18" fill="none" stroke="${accent}" stroke-width="2" stroke-dasharray="10 10" opacity="0.8"/>
  <circle cx="${width * 0.5}" cy="${height * 0.42}" r="${Math.max(20, Math.min(width, height) * 0.08)}" fill="${accent}" opacity="0.16"/>
  <path d="M ${width * 0.38} ${height * 0.48} L ${width * 0.47} ${height * 0.38} L ${width * 0.55} ${height * 0.48} L ${width * 0.65} ${height * 0.34}" fill="none" stroke="${accent}" stroke-width="${Math.max(4, Math.min(width, height) * 0.012)}" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="50%" y="58%" text-anchor="middle" fill="${text}" font-family="Inter, Arial, sans-serif" font-size="${Math.max(18, Math.min(width, height) * 0.045)}" font-weight="700">${label}</text>
  <text x="50%" y="65%" text-anchor="middle" fill="${text}" font-family="Inter, Arial, sans-serif" font-size="${Math.max(12, Math.min(width, height) * 0.022)}" opacity="0.72">${width} x ${height}</text>
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
