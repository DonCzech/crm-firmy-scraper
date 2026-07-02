import { useState, useEffect } from 'react';
import { api } from '../App.jsx';
import ArticleCard from '../components/ArticleCard.jsx';

export default function SearchPage({ query: initialQuery, navigate }) {
  const [query, setQuery]       = useState(initialQuery || '');
  const [results, setResults]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (initialQuery) doSearch(initialQuery);
  }, [initialQuery]);

  function doSearch(q) {
    if (!q?.trim()) return;
    setLoading(true);
    setSearched(true);
    api(`/api/articles?search=${encodeURIComponent(q)}&limit=30`)
      .then(data => { setResults(data); setLoading(false); })
      .catch(() => setLoading(false));
  }

  function handleSubmit(e) {
    e.preventDefault();
    navigate(`/hledani?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <div className="container">
      <div className="search-page">
        <div className="search-header">
          <h1>Vyhledávání</h1>
          <form className="search-form" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Zadejte hledaný výraz..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              autoFocus
            />
            <button type="submit">Hledat</button>
          </form>
        </div>

        {loading && (
          <div className="search-results">
            {[1,2,3].map(i => (
              <div key={i} style={{ padding: '16px 0', borderTop: '1px solid #eee' }}>
                <div className="skeleton skeleton-title" />
                <div className="skeleton skeleton-text" style={{ marginTop: 8 }} />
              </div>
            ))}
          </div>
        )}

        {!loading && searched && (
          <>
            <p className="search-count">
              {results.length > 0
                ? `Nalezeno ${results.length} výsledků pro „${initialQuery}"`
                : `Pro „${initialQuery}" nebyly nalezeny žádné výsledky`}
            </p>
            <div className="search-results">
              {results.map(a => (
                <ArticleCard key={a.id} article={a} size="medium" navigate={navigate} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
