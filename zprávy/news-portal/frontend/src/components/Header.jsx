import { useState, useEffect } from 'react';

export default function Header({ navigate }) {
  const [time, setTime] = useState(formatTime());
  const [query, setQuery] = useState('');

  useEffect(() => {
    const id = setInterval(() => setTime(formatTime()), 1000);
    return () => clearInterval(id);
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    if (query.trim()) navigate(`/hledani?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <header className="site-header">
      <div className="header-inner">
        <div className="site-logo" onClick={() => navigate('/')}>
          <span>ZPRÁVY</span>CZ
        </div>
        <form className="header-search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Hledat zprávy..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button type="submit">Hledat</button>
        </form>
        <div className="live-clock">{time}</div>
      </div>
    </header>
  );
}

function formatTime() {
  return new Date().toLocaleTimeString('cs-CZ', {
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });
}
