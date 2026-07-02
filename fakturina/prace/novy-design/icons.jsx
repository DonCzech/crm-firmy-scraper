/* ============================================================
   FAKTURINA — icon set (1.6px stroke, 24 grid)
   ============================================================ */
const Ic = ({ d, size = 20, sw = 1.7, fill, children, vb = 24 }) => (
  <svg width={size} height={size} viewBox={`0 0 ${vb} ${vb}`} fill={fill || 'none'}
       stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    {children || <path d={d} />}
  </svg>
);

const Icons = {
  grid: (p) => <Ic {...p}><rect x="3" y="3" width="7" height="7" rx="1.6"/><rect x="14" y="3" width="7" height="7" rx="1.6"/><rect x="3" y="14" width="7" height="7" rx="1.6"/><rect x="14" y="14" width="7" height="7" rx="1.6"/></Ic>,
  file: (p) => <Ic {...p}><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h4"/></Ic>,
  quote: (p) => <Ic {...p}><path d="M9 12l2 2 4-4"/><rect x="4" y="3" width="16" height="18" rx="2.4"/></Ic>,
  coins: (p) => <Ic {...p}><ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6"/><path d="M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"/></Ic>,
  repeat: (p) => <Ic {...p}><path d="M17 2l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></Ic>,
  users: (p) => <Ic {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13A4 4 0 0 1 16 11"/></Ic>,
  chart: (p) => <Ic {...p}><path d="M3 3v18h18"/><rect x="7" y="11" width="3" height="6" rx="1"/><rect x="13" y="7" width="3" height="10" rx="1"/><rect x="19" y="13" width="0.1" height="4"/><path d="M19 13v4"/></Ic>,
  bell: (p) => <Ic {...p}><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></Ic>,
  company: (p) => <Ic {...p}><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M9 21v-4h6v4"/><path d="M8 7h.01M12 7h.01M16 7h.01M8 11h.01M12 11h.01M16 11h.01"/></Ic>,
  hash: (p) => <Ic {...p}><path d="M4 9h16M4 15h16M10 3L8 21M16 3l-2 18"/></Ic>,
  palette: (p) => <Ic {...p}><circle cx="13.5" cy="6.5" r="1"/><circle cx="17.5" cy="10.5" r="1"/><circle cx="8.5" cy="7.5" r="1"/><circle cx="6.5" cy="12.5" r="1"/><path d="M12 2a10 10 0 0 0 0 20c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.3-.3-.4-.5-.8-.5-1.2 0-1.1.9-2 2-2h2.3A4.4 4.4 0 0 0 22 11c0-5-4.5-9-10-9z"/></Ic>,
  copy: (p) => <Ic {...p}><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></Ic>,
  bank: (p) => <Ic {...p}><path d="M3 10l9-6 9 6"/><path d="M4 10v9M20 10v9M8 10v9M12 10v9M16 10v9"/><path d="M2 21h20"/></Ic>,
  plus: (p) => <Ic {...p}><path d="M12 5v14M5 12h14"/></Ic>,
  search: (p) => <Ic {...p}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></Ic>,
  arrowRight: (p) => <Ic {...p}><path d="M5 12h14M13 6l6 6-6 6"/></Ic>,
  arrowUpRight: (p) => <Ic {...p} sw={2}><path d="M7 17L17 7M8 7h9v9"/></Ic>,
  trendUp: (p) => <Ic {...p}><path d="M3 17l6-6 4 4 8-8"/><path d="M17 7h4v4"/></Ic>,
  trendDown: (p) => <Ic {...p}><path d="M3 7l6 6 4-4 8 8"/><path d="M17 17h4v-4"/></Ic>,
  clock: (p) => <Ic {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></Ic>,
  alert: (p) => <Ic {...p}><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></Ic>,
  check: (p) => <Ic {...p}><circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/></Ic>,
  checkPlain: (p) => <Ic {...p} sw={2.2}><path d="M5 12l5 5L20 6"/></Ic>,
  chevDown: (p) => <Ic {...p} sw={2}><path d="M6 9l6 6 6-6"/></Ic>,
  chevR: (p) => <Ic {...p} sw={2}><path d="M9 6l6 6-6 6"/></Ic>,
  dots: (p) => <Ic {...p}><circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none"/></Ic>,
  download: (p) => <Ic {...p}><path d="M12 3v12M7 10l5 5 5-5"/><path d="M4 21h16"/></Ic>,
  filter: (p) => <Ic {...p}><path d="M3 5h18l-7 8v6l-4-2v-4z"/></Ic>,
  sun: (p) => <Ic {...p}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></Ic>,
  moon: (p) => <Ic {...p}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></Ic>,
  box: (p) => <Ic {...p}><path d="M21 8l-9-5-9 5v8l9 5 9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/></Ic>,
  building: (p) => <Ic {...p}><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M9 21v-4h6v4M8 7h.01M12 7h.01M16 7h.01M8 11h.01M12 11h.01M16 11h.01"/></Ic>,
  laptop: (p) => <Ic {...p}><rect x="4" y="5" width="16" height="11" rx="1.6"/><path d="M2 20h20"/></Ic>,
  cloud: (p) => <Ic {...p}><path d="M17.5 19a4.5 4.5 0 0 0 .5-9 6 6 0 0 0-11.6 1.3A3.8 3.8 0 0 0 7 19z"/></Ic>,
  sparkle: (p) => <Ic {...p}><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/></Ic>,
  wallet: (p) => <Ic {...p}><rect x="3" y="6" width="18" height="14" rx="2.4"/><path d="M3 10h18M16 14h2"/></Ic>,
  calendar: (p) => <Ic {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></Ic>,
};

window.Icons = Icons;
