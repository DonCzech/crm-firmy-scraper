"use client";

import { useState } from "react";

interface Props {
  url: string;
  title: string;
}

export function SocialShare({ url, title }: Props) {
  const [copied, setCopied] = useState(false);
  const encoded = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  function copyLink() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const channels = [
    { label: "Facebook", color: "#1877F2", href: `https://www.facebook.com/sharer/sharer.php?u=${encoded}`,
      icon: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /> },
    { label: "X", color: "#000", href: `https://x.com/intent/tweet?url=${encoded}&text=${encodedTitle}`,
      icon: <path d="M4 4l6.5 8L4 20h2l5.5-6.8L16 20h4l-6.8-8.4L20 4h-2l-5.2 6.4L8 4H4z" /> },
    { label: "WhatsApp", color: "#25D366", href: `https://wa.me/?text=${encodedTitle}%20${encoded}`,
      icon: <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" /> },
    { label: "E-mail", color: "#6b7280", href: `mailto:?subject=${encodedTitle}&body=${encoded}`,
      icon: <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></> },
  ];

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em" }}>Sdílet</span>
      {channels.map((ch) => (
        <a key={ch.label} href={ch.href} target="_blank" rel="noopener noreferrer" aria-label={ch.label}
          style={{
            width: 34, height: 34, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
            background: "#f3f4f6", color: ch.color, transition: "all 0.15s", textDecoration: "none",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = ch.color; e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "#f3f4f6"; e.currentTarget.style.color = ch.color; }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{ch.icon}</svg>
        </a>
      ))}
      <button onClick={copyLink} aria-label="Kopírovat odkaz" style={{
        width: 34, height: 34, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
        background: copied ? "#22c55e" : "#f3f4f6", color: copied ? "#fff" : "#6b7280",
        border: "none", cursor: "pointer", transition: "all 0.2s",
      }}>
        {copied ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5" /></svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
        )}
      </button>
    </div>
  );
}
