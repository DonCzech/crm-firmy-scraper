/* ============================================================
   FAKTURINA — app shell, routing, theme, tweaks
   ============================================================ */
const { useState: useSt, useEffect: useEf } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "dark": false,
  "accent": "emerald",
  "density": "Střední"
}/*EDITMODE-END*/;

const ACCENTS = {
  emerald: { l:['#0E7C5A','#0A6347','#0B5C43','#E2F1EA','rgba(14,124,90,.18)'], d:['#2ED3A3','#25B88E','#6FE7C4','rgba(46,211,163,.13)','rgba(46,211,163,.28)'] },
  indigo:  { l:['#5B53E8','#473FCB','#3F38B0','#E9E7FB','rgba(91,83,232,.20)'], d:['#8E86FA','#7A71F0','#B4AEFC','rgba(142,134,250,.15)','rgba(142,134,250,.30)'] },
  cobalt:  { l:['#2563EB','#1D4FD0','#1B45B5','#E2ECFD','rgba(37,99,235,.20)'], d:['#5B92F5','#3F78ED','#9CC0FB','rgba(91,146,245,.15)','rgba(91,146,245,.30)'] },
  plum:    { l:['#9A3D8E','#7F2F76','#6E2867','#F6E7F3','rgba(154,61,142,.20)'], d:['#D173C4','#BE5BB0','#E6AEDD','rgba(209,115,196,.15)','rgba(209,115,196,.30)'] },
};
const DENSITY = { 'Kompaktní': '14px', 'Střední': '20px', 'Vzdušné': '28px' };

function applyTheme(t) {
  const root = document.documentElement;
  root.setAttribute('data-theme', t.dark ? 'dark' : 'light');
  const a = (ACCENTS[t.accent] || ACCENTS.emerald)[t.dark ? 'd' : 'l'];
  root.style.setProperty('--accent', a[0]);
  root.style.setProperty('--accent-2', a[1]);
  root.style.setProperty('--accent-ink', t.dark ? a[2] : a[2]);
  root.style.setProperty('--accent-soft', a[3]);
  root.style.setProperty('--accent-glow', a[4]);
  root.style.setProperty('--chart-1', a[0]);
  root.style.setProperty('--gap', DENSITY[t.density] || DENSITY.regular);
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [route, setRoute] = useSt('dashboard');
  const [play, setPlay] = useSt(false);

  useEf(() => { applyTheme(t); }, [t.dark, t.accent, t.density]);

  // replay entrance animations on every navigation
  useEf(() => {
    setPlay(false);
    let r2;
    const r1 = requestAnimationFrame(() => { r2 = requestAnimationFrame(() => setPlay(true)); });
    return () => { cancelAnimationFrame(r1); cancelAnimationFrame(r2); };
  }, [route]);

  let Screen;
  if (route === 'dashboard') Screen = <Dashboard play={play} />;
  else if (route === 'invoices') Screen = <Invoices play={play} />;
  else if (route === 'stats') Screen = <Stats play={play} />;
  else Screen = <Placeholder route={route} />;

  return (
    <div className="app">
      <Sidebar route={route} setRoute={setRoute} />
      <div className="main">
        <TopBar dark={t.dark} onToggleTheme={() => setTweak('dark', !t.dark)} />
        <div className="content scroll" key={route}>
          {Screen}
        </div>
      </div>

      <TweaksPanel>
        <TweakSection label="Vzhled" />
        <TweakToggle label="Tmavý režim" value={t.dark} onChange={(v)=>setTweak('dark', v)} />
        <TweakColor label="Akcent" value={(ACCENTS[t.accent]||ACCENTS.emerald).l[0]}
          options={[ACCENTS.emerald.l[0], ACCENTS.indigo.l[0], ACCENTS.cobalt.l[0], ACCENTS.plum.l[0]]}
          onChange={(hex)=>{
            const key = Object.keys(ACCENTS).find(k=>ACCENTS[k].l[0]===hex) || 'emerald';
            setTweak('accent', key);
          }} />
        <TweakSection label="Rozložení" />
        <TweakRadio label="Hustota" value={t.density} options={['Kompaktní','Střední','Vzdušné']}
          onChange={(v)=>setTweak('density', v)} />
      </TweaksPanel>
    </div>
  );
}

// initial paint with correct theme before React mounts
applyTheme(TWEAK_DEFAULTS);

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
