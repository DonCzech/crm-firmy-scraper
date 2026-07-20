"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";

/**
 * Našeptávač ve stylu Luigi's Box: mega-panel s frázemi, kategoriemi,
 * značkami, top produktem a mřížkou produktů + rychlé přidání do košíku.
 * Prázdný input → „top" obsah (nejhledanější fráze, top kategorie…).
 */

interface SuggestProduct {
  id: number; slug: string; title: string; brand: string | null;
  price_cents: number; image_url: string | null;
  default_variant_id: number | null; variant_count: number;
}
interface SuggestCategory { id: number; slug: string; name: string; parent_name: string | null }
export interface Suggestions {
  mode: "query" | "top";
  phrases: string[];
  categories: SuggestCategory[];
  brands: string[];
  products: SuggestProduct[];
}

function czk(cents: number): string {
  return new Intl.NumberFormat("cs-CZ", { style: "currency", currency: "CZK", maximumFractionDigits: 0 }).format(cents / 100);
}

/** Zvýraznění shody dotazu v textu (jako Luigi's Box <mark>). */
function Hi({ text, q }: { text: string; q: string }) {
  if (!q) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded-[3px] bg-[var(--wsa-mark,rgba(29,154,68,0.15))] px-[1px] text-inherit">{text.slice(idx, idx + q.length)}</mark>
      {text.slice(idx + q.length)}
    </>
  );
}

const RAIL_TITLE = "mb-2 text-[12px] font-bold uppercase tracking-[0.08em] text-neutral-400";

/**
 * Volitelný skin šablony: CSS proměnné --wsa-* (+ fontFamily) na root elementu.
 * Bez theme se použijí defaulty = původní vzhled (zelená, zaoblené rohy).
 */
export function SearchAutocomplete({ tenantSlug, theme, initialData, inlineResults = false, placeholder = "Hledat produkty, kategorie, značky…" }: { tenantSlug: string; theme?: CSSProperties; initialData?: Suggestions | null; inlineResults?: boolean; placeholder?: string }) {
  const [q, setQ] = useState("");
  const [data, setData] = useState<Suggestions | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [addingId, setAddingId] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const topCache = useRef<Suggestions | null>(initialData ?? null);
  const reqSeq = useRef(0);

  const base = `/demo/${tenantSlug}/obchod`;
  const api = `/api/demo/${tenantSlug}/shop/search`;

  const search = useCallback(async (query: string) => {
    const isTop = query.trim().length < 2;
    if (isTop && topCache.current) { setData(topCache.current); setOpen(true); return; }
    const seq = ++reqSeq.current;
    setLoading(true);
    try {
      const res = await fetch(`${api}?q=${encodeURIComponent(query.trim())}`);
      const payload: Suggestions = await res.json();
      if (seq !== reqSeq.current) return;
      if (isTop) topCache.current = payload;
      setData(payload);
      setOpen(true);
    } catch { /* síť — necháme poslední stav */ }
    finally { if (seq === reqSeq.current) setLoading(false); }
  }, [api]);

  function onChange(val: string) {
    setQ(val);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => search(val), 220);
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /** Zaloguje potvrzené hledání (fráze pro „nejhledanější"). */
  function logQuery(query: string) {
    const trimmed = query.trim();
    if (trimmed.length < 2) return;
    fetch(api, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ q: trimmed }) }).catch(() => {});
    topCache.current = null;
  }

  function goToResults(query: string) {
    logQuery(query);
    window.location.href = `${base}?q=${encodeURIComponent(query.trim())}`;
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && q.trim().length >= 2) { e.preventDefault(); goToResults(q); }
    if (e.key === "Escape") setOpen(false);
  }

  async function quickAdd(p: SuggestProduct) {
    if (p.variant_count > 1 || !p.default_variant_id) {
      logQuery(q);
      window.location.href = `${base}/${p.slug}`;
      return;
    }
    if (addingId) return;
    setAddingId(p.id);
    try {
      const res = await fetch(`/api/demo/${tenantSlug}/shop/cart/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variant_id: p.default_variant_id, qty: 1 }),
      });
      if (!res.ok) throw new Error();
      window.dispatchEvent(new CustomEvent("webero-cart-updated"));
      window.dispatchEvent(new CustomEvent("webero-cart-item-added", {
        detail: { title: p.title, price: czk(p.price_cents), image: p.image_url ?? undefined, tenantSlug },
      }));
      logQuery(q);
    } catch { /* toast neukazujeme, tlačítko se jen uvolní */ }
    finally { setAddingId(null); }
  }

  const isQuery = data?.mode === "query" && q.trim().length >= 2;
  const hiQ = isQuery ? q.trim() : "";
  const topProduct = data?.products[0] ?? null;
  const gridProducts = data ? data.products.slice(1, 7) : [];
  const hasAny = !!data && (data.products.length > 0 || data.categories.length > 0 || data.phrases.length > 0);

  const CartBtn = ({ p, size = 34 }: { p: SuggestProduct; size?: number }) => (
    <button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); quickAdd(p); }}
      disabled={addingId === p.id}
      title={p.variant_count > 1 ? "Vybrat variantu" : "Přidat do košíku"}
      className="flex shrink-0 items-center justify-center rounded-[var(--wsa-radius-pill,9999px)] bg-[var(--wsa-accent,#1d9a44)] text-[var(--wsa-on-accent,#fff)] shadow-sm transition hover:bg-[var(--wsa-accent-dark,#137a35)] disabled:opacity-60"
      style={{ width: size, height: size }}
    >
      {addingId === p.id ? (
        <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" /><path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg>
      ) : (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1.5" fill="currentColor" /><circle cx="19" cy="21" r="1.5" fill="currentColor" /><path d="M2 3h3l2.7 13.4a2 2 0 0 0 2 1.6h8.9a2 2 0 0 0 2-1.6L23 7H6" /></svg>
      )}
    </button>
  );

  return (
    <div ref={ref} className="relative w-full" style={theme}>
      {/* ── Input ─────────────────────────────────────────────── */}
      <div className="relative">
        <input
          type="text"
          value={q}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => search(q)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className="h-[42px] w-full rounded-[var(--wsa-radius,10px)] border-[1.5px] border-neutral-200 bg-neutral-50 pl-4 pr-12 text-[14px] text-neutral-900 outline-none transition focus:border-[var(--wsa-accent,#1d9a44)] focus:bg-white focus:shadow-[0_0_0_3px_var(--wsa-ring,rgba(29,154,68,0.1))] sm:pr-[96px]"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
        />
        <button
          onClick={() => { if (q.trim().length >= 2) goToResults(q); }}
          className="absolute right-1.5 top-1/2 flex h-[32px] -translate-y-1/2 items-center gap-1.5 rounded-[var(--wsa-radius-sm,8px)] px-2.5 text-[12px] font-bold uppercase tracking-[0.06em] text-[var(--wsa-search-btn,#1d9a44)] transition hover:bg-[var(--wsa-accent-soft,rgba(29,154,68,0.1))] sm:px-3"
          aria-label="Hledat"
        >
          {loading ? (
            <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="rgba(0,0,0,0.1)" strokeWidth="3" /><path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><circle cx="11" cy="11" r="7.5" /><path d="M20.5 20.5l-3.5-3.5" /></svg>
          )}
          <span className="hidden sm:inline">Hledat</span>
        </button>
      </div>

      {/* ── Mega panel ────────────────────────────────────────── */}
      {open && data && hasAny && (
        <div
          className={inlineResults
            ? "mt-4 w-full overflow-hidden border-t border-neutral-200 bg-white"
            : "absolute left-1/2 top-[calc(100%+8px)] z-[220] w-[min(940px,calc(100vw-20px))] -translate-x-1/2 overflow-hidden rounded-[var(--wsa-radius-lg,16px)] border border-neutral-200 bg-white shadow-[0_24px_70px_rgba(0,0,0,0.16),0_6px_18px_rgba(0,0,0,0.07)]"}
          role="listbox"
        >
          <div className="flex max-h-[min(560px,70vh)] flex-col overflow-y-auto md:flex-row md:overflow-visible">

            {/* ── Levý rail: fráze / kategorie / značky ─────────── */}
            <div className="flex w-full shrink-0 flex-col gap-5 border-b border-neutral-100 bg-neutral-50/80 p-5 md:w-[240px] md:border-b-0 md:border-r">
              {data.phrases.length > 0 && (
                <div>
                  <div className={RAIL_TITLE}>{isQuery ? "Fráze" : "Nejhledanější fráze"}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {data.phrases.map((p) => (
                      <button key={p} onClick={() => { setQ(p); search(p); }}
                        className="rounded-[var(--wsa-radius-xs,6px)] bg-[var(--wsa-accent-soft,rgba(29,154,68,0.1))] px-2.5 py-1 text-[12.5px] font-semibold text-[var(--wsa-accent-text,#137a35)] transition hover:bg-[var(--wsa-accent,#1d9a44)] hover:text-[var(--wsa-on-accent,#fff)]">
                        <Hi text={p} q={hiQ} />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {data.categories.length > 0 && (
                <div>
                  <div className={RAIL_TITLE}>{isQuery ? "Kategorie" : "Top kategorie"}</div>
                  <ul className="space-y-1">
                    {data.categories.map((c) => (
                      <li key={c.id}>
                        <a href={`${base}?kategorie=${c.slug}`} onClick={() => logQuery(q)}
                          className="block truncate text-[13px] font-medium text-neutral-700 transition hover:text-[var(--wsa-link-hover,#1d9a44)]">
                          {c.parent_name && <span className="text-neutral-400">{c.parent_name} › </span>}
                          <Hi text={c.name} q={hiQ} />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {data.brands.length > 0 && (
                <div>
                  <div className={RAIL_TITLE}>{isQuery ? "Značky" : "Top značky"}</div>
                  <ul className="space-y-1">
                    {data.brands.map((b) => (
                      <li key={b}>
                        <a href={`${base}?znacka=${encodeURIComponent(b)}`} onClick={() => logQuery(q)}
                          className="block text-[13px] font-medium text-neutral-700 transition hover:text-[var(--wsa-link-hover,#1d9a44)]">
                          <Hi text={b} q={hiQ} />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-auto hidden items-center gap-1.5 pt-2 text-[11px] text-neutral-400 md:flex">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><circle cx="11" cy="11" r="7.5" /><path d="M20.5 20.5l-3.5-3.5" /></svg>
                Chytré hledání Webero
              </div>
            </div>

            {/* ── Top produkt ───────────────────────────────────── */}
            {topProduct && (
              <div className="hidden w-[250px] shrink-0 flex-col border-r border-neutral-100 p-5 md:flex">
                <div className={RAIL_TITLE}>Top produkt</div>
                <a href={`${base}/${topProduct.slug}`} onClick={() => logQuery(q)} className="group flex flex-1 flex-col text-center">
                  <div className="mx-auto h-[150px] w-[150px] overflow-hidden rounded-[var(--wsa-radius-md,12px)] bg-neutral-100">
                    {topProduct.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={topProduct.image_url} alt="" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-neutral-300">
                        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M21 8 12 3 3 8v8l9 5 9-5V8Z M3 8l9 5 9-5 M12 13v8" /></svg>
                      </span>
                    )}
                  </div>
                  <div className="mt-3 line-clamp-3 text-[14.5px] font-bold leading-snug text-neutral-900 transition group-hover:text-[var(--wsa-link-hover,#1d9a44)]">
                    <Hi text={topProduct.title} q={hiQ} />
                  </div>
                  {topProduct.brand && <div className="mt-1 text-[12px] text-neutral-400">{topProduct.brand}</div>}
                  <div className="mt-2 text-[19px] font-extrabold tabular-nums text-neutral-900">{czk(topProduct.price_cents)}</div>
                </a>
                <button
                  onClick={() => quickAdd(topProduct)}
                  disabled={addingId === topProduct.id}
                  className="mt-4 h-10 w-full rounded-[var(--wsa-radius-sm,8px)] bg-[var(--wsa-accent,#1d9a44)] text-[12.5px] font-bold uppercase tracking-[0.06em] text-[var(--wsa-on-accent,#fff)] shadow-sm transition hover:bg-[var(--wsa-accent-dark,#137a35)] disabled:opacity-60"
                >
                  {addingId === topProduct.id ? "Přidávám…" : topProduct.variant_count > 1 ? "Vybrat variantu" : "Do košíku"}
                </button>
              </div>
            )}

            {/* ── Produkty grid ─────────────────────────────────── */}
            <div className="relative flex min-w-0 flex-1 flex-col p-5">
              <button onClick={() => setOpen(false)} aria-label="Zavřít"
                className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-[var(--wsa-radius-pill,9999px)] text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
              </button>
              <div className={RAIL_TITLE}>{isQuery ? "Produkty" : "Top produkty"}</div>

              {gridProducts.length > 0 || topProduct ? (
                <div className="grid flex-1 grid-cols-1 content-start gap-x-5 gap-y-1 sm:grid-cols-2">
                  {(gridProducts.length > 0 ? gridProducts : topProduct ? [topProduct] : []).map((p) => (
                    <a key={p.id} href={`${base}/${p.slug}`} onClick={() => logQuery(q)}
                      className="group flex items-center gap-3 rounded-[var(--wsa-radius-md,12px)] p-2 transition hover:bg-neutral-50">
                      <div className="h-[52px] w-[52px] shrink-0 overflow-hidden rounded-[var(--wsa-radius-sm,8px)] bg-neutral-100 ring-1 ring-black/5">
                        {p.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.image_url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center text-neutral-300">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M21 8 12 3 3 8v8l9 5 9-5V8Z M3 8l9 5 9-5 M12 13v8" /></svg>
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="line-clamp-2 text-[13px] font-semibold leading-snug text-neutral-800 transition group-hover:text-[var(--wsa-link-hover,#1d9a44)]">
                          <Hi text={p.title} q={hiQ} />
                        </div>
                        <div className="mt-0.5 text-[13.5px] font-extrabold tabular-nums text-neutral-900">{czk(p.price_cents)}</div>
                      </div>
                      <CartBtn p={p} />
                    </a>
                  ))}
                </div>
              ) : (
                <div className="flex flex-1 items-center justify-center py-10 text-[13px] text-neutral-400">
                  Žádné produkty pro „{q.trim()}&ldquo;
                </div>
              )}

              {isQuery && (
                <button onClick={() => goToResults(q)}
                  className="mt-4 h-10 w-full rounded-[var(--wsa-radius-sm,8px)] bg-[var(--wsa-cta,#171717)] text-[12.5px] font-bold uppercase tracking-[0.08em] text-[var(--wsa-on-accent,#fff)] transition hover:bg-[var(--wsa-cta-hover,#404040)]">
                  Zobrazit všechny produkty
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Žádné výsledky ────────────────────────────────────── */}
      {open && data && !hasAny && isQuery && !loading && (
        <div className={inlineResults
          ? "mt-4 w-full border-t border-neutral-200 bg-white p-5 text-center text-[13px] text-neutral-500"
          : "absolute left-0 right-0 top-[calc(100%+8px)] z-[220] rounded-[var(--wsa-radius-md,12px)] border border-neutral-200 bg-white p-5 text-center text-[13px] text-neutral-500 shadow-[0_16px_40px_rgba(0,0,0,0.12)]"}>
          Žádné výsledky pro „{q.trim()}&ldquo; — zkuste jiný výraz.
        </div>
      )}
    </div>
  );
}
