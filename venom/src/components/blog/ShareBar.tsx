"use client";

import { useState } from "react";

interface Props {
  title: string;
  /** Absolute URL of the article */
  url: string;
}

export function ShareBar({ title, url }: Props) {
  const [copied, setCopied] = useState(false);

  const enc = encodeURIComponent;
  const links = [
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`, icon: "f" },
    { label: "X", href: `https://twitter.com/intent/tweet?url=${enc(url)}&text=${enc(title)}`, icon: "𝕏" },
    { label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`, icon: "in" },
    { label: "E-mail", href: `mailto:?subject=${enc(title)}&body=${enc(url)}`, icon: "@" },
  ];

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  }

  const btnCls =
    "w-9 h-9 rounded-full border flex items-center justify-center text-xs font-bold transition-colors duration-200 hover:text-white";

  return (
    <div className="flex items-center gap-2" aria-label="Sdílet článek">
      {links.map((l) => (
        <a
          key={l.label}
          href={l.href}
          target={l.href.startsWith("mailto:") ? undefined : "_blank"}
          rel="noopener noreferrer"
          title={`Sdílet: ${l.label}`}
          className={btnCls}
          style={{ borderColor: "var(--blog-border)", color: "var(--blog-muted)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--blog-primary)";
            e.currentTarget.style.borderColor = "var(--blog-primary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.borderColor = "var(--blog-border)";
          }}
        >
          {l.icon}
        </a>
      ))}
      <button
        type="button"
        onClick={copy}
        title="Kopírovat odkaz"
        className={btnCls}
        style={
          copied
            ? { borderColor: "var(--blog-primary)", backgroundColor: "var(--blog-primary)", color: "var(--blog-on-primary)" }
            : { borderColor: "var(--blog-border)", color: "var(--blog-muted)" }
        }
      >
        {copied ? "✓" : "⧉"}
      </button>
      {copied && (
        <span className="text-xs font-medium" style={{ color: "var(--blog-primary)" }}>
          Zkopírováno
        </span>
      )}
    </div>
  );
}
