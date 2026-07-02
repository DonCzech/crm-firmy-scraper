/* ============================================================
   FAKTURINA — sample data (Czech invoicing SaaS)
   ============================================================ */

// avatar gradient palette (deterministic by index)
const AVA = [
  'linear-gradient(150deg,#0E7C5A,#0A6347)',
  'linear-gradient(150deg,#C8A24A,#A07E2E)',
  'linear-gradient(150deg,#3A6FF0,#2748C4)',
  'linear-gradient(150deg,#C84357,#9D2E40)',
  'linear-gradient(150deg,#7A52E0,#5B36C0)',
  'linear-gradient(150deg,#1F9CB0,#147685)',
  'linear-gradient(150deg,#E07A36,#B85A1E)',
  'linear-gradient(150deg,#2C3340,#161A21)',
];

// last 12 months revenue (in Kč) — current = červen 2026
const MONTHS = ['Čvc','Srp','Zář','Říj','Lis','Pro','Led','Úno','Bře','Dub','Kvě','Čvn'];
const REVENUE = [78000, 92000, 86000, 104000, 121000, 98000, 112000, 134000, 128000, 156000, 171000, 186400];
const EXPENSES = [31000, 36000, 33000, 41000, 47000, 39000, 44000, 51000, 49000, 58000, 61000, 64200];

// KPI cards
const KPIS = [
  { id:'total', label:'Celkem vyfakturováno', value:1466800, cur:'Kč', delta:+18.4, dir:'up', tone:'green', icon:'trendUp',
    spark:[42,48,44,55,61,52,58,67,64,78,86,93] },
  { id:'unpaid', label:'Nezaplacené faktury', value:248600, cur:'Kč', delta:+6.2, dir:'up', tone:'amber', icon:'clock',
    spark:[60,52,58,49,55,62,57,64,59,66,71,74] },
  { id:'overdue', label:'Po splatnosti', value:64200, cur:'Kč', delta:-12.8, dir:'down', tone:'red', icon:'alert',
    spark:[80,72,68,75,64,58,66,52,49,44,40,32] },
  { id:'paid', label:'Zaplaceno', value:1153900, cur:'Kč', delta:+22.1, dir:'up', tone:'green', icon:'check',
    spark:[40,46,43,52,59,55,61,68,71,82,90,98] },
];

// invoice status split (for donut)
const STATUS = [
  { key:'paid', label:'Zaplaceno', value:1153900, count:142, color:'var(--paid)' },
  { key:'pending', label:'Čeká na platbu', value:184400, count:11, color:'var(--pending)' },
  { key:'overdue', label:'Po splatnosti', value:64200, count:4, color:'var(--overdue)' },
  { key:'draft', label:'Koncepty', value:64300, count:3, color:'var(--draft)' },
];

// recent invoices
const INVOICES = [
  { num:'2026-0184', client:'Alza.cz a.s.',        ico:0, amount:48400,  status:'paid',    date:'3. čvn 2026', due:'17. čvn 2026' },
  { num:'2026-0183', client:'Notino s.r.o.',        ico:1, amount:62900,  status:'pending', date:'1. čvn 2026', due:'15. čvn 2026' },
  { num:'2026-0182', client:'Rohlík.cz a.s.',       ico:2, amount:31200,  status:'paid',    date:'29. kvě 2026', due:'12. čvn 2026' },
  { num:'2026-0181', client:'Kiwi.com s.r.o.',      ico:3, amount:87600,  status:'overdue', date:'12. kvě 2026', due:'26. kvě 2026' },
  { num:'2026-0180', client:'Productboard, Inc.',   ico:4, amount:54300,  status:'pending', date:'9. kvě 2026', due:'23. čvn 2026' },
  { num:'2026-0179', client:'Seznam.cz a.s.',       ico:5, amount:39800,  status:'paid',    date:'6. kvě 2026', due:'20. kvě 2026' },
  { num:'2026-0178', client:'Zásilkovna s.r.o.',    ico:6, amount:22400,  status:'paid',    date:'2. kvě 2026', due:'16. kvě 2026' },
  { num:'2026-0177', client:'Heureka Group a.s.',   ico:7, amount:45100,  status:'draft',   date:'28. dub 2026', due:'—' },
];

// longer list for Faktury page
const INVOICES_ALL = [
  ...INVOICES,
  { num:'2026-0176', client:'Mall Group a.s.',      ico:1, amount:71500,  status:'paid',    date:'24. dub 2026', due:'8. kvě 2026' },
  { num:'2026-0175', client:'STRV s.r.o.',          ico:4, amount:96200,  status:'paid',    date:'21. dub 2026', due:'5. kvě 2026' },
  { num:'2026-0174', client:'Dáme jídlo s.r.o.',    ico:6, amount:18700,  status:'overdue', date:'14. dub 2026', due:'28. dub 2026' },
  { num:'2026-0173', client:'Pipedrive OÜ',         ico:2, amount:43900,  status:'paid',    date:'10. dub 2026', due:'24. dub 2026' },
  { num:'2026-0172', client:'Productboard, Inc.',   ico:4, amount:54300,  status:'pending', date:'7. dub 2026', due:'21. dub 2026' },
  { num:'2026-0171', client:'Notino s.r.o.',        ico:1, amount:33800,  status:'paid',    date:'2. dub 2026', due:'16. dub 2026' },
];

// top clients
const CLIENTS = [
  { name:'STRV s.r.o.',         ico:4, total:312400, share:100, invoices:14 },
  { name:'Alza.cz a.s.',        ico:0, total:268900, share:86,  invoices:21 },
  { name:'Kiwi.com s.r.o.',     ico:3, total:214300, share:69,  invoices:9  },
  { name:'Notino s.r.o.',       ico:1, total:178200, share:57,  invoices:12 },
  { name:'Productboard, Inc.',  ico:4, total:142600, share:46,  invoices:7  },
];

// recent costs
const COSTS = [
  { name:'Adobe Creative Cloud', cat:'Software · předplatné', amount:1620, icon:'box', date:'2. čvn' },
  { name:'Pronájem kanceláře',   cat:'Nájem · červen',        amount:24000, icon:'building', date:'1. čvn' },
  { name:'Notebook MacBook Pro', cat:'Vybavení',              amount:62900, icon:'laptop', date:'28. kvě' },
  { name:'Vercel Pro',           cat:'Hosting · předplatné',  amount:480,   icon:'cloud', date:'26. kvě' },
];

// alerts / tasks
const ALERTS = [
  { kind:'overdue', text:'4 faktury po splatnosti', sub:'celkem 64 200 Kč', },
  { kind:'pending', text:'DPH přiznání za Q2', sub:'do 25. čvc 2026' },
  { kind:'info',    text:'Pravidelná faktura · Notino', sub:'vystaví se 15. čvn' },
];

function fmtCZ(n) {
  return n.toLocaleString('cs-CZ').replace(/\u00A0/g, ' ');
}
function fmtK(n) {
  if (n >= 1000000) return (n/1000000).toFixed(1).replace('.',',') + ' M';
  if (n >= 1000) return Math.round(n/1000) + ' tis.';
  return String(n);
}

Object.assign(window, {
  AVA, MONTHS, REVENUE, EXPENSES, KPIS, STATUS, INVOICES, INVOICES_ALL,
  CLIENTS, COSTS, ALERTS, fmtCZ, fmtK,
});
