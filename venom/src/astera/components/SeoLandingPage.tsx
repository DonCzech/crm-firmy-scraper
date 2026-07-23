import Link from "next/link";
import Header from "@/astera/components/Header";
import Footer from "@/astera/components/Footer";
import { absoluteUrl, findSeoPage, SeoPage } from "@/astera/lib/seo";

export default function SeoLandingPage({ page }: { page: SeoPage }) {
  const related = page.related.map(findSeoPage).filter(Boolean) as SeoPage[];

  return (
    <>
      <Header />
      <main className="seo-page">
        <section className="seo-hero">
          <div className="seo-shell">
            <p className="seo-eyebrow">{page.eyebrow}</p>
            <h1>{page.heading}</h1>
            <p className="seo-lead">{page.lead}</p>
            <div className="seo-actions">
              <a className="seo-primary" href={page.ctaHref}>
                {page.ctaLabel}
              </a>
              <Link className="seo-secondary" href="/sluzby">
                Zobrazit služby
              </Link>
            </div>
          </div>
        </section>

        <section className="seo-content seo-shell" aria-label={page.heading}>
          <div className="seo-text">
            {page.sections.map((section) => (
              <article key={section.title}>
                <h2>{section.title}</h2>
                <p>{section.body}</p>
              </article>
            ))}
          </div>

          <aside className="seo-panel" aria-label="Hlavní témata">
            <h2>V čem vám může pomoci</h2>
            <ul>
              {page.bullets.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </aside>
        </section>

        {related.length > 0 && (
          <section className="seo-related">
            <div className="seo-shell">
              <h2>Související témata</h2>
              <div className="seo-related-grid">
                {related.map((item) => (
                  <a key={item.slug} href={absoluteUrl(`/${item.slug}`)}>
                    <span>{item.eyebrow}</span>
                    <strong>{item.heading}</strong>
                    <em>Číst dál</em>
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
      <style>{`
        .seo-page {
          background: #fffcf7;
          color: #241c2b;
          padding-top: 102px;
        }
        .seo-shell {
          width: min(1120px, calc(100% - 40px));
          margin: 0 auto;
        }
        .seo-hero {
          background:
            linear-gradient(115deg, rgba(255,252,247,0.95) 0%, rgba(255,252,247,0.78) 54%, rgba(255,252,247,0.48) 100%),
            image-set(url("/optimized/uploads/astera-upload-1777542736772-d2souok25x7-662w.webp") 1x);
          background-size: cover;
          background-position: center;
          min-height: 560px;
          display: flex;
          align-items: center;
        }
        .seo-hero h1 {
          max-width: 780px;
          margin: 0;
          font-family: "Playfair Display", serif;
          font-size: 58px;
          line-height: 1.05;
          font-weight: 700;
          letter-spacing: 0;
        }
        .seo-eyebrow {
          margin: 0 0 18px;
          color: #7c3bb2;
          font-family: "Poppins", sans-serif;
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.12em;
        }
        .seo-lead {
          max-width: 720px;
          margin: 24px 0 0;
          color: #4b4056;
          font-family: "Poppins", sans-serif;
          font-size: 18px;
          line-height: 1.8;
        }
        .seo-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 14px;
          margin-top: 34px;
        }
        .seo-primary,
        .seo-secondary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 48px;
          padding: 0 24px;
          border-radius: 8px;
          font-family: "Poppins", sans-serif;
          font-size: 14px;
          font-weight: 700;
          text-decoration: none;
        }
        .seo-primary {
          background: #7c3bb2;
          color: white;
        }
        .seo-secondary {
          background: rgba(255,255,255,0.78);
          color: #4d236f;
          border: 1px solid rgba(124,59,178,0.22);
        }
        .seo-content {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 340px;
          gap: 48px;
          padding: 74px 0;
        }
        .seo-text {
          display: grid;
          gap: 32px;
        }
        .seo-text article,
        .seo-panel,
        .seo-related-grid a {
          background: white;
          border: 1px solid rgba(124,59,178,0.12);
          border-radius: 8px;
          box-shadow: 0 16px 40px rgba(40, 24, 58, 0.07);
        }
        .seo-text article {
          padding: 34px;
        }
        .seo-text h2,
        .seo-panel h2,
        .seo-related h2 {
          margin: 0 0 14px;
          font-family: "Playfair Display", serif;
          font-size: 32px;
          line-height: 1.18;
          letter-spacing: 0;
        }
        .seo-text p,
        .seo-panel li {
          margin: 0;
          color: #50465a;
          font-family: "Poppins", sans-serif;
          font-size: 16px;
          line-height: 1.8;
        }
        .seo-panel {
          align-self: start;
          padding: 30px;
          position: sticky;
          top: 122px;
        }
        .seo-panel ul {
          display: grid;
          gap: 14px;
          list-style: none;
          margin: 20px 0 0;
          padding: 0;
        }
        .seo-panel li {
          padding-left: 22px;
          position: relative;
        }
        .seo-panel li::before {
          content: "";
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #c9a84c;
          position: absolute;
          left: 0;
          top: 12px;
        }
        .seo-related {
          background: #f6f0fb;
          padding: 64px 0 78px;
        }
        .seo-related-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
          margin-top: 24px;
        }
        .seo-related-grid a {
          display: grid;
          gap: 10px;
          padding: 24px;
          color: #241c2b;
          text-decoration: none;
        }
        .seo-related-grid span {
          color: #7c3bb2;
          font-family: "Poppins", sans-serif;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
        }
        .seo-related-grid strong {
          font-family: "Playfair Display", serif;
          font-size: 23px;
          line-height: 1.2;
        }
        .seo-related-grid em {
          color: #6a347f;
          font-family: "Poppins", sans-serif;
          font-size: 13px;
          font-style: normal;
          font-weight: 700;
        }
        @media (max-width: 760px) {
          .seo-page {
            padding-top: 76px;
          }
          .seo-shell {
            width: min(100% - 32px, 1120px);
          }
          .seo-hero {
            min-height: 520px;
            background-position: 55% center;
          }
          .seo-hero h1 {
            font-size: 40px;
          }
          .seo-lead {
            font-size: 16px;
          }
          .seo-content {
            grid-template-columns: 1fr;
            gap: 24px;
            padding: 46px 0;
          }
          .seo-panel {
            position: static;
          }
          .seo-text article,
          .seo-panel {
            padding: 24px;
          }
          .seo-related-grid {
            grid-template-columns: 1fr;
          }
          .seo-text h2,
          .seo-panel h2,
          .seo-related h2 {
            font-size: 28px;
          }
        }
      `}</style>
    </>
  );
}
