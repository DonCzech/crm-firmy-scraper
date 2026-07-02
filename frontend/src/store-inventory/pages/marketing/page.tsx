"use client";
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Check, Copy, ExternalLink, FileText, Loader2, RefreshCw, Save, Sparkles, Upload, WandSparkles } from 'lucide-react';
import { toast } from 'sonner';
import {
  fetchMarketingArticle,
  fetchMarketingArticles,
  fetchMarketingNextBatch,
  importMarketingArticle,
  fetchMarketingRewriteStatus,
  fetchMarketingStatus,
  runMarketingRewriteAll,
  runMarketingScrapeOne,
  runMarketingScrape,
  saveMarketingRewrite,
  type MarketingArticleRecord,
  type MarketingRewriteStatus,
  type MarketingScrapeStatus,
} from '@/crm/services/backend';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// ─── helpers ─────────────────────────────────────────────────────────────────

function formatDate(value?: string | null): string {
  if (!value) return 'n/a';
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return value;
  return dt.toLocaleString('cs-CZ');
}

function toBackendAssetUrl(localPath: string | null): string | null {
  if (!localPath) return null;
  if (/^https?:\/\//i.test(localPath)) return localPath;
  const env = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
  const base = (env && env.length > 0 ? env : 'http://localhost:3001/api').replace(/\/+$/, '');
  if (localPath.startsWith('/api/')) return `${base.replace(/\/api$/, '')}${localPath}`;
  if (localPath.startsWith('/')) return `${base}${localPath}`;
  return `${base}/${localPath}`;
}

function normalizeArticleHtmlAssets(article: MarketingArticleRecord): string {
  const rawHtml = article.bodyHtml || '';
  if (!rawHtml) return '';
  const env = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
  const apiBase = (env && env.length > 0 ? env : 'http://localhost:3001/api').replace(/\/+$/, '');
  const originBase = apiBase.replace(/\/api$/, '');
  let html = rawHtml
    .replace(/src=(['"])\/marketing\/assets\//gi, `src=$1${apiBase}/marketing/assets/`)
    .replace(/src=(['"])\/api\/marketing\/assets\//gi, `src=$1${originBase}/api/marketing/assets/`);
  for (let i = 0; i < article.imageLocalPaths.length; i += 1) {
    const localPath = article.imageLocalPaths[i];
    const originalUrl = article.imageUrls[i];
    if (!localPath || !originalUrl) continue;
    const absLocal = toBackendAssetUrl(localPath);
    if (absLocal) html = html.split(absLocal).join(originalUrl);
    html = html.split(localPath).join(originalUrl);
  }
  return html;
}

// ─── TOC / heading processing ─────────────────────────────────────────────────

type TocItem = { id: string; text: string; level: 2 | 3 };

function processHtmlForDisplay(rawHtml: string): { html: string; toc: TocItem[] } {
  if (typeof DOMParser === 'undefined') return { html: rawHtml, toc: [] };
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(rawHtml, 'text/html');
    doc.querySelectorAll('svg').forEach((el) => el.remove());

    // Replace copy-to-clipboard text with buttons
    Array.from(doc.querySelectorAll('p, span, div, button')).forEach((node) => {
      if ((node.textContent || '').trim().toLowerCase() !== 'copy to clipboard') return;
      const copyText = node.nextElementSibling?.textContent?.trim() || '';
      const btn = doc.createElement('button');
      btn.type = 'button';
      btn.textContent = 'Copy to clipboard';
      btn.className = 'marketing-copy-btn';
      btn.setAttribute('data-copy-text', encodeURIComponent(copyText));
      node.replaceWith(btn);
    });

    // Inject IDs and build TOC
    const toc: TocItem[] = [];
    let idx = 0;
    doc.querySelectorAll('h2, h3').forEach((h) => {
      const text = h.textContent?.trim() || '';
      if (!text) return;
      if (!h.id) {
        h.id = `sec-${idx}-${text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48)}`;
      }
      toc.push({ id: h.id, text, level: h.tagName === 'H2' ? 2 : 3 });
      idx += 1;
    });

    return { html: doc.body.innerHTML, toc };
  } catch {
    return { html: rawHtml, toc: [] };
  }
}

// ─── scroll-spy hook ──────────────────────────────────────────────────────────

function useTocScrollSpy(toc: TocItem[]) {
  const [active, setActive] = useState(toc[0]?.id || '');
  useEffect(() => {
    if (!toc.length) return;
    const observers: IntersectionObserver[] = [];
    toc.forEach((item) => {
      const el = document.getElementById(item.id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(item.id); },
        { rootMargin: '-10% 0px -80% 0px' },
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, [toc]);
  return active;
}

// ─── Original article view ────────────────────────────────────────────────────

function OriginalArticleView({ article }: { article: MarketingArticleRecord }) {
  const cover = article.coverImageUrl || toBackendAssetUrl(article.coverImageLocalPath) || null;
  const categoryLabel = article.categories?.[0] || null;

  const { html: preparedHtml, toc } = useMemo(() => {
    return processHtmlForDisplay(normalizeArticleHtmlAssets(article));
  }, [article]);

  const activeId = useTocScrollSpy(toc);

  const onBodyClick = async (event: React.MouseEvent) => {
    const button = (event.target as HTMLElement).closest('button.marketing-copy-btn') as HTMLButtonElement | null;
    if (!button) return;
    const text = decodeURIComponent(button.getAttribute('data-copy-text') || '');
    if (!text) return;
    try { await navigator.clipboard.writeText(text); toast.success('Zkopírováno.'); }
    catch { toast.error('Kopírování selhalo.'); }
  };

  return (
    <div className="flex gap-8 items-start">
      {/* Sidebar TOC */}
      {toc.length > 0 && (
        <aside className="hidden xl:block w-[240px] flex-shrink-0">
          <div className="sticky top-6 space-y-0.5">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground mb-4">V tomto článku</p>
            {toc.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className={`block text-[13px] leading-[1.4] py-1.5 border-l-2 transition-all ${item.level === 3 ? 'pl-5' : 'pl-3'} ${
                  activeId === item.id
                    ? 'border-primary text-primary font-semibold'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`}
              >
                {item.text}
              </a>
            ))}
          </div>
        </aside>
      )}

      {/* Article */}
      <div className="flex-1 min-w-0 max-w-[760px]">
        <style>{`
          .mk-body [class*="expertTip"],.mk-body [class*="keyTakeaway"],.mk-body [class*="calloutBox"],.mk-body [class*="infoBox"],.mk-body [class*="tipBox"] {
            margin:2rem 0;padding:1.25rem 1.5rem;border:1px solid hsl(var(--border));border-radius:.75rem;background:hsl(var(--muted)/.4);
          }
          .mk-body [class*="statisticInsight"],.mk-body [class*="StatisticInsight"] {
            margin:2rem 0;padding:1.25rem 1.75rem;border-left:4px solid hsl(var(--primary));background:hsl(var(--primary)/.06);border-radius:0 .5rem .5rem 0;
          }
          .mk-body [class*="resumeExample"],.mk-body [class*="codeBlock"] {
            margin:1.5rem 0;padding:1.25rem 1.5rem;border:1px dashed hsl(var(--border));border-radius:.5rem;font-family:'Courier New',monospace;font-size:.9em;background:hsl(var(--muted)/.25);white-space:pre-wrap;
          }
          .mk-body [class*="authorBio"] { display:flex;gap:1rem;align-items:flex-start;margin:3rem 0 1rem;padding:1.5rem;border:1px solid hsl(var(--border));border-radius:.75rem; }
          .mk-body [class*="authorBio"] img { width:56px!important;height:56px!important;border-radius:50%;object-fit:cover;flex-shrink:0; }
          .mk-body nav,.mk-body header,.mk-body footer,.mk-body [class*="breadcrumb"],.mk-body [class*="relatedPost"],.mk-body [class*="newsletter"] { display:none!important; }
          .mk-body .marketing-copy-btn { display:inline-flex;align-items:center;border:1px solid hsl(var(--border));border-radius:.375rem;padding:.25rem .75rem;font-size:.8125rem;font-weight:500;color:hsl(var(--primary));cursor:pointer;background:transparent; }
        `}</style>

        {cover && <img src={cover} alt={article.title} className="w-full rounded-xl object-cover aspect-[16/7] mb-6" loading="lazy" />}
        <h1 className="text-[2.2rem] leading-[1.2] font-bold tracking-tight mb-3">{article.title}</h1>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground mb-6 pb-6 border-b border-border">
          {article.author && <span>By <strong className="text-foreground">{article.author}</strong></span>}
          {categoryLabel && <><span>·</span><Badge variant="secondary">{categoryLabel}</Badge></>}
          {article.readTimeLabel && <><span>·</span><span>{article.readTimeLabel} čtení</span></>}
          {article.lastUpdatedLabel && <><span>·</span><span>Aktualizováno: {article.lastUpdatedLabel}</span></>}
          <a href={article.sourceUrl} target="_blank" rel="noreferrer" className="ml-auto text-xs text-primary hover:underline">Originál ↗</a>
        </div>

        <div
          className="mk-body text-[17px] leading-[1.8]
            [&_h2]:mt-14 [&_h2]:mb-5 [&_h2]:text-[1.75rem] [&_h2]:leading-[1.25] [&_h2]:font-bold [&_h2]:tracking-tight
            [&_h3]:mt-10 [&_h3]:mb-3 [&_h3]:text-[1.35rem] [&_h3]:leading-[1.3] [&_h3]:font-semibold
            [&_p]:my-5 [&_ul]:my-5 [&_ul]:pl-7 [&_ol]:my-5 [&_ol]:pl-7
            [&_li]:text-[16px] [&_li]:leading-[1.7] [&_ul>li]:list-disc [&_ol>li]:list-decimal
            [&_table]:my-7 [&_table]:w-full [&_table]:border-collapse [&_table]:text-[15px]
            [&_th]:border [&_th]:border-border [&_th]:px-3 [&_th]:py-2 [&_th]:bg-muted/40 [&_th]:font-semibold [&_th]:text-left
            [&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2
            [&_img]:my-7 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-xl
            [&_figure]:my-7 [&_figcaption]:text-xs [&_figcaption]:text-muted-foreground [&_figcaption]:text-center [&_figcaption]:mt-2
            [&_blockquote]:my-6 [&_blockquote]:border-l-4 [&_blockquote]:border-primary/40 [&_blockquote]:pl-5 [&_blockquote]:italic [&_blockquote]:text-muted-foreground
            [&_strong]:font-semibold [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2"
          onClick={onBodyClick}
          dangerouslySetInnerHTML={{ __html: preparedHtml || `<p>${article.bodyText || ''}</p>` }}
        />
      </div>
    </div>
  );
}

// ─── Haiku prompt builder ─────────────────────────────────────────────────────

function buildHaikuPrompt(article: MarketingArticleRecord): string {
  return `Jsi expert na SEO copywriting v češtině pro kariérní poradenský web cv-editor.com.

Napiš NOVÝ, ORIGINÁLNÍ článek v češtině (ne překlad) na stejné téma jako zdrojový článek níže.

POŽADAVKY NA OBSAH:
• 7–8 sekcí s H2 nadpisy
• Každá sekce: 2–4 odstavce + alespoň 1 seznam (odrážky nebo čísla)
• České příklady (Jobs.cz, Profesia.cz, platy v CZK, české firmy)
• Min. 3 000 slov celkem
• 1–2 inline obrázky z Unsplash

SEO POŽADAVKY:
• metaTitle: max 60 znaků, hlavní klíčové slovo + " | cv-editor.com"
• metaDescription: max 155 znaků, přirozená věta s klíčovým slovem a výzvou k akci
• focusKeyword: 1 hlavní klíčové slovo v češtině (fráze 2–4 slova)
• V textu přirozeně zakomponuj 2–3 interní odkaz: <a href="https://cv-editor.com">text odkazu</a>
• Poslední sekce = CTA s nadpisem "Začněte tvořit profesionální CV" obsahující typ "cta"

VÝSTUP: POUZE validní JSON (bez markdown, bez komentářů):
{
  "title": "Český nadpis článku",
  "metaTitle": "Klíčové slovo | cv-editor.com",
  "metaDescription": "Popis max 155 znaků s klíčovým slovem a výzvou.",
  "focusKeyword": "hlavní klíčové slovo",
  "excerpt": "Krátký úvodní popis 1–2 věty.",
  "sections": [
    {
      "id": "slug-sekce",
      "heading": "Nadpis sekce",
      "body": [
        "Odstavec s přirozeným <a href=\\"https://cv-editor.com\\">odkazem na cv-editor.com</a>.",
        { "type": "ul", "items": ["Bod 1", "Bod 2", "Bod 3"] },
        { "type": "img", "src": "https://images.unsplash.com/photo-XXXX?w=900&q=80", "alt": "popis", "caption": "Popisek." }
      ]
    },
    {
      "id": "zacnete-tvorit-cv",
      "heading": "Začněte tvořit profesionální CV",
      "body": [
        "CTA odstavec vyzývající čtenáře k akci.",
        { "type": "cta", "text": "Vytvořit CV zdarma", "url": "https://cv-editor.com" }
      ]
    }
  ]
}

Typy v body: string (může obsahovat HTML <a> tagy), {"type":"ul","items":[...]}, {"type":"ol","items":[...]}, {"type":"img","src":"...","alt":"...","caption":"..."}, {"type":"cta","text":"...","url":"..."}

ZDROJOVÝ ČLÁNEK (inspirace, ne překlad):
Nadpis: ${article.title}
URL: ${article.sourceUrl}
---
${(article.bodyText || '').slice(0, 20000)}`;
}

// ─── Rewrite panel (single article) ──────────────────────────────────────────

type BodyItem = string | { type: 'ul' | 'ol'; items: string[] } | { type: 'img'; src: string; alt: string; caption?: string } | { type: 'cta'; text: string; url: string } | { type: 'callout'; variant: 'takeaway' | 'tip' | 'stat'; heading?: string; items: string[] };
type RewriteSection = { id: string; heading: string; body: BodyItem[] };
interface RewriteData { title: string; metaTitle?: string; metaDescription?: string; focusKeyword?: string; excerpt: string; sections: RewriteSection[] }

function RewritePanel({ article, onArticleUpdate, autoCopy }: { article: MarketingArticleRecord; onArticleUpdate: (a: MarketingArticleRecord) => void; autoCopy?: boolean }) {
  const [pasteValue, setPasteValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  const prompt = useMemo(() => buildHaikuPrompt(article), [article]);

  // Auto-copy prompt when navigated via "Přepsat další článek" button
  useEffect(() => {
    if (!autoCopy) return;
    void navigator.clipboard.writeText(prompt).then(() => {
      setCopiedPrompt(true);
      toast.success('Prompt zkopírován — vložte do Claude Code a aktivujte přepis');
      setTimeout(() => setCopiedPrompt(false), 3000);
    }).catch(() => {});
  }, [autoCopy, prompt]);

  const rewriteData: RewriteData | null = useMemo(() => {
    if (!article.rewrittenBody) return null;
    try { return JSON.parse(article.rewrittenBody) as RewriteData; } catch { return null; }
  }, [article.rewrittenBody]);

  const onCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopiedPrompt(true);
      toast.success('Prompt zkopírován — vložte do Claude Code (toto okno)');
      setTimeout(() => setCopiedPrompt(false), 2500);
    } catch { toast.error('Kopírování selhalo.'); }
  };

  const onPasteChange = (v: string) => {
    setPasteValue(v);
    setParseError(null);
    if (!v.trim()) return;
    try { JSON.parse(v); } catch { setParseError('Nevalidní JSON — zkontrolujte výstup z Haiku.'); }
  };

  const onSave = async () => {
    const json = pasteValue.trim();
    if (!json) { toast.error('Vložte JSON výstup z Haiku.'); return; }
    try { JSON.parse(json); } catch { toast.error('Nevalidní JSON.'); return; }
    setSaving(true);
    try {
      const updated = await saveMarketingRewrite(article.slug, json);
      onArticleUpdate(updated);
      setPasteValue('');
      toast.success('Přepis uložen!');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Uložení selhalo.');
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-5 max-w-[860px]">
      {/* Step 1 - Copy prompt */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <CardTitle className="text-[15px]">Krok 1 — Zkopírujte prompt a vložte do Claude Code</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Zkopírujte prompt a vložte sem do <strong>Claude Code</strong> (toto okno ve VS Code). Claude napíše článek.
              </p>
            </div>
            <Button size="sm" className="gap-2" onClick={() => void onCopyPrompt()}>
              {copiedPrompt ? <Check className="size-4 text-green-300" /> : <Copy className="size-4" />}
              {copiedPrompt ? 'Zkopírováno!' : 'Kopírovat prompt'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <pre className="text-[11px] bg-muted/50 rounded-lg p-3 max-h-[240px] overflow-y-auto whitespace-pre-wrap break-words leading-[1.55] text-muted-foreground border border-border">
            {prompt}
          </pre>
        </CardContent>
      </Card>

      {/* Step 2 - Paste JSON */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-[15px]">Krok 2 — Vložte JSON výstup z Claude Code a uložte</CardTitle>
          <p className="text-xs text-muted-foreground">Zkopírujte celý JSON výstup z Claude Code a vložte sem.</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <textarea
            className={`w-full h-44 text-xs font-mono rounded-lg border p-3 bg-background resize-y focus:outline-none focus:ring-2 focus:ring-primary ${parseError ? 'border-destructive' : 'border-border'}`}
            placeholder={'{\n  "title": "...",\n  "excerpt": "...",\n  "sections": [...]\n}'}
            value={pasteValue}
            onChange={(e) => onPasteChange(e.target.value)}
            spellCheck={false}
          />
          {parseError && <p className="text-xs text-destructive">{parseError}</p>}
          <Button
            className="gap-2"
            onClick={() => void onSave()}
            disabled={saving || !pasteValue.trim() || !!parseError}
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Uložit přepis
          </Button>
        </CardContent>
      </Card>

      {/* Saved preview */}
      {rewriteData && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-green-600 dark:text-green-400">
              ✓ Přepis uložen {formatDate(article.rewrittenAt)}
            </p>
            <Button variant="outline" size="sm" className="gap-2" onClick={async () => {
              try { await navigator.clipboard.writeText(article.rewrittenBody || ''); setCopiedJson(true); toast.success('JSON zkopírován.'); setTimeout(() => setCopiedJson(false), 2000); }
              catch { toast.error('Kopírování selhalo.'); }
            }}>
              {copiedJson ? <Check className="size-4 text-green-500" /> : <Copy className="size-4" />}
              Kopírovat JSON
            </Button>
          </div>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Náhled přepsaného článku</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-[15px] leading-[1.75]">
              {/* SEO metadata */}
              {(rewriteData.metaTitle || rewriteData.metaDescription || rewriteData.focusKeyword) && (
                <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1.5 text-[13px]">
                  <p className="font-semibold text-[11px] uppercase tracking-widest text-muted-foreground">SEO metadata</p>
                  {rewriteData.focusKeyword && <p><span className="text-muted-foreground">Focus keyword:</span> <strong>{rewriteData.focusKeyword}</strong></p>}
                  {rewriteData.metaTitle && <p><span className="text-muted-foreground">Meta title ({rewriteData.metaTitle.length} znaků):</span> {rewriteData.metaTitle}</p>}
                  {rewriteData.metaDescription && <p><span className="text-muted-foreground">Meta desc ({rewriteData.metaDescription.length} znaků):</span> {rewriteData.metaDescription}</p>}
                </div>
              )}
              <div>
                <h1 className="text-[1.6rem] font-bold tracking-tight mb-2">{rewriteData.title}</h1>
                <p className="text-muted-foreground italic">{rewriteData.excerpt}</p>
              </div>
              {rewriteData.sections.map((sec) => (
                <div key={sec.id} className="space-y-3 pt-4 border-t border-border">
                  <h2 className="text-[1.15rem] font-bold">{sec.heading}</h2>
                  {sec.body.map((item, i) =>
                    typeof item === 'string' ? (
                      <p key={i} className="text-[14px] leading-[1.8]" dangerouslySetInnerHTML={{ __html: item }} />
                    ) : item.type === 'cta' ? (
                      <a key={i} href={item.url} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                        {item.text}
                      </a>
                    ) : item.type === 'callout' ? (
                      <div key={i} className={`my-3 rounded-xl p-4 ${item.variant === 'takeaway' ? 'bg-blue-50 border border-blue-200' : item.variant === 'stat' ? 'border-l-4 border-primary bg-primary/5 pl-5' : 'bg-amber-50 border border-amber-200'}`}>
                        {item.heading && <p className="font-bold text-[13px] mb-2">{item.heading}</p>}
                        <ul className="list-disc pl-4 space-y-1">
                          {item.items.map((li, j) => <li key={j} className="text-[13px]" dangerouslySetInnerHTML={{ __html: li }} />)}
                        </ul>
                      </div>
                    ) : item.type === 'img' ? (
                      <figure key={i} className="my-3">
                        <img src={item.src} alt={item.alt} className="w-full rounded-xl object-cover max-h-56" loading="lazy" />
                        {item.caption && <figcaption className="text-xs text-muted-foreground text-center mt-1">{item.caption}</figcaption>}
                      </figure>
                    ) : item.type === 'ul' ? (
                      <ul key={i} className="list-disc pl-5 space-y-1">
                        {item.items.map((li, j) => <li key={j} className="text-[14px]">{li}</li>)}
                      </ul>
                    ) : (
                      <ol key={i} className="list-decimal pl-5 space-y-1">
                        {item.items.map((li, j) => <li key={j} className="text-[14px]">{li}</li>)}
                      </ol>
                    )
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// ─── Article detail page ──────────────────────────────────────────────────────

export function MarketingArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [importing, setImporting] = useState(false);
  const [article, setArticle] = useState<MarketingArticleRecord | null>(null);
  const [tab, setTab] = useState<'original' | 'rewrite'>(
    searchParams.get('tab') === 'rewrite' ? 'rewrite' : 'original',
  );

  useEffect(() => {
    if (!slug) { setArticle(null); setLoading(false); return; }
    let cancelled = false;
    void (async () => {
      setLoading(true);
      try {
        const row = await fetchMarketingArticle(slug);
        if (!cancelled) setArticle(row);
      } catch (error) {
        if (!cancelled) toast.error(error instanceof Error ? error.message : 'Detail článku se nepodařilo načíst.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [slug]);

  const onImport = async () => {
    if (!article) return;
    setImporting(true);
    try {
      const result = await importMarketingArticle(article.slug);
      toast.success(`Importováno na cv-editor.com/blog/${article.slug}`);
      setArticle({ ...article, importedAt: new Date().toISOString() } as MarketingArticleRecord);
      console.log(result);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Import selhal.');
    } finally { setImporting(false); }
  };

  const onReScrape = async () => {
    if (!article) return;
    setScraping(true);
    try {
      await runMarketingScrapeOne({ force: true, url: article.sourceUrl });
      const updated = await fetchMarketingArticle(article.slug);
      setArticle(updated);
      toast.success('Článek znovu scraped.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Re-scrape selhal.');
    } finally { setScraping(false); }
  };

  return (
    <div className="container-fluid space-y-4 pb-16">
      {/* Back + re-scrape */}
      <div className="flex items-center gap-3 flex-wrap">
        <Button asChild variant="outline" size="sm" className="gap-2">
          <Link to="/core/tools/scrappery/resume"><ArrowLeft className="size-4" />Zpět na seznam</Link>
        </Button>
        {article && (
          <>
            <Button variant="outline" size="sm" className="gap-2 ml-auto" onClick={() => void onReScrape()} disabled={scraping || importing}>
              {scraping ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
              Re-scrape článku
            </Button>
            {article.rewrittenAt && (
              <Button
                size="sm"
                className="gap-2 bg-green-600 hover:bg-green-700 text-white"
                onClick={() => void onImport()}
                disabled={importing || scraping}
              >
                {importing ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
                {article.importedAt ? 'Reimportovat do blogu' : 'Importovat do blogu'}
              </Button>
            )}
            {article.importedAt && (
              <a
                href={`https://cv-editor.com/blog/${article.slug}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
              >
                <ExternalLink className="size-3" />
                Zobrazit na webu
              </a>
            )}
          </>
        )}
      </div>

      {loading ? (
        <Card><CardContent className="flex items-center gap-2 py-8 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" />Načítám...</CardContent></Card>
      ) : !article ? (
        <Card><CardContent className="py-8 text-sm text-muted-foreground">Článek nebyl nalezen.</CardContent></Card>
      ) : (
        <div>
          {/* Tabs */}
          <div className="flex gap-0 border-b border-border mb-6">
            {(['original', 'rewrite'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  tab === t ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {t === 'original' ? '🌐 Originál (resume.co)' : '✍️ Přepis do češtiny'}
                {t === 'rewrite' && article.rewrittenAt && (
                  <span className="ml-2 inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/40 px-1.5 py-0.5 text-[10px] font-medium text-green-700 dark:text-green-400">hotovo</span>
                )}
              </button>
            ))}
          </div>

          {tab === 'original'
            ? <OriginalArticleView article={article} />
            : <RewritePanel article={article} onArticleUpdate={setArticle} autoCopy={searchParams.get('auto') === '1'} />
          }
        </div>
      )}
    </div>
  );
}

// ─── Batch rewrite section ────────────────────────────────────────────────────

function BatchRewriteSection({ articles, onRefresh }: { articles: MarketingArticleRecord[]; onRefresh: () => void }) {
  const [rewriteStatus, setRewriteStatus] = useState<MarketingRewriteStatus | null>(null);
  const [starting, setStarting] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadStatus = async () => {
    try { setRewriteStatus(await fetchMarketingRewriteStatus()); } catch { /* silent */ }
  };

  useEffect(() => {
    void loadStatus();
  }, []);

  useEffect(() => {
    if (rewriteStatus?.running) {
      pollRef.current = setInterval(() => {
        void loadStatus();
        void onRefresh(); // refresh article list too
      }, 2000);
    } else {
      if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [rewriteStatus?.running]);

  const done = articles.filter((a) => a.rewrittenAt).length;
  const remaining = articles.filter((a) => !a.rewrittenAt).length;

  const onStart = async (force = false) => {
    setStarting(true);
    try {
      await runMarketingRewriteAll(force);
      toast.success('Batch přepis spuštěn na pozadí. Probíhá...');
      await loadStatus();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Spuštění selhalo.');
    } finally { setStarting(false); }
  };

  const progressPct = rewriteStatus && rewriteStatus.total > 0
    ? Math.round((rewriteStatus.processed / rewriteStatus.total) * 100)
    : 0;

  const masterPromptPreview = `Jsi expert na SEO copywriting v češtině pro kariérní poradenský web cv-editor.com.

Napiš NOVÝ, ORIGINÁLNÍ článek v češtině (ne překlad) na stejné téma jako zdrojový článek.

POŽADAVKY NA OBSAH:
- 7–8 sekcí s H2 nadpisy
- Každá sekce: 2–4 odstavce + alespoň 1 seznam (odrážky nebo čísla)
- České příklady (Jobs.cz, Profesia.cz, platy v CZK, české firmy)
- Min. 3 000 slov celkem
- 1–2 inline obrázky z Unsplash

SEO POŽADAVKY:
- metaTitle: max 60 znaků, klíčové slovo + " | cv-editor.com"
- metaDescription: max 155 znaků s klíčovým slovem a výzvou k akci
- focusKeyword: 1 hlavní klíčové slovo v češtině (2–4 slova)
- 2–3 interní odkazy na cv-editor.com: <a href="https://cv-editor.com">text</a>
- Poslední sekce = CTA typ "cta" odkazující na cv-editor.com

VÝSTUP: POUZE validní JSON { title, metaTitle, metaDescription, focusKeyword, excerpt, sections[{id, heading, body[string|ul|ol|img|cta]}] }`;

  return (
    <Card className="border-blue-200 dark:border-blue-900">
      <CardHeader>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <WandSparkles className="size-4 text-blue-500" />
              Batch přepis — manuální workflow
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Klikněte na <strong>Přepsat další článek</strong> v hlavičce — otevře se přepisovací panel s připraveným promptem.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => void onStart(false)}
              disabled={starting || rewriteStatus?.running}
            >
              {starting || rewriteStatus?.running ? <Loader2 className="size-4 animate-spin" /> : <WandSparkles className="size-4" />}
              Přepsat zbývající ({remaining})
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="gap-2"
              onClick={() => void onStart(true)}
              disabled={starting || rewriteStatus?.running}
            >
              Přepsat vše znovu ({articles.length})
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-lg bg-muted/40 p-3">
            <div className="text-2xl font-bold text-green-600">{done}</div>
            <div className="text-xs text-muted-foreground">Přepsáno</div>
          </div>
          <div className="rounded-lg bg-muted/40 p-3">
            <div className="text-2xl font-bold">{remaining}</div>
            <div className="text-xs text-muted-foreground">Zbývá</div>
          </div>
          <div className="rounded-lg bg-muted/40 p-3">
            <div className="text-2xl font-bold">{articles.length}</div>
            <div className="text-xs text-muted-foreground">Celkem</div>
          </div>
        </div>

        {/* Progress */}
        {rewriteStatus?.running && (
          <div className="space-y-2">
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${progressPct}%` }} />
            </div>
            <div className="text-xs text-muted-foreground">
              {rewriteStatus.processed}/{rewriteStatus.total} článků
              {rewriteStatus.errors > 0 && <span className="text-destructive ml-2">• {rewriteStatus.errors} chyb</span>}
            </div>
            {rewriteStatus.currentSlug && (
              <div className="text-xs text-blue-600 dark:text-blue-400">Zpracovávám: {rewriteStatus.currentSlug}</div>
            )}
          </div>
        )}

        {rewriteStatus && !rewriteStatus.running && rewriteStatus.finishedAt && (
          <p className="text-xs text-muted-foreground">{rewriteStatus.message}</p>
        )}

        {/* Master prompt — always visible */}
        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Použitý prompt pro Haiku (batch)</p>
          <pre className="bg-muted/40 rounded-lg border border-border p-3 whitespace-pre-wrap text-[11px] leading-[1.6] text-muted-foreground max-h-64 overflow-y-auto">
            {masterPromptPreview}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Marketing list page ──────────────────────────────────────────────────────

export function MarketingPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [fetchingNext, setFetchingNext] = useState(false);
  const [status, setStatus] = useState<MarketingScrapeStatus | null>(null);
  const [articles, setArticles] = useState<MarketingArticleRecord[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statusData, listData] = await Promise.all([fetchMarketingStatus(), fetchMarketingArticles()]);
      setStatus(statusData);
      setArticles(Array.isArray(listData.data) ? listData.data : []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Načtení selhalo.');
    } finally { setLoading(false); }
  };

  useEffect(() => { void loadData(); }, []);

  const onRunScrape = async () => {
    setScraping(true);
    setStatus((prev) => ({
      running: true, startedAt: prev?.startedAt || new Date().toISOString(),
      finishedAt: null, processedArticles: prev?.processedArticles || 0,
      totalDiscoveredUrls: prev?.totalDiscoveredUrls || 0,
      downloadedImages: prev?.downloadedImages || 0,
      errorCount: prev?.errorCount || 0, message: 'Spouštím scraper...',
    }));
    let pollTimer: ReturnType<typeof setInterval> | null = null;
    try {
      pollTimer = setInterval(() => {
        void fetchMarketingStatus().then((live) => setStatus(live)).catch(() => {});
      }, 1200);
      const result = await runMarketingScrape({ force: true });
      toast.success(`Scrape dokončen: ${result.processedArticles} článků.`);
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Scrape selhal.');
    } finally {
      if (pollTimer) clearInterval(pollTimer);
      setScraping(false);
    }
  };

  const onRewriteNext = async () => {
    setFetchingNext(true);
    try {
      const batch = await fetchMarketingNextBatch(1);
      if (!batch.data.length) {
        toast.info('Všechny články jsou již přepsány.');
        return;
      }
      const slug = batch.data[0].slug;
      navigate(`/core/tools/scrappery/resume/${encodeURIComponent(slug)}?tab=rewrite&auto=1`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Chyba při načítání dalšího článku.');
    } finally {
      setFetchingNext(false);
    }
  };

  const onRunSingleArticleScrape = async () => {
    setScraping(true);
    try {
      const result = await runMarketingScrapeOne({ force: true, url: 'https://resume.co/blog/writing-skills' });
      toast.success(`Článek zpracován: nové ${result.createdArticles}, aktualizované ${result.updatedArticles}.`);
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Scrape selhal.');
    } finally { setScraping(false); }
  };

  const progressPct = useMemo(() => {
    const total = Number(status?.totalDiscoveredUrls || 0);
    const done = Number(status?.processedArticles || 0);
    if (total <= 0) return scraping ? 8 : 0;
    return Math.max(0, Math.min(100, Math.round((done / total) * 100)));
  }, [scraping, status?.processedArticles, status?.totalDiscoveredUrls]);

  const rewrittenArticles = articles.filter((a) => a.rewrittenAt);

  return (
    <div className="container-fluid space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">Marketing — Scraper + AI přepis</h1>
          <p className="text-sm text-muted-foreground">Scraper <strong>resume.co/blog</strong> (300+ článků) + automatický přepis do češtiny přes Claude Haiku.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white" onClick={() => void onRewriteNext()} disabled={fetchingNext || scraping}>
            {fetchingNext ? <Loader2 className="size-4 animate-spin" /> : <WandSparkles className="size-4" />}
            Přepsat další článek
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => void loadData()} disabled={loading || scraping}>
            {loading ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
            Obnovit
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => void onRunScrape()} disabled={scraping}>
            {scraping ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            Spustit 100% scrape
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => void onRunSingleArticleScrape()} disabled={scraping}>
            {scraping ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            Scrape 1. článku
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'Scrapováno', value: articles.length },
          { label: 'Stav scraperu', value: status?.running ? 'běží' : 'idle', badge: true, running: status?.running },
          { label: 'Přepsáno', value: rewrittenArticles.length, green: true },
          { label: 'Zbývá přepsat', value: articles.length - rewrittenArticles.length },
        ].map(({ label, value, badge, running, green }) => (
          <Card key={label}>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{label}</CardTitle></CardHeader>
            <CardContent>
              {badge
                ? <Badge variant={running ? 'default' : 'outline'}>{value}</Badge>
                : <div className={`text-2xl font-semibold ${green ? 'text-green-600' : ''}`}>{value}</div>
              }
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Scrape progress */}
      {(scraping || status?.running) && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Průběh scrape</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="h-2 w-full overflow-hidden rounded bg-muted">
              <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progressPct}%` }} />
            </div>
            <div className="text-xs text-muted-foreground">
              {status?.processedArticles ?? 0} / {status?.totalDiscoveredUrls ?? 0} článků •{' '}
              {status?.downloadedImages ?? 0} obrázků • chyby: {status?.errorCount ?? 0}
            </div>
            <div className="text-xs text-muted-foreground">{status?.message}</div>
          </CardContent>
        </Card>
      )}

      {/* Batch rewrite */}
      {articles.length > 0 && (
        <BatchRewriteSection articles={articles} onRefresh={() => void loadData()} />
      )}

      {/* Rewritten articles */}
      {rewrittenArticles.length > 0 && (
        <Card className="border-green-200 dark:border-green-900">
          <CardHeader>
            <CardTitle className="text-base text-green-700 dark:text-green-400">
              ✓ Přepsané články ({rewrittenArticles.length})
            </CardTitle>
            <p className="text-xs text-muted-foreground">Hotové české přepisy připravené pro cv-editor.com blog.</p>
          </CardHeader>
          <CardContent className="space-y-2">
            {rewrittenArticles.map((article) => {
              let rewriteTitle = article.title;
              try { const d = JSON.parse(article.rewrittenBody || '{}') as { title?: string }; if (d.title) rewriteTitle = d.title; } catch { /* keep original */ }
              return (
                <div key={article.slug} className="flex items-start justify-between gap-3 rounded-md border border-green-100 dark:border-green-900/40 bg-green-50/40 dark:bg-green-950/20 p-3">
                  <div className="min-w-0">
                    <Link to={`/core/tools/scrappery/resume/${encodeURIComponent(article.slug)}?tab=rewrite`} className="font-medium text-green-700 dark:text-green-400 hover:underline block truncate">
                      {rewriteTitle}
                    </Link>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">Originál: {article.title}</p>
                    <p className="text-xs text-muted-foreground">Přepsáno: {formatDate(article.rewrittenAt)}</p>
                  </div>
                  <Link to={`/core/tools/scrappery/resume/${encodeURIComponent(article.slug)}?tab=rewrite`} className="flex-shrink-0">
                    <Button size="sm" variant="outline" className="gap-1.5 text-xs h-7">
                      <FileText className="size-3" />Zobrazit
                    </Button>
                  </Link>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* All articles */}
      <Card>
        <CardHeader><CardTitle>Všechny scrapované články ({articles.length})</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {articles.length === 0 ? (
            <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
              Zatím nejsou stažené žádné články. Spusťte scraper.
            </div>
          ) : (
            articles.map((article) => (
              <div key={article.slug} className="w-full rounded-md border p-3 transition hover:border-primary/60">
                <div className="flex items-start justify-between gap-3">
                  <Link to={`/core/tools/scrappery/resume/${encodeURIComponent(article.slug)}`} className="font-medium text-primary hover:underline">
                    {article.title}
                  </Link>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <Badge variant="outline" className="text-[10px]">{article.imageLocalPaths.length} img</Badge>
                    {article.rewrittenAt
                      ? <Badge className="text-[10px] bg-green-600 hover:bg-green-700">✓ cs</Badge>
                      : <Badge variant="secondary" className="text-[10px]">en</Badge>
                    }
                  </div>
                </div>
                {article.categories?.length ? (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {article.categories.slice(0, 3).map((cat) => (
                      <Badge key={`${article.slug}-${cat}`} variant="secondary" className="text-[10px]">{cat}</Badge>
                    ))}
                  </div>
                ) : null}
                <div className="mt-1 text-xs text-muted-foreground">{formatDate(article.publishedAt)} • {article.slug}</div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
