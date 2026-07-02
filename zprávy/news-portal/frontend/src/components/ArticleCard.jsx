import { formatTimeAgo } from '../utils.js';

// Unsplash placeholder obrázky podle kategorie (statické, rychlé)
const CATEGORY_IMAGES = {
  domaci:      'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&q=80',
  zahranicni:  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80',
  ekonomika:   'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80',
  sport:       'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80',
  kultura:     'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=800&q=80',
  technologie: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
  veda:        'https://images.unsplash.com/photo-1532094349884-543559244cad?w=800&q=80',
  zdravi:      'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&q=80',
  cestovani:   'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80',
  krimi:       'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80',
  default:     'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80',
};

function getImage(article) {
  return article.imageUrl || CATEGORY_IMAGES[article.category] || CATEGORY_IMAGES.default;
}

export default function ArticleCard({ article, size = 'medium', navigate }) {
  const href = `#/clanek/${article.slug}`;
  const go = e => { e.preventDefault(); navigate(`/clanek/${article.slug}`); };
  const imgSrc = getImage(article);

  const Cat = () => (
    <span className="card-category">{article.category?.toUpperCase()}</span>
  );

  const Meta = () => (
    <div className="card-meta">
      {article.isBreaking && <span className="badge badge--breaking">Breaking</span>}
      <span>{article.sourceName}</span>
      <span>·</span>
      <span>{formatTimeAgo(article.publishedAt)}</span>
      {article.readTime && <><span>·</span><span>{article.readTime} min čtení</span></>}
    </div>
  );

  const CardImg = ({ className }) => (
    <a href={href} onClick={go} className={`card-img ${className || ''}`}>
      <img
        src={imgSrc}
        alt={article.title}
        loading="lazy"
        onError={e => {
          // Fallback na category placeholder pokud vlastní obrázek selže
          const fallback = CATEGORY_IMAGES[article.category] || CATEGORY_IMAGES.default;
          if (e.target.src !== fallback) e.target.src = fallback;
        }}
      />
    </a>
  );

  if (size === 'large') return (
    <article className="article-card article-card--large">
      <CardImg />
      <div className="card-body">
        <Cat />
        <h2 className="card-title">
          <a href={href} onClick={go}>{article.title}</a>
        </h2>
        {article.perex && <p className="card-perex">{article.perex}</p>}
        <Meta />
      </div>
    </article>
  );

  if (size === 'medium') return (
    <article className="article-card article-card--medium">
      <CardImg />
      <div className="card-body">
        <Cat />
        <h3 className="card-title">
          <a href={href} onClick={go}>{article.title}</a>
        </h3>
        <Meta />
      </div>
    </article>
  );

  // small — malé karty bez obrázku (sidebar, seznam pod hlavním)
  return (
    <article className="article-card article-card--small">
      <Cat />
      <h3 className="card-title">
        <a href={href} onClick={go}>{article.title}</a>
      </h3>
      <Meta />
    </article>
  );
}
