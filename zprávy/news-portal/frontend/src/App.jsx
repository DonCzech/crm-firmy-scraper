import { useState, useEffect } from 'react';
import Header from './components/Header.jsx';
import NavBar from './components/NavBar.jsx';
import BreakingBanner from './components/BreakingBanner.jsx';
import Footer from './components/Footer.jsx';
import HomePage from './pages/HomePage.jsx';
import ArticlePage from './pages/ArticlePage.jsx';
import CategoryPage from './pages/CategoryPage.jsx';
import SearchPage from './pages/SearchPage.jsx';
import './styles/global.css';

export const API_BASE = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');

export const api = (path) =>
  fetch(`${API_BASE}${path}`).then(r => r.json());

export default function App() {
  const [route, setRoute] = useState(parseHash());
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const onHash = () => setRoute(parseHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    api('/api/stats').then(setStats).catch(() => {});
  }, []);

  function navigate(path) {
    window.location.hash = path;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="app">
      {stats && (
        <div className="stats-bar">
          Celkem: <span>{stats.total}</span> | Zpracováno: <span>{stats.done}</span>
          {' '}| Čeká zpracování: <span>{stats.pending}</span>
        </div>
      )}
      <Header navigate={navigate} />
      <NavBar route={route} navigate={navigate} />
      <BreakingBanner navigate={navigate} />
      <main>
        {route.page === 'home'     && <HomePage navigate={navigate} />}
        {route.page === 'article'  && <ArticlePage slug={route.slug} navigate={navigate} />}
        {route.page === 'category' && <CategoryPage category={route.category} navigate={navigate} />}
        {route.page === 'search'   && <SearchPage query={route.query} navigate={navigate} />}
      </main>
      <Footer navigate={navigate} />
      <ScrollToTop />
    </div>
  );
}

function parseHash() {
  const hash = window.location.hash.replace('#', '') || '/';
  if (hash === '/')                    return { page: 'home' };
  if (hash.startsWith('/clanek/'))     return { page: 'article',  slug:     hash.replace('/clanek/', '') };
  if (hash.startsWith('/kategorie/'))  return { page: 'category', category: hash.replace('/kategorie/', '') };
  if (hash.startsWith('/hledani'))     return { page: 'search',   query:    new URLSearchParams(hash.split('?')[1]).get('q') || '' };
  return { page: 'home' };
}

function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const fn = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);
  return (
    <button
      className={`scroll-top ${visible ? 'visible' : ''}`}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      title="Nahoru"
    >↑</button>
  );
}
