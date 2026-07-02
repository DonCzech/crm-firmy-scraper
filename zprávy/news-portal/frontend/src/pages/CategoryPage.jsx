import { useState, useEffect } from 'react';
import { api } from '../App.jsx';
import { CATEGORIES } from '../config.js';
import ArticleCard from '../components/ArticleCard.jsx';

export default function CategoryPage({ category, navigate }) {
  const [articles, setArticles]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [page, setPage]           = useState(0);
  const [hasMore, setHasMore]     = useState(true);
  const LIMIT = 12;

  const catLabel = CATEGORIES.find(c => c.id === category)?.label || category;

  useEffect(() => {
    setArticles([]);
    setPage(0);
    setHasMore(true);
    setLoading(true);
    api(`/api/articles?category=${category}&limit=${LIMIT}&offset=0`)
      .then(data => {
        setArticles(data);
        setHasMore(data.length === LIMIT);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [category]);

  function loadMore() {
    const nextPage = page + 1;
    api(`/api/articles?category=${category}&limit=${LIMIT}&offset=${nextPage * LIMIT}`)
      .then(data => {
        setArticles(prev => [...prev, ...data]);
        setPage(nextPage);
        setHasMore(data.length === LIMIT);
      });
  }

  return (
    <div className="container">
      <div className="category-page">
        <h1 className="category-page-title">{catLabel}</h1>
        {loading ? (
          <div className="category-grid">
            {[1,2,3,4,5,6].map(i => (
              <div key={i}>
                <div className="skeleton skeleton-img" />
                <div className="skeleton skeleton-title" style={{ marginTop: 12 }} />
              </div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="empty-state">
            <h3>V kategorii {catLabel} zatím nejsou žádné články</h3>
            <p>Zkuste to znovu za chvíli.</p>
          </div>
        ) : (
          <>
            <div className="category-grid">
              {articles.map(a => (
                <ArticleCard key={a.id} article={a} size="large" navigate={navigate} />
              ))}
            </div>
            {hasMore && (
              <div style={{ textAlign: 'center', marginTop: 40 }}>
                <button
                  onClick={loadMore}
                  style={{
                    background: 'var(--bbc-red)', color: 'white',
                    border: 'none', padding: '12px 32px', fontSize: 15,
                    cursor: 'pointer', borderRadius: 4
                  }}
                >
                  Načíst další
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
