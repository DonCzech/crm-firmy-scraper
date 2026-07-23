"use client";
import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useContent } from "@/astera/context/ContentContext";
import { usePathname, useRouter } from "next/navigation";
import { LANGUAGES, Lang, localizePath, resolveLocalizedPageSlug, stripLangPrefix } from "@/astera/lib/i18n";
import { DEFAULT_CONTENT, SiteContent, NavItem, ManifestCard, FooterLink, CustomPage, PageBlock, BlockType, SiteSettings, ServicesContent, ServiceItem, ServiceSection, PickACardGameCard, WheelOfFortuneConfig, WheelSegment, Testimonial, MoonWidgetConfig, RouteRedirect } from "@/astera/lib/content-types";
import { withRouteChange } from "@/astera/lib/route-overrides";
import { asteraUpload, asteraWheelUrl } from "@/astera/lib/host";
import RichTextEditor from "./RichTextEditor";

type Section = keyof SiteContent;

const ALL_SECTIONS: { key: Section; label: string }[] = [
  { key: "header", label: "Header" },
  { key: "hero", label: "Hero" },
  { key: "newsletter", label: "Newsletter" },
  { key: "about", label: "About" },
  { key: "testimonials", label: "Recenze" },
  { key: "manifest", label: "Cards" },
  { key: "pickacard", label: "Pick Card" },
  { key: "crystalBall", label: "🔮 Crystal Ball" },
  { key: "oracle", label: "Oracle" },
  { key: "moonWidget", label: "Měsíc" },
  { key: "servicesContent", label: "Služby" },
  { key: "wheelOfFortune", label: "🎡 Kolo štěstí" },
  { key: "footer", label: "Footer" },
  { key: "aboutPage", label: "O nás" },
  { key: "pages", label: "📋 Stránky" },
  { key: "routeRedirects", label: "↪ Redirecty" },
  { key: "siteSettings", label: "⚙️ Web" },
];

const HOMEPAGE_KEYS: Section[] = ["header", "hero", "servicesContent", "newsletter", "about", "testimonials", "manifest", "pickacard", "crystalBall", "oracle", "moonWidget", "footer", "siteSettings"];
const CUSTOM_PAGE_KEYS: Section[] = ["pages", "routeRedirects", "siteSettings"];
const SLUZBY_KEYS: Section[] = ["servicesContent", "wheelOfFortune", "siteSettings"];
// Static Next.js routes that must never be treated as custom pages
const STATIC_ROUTES = ["/", "/sluzby", "/about", "/pick-a-card", "/cs", "/en", "/ua"];

const PANEL_W = 460; // panel width desktop

function createEditorId(prefix = "id") {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return `${prefix}-${globalThis.crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function mergeChangedFields<T extends object>(current: T, rendered: T, next: T): T {
  const merged = { ...current };
  (Object.keys(next) as Array<keyof T>).forEach(key => {
    if (next[key] !== rendered[key]) merged[key] = next[key];
  });
  return merged;
}

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
  const [imageInfo, setImageInfo] = useState<{ src: string; dims: { w: number; h: number } | null } | null>(null);

  const displaySrc = preview ?? value;
  const dims = imageInfo?.src === displaySrc ? imageInfo.dims : null;

  useEffect(() => {
    if (!displaySrc) return;
    const img = new window.Image();
    img.onload = () => setImageInfo({ src: displaySrc, dims: { w: img.naturalWidth, h: img.naturalHeight } });
    img.onerror = () => setImageInfo({ src: displaySrc, dims: null });
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
    const res = await asteraUpload(fd);
    const data = await res.json();
    setUploading(false);
    if (data.url) { onChange(data.url); setPreview(null); }
    e.target.value = "";
  }

  return (
    <Field label={label}>
      {displaySrc && (
        <div style={{ position: "relative", marginBottom: 7 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={displaySrc} alt="" style={{ width: "100%", maxHeight: 110, objectFit: "cover", borderRadius: 7, border: "1px solid #e5e7eb", display: "block" }} />
          <button
            type="button"
            onClick={() => { setPreview(null); onChange(""); }}
            style={{
              position: "absolute",
              top: 6,
              left: 6,
              background: "rgba(127, 29, 29, 0.88)",
              color: "#fff",
              border: "none",
              borderRadius: 999,
              padding: "4px 9px",
              fontSize: 11,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(0,0,0,0.22)",
            }}
          >
            Odebrat
          </button>
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
      <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
    </Field>
  );
}

function ImagePairField({
  label,
  desktopValue,
  mobileValue,
  onDesktopChange,
  onMobileChange,
}: {
  label: string;
  desktopValue: string;
  mobileValue?: string;
  onDesktopChange: (url: string) => void;
  onMobileChange: (url: string) => void;
}) {
  return (
    <div style={{ marginBottom: 14, padding: 10, border: "1px solid #e5e7eb", borderRadius: 9, background: "#fafafa" }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: "#374151", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.4px" }}>
        {label}
      </div>
      <ImageField label="🖥️ Desktop" value={desktopValue} onChange={onDesktopChange} />
      <ImageField label="📱 Mobil" value={mobileValue || desktopValue} onChange={onMobileChange} />
      {!mobileValue && (
        <div style={{ marginTop: -6, fontSize: 10, color: "#9ca3af" }}>
          Mobil zatím používá desktopový obrázek. Nahráním se vytvoří samostatná mobilní verze.
        </div>
      )}
    </div>
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
  const { content, updateSection, getLatestSection, currentLang } = useContent();
  const h = content.header;
  const hrefFocusRef = useRef<Record<string, string>>({});
  const upd = (k: string, v: string) => updateSection("header", current => ({ ...current, [k]: v }));

  const updateNav = useCallback(
    (items: NavItem[]) => updateSection("header", { ...h, navItems: items }),
    [h, updateSection]
  );
  const updateItem = (i: number, field: string, val: string) => {
    const items = h.navItems.map((item, idx) => idx === i ? { ...item, [field]: val } : item);
    updateNav(items);
  };
  const rememberHref = (key: string, value: string) => {
    hrefFocusRef.current[key] = value;
  };
  const commitHref = (key: string, value: string) => {
    const previous = hrefFocusRef.current[key];
    delete hrefFocusRef.current[key];
    if (!previous || previous === value) return;

    const redirects = (getLatestSection("routeRedirects", currentLang) as RouteRedirect[]) || [];
    const nextRedirects = withRouteChange(redirects, previous, value, currentLang);
    if (nextRedirects !== redirects) updateSection("routeRedirects", nextRedirects);
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
            <input
              type="text"
              value={item.href}
              onFocus={() => rememberHref(`nav-${i}`, item.href)}
              onBlur={e => commitHref(`nav-${i}`, e.target.value)}
              onChange={e => updateItem(i, "href", e.target.value)}
              placeholder="URL"
              style={{ flex: 2, padding: "6px 8px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 12, outline: "none" }}
            />
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
                  <input
                    type="text"
                    value={sub.href}
                    onFocus={() => rememberHref(`nav-${i}-drop-${j}`, sub.href)}
                    onBlur={e => commitHref(`nav-${i}-drop-${j}`, e.target.value)}
                    onChange={e => {
                      const items = h.navItems.map((it, idx) => idx === i ? { ...it, dropdown: it.dropdown?.map((s, si) => si === j ? { ...s, href: e.target.value } : s) } : it);
                      updateNav(items);
                    }}
                    style={{ flex: 2, padding: "4px 6px", border: "1px solid #e5e7eb", borderRadius: 4, fontSize: 11, outline: "none" }}
                  />
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
  const upd = (k: string, v: string) => updateSection("hero", current => ({ ...current, [k]: v }));

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
      <ImagePairField
        label="Pozadí hero"
        desktopValue={h.backgroundImage}
        mobileValue={h.mobileImage}
        onDesktopChange={v => upd("backgroundImage", v)}
        onMobileChange={v => upd("mobileImage", v)}
      />
    </div>
  );
}

function NewsletterEditor() {
  const { content, updateSection } = useContent();
  const n = content.newsletter;
  const upd = (k: string, v: string) => updateSection("newsletter", current => ({ ...current, [k]: v }));

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
      <ImagePairField label="Obrázek" desktopValue={n.image} mobileValue={n.mobileImage} onDesktopChange={v => upd("image", v)} onMobileChange={v => upd("mobileImage", v)} />
    </div>
  );
}

function AboutEditor() {
  const { content, updateSection } = useContent();
  const a = content.about;
  const upd = (k: string, v: string) => updateSection("about", current => ({ ...current, [k]: v }));

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
      <ImagePairField label="Obrázek nahoře" desktopValue={a.imageTop} mobileValue={a.mobileImageTop} onDesktopChange={v => upd("imageTop", v)} onMobileChange={v => upd("mobileImageTop", v)} />
      <ImagePairField label="Obrázek dole" desktopValue={a.imageBottom} mobileValue={a.mobileImageBottom} onDesktopChange={v => upd("imageBottom", v)} onMobileChange={v => upd("mobileImageBottom", v)} />
    </div>
  );
}

function TestimonialsEditor() {
  const { content, updateSection } = useContent();
  const sec = content.testimonials ?? { sectionTitle: "Co o mně říkají", items: [] };
  const items: Testimonial[] = sec.items ?? [];

  const updItems = (newItems: Testimonial[]) => updateSection("testimonials", { ...sec, items: newItems });

  const addItem = () => updItems([...items, { name: "Jméno Příjmení", emoji: "✨", text: "Text recenze..." }]);
  const removeItem = (i: number) => updItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, k: keyof Testimonial, v: string) =>
    updItems(items.map((t, idx) => idx === i ? { ...t, [k]: v } : t));

  return (
    <div>
      <Field label="Nadpis sekce">
        <RTE value={sec.sectionTitle} onChange={v => updateSection("testimonials", { ...sec, sectionTitle: v })} />
      </Field>

      {items.map((item, i) => (
        <div key={i} style={{ borderTop: "1px solid #e5e7eb", paddingTop: 14, marginTop: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#7c3bb2", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Recenze {i + 1}: {item.name}
            </span>
            {items.length > 1 && (
              <button
                onClick={() => removeItem(i)}
                style={{ background: "none", border: "1px solid #f87171", color: "#f87171", borderRadius: 5, padding: "2px 8px", fontSize: 11, cursor: "pointer" }}
              >
                Smazat
              </button>
            )}
          </div>
          <Field label="Emoji">
            <PlainInput value={item.emoji} onChange={v => updateItem(i, "emoji", v)} />
          </Field>
          <Field label="Jméno">
            <PlainInput value={item.name} onChange={v => updateItem(i, "name", v)} />
          </Field>
          <Field label={`Text recenze (${item.text.replace(/<[^>]*>/g, "").length}/350)`}>
            <RTE value={item.text} onChange={v => {
              const plain = v.replace(/<[^>]*>/g, "");
              if (plain.length <= 350) updateItem(i, "text", v);
            }} minHeight={70} />
          </Field>
        </div>
      ))}

      <button
        onClick={addItem}
        style={{ marginTop: 16, width: "100%", padding: "9px 0", background: "rgba(124,59,178,0.08)", border: "1.5px dashed #7c3bb2", borderRadius: 8, color: "#7c3bb2", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
      >
        + Přidat recenzi
      </button>
    </div>
  );
}

function ManifestEditor() {
  const { content, updateSection } = useContent();
  const m = content.manifest;

  const updateCard = (i: number, k: string, v: string) => {
    updateSection("manifest", current => ({
      ...current,
      cards: current.cards.map((card, idx) => idx === i ? { ...card, [k]: v } : card),
    }));
  };

  return (
    <div>
      <Field label="Nadpis sekce">
        <RTE value={m.sectionTitle} onChange={v => updateSection("manifest", current => ({ ...current, sectionTitle: v }))} />
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
          <ImagePairField label="Obrázek karty" desktopValue={card.image} mobileValue={card.mobileImage} onDesktopChange={v => updateCard(i, "image", v)} onMobileChange={v => updateCard(i, "mobileImage", v)} />
          <ImagePairField label="Badge obrázek" desktopValue={card.badge} mobileValue={card.mobileBadge} onDesktopChange={v => updateCard(i, "badge", v)} onMobileChange={v => updateCard(i, "mobileBadge", v)} />
        </div>
      ))}
    </div>
  );
}

function PickACardEditor() {
  const { content, updateSection } = useContent();
  const p = {
    ...DEFAULT_CONTENT.pickacard,
    ...content.pickacard,
    cards: content.pickacard.cards?.length ? content.pickacard.cards : DEFAULT_CONTENT.pickacard.cards,
  };
  const save = (next: typeof p) =>
    updateSection("pickacard", current => mergeChangedFields(current, p, next));
  const upd = (k: string, v: string) => updateSection("pickacard", current => ({ ...current, [k]: v }));
  const updateCardField = (i: number, field: keyof PickACardGameCard, value: string) =>
    updateSection("pickacard", current => ({
      ...current,
      cards: current.cards.map((card, idx) => idx === i ? { ...card, [field]: value } : card),
    }));
  const addCard = () => {
    let nextNumber = p.cards.length + 1;
    let nextId = `card-${nextNumber}`;
    while (p.cards.some(card => card.id === nextId)) {
      nextNumber += 1;
      nextId = `card-${nextNumber}`;
    }

    save({
      ...p,
      cards: [
        ...p.cards,
        {
          id: nextId,
          title: "Nová karta",
          concepts: "klíčová slova",
          message: "Text vzkazu karty.",
          gradient: "linear-gradient(135deg, #7c3bb2 0%, #c9a84c 100%)",
          symbol: "✦",
          image: "",
          mobileImage: "",
        },
      ],
    });
  };
  const removeCard = (i: number) => save({ ...p, cards: p.cards.filter((_, idx) => idx !== i) });

  return (
    <div>
      <Divider label="Homepage upoutávka" />
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
      <ImagePairField label="Obrázek" desktopValue={p.image} mobileValue={p.mobileImage} onDesktopChange={v => upd("image", v)} onMobileChange={v => upd("mobileImage", v)} />

      <Divider label="Stránka /pick-a-card" />
      <Field label="Nadpis hry">
        <PlainInput value={p.gameTitle} onChange={v => upd("gameTitle", v)} />
      </Field>
      <Field label="Úvodní text hry">
        <SmallTextarea value={p.gameIntro} onChange={v => upd("gameIntro", v)} rows={4} />
      </Field>
      <Field label="Instrukce pod kartami">
        <PlainInput value={p.gameInstructions} onChange={v => upd("gameInstructions", v)} />
      </Field>
      <Field label="Text po odhalení">
        <PlainInput value={p.revealLabel} onChange={v => upd("revealLabel", v)} />
      </Field>
      <Field label="Gradient zadní strany karet">
        <PlainInput value={p.cardBackGradient} onChange={v => upd("cardBackGradient", v)} placeholder="linear-gradient(...)" />
      </Field>

      <Divider label="Karty ve hře" />
      {p.cards.map((card, i) => (
        <details key={card.id || i} open={i === 0} style={{ border: "1px solid #e5e7eb", borderRadius: 9, padding: "10px 12px", marginBottom: 10, background: "#f9fafb" }}>
          <summary style={{ cursor: "pointer", fontSize: 13, fontWeight: 800, color: "#374151" }}>{card.symbol} {card.title || `Karta ${i + 1}`}</summary>
          <div style={{ marginTop: 12 }}>
            <Field label="ID karty">
              <PlainInput value={card.id} onChange={v => updateCardField(i, "id", v)} />
            </Field>
            <Field label="Název karty">
              <PlainInput value={card.title} onChange={v => updateCardField(i, "title", v)} />
            </Field>
            <Field label="Koncepty / klíčová slova">
              <PlainInput value={card.concepts} onChange={v => updateCardField(i, "concepts", v)} />
            </Field>
            <Field label="Vzkaz karty">
              <SmallTextarea value={card.message} onChange={v => updateCardField(i, "message", v)} rows={4} />
            </Field>
            <Field label="Symbol na kartě">
              <PlainInput value={card.symbol} onChange={v => updateCardField(i, "symbol", v)} />
            </Field>
            <Field label="Gradient / barva karty">
              <PlainInput value={card.gradient} onChange={v => updateCardField(i, "gradient", v)} placeholder="linear-gradient(...)" />
            </Field>
            <ImagePairField
              label="Obrázek karty"
              desktopValue={card.image || ""}
              mobileValue={card.mobileImage}
              onDesktopChange={v => updateCardField(i, "image", v)}
              onMobileChange={v => updateCardField(i, "mobileImage", v)}
            />
            <button type="button" onClick={() => removeCard(i)} style={{ padding: "7px 12px", border: "1px solid #fecaca", borderRadius: 7, background: "#fee2e2", color: "#b91c1c", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
              Smazat kartu
            </button>
          </div>
        </details>
      ))}
      <button type="button" onClick={addCard} style={{ width: "100%", padding: "9px", background: "#7c3bb2", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 800, cursor: "pointer" }}>
        + Přidat kartu
      </button>
    </div>
  );
}

function CrystalBallEditor() {
  const { content, updateSection } = useContent();
  const c = { ...DEFAULT_CONTENT.crystalBall, ...content.crystalBall };
  const update = (key: keyof typeof c, value: string | string[]) =>
    updateSection("crystalBall", current => ({ ...current, [key]: value }));
  const updateAnswer = (index: number, value: string) =>
    update("answers", c.answers.map((answer, i) => i === index ? value : answer));
  const addAnswer = () => update("answers", [...c.answers, "Nová odpověď"]);
  const removeAnswer = (index: number) => update("answers", c.answers.filter((_, i) => i !== index));

  return (
    <div>
      <p style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.5, margin: "0 0 14px" }}>
        Všechna pole níže patří pouze k právě zvolenému jazyku.
      </p>
      <Field label="Malý nadpis"><PlainInput value={c.eyebrow} onChange={v => update("eyebrow", v)} /></Field>
      <Field label="Nadpis"><RTE value={c.title} onChange={v => update("title", v)} /></Field>
      <Field label="Podnadpis"><RTE value={c.subtitle} onChange={v => update("subtitle", v)} minHeight={70} /></Field>
      <Field label="Přístupný popisek koule"><PlainInput value={c.ariaLabel} onChange={v => update("ariaLabel", v)} /></Field>
      <Field label="Placeholder otázky"><PlainInput value={c.inputPlaceholder} onChange={v => update("inputPlaceholder", v)} /></Field>
      <Field label="Text tlačítka"><PlainInput value={c.buttonText} onChange={v => update("buttonText", v)} /></Field>
      <Field label="Text při čekání"><PlainInput value={c.loadingText} onChange={v => update("loadingText", v)} /></Field>
      <Field label="Text před odkazem na konzultaci"><PlainInput value={c.consultLead} onChange={v => update("consultLead", v)} /></Field>
      <Field label="Text odkazu na konzultaci"><PlainInput value={c.consultLinkText} onChange={v => update("consultLinkText", v)} /></Field>
      <ImagePairField
        label="Křišťálová koule"
        desktopValue={c.image}
        mobileValue={c.mobileImage}
        onDesktopChange={v => update("image", v)}
        onMobileChange={v => update("mobileImage", v)}
      />
      <Divider label="Jednotlivé odpovědi" />
      {c.answers.map((answer, i) => (
        <div key={i} style={{ display: "flex", gap: 6, alignItems: "flex-start", marginBottom: 8 }}>
          <span style={{ width: 22, paddingTop: 8, fontSize: 11, color: "#9ca3af", textAlign: "right" }}>{i + 1}.</span>
          <textarea
            value={answer}
            onChange={e => updateAnswer(i, e.target.value)}
            rows={2}
            style={{ flex: 1, padding: "7px 9px", border: "1px solid #e5e7eb", borderRadius: 7, fontSize: 12, resize: "vertical", fontFamily: "inherit" }}
          />
          <button type="button" onClick={() => removeAnswer(i)} style={{ padding: "6px 8px", background: "#fff", color: "#ef4444", border: "1px solid #fecaca", borderRadius: 6, cursor: "pointer" }}>✕</button>
        </div>
      ))}
      <button type="button" onClick={addAnswer} style={{ width: "100%", padding: "8px", background: "#f5f3ff", color: "#7c3bb2", border: "1px dashed #7c3bb2", borderRadius: 7, cursor: "pointer", fontWeight: 700 }}>
        + Přidat odpověď
      </button>
    </div>
  );
}

function OracleEditor() {
  const { content, updateSection } = useContent();
  const o = content.oracle;
  const upd = (k: string, v: string) => updateSection("oracle", current => ({ ...current, [k]: v }));

  return (
    <div>
      <Field label="Nadpis">
        <RTE value={o.title} onChange={v => upd("title", v)} />
      </Field>
      <Field label="Text">
        <RTE value={o.body} onChange={v => upd("body", v)} minHeight={70} />
      </Field>
      <ImagePairField
        label="Obrázek"
        desktopValue={o.image}
        mobileValue={o.mobileImage}
        onDesktopChange={v => upd("image", v)}
        onMobileChange={v => upd("mobileImage", v)}
      />
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
  const upd = (data: typeof p) =>
    updateSection("aboutPage", current => mergeChangedFields(current, p, data));
  const updField = (key: keyof typeof p, value: string) =>
    updateSection("aboutPage", current => ({ ...current, [key]: value }));

  return (
    <div>
      <Field label="Hero nadpis"><RichTextEditor value={p.heroTitle} onChange={v => upd({ ...p, heroTitle: v })} /></Field>
      <Field label="Hero podnapis"><RichTextEditor value={p.heroSubtitle} onChange={v => upd({ ...p, heroSubtitle: v })} /></Field>
      <ImagePairField label="Hero obrázek" desktopValue={p.heroImage} mobileValue={p.heroMobileImage} onDesktopChange={v => updField("heroImage", v)} onMobileChange={v => updField("heroMobileImage", v)} />
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

function SmallTextarea({ value, onChange, rows = 3 }: { value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      rows={rows}
      style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: 7, fontSize: 12, outline: "none", fontFamily: "inherit", background: "#fafafa", resize: "vertical", lineHeight: 1.5 }}
    />
  );
}

function ArrayTextField({ label, values, onChange }: { label: string; values: string[]; onChange: (values: string[]) => void }) {
  return (
    <Field label={label}>
      <SmallTextarea value={(values || []).join("\n")} onChange={v => onChange(v.split("\n").filter(Boolean))} rows={4} />
    </Field>
  );
}

function ServiceSectionEditor({
  section,
  onChange,
  onDelete,
}: {
  section: ServiceSection;
  onChange: (section: ServiceSection) => void;
  onDelete: () => void;
}) {
  const rows = section.rows || [];
  const twoCol = section.twoCol || [];

  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 10, marginBottom: 10, background: "#fff" }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
        <strong style={{ flex: 1, fontSize: 12, color: "#374151" }}>Blok detailu služby</strong>
        <button type="button" onClick={onDelete} style={{ padding: "4px 8px", border: "1px solid #fecaca", borderRadius: 6, background: "#fee2e2", color: "#b91c1c", cursor: "pointer", fontSize: 11 }}>Smazat</button>
      </div>
      <Field label="Nadpis bloku"><PlainInput value={section.heading || ""} onChange={v => onChange({ ...section, heading: v })} /></Field>
      <ArrayTextField label="Odstavce (každý na nový řádek)" values={section.paragraphs || []} onChange={v => onChange({ ...section, paragraphs: v })} />
      <ArrayTextField label="Seznam (každá položka na nový řádek)" values={section.list || []} onChange={v => onChange({ ...section, list: v })} />

      <Divider label="Ceníkové řádky" />
      {rows.map((row, i) => (
        <div key={i} style={{ display: "flex", gap: 6, marginBottom: 6 }}>
          <input value={row.label} onChange={e => onChange({ ...section, rows: rows.map((r, idx) => idx === i ? { ...r, label: e.target.value } : r) })} placeholder="Popis" style={{ flex: 2, padding: "6px 8px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 12 }} />
          <input value={row.price} onChange={e => onChange({ ...section, rows: rows.map((r, idx) => idx === i ? { ...r, price: e.target.value } : r) })} placeholder="Cena" style={{ flex: 1, padding: "6px 8px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 12 }} />
          <button type="button" onClick={() => onChange({ ...section, rows: rows.filter((_, idx) => idx !== i) })} style={{ padding: "6px 8px", border: "none", borderRadius: 6, background: "#fee2e2", color: "#b91c1c", cursor: "pointer" }}>x</button>
        </div>
      ))}
      <button type="button" onClick={() => onChange({ ...section, rows: [...rows, { label: "Nový řádek", price: "" }] })} style={{ padding: "6px 10px", border: "1px solid #d8b4fe", borderRadius: 6, background: "#faf5ff", color: "#7c3bb2", cursor: "pointer", fontSize: 12 }}>+ Ceníkový řádek</button>

      <Divider label="Dva sloupce" />
      {twoCol.map((col, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr", gap: 6, marginBottom: 8 }}>
          <input value={col.label} onChange={e => onChange({ ...section, twoCol: twoCol.map((c, idx) => idx === i ? { ...c, label: e.target.value } : c) })} placeholder="Nadpis sloupce" style={{ padding: "6px 8px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 12 }} />
          <SmallTextarea value={col.text} onChange={v => onChange({ ...section, twoCol: twoCol.map((c, idx) => idx === i ? { ...c, text: v } : c) })} rows={2} />
          <button type="button" onClick={() => onChange({ ...section, twoCol: twoCol.filter((_, idx) => idx !== i) })} style={{ justifySelf: "start", padding: "5px 8px", border: "none", borderRadius: 6, background: "#fee2e2", color: "#b91c1c", cursor: "pointer", fontSize: 11 }}>Smazat sloupec</button>
        </div>
      ))}
      <button type="button" onClick={() => onChange({ ...section, twoCol: [...twoCol, { label: "Nadpis", text: "Text" }] })} style={{ padding: "6px 10px", border: "1px solid #d8b4fe", borderRadius: 6, background: "#faf5ff", color: "#7c3bb2", cursor: "pointer", fontSize: 12 }}>+ Sloupec</button>
    </div>
  );
}

function ServicesEditor() {
  const { content, updateSection } = useContent();
  const s = content.servicesContent;
  const upd = (data: ServicesContent) => updateSection("servicesContent", data);
  const updateField = (key: Exclude<keyof ServicesContent, "items">, value: string) => upd({ ...s, [key]: value });
  const updateItem = (i: number, item: ServiceItem) => upd({ ...s, items: s.items.map((service, idx) => idx === i ? item : service) });
  const addItem = () => upd({ ...s, items: [...s.items, { id: `sluzba-${Date.now()}`, symbol: "✦", emoji: "✨", color: "#7c3bb2", title: "Nová služba", teaser: "Krátký popis služby.", lead: "Detailní úvod služby.", body: "", sections: [], cta: { label: s.pageHeroButtonText || "Rezervovat termín", href: s.pageHeroButtonHref || "#" } }] });
  const removeItem = (i: number) => upd({ ...s, items: s.items.filter((_, idx) => idx !== i) });

  return (
    <div>
      <Divider label="Homepage sekce služeb" />
      <Field label="Dekorace / eyebrow"><PlainInput value={s.homeEyebrow} onChange={v => updateField("homeEyebrow", v)} /></Field>
      <Field label="Nadpis homepage"><RTE value={s.homeTitle} onChange={v => updateField("homeTitle", v)} /></Field>
      <Field label="Podnadpis homepage"><PlainInput value={s.homeSubtitle} onChange={v => updateField("homeSubtitle", v)} /></Field>
      <Field label="Text odkazu na kartě"><PlainInput value={s.homeCardLinkText} onChange={v => updateField("homeCardLinkText", v)} /></Field>

      <Divider label="Stránka /sluzby - hero" />
      <Field label="Hero eyebrow"><PlainInput value={s.pageHeroEyebrow} onChange={v => updateField("pageHeroEyebrow", v)} /></Field>
      <Field label="Hero nadpis"><RTE value={s.pageHeroTitle} onChange={v => updateField("pageHeroTitle", v)} /></Field>
      <Field label="Hero text"><SmallTextarea value={s.pageHeroText} onChange={v => updateField("pageHeroText", v)} /></Field>
      <Field label="Hero tlačítko text"><PlainInput value={s.pageHeroButtonText} onChange={v => updateField("pageHeroButtonText", v)} /></Field>
      <Field label="Hero tlačítko URL"><PlainInput value={s.pageHeroButtonHref} onChange={v => updateField("pageHeroButtonHref", v)} /></Field>

      <Divider label="Stránka /sluzby - úvod a grid" />
      <Field label="Úvodní ikonka"><PlainInput value={s.pageIntroIcon} onChange={v => updateField("pageIntroIcon", v)} /></Field>
      <Field label="Úvodní nadpis"><RTE value={s.pageIntroTitle} onChange={v => updateField("pageIntroTitle", v)} /></Field>
      <Field label="Úvodní text"><SmallTextarea value={s.pageIntroText} onChange={v => updateField("pageIntroText", v)} rows={5} /></Field>
      <Field label="Nadpis gridu"><RTE value={s.pageGridTitle} onChange={v => updateField("pageGridTitle", v)} /></Field>
      <Field label="Podnadpis gridu"><PlainInput value={s.pageGridSubtitle} onChange={v => updateField("pageGridSubtitle", v)} /></Field>
      <Field label="Text odkazu ve službě"><PlainInput value={s.pageTileLinkText} onChange={v => updateField("pageTileLinkText", v)} /></Field>

      <Divider label="Stránka /sluzby - proč a spodní boxy" />
      <Field label="Proč nadpis"><RTE value={s.pageWhyTitle} onChange={v => updateField("pageWhyTitle", v)} /></Field>
      <Field label="Proč text 1"><SmallTextarea value={s.pageWhyText1} onChange={v => updateField("pageWhyText1", v)} /></Field>
      <Field label="Proč text 2"><SmallTextarea value={s.pageWhyText2} onChange={v => updateField("pageWhyText2", v)} /></Field>
      <Field label="Proč tlačítko text"><PlainInput value={s.pageWhyButtonText} onChange={v => updateField("pageWhyButtonText", v)} /></Field>
      <Field label="Proč tlačítko URL"><PlainInput value={s.pageWhyButtonHref} onChange={v => updateField("pageWhyButtonHref", v)} /></Field>
      <Field label="Specifické případy ikonka"><PlainInput value={s.pageSpecificIcon} onChange={v => updateField("pageSpecificIcon", v)} /></Field>
      <Field label="Specifické případy nadpis"><PlainInput value={s.pageSpecificTitle} onChange={v => updateField("pageSpecificTitle", v)} /></Field>
      <Field label="Specifické případy text 1"><SmallTextarea value={s.pageSpecificText1} onChange={v => updateField("pageSpecificText1", v)} /></Field>
      <Field label="Specifické případy text 2"><SmallTextarea value={s.pageSpecificText2} onChange={v => updateField("pageSpecificText2", v)} /></Field>
      <Field label="Konzultace ikonka"><PlainInput value={s.pageConsultIcon} onChange={v => updateField("pageConsultIcon", v)} /></Field>
      <Field label="Konzultace nadpis"><PlainInput value={s.pageConsultTitle} onChange={v => updateField("pageConsultTitle", v)} /></Field>
      <Field label="Konzultace text"><SmallTextarea value={s.pageConsultText} onChange={v => updateField("pageConsultText", v)} rows={4} /></Field>
      <Field label="Konzultace tlačítko text"><PlainInput value={s.pageConsultButtonText} onChange={v => updateField("pageConsultButtonText", v)} /></Field>
      <Field label="Konzultace tlačítko URL"><PlainInput value={s.pageConsultButtonHref} onChange={v => updateField("pageConsultButtonHref", v)} /></Field>

      <Divider label="Jednotlivé služby" />
      {s.items.map((service, i) => (
        <details key={service.id || i} open={i === 0} style={{ border: "1px solid #e5e7eb", borderRadius: 9, padding: "10px 12px", marginBottom: 10, background: "#f9fafb" }}>
          <summary style={{ cursor: "pointer", fontSize: 13, fontWeight: 800, color: "#374151" }}>{service.emoji} {service.title}</summary>
          <div style={{ marginTop: 12 }}>
            <Field label="ID"><PlainInput value={service.id} onChange={v => updateItem(i, { ...service, id: v })} /></Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <Field label="Ikonka / emoji"><PlainInput value={service.emoji} onChange={v => updateItem(i, { ...service, emoji: v })} /></Field>
              <Field label="Symbol pozadí"><PlainInput value={service.symbol} onChange={v => updateItem(i, { ...service, symbol: v })} /></Field>
            </div>
            <ColorField label="Barva služby" value={service.color} onChange={v => updateItem(i, { ...service, color: v })} />
            <Field label="Název služby"><RTE value={service.title} onChange={v => updateItem(i, { ...service, title: v })} /></Field>
            <Field label="Krátký text na kartě"><SmallTextarea value={service.teaser} onChange={v => updateItem(i, { ...service, teaser: v })} /></Field>
            <Field label="Úvod v popupu"><SmallTextarea value={service.lead} onChange={v => updateItem(i, { ...service, lead: v })} rows={4} /></Field>
            <Field label="Doplňkový text v popupu"><SmallTextarea value={service.body || ""} onChange={v => updateItem(i, { ...service, body: v })} /></Field>
            <Field label="CTA text"><PlainInput value={service.cta.label} onChange={v => updateItem(i, { ...service, cta: { ...service.cta, label: v } })} /></Field>
            <Field label="CTA URL"><PlainInput value={service.cta.href} onChange={v => updateItem(i, { ...service, cta: { ...service.cta, href: v } })} /></Field>
            <Divider label="Obsah popupu služby" />
            {(service.sections || []).map((section, sectionIndex) => (
              <ServiceSectionEditor
                key={sectionIndex}
                section={section}
                onChange={next => updateItem(i, { ...service, sections: service.sections.map((sec, idx) => idx === sectionIndex ? next : sec) })}
                onDelete={() => updateItem(i, { ...service, sections: service.sections.filter((_, idx) => idx !== sectionIndex) })}
              />
            ))}
            <button type="button" onClick={() => updateItem(i, { ...service, sections: [...service.sections, { heading: "Nový blok", paragraphs: ["Text bloku"] }] })} style={{ padding: "7px 12px", border: "1px solid #d8b4fe", borderRadius: 7, background: "#faf5ff", color: "#7c3bb2", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>+ Přidat blok do popupu</button>
            <button type="button" onClick={() => removeItem(i)} style={{ marginLeft: 8, padding: "7px 12px", border: "1px solid #fecaca", borderRadius: 7, background: "#fee2e2", color: "#b91c1c", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>Smazat službu</button>
          </div>
        </details>
      ))}
      <button type="button" onClick={addItem} style={{ width: "100%", padding: "9px", background: "#7c3bb2", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 800, cursor: "pointer" }}>+ Přidat službu</button>
    </div>
  );
}

// ── Pages editor ─────────────────────────────────────────────────────────────────

const BLOCK_TYPES: { type: BlockType; label: string; icon: string }[] = [
  { type: "hero-section", label: "Hero sekce", icon: "🌟" },
  { type: "cards-grid", label: "Karty (grid)", icon: "🃏" },
  { type: "two-col", label: "Dva sloupce", icon: "⬛⬛" },
  { type: "faq", label: "FAQ Accordion", icon: "❓" },
  { type: "contact-form", label: "Kontaktní formulář", icon: "✉️" },
  { type: "donation-qr", label: "Darovací QR", icon: "◩" },
  { type: "heading", label: "Nadpis", icon: "H" },
  { type: "text", label: "Text", icon: "T" },
  { type: "image", label: "Obrázek", icon: "🖼" },
  { type: "button", label: "Button", icon: "⬜" },
  { type: "banner", label: "Banner", icon: "🎨" },
  { type: "newsletter", label: "Newsletter", icon: "📧" },
  { type: "spacer", label: "Mezera", icon: "↕" },
];

// ── FAQ block editor ──────────────────────────────────────────────────────────

type PageBlockUpdate = PageBlock | ((current: PageBlock) => PageBlock);

function FaqBlockEditor({ block, onUpdate }: { block: PageBlock; onUpdate: (update: PageBlockUpdate) => void }) {
  const items = block.faqItems || [];

  function updateItem(id: string, field: "q" | "a", val: string) {
    onUpdate({ ...block, faqItems: items.map(it => it.id === id ? { ...it, [field]: val } : it) });
  }
  function addItem() {
    onUpdate({ ...block, faqItems: [...items, { id: Date.now().toString(), q: "Nová otázka", a: "Odpověď..." }] });
  }
  function removeItem(id: string) {
    onUpdate({ ...block, faqItems: items.filter(it => it.id !== id) });
  }
  function moveItem(id: string, dir: -1 | 1) {
    const idx = items.findIndex(it => it.id === id);
    if (idx < 0) return;
    const next = [...items];
    const swap = idx + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[idx], next[swap]] = [next[swap], next[idx]];
    onUpdate({ ...block, faqItems: next });
  }

  const inpStyle = { width: "100%", padding: "4px 7px", border: "1px solid #e5e7eb", borderRadius: 5, fontSize: 11, boxSizing: "border-box" as const };
  const labelStyle = { display: "block" as const, fontSize: 10, color: "#9ca3af", marginBottom: 2 };

  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <label style={labelStyle}>Název sekce</label>
        <input value={block.faqTitle || ""} onChange={e => onUpdate({ ...block, faqTitle: e.target.value })} style={inpStyle} />
      </div>
      <div style={{ marginBottom: 10 }}>
        <label style={labelStyle}>Podnapis</label>
        <input value={block.faqSubtitle || ""} onChange={e => onUpdate({ ...block, faqSubtitle: e.target.value })} style={inpStyle} />
      </div>
      <div style={{ fontSize: 10, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", marginBottom: 6 }}>Otázky &amp; odpovědi</div>
      {items.map((it, idx) => (
        <div key={it.id} style={{ border: "1px solid #e5e7eb", borderRadius: 7, padding: 8, marginBottom: 8, background: "#f9fafb" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#6b7280" }}>#{idx + 1}</span>
            <div style={{ display: "flex", gap: 4 }}>
              <button onClick={() => moveItem(it.id, -1)} disabled={idx === 0} style={{ padding: "2px 6px", fontSize: 10, background: "#f3f4f6", border: "1px solid #e5e7eb", borderRadius: 4, cursor: "pointer" }}>↑</button>
              <button onClick={() => moveItem(it.id, 1)} disabled={idx === items.length - 1} style={{ padding: "2px 6px", fontSize: 10, background: "#f3f4f6", border: "1px solid #e5e7eb", borderRadius: 4, cursor: "pointer" }}>↓</button>
              <button onClick={() => removeItem(it.id)} style={{ padding: "2px 6px", fontSize: 10, background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 4, color: "#dc2626", cursor: "pointer" }}>✕</button>
            </div>
          </div>
          <div style={{ marginBottom: 5 }}>
            <label style={labelStyle}>Otázka</label>
            <input value={it.q} onChange={e => updateItem(it.id, "q", e.target.value)} style={inpStyle} />
          </div>
          <div>
            <label style={labelStyle}>Odpověď (HTML)</label>
            <textarea value={it.a} onChange={e => updateItem(it.id, "a", e.target.value)}
              rows={2} style={{ ...inpStyle, resize: "vertical" }} />
          </div>
        </div>
      ))}
      <button onClick={addItem} style={{ width: "100%", padding: "7px", background: "#f0fdf4", border: "1px dashed #86efac", borderRadius: 7, color: "#16a34a", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
        + Přidat otázku
      </button>
    </div>
  );
}

// ── Cards grid block editor (own component, needs card-level state) ─────────────

function CardsGridBlockEditor({ block, onUpdate }: { block: PageBlock; onUpdate: (update: PageBlockUpdate) => void }) {
  const cards = block.cards || [];

  function updateCard(i: number, field: string, val: string) {
    onUpdate(current => ({
      ...current,
      cards: (current.cards || []).map((card, idx) =>
        idx === i ? { ...card, [field]: val } : card
      ),
    }));
  }

  function addCard() {
    onUpdate({ ...block, cards: [...cards, { image: "", mobileImage: "", title: "Nová karta", text: "", btnText: "Zjistit více", btnHref: "#" }] });
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
          <ImagePairField
            label="Obrázek karty"
            desktopValue={cards[i].image || ""}
            mobileValue={cards[i].mobileImage}
            onDesktopChange={v => updateCard(i, "image", v)}
            onMobileChange={v => updateCard(i, "mobileImage", v)}
          />
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
  onUpdate: (update: PageBlockUpdate) => void;
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
            <Field label="Text">
              <RTE value={block.content || ""} onChange={v => onUpdate({ ...block, content: v })} minHeight={100} />
            </Field>
            {sel("Zarovnání", "align", ["left", "center", "right"])}
          </>}
          {block.type === "image" && <>
            <ImagePairField label="Obrázek" desktopValue={block.src || ""} mobileValue={block.mobileSrc} onDesktopChange={v => onUpdate(current => ({ ...current, src: v }))} onMobileChange={v => onUpdate(current => ({ ...current, mobileSrc: v }))} />
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
            <ImagePairField label="Obrázek pozadí" desktopValue={block.bgImage || ""} mobileValue={block.mobileBgImage} onDesktopChange={v => onUpdate(current => ({ ...current, bgImage: v }))} onMobileChange={v => onUpdate(current => ({ ...current, mobileBgImage: v }))} />
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
            <ImagePairField label="Obrázek pozadí" desktopValue={block.heroBgImage || ""} mobileValue={block.mobileHeroBgImage} onDesktopChange={v => onUpdate(current => ({ ...current, heroBgImage: v }))} onMobileChange={v => onUpdate(current => ({ ...current, mobileHeroBgImage: v }))} />
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
            <Field label="Text">
              <RTE value={block.twoColText || ""} onChange={v => onUpdate({ ...block, twoColText: v })} minHeight={80} />
            </Field>
            <ImagePairField label="Obrázek" desktopValue={block.twoColImage || ""} mobileValue={block.mobileTwoColImage} onDesktopChange={v => onUpdate(current => ({ ...current, twoColImage: v }))} onMobileChange={v => onUpdate(current => ({ ...current, mobileTwoColImage: v }))} />
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
          {block.type === "faq" && (
            <FaqBlockEditor block={block} onUpdate={onUpdate} />
          )}
          {block.type === "donation-qr" && <>
            {inp("Malý nadpis", "qrEyebrow")}
            {inp("Nadpis", "qrTitle")}
            <Field label="Popis">
              <textarea
                value={block.qrText || ""}
                onChange={e => onUpdate({ ...block, qrText: e.target.value })}
                rows={3}
                style={{ width: "100%", padding: "6px 8px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 12, boxSizing: "border-box", resize: "vertical" }}
              />
            </Field>
            {inp("QR payload (SPAYD)", "qrPayload")}
            {inp("Popisek účtu", "qrAccountLabel")}
            {inp("Číslo účtu", "qrAccountNumber")}
            {inp("Kód banky", "qrBankCode")}
            {inp("Variabilní symbol", "qrVariableSymbol")}
            {inp("Zpráva pro příjemce", "qrMessage")}
            <Field label="Poznámka pod QR">
              <textarea
                value={block.qrNote || ""}
                onChange={e => onUpdate({ ...block, qrNote: e.target.value })}
                rows={2}
                style={{ width: "100%", padding: "6px 8px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 12, boxSizing: "border-box", resize: "vertical" }}
              />
            </Field>
          </>}
        </div>
      )}
    </div>
  );
}

function PagesEditor({ autoSlug }: { autoSlug?: string } = {}) {
  const { content, updateSection, getLatestSection, currentLang } = useContent();
  const pages: CustomPage[] = content.pages || [];
  const autoPage = autoSlug ? pages.find(p => p.slug === autoSlug) : null;
  const [selectedId, setSelectedId] = useState<string | null>(autoPage?.id ?? null);
  const [newSlug, setNewSlug] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [addingBlock, setAddingBlock] = useState(false);
  const pageSlugFocusRef = useRef("");

  const effectiveSelectedId = autoPage?.id ?? selectedId;
  const selected = pages.find(p => p.id === effectiveSelectedId) || null;

  const normalizeSlugInput = (value: string) => value
    .trim()
    .replace(/^https?:\/\/[^/]+/i, "")
    .replace(/[?#].*$/g, "")
    .replace(/^\/+|\/+$/g, "")
    .split("/")
    .filter(part => part !== "cs" && part !== "en" && part !== "ua")
    .join("-")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  const slugHref = (slug: string) => currentLang === "cs" ? `/${slug}` : `/${currentLang}/${slug}`;

  function addPage() {
    if (!newSlug.trim() || !newTitle.trim()) return;
    const slug = normalizeSlugInput(newSlug);
    if (!slug) return;
    const page: CustomPage = { id: createEditorId("page"), slug, title: newTitle.trim(), blocks: [] };
    updateSection("pages", [...pages, page]);
    setSelectedId(page.id);
    setNewSlug(""); setNewTitle("");
  }

  function deletePage(id: string) {
    if (!confirm("Smazat stránku?")) return;
    updateSection("pages", pages.filter(p => p.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  function updatePage(update: CustomPage | ((current: CustomPage) => CustomPage)) {
    // Use getLatestSection (reads from ref) to avoid overwriting concurrent edits
    // made by EditableText/EditableImg while the sidebar was open.
    const latestPages = (getLatestSection("pages", currentLang) as CustomPage[]) || [];
    const targetId = typeof update === "function" ? effectiveSelectedId : update.id;
    if (!targetId) return;
    updateSection("pages", latestPages.map(page => {
      if (page.id !== targetId) return page;
      return typeof update === "function" ? update(page) : update;
    }));
  }

  function updatePageSlug(value: string) {
    if (!selected) return;
    const slug = normalizeSlugInput(value);
    updatePage({ ...selected, slug });
  }

  function commitPageSlug(value: string) {
    if (!selected) return;
    const previous = pageSlugFocusRef.current;
    pageSlugFocusRef.current = "";
    const next = normalizeSlugInput(value);
    if (!previous || !next || previous === next) return;

    const redirects = (getLatestSection("routeRedirects", currentLang) as RouteRedirect[]) || [];
    const nextRedirects = withRouteChange(redirects, slugHref(previous), slugHref(next), currentLang);
    if (nextRedirects !== redirects) updateSection("routeRedirects", nextRedirects);
  }

  function addBlock(type: BlockType) {
    if (!selected) return;
    const BLOCK_DEFAULTS: Record<BlockType, Partial<PageBlock>> = {
      heading: { content: "Nový nadpis", level: "h2", align: "left" },
      text: { content: "<p>Nový text...</p>", align: "left" },
      image: { src: "", mobileSrc: "", alt: "", width: "100%", align: "center" },
      button: { content: "Klikni zde", href: "#", bgColor: "#7c3bb2", textColor: "#fff", size: "md", align: "center" },
      banner: { content: "Banner nadpis", subtitle: "Podnapis", bgColor: "linear-gradient(135deg,#7c3bb2,#5f2a8d)", bgImage: "", mobileBgImage: "", ctaText: "Zjistit více", ctaHref: "#", align: "center" },
      newsletter: { content: "Přihlás se k odběru", body: "Dostávej novinky přímo na email.", align: "center" },
      spacer: { height: 40 },
      "hero-section": { content: "Váš Hero Nadpis", subtitle: "Podnapis sekce", bgColor: "linear-gradient(135deg,#7c3bb2,#5f2a8d)", heroBgImage: "", mobileHeroBgImage: "", ctaText: "Zjistit více", ctaHref: "#", align: "center" },
      "cards-grid": { sectionTitle: "Naše služby", cards: [
        { image: "", mobileImage: "", title: "Karta 1", text: "Popis karty 1.", btnText: "Zjistit více", btnHref: "#" },
        { image: "", mobileImage: "", title: "Karta 2", text: "Popis karty 2.", btnText: "Zjistit více", btnHref: "#" },
        { image: "", mobileImage: "", title: "Karta 3", text: "Popis karty 3.", btnText: "Zjistit více", btnHref: "#" },
      ]},
      "two-col": { twoColTitle: "Nadpis sekce", twoColText: "<p>Text popis sekce.</p>", twoColImage: "", mobileTwoColImage: "", twoColBtnText: "Číst více", twoColBtnHref: "#", imageLeft: true },
      faq: { faqTitle: "Časté dotazy", faqSubtitle: "Odpovědi na vaše otázky", faqItems: [
        { id: createEditorId("faq"), q: "Otázka 1", a: "Odpověď na otázku 1." },
        { id: createEditorId("faq"), q: "Otázka 2", a: "Odpověď na otázku 2." },
      ]},
      "contact-form": {},
      "donation-qr": {
        qrEyebrow: "Dobrovolná podpora",
        qrTitle: "Pomozte tam, kde je to potřeba",
        qrText: "QR kód slouží pro dobrovolný příspěvek na výklad či poradenství pro člověka, který podporu právě potřebuje, ale nemůže si ji dovolit.",
        qrPayload: "SPD*1.0*ACC:CZ0000000000000000000000*CC:CZK*MSG:POMOC PRES ASTERA LIGHT",
        qrAccountLabel: "Náhledový účet",
        qrAccountNumber: "000000-0000000000",
        qrBankCode: "0000",
        qrVariableSymbol: "",
        qrMessage: "POMOC PRES ASTERA LIGHT",
        qrNote: "Účet je zatím náhledový. Před spuštěním ho vyměníme za reálný.",
      },
    };
    const defaults: Partial<PageBlock> = BLOCK_DEFAULTS[type] || {};
    const block: PageBlock = { id: createEditorId("block"), type, ...defaults };
    updatePage({ ...selected, blocks: [...selected.blocks, block] });
    setAddingBlock(false);
  }

  function updateBlock(blockId: string, update: PageBlockUpdate) {
    if (!selected) return;
    updatePage(currentPage => ({
      ...currentPage,
      blocks: currentPage.blocks.map(currentBlock => {
        if (currentBlock.id !== blockId) return currentBlock;
        return typeof update === "function" ? update(currentBlock) : update;
      }),
    }));
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
            <a href={slugHref(p.slug)} target="_blank" style={{ fontSize: 11, color: "#7c3bb2" }}>↗</a>
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
          <a href={slugHref(selected.slug)} target="_blank" style={{ fontSize: 11, color: "#7c3bb2" }}>{slugHref(selected.slug)} ↗</a>
        </div>
      </div>

      <Field label="URL stránky">
        <input
          type="text"
          value={selected.slug}
          onFocus={() => { pageSlugFocusRef.current = selected.slug; }}
          onChange={e => updatePageSlug(e.target.value)}
          onBlur={e => commitPageSlug(e.target.value)}
          placeholder="napr. jak-podekovat"
          style={{ width: "100%", padding: "6px 8px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 12, boxSizing: "border-box" }}
        />
      </Field>

      {selected.blocks.map((block, i) => (
        <BlockEditorPanel
          key={block.id}
          block={block}
          onUpdate={update => updateBlock(block.id, update)}
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
  const s: SiteSettings = content.siteSettings || { accentColor: "#7c3bb2", logoUrl: "", mobileLogoUrl: "", metaTitle: "", metaDescription: "", customCss: "" };
  const upd = (data: SiteSettings) =>
    updateSection("siteSettings", current => mergeChangedFields(current, s, data));
  const updField = (key: keyof SiteSettings, value: string) =>
    updateSection("siteSettings", current => ({ ...current, [key]: value }));

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
      <ImagePairField label="Logo" desktopValue={s.logoUrl || ""} mobileValue={s.mobileLogoUrl} onDesktopChange={v => updField("logoUrl", v)} onMobileChange={v => updField("mobileLogoUrl", v)} />

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

function RouteRedirectsEditor() {
  const { content, updateSection } = useContent();
  const redirects = content.routeRedirects || [];

  return (
    <div>
      <p style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.5, margin: "0 0 12px" }}>
        Redirecty se přidávají automaticky při změně URL v menu nebo u stránky.
      </p>
      {redirects.length === 0 ? (
        <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>Zatím žádné redirecty.</p>
      ) : redirects.map((item, i) => (
        <div key={item.id || `${item.from}-${item.to}`} style={{ padding: 10, border: "1px solid #e5e7eb", borderRadius: 8, background: "#f9fafb", marginBottom: 8 }}>
          <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}>Z původní URL</div>
          <div style={{ fontSize: 12, fontFamily: "monospace", color: "#374151", wordBreak: "break-all" }}>{item.from}</div>
          <div style={{ fontSize: 11, color: "#6b7280", margin: "8px 0 4px" }}>Na novou URL</div>
          <div style={{ fontSize: 12, fontFamily: "monospace", color: "#374151", wordBreak: "break-all" }}>{item.to}</div>
          {item.target && (
            <>
              <div style={{ fontSize: 11, color: "#6b7280", margin: "8px 0 4px" }}>Vykresluje obsah</div>
              <div style={{ fontSize: 12, fontFamily: "monospace", color: "#374151", wordBreak: "break-all" }}>{item.target}</div>
            </>
          )}
          <button
            type="button"
            onClick={() => updateSection("routeRedirects", redirects.filter((_, idx) => idx !== i))}
            style={{ marginTop: 10, padding: "5px 9px", background: "#fff", color: "#ef4444", border: "1px solid #fecaca", borderRadius: 6, fontSize: 11, cursor: "pointer" }}
          >
            Smazat redirect
          </button>
        </div>
      ))}
    </div>
  );
}

// ── Wheel of Fortune editor ──────────────────────────────────────────────────────

const WHEEL_COLORS = ["#7c3bb2", "#c9a84c", "#a84a80", "#5878c0", "#5a9e7c", "#c08040", "#7c6ad4", "#3d2060", "#4a2880"];

const MOON_PHASES = [
  { key: "New Moon", label: "New Moon" },
  { key: "Waxing Crescent", label: "Waxing Crescent" },
  { key: "First Quarter", label: "First Quarter" },
  { key: "Waxing Gibbous", label: "Waxing Gibbous" },
  { key: "Full Moon", label: "Full Moon" },
  { key: "Waning Gibbous", label: "Waning Gibbous" },
  { key: "Third Quarter", label: "Third Quarter" },
  { key: "Last Quarter", label: "Last Quarter" },
  { key: "Waning Crescent", label: "Waning Crescent" },
];

function MoonWidgetEditor() {
  const { content, updateSection, currentLang } = useContent();
  const cfg: MoonWidgetConfig = content.moonWidget ?? DEFAULT_CONTENT.moonWidget;
  const upd = (data: MoonWidgetConfig) => updateSection("moonWidget", data);
  const updatePhase = (phaseKey: string, field: "label" | "description", value: string) => {
    const currentPhase = cfg.phases?.[phaseKey] ?? { label: phaseKey, description: "" };
    upd({
      ...cfg,
      phases: {
        ...cfg.phases,
        [phaseKey]: { ...currentPhase, [field]: value },
      },
    });
  };
  const updateStage = (stageKey: string, value: string) => {
    upd({
      ...cfg,
      stages: {
        ...cfg.stages,
        [stageKey]: value,
      },
    });
  };

  return (
    <div>
      <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.5, marginBottom: 14, padding: "10px 12px", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8 }}>
        Upravuješ texty pro aktuální jazyk: <strong>{currentLang.toUpperCase()}</strong>. Přepni jazyk webu a můžeš upravit další jazyk.
      </div>

      <Divider label="Obecné texty" />
      <Field label="Aria label / název widgetu">
        <PlainInput value={cfg.aria} onChange={v => upd({ ...cfg, aria: v })} />
      </Field>
      <Field label="Zavírací tlačítko">
        <PlainInput value={cfg.close} onChange={v => upd({ ...cfg, close: v })} />
      </Field>
      <Field label="Text osvětlení">
        <PlainInput value={cfg.illumination} onChange={v => upd({ ...cfg, illumination: v })} />
      </Field>

      <Divider label="Stavy měsíce" />
      <Field label="Dorůstající / Waxing">
        <PlainInput value={cfg.stages?.Waxing ?? ""} onChange={v => updateStage("Waxing", v)} />
      </Field>
      <Field label="Ubývající / Waning">
        <PlainInput value={cfg.stages?.Waning ?? ""} onChange={v => updateStage("Waning", v)} />
      </Field>

      <Divider label="Fáze měsíce" />
      {MOON_PHASES.map(({ key, label }) => {
        const phase = cfg.phases?.[key] ?? { label, description: "" };
        return (
          <div key={key} style={{ border: "1px solid #e5e7eb", borderRadius: 9, padding: "10px 12px", marginBottom: 10, background: "#fafafa" }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#7c3bb2", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>
              {label}
            </div>
            <Field label="Název fáze">
              <PlainInput value={phase.label} onChange={v => updatePhase(key, "label", v)} />
            </Field>
            <Field label="Popis v popupu">
              <SmallTextarea value={phase.description} onChange={v => updatePhase(key, "description", v)} rows={4} />
            </Field>
          </div>
        );
      })}
    </div>
  );
}

function WheelEditor() {
  const { content, updateSection } = useContent();
  const cfg: WheelOfFortuneConfig = content.wheelOfFortune;
  const upd = (data: WheelOfFortuneConfig) => updateSection("wheelOfFortune", data);
  const updField = (key: keyof Omit<WheelOfFortuneConfig, "segments" | "enabled">, val: string) =>
    upd({ ...cfg, [key]: val });
  const updSeg = (i: number, seg: WheelSegment) =>
    upd({ ...cfg, segments: cfg.segments.map((s, idx) => idx === i ? seg : s) });
  const removeSeg = (i: number) =>
    upd({ ...cfg, segments: cfg.segments.filter((_, idx) => idx !== i) });
  const addSeg = () =>
    upd({
      ...cfg, segments: [...cfg.segments, {
        id: `seg-${Date.now()}`, label: "Nová výhra",
        color: WHEEL_COLORS[cfg.segments.length % WHEEL_COLORS.length],
        weight: 1, isLoss: false, coupon: "KOD",
      }],
    });

  const [leadsOpen, setLeadsOpen] = useState(false);
  const [leads, setLeads] = useState<{ id: number; email: string; segment_label: string; coupon: string; is_win: boolean; created_at: string }[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(false);

  const loadLeads = async () => {
    setLeadsLoading(true);
    try {
      const res = await fetch(asteraWheelUrl());
      const data = await res.json();
      setLeads(data.leads || []);
    } catch {
      setLeads([]);
    } finally {
      setLeadsLoading(false);
    }
  };

  return (
    <div>
      {/* Toggle enabled */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, padding: "10px 12px", background: cfg.enabled ? "#f0fdf4" : "#fef2f2", borderRadius: 9, border: `1px solid ${cfg.enabled ? "#86efac" : "#fca5a5"}` }}>
        <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: cfg.enabled ? "#166534" : "#991b1b" }}>
          {cfg.enabled ? "✅ Kolo je aktivní" : "⛔ Kolo je vypnuté"}
        </span>
        <button
          type="button"
          onClick={() => upd({ ...cfg, enabled: !cfg.enabled })}
          style={{ padding: "6px 14px", borderRadius: 8, border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer", background: cfg.enabled ? "#fca5a5" : "#86efac", color: cfg.enabled ? "#991b1b" : "#166534" }}
        >
          {cfg.enabled ? "Vypnout" : "Zapnout"}
        </button>
      </div>

      <Divider label="Zobrazení" />

      {/* Display style */}
      <Field label="Styl zobrazení">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
          {([
            { val: "popup",    icon: "🪟", label: "Popup", desc: "Překryje stránku při scrollu dolů" },
            { val: "side_tab", icon: "📌", label: "Záložka", desc: "Záložka na okraji stránky, otevře panel" },
            { val: "embedded", icon: "📄", label: "Vložené", desc: "Kolo přímo na stránce jako sekce" },
          ] as const).map(({ val, icon, label, desc }) => {
            const active = (cfg.displayStyle || "popup") === val;
            return (
              <button
                key={val} type="button"
                onClick={() => upd({ ...cfg, displayStyle: val })}
                title={desc}
                style={{
                  padding: "10px 6px", borderRadius: 9, border: `2px solid ${active ? "#7c3bb2" : "#e5e7eb"}`,
                  background: active ? "#f3e8ff" : "#fff", cursor: "pointer",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                  transition: "all 0.15s",
                }}
              >
                <span style={{ fontSize: 20 }}>{icon}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: active ? "#7c3bb2" : "#374151" }}>{label}</span>
                <span style={{ fontSize: 9, color: "#6b7280", lineHeight: 1.3, textAlign: "center" }}>{desc}</span>
              </button>
            );
          })}
        </div>
      </Field>

      {/* Show frequency */}
      <Field label="Jak často zobrazit návštěvníkovi">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
          {([
            { val: "once_per_day",     icon: "📅", label: "1× za den",    desc: "Jednou za 24 hodin" },
            { val: "once_per_session", icon: "🔁", label: "1× za relaci", desc: "Jednou za otevření prohlížeče" },
            { val: "every_visit",      icon: "👁", label: "Vždy",         desc: "Každému návštěvníkovi pokaždé" },
          ] as const).map(({ val, icon, label, desc }) => {
            const active = (cfg.showFrequency || "once_per_day") === val;
            return (
              <button
                key={val} type="button"
                onClick={() => upd({ ...cfg, showFrequency: val })}
                title={desc}
                style={{
                  padding: "10px 6px", borderRadius: 9, border: `2px solid ${active ? "#7c3bb2" : "#e5e7eb"}`,
                  background: active ? "#f3e8ff" : "#fff", cursor: "pointer",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                  transition: "all 0.15s",
                }}
              >
                <span style={{ fontSize: 20 }}>{icon}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: active ? "#7c3bb2" : "#374151" }}>{label}</span>
                <span style={{ fontSize: 9, color: "#6b7280", lineHeight: 1.3, textAlign: "center" }}>{desc}</span>
              </button>
            );
          })}
        </div>
      </Field>

      <Divider label="Texty" />
      <Field label="Nadpis"><PlainInput value={cfg.title} onChange={v => updField("title", v)} /></Field>
      <Field label="Podnadpis"><PlainInput value={cfg.subtitle} onChange={v => updField("subtitle", v)} /></Field>
      <Field label="Placeholder e-mailu"><PlainInput value={cfg.emailPlaceholder} onChange={v => updField("emailPlaceholder", v)} /></Field>
      <Field label="Text tlačítka"><PlainInput value={cfg.spinButtonText} onChange={v => updField("spinButtonText", v)} /></Field>
      <Field label="Text soukromí (pod tlačítkem)"><PlainInput value={cfg.privacyText} onChange={v => updField("privacyText", v)} /></Field>

      <Divider label="Výsledky" />
      <Field label="Nadpis při výhře"><PlainInput value={cfg.winTitle} onChange={v => updField("winTitle", v)} /></Field>
      <Field label="Text při výhře"><SmallTextarea value={cfg.winText} onChange={v => updField("winText", v)} /></Field>
      <Field label="Nadpis při prohře"><PlainInput value={cfg.lossTitle} onChange={v => updField("lossTitle", v)} /></Field>
      <Field label="Text při prohře"><SmallTextarea value={cfg.lossText} onChange={v => updField("lossText", v)} /></Field>

      <Divider label={`Segmenty kola (${cfg.segments.length})`} />
      {cfg.segments.map((seg, i) => (
        <div key={seg.id} style={{ border: "1px solid #e5e7eb", borderRadius: 9, padding: "10px 12px", marginBottom: 8, background: "#fafafa", borderLeft: `4px solid ${seg.color}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <div style={{ width: 16, height: 16, borderRadius: "50%", background: seg.color, border: "1px solid rgba(0,0,0,0.15)", flexShrink: 0 }} />
            <strong style={{ flex: 1, fontSize: 12, color: "#374151" }}>{seg.label || "segment"}</strong>
            <button type="button" onClick={() => removeSeg(i)} style={{ padding: "3px 8px", border: "1px solid #fecaca", borderRadius: 6, background: "#fee2e2", color: "#b91c1c", cursor: "pointer", fontSize: 11 }}>✕</button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
            <Field label="Label (text na kole)">
              <input value={seg.label} onChange={e => updSeg(i, { ...seg, label: e.target.value })}
                style={{ width: "100%", boxSizing: "border-box", padding: "6px 8px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 12 }} />
            </Field>
            <Field label="Kupon / kód výhry">
              <input value={seg.coupon} onChange={e => updSeg(i, { ...seg, coupon: e.target.value })}
                placeholder="napr. SLEVA10"
                style={{ width: "100%", boxSizing: "border-box", padding: "6px 8px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 12, fontFamily: "monospace" }} />
            </Field>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, alignItems: "end" }}>
            <Field label="Váha (pravděpodobnost)">
              <input type="number" min={1} max={20} value={seg.weight}
                onChange={e => updSeg(i, { ...seg, weight: Math.max(1, Number(e.target.value)) })}
                style={{ width: "100%", boxSizing: "border-box", padding: "6px 8px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 12 }} />
            </Field>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.6px" }}>Typ segmentu</label>
              <select value={seg.isLoss ? "loss" : "win"} onChange={e => updSeg(i, { ...seg, isLoss: e.target.value === "loss" })}
                style={{ padding: "6px 8px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 12 }}>
                <option value="win">🎁 Výhra</option>
                <option value="loss">😅 Příště štěstí</option>
              </select>
            </div>
          </div>

          {/* Color picker */}
          <div style={{ marginTop: 8 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 5 }}>Barva segmentu</label>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 5 }}>
              {WHEEL_COLORS.map(c => (
                <button key={c} type="button" onClick={() => updSeg(i, { ...seg, color: c })}
                  style={{ width: 22, height: 22, borderRadius: "50%", background: c, border: seg.color === c ? "2px solid #111" : "1px solid #d1d5db", cursor: "pointer" }} />
              ))}
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <input type="color" value={/^#[0-9a-f]{6}$/i.test(seg.color) ? seg.color : "#7c3bb2"}
                onChange={e => updSeg(i, { ...seg, color: e.target.value })}
                style={{ width: 38, height: 30, border: "1px solid #e5e7eb", borderRadius: 5, cursor: "pointer", padding: 2 }} />
              <input type="text" value={seg.color} onChange={e => updSeg(i, { ...seg, color: e.target.value })}
                style={{ flex: 1, padding: "5px 8px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 11, fontFamily: "monospace" }} />
            </div>
          </div>
        </div>
      ))}
      <button type="button" onClick={addSeg}
        style={{ width: "100%", padding: "9px", background: "#7c3bb2", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 800, cursor: "pointer", marginBottom: 6 }}>
        + Přidat segment
      </button>

      {/* Leads section */}
      <Divider label="Sesbírané e-maily (leads)" />
      <button type="button"
        onClick={() => { setLeadsOpen(o => !o); if (!leadsOpen) loadLeads(); }}
        style={{ width: "100%", padding: "8px", background: "#f0f9ff", border: "1px solid #7c3bb2", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", color: "#7c3bb2", marginBottom: 8 }}>
        {leadsOpen ? "▲ Skrýt leads" : "▼ Zobrazit leads"}
      </button>
      {leadsOpen && (
        <div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 6 }}>
            <button type="button" onClick={loadLeads} style={{ padding: "5px 10px", fontSize: 11, border: "1px solid #e5e7eb", borderRadius: 6, background: "#fff", cursor: "pointer" }}>
              ↺ Obnovit
            </button>
          </div>
          {leadsLoading ? (
            <p style={{ fontSize: 12, color: "#6b7280", textAlign: "center", padding: "12px 0" }}>Načítám…</p>
          ) : leads.length === 0 ? (
            <p style={{ fontSize: 12, color: "#6b7280", textAlign: "center", padding: "12px 0" }}>Zatím žádné e-maily.</p>
          ) : (
            <div style={{ maxHeight: 280, overflowY: "auto", border: "1px solid #e5e7eb", borderRadius: 8 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                <thead>
                  <tr style={{ background: "#f9fafb", position: "sticky", top: 0 }}>
                    <th style={{ padding: "6px 8px", textAlign: "left", borderBottom: "1px solid #e5e7eb", color: "#374151" }}>E-mail</th>
                    <th style={{ padding: "6px 8px", textAlign: "left", borderBottom: "1px solid #e5e7eb", color: "#374151" }}>Výhra</th>
                    <th style={{ padding: "6px 8px", textAlign: "left", borderBottom: "1px solid #e5e7eb", color: "#374151" }}>Datum</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map(l => (
                    <tr key={l.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                      <td style={{ padding: "5px 8px", color: "#374151" }}>{l.email}</td>
                      <td style={{ padding: "5px 8px" }}>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 3,
                          padding: "2px 6px", borderRadius: 5, fontSize: 10,
                          background: l.is_win ? "#f0fdf4" : "#fef2f2",
                          color: l.is_win ? "#166534" : "#991b1b",
                          border: `1px solid ${l.is_win ? "#86efac" : "#fca5a5"}`,
                        }}>
                          {l.is_win ? "🎁" : "😅"} {l.segment_label}
                          {l.coupon && <span style={{ fontFamily: "monospace", fontWeight: 700 }}> · {l.coupon}</span>}
                        </span>
                      </td>
                      <td style={{ padding: "5px 8px", color: "#9ca3af" }}>
                        {new Date(l.created_at).toLocaleString("cs-CZ", { dateStyle: "short", timeStyle: "short" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p style={{ fontSize: 10, color: "#9ca3af", padding: "5px 8px", margin: 0, textAlign: "right" }}>{leads.length} záznamů</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Section editor map ──────────────────────────────────────────────────────────

const EDITORS: Record<Section, React.ComponentType> = {
  header: HeaderEditor,
  hero: HeroEditor,
  newsletter: NewsletterEditor,
  about: AboutEditor,
  testimonials: TestimonialsEditor,
  manifest: ManifestEditor,
  pickacard: PickACardEditor,
  crystalBall: CrystalBallEditor,
  oracle: OracleEditor,
  moonWidget: MoonWidgetEditor,
  servicesContent: ServicesEditor,
  wheelOfFortune: WheelEditor,
  footer: FooterEditor,
  aboutPage: AboutPageEditor,
  pages: PagesEditor,
  routeRedirects: RouteRedirectsEditor,
  siteSettings: SiteSettingsEditor,
};

// ── Main LiveEditor panel ──────────────────────────────────────────────────────

export default function LiveEditor() {
  const { admin, content, currentLang, saveAll, undo, canUndo, saveStatus, logout } = useContent();
  const pathname = usePathname();
  const router = useRouter();
  const basePath = stripLangPrefix(pathname ?? "/");
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<Section>("hero");
  const [editorKey, setEditorKey] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [viewportReady, setViewportReady] = useState(false);

  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth <= 700);
      setViewportReady(true);
    };
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
  const currentCustomPage = useMemo(() => {
    if (STATIC_ROUTES.includes(basePath)) return null;
    const requestedSlug = basePath.replace(/^\/+/, "").split("/")[0] || "";
    const candidates = resolveLocalizedPageSlug(requestedSlug, currentLang);
    return (content.pages || []).find(page => candidates.includes(page.slug)) ?? null;
  }, [content.pages, basePath, currentLang]);

  // Filter sections based on current route (use lang-stripped basePath)
  const visibleSections = useMemo(() => {
    if (basePath === "/") return ALL_SECTIONS.filter(s => HOMEPAGE_KEYS.includes(s.key));
    if (basePath === "/sluzby") return ALL_SECTIONS.filter(s => SLUZBY_KEYS.includes(s.key));
    if (currentCustomPage) return ALL_SECTIONS.filter(s => CUSTOM_PAGE_KEYS.includes(s.key));
    return ALL_SECTIONS;
  }, [basePath, currentCustomPage]);

  if (!admin.isAdmin || !viewportReady) return null;

  const resolvedActiveSection = visibleSections.some(s => s.key === activeSection)
    ? activeSection
    : visibleSections[0]?.key ?? "hero";
  const ActiveEditor = EDITORS[resolvedActiveSection];

  function handleUndo() {
    undo();
    setEditorKey(k => k + 1);
  }

  async function handleLogout() {
    await logout();
    setOpen(false);
  }

  async function switchLanguage(lang: Lang) {
    if (lang === currentLang) return;
    await saveAll();
    // Hosted in Venom (/demo/<slug>/admin) the language is a query param, not a
    // path prefix — localizePath would build a broken /en/demo/... URL.
    if (pathname && pathname.includes("/demo/")) {
      router.push(`${pathname.split("?")[0]}?lang=${lang}`);
    } else {
      router.push(localizePath(pathname ?? "/", lang));
    }
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

        <div style={{ flexShrink: 0, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, padding: "9px 12px", borderBottom: "1px solid #e5e7eb", background: "#fff" }}>
          {LANGUAGES.map(language => (
            <button
              key={language.code}
              type="button"
              onClick={() => switchLanguage(language.code)}
              title={`Editovat ${language.label}`}
              style={{
                padding: "8px 6px",
                borderRadius: 8,
                border: currentLang === language.code ? "2px solid #7c3bb2" : "1px solid #e5e7eb",
                background: currentLang === language.code ? "#f5f3ff" : "#fff",
                color: currentLang === language.code ? "#5f2a8d" : "#6b7280",
                cursor: "pointer",
                fontSize: 11,
                fontWeight: currentLang === language.code ? 800 : 600,
              }}
            >
              <span style={{ fontSize: 18, display: "block", marginBottom: 2 }}>{language.flag}</span>
              {language.code.toUpperCase()}
            </button>
          ))}
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
                borderBottom: resolvedActiveSection === s.key ? "2px solid #7c3bb2" : "2px solid transparent",
                background: resolvedActiveSection === s.key ? "rgba(124,59,178,0.08)" : "none",
                color: resolvedActiveSection === s.key ? "#7c3bb2" : "#6b7280",
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
          {currentCustomPage && resolvedActiveSection === "pages" ? (
            <PagesEditor key={`pages-${currentCustomPage.slug}-${editorKey}`} autoSlug={currentCustomPage.slug} />
          ) : (
            <ActiveEditor key={`${resolvedActiveSection}-${editorKey}`} />
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
