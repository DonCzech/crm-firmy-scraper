import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTenantBySlug, getTenantPage, getPageSections, type Tenant } from "@/lib/db";
import { resolveAllSections } from "@/lib/section-resolver";
import { TenantChrome } from "@/components/tenant/TenantChrome";
import { SectionRenderer } from "@/components/tenant/SectionRenderer";

/**
 * CMS detail realizace — /demo/:tenantSlug/realizace/:itemSlug
 *
 * Datovým zdrojem je content gallery sekce `proof-01-beforeafter` (items[] se
 * slug/title/excerpt/body/place/duration/scope). Detail se skládá z existujících
 * section rendererů: navbar+footer přes TenantChrome, before/after slider jako
 * gallery sekce s jedinou položkou (stejné sectionId → Studio editace se
 * propisuje), pod tím článek a kontaktní sekce tenanta. Žádný template-only
 * renderer navíc.
 */

interface Props {
  params: Promise<{ tenantSlug: string; itemSlug: string }>;
}

export const revalidate = 60;

type BaItem = {
  slug?: string; title?: string; caption?: string; excerpt?: string; body?: string;
  place?: string; duration?: string; scope?: string;
  beforeImage?: string; afterImage?: string; beforeLabel?: string; afterLabel?: string;
};

async function findRealizace(tenant: Tenant, itemSlug: string) {
  // Gallery sekce s realizacemi žije na stránce "realizace" (fallback homepage).
  for (const pageSlug of ["realizace", "home"]) {
    const page = await getTenantPage(tenant.id, pageSlug);
    if (!page) continue;
    const sections = await getPageSections(tenant.id, page.id);
    const gallery = sections.find(
      (s) => s.section_type === "gallery" && s.section_variant === "proof-01-beforeafter"
    );
    if (!gallery) continue;
    const resolved = await resolveAllSections(tenant, sections);
    const rGallery = resolved.find((s) => s.id === gallery.id) ?? gallery;
    const content = (rGallery.settings?.content ?? {}) as { items?: BaItem[] };
    const items = Array.isArray(content.items) ? content.items : [];
    const idx = items.findIndex((it) => it.slug === itemSlug);
    if (idx !== -1) {
      const contactRaw = sections.find((s) => s.section_type === "contact");
      const contact = contactRaw ? resolved.find((s) => s.id === contactRaw.id) ?? contactRaw : undefined;
      return { gallery: rGallery, item: items[idx], index: idx, contact };
    }
  }
  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenantSlug, itemSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return { robots: { index: false, follow: false } };
  const found = await findRealizace(tenant, itemSlug);
  const title = found ? `${found.item.title ?? found.item.caption ?? "Realizace"} | Realizace` : "Realizace";
  return {
    title,
    description: found?.item.excerpt ?? undefined,
    robots: { index: false, follow: false },
  };
}

export default async function RealizaceDetailPage({ params }: Props) {
  const { tenantSlug, itemSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return notFound();

  const found = await findRealizace(tenant, itemSlug);
  if (!found) return notFound();

  const { gallery, item, contact } = found;
  const title = String(item.title ?? item.caption ?? "Realizace");
  const paragraphs = String(item.body ?? "").split(/\n\n+/).filter(Boolean);
  const base = `/demo/${tenantSlug}`;

  const meta: Array<{ label: string; value?: string }> = [
    { label: "Lokalita", value: item.place },
    { label: "Doba realizace", value: item.duration },
    { label: "Typ zakázky", value: item.scope },
  ].filter((m) => m.value);

  // Gallery sekce s jedinou položkou — stejné section id, aby Studio editace
  // (items.N.*) zůstala navázaná na skutečná data.
  const detailGallery = {
    ...gallery,
    settings: {
      ...gallery.settings,
      content: {
        ...(gallery.settings?.content ?? {}),
        eyebrow: "",
        title: "",
        lead: "",
        detailCtaText: "",
        items: [item],
      },
    },
  };

  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Domů", item: base },
      { "@type": "ListItem", position: 2, name: "Realizace", item: `${base}/realizace` },
      { "@type": "ListItem", position: 3, name: title },
    ],
  };

  return (
    <TenantChrome tenant={tenant}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <style>{`
        .pf01rd-hero { background:#0C1622; color:#fff; padding:clamp(44px,6vw,72px) clamp(20px,5vw,48px); font-family:var(--font-body, system-ui, sans-serif); }
        .pf01rd-hero-inner { max-width:1120px; margin:0 auto; }
        .pf01rd-crumb { display:flex; flex-wrap:wrap; align-items:center; gap:8px; font-size:.84rem; color:rgba(255,255,255,.6); margin-bottom:16px; }
        .pf01rd-crumb a { color:rgba(255,255,255,.6); text-decoration:none; }
        .pf01rd-crumb a:hover { color:#E85A48; }
        .pf01rd-crumb .cur { color:#fff; }
        .pf01rd-title { font-family:var(--font-heading, system-ui, sans-serif); color:#fff; font-size:clamp(1.9rem,4.2vw,3rem); font-weight:800; letter-spacing:-.03em; line-height:1.06; margin:0; text-wrap:balance; }
        .pf01rd-excerpt { font-size:clamp(1rem,1.35vw,1.15rem); color:rgba(255,255,255,.78); max-width:44em; margin:16px 0 0; line-height:1.6; }
        .pf01rd-meta { display:flex; flex-wrap:wrap; gap:clamp(20px,4vw,48px); margin-top:28px; padding-top:22px; border-top:1px solid rgba(255,255,255,.16); }
        .pf01rd-meta-lbl { display:block; font-size:.68rem; font-weight:800; letter-spacing:.14em; text-transform:uppercase; color:rgba(255,255,255,.5); margin-bottom:4px; }
        .pf01rd-meta-val { font-weight:700; color:#fff; }
        .pf01rd-body { background:#fff; padding:clamp(40px,6vw,72px) clamp(20px,5vw,48px); font-family:var(--font-body, system-ui, sans-serif); }
        .pf01rd-body-inner { max-width:760px; margin:0 auto; }
        .pf01rd-body p { font-size:1.05rem; line-height:1.75; color:#33414E; margin:0 0 20px; }
        .pf01rd-back { display:inline-flex; align-items:center; gap:8px; margin-top:10px; font-weight:700; color:#C3352B; text-decoration:none; font-size:.95rem; }
        .pf01rd-back:hover { text-decoration:underline; }
      `}</style>

      <section className="pf01rd-hero" data-template="proof-01">
        <div className="pf01rd-hero-inner">
          <nav className="pf01rd-crumb" aria-label="Drobečková navigace">
            <a href={base}>Domů</a>
            <span aria-hidden="true">/</span>
            <a href={`${base}/realizace`}>Realizace</a>
            <span aria-hidden="true">/</span>
            <span className="cur">{title}</span>
          </nav>
          <h1 className="pf01rd-title">{title}</h1>
          {item.excerpt && <p className="pf01rd-excerpt">{item.excerpt}</p>}
          {meta.length > 0 && (
            <div className="pf01rd-meta">
              {meta.map((m) => (
                <div key={m.label}>
                  <span className="pf01rd-meta-lbl">{m.label}</span>
                  <span className="pf01rd-meta-val">{m.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <SectionRenderer section={detailGallery} tenantId={tenant.id} tenantSlug={tenantSlug} isAdmin={false} />

      {paragraphs.length > 0 && (
        <section className="pf01rd-body" data-template="proof-01">
          <div className="pf01rd-body-inner">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            <a className="pf01rd-back" href={`${base}/realizace`}>
              ← Zpět na všechny realizace
            </a>
          </div>
        </section>
      )}

      {contact && <SectionRenderer section={contact} tenantId={tenant.id} tenantSlug={tenantSlug} isAdmin={false} />}
    </TenantChrome>
  );
}
