/* ============================================================
   FAKTURINA — shared UI (shell, count-up, helpers)
   ============================================================ */
const { useState: useStateU, useEffect: useEffectU, useRef: useRefU } = React;

/* ---- animated count-up number ---- */
function useCountUp(target, play, dur = 1400) {
  const [val, setVal] = useStateU(0);
  const ref = useRefU();
  useEffectU(() => {
    if (!play) { setVal(0); return; }
    let start;
    const from = 0;
    cancelAnimationFrame(ref.current);
    const tick = (t) => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(from + (target - from) * eased);
      if (p < 1) ref.current = requestAnimationFrame(tick);
    };
    ref.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(ref.current);
  }, [target, play]);
  return val;
}

function CountNum({ value, play, cur, dur }) {
  const v = useCountUp(value, play, dur);
  return (
    <span>{fmtCZ(Math.round(v))}{cur && <span className="cur">{cur}</span>}</span>
  );
}

/* ---- NAV definition ---- */
const NAV_MAIN = [
  { id:'dashboard', label:'Přehled', icon:'grid' },
  { id:'invoices',  label:'Faktury', icon:'file' },
  { id:'quotes',    label:'Nabídky', icon:'quote' },
  { id:'costs',     label:'Náklady', icon:'coins' },
  { id:'recurring', label:'Pravidelné faktury', icon:'repeat' },
  { id:'clients',   label:'Klienti', icon:'users' },
  { id:'stats',     label:'Statistiky', icon:'chart' },
  { id:'alerts',    label:'Upozornění', icon:'bell', badge:4 },
];
const NAV_SETTINGS = [
  { id:'company',   label:'Moje firma', icon:'company' },
  { id:'numbering', label:'Číslování', icon:'hash' },
  { id:'appearance',label:'Vzhled faktur', icon:'palette' },
  { id:'templates', label:'Šablony', icon:'copy' },
  { id:'accounts',  label:'Bankovní účty', icon:'bank' },
];

function NavItem({ item, active, onClick }) {
  const I = Icons[item.icon];
  return (
    <button className={'nav-item' + (active ? ' active' : '')} onClick={onClick}>
      <I size={19} />
      <span>{item.label}</span>
      {item.badge && <span className="nav-badge">{item.badge}</span>}
    </button>
  );
}

function Sidebar({ route, setRoute }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark"><Icons.sparkle size={21} sw={2} /></div>
        <div className="brand-name">Fakturina<span className="brand-dot">.</span></div>
      </div>

      <nav className="nav-group">
        {NAV_MAIN.map((it) => (
          <NavItem key={it.id} item={it} active={route===it.id} onClick={() => setRoute(it.id)} />
        ))}
      </nav>

      <div className="nav-label">Nastavení</div>
      <nav className="nav-group">
        {NAV_SETTINGS.map((it) => (
          <NavItem key={it.id} item={it} active={route===it.id} onClick={() => setRoute(it.id)} />
        ))}
      </nav>

      <div className="sidebar-spacer"></div>

      <div className="upgrade">
        <div className="upgrade-title">Tarif Zdarma</div>
        <div className="upgrade-sub">Odemkněte neomezené faktury, statistiky a automatizace.</div>
        <button className="upgrade-btn"><Icons.sparkle size={14} sw={2} /> Upgradovat na Pro</button>
      </div>
    </aside>
  );
}

function TopBar({ onToggleTheme, dark }) {
  return (
    <header className="topbar">
      <div className="company-switch">
        <div className="company-logo">ČP</div>
        <div>
          <div className="company-name">Český Partner s.r.o.</div>
          <div className="company-sub">IČO 04738291</div>
        </div>
        <Icons.chevDown size={15} style={{ color:'var(--ink-3)', marginLeft:2 }} />
      </div>

      <div className="topbar-spacer"></div>

      <label className="search">
        <Icons.search size={17} />
        <input placeholder="Hledat faktury, klienty…" />
        <kbd>⌘K</kbd>
      </label>

      <button className="icon-btn" title="Vzhled" onClick={onToggleTheme}>
        {dark ? <Icons.sun size={19} /> : <Icons.moon size={19} />}
      </button>
      <button className="icon-btn" title="Upozornění">
        <Icons.bell size={19} />
        <span className="ping"></span>
      </button>

      <button className="btn-primary"><Icons.plus size={17} sw={2.2} /> Nová faktura</button>

      <div className="avatar" title="Don Novák">DN</div>
    </header>
  );
}

Object.assign(window, { useCountUp, CountNum, Sidebar, TopBar, NAV_MAIN, NAV_SETTINGS });
