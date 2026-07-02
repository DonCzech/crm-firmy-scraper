/* ============================================================
   FAKTURINA — animated SVG charts
   ============================================================ */
const { useState, useEffect, useRef, useMemo } = React;

/* ---- helpers ---- */
function smoothPath(pts) {
  if (pts.length < 2) return '';
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const t = 0.18;
    const c1x = p1.x + (p2.x - p0.x) * t;
    const c1y = p1.y + (p2.y - p0.y) * t;
    const c2x = p2.x - (p3.x - p1.x) * t;
    const c2y = p2.y - (p3.y - p1.y) * t;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

/* =========================================================
   Sparkline — tiny area inside KPI cards
   ========================================================= */
function Sparkline({ data, tone = 'green', play }) {
  const W = 240, H = 44;
  const min = Math.min(...data), max = Math.max(...data);
  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * W,
    y: H - 4 - ((v - min) / (max - min || 1)) * (H - 10),
  }));
  const line = smoothPath(pts);
  const area = `${line} L ${W} ${H} L 0 ${H} Z`;
  const color = tone === 'red' ? 'var(--overdue)' : tone === 'amber' ? 'var(--pending)' : 'var(--paid)';
  const uid = useMemo(() => 'sp' + Math.random().toString(36).slice(2, 7), []);
  const lineRef = useRef(null);
  useEffect(() => {
    if (!play || !lineRef.current) return;
    const len = lineRef.current.getTotalLength();
    lineRef.current.style.strokeDasharray = len;
    lineRef.current.style.strokeDashoffset = len;
    lineRef.current.getBoundingClientRect();
    lineRef.current.style.transition = 'stroke-dashoffset 1.1s cubic-bezier(.16,1,.3,1) .25s';
    lineRef.current.style.strokeDashoffset = '0';
  }, [play]);
  return (
    <svg className="stat-spark" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={uid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.16" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${uid})`} style={{ opacity: play ? 1 : 0, transition: 'opacity .8s ease .5s' }} />
      <path ref={lineRef} d={line} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/* =========================================================
   RevenueChart — big area chart w/ grid + hover tooltip
   ========================================================= */
function RevenueChart({ revenue, expenses, months, play, showExpenses = true }) {
  const W = 760, H = 280;
  const padT = 18, padB = 34, padL = 6, padR = 6;
  const innerW = W - padL - padR, innerH = H - padT - padB;
  const max = Math.max(...revenue, ...(showExpenses ? expenses : [0])) * 1.12;
  const xy = (arr) => arr.map((v, i) => ({
    x: padL + (i / (arr.length - 1)) * innerW,
    y: padT + innerH - (v / max) * innerH,
    v, i,
  }));
  const rp = xy(revenue), ep = xy(expenses);
  const rLine = smoothPath(rp), eLine = smoothPath(ep);
  const rArea = `${rLine} L ${rp[rp.length-1].x} ${padT+innerH} L ${rp[0].x} ${padT+innerH} Z`;

  const [hover, setHover] = useState(null);
  const wrapRef = useRef(null);
  const rRef = useRef(null), eRef = useRef(null);

  useEffect(() => {
    if (!play) return;
    [rRef.current, eRef.current].forEach((el, k) => {
      if (!el) return;
      const len = el.getTotalLength();
      el.style.strokeDasharray = len;
      el.style.strokeDashoffset = len;
      el.getBoundingClientRect();
      el.style.transition = `stroke-dashoffset 1.4s cubic-bezier(.16,1,.3,1) ${0.15 + k*0.12}s`;
      el.style.strokeDashoffset = '0';
    });
  }, [play, showExpenses]);

  const gridVals = [0, 0.25, 0.5, 0.75, 1];

  function onMove(e) {
    const rect = wrapRef.current.getBoundingClientRect();
    const rel = (e.clientX - rect.left) / rect.width;
    const idx = Math.round(rel * (revenue.length - 1));
    const i = Math.max(0, Math.min(revenue.length - 1, idx));
    setHover(i);
  }

  return (
    <div className="chart-wrap">
      <div className="chart-legend">
        <span className="legend-item"><span className="legend-dot" style={{background:'var(--chart-1)'}}></span>Příjmy</span>
        {showExpenses && <span className="legend-item"><span className="legend-dot" style={{background:'var(--chart-2)'}}></span>Náklady</span>}
      </div>
      <div ref={wrapRef} style={{ position:'relative' }}
           onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width:'100%', display:'block', overflow:'visible' }}>
          <defs>
            <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="var(--chart-1)" stopOpacity="0.22" />
              <stop offset="0.7" stopColor="var(--chart-1)" stopOpacity="0.04" />
              <stop offset="1" stopColor="var(--chart-1)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* grid */}
          {gridVals.map((g, k) => (
            <line key={k} x1={padL} x2={W-padR}
                  y1={padT + innerH - g*innerH} y2={padT + innerH - g*innerH}
                  stroke="var(--chart-grid)" strokeWidth="1" strokeDasharray={k===0?'0':'4 5'} />
          ))}
          {/* area */}
          <path d={rArea} fill="url(#revFill)" style={{ opacity: play?1:0, transition:'opacity 1s ease .5s' }} />
          {/* expenses line */}
          {showExpenses && (
            <path ref={eRef} d={eLine} fill="none" stroke="var(--chart-2)" strokeWidth="2.4"
                  strokeLinecap="round" strokeDasharray="1 6" style={{ strokeDasharray:'2 7' }} opacity="0.9" />
          )}
          {/* revenue line */}
          <path ref={rRef} d={rLine} fill="none" stroke="var(--chart-1)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          {/* dots */}
          {rp.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={hover===i?5:0} fill="var(--surface)" stroke="var(--chart-1)" strokeWidth="3"
                    style={{ transition:'r .18s var(--ease)' }} />
          ))}
          {/* hover crosshair */}
          {hover!=null && (
            <line x1={rp[hover].x} x2={rp[hover].x} y1={padT} y2={padT+innerH}
                  stroke="var(--chart-1)" strokeWidth="1.4" strokeDasharray="4 4" opacity="0.4" />
          )}
          {/* x labels */}
          {months.map((m, i) => (
            <text key={i} x={rp[i].x} y={H-10} textAnchor="middle"
                  fontSize="11" fontFamily="var(--font-body)" fontWeight="500"
                  fill={hover===i ? 'var(--ink)' : 'var(--ink-3)'}>{m}</text>
          ))}
        </svg>
        {hover!=null && (
          <div className={'chart-tooltip show'} style={{
            left: `${(rp[hover].x/W)*100}%`,
            top: `${(rp[hover].y/H)*100}%`,
          }}>
            <div className="tt-month">{months[hover]} 2026</div>
            <div><span style={{color:'var(--chart-1)'}}>●</span> Příjmy <b>{fmtCZ(revenue[hover])} Kč</b></div>
            {showExpenses && <div style={{marginTop:2}}><span style={{color:'var(--chart-2)'}}>●</span> Náklady <b>{fmtCZ(expenses[hover])} Kč</b></div>}
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   Donut — invoice status split
   ========================================================= */
function Donut({ segments, play, total, centerLabel = 'faktur', size = 168 }) {
  const r = size/2 - 14, cx = size/2, cy = size/2, C = 2 * Math.PI * r;
  const sum = segments.reduce((a, s) => a + s.value, 0);
  let acc = 0;
  const arcs = segments.map((s) => {
    const frac = s.value / sum;
    const dash = frac * C;
    const arc = { ...s, dash, gap: C - dash, offset: -acc * C, frac };
    acc += frac;
    return arc;
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--surface-inset)" strokeWidth="14" />
      {arcs.map((a, i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={a.color} strokeWidth="14"
                strokeLinecap="round"
                strokeDasharray={`${play ? a.dash : 0} ${C}`}
                strokeDashoffset={a.offset}
                transform={`rotate(-90 ${cx} ${cy})`}
                style={{ transition:`stroke-dasharray 1.1s cubic-bezier(.16,1,.3,1) ${0.2 + i*0.12}s` }} />
      ))}
      <text x={cx} y={cy-4} textAnchor="middle" fontFamily="var(--font-display)" fontWeight="800"
            fontSize="30" fill="var(--ink)" style={{letterSpacing:'-.02em'}}>{total}</text>
      <text x={cx} y={cy+18} textAnchor="middle" fontFamily="var(--font-body)" fontWeight="500"
            fontSize="13" fill="var(--ink-3)">{centerLabel}</text>
    </svg>
  );
}

/* =========================================================
   GoalRing — circular progress
   ========================================================= */
function GoalRing({ pct, play, size = 132, label }) {
  const r = size/2 - 12, cx = size/2, cy = size/2, C = 2*Math.PI*r;
  const dash = (play ? pct/100 : 0) * C;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <linearGradient id="goalGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--accent-2)" />
          <stop offset="1" stopColor="var(--accent)" />
        </linearGradient>
      </defs>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--surface-inset)" strokeWidth="11" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="url(#goalGrad)" strokeWidth="11" strokeLinecap="round"
              strokeDasharray={`${dash} ${C}`} transform={`rotate(-90 ${cx} ${cy})`}
              style={{ transition:'stroke-dasharray 1.3s cubic-bezier(.16,1,.3,1) .3s' }} />
      <text x={cx} y={cy-2} textAnchor="middle" fontFamily="var(--font-display)" fontWeight="800"
            fontSize="28" fill="var(--ink)" style={{letterSpacing:'-.02em'}}>{Math.round(pct)}%</text>
      <text x={cx} y={cy+18} textAnchor="middle" fontFamily="var(--font-body)" fontWeight="500"
            fontSize="11.5" fill="var(--ink-3)">{label}</text>
    </svg>
  );
}

/* =========================================================
   Bars — monthly comparison bars (stats page)
   ========================================================= */
function Bars({ revenue, expenses, months, play }) {
  const W = 760, H = 280, padB = 30, padT = 14;
  const innerH = H - padB - padT;
  const max = Math.max(...revenue) * 1.1;
  const n = revenue.length;
  const slot = W / n;
  const bw = 13;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width:'100%', display:'block' }}>
      {[0.25,0.5,0.75,1].map((g,k)=>(
        <line key={k} x1="0" x2={W} y1={padT+innerH-g*innerH} y2={padT+innerH-g*innerH}
              stroke="var(--chart-grid)" strokeWidth="1" strokeDasharray="4 5" />
      ))}
      {revenue.map((v, i) => {
        const cx = slot*i + slot/2;
        const rh = (v/max)*innerH;
        const eh = (expenses[i]/max)*innerH;
        return (
          <g key={i}>
            <rect x={cx-bw-1} y={padT+innerH-(play?rh:0)} width={bw} height={play?rh:0} rx="4"
                  fill="var(--chart-1)" style={{ transition:`all .9s cubic-bezier(.16,1,.3,1) ${i*0.045}s` }} />
            <rect x={cx+1} y={padT+innerH-(play?eh:0)} width={bw} height={play?eh:0} rx="4"
                  fill="var(--chart-2)" opacity="0.65" style={{ transition:`all .9s cubic-bezier(.16,1,.3,1) ${i*0.045+0.05}s` }} />
            <text x={cx} y={H-9} textAnchor="middle" fontSize="11" fontWeight="500"
                  fontFamily="var(--font-body)" fill="var(--ink-3)">{months[i]}</text>
          </g>
        );
      })}
    </svg>
  );
}

Object.assign(window, { Sparkline, RevenueChart, Donut, GoalRing, Bars, smoothPath });
