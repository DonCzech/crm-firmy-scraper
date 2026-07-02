import { useState, useEffect } from 'react';
import { api } from '../App.jsx';
import { CATEGORIES } from '../config.js';
import ArticleCard from '../components/ArticleCard.jsx';
import SectionBlock from '../components/SectionBlock.jsx';
import Sidebar from '../components/Sidebar.jsx';

export default function HomePage({ navigate }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api('/api/articles/latest?limit=60')
      .then(data => { setArticles(data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, []);

  if (loading) return <HomeSkeleton />;
  if (error)   return <div className="container"><div className="error-state" style={{marginTop:40}}>Chyba načítání: {error}</div></div>;

  if (!articles.length) return (
    <div className="container">
      <div className="empty-state" style={{ marginTop: 60 }}>
        <h3>Zatím žádné články</h3>
        <p>Backend zpracovává první dávku zpráv. Zkuste to za chvíli.</p>
      </div>
    </div>
  );

  const hero      = articles[0];
  const secondary = articles.slice(1, 4);
  const rest      = articles.slice(4);

  const byCategory = {};
  CATEGORIES.forEach(cat => {
    byCategory[cat.id] = rest.filter(a => a.category === cat.id).slice(0, 4);
  });

  return (
    <div className="container" style={{ paddingTop: 32 }}>
      {/* HERO */}
      {hero && (
        <section className="hero-section">
          <div className="hero-grid">
            <ArticleCard article={hero} size="large" navigate={navigate} />
            <div className="hero-secondary">
              {secondary.map(a => (
                <ArticleCard key={a.id} article={a} size="medium" navigate={navigate} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* OBSAH + SIDEBAR */}
      <div className="page-grid" style={{ marginTop: 40 }}>
        <div>
          {CATEGORIES.map(cat => {
            const arts = byCategory[cat.id];
            if (!arts?.length) return null;
            return (
              <SectionBlock
                key={cat.id}
                title={cat.label}
                categoryId={cat.id}
                articles={arts}
                navigate={navigate}
              />
            );
          })}
        </div>
        <Sidebar articles={articles} navigate={navigate} />
      </div>
    </div>
  );
}

function HomeSkeleton() {
  return (
    <div className="container" style={{ paddingTop: 32 }}>
      <div className="hero-grid" style={{ marginBottom: 40 }}>
        <div>
          <div className="skeleton skeleton-img" />
          <div className="skeleton skeleton-title" style={{ marginTop: 12 }} />
          <div className="skeleton skeleton-text" />
          <div className="skeleton skeleton-text" style={{ width: '60%' }} />
        </div>
        <div>
          {[1,2,3].map(i => (
            <div key={i} style={{ padding: '16px 0', borderTop: '1px solid #eee' }}>
              <div className="skeleton skeleton-title" style={{ height: 18 }} />
              <div className="skeleton skeleton-text" style={{ marginTop: 8 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
