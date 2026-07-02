import ArticleCard from './ArticleCard.jsx';

export default function SectionBlock({ title, categoryId, articles, navigate }) {
  const [main, ...subs] = articles;

  return (
    <section className="section-block">
      <div className="section-header">
        <h2>{title}</h2>
        <a
          href={`#/kategorie/${categoryId}`}
          className="see-all"
          onClick={e => { e.preventDefault(); navigate(`/kategorie/${categoryId}`); }}
        >
          Vše z {title} →
        </a>
      </div>
      <div className="section-grid">
        <div className="main-article">
          {main && <ArticleCard article={main} size="large" navigate={navigate} />}
        </div>
        <div className="sub-articles">
          {subs.map(a => (
            <ArticleCard key={a.id} article={a} size="small" navigate={navigate} />
          ))}
        </div>
      </div>
    </section>
  );
}
