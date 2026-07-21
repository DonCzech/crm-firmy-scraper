import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTenantBySlug, getTenantPage, getPageSections, type Tenant } from "@/lib/db";
import { resolveAllSections } from "@/lib/section-resolver";
import { TenantChrome } from "@/components/tenant/TenantChrome";
import { SectionRenderer } from "@/components/tenant/SectionRenderer";

/**
 * CMS detail case study — /demo/:tenantSlug/case-studies/:itemSlug (signal-01)
 *
 * Datovým zdrojem je content gallery sekce `signal-01-cases` (items[] se
 * slug/title/excerpt/body/metric/metricLabel/industry/photo). Vzor: realizace
 * detail proof-01. Chrome (navbar+footer) přes TenantChrome, pod článkem
 * kontaktní sekce tenanta, 404 pro neznámý slug, BreadcrumbList schema.
 */

interface Props {
  params: Promise<{ tenantSlug: string; itemSlug: string }>;
}

export const revalidate = 60;

type CaseItem = {
  slug?: string; title?: string; excerpt?: string; body?: string;
  metric?: string; metricLabel?: string; industry?: string; photo?: string;
};

async function findCase(tenant: Tenant, itemSlug: string) {
  // Gallery sekce s case studies žije na stránce "case-studies" (fallback homepage).
  for (const pageSlug of ["case-studies", "home"]) {
    const page = await getTenantPage(tenant.id, pageSlug);
    if (!page) continue;
    const sections = await getPageSections(tenant.id, page.id);
    const gallery = sections.find(
      (s) => s.section_type === "gallery" && s.section_variant === "signal-01-cases"
    );
    if (!gallery) continue;
    const resolved = await resolveAllSections(tenant, sections);
    const rGallery = resolved.find((s) => s.id === gallery.id) ?? gallery;
    const content = (rGallery.settings?.content ?? {}) as { items?: CaseItem[] };
    const items = Array.isArray(content.items) ? content.items : [];
    const idx = items.findIndex((it) => it.slug === itemSlug);
    if (idx !== -1) {
      const contactRaw = sections.find((s) => s.section_type === "contact");
      const contact = contactRaw ? resolved.find((s) => s.id === contactRaw.id) ?? contactRaw : undefined;
      return { item: items[idx], index: idx, contact };
    }
  }
  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenantSlug, itemSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return { robots: { index: false, follow: false } };
  const found = await findCase(tenant, itemSlug);
  const title = found ? `${found.item.title ?? "Case study"} | Case studies` : "Case studies";
  return {
    title,
    description: found?.item.excerpt ?? undefined,
    robots: { index: false, follow: false },
  };
}

export default async function CaseStudyDetailPage({ params }: Props) {
  const { tenantSlug, itemSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return notFound();

  const found = await findCase(tenant, itemSlug);
  if (!found) return notFound();

  const { item, contact } = found;
  const title = String(item.title ?? "Case study");
  const paragraphs = String(item.body ?? "").split(/\n\n+/).filter(Boolean);
  const base = `/demo/${tenantSlug}`;

  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Domů", item: base },
      { "@type": "ListItem", position: 2, name: "Case studies", item: `${base}/case-studies` },
      { "@type": "ListItem", position: 3, name: title },
    ],
  };

  return (
    <TenantChrome tenant={tenant}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <style>{`
        .sg01cd-hero { background:#101418; color:#fff; padding:clamp(44px,6vw,72px) clamp(20px,5vw,48px); font-family:var(--font-body, system-ui, sans-serif); }
        .sg01cd-hero-inner { max-width:1120px; margin:0 auto; }
        .sg01cd-crumb { display:flex; flex-wrap:wrap; align-items:center; gap:8px; font-family:var(--font-overpass-mono, ui-monospace, monospace); font-size:.78rem; color:rgba(255,255,255,.6); margin-bottom:16px; }
        .sg01cd-crumb a { color:rgba(255,255,255,.6); text-decoration:none; }
        .sg01cd-crumb a:hover { color:#6EA8FE; }
        .sg01cd-crumb .cur { color:#fff; }
        .sg01cd-ind { display:inline-block; font-family:var(--font-overpass-mono, ui-monospace, monospace); font-size:.72rem; font-weight:700; letter-spacing:.12em; text-transform:uppercase; color:#6EA8FE; border:1px solid rgba(110,168,254,.4); border-radius:4px; padding:5px 10px; margin-bottom:16px; }
        .sg01cd-title { font-family:var(--font-heading, system-ui, sans-serif); color:#fff; font-size:clamp(1.9rem,4.2vw,3.1rem); font-weight:600; letter-spacing:.01em; line-height:1.06; margin:0; text-wrap:balance; }
        .sg01cd-excerpt { font-size:clamp(1rem,1.35vw,1.15rem); color:rgba(255,255,255,.78); max-width:44em; margin:16px 0 0; line-height:1.6; }
        .sg01cd-metric { display:flex; align-items:baseline; gap:14px; flex-wrap:wrap; margin-top:28px; padding-top:22px; border-top:1px solid rgba(255,255,255,.16); }
        .sg01cd-metric b { font-family:var(--font-heading, system-ui, sans-serif); font-size:clamp(2.4rem,4vw,3.4rem); font-weight:600; line-height:1; color:#6EA8FE; font-variant-numeric:tabular-nums; }
        .sg01cd-metric span { font-size:.95rem; color:rgba(255,255,255,.85); font-weight:600; max-width:20em; line-height:1.4; }
        .sg01cd-photo { background:#fff; padding:clamp(28px,4vw,48px) clamp(20px,5vw,48px) 0; font-family:var(--font-body, system-ui, sans-serif); }
        .sg01cd-photo-inner { max-width:1120px; margin:0 auto; }
        .sg01cd-photo img { display:block; width:100%; aspect-ratio:16/8; object-fit:cover; border-radius:10px; border:1px solid #E3E7EB; }
        .sg01cd-body { background:#fff; padding:clamp(32px,5vw,56px) clamp(20px,5vw,48px) clamp(40px,6vw,72px); font-family:var(--font-body, system-ui, sans-serif); }
        .sg01cd-body-inner { max-width:760px; margin:0 auto; }
        .sg01cd-body p { font-size:1.05rem; line-height:1.75; color:#33414E; margin:0 0 20px; }
        .sg01cd-back { display:inline-flex; align-items:center; gap:8px; margin-top:10px; font-weight:700; color:#2563EB; text-decoration:none; font-size:.95rem; }
        .sg01cd-back:hover { text-decoration:underline; }
      `}</style>

      <section className="sg01cd-hero" data-template="signal-01">
        <div className="sg01cd-hero-inner">
          <nav className="sg01cd-crumb" aria-label="Drobečková navigace">
            <a href={base}>Domů</a>
            <span aria-hidden="true">/</span>
            <a href={`${base}/case-studies`}>Case studies</a>
            <span aria-hidden="true">/</span>
            <span className="cur">{title}</span>
          </nav>
          {item.industry && <span className="sg01cd-ind">{item.industry}</span>}
          <h1 className="sg01cd-title">{title}</h1>
          {item.excerpt && <p className="sg01cd-excerpt">{item.excerpt}</p>}
          {(item.metric || item.metricLabel) && (
            <div className="sg01cd-metric">
              {item.metric && <b>{item.metric}</b>}
              {item.metricLabel && <span>{item.metricLabel}</span>}
            </div>
          )}
        </div>
      </section>

      {item.photo && (
        <section className="sg01cd-photo" data-template="signal-01">
          <div className="sg01cd-photo-inner">
            <img src={String(item.photo)} alt={title} />
          </div>
        </section>
      )}

      {paragraphs.length > 0 && (
        <section className="sg01cd-body" data-template="signal-01">
          <div className="sg01cd-body-inner">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            <a className="sg01cd-back" href={`${base}/case-studies`}>
              ← Zpět na všechny case studies
            </a>
          </div>
        </section>
      )}

      {contact && <SectionRenderer section={contact} tenantId={tenant.id} tenantSlug={tenantSlug} isAdmin={false} />}
    </TenantChrome>
  );
}
