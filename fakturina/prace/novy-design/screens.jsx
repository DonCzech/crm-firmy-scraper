/* ============================================================
   FAKTURINA — screens: Přehled / Faktury / Statistiky
   ============================================================ */
const { useState: useS, useEffect: useE } = React;

/* staggered reveal wrapper */
function Reveal({ delay = 0, children, className = '', style = {} }) {
  return (
    <div className={'reveal ' + className} style={{ animationDelay: delay + 'ms', ...style }}>
      {children}
    </div>
  );
}

const STATUS_LABEL = { paid:'Zaplaceno', pending:'Čeká', overdue:'Po splatnosti', draft:'Koncept' };

function StatusBadge({ s }) {
  return <span className={'badge ' + s}><span className="bdot"></span>{STATUS_LABEL[s]}</span>;
}

function ClientAva({ ico, name, size = 36 }) {
  const initials = name.replace(/[.,]/g,'').split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase();
  return <div className="client-ava" style={{ background: AVA[ico % AVA.length], width:size, height:size, fontSize: size*0.37 }}>{initials}</div>;
}

/* =========================================================
   DASHBOARD (Přehled)
   ========================================================= */
function Dashboard({ play }) {
  const [period, setPeriod] = useS('12m');
  const [showExp, setShowExp] = useS(true);
  const totalCount = STATUS.reduce((a,s)=>a+s.count,0);

  return (
    <div className="page">
      <div className="page-head">
        <Reveal delay={0}>
          <div>
            <h1 className="page-title">Přehled</h1>
            <div className="page-sub">Čtvrtek 4. června 2026 · poslední aktualizace před chvílí</div>
          </div>
        </Reveal>
        <div className="page-head-actions">
          <Reveal delay={40} className="segmented">
            {['30 d','3 m','12 m','Rok'].map((p,i)=>(
              <button key={p} className={i===2?'on':''}>{p}</button>
            ))}
          </Reveal>
          <Reveal delay={80}><button className="btn-ghost"><Icons.download size={16}/> Export</button></Reveal>
        </div>
      </div>

      {/* KPI ROW */}
      <div className="bento">
        {KPIS.map((k, i) => {
          const I = Icons[k.icon];
          return (
            <Reveal key={k.id} delay={120 + i*70} className="card stat">
              <div className="stat-top">
                <div className={'stat-ico ' + k.tone}><I size={21} /></div>
                <span className={'delta ' + (k.dir==='up'?'up':k.dir==='down'?'down':'flat')}>
                  {k.dir==='up' ? <Icons.trendUp size={13} sw={2.2}/> : <Icons.trendDown size={13} sw={2.2}/>}
                  {k.dir==='down' ? '' : '+'}{k.delta}%
                </span>
              </div>
              <div className="stat-label">{k.label}</div>
              <div className="stat-value font-num"><CountNum value={k.value} play={play} cur={k.cur} /></div>
              <Sparkline data={k.spark} tone={k.tone} play={play} />
            </Reveal>
          );
        })}
      </div>

      {/* CHART + DONUT */}
      <div style={{ display:'grid', gridTemplateColumns:'1.66fr 1fr', gap:'var(--gap)', marginBottom:'var(--gap)' }}>
        <Reveal delay={440} className="card">
          <div className="card-head">
            <div>
              <h3>Vývoj příjmů</h3>
            </div>
            <div className="card-head-actions">
              <button className={'btn-ghost'} style={{padding:'7px 12px', fontSize:13, opacity: showExp?1:0.6}}
                      onClick={()=>setShowExp(v=>!v)}>
                <span style={{width:8,height:8,borderRadius:3,background:'var(--chart-2)',display:'inline-block'}}></span>
                Náklady
              </button>
            </div>
          </div>
          <RevenueChart revenue={REVENUE} expenses={EXPENSES} months={MONTHS} play={play} showExpenses={showExp} />
        </Reveal>

        <Reveal delay={500} className="card">
          <div className="card-head"><h3>Stav faktur</h3><span className="hint" style={{marginLeft:'auto'}}>Tento rok</span></div>
          <div className="donut-row" style={{ padding:'20px 22px' }}>
            <Donut segments={STATUS} play={play} total={totalCount} centerLabel="faktur" />
            <div className="donut-legend">
              {STATUS.map((s)=>(
                <div className="dleg" key={s.key}>
                  <span className="sw" style={{background:s.color}}></span>
                  <span className="l">{s.label}</span>
                  <span className="v font-num">{s.count}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>

      {/* INVOICES + SIDE STACK */}
      <div style={{ display:'grid', gridTemplateColumns:'1.66fr 1fr', gap:'var(--gap)', alignItems:'start' }}>
        <Reveal delay={560} className="card">
          <div className="card-head">
            <h3>Poslední faktury</h3>
            <div className="card-head-actions">
              <button className="link">Všechny <Icons.arrowRight size={15}/></button>
            </div>
          </div>
          <table className="tbl">
            <thead><tr>
              <th>Klient</th><th>Vystaveno</th><th>Stav</th><th className="right">Částka</th>
            </tr></thead>
            <tbody>
              {INVOICES.slice(0,6).map((inv)=>(
                <tr key={inv.num}>
                  <td>
                    <div className="client-cell">
                      <ClientAva ico={inv.ico} name={inv.client} />
                      <div>
                        <div className="client-name">{inv.client}</div>
                        <div className="client-meta inv-num">{inv.num}</div>
                      </div>
                    </div>
                  </td>
                  <td>{inv.date}</td>
                  <td><StatusBadge s={inv.status} /></td>
                  <td className="right amount">{fmtCZ(inv.amount)} Kč</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>

        <div style={{ display:'flex', flexDirection:'column', gap:'var(--gap)' }}>
          {/* top clients */}
          <Reveal delay={620} className="card">
            <div className="card-head"><h3>Nejlepší klienti</h3>
              <div className="card-head-actions"><button className="link">Vše <Icons.arrowRight size={15}/></button></div>
            </div>
            <div className="clist">
              {CLIENTS.slice(0,4).map((c)=>(
                <div className="crow" key={c.name}>
                  <ClientAva ico={c.ico} name={c.name} size={34} />
                  <div style={{minWidth:0, flex:'0 0 auto', width:118}}>
                    <div className="client-name" style={{whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{c.name}</div>
                    <div className="client-meta">{c.invoices} faktur</div>
                  </div>
                  <div className="cbar-track"><div className="cbar" style={{width:c.share+'%'}}></div></div>
                  <div className="amount" style={{fontSize:13.5, minWidth:74, textAlign:'right'}}>{fmtK(c.total)}</div>
                </div>
              ))}
            </div>
          </Reveal>

          {/* costs */}
          <Reveal delay={680} className="card card-pad">
            <div style={{display:'flex',alignItems:'center',marginBottom:6}}>
              <h3 style={{fontFamily:'var(--font-display)',fontWeight:700,fontSize:16.5,color:'var(--ink)'}}>Poslední náklady</h3>
              <button className="link" style={{marginLeft:'auto'}}>Vše <Icons.arrowRight size={15}/></button>
            </div>
            {COSTS.slice(0,3).map((c)=>{
              const I = Icons[c.icon] || Icons.box;
              return (
                <div className="cost-row" key={c.name}>
                  <div className="cost-ico"><I size={18}/></div>
                  <div style={{flex:1,minWidth:0}}>
                    <div className="cost-name">{c.name}</div>
                    <div className="cost-cat">{c.cat}</div>
                  </div>
                  <div className="amount" style={{fontSize:14}}>−{fmtCZ(c.amount)} Kč</div>
                </div>
              );
            })}
          </Reveal>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   FAKTURY
   ========================================================= */
function Invoices({ play }) {
  const [filter, setFilter] = useS('all');
  const counts = {
    all: INVOICES_ALL.length,
    paid: INVOICES_ALL.filter(i=>i.status==='paid').length,
    pending: INVOICES_ALL.filter(i=>i.status==='pending').length,
    overdue: INVOICES_ALL.filter(i=>i.status==='overdue').length,
    draft: INVOICES_ALL.filter(i=>i.status==='draft').length,
  };
  const rows = filter==='all' ? INVOICES_ALL : INVOICES_ALL.filter(i=>i.status===filter);
  const tabs = [
    {k:'all',l:'Vše'},{k:'paid',l:'Zaplaceno'},{k:'pending',l:'Čeká'},{k:'overdue',l:'Po splatnosti'},{k:'draft',l:'Koncepty'},
  ];
  return (
    <div className="page">
      <div className="page-head">
        <Reveal delay={0}>
          <div>
            <h1 className="page-title">Faktury</h1>
            <div className="page-sub">{INVOICES_ALL.length} faktur · 1 466 800 Kč vyfakturováno tento rok</div>
          </div>
        </Reveal>
        <div className="page-head-actions">
          <Reveal delay={60}><button className="btn-ghost"><Icons.download size={16}/> Export</button></Reveal>
          <Reveal delay={100}><button className="btn-primary"><Icons.plus size={17} sw={2.2}/> Nová faktura</button></Reveal>
        </div>
      </div>

      <Reveal delay={140} className="toolbar" style={{display:'flex'}}>
        <div className="filter-tabs">
          {tabs.map(t=>(
            <button key={t.k} className={filter===t.k?'on':''} onClick={()=>setFilter(t.k)}>
              {t.l}<span className="cnt">{counts[t.k]}</span>
            </button>
          ))}
        </div>
        <label className="search" style={{marginLeft:'auto', width:240}}>
          <Icons.search size={17}/><input placeholder="Hledat faktury…" />
        </label>
        <button className="btn-ghost"><Icons.filter size={16}/> Filtr</button>
      </Reveal>

      <Reveal delay={200} className="card">
        <table className="tbl">
          <thead><tr>
            <th>Klient · č. faktury</th><th>Vystaveno</th><th>Splatnost</th><th>Stav</th>
            <th className="right">Částka</th><th style={{width:48}}></th>
          </tr></thead>
          <tbody>
            {rows.map((inv)=>(
              <tr key={inv.num}>
                <td>
                  <div className="client-cell">
                    <ClientAva ico={inv.ico} name={inv.client} />
                    <div>
                      <div className="client-name">{inv.client}</div>
                      <div className="client-meta inv-num">{inv.num}</div>
                    </div>
                  </div>
                </td>
                <td>{inv.date}</td>
                <td style={{color: inv.status==='overdue'?'var(--overdue)':'var(--ink-2)', fontWeight: inv.status==='overdue'?600:400}}>{inv.due}</td>
                <td><StatusBadge s={inv.status} /></td>
                <td className="right amount">{fmtCZ(inv.amount)} Kč</td>
                <td className="right"><button className="icon-btn" style={{width:32,height:32,border:'none',background:'none'}}><Icons.dots size={18}/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Reveal>
    </div>
  );
}

/* =========================================================
   STATISTIKY
   ========================================================= */
function Stats({ play }) {
  const totalRev = REVENUE.reduce((a,b)=>a+b,0);
  const totalExp = EXPENSES.reduce((a,b)=>a+b,0);
  const profit = totalRev - totalExp;
  const summary = [
    { label:'Průměrná faktura', value:'34 920 Kč', delta:'+8,1 %', dir:'up', icon:'wallet' },
    { label:'Ø doba splatnosti', value:'9,4 dne', delta:'−1,8 dne', dir:'up', icon:'clock' },
    { label:'Míra zaplacení', value:'94 %', delta:'+3 %', dir:'up', icon:'check' },
    { label:'Vystaveno faktur', value:'160', delta:'+22', dir:'up', icon:'file' },
  ];
  return (
    <div className="page">
      <div className="page-head">
        <Reveal delay={0}>
          <div>
            <h1 className="page-title">Statistiky</h1>
            <div className="page-sub">Přehled za posledních 12 měsíců · červenec 2025 – červen 2026</div>
          </div>
        </Reveal>
        <div className="page-head-actions">
          <Reveal delay={40} className="segmented">
            {['Měsíc','Kvartál','Rok'].map((p,i)=>(<button key={p} className={i===2?'on':''}>{p}</button>))}
          </Reveal>
          <Reveal delay={80}><button className="btn-ghost"><Icons.download size={16}/> Export</button></Reveal>
        </div>
      </div>

      {/* hero: bars + profit ring */}
      <div className="stats-hero">
        <Reveal delay={120} className="card">
          <div className="card-head">
            <h3>Příjmy vs. náklady</h3>
            <div className="card-head-actions">
              <span className="legend-item"><span className="legend-dot" style={{background:'var(--chart-1)'}}></span>Příjmy</span>
              <span className="legend-item"><span className="legend-dot" style={{background:'var(--chart-2)'}}></span>Náklady</span>
            </div>
          </div>
          <div className="bars-wrap"><Bars revenue={REVENUE} expenses={EXPENSES} months={MONTHS} play={play} /></div>
        </Reveal>

        <Reveal delay={180} className="card card-pad" style={{display:'flex',flexDirection:'column'}}>
          <h3 style={{fontFamily:'var(--font-display)',fontWeight:700,fontSize:16.5,color:'var(--ink)',marginBottom:4}}>Čistý zisk</h3>
          <div className="page-sub" style={{marginTop:0,marginBottom:16}}>Za 12 měsíců</div>
          <div style={{display:'flex',alignItems:'center',gap:22}}>
            <GoalRing pct={67} play={play} label="z cíle 1,5 M" />
            <div style={{display:'flex',flexDirection:'column',gap:14}}>
              <div>
                <div className="stat-label" style={{marginBottom:3}}>Zisk</div>
                <div className="font-num" style={{fontWeight:800,fontSize:24,color:'var(--ink)',letterSpacing:'-.02em'}}>{fmtCZ(profit)} Kč</div>
              </div>
              <div>
                <div className="stat-label" style={{marginBottom:3}}>Marže</div>
                <div className="font-num" style={{fontWeight:800,fontSize:24,color:'var(--accent)',letterSpacing:'-.02em'}}>{Math.round(profit/totalRev*100)} %</div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      {/* summary KPIs */}
      <div className="bento">
        {summary.map((s,i)=>{
          const I = Icons[s.icon];
          return (
            <Reveal key={s.label} delay={240+i*70} className="card card-pad" style={{padding:'18px 20px'}}>
              <div style={{display:'flex',alignItems:'center',gap:11,marginBottom:14}}>
                <div className="stat-ico ink" style={{width:38,height:38}}><I size={19}/></div>
                <span className={'delta '+(s.dir==='up'?'up':'down')} style={{marginLeft:'auto'}}>{s.delta}</span>
              </div>
              <div className="stat-label">{s.label}</div>
              <div className="font-num" style={{fontWeight:800,fontSize:26,color:'var(--ink)',letterSpacing:'-.02em',marginTop:4}}>{s.value}</div>
            </Reveal>
          );
        })}
      </div>

      {/* top clients bars */}
      <Reveal delay={520} className="card" style={{marginTop:'var(--gap)'}}>
        <div className="card-head"><h3>Nejvýnosnější klienti</h3><span className="hint" style={{marginLeft:'auto'}}>Tento rok</span></div>
        <div className="clist">
          {CLIENTS.map((c)=>(
            <div className="crow" key={c.name} style={{padding:'15px 22px'}}>
              <ClientAva ico={c.ico} name={c.name} size={36}/>
              <div style={{width:160,flexShrink:0}}>
                <div className="client-name" style={{whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{c.name}</div>
                <div className="client-meta">{c.invoices} faktur</div>
              </div>
              <div className="cbar-track"><div className="cbar" style={{width:c.share+'%'}}></div></div>
              <div className="amount" style={{minWidth:96,textAlign:'right'}}>{fmtCZ(c.total)} Kč</div>
            </div>
          ))}
        </div>
      </Reveal>
    </div>
  );
}

/* =========================================================
   PLACEHOLDER (unbuilt routes)
   ========================================================= */
function Placeholder({ route }) {
  const item = [...NAV_MAIN, ...NAV_SETTINGS].find(n=>n.id===route);
  const I = (item && Icons[item.icon]) || Icons.grid;
  return (
    <div className="page placeholder-page">
      <div>
        <div className="pico"><I size={34}/></div>
        <h2>{item ? item.label : 'Sekce'}</h2>
        <p>Tato sekce je součástí kompletního produktu. V této ukázce jsou plně předělané obrazovky <b>Přehled</b>, <b>Faktury</b> a <b>Statistiky</b>.</p>
      </div>
    </div>
  );
}

Object.assign(window, { Dashboard, Invoices, Stats, Placeholder });
