import { useState, useEffect } from 'react';
import { api, API_BASE } from '../App.jsx';
import { CATEGORIES } from '../config.js';
import { formatDate } from '../utils.js';
import ArticleCard from '../components/ArticleCard.jsx';

const CATEGORY_IMAGES = {
  domaci:      'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=1200&q=80',
  zahranicni:  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=80',
  ekonomika:   'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&q=80',
  sport:       'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200&q=80',
  kultura:     'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=1200&q=80',
  technologie: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80',
  veda:        'https://images.unsplash.com/photo-1532094349884-543559244cad?w=1200&q=80',
  zdravi:      'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=1200&q=80',
  cestovani:   'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&q=80',
  krimi:       'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&q=80',
  default:     'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&q=80',
};

export default function ArticlePage({ slug, navigate }) {
  const [article, setArticle] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    setLoading(true);
    api(`/api/articles/${slug}`)
      .then(data => {
        if (data.error) throw new Error(data.error);
        setArticle(data);
        setLoading(false);
        // Load related
        api(`/api/articles?category=${data.category}&limit=4`)
          .then(list => setRelated(list.filter(a => a.slug !== slug).slice(0, 3)))
          .catch(() => {});
      })
      .catch(err => { setError(err.message); setLoading(false); });
  }, [slug]);

  if (loading) return (
    <div className="container">
      <div className="article-page">
        <div className="skeleton skeleton-title" style={{ height: 40, marginBottom: 16 }} />
        <div className="skeleton skeleton-img" />
        {[1,2,3,4].map(i => <div key={i} className="skeleton skeleton-text" style={{ marginTop: 16 }} />)}
      </div>
    </div>
  );

  if (error) return (
    <div className="container">
      <div className="error-state" style={{ marginTop: 40 }}>
        Článek nenalezen nebo chyba načítání.{' '}
        <a href="#/" onClick={e => { e.preventDefault(); navigate('/'); }} style={{ color: 'var(--bbc-blue)' }}>
          Zpět na hlavní stránku
        </a>
      </div>
    </div>
  );

  if (!article) return null;

  const catLabel = CATEGORIES.find(c => c.id === article.category)?.label || article.category;
  const categoryFallback = CATEGORY_IMAGES[article.category] || CATEGORY_IMAGES.default;
  const proxiedImage = toProxyImage(article.imageUrl);
  const fallbackImage = proxiedImage || categoryFallback;
  const contentBlocks = Array.isArray(article.contentBlocks) && article.contentBlocks.length > 0
    ? article.contentBlocks
    : (Array.isArray(article.body) ? article.body.map((text) => ({ type: 'paragraph', text })) : []);

  return (
    <div className="container">
      <article className="article-page">
        {/* BREADCRUMB */}
        <div className="article-breadcrumb">
          <a href="#/" onClick={e => { e.preventDefault(); navigate('/'); }}>Hlavní</a>
          <span>›</span>
          <a
            href={`#/kategorie/${article.category}`}
            onClick={e => { e.preventDefault(); navigate(`/kategorie/${article.category}`); }}
          >
            {catLabel}
          </a>
        </div>

        {/* HEADER */}
        <header className="article-page-header">
          <span className="card-category">{catLabel.toUpperCase()}</span>
          {article.isBreaking && <span className="badge badge--breaking" style={{ marginLeft: 8 }}>Breaking</span>}
          <h1 className="article-title">{article.title}</h1>
          {article.perex && <p className="article-perex">{article.perex}</p>}
          <div className="article-meta">
            <span>{article.sourceName}</span>
            <span>·</span>
            <span>{formatDate(article.publishedAt)}</span>
            {article.author && <><span>·</span><span>{article.author}</span></>}
            {article.readTime && <><span>·</span><span>{article.readTime} min čtení</span></>}
          </div>
        </header>

        {/* BODY */}
        <div className="article-body">
          {contentBlocks.length > 0 ? contentBlocks.map((block, i) => {
            if (block.type === 'image' && block.src) {
              return (
                <img
                  key={`img-${i}-${block.src}`}
                  src={toProxyImage(block.src) || block.src}
                  alt={article.title}
                  className="article-hero-img article-inline-img"
                  loading="lazy"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              );
            }
            if (block.type === 'embed' && block.src) {
              const isVideo = ['youtube', 'vimeo'].includes(block.provider);
              const isNativeVideo = block.provider === 'sdnvideo';
              return (
                <div key={`embed-${i}-${block.src}`} className="article-embed">
                  {isNativeVideo ? (
                    <video controls preload="metadata" style={{ width: '100%' }}>
                      <source src={block.src} />
                    </video>
                  ) : isVideo ? (
                    <iframe
                      src={block.src}
                      title={`embed-${i}`}
                      loading="lazy"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <a href={block.src} target="_blank" rel="noopener noreferrer">
                      Otevřít příspěvek ({block.provider || 'sociální síť'})
                    </a>
                  )}
                </div>
              );
            }
            if (block.type === 'paragraph' && block.text) {
              return <p key={`p-${i}`}>{block.text}</p>;
            }
            return null;
          }) : (
            <>
              <img
                src={fallbackImage}
                alt={article.title}
                className="article-hero-img"
                onError={(e) => {
                  if (e.currentTarget.src !== categoryFallback) {
                    e.currentTarget.src = categoryFallback;
                  } else {
                    e.currentTarget.style.display = 'none';
                  }
                }}
              />
              {article.perex && <p>{article.perex}</p>}
            </>
          )}
        </div>

        {/* ATTRIBUTION */}
        <div className="article-attribution">
          Zdroj:{' '}
          <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer">
            {article.sourceName}
          </a>
          {' '}— Zobrazen je dostupný obsah ze zdroje. Originální článek naleznete na webu{' '}
          <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer">
            {article.sourceName}
          </a>.
        </div>
        {article.contentStatus?.level === 'partial' && (
          <div className="article-attribution" style={{ marginTop: 10, color: 'var(--bbc-mid-grey)' }}>
            Poznámka: Zdroj pro tento článek poskytl pouze zkrácený obsah
            {article.contentStatus?.reason === 'source_consent_wall' ? ' (omezení souhlasu/paywall).' : '.'}
          </div>
        )}

        {/* RELATED */}
        {related.length > 0 && (
          <section className="related-section">
            <div className="section-header">
              <h2>Podobné články</h2>
            </div>
            <div className="related-grid">
              {related.map(a => (
                <ArticleCard key={a.id} article={a} size="large" navigate={navigate} />
              ))}
            </div>
          </section>
        )}
      </article>
    </div>
  );
}

function toProxyImage(url) {
  const value = String(url || '').trim();
  if (!value) return '';
  if (!/^https?:\/\//i.test(value)) return '';
  const path = `/api/image?url=${encodeURIComponent(value)}`;
  return API_BASE ? `${API_BASE}${path}` : path;
}
