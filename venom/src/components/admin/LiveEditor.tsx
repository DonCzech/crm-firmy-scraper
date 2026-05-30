"use client";
import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useContent } from "@/context/ContentContext";
import { usePathname } from "next/navigation";
import { SiteContent, NavItem, ManifestCard, FooterLink, CustomPage, PageBlock, BlockType, SiteSettings } from "@/lib/content-types";
import RichTextEditor from "./RichTextEditor";

type Section = keyof SiteContent;

function currentTenantSlug() {
  if (typeof window === "undefined") return "";
  return window.location.pathname.split("/")[2] ?? "";
}

const ALL_SECTIONS: { key: Section; label: string }[] = [
  { key: "header", label: "Header" },
  { key: "hero", label: "Hero" },
  { key: "newsletter", label: "Newsletter" },
  { key: "about", label: "About" },
  { key: "manifest", label: "Cards" },
  { key: "pickacard", label: "Pick Card" },
  { key: "oracle", label: "Oracle" },
  { key: "featuredIn", label: "Média" },
  { key: "footer", label: "Footer" },
  { key: "aboutPage", label: "O nás" },
  { key: "pages", label: "📋 Stránky" },
  { key: "siteSettings", label: "⚙️ Web" },
];

const HOMEPAGE_KEYS: Section[] = ["header", "hero", "newsletter", "about", "manifest", "pickacard", "oracle", "featuredIn", "footer", "siteSettings"];
const CUSTOM_PAGE_KEYS: Section[] = ["pages", "siteSettings"];

const PANEL_W = 460; // panel width desktop

// ── Shared field components ─────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 6 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function PlainInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{ width: "100%", boxSizing: "border-box", padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 7, fontSize: 13, outline: "none", fontFamily: "inherit", background: "#fafafa" }}
    />
  );
}

const COLOR_SWATCHES = [
  "#1f1f1f",
  "#ffffff",
  "#7c3bb2",
  "#5f2a8d",
  "#3b1d55",
  "#b88a35",
  "#f7f0fb",
  "#f9f7f7",
  "#2d2530",
  "#6b7280",
];

function ColorField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  const inputColor = /^#[0-9a-f]{6}$/i.test(value) ? value : "#7c3bb2";

  return (
    <Field label={label}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
        {COLOR_SWATCHES.map(color => (
          <button
            key={color}
            type="button"
            title={color}
            onClick={() => onChange(color)}
            style={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              border: value === color ? "2px solid #111827" : "1px solid #d1d5db",
              background: color,
              cursor: "pointer",
              boxShadow: color === "#ffffff" ? "inset 0 0 0 1px #e5e7eb" : "none",
            }}
          />
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          type="color"
          value={inputColor}
          onChange={e => onChange(e.target.value)}
          style={{ width: 42, height: 34, border: "1px solid #e5e7eb", borderRadius: 7, cursor: "pointer", padding: 2, background: "#fff" }}
        />
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder || "#7c3bb2"}
          style={{ flex: 1, padding: "7px 10px", border: "1px solid #e5e7eb", borderRadius: 7, fontSize: 12, outline: "none", background: "#fafafa", fontFamily: "monospace" }}
        />
      </div>
    </Field>
  );
}

function RTE({ value, onChange, minHeight }: { value: string; onChange: (v: string) => void; minHeight?: number }) {
  return <RichTextEditor value={value} onChange={onChange} minHeight={minHeight ?? 44} />;
}

function ImageField({ label, value, onChange }: { label: string; value: string; onChange: (url: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);

  const displaySrc = preview ?? value;

  useEffect(() => {
    if (!displaySrc) { setDims(null); return; }
    const img = new window.Image();
    img.onload = () => setDims({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => setDims(null);
    img.src = displaySrc;
  }, [displaySrc]);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // Immediate preview
    const reader = new FileReader();
    reader.onload = ev => { if (ev.target?.result) setPreview(ev.target.result as string); };
    reader.readAsDataURL(file);

    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const tenantSlug = currentTenantSlug();
    if (tenantSlug) fd.append("tenantSlug", tenantSlug);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      if (data.url) { onChange(data.url); setPreview(null); }
    } catch (error) {
      alert(error instanceof Error ? error.message : "Obrázek se nepodařilo nahrát.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <Field label={label}>
      {displaySrc && (
        <div style={{ position: "relative", marginBottom: 7 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={displaySrc} alt="" style={{ width: "100%", maxHeight: 110, objectFit: "cover", borderRadius: 7, border: "1px solid #e5e7eb", display: "block" }} />
          {dims && (
            <div style={{ position: "absolute", bottom: 5, right: 6, background: "rgba(0,0,0,0.6)", color: "#fff", fontSize: 10, fontWeight: 600, borderRadius: 4, padding: "2px 6px", fontFamily: "monospace", letterSpacing: "0.3px" }}>
              {dims.w} × {dims.h} px
            </div>
          )}
        </div>
      )}
      <div style={{ display: "flex", gap: 6 }}>
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="/images/..."
          style={{ flex: 1, padding: "7px 10px", border: "1px solid #e5e7eb", borderRadius: 7, fontSize: 12, outline: "none", background: "#fafafa" }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          style={{ padding: "7px 12px", background: "#7c3bb2", color: "#fff", border: "none", borderRadius: 7, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap", fontWeight: 600 }}
        >
          {uploading ? "…" : "📂 Upload"}
        </button>
      </div>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: "none" }} onChange={handleFile} />
    </Field>
  );
}

// ── Divider ─────────────────────────────────────────────────────────────────────

function Divider({ label }: { label?: string }) {
  return (
    <div style={{ margin: "18px 0 14px", display: "flex", alignItems: "center", gap: 8 }}>
      {label && <span style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px", whiteSpace: "nowrap" }}>{label}</span>}
      <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
    </div>
  );
}

// ── Section editors ──────────────────────────────────────────────────────────────

function HeaderEditor() {
  const { content, updateSection } = useContent();
  const h = content.header;
  const upd = (k: string, v: string) => updateSection("header", { ...h, [k]: v });

  const updateNav = useCallback(
    (items: NavItem[]) => updateSection("header", { ...h, navItems: items }),
    [h, updateSection]
  );
  const updateItem = (i: number, field: string, val: string) => {
    const items = h.navItems.map((item, idx) => idx === i ? { ...item, [field]: val } : item);
    updateNav(items);
  };
  const addItem = () => updateNav([...h.navItems, { label: "New Item", href: "#" }]);
  const removeItem = (i: number) => updateNav(h.navItems.filter((_, idx) => idx !== i));

  return (
    <div>
      <Field label="Logo URL">
        <PlainInput value={h.logoHref} onChange={v => upd("logoHref", v)} />
      </Field>
      <Field label="Sign In URL">
        <PlainInput value={h.signInHref} onChange={v => upd("signInHref", v)} />
      </Field>

      <Divider label="Navigační položky" />
      {h.navItems.map((item, i) => (
        <div key={i} style={{ background: "#f9fafb", borderRadius: 8, padding: "10px 12px", marginBottom: 8, border: "1px solid #e5e7eb" }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
            <input type="text" value={item.label} onChange={e => updateItem(i, "label", e.target.value)} placeholder="Label" style={{ flex: 1, padding: "6px 8px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 12, outline: "none" }} />
            <input type="text" value={item.href} onChange={e => updateItem(i, "href", e.target.value)} placeholder="URL" style={{ flex: 2, padding: "6px 8px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 12, outline: "none" }} />
            <button type="button" onClick={() => removeItem(i)} style={{ padding: "6px 9px", background: "#fee2e2", border: "none", borderRadius: 6, fontSize: 12, cursor: "pointer", color: "#c00" }}>✕</button>
          </div>
          {item.dropdown && item.dropdown.length > 0 && (
            <div style={{ paddingLeft: 8, borderLeft: "2px solid #e5e7eb" }}>
              <div style={{ fontSize: 10, color: "#9ca3af", marginBottom: 4, textTransform: "uppercase" }}>Dropdown</div>
              {item.dropdown.map((sub, j) => (
                <div key={j} style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                  <input type="text" value={sub.label} onChange={e => {
                    const items = h.navItems.map((it, idx) => idx === i ? { ...it, dropdown: it.dropdown?.map((s, si) => si === j ? { ...s, label: e.target.value } : s) } : it);
                    updateNav(items);
                  }} style={{ flex: 1, padding: "4px 6px", border: "1px solid #e5e7eb", borderRadius: 4, fontSize: 11, outline: "none" }} />
                  <input type="text" value={sub.href} onChange={e => {
                    const items = h.navItems.map((it, idx) => idx === i ? { ...it, dropdown: it.dropdown?.map((s, si) => si === j ? { ...s, href: e.target.value } : s) } : it);
                    updateNav(items);
                  }} style={{ flex: 2, padding: "4px 6px", border: "1px solid #e5e7eb", borderRadius: 4, fontSize: 11, outline: "none" }} />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
      <button type="button" onClick={addItem} style={{ padding: "7px 14px", background: "#eff6ff", border: "1px solid #7c3bb2", borderRadius: 7, fontSize: 12, cursor: "pointer", color: "#7c3bb2", fontWeight: 600 }}>
        + Přidat položku menu
      </button>
    </div>
  );
}

function HeroEditor() {
  const { content, updateSection } = useContent();
  const h = content.hero;
  const upd = (k: string, v: string) => updateSection("hero", { ...h, [k]: v });

  return (
    <div>
      <Field label="Nadpis (H1)">
        <RTE value={h.title} onChange={v => upd("title", v)} />
      </Field>
      <Field label="Podnadpis">
        <RTE value={h.subtitle} onChange={v => upd("subtitle", v)} />
      </Field>
      <Field label="Text tlačítka">
        <PlainInput value={h.ctaText} onChange={v => upd("ctaText", v)} />
      </Field>
      <Field label="URL tlačítka">
        <PlainInput value={h.ctaHref} onChange={v => upd("ctaHref", v)} />
      </Field>
      <Divider label="Barvy hero sekce" />
      <ColorField label="Barva nadpisu" value={h.titleColor || "#1f1f1f"} onChange={v => upd("titleColor", v)} />
      <ColorField label="Barva podnadpisu" value={h.subtitleColor || "#2d2530"} onChange={v => upd("subtitleColor", v)} />
      <ColorField label="Pozadí textového panelu" value={h.panelBackground || "rgba(255, 255, 255, 0.52)"} onChange={v => upd("panelBackground", v)} placeholder="rgba(255, 255, 255, 0.52)" />
      <ColorField label="Barva hlavního tlačítka" value={h.primaryButtonBg || "#7c3bb2"} onChange={v => upd("primaryButtonBg", v)} />
      <ColorField label="Barva textu tlačítka" value={h.primaryButtonColor || "#ffffff"} onChange={v => upd("primaryButtonColor", v)} />
      <Divider label="Obrázky" />
      <ImageField label="Pozadí hero (desktop i mobil)" value={h.backgroundImage} onChange={v => upd("backgroundImage", v)} />
    </div>
  );
}

function NewsletterEditor() {
  const { content, updateSection } = useContent();
  const n = content.newsletter;
  const upd = (k: string, v: string) => updateSection("newsletter", { ...n, [k]: v });

  return (
    <div>
      <Field label="Nadpis">
        <RTE value={n.title} onChange={v => upd("title", v)} />
      </Field>
      <Field label="Text">
        <RTE value={n.body} onChange={v => upd("body", v)} minHeight={80} />
      </Field>
      <Field label="Text tlačítka">
        <PlainInput value={n.buttonText} onChange={v => upd("buttonText", v)} />
      </Field>
      <ImageField label="Obrázek" value={n.image} onChange={v => upd("image", v)} />
    </div>
  );
}

function AboutEditor() {
  const { content, updateSection } = useContent();
  const a = content.about;
  const upd = (k: string, v: string) => updateSection("about", { ...a, [k]: v });

  return (
    <div>
      <Field label="Nadpis">
        <RTE value={a.title} onChange={v => upd("title", v)} />
      </Field>
      <Field label="Odstavec 1">
        <RTE value={a.body1} onChange={v => upd("body1", v)} minHeight={80} />
      </Field>
      <Field label="Odstavec 2">
        <RTE value={a.body2} onChange={v => upd("body2", v)} minHeight={80} />
      </Field>
      <Field label="Text tlačítka">
        <PlainInput value={a.buttonText} onChange={v => upd("buttonText", v)} />
      </Field>
      <Field label="URL tlačítka">
        <PlainInput value={a.buttonHref} onChange={v => upd("buttonHref", v)} />
      </Field>
      <ImageField label="Obrázek nahoře" value={a.imageTop} onChange={v => upd("imageTop", v)} />
      <ImageField label="Obrázek dole" value={a.imageBottom} onChange={v => upd("imageBottom", v)} />
    </div>
  );
}

function ManifestEditor() {
  const { content, updateSection } = useContent();
  const m = content.manifest;

  const updateCard = (i: number, k: string, v: string) => {
    const cards = m.cards.map((c, idx) => idx === i ? { ...c, [k]: v } : c);
    updateSection("manifest", { ...m, cards });
  };

  return (
    <div>
      <Field label="Nadpis sekce">
        <RTE value={m.sectionTitle} onChange={v => updateSection("manifest", { ...m, sectionTitle: v })} />
      </Field>
      {m.cards.map((card: ManifestCard, i: number) => (
        <div key={i} style={{ borderTop: "1px solid #e5e7eb", paddingTop: 16, marginTop: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#7c3bb2", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Karta {i + 1}: {card.title}
          </div>
          <Field label="Nadpis karty">
            <RTE value={card.title} onChange={v => updateCard(i, "title", v)} />
          </Field>
          <Field label="Text karty">
            <RTE value={card.text} onChange={v => updateCard(i, "text", v)} minHeight={70} />
          </Field>
          <Field label="Text tlačítka">
            <PlainInput value={card.btnText} onChange={v => updateCard(i, "btnText", v)} />
          </Field>
          <Field label="URL tlačítka">
            <PlainInput value={card.btnHref} onChange={v => updateCard(i, "btnHref", v)} />
          </Field>
          <ImageField label="Obrázek karty" value={card.image} onChange={v => updateCard(i, "image", v)} />
          <ImageField label="Badge obrázek" value={card.badge} onChange={v => updateCard(i, "badge", v)} />
        </div>
      ))}
    </div>
  );
}

function PickACardEditor() {
  const { content, updateSection } = useContent();
  const p = content.pickacard;
  const upd = (k: string, v: string) => updateSection("pickacard", { ...p, [k]: v });

  return (
    <div>
      <Field label="Nadpis">
        <RTE value={p.title} onChange={v => upd("title", v)} />
      </Field>
      <Field label="Text">
        <RTE value={p.body} onChange={v => upd("body", v)} minHeight={80} />
      </Field>
      <Field label="Text tlačítka">
        <PlainInput value={p.buttonText} onChange={v => upd("buttonText", v)} />
      </Field>
      <Field label="URL tlačítka">
        <PlainInput value={p.buttonHref} onChange={v => upd("buttonHref", v)} />
      </Field>
      <ImageField label="Obrázek" value={p.image} onChange={v => upd("image", v)} />
    </div>
  );
}

function OracleEditor() {
  const { content, updateSection } = useContent();
  const o = content.oracle;
  const upd = (k: string, v: string) => updateSection("oracle", { ...o, [k]: v });

  return (
    <div>
      <Field label="Nadpis">
        <RTE value={o.title} onChange={v => upd("title", v)} />
      </Field>
      <Field label="Text">
        <RTE value={o.body} onChange={v => upd("body", v)} minHeight={70} />
      </Field>
      <Field label="YouTube embed URL">
        <PlainInput value={o.youtubeUrl} onChange={v => upd("youtubeUrl", v)} placeholder="https://www.youtube.com/embed/..." />
      </Field>
    </div>
  );
}

function FeaturedInEditor() {
  const { content, updateSection } = useContent();
  const featured = content.featuredIn || {
    title: "Objevilo se v médiích",
    brands: ["Česká televize", "Forbes Česko", "Seznam Zprávy", "Radiožurnál", "iDNES.cz", "DVTV", "Elle Czech", "Ženy.cz"],
  };

  const updateBrand = (index: number, value: string) => {
    const brands = [...featured.brands];
    brands[index] = value;
    updateSection("featuredIn", { ...featured, brands });
  };

  return (
    <div>
      <Field label="Nadpis">
        <PlainInput value={featured.title} onChange={value => updateSection("featuredIn", { ...featured, title: value })} />
      </Field>
      {featured.brands.map((brand, index) => (
        <Field key={index} label={`Médium ${index + 1}`}>
          <PlainInput value={brand} onChange={value => updateBrand(index, value)} />
        </Field>
      ))}
    </div>
  );
}

function FooterEditor() {
  const { content, updateSection } = useContent();
  const f = content.footer;

  const updateFooterLink = (i: number, k: string, v: string) => {
    const links = f.footerLinks.map((l, idx) => idx === i ? { ...l, [k]: v } : l);
    updateSection("footer", { ...f, footerLinks: links });
  };
  const addFooterLink = () =>
    updateSection("footer", { ...f, footerLinks: [...f.footerLinks, { label: "New Link", href: "#" }] });
  const removeFooterLink = (i: number) =>
    updateSection("footer", { ...f, footerLinks: f.footerLinks.filter((_, idx) => idx !== i) });

  const updateSocial = (i: number, k: string, v: string) => {
    const links = f.socialLinks.map((l, idx) => idx === i ? { ...l, [k]: v } : l);
    updateSection("footer", { ...f, socialLinks: links });
  };

  return (
    <div>
      <Field label="Nadpis newsletteru">
        <RTE value={f.newsletterTitle} onChange={v => updateSection("footer", { ...f, newsletterTitle: v })} />
      </Field>
      <Field label="Copyright">
        <PlainInput value={f.copyright} onChange={v => updateSection("footer", { ...f, copyright: v })} />
      </Field>

      <Divider label="Odkazy v patičce" />
      {f.footerLinks.map((link: FooterLink, i: number) => (
        <div key={i} style={{ display: "flex", gap: 5, marginBottom: 6 }}>
          <input type="text" value={link.label} onChange={e => updateFooterLink(i, "label", e.target.value)} placeholder="Label" style={{ flex: 1, padding: "6px 8px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 12, outline: "none" }} />
          <input type="text" value={link.href} onChange={e => updateFooterLink(i, "href", e.target.value)} placeholder="URL" style={{ flex: 2, padding: "6px 8px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 12, outline: "none" }} />
          <button type="button" onClick={() => removeFooterLink(i)} style={{ padding: "6px 9px", background: "#fee2e2", border: "none", borderRadius: 6, fontSize: 12, cursor: "pointer", color: "#c00" }}>✕</button>
        </div>
      ))}
      <button type="button" onClick={addFooterLink} style={{ padding: "6px 12px", background: "#eff6ff", border: "1px solid #7c3bb2", borderRadius: 7, fontSize: 12, cursor: "pointer", color: "#7c3bb2", fontWeight: 600, marginBottom: 16 }}>
        + Přidat odkaz
      </button>

      <Divider label="Sociální sítě" />
      {f.socialLinks.map((social, i) => (
        <div key={i} style={{ display: "flex", gap: 5, marginBottom: 6 }}>
          <input type="text" value={social.name} onChange={e => updateSocial(i, "name", e.target.value)} placeholder="Název" style={{ flex: 1, padding: "6px 8px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 12, outline: "none" }} />
          <input type="text" value={social.href} onChange={e => updateSocial(i, "href", e.target.value)} placeholder="URL" style={{ flex: 2, padding: "6px 8px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 12, outline: "none" }} />
        </div>
      ))}
    </div>
  );
}

// ── AboutPage editor ─────────────────────────────────────────────────────────────

function AboutPageEditor() {
  const { content, updateSection } = useContent();
  const p = content.aboutPage;
  const upd = (data: typeof p) => updateSection("aboutPage", data);

  return (
    <div>
      <Field label="Hero nadpis"><RichTextEditor value={p.heroTitle} onChange={v => upd({ ...p, heroTitle: v })} /></Field>
      <Field label="Hero podnapis"><RichTextEditor value={p.heroSubtitle} onChange={v => upd({ ...p, heroSubtitle: v })} /></Field>
      <Field label="Hero obrázek (URL)"><input value={p.heroImage} onChange={e => upd({ ...p, heroImage: e.target.value })} style={{ width: "100%", padding: "6px 8px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 12 }} /></Field>
      <Divider label="Bio texty" />
      <Field label="Bio odstavec 1"><RichTextEditor value={p.bio1} onChange={v => upd({ ...p, bio1: v })} /></Field>
      <Field label="Bio odstavec 2"><RichTextEditor value={p.bio2} onChange={v => upd({ ...p, bio2: v })} /></Field>
      <Field label="Bio odstavec 3"><RichTextEditor value={p.bio3} onChange={v => upd({ ...p, bio3: v })} /></Field>
      <Divider label="Citát" />
      <Field label="Text citátu"><RichTextEditor value={p.quoteText} onChange={v => upd({ ...p, quoteText: v })} /></Field>
      <Field label="Autor citátu"><input value={p.quoteAuthor} onChange={e => upd({ ...p, quoteAuthor: e.target.value })} style={{ width: "100%", padding: "6px 8px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 12 }} /></Field>
      <Divider label="CTA sekce" />
      <Field label="CTA nadpis"><RichTextEditor value={p.ctaTitle} onChange={v => upd({ ...p, ctaTitle: v })} /></Field>
      <Field label="CTA text"><RichTextEditor value={p.ctaText} onChange={v => upd({ ...p, ctaText: v })} /></Field>
      <Field label="CTA button text"><input value={p.ctaButtonText} onChange={e => upd({ ...p, ctaButtonText: e.target.value })} style={{ width: "100%", padding: "6px 8px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 12 }} /></Field>
      <Field label="CTA button href"><input value={p.ctaButtonHref} onChange={e => upd({ ...p, ctaButtonHref: e.target.value })} style={{ width: "100%", padding: "6px 8px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 12 }} /></Field>
      <Divider label="Statistiky" />
      {p.statsItems.map((item, i) => (
        <div key={i} style={{ display: "flex", gap: 6, marginBottom: 8 }}>
          <input value={item.number} onChange={e => { const arr = [...p.statsItems]; arr[i] = { ...arr[i], number: e.target.value }; upd({ ...p, statsItems: arr }); }}
            placeholder="2M+" style={{ flex: 1, padding: "6px 8px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 12 }} />
          <input value={item.label} onChange={e => { const arr = [...p.statsItems]; arr[i] = { ...arr[i], label: e.target.value }; upd({ ...p, statsItems: arr }); }}
            placeholder="Popis" style={{ flex: 2, padding: "6px 8px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 12 }} />
        </div>
      ))}
    </div>
  );
}

// ── Pages editor ─────────────────────────────────────────────────────────────────

const BLOCK_TYPES: { type: BlockType; label: string; icon: string }[] = [
  { type: "hero-section", label: "Hero sekce", icon: "🌟" },
  { type: "cards-grid", label: "Karty (grid)", icon: "🃏" },
  { type: "two-col", label: "Dva sloupce", icon: "⬛⬛" },
  { type: "heading", label: "Nadpis", icon: "H" },
  { type: "text", label: "Text", icon: "T" },
  { type: "image", label: "Obrázek", icon: "🖼" },
  { type: "button", label: "Button", icon: "⬜" },
  { type: "banner", label: "Banner", icon: "🎨" },
  { type: "newsletter", label: "Newsletter", icon: "📧" },
  { type: "spacer", label: "Mezera", icon: "↕" },
];

// ── Cards grid block editor (own component, needs card-level state) ─────────────

function CardsGridBlockEditor({ block, onUpdate }: { block: PageBlock; onUpdate: (b: PageBlock) => void }) {
  const cards = block.cards || [];

  function updateCard(i: number, field: string, val: string) {
    const arr = [...cards];
    arr[i] = { ...arr[i], [field]: val };
    onUpdate({ ...block, cards: arr });
  }

  function addCard() {
    onUpdate({ ...block, cards: [...cards, { image: "", title: "Nová karta", text: "", btnText: "Zjistit více", btnHref: "#" }] });
  }

  function removeCard(i: number) {
    onUpdate({ ...block, cards: cards.filter((_, idx) => idx !== i) });
  }

  const cardInp = (i: number, label: string, field: string) => (
    <div style={{ marginBottom: 5 }}>
      <label style={{ display: "block", fontSize: 10, color: "#9ca3af", marginBottom: 2 }}>{label}</label>
      <input value={(cards[i] as Record<string, string>)[field] || ""} onChange={e => updateCard(i, field, e.target.value)}
        style={{ width: "100%", padding: "4px 7px", border: "1px solid #e5e7eb", borderRadius: 5, fontSize: 11, boxSizing: "border-box" }} />
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", marginBottom: 3 }}>Název sekce</label>
        <input value={block.sectionTitle || ""} onChange={e => onUpdate({ ...block, sectionTitle: e.target.value })}
          style={{ width: "100%", padding: "5px 8px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 12, boxSizing: "border-box" }} />
      </div>
      {cards.map((_, i) => (
        <div key={i} style={{ border: "1px solid #e5e7eb", borderRadius: 7, padding: "8px", marginBottom: 8, background: "#f9fafb" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#374151" }}>Karta {i + 1}</span>
            <button onClick={() => removeCard(i)} style={{ fontSize: 11, color: "#ef4444", border: "1px solid #fca5a5", background: "#fff", borderRadius: 5, padding: "2px 7px", cursor: "pointer" }}>✕</button>
          </div>
          <ImageField label="Obrázek karty" value={cards[i].image || ""} onChange={v => updateCard(i, "image", v)} />
          {cardInp(i, "Nadpis karty", "title")}
          {cardInp(i, "Text karty", "text")}
          {cardInp(i, "Text tlačítka", "btnText")}
          {cardInp(i, "URL tlačítka", "btnHref")}
        </div>
      ))}
      <button onClick={addCard} style={{ width: "100%", padding: "7px", fontSize: 12, fontWeight: 600, background: "#f0f9ff", border: "1px dashed #7c3bb2", borderRadius: 6, cursor: "pointer", color: "#7c3bb2" }}>
        + Přidat kartu
      </button>
    </div>
  );
}

function BlockEditorPanel({ block, onUpdate, onDelete, onUp, onDown, isFirst, isLast }: {
  block: PageBlock;
  onUpdate: (b: PageBlock) => void;
  onDelete: () => void;
  onUp: () => void;
  onDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const inp = (label: string, key: keyof PageBlock, type = "text") => (
    <div style={{ marginBottom: 8 }}>
      <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", marginBottom: 3 }}>{label}</label>
      <input
        type={type}
        value={(block[key] as string) || ""}
        onChange={e => onUpdate({ ...block, [key]: type === "number" ? Number(e.target.value) : e.target.value })}
        style={{ width: "100%", padding: "5px 8px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 12, boxSizing: "border-box" }}
      />
    </div>
  );
  const sel = (label: string, key: keyof PageBlock, options: string[]) => (
    <div style={{ marginBottom: 8 }}>
      <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", marginBottom: 3 }}>{label}</label>
      <select value={(block[key] as string) || ""} onChange={e => onUpdate({ ...block, [key]: e.target.value })}
        style={{ width: "100%", padding: "5px 8px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 12 }}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  const btype = BLOCK_TYPES.find(bt => bt.type === block.type);

  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, marginBottom: 8, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", padding: "8px 10px", background: "#f9fafb", gap: 4 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#374151", flex: 1, cursor: "pointer" }} onClick={() => setExpanded(e => !e)}>
          {btype?.icon} {btype?.label} {expanded ? "▲" : "▼"}
        </span>
        <button onClick={onUp} disabled={isFirst} style={{ padding: "2px 7px", fontSize: 12, border: "1px solid #e5e7eb", borderRadius: 5, background: "#fff", cursor: isFirst ? "default" : "pointer", opacity: isFirst ? 0.4 : 1 }}>↑</button>
        <button onClick={onDown} disabled={isLast} style={{ padding: "2px 7px", fontSize: 12, border: "1px solid #e5e7eb", borderRadius: 5, background: "#fff", cursor: isLast ? "default" : "pointer", opacity: isLast ? 0.4 : 1 }}>↓</button>
        <button onClick={onDelete} style={{ padding: "2px 7px", fontSize: 12, border: "1px solid #fca5a5", borderRadius: 5, background: "#fff", color: "#ef4444", cursor: "pointer" }}>✕</button>
      </div>
      {expanded && (
        <div style={{ padding: "10px 12px" }}>
          {/* Common fields */}
          {(block.type === "heading") && <>
            {inp("Text nadpisu", "content")}
            {sel("Úroveň", "level", ["h1", "h2", "h3", "h4"])}
            {sel("Zarovnání", "align", ["left", "center", "right"])}
            {inp("Barva (#hex)", "color")}
            {inp("Velikost (px)", "fontSize", "number")}
          </>}
          {block.type === "text" && <>
            <div style={{ marginBottom: 8 }}>
              <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", marginBottom: 3 }}>Obsah (HTML)</label>
              <textarea value={block.content || ""} onChange={e => onUpdate({ ...block, content: e.target.value })}
                rows={4} style={{ width: "100%", padding: "5px 8px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 12, boxSizing: "border-box", resize: "vertical" }} />
            </div>
            {sel("Zarovnání", "align", ["left", "center", "right"])}
          </>}
          {block.type === "image" && <>
            <ImageField label="Obrázek" value={block.src || ""} onChange={v => onUpdate({ ...block, src: v })} />
            {inp("Alt text", "alt")}
            {sel("Šířka", "width", ["100%", "75%", "50%", "25%", "auto"])}
            {inp("Odkaz (href)", "href")}
            {sel("Zarovnání", "align", ["left", "center", "right"])}
          </>}
          {block.type === "button" && <>
            {inp("Text buttonu", "content")}
            {inp("Odkaz (href)", "href")}
            {inp("Barva pozadí (#hex)", "bgColor")}
            {inp("Barva textu (#hex)", "textColor")}
            {sel("Velikost", "size", ["sm", "md", "lg"])}
            {sel("Zarovnání", "align", ["left", "center", "right"])}
          </>}
          {block.type === "banner" && <>
            {inp("Nadpis", "content")}
            {inp("Podtitulek", "subtitle")}
            {inp("Barva pozadí (#hex nebo gradient)", "bgColor")}
            {inp("URL obrázku pozadí", "bgImage")}
            {inp("Text CTA buttonu", "ctaText")}
            {inp("Odkaz CTA buttonu", "ctaHref")}
            {sel("Zarovnání", "align", ["left", "center", "right"])}
          </>}
          {block.type === "newsletter" && <>
            {inp("Nadpis", "content")}
            {inp("Popis", "body")}
            {sel("Zarovnání", "align", ["left", "center", "right"])}
          </>}
          {block.type === "spacer" && <>
            {inp("Výška (px)", "height", "number")}
          </>}
          {block.type === "hero-section" && <>
            {inp("Nadpis", "content")}
            {inp("Podnapis", "subtitle")}
            <ImageField label="Obrázek pozadí" value={block.heroBgImage || ""} onChange={v => onUpdate({ ...block, heroBgImage: v })} />
            {inp("Barva překrytí (rgba(0,0,0,0.4))", "heroOverlay")}
            {inp("Barva pozadí (bez obrázku)", "bgColor")}
            {inp("Text CTA buttonu", "ctaText")}
            {inp("Odkaz CTA", "ctaHref")}
            {sel("Zarovnání", "align", ["left", "center", "right"])}
          </>}
          {block.type === "cards-grid" && (
            <CardsGridBlockEditor block={block} onUpdate={onUpdate} />
          )}
          {block.type === "two-col" && <>
            {inp("Nadpis", "twoColTitle")}
            <div style={{ marginBottom: 8 }}>
              <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", marginBottom: 3 }}>Text (HTML)</label>
              <textarea value={block.twoColText || ""} onChange={e => onUpdate({ ...block, twoColText: e.target.value })}
                rows={3} style={{ width: "100%", padding: "5px 8px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 12, boxSizing: "border-box", resize: "vertical" }} />
            </div>
            <ImageField label="Obrázek" value={block.twoColImage || ""} onChange={v => onUpdate({ ...block, twoColImage: v })} />
            {inp("Text tlačítka", "twoColBtnText")}
            {inp("Odkaz tlačítka", "twoColBtnHref")}
            <div style={{ marginBottom: 8 }}>
              <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", marginBottom: 3 }}>Pozice obrázku</label>
              <select value={block.imageLeft === false ? "right" : "left"} onChange={e => onUpdate({ ...block, imageLeft: e.target.value === "left" })}
                style={{ width: "100%", padding: "5px 8px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 12 }}>
                <option value="left">Obrázek vlevo</option>
                <option value="right">Obrázek vpravo</option>
              </select>
            </div>
          </>}
        </div>
      )}
    </div>
  );
}

function PagesEditor({ autoSlug }: { autoSlug?: string } = {}) {
  const { content, updateSection } = useContent();
  const pages: CustomPage[] = content.pages || [];
  const autoPage = autoSlug ? pages.find(p => p.slug === autoSlug) : null;
  const [selectedId, setSelectedId] = useState<string | null>(autoPage?.id ?? null);
  const [newSlug, setNewSlug] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [addingBlock, setAddingBlock] = useState(false);

  const selected = pages.find(p => p.id === selectedId) || null;

  useEffect(() => {
    if (autoPage && selectedId !== autoPage.id) {
      setSelectedId(autoPage.id);
    }
  }, [autoPage, selectedId]);

  function addPage() {
    if (!newSlug.trim() || !newTitle.trim()) return;
    const slug = newSlug.toLowerCase().replace(/[^a-z0-9-]/g, "-");
    const page: CustomPage = { id: Date.now().toString(), slug, title: newTitle.trim(), blocks: [] };
    updateSection("pages", [...pages, page]);
    setSelectedId(page.id);
    setNewSlug(""); setNewTitle("");
  }

  function deletePage(id: string) {
    if (!confirm("Smazat stránku?")) return;
    updateSection("pages", pages.filter(p => p.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  function updatePage(page: CustomPage) {
    updateSection("pages", pages.map(p => p.id === page.id ? page : p));
  }

  function addBlock(type: BlockType) {
    if (!selected) return;
    const BLOCK_DEFAULTS: Record<BlockType, Partial<PageBlock>> = {
      heading: { content: "Nový nadpis", level: "h2", align: "left" },
      text: { content: "<p>Nový text...</p>", align: "left" },
      image: { src: "", alt: "", width: "100%", align: "center" },
      button: { content: "Klikni zde", href: "#", bgColor: "#7c3bb2", textColor: "#fff", size: "md", align: "center" },
      banner: { content: "Banner nadpis", subtitle: "Podnapis", bgColor: "linear-gradient(135deg,#7c3bb2,#5f2a8d)", ctaText: "Zjistit více", ctaHref: "#", align: "center" },
      newsletter: { content: "Přihlás se k odběru", body: "Dostávej novinky přímo na email.", align: "center" },
      spacer: { height: 40 },
      "hero-section": { content: "Váš Hero Nadpis", subtitle: "Podnapis sekce", bgColor: "linear-gradient(135deg,#7c3bb2,#5f2a8d)", ctaText: "Zjistit více", ctaHref: "#", align: "center" },
      "cards-grid": { sectionTitle: "Naše služby", cards: [
        { image: "", title: "Karta 1", text: "Popis karty 1.", btnText: "Zjistit více", btnHref: "#" },
        { image: "", title: "Karta 2", text: "Popis karty 2.", btnText: "Zjistit více", btnHref: "#" },
        { image: "", title: "Karta 3", text: "Popis karty 3.", btnText: "Zjistit více", btnHref: "#" },
      ]},
      "two-col": { twoColTitle: "Nadpis sekce", twoColText: "<p>Text popis sekce.</p>", twoColBtnText: "Číst více", twoColBtnHref: "#", imageLeft: true },
    };
    const defaults: Partial<PageBlock> = BLOCK_DEFAULTS[type] || {};
    const block: PageBlock = { id: Date.now().toString(), type, ...defaults };
    updatePage({ ...selected, blocks: [...selected.blocks, block] });
    setAddingBlock(false);
  }

  function updateBlock(block: PageBlock) {
    if (!selected) return;
    updatePage({ ...selected, blocks: selected.blocks.map(b => b.id === block.id ? block : b) });
  }

  function deleteBlock(id: string) {
    if (!selected) return;
    updatePage({ ...selected, blocks: selected.blocks.filter(b => b.id !== id) });
  }

  function moveBlock(idx: number, dir: -1 | 1) {
    if (!selected) return;
    const arr = [...selected.blocks];
    const tmp = arr[idx]; arr[idx] = arr[idx + dir]; arr[idx + dir] = tmp;
    updatePage({ ...selected, blocks: arr });
  }

  if (!selected) {
    return (
      <div>
        <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 16 }}>Vytvoř nebo vyber stránku pro editaci bloků.</p>
        {pages.map(p => (
          <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: 8, background: "#f9fafb" }}>
            <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "#374151", cursor: "pointer" }} onClick={() => setSelectedId(p.id)}>
              {p.title} <span style={{ color: "#9ca3af", fontWeight: 400 }}>/{p.slug}</span>
            </span>
            <a href={`/${p.slug}`} target="_blank" style={{ fontSize: 11, color: "#7c3bb2" }}>↗</a>
            <button onClick={() => setSelectedId(p.id)} style={{ padding: "3px 10px", fontSize: 11, background: "#7c3bb2", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}>Upravit</button>
            <button onClick={() => deletePage(p.id)} style={{ padding: "3px 8px", fontSize: 11, background: "#fff", color: "#ef4444", border: "1px solid #fca5a5", borderRadius: 6, cursor: "pointer" }}>✕</button>
          </div>
        ))}
        <div style={{ marginTop: 16, padding: 12, border: "1px dashed #d1d5db", borderRadius: 8 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#374151", margin: "0 0 8px", textTransform: "uppercase" }}>Nová stránka</p>
          <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Název stránky" style={{ width: "100%", padding: "6px 8px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 12, marginBottom: 6, boxSizing: "border-box" }} />
          <input value={newSlug} onChange={e => setNewSlug(e.target.value)} placeholder="URL (napr. o-nas)" style={{ width: "100%", padding: "6px 8px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 12, marginBottom: 8, boxSizing: "border-box" }} />
          <button onClick={addPage} style={{ width: "100%", padding: "8px", background: "#7c3bb2", color: "#fff", border: "none", borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>+ Vytvořit stránku</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <button onClick={() => setSelectedId(null)} style={{ padding: "5px 10px", fontSize: 12, background: "#f3f4f6", border: "1px solid #e5e7eb", borderRadius: 6, cursor: "pointer" }}>← Zpět</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>{selected.title}</div>
          <a href={`/${selected.slug}`} target="_blank" style={{ fontSize: 11, color: "#7c3bb2" }}>/{selected.slug} ↗</a>
        </div>
      </div>

      {selected.blocks.map((block, i) => (
        <BlockEditorPanel
          key={block.id}
          block={block}
          onUpdate={updateBlock}
          onDelete={() => deleteBlock(block.id)}
          onUp={() => moveBlock(i, -1)}
          onDown={() => moveBlock(i, 1)}
          isFirst={i === 0}
          isLast={i === selected.blocks.length - 1}
        />
      ))}

      {addingBlock ? (
        <div style={{ padding: 12, border: "1px dashed #d1d5db", borderRadius: 8, marginTop: 8 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#374151", margin: "0 0 10px", textTransform: "uppercase" }}>Přidat blok</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {BLOCK_TYPES.map(bt => (
              <button key={bt.type} onClick={() => addBlock(bt.type)}
                style={{ padding: "8px 10px", fontSize: 12, fontWeight: 600, background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 7, cursor: "pointer", textAlign: "left" }}>
                {bt.icon} {bt.label}
              </button>
            ))}
          </div>
          <button onClick={() => setAddingBlock(false)} style={{ marginTop: 8, width: "100%", padding: "6px", fontSize: 12, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 6, cursor: "pointer", color: "#6b7280" }}>Zrušit</button>
        </div>
      ) : (
        <button onClick={() => setAddingBlock(true)}
          style={{ width: "100%", padding: "10px", marginTop: 8, background: "#f9fafb", border: "1px dashed #d1d5db", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", color: "#7c3bb2" }}>
          + Přidat blok
        </button>
      )}
    </div>
  );
}

// ── Site Settings editor ─────────────────────────────────────────────────────────

function SiteSettingsEditor() {
  const { content, updateSection } = useContent();
  const s: SiteSettings = content.siteSettings || { accentColor: "#7c3bb2", logoUrl: "", metaTitle: "", metaDescription: "", customCss: "" };
  const upd = (data: SiteSettings) => updateSection("siteSettings", data);

  return (
    <div>
      <Divider label="Design" />
      <Field label="Hlavní barva (accent)">
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input type="color" value={s.accentColor || "#7c3bb2"} onChange={e => upd({ ...s, accentColor: e.target.value })}
            style={{ width: 44, height: 36, border: "1px solid #e5e7eb", borderRadius: 6, cursor: "pointer", padding: 2 }} />
          <input type="text" value={s.accentColor || ""} onChange={e => upd({ ...s, accentColor: e.target.value })}
            style={{ flex: 1, padding: "6px 8px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 12 }} />
        </div>
      </Field>
      <Field label="URL loga"><input value={s.logoUrl || ""} onChange={e => upd({ ...s, logoUrl: e.target.value })}
        style={{ width: "100%", padding: "6px 8px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 12, boxSizing: "border-box" }} /></Field>

      <Divider label="SEO & Meta" />
      <Field label="Meta title (titulek stránky)"><input value={s.metaTitle || ""} onChange={e => upd({ ...s, metaTitle: e.target.value })}
        style={{ width: "100%", padding: "6px 8px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 12, boxSizing: "border-box" }} /></Field>
      <Field label="Meta description">
        <textarea value={s.metaDescription || ""} onChange={e => upd({ ...s, metaDescription: e.target.value })}
          rows={3} style={{ width: "100%", padding: "6px 8px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 12, boxSizing: "border-box", resize: "vertical" }} />
      </Field>

      <Divider label="Custom CSS" />
      <p style={{ fontSize: 11, color: "#6b7280", marginTop: 0, marginBottom: 8 }}>CSS se aplikuje globálně na celý web. Lze přepsat libovolný styl.</p>
      <textarea value={s.customCss || ""} onChange={e => upd({ ...s, customCss: e.target.value })}
        rows={10} placeholder={`.btn-primary { background: #ff5500; }\nh1 { font-family: 'Georgia'; }`}
        style={{ width: "100%", padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 11, fontFamily: "monospace", boxSizing: "border-box", resize: "vertical", lineHeight: 1.6 }} />
    </div>
  );
}

// ── Section editor map ──────────────────────────────────────────────────────────

const EDITORS: Record<Section, React.ComponentType> = {
  header: HeaderEditor,
  hero: HeroEditor,
  newsletter: NewsletterEditor,
  about: AboutEditor,
  manifest: ManifestEditor,
  pickacard: PickACardEditor,
  oracle: OracleEditor,
  featuredIn: FeaturedInEditor,
  footer: FooterEditor,
  aboutPage: AboutPageEditor,
  pages: PagesEditor,
  siteSettings: SiteSettingsEditor,
};

// ── Main LiveEditor panel ──────────────────────────────────────────────────────

export default function LiveEditor() {
  const { admin, content, saveAll, undo, redo, canUndo, canRedo, saveStatus, logout } = useContent();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<Section>("hero");
  const [editorKey, setEditorKey] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 700);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Lock body scroll on mobile when panel open
  useEffect(() => {
    if (isMobile && open) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    } else {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [isMobile, open]);

  // Context-aware: detect current custom page
  const currentCustomPage = useMemo(
    () => (content.pages || []).find(p => `/${p.slug}` === pathname || pathname.endsWith(`/${p.slug}`)) ?? null,
    [content.pages, pathname]
  );

  // Filter sections based on current route
  const visibleSections = useMemo(() => {
    if (pathname === "/") return ALL_SECTIONS.filter(s => HOMEPAGE_KEYS.includes(s.key));
    if (currentCustomPage) return ALL_SECTIONS.filter(s => CUSTOM_PAGE_KEYS.includes(s.key));
    return ALL_SECTIONS;
  }, [pathname, currentCustomPage]);

  // Auto-reset activeSection when visible sections change
  useEffect(() => {
    if (!visibleSections.find(s => s.key === activeSection)) {
      setActiveSection(visibleSections[0]?.key ?? "hero");
    }
  }, [visibleSections, activeSection]);

  if (!admin.isAdmin) return null;

  const ActiveEditor = EDITORS[activeSection];

  function handleUndo() {
    undo();
    setEditorKey(k => k + 1);
  }

  function handleRedo() {
    redo();
    setEditorKey(k => k + 1);
  }

  async function handleLogout() {
    await logout();
    setOpen(false);
  }

  // Save status indicator
  const statusColor = saveStatus === "saved" ? "#059669" : saveStatus === "saving" ? "#f59e0b" : saveStatus === "unsaved" ? "#ef4444" : "transparent";
  const statusText = saveStatus === "saved" ? "✓ Uloženo" : saveStatus === "saving" ? "Ukládám…" : saveStatus === "unsaved" ? "● Neuloženo" : "";

  return (
    <>
      {/* Floating save button (hidden on mobile when panel open) */}
      <button
        onClick={saveAll}
        title="Uložit vše"
        style={{
          position: "fixed",
          bottom: 28,
          right: (open && !isMobile) ? PANEL_W + 72 : 90,
          zIndex: 9999,
          width: 52,
          height: 52,
          borderRadius: "50%",
          background: saveStatus === "saved" ? "#059669" : saveStatus === "unsaved" ? "#f59e0b" : "#6b7280",
          color: "#fff",
          border: "none",
          cursor: "pointer",
          fontSize: 22,
          boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
          transition: "right 0.3s ease, background 0.3s ease",
          display: (open && isMobile) ? "none" : "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        💾
      </button>

      {/* Toggle (pencil) button — hidden on mobile when panel open (use in-panel close button) */}
      <button
        onClick={() => setOpen(o => !o)}
        title={open ? "Zavřít editor" : "Otevřít editor"}
        style={{
          position: "fixed",
          bottom: 28,
          right: (open && !isMobile) ? PANEL_W + 12 : 28,
          zIndex: 9999,
          width: 52,
          height: 52,
          borderRadius: "50%",
          background: "#7c3bb2",
          color: "#fff",
          border: "none",
          cursor: "pointer",
          fontSize: 22,
          boxShadow: "0 4px 20px rgba(124,59,178,0.55)",
          transition: "right 0.3s ease",
          display: (open && isMobile) ? "none" : "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {open ? "✕" : "✏️"}
      </button>

      {/* Panel */}
      <div
        style={isMobile ? {
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "#fff",
          boxShadow: "none",
          zIndex: 100000,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          transform: open ? "translateX(0)" : "translateX(105%)",
          transition: "transform 0.3s ease",
          fontFamily: "'Poppins', sans-serif",
        } : {
          position: "fixed",
          top: 0,
          right: open ? 0 : -PANEL_W - 10,
          width: PANEL_W,
          height: "100vh",
          background: "#fff",
          boxShadow: "-6px 0 30px rgba(0,0,0,0.13)",
          zIndex: 9998,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          transition: "right 0.3s ease",
          fontFamily: "'Poppins', sans-serif",
        }}
      >
        {/* Panel header */}
        <div style={{ flexShrink: 0, padding: "14px 18px", borderBottom: "1px solid #e5e7eb", background: "linear-gradient(135deg,#7c3bb2,#5f2a8d)", color: "#fff" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: "0.2px" }}>✏️ {currentCustomPage ? currentCustomPage.title : "Site Editor"}</div>
              <div style={{ fontSize: 11, opacity: 0.85, marginTop: 1 }}>{currentCustomPage ? `/${currentCustomPage.slug}` : admin.email}</div>
            </div>
            <button
              onClick={handleLogout}
              style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", padding: "5px 12px", borderRadius: 7, fontSize: 11, cursor: "pointer", fontWeight: 600 }}
            >
              Odhlásit
            </button>
            {isMobile && (
              <button
                onClick={() => setOpen(false)}
                style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", padding: "5px 12px", borderRadius: 7, fontSize: 11, cursor: "pointer", fontWeight: 600, marginLeft: 4 }}
              >
                ✕ Zavřít
              </button>
            )}
          </div>
        </div>

        {/* Section tabs — 2-row wrap grid */}
        <div style={{ flexShrink: 0, display: "flex", flexWrap: "wrap", borderBottom: "1px solid #e5e7eb", background: "#f9fafb", gap: 0 }}>
          {visibleSections.map(s => (
            <button
              key={s.key}
              onClick={() => setActiveSection(s.key)}
              style={{
                padding: "8px 10px",
                fontSize: 11,
                fontWeight: 600,
                border: "none",
                borderBottom: activeSection === s.key ? "2px solid #7c3bb2" : "2px solid transparent",
                background: activeSection === s.key ? "rgba(124,59,178,0.08)" : "none",
                color: activeSection === s.key ? "#7c3bb2" : "#6b7280",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "color 0.15s, background 0.15s",
                flex: "0 0 calc(20% - 0px)",
                textAlign: "center",
              }}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Editor content — scrollable */}
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", overflowX: "hidden", padding: "18px 20px", boxSizing: "border-box", WebkitOverflowScrolling: "touch" } as React.CSSProperties}>
          {currentCustomPage && activeSection === "pages" ? (
            <PagesEditor key={`pages-${currentCustomPage.slug}-${editorKey}`} autoSlug={currentCustomPage.slug} />
          ) : (
            <ActiveEditor key={`${activeSection}-${editorKey}`} />
          )}
        </div>

        {/* Action bar */}
        <div style={{ flexShrink: 0, padding: "12px 18px", borderTop: "1px solid #e5e7eb", background: "#f9fafb", display: "flex", gap: 8, alignItems: "center" }}>
          <button
            onClick={handleUndo}
            disabled={!canUndo}
            title={canUndo ? "Vrátit poslední změnu (max 30)" : "Žádné změny k vrácení"}
            style={{
              padding: "9px 14px",
              background: canUndo ? "#fff" : "#f3f4f6",
              border: `1px solid ${canUndo ? "#d1d5db" : "#e5e7eb"}`,
              borderRadius: 8,
              fontSize: 13,
              cursor: canUndo ? "pointer" : "default",
              color: canUndo ? "#374151" : "#9ca3af",
              fontWeight: 500,
            }}
          >
            ↺ Zpět
          </button>
          <button
            onClick={handleRedo}
            disabled={!canRedo}
            title={canRedo ? "Znovu použít vrácenou změnu (max 30)" : "Žádná změna k obnovení"}
            style={{
              padding: "9px 14px",
              background: canRedo ? "#fff" : "#f3f4f6",
              border: `1px solid ${canRedo ? "#d1d5db" : "#e5e7eb"}`,
              borderRadius: 8,
              fontSize: 13,
              cursor: canRedo ? "pointer" : "default",
              color: canRedo ? "#374151" : "#9ca3af",
              fontWeight: 500,
            }}
          >
            ↻ Vpřed
          </button>
          <button
            onClick={saveAll}
            disabled={saveStatus === "saving"}
            style={{
              flex: 1,
              padding: "9px 14px",
              background: saveStatus === "saving" ? "#9ca3af" : "#7c3bb2",
              border: "none",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              cursor: saveStatus === "saving" ? "default" : "pointer",
              color: "#fff",
            }}
          >
            {saveStatus === "saving" ? "Ukládám…" : "💾 Uložit vše"}
          </button>
          {statusText && (
            <div style={{ fontSize: 11, color: statusColor, fontWeight: 600, whiteSpace: "nowrap" }}>{statusText}</div>
          )}
        </div>
      </div>

      {/* Admin bar at top */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: (open && !isMobile) ? PANEL_W : 0,
          zIndex: open && isMobile ? 99998 : 9997,
          background: "#7c3bb2",
          color: "#fff",
          fontSize: 11,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          padding: "4px 12px",
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 600,
          letterSpacing: "0.3px",
          transition: "right 0.3s ease",
        }}
      >
        <span>Admin — klikni na text/obrázek pro editaci · ✏️ otevře panel</span>
        {statusText && (
          <span style={{ background: "rgba(0,0,0,0.2)", borderRadius: 4, padding: "1px 8px", color: statusColor === "#059669" ? "#a7f3d0" : statusColor === "#f59e0b" ? "#fde68a" : "#fca5a5" }}>
            {statusText}
          </span>
        )}
      </div>

      {/* Mobile: full-width panel override */}
      <style>{`
        @media (max-width: 500px) {
          /* JS-set width can't be overridden easily, handled via inline */
        }
      `}</style>
    </>
  );
}
