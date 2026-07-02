import { useState, useEffect } from 'react';
import { api } from '../App.jsx';

export default function BreakingBanner({ navigate }) {
  const [articles, setArticles] = useState([]);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    api('/api/articles/breaking').then(data => {
      if (Array.isArray(data) && data.length) setArticles(data);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (articles.length < 2) return;
    const id = setInterval(() => setIdx(i => (i + 1) % articles.length), 6000);
    return () => clearInterval(id);
  }, [articles.length]);

  if (!articles.length) return null;

  const article = articles[idx];

  return (
    <div className="breaking-banner">
      <div className="breaking-inner">
        <span className="breaking-label">Breaking</span>
        <div className="breaking-scroll">
          <div
            className="breaking-item"
            onClick={() => navigate(`/clanek/${article.slug}`)}
            title={article.title}
          >
            {article.title}
          </div>
        </div>
      </div>
    </div>
  );
}
