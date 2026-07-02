import { CATEGORIES } from '../config.js';

export default function Footer({ navigate }) {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-grid">
          <div>
            <div className="footer-logo">
              <span>ZPRÁVY</span>CZ
            </div>
            <p className="footer-desc">
              Automaticky agregované zprávy z nejlepších českých médií,
              zobrazované s odkazem na původní zdroj.
            </p>
          </div>
          <div className="footer-col">
            <h4>Kategorie</h4>
            <ul>
              {CATEGORIES.slice(0, 5).map(cat => (
                <li key={cat.id}>
                  <a
                    href={`#/kategorie/${cat.id}`}
                    onClick={e => { e.preventDefault(); navigate(`/kategorie/${cat.id}`); }}
                  >
                    {cat.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="footer-col">
            <h4>Více kategorií</h4>
            <ul>
              {CATEGORIES.slice(5).map(cat => (
                <li key={cat.id}>
                  <a
                    href={`#/kategorie/${cat.id}`}
                    onClick={e => { e.preventDefault(); navigate(`/kategorie/${cat.id}`); }}
                  >
                    {cat.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {year} ZprávyCZ. Agregátor zpráv z veřejných zdrojů.</span>
          <span>Zdroje: Novinky.cz, iDnes.cz, Aktuálně.cz, Deník.cz, ČT24</span>
        </div>
      </div>
    </footer>
  );
}
