import { formatTimeAgo } from '../utils.js';

export default function Sidebar({ articles, navigate }) {
  const latest = articles.slice(0, 8);
  const mostViewed = [...articles]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5);

  return (
    <aside className="sidebar">
      <div className="sidebar-block">
        <div className="section-header">
          <h2>Nejčtenější</h2>
        </div>
        {mostViewed.map((a, i) => (
          <div
            key={a.id}
            className="sidebar-item"
            onClick={() => navigate(`/clanek/${a.slug}`)}
          >
            <span className="sidebar-rank">{i + 1}</span>
            <span className="sidebar-title">{a.title}</span>
          </div>
        ))}
      </div>

      <div className="sidebar-block">
        <div className="section-header">
          <h2>Nejnovější</h2>
        </div>
        {latest.map(a => (
          <div
            key={a.id}
            className="sidebar-item"
            onClick={() => navigate(`/clanek/${a.slug}`)}
          >
            <div style={{ flex: 1 }}>
              <div className="sidebar-title">{a.title}</div>
              <div style={{ fontSize: 12, color: 'var(--bbc-mid-grey)', marginTop: 4 }}>
                {a.sourceName} · {formatTimeAgo(a.publishedAt)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
