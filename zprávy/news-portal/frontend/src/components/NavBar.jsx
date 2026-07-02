import { CATEGORIES } from '../config.js';

export default function NavBar({ route, navigate }) {
  function isActive(catId) {
    return route.page === 'category' && route.category === catId;
  }

  return (
    <nav className="main-nav">
      <ul>
        <li>
          <a
            href="#/"
            className={route.page === 'home' ? 'active' : ''}
            onClick={e => { e.preventDefault(); navigate('/'); }}
          >
            Hlavní
          </a>
        </li>
        {CATEGORIES.map(cat => (
          <li key={cat.id}>
            <a
              href={`#/kategorie/${cat.id}`}
              className={isActive(cat.id) ? 'active' : ''}
              onClick={e => { e.preventDefault(); navigate(`/kategorie/${cat.id}`); }}
            >
              {cat.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
