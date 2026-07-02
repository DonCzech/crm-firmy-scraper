import { useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Plus, Trash2, Pencil, TrendingUp, TrendingDown,
  Wallet, PiggyBank, BarChart2, Home, TreePine,
  X, Check, Calculator, ChevronDown, ChevronUp,
  Info, Shield, Flame, Target, AlertTriangle, CheckCircle2,
  Minus, Building,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Content } from '../../layout/components/content';
import { ContentHeader } from '../../layout/components/content-header';

// ─── Types ────────────────────────────────────────────────────────────────────

type ItemType = 'income' | 'expense';
type Frequency = 'monthly' | 'annual' | 'weekly';

interface FinanceItem {
  id: string;
  name: string;
  amount: number;
  type: ItemType;
  category: string;
  frequency: Frequency;
  notes?: string;
}

interface DebtItem {
  id: string;
  name: string;
  balance: number;
  rate: number;
  minPayment: number;
}

interface NetWorthItem {
  id: string;
  name: string;
  value: number;
  type: 'asset' | 'liability';
  category: string;
}

// ─── Storage keys ─────────────────────────────────────────────────────────────

const STORAGE_KEY       = 'crm-finance-items';
const SAVINGS_KEY       = 'crm-finance-savings';
const DEBTS_KEY         = 'crm-finance-debts';
const NETWORTH_KEY      = 'crm-finance-networth';

// ─── Constants ────────────────────────────────────────────────────────────────

const EXPENSE_CATEGORIES = ['Telefon/Internet', 'Bydlení', 'Doprava', 'Pojištění', 'Jídlo', 'Zdraví', 'Zábava', 'Vzdělávání', 'Ostatní'];
const INCOME_CATEGORIES  = ['Zaměstnání', 'Nájem', 'Dividendy', 'Freelance', 'Podnikání', 'Ostatní'];

const DEFAULT_ITEMS: FinanceItem[] = [
  { id: '1', name: 'Paušál O2', amount: 700, type: 'expense', category: 'Telefon/Internet', frequency: 'monthly' },
  { id: '2', name: 'Nájem Bílina', amount: 10000, type: 'income', category: 'Nájem', frequency: 'monthly' },
];

// ─── Advisor Data ─────────────────────────────────────────────────────────────

const EXPENSE_BENCHMARKS: Record<string, { max: number; savingTips: string[] }> = {
  'Bydlení': {
    max: 30,
    savingTips: [
      'Refixujte hypotéku — při poklesu sazeb ušetříte desítky tisíc ročně',
      'Pronajměte pokoj nebo garáž — přidá 5 000–15 000 Kč/měs pasivně',
      'Srovnejte dodavatele energií na energie.cz — úspora 3 000–10 000 Kč/rok',
      'Zkontrolujte zálohy na energie — většina Čechů přeplácí a dostane přeplatek',
      'Airbnb krátkodobý pronájem vynese 2–3× více než klasický nájemník',
    ],
  },
  'Doprava': {
    max: 15,
    savingTips: [
      'Porovnejte pojištění auta každý rok na srovnávač.cz — ušetříte 1 000–5 000 Kč',
      'Elektrokolo + MHD nahradí auto ve městě a ušetří 2 000–5 000 Kč/měs',
      'BlaBlaCar a carpooling na delší trasy — dělíte náklady na palivo',
      'Správný tlak pneumatik sníží spotřebu paliva o 5–10 %',
      'Zvažte prodej druhého auta — ušetříte pojištění, servis, parkování',
    ],
  },
  'Telefon/Internet': {
    max: 3,
    savingTips: [
      'Porovnejte tarify na gsmsrovnavac.cz — přechod ušetří 100–400 Kč/měs',
      'Rodinný nebo sdílený tarif je o 30–50 % levnější než individuální',
      'Zavolejte stávajícímu operátorovi a řekněte, že chcete odejít — funguje',
      'Zkontrolujte, zda platíte za nevyužitá data nebo roaming v balíčku',
    ],
  },
  'Jídlo': {
    max: 15,
    savingTips: [
      'Plánujte jídla na týden + nákupní seznam — ušetříte 1 000–2 000 Kč a snížíte plýtvání',
      'Nesnězeno, Too Good To Go — levná jídla z restaurací za zlomek ceny',
      'Vařte doma místo restaurací — jídlo doma stojí 3–5× méně za stejnou kvalitu',
      'Nakupujte večer — supermarkety sleví zboží blízko expirace o 30–70 %',
      'Mrazák jako přítel — nakupujte ve velkém ve slevě a zmrazujte',
    ],
  },
  'Pojištění': {
    max: 8,
    savingTips: [
      'Porovnejte pojišťovny každé 2 roky — ušetříte 1 000–5 000 Kč ročně',
      'Zrušte zbytečná pojištění (úraz ke kartě, cestovní z banky atd.)',
      'Sdružené pojištění majetku + odpovědnosti + auta je levnější než jednotlivě',
      'Životní pojištění přes zaměstnavatele nebo OSVČ může být daňově odpočitatelné',
    ],
  },
  'Zábava': {
    max: 8,
    savingTips: [
      'Sdílejte Netflix, Spotify, Disney+ s rodinou — 1/4 ceny na osobu',
      'Projděte výpisy z účtu a zrušte předplatná, která nevyužíváte',
      'Knihovna a Mediální fond ČR — tisíce e-knih a audioknih zdarma',
      'Slevomat, Skrz.cz — výhodné zážitky a restaurace za polovinu',
    ],
  },
  'Zdraví': {
    max: 5,
    savingTips: [
      'Preventivní prohlídky hradí pojišťovna — využijte je každý rok naplno',
      'Generické léky jsou stejně účinné za 30–50 % ceny originálů',
      'Cvičení venku nebo doma ušetří 500–1 500 Kč/měs oproti fitku',
      'Lékárna.cz, Dr.Max online — levnější než kamenná lékárna',
    ],
  },
};

interface IncomeIdea {
  id: string;
  icon: string;
  title: string;
  potential: string;
  timeToStart: string;
  difficulty: 'Snadné' | 'Střední' | 'Náročné';
  desc: string;
  steps: string[];
}

const INCOME_IDEAS: IncomeIdea[] = [
  {
    id: 'etf',
    icon: '📈',
    title: 'Pravidelné investování (ETF)',
    potential: '7–10 % p.a. dlouhodobě',
    timeToStart: '1 den',
    difficulty: 'Snadné',
    desc: 'Nejjednodušší cesta ke zbohatnutí. Otevřete účet u XTB (0 Kč poplatky do 2 500 000 Kč/měs) nebo DEGIRO. Kupujte světové ETF jako VWCE nebo Invesco S&P 500. Nastavte automatický převod každý měsíc a ignorujte výkyvy trhu.',
    steps: [
      'Otevřete účet na XTB.com — online, 10 minut, bez poplatků za vedení',
      'Kupte ETF VWCE (celý světový trh) nebo Invesco S&P 500 ETF',
      'Nastavte trvalý příkaz z účtu každý měsíc — i 1 000 Kč stačí na start',
      'Nereagujte na výkyvy trhu — hold long-term',
    ],
  },
  {
    id: 'dpp',
    icon: '💼',
    title: 'DPP / vedlejší práce',
    potential: '5 000–15 000 Kč/měs',
    timeToStart: '1–2 týdny',
    difficulty: 'Snadné',
    desc: 'Od roku 2024: DPP do 11 500 Kč/měs bez zdravotního a sociálního pojištění. Využijte svou expertízu z hlavní práce jako konzultant nebo externista. Nejrychlejší způsob jak přidat příjem.',
    steps: [
      'Sepište 5 věcí, ve kterých jste lepší než 90 % lidí kolem vás',
      'Nastavte profil na LinkedIn jako "open to freelance work"',
      'Hledejte DPP na Jobs.cz, Brigádník.cz nebo oslovte firmy přímo emailem',
      'Domluvte první zakázku a podepište DPP smlouvu',
    ],
  },
  {
    id: 'taxes',
    icon: '💰',
    title: 'Daňová optimalizace',
    potential: '5 000–50 000 Kč/rok',
    timeToStart: '1 měsíc',
    difficulty: 'Snadné',
    desc: 'Legální odpočty, které využívá jen polovina Čechů a nechávají tak ležet tisíce korun v daních. Vše odečítáte od základu daně a vrátí vám to FÚ.',
    steps: [
      'Penzijní spoření: příspěvek nad 1 000 Kč/měs → odpočet až 24 000 Kč/rok',
      'Životní pojištění: odpočet až 24 000 Kč/rok ze základu daně',
      'Úroky z hypotéky: odpočet zaplacených úroků až 150 000 Kč/rok',
      'Dary na charitu: odpočet 2–15 % základu daně',
      'OSVČ: paušální výdaje 60 % (řemeslo) nebo 40–80 % dle oboru',
    ],
  },
  {
    id: 'freelance',
    icon: '🎯',
    title: 'Freelance / Konzultace',
    potential: '500–3 000 Kč/hod',
    timeToStart: '2–4 týdny',
    difficulty: 'Střední',
    desc: 'Vaše expertise má tržní hodnotu, které zatím nevyužíváte. IČO zřídíte online za 1 den. Jako OSVČ máte paušální výdaje 40–80 % — efektivní daňová sazba pak bývá kolem 10–15 %.',
    steps: [
      'Zřiďte IČO na podnikatel.cz nebo živnostenském úřadě (online)',
      'Vytvořte profesionální profil na LinkedIn a Fiverr.com',
      'Napište 3 konkrétní nabídky služeb s ceníkem',
      'Oslovte 10 potenciálních klientů emailem s konkrétní nabídkou',
    ],
  },
  {
    id: 'rental',
    icon: '🏠',
    title: 'Pronájem nemovitosti',
    potential: '10 000–30 000 Kč/měs',
    timeToStart: '2–6 týdnů',
    difficulty: 'Střední',
    desc: 'Nejspolehlivější pasivní příjem v ČR. Airbnb (krátkodobé) vynese 2–3× více než klasický pronájem, ale vyžaduje více správy. Příjem z pronájmu musíte danit — ale odpočtete náklady.',
    steps: [
      'Zjistěte tržní nájemné na Sreality.cz nebo oslovte realitního makléře',
      'Porovnejte krátkodobý Airbnb vs dlouhodobý pronájem — kalkulačka na airbnb.com',
      'Sjednejte pojištění pronajímatele (Generali, Allianz)',
      'Připravte nájemní smlouvu — vzor zdarma na vzory.cz',
    ],
  },
  {
    id: 'digital',
    icon: '🖥️',
    title: 'Digitální produkt / online obsah',
    potential: '2 000–100 000 Kč/měs',
    timeToStart: '3–12 měsíců',
    difficulty: 'Náročné',
    desc: 'YouTube kanál, online kurz, e-book, newsletter nebo affiliate marketing. Vyžaduje čas a konzistenci na začátku — ale pak přináší pasivní příjem i když spíte. Nejlepší investice do sebe sama.',
    steps: [
      'Vyberte téma: kde se překrývá vaše vášeň + expertíza + tržní poptávka',
      'Začněte YouTube kanál nebo Substack newsletter v daném tématu',
      'Publikujte 1× týdně konzistentně po dobu 6 měsíců',
      'Po dosažení publika přidejte placený kurz (Teachable) nebo affiliatové odkazy',
    ],
  },
  {
    id: 'sharing',
    icon: '🚗',
    title: 'Sdílená ekonomika',
    potential: '2 000–8 000 Kč/měs',
    timeToStart: '1 týden',
    difficulty: 'Snadné',
    desc: 'Vydělávejte na věcech, které vlastníte a nevyužíváte naplno. Vaše auto stojí 23 hodin denně. Váš byt je prázdný. Vaše nářadí leží v garáži. Čas to změnit.',
    steps: [
      'Projděte byt a vylistujte nepotřebné věci na Vinted, Bazoš, FB Marketplace',
      'Zaregistrujte auto na HoppyCar.cz nebo Bolt Drive (vydělá 3 000–8 000 Kč/měs)',
      'Pronajměte parkovací místo přes Parkio.cz (1 000–3 000 Kč/měs passivně)',
      'Půjčujte nářadí přes půjcovna.cz nebo přímé inzeráty',
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toMonthly(amount: number, freq: Frequency): number {
  if (freq === 'annual') return amount / 12;
  if (freq === 'weekly') return amount * 52 / 12;
  return amount;
}

function formatCZK(n: number): string {
  return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 }).format(n);
}

function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function detectFrequency(raw: string): Frequency {
  const t = normalizeText(raw);
  if (/(tydne|tyden|tydenni|\/\s*tyden|\bweek|\bweekly)/.test(t)) return 'weekly';
  if (/(rocne|rocni|rok|\/\s*rok|\byear|\bannual)/.test(t)) return 'annual';
  return 'monthly';
}

function detectType(raw: string, amount: number): ItemType {
  const t = normalizeText(raw);
  if (/(prijem|income|vyplata|mzda|trzba|zisk|\+)/.test(t)) return 'income';
  if (/(vydaj|naklad|expense|platba|faktura|\-)/.test(t)) return 'expense';
  return amount < 0 ? 'expense' : 'income';
}

function detectCategory(name: string, raw: string, type: ItemType): string {
  const t = `${normalizeText(name)} ${normalizeText(raw)}`;
  if (type === 'income') {
    if (/(najem|pronajem|airbnb)/.test(t)) return 'Nájem';
    if (/(dividend|akcie|etf|urok)/.test(t)) return 'Dividendy';
    if (/(freelance|konzult|extern|osvc|zakazk)/.test(t)) return 'Freelance';
    if (/(podnik|prodej|trzba|e-?shop|faktur)/.test(t)) return 'Podnikání';
    if (/(plat|mzda|zamestnan|vyplata|bonus)/.test(t)) return 'Zaměstnání';
    return 'Ostatní';
  }
  if (/(internet|telefon|mobil|tarif|o2|vodafone|t-mobile|tmobile)/.test(t)) return 'Telefon/Internet';
  if (/(najem|hypotek|energie|elektr|plyn|voda|teplo|fond oprav|bydlen)/.test(t)) return 'Bydlení';
  if (/(benzin|nafta|mhd|doprava|auto|parkov|dialnic|servis|jizdne)/.test(t)) return 'Doprava';
  if (/(pojist)/.test(t)) return 'Pojištění';
  if (/(potrav|jidlo|restaur|obed|vecere|nakup)/.test(t)) return 'Jídlo';
  if (/(lekar|lek|zdravi|zubar|medicine|fitko)/.test(t)) return 'Zdraví';
  if (/(kino|netflix|spotify|zabav|hobby|hra)/.test(t)) return 'Zábava';
  if (/(kurz|skola|vzdel|kniha|certifik)/.test(t)) return 'Vzdělávání';
  return 'Ostatní';
}

function splitImportRows(input: string): string[] {
  const cleaned = input
    .replace(/\r/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  if (cleaned.length > 1) return cleaned;
  return input
    .split(/[;,]+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function parseImportLine(line: string): Omit<FinanceItem, 'id'> | null {
  const amountMatch = [...line.matchAll(/-?\d[\d\s.,]*/g)].pop();
  if (!amountMatch) return null;

  const rawAmount = amountMatch[0].replace(/\s/g, '').replace(',', '.');
  const amount = Math.abs(parseFloat(rawAmount));
  if (!Number.isFinite(amount) || amount <= 0) return null;

  const beforeAmount = line.slice(0, amountMatch.index ?? 0).trim();
  const afterAmount = line.slice((amountMatch.index ?? 0) + amountMatch[0].length).trim();
  const head = beforeAmount.split(/[-–—|]/)[0]?.trim();
  const name = (head && head.length >= 2 ? head : beforeAmount).replace(/^[\d.)\s-]+/, '').trim();
  if (!name) return null;

  const freq = detectFrequency(line);
  const type = detectType(line, parseFloat(rawAmount));
  const category = detectCategory(name, `${beforeAmount} ${afterAmount}`, type);

  return {
    name,
    amount,
    type,
    category,
    frequency: freq,
    notes: 'Import',
  };
}

function loadItems(): FinanceItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as FinanceItem[]) : DEFAULT_ITEMS;
  } catch { return DEFAULT_ITEMS; }
}

function saveItems(items: FinanceItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function loadJSON<T>(key: string, def: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : def;
  } catch { return def; }
}

function saveJSON<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ─── Blank form ───────────────────────────────────────────────────────────────

const BLANK: Omit<FinanceItem, 'id'> = {
  name: '', amount: 0, type: 'expense', category: 'Ostatní', frequency: 'monthly', notes: '',
};

// ─── Item Form ────────────────────────────────────────────────────────────────

function ItemForm({ initial, onSave, onCancel }: {
  initial: Omit<FinanceItem, 'id'>;
  onSave: (data: Omit<FinanceItem, 'id'>) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState(initial);
  const categories = form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const set = <K extends keyof typeof form>(k: K, v: typeof form[K]) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = () => {
    if (!form.name.trim()) { toast.error('Zadejte název'); return; }
    if (!form.amount || form.amount <= 0) { toast.error('Zadejte platnou částku'); return; }
    onSave(form);
  };

  return (
    <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 flex rounded-lg overflow-hidden border border-border">
          <button className={`flex-1 py-2 text-sm font-medium transition-colors ${form.type === 'income' ? 'bg-green-500 text-white' : 'bg-background hover:bg-muted'}`}
            onClick={() => { set('type', 'income'); set('category', 'Ostatní'); }}>Příjem</button>
          <button className={`flex-1 py-2 text-sm font-medium transition-colors ${form.type === 'expense' ? 'bg-red-500 text-white' : 'bg-background hover:bg-muted'}`}
            onClick={() => { set('type', 'expense'); set('category', 'Ostatní'); }}>Výdaj</button>
        </div>
        <div className="col-span-2">
          <label className="text-xs text-muted-foreground mb-1 block">Název</label>
          <Input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="např. Paušál O2" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Částka (Kč)</label>
          <Input type="number" value={form.amount || ''} onChange={(e) => set('amount', parseFloat(e.target.value) || 0)} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Frekvence</label>
          <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.frequency}
            onChange={(e) => set('frequency', e.target.value as Frequency)}>
            <option value="monthly">Měsíční</option>
            <option value="annual">Roční</option>
            <option value="weekly">Týdenní</option>
          </select>
        </div>
        <div className="col-span-2">
          <label className="text-xs text-muted-foreground mb-1 block">Kategorie</label>
          <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.category}
            onChange={(e) => set('category', e.target.value)}>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="col-span-2">
          <label className="text-xs text-muted-foreground mb-1 block">Poznámka</label>
          <Input value={form.notes ?? ''} onChange={(e) => set('notes', e.target.value)} placeholder="volitelně..." />
        </div>
      </div>
      <div className="flex gap-2 justify-end pt-1">
        <Button size="sm" variant="outline" onClick={onCancel}><X className="size-3.5 mr-1" />Zrušit</Button>
        <Button size="sm" onClick={handleSubmit}><Check className="size-3.5 mr-1" />Uložit</Button>
      </div>
    </div>
  );
}

// ─── Items Tab ────────────────────────────────────────────────────────────────

function ItemsTab({ items, setItems }: { items: FinanceItem[]; setItems: (i: FinanceItem[]) => void }) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<ItemType | 'all'>('all');
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState('');

  const save = (updated: FinanceItem[]) => { setItems(updated); saveItems(updated); };
  const addItem = (data: Omit<FinanceItem, 'id'>) => { save([...items, { ...data, id: uid() }]); setAdding(false); toast.success('Položka přidána'); };
  const editItem = (id: string, data: Omit<FinanceItem, 'id'>) => { save(items.map((i) => i.id === id ? { ...data, id } : i)); setEditingId(null); toast.success('Položka upravena'); };
  const deleteItem = (id: string) => { save(items.filter((i) => i.id !== id)); toast.success('Položka odstraněna'); };
  const filtered = filterType === 'all' ? items : items.filter((i) => i.type === filterType);
  const importItems = () => {
    const rows = splitImportRows(importText);
    if (rows.length === 0) {
      toast.error('Vložte řádky k importu');
      return;
    }
    const parsed = rows.map(parseImportLine).filter((item): item is Omit<FinanceItem, 'id'> => Boolean(item));
    if (parsed.length === 0) {
      toast.error('Nepodařilo se rozpoznat žádné položky');
      return;
    }
    const created = parsed.map((item) => ({ ...item, id: uid() }));
    save([...items, ...created]);
    setImportText('');
    setImportOpen(false);
    toast.success(`Importováno ${created.length} položek${created.length < rows.length ? `, přeskočeno ${rows.length - created.length}` : ''}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex rounded-lg overflow-hidden border border-border text-sm">
          {(['all', 'income', 'expense'] as const).map((t) => (
            <button key={t} onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 font-medium transition-colors ${filterType === t ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'}`}>
              {t === 'all' ? 'Vše' : t === 'income' ? 'Příjmy' : 'Výdaje'}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => { setImportOpen((v) => !v); setAdding(false); setEditingId(null); }}>
            Hromadný import
          </Button>
          <Button size="sm" onClick={() => { setAdding(true); setEditingId(null); setImportOpen(false); }}><Plus className="size-4" />Přidat položku</Button>
        </div>
      </div>
      {importOpen && (
        <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
          <div className="text-sm font-medium">Vložit více řádků (copy/paste)</div>
          <div className="text-xs text-muted-foreground">
            Formát například: <span className="font-mono">Pražská plynárenská - 900 Kč výdaj / měsíc</span> nebo <span className="font-mono">Iveta Kalendová - příjem 2000 Kč / měsíc</span>.
          </div>
          <textarea
            className="min-h-36 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder={'Pražská plynárenská - 900 Kč výdaj / měsíc\nIveta Kalendová - příjem 2000 Kč / měsíc'}
          />
          <div className="flex gap-2 justify-end">
            <Button size="sm" variant="outline" onClick={() => setImportText('')}>Vyčistit</Button>
            <Button size="sm" onClick={importItems}>Importovat řádky</Button>
          </div>
        </div>
      )}
      {adding && <ItemForm initial={{ ...BLANK }} onSave={addItem} onCancel={() => setAdding(false)} />}
      <div className="space-y-2">
        {filtered.length === 0 && <div className="text-center py-10 text-muted-foreground text-sm">Žádné položky.</div>}
        {filtered.map((item) =>
          editingId === item.id ? (
            <ItemForm key={item.id} initial={{ name: item.name, amount: item.amount, type: item.type, category: item.category, frequency: item.frequency, notes: item.notes }}
              onSave={(data) => editItem(item.id, data)} onCancel={() => setEditingId(null)} />
          ) : (
            <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-4 py-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`size-2 rounded-full shrink-0 ${item.type === 'income' ? 'bg-green-500' : 'bg-red-500'}`} />
                <div className="min-w-0">
                  <div className="font-medium text-sm truncate">{item.name}</div>
                  <div className="text-xs text-muted-foreground">{item.category} · {item.frequency === 'monthly' ? 'měsíčně' : item.frequency === 'annual' ? 'ročně' : 'týdně'}</div>
                  {item.notes && <div className="text-xs text-muted-foreground italic truncate">{item.notes}</div>}
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <div className={`font-semibold text-sm ${item.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {item.type === 'income' ? '+' : '-'}{formatCZK(item.amount)}
                  </div>
                  {item.frequency !== 'monthly' && (
                    <div className="text-xs text-muted-foreground">≈ {formatCZK(toMonthly(item.amount, item.frequency))}/měs</div>
                  )}
                </div>
                <button onClick={() => { setEditingId(item.id); setAdding(false); }} className="text-muted-foreground hover:text-foreground p-1"><Pencil className="size-3.5" /></button>
                <button onClick={() => deleteItem(item.id)} className="text-muted-foreground hover:text-red-600 p-1"><Trash2 className="size-3.5" /></button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}

// ─── Savings / Emergency Fund Widget ─────────────────────────────────────────

function SavingsWidget({ monthlyExpense, savings, onSavingsChange }: {
  monthlyExpense: number;
  savings: number;
  onSavingsChange: (v: number) => void;
}) {
  const [targetMonths, setTargetMonths] = useState(6);
  const [inflation, setInflation] = useState(3.5);
  const [saved, setSaved] = useState(false);

  const updateSavings = (v: number) => {
    onSavingsChange(v);
    saveJSON(SAVINGS_KEY, v);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const target = monthlyExpense * targetMonths;
  const pct = target > 0 ? Math.min((savings / target) * 100, 100) : 0;
  const runwayMonths = monthlyExpense > 0 ? savings / monthlyExpense : 0;
  const runwayDays = runwayMonths * 30.44;
  const realValueAfter1Year = savings * Math.pow(1 - inflation / 100, 1);
  const realValueAfter3Years = savings * Math.pow(1 - inflation / 100, 3);
  const realValueAfter5Years = savings * Math.pow(1 - inflation / 100, 5);
  const lossPct1Y = ((savings - realValueAfter1Year) / savings * 100);

  const statusColor = pct >= 100 ? 'text-green-600' : pct >= 50 ? 'text-yellow-600' : 'text-red-600';
  const statusLabel = pct >= 100 ? '✓ Plně zajištěn' : pct >= 50 ? '~ Částečně zajištěn' : '⚠ Nedostatečný';

  return (
    <div className="space-y-4">
      {/* Savings input + runway */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2 pt-4 px-5">
            <span className="text-sm font-semibold flex items-center gap-2"><Shield className="size-4 text-blue-500" /> Nouzový fond & Runway</span>
          </CardHeader>
          <CardContent className="px-5 pb-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 flex items-center gap-2">
                  Aktuální úspory (Kč)
                  {saved && <span className="text-green-600 font-medium">✓ Uloženo</span>}
                </label>
                <Input type="number" value={savings || ''} onChange={(e) => updateSavings(parseFloat(e.target.value) || 0)} placeholder="120 000" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Cílový horizont (měsíce)</label>
                <div className="flex gap-1">
                  {[3, 6, 9, 12].map((m) => (
                    <button key={m} onClick={() => setTargetMonths(m)}
                      className={`flex-1 py-2 text-xs rounded border font-medium transition-colors ${targetMonths === m ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border hover:bg-muted'}`}>
                      {m}m
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className={statusColor + ' font-medium'}>{statusLabel}</span>
                <span className="text-muted-foreground">{formatCZK(savings)} / {formatCZK(target)}</span>
              </div>
              <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                <div className={`h-3 rounded-full transition-all ${pct >= 100 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-400' : 'bg-red-400'}`}
                  style={{ width: `${pct}%` }} />
              </div>
              <div className="text-xs text-muted-foreground mt-1">{pct.toFixed(0)} % cíle ({targetMonths} měsíců výdajů)</div>
            </div>

            {/* Runway cards */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className={`rounded-lg p-3 text-center border ${runwayMonths >= 6 ? 'bg-green-50 border-green-100' : runwayMonths >= 3 ? 'bg-yellow-50 border-yellow-100' : 'bg-red-50 border-red-100'}`}>
                <div className="text-xs text-muted-foreground mb-0.5">Bez příjmu vydržím</div>
                <div className={`text-xl font-bold ${runwayMonths >= 6 ? 'text-green-700' : runwayMonths >= 3 ? 'text-yellow-700' : 'text-red-700'}`}>
                  {runwayMonths.toFixed(1)} měs
                </div>
                <div className="text-xs text-muted-foreground">{Math.round(runwayDays)} dní</div>
              </div>
              <div className="rounded-lg p-3 text-center border bg-muted/30">
                <div className="text-xs text-muted-foreground mb-0.5">Chybí do cíle</div>
                <div className="text-xl font-bold text-foreground">
                  {savings >= target ? '—' : formatCZK(target - savings)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {savings >= target ? 'Cíl splněn 🎉' : `~${Math.ceil((target - savings) / Math.max(monthlyExpense * 0.2, 1))} měs spoření`}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inflation impact on savings */}
        <Card>
          <CardHeader className="pb-2 pt-4 px-5">
            <span className="text-sm font-semibold flex items-center gap-2"><TrendingDown className="size-4 text-orange-500" /> Inflace & reálná hodnota úspor</span>
          </CardHeader>
          <CardContent className="px-5 pb-4 space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Roční inflace (%)</label>
              <div className="flex gap-1">
                {[2, 3.5, 5, 8].map((r) => (
                  <button key={r} onClick={() => setInflation(r)}
                    className={`flex-1 py-2 text-xs rounded border font-medium transition-colors ${inflation === r ? 'bg-orange-500 text-white border-orange-500' : 'bg-background border-border hover:bg-muted'}`}>
                    {r} %
                  </button>
                ))}
              </div>
              <Input className="mt-2" type="number" step={0.1} value={inflation} onChange={(e) => setInflation(parseFloat(e.target.value) || 0)} />
            </div>

            {savings > 0 ? (
              <div className="space-y-1.5">
                {[
                  { label: 'Za 1 rok', val: realValueAfter1Year },
                  { label: 'Za 3 roky', val: realValueAfter3Years },
                  { label: 'Za 5 let', val: realValueAfter5Years },
                ].map(({ label, val }) => (
                  <div key={label} className="flex items-center justify-between rounded bg-muted/40 px-3 py-2">
                    <span className="text-xs text-muted-foreground">{label}</span>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-orange-600">{formatCZK(val)}</span>
                      <span className="text-xs text-muted-foreground ml-2">({(((val - savings) / savings) * 100).toFixed(1)} %)</span>
                    </div>
                  </div>
                ))}
                <div className="text-xs text-muted-foreground pt-1 flex items-start gap-1.5">
                  <Info className="size-3.5 shrink-0 mt-0.5" />
                  Při inflaci {inflation} % ztratí vaše úspory za rok reálně {formatCZK(savings - realValueAfter1Year)} ({lossPct1Y.toFixed(1)} %).
                  Pro překonání inflace musí úspory vynášet více než {inflation} % p.a.
                </div>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">Zadejte výši úspor výše.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Financial Health Score ───────────────────────────────────────────────────

function HealthScore({ monthlyIncome, monthlyExpense, savings }: {
  monthlyIncome: number; monthlyExpense: number; savings: number;
}) {
  const netMonthly = monthlyIncome - monthlyExpense;
  const savingsRate = monthlyIncome > 0 ? (netMonthly / monthlyIncome) * 100 : 0;
  const emergencyMonths = monthlyExpense > 0 ? savings / monthlyExpense : 0;
  const investRate = monthlyIncome > 0 ? Math.max(0, netMonthly / monthlyIncome) * 100 : 0;

  const metrics = [
    {
      label: 'Míra úspor', value: savingsRate, unit: '%',
      target: 20, good: 20, warn: 10,
      desc: 'Cíl: 20 %+. Aktuálně: ' + savingsRate.toFixed(1) + ' %',
      score: savingsRate >= 20 ? 25 : savingsRate >= 10 ? 15 : savingsRate >= 0 ? 8 : 0,
    },
    {
      label: 'Nouzový fond', value: emergencyMonths, unit: ' měs',
      target: 6, good: 6, warn: 3,
      desc: 'Cíl: 6 měsíců výdajů. Aktuálně: ' + emergencyMonths.toFixed(1) + ' měs',
      score: emergencyMonths >= 6 ? 25 : emergencyMonths >= 3 ? 15 : emergencyMonths >= 1 ? 8 : 0,
    },
    {
      label: 'Kladný cashflow', value: netMonthly, unit: ' Kč',
      target: 1, good: 5000, warn: 0,
      desc: 'Kladný měsíční přebytek',
      score: netMonthly >= 5000 ? 25 : netMonthly >= 1 ? 15 : netMonthly >= 0 ? 5 : 0,
    },
    {
      label: 'Investiční sazba', value: investRate, unit: '%',
      target: 15, good: 15, warn: 5,
      desc: 'Cíl: 15 %+ příjmu do investic',
      score: investRate >= 15 ? 25 : investRate >= 5 ? 15 : investRate >= 0 ? 5 : 0,
    },
  ];

  const totalScore = metrics.reduce((s, m) => s + m.score, 0);
  const scoreColor = totalScore >= 80 ? 'text-green-600' : totalScore >= 50 ? 'text-yellow-600' : 'text-red-600';
  const scoreLabel = totalScore >= 80 ? 'Výborné' : totalScore >= 60 ? 'Dobré' : totalScore >= 40 ? 'Průměrné' : 'Potřebuje pozornost';

  if (monthlyIncome === 0 && monthlyExpense === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-2 pt-4 px-5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold flex items-center gap-2"><Target className="size-4 text-indigo-500" /> Finanční zdraví</span>
          <div className="flex items-center gap-2">
            <span className={`text-2xl font-bold ${scoreColor}`}>{totalScore}</span>
            <span className="text-xs text-muted-foreground">/ 100</span>
            <Badge variant="outline" className={`text-xs ${scoreColor}`}>{scoreLabel}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-4">
        <div className="h-2 w-full bg-muted rounded-full overflow-hidden mb-4">
          <div className={`h-2 rounded-full transition-all ${totalScore >= 80 ? 'bg-green-500' : totalScore >= 50 ? 'bg-yellow-400' : 'bg-red-400'}`}
            style={{ width: `${totalScore}%` }} />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {metrics.map((m) => {
            const isGood = m.score >= 20;
            const isWarn = m.score >= 10 && m.score < 20;
            return (
              <div key={m.label} className={`rounded-lg border p-3 ${isGood ? 'bg-green-50 border-green-100' : isWarn ? 'bg-yellow-50 border-yellow-100' : 'bg-red-50 border-red-100'}`}>
                <div className="flex items-center gap-1 mb-1">
                  {isGood ? <CheckCircle2 className="size-3.5 text-green-600" /> : isWarn ? <AlertTriangle className="size-3.5 text-yellow-600" /> : <AlertTriangle className="size-3.5 text-red-600" />}
                  <span className="text-xs font-medium">{m.label}</span>
                </div>
                <div className={`text-lg font-bold ${isGood ? 'text-green-700' : isWarn ? 'text-yellow-700' : 'text-red-700'}`}>
                  {m.unit === ' Kč' ? formatCZK(m.value) : m.value.toFixed(1) + m.unit}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{m.desc}</div>
                <div className="text-xs font-semibold mt-1">{m.score} / 25 bodů</div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab({ items, savings, onSavingsChange }: { items: FinanceItem[]; savings: number; onSavingsChange: (v: number) => void }) {
  const monthlyIncome = useMemo(
    () => items.filter((i) => i.type === 'income').reduce((s, i) => s + toMonthly(i.amount, i.frequency), 0), [items]);
  const monthlyExpense = useMemo(
    () => items.filter((i) => i.type === 'expense').reduce((s, i) => s + toMonthly(i.amount, i.frequency), 0), [items]);
  const netMonthly = monthlyIncome - monthlyExpense;
  const netAnnual = netMonthly * 12;
  const savingsRate = monthlyIncome > 0 ? (netMonthly / monthlyIncome) * 100 : 0;

  const expenseByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    items.filter((i) => i.type === 'expense').forEach((i) => { map[i.category] = (map[i.category] ?? 0) + toMonthly(i.amount, i.frequency); });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [items]);

  const incomeByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    items.filter((i) => i.type === 'income').forEach((i) => { map[i.category] = (map[i.category] ?? 0) + toMonthly(i.amount, i.frequency); });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [items]);

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="pt-5 pb-4 px-5">
          <div className="flex items-center gap-2 mb-1"><TrendingUp className="size-4 text-green-500" /><span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Příjmy / měs</span></div>
          <div className="text-2xl font-bold text-green-600">{formatCZK(monthlyIncome)}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{formatCZK(monthlyIncome * 12)} / rok</div>
        </CardContent></Card>

        <Card><CardContent className="pt-5 pb-4 px-5">
          <div className="flex items-center gap-2 mb-1"><TrendingDown className="size-4 text-red-500" /><span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Výdaje / měs</span></div>
          <div className="text-2xl font-bold text-red-600">{formatCZK(monthlyExpense)}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{formatCZK(monthlyExpense * 12)} / rok</div>
        </CardContent></Card>

        <Card><CardContent className="pt-5 pb-4 px-5">
          <div className="flex items-center gap-2 mb-1"><Wallet className={`size-4 ${netMonthly >= 0 ? 'text-blue-500' : 'text-orange-500'}`} /><span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Cashflow / měs</span></div>
          <div className={`text-2xl font-bold ${netMonthly >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>{netMonthly >= 0 ? '+' : ''}{formatCZK(netMonthly)}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{formatCZK(netAnnual)} / rok</div>
        </CardContent></Card>

        <Card><CardContent className="pt-5 pb-4 px-5">
          <div className="flex items-center gap-2 mb-1"><PiggyBank className="size-4 text-purple-500" /><span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Míra úspor</span></div>
          <div className={`text-2xl font-bold ${savingsRate >= 20 ? 'text-purple-600' : 'text-orange-600'}`}>{savingsRate.toFixed(1)} %</div>
          <div className="text-xs text-muted-foreground mt-0.5">{savingsRate >= 20 ? '✓ Dobrá' : savingsRate >= 10 ? '~ Průměr' : '⚠ Nízká'}</div>
        </CardContent></Card>
      </div>

      {/* Savings & Emergency Fund */}
      <SavingsWidget monthlyExpense={monthlyExpense} savings={savings} onSavingsChange={onSavingsChange} />

      {/* Health score */}
      <HealthScore monthlyIncome={monthlyIncome} monthlyExpense={monthlyExpense} savings={savings} />

      {/* Category breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2 pt-4 px-5"><span className="text-sm font-semibold flex items-center gap-2"><TrendingDown className="size-4 text-red-500" /> Výdaje podle kategorie</span></CardHeader>
          <CardContent className="px-5 pb-4">
            {expenseByCategory.length === 0 ? <div className="text-xs text-muted-foreground">Žádné výdaje.</div> : (
              <div className="space-y-2">
                {expenseByCategory.map(([cat, amount]) => (
                  <div key={cat} className="flex items-center gap-2">
                    <div className="text-xs w-36 shrink-0 truncate text-muted-foreground">{cat}</div>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-2 bg-red-400 rounded-full" style={{ width: `${monthlyExpense > 0 ? (amount / monthlyExpense) * 100 : 0}%` }} />
                    </div>
                    <div className="text-xs font-medium w-24 text-right shrink-0">{formatCZK(amount)}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 pt-4 px-5"><span className="text-sm font-semibold flex items-center gap-2"><TrendingUp className="size-4 text-green-500" /> Příjmy podle kategorie</span></CardHeader>
          <CardContent className="px-5 pb-4">
            {incomeByCategory.length === 0 ? <div className="text-xs text-muted-foreground">Žádné příjmy.</div> : (
              <div className="space-y-2">
                {incomeByCategory.map(([cat, amount]) => (
                  <div key={cat} className="flex items-center gap-2">
                    <div className="text-xs w-36 shrink-0 truncate text-muted-foreground">{cat}</div>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-2 bg-green-400 rounded-full" style={{ width: `${monthlyIncome > 0 ? (amount / monthlyIncome) * 100 : 0}%` }} />
                    </div>
                    <div className="text-xs font-medium w-24 text-right shrink-0">{formatCZK(amount)}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 12-month projection */}
      <Card>
        <CardHeader className="pb-2 pt-4 px-5"><span className="text-sm font-semibold">Projekce na 12 měsíců</span></CardHeader>
        <CardContent className="px-5 pb-4 overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="[&>th]:pb-1 [&>th]:text-left [&>th]:font-medium [&>th]:text-muted-foreground border-b border-border">
                <th>Měsíc</th><th className="text-right">Příjmy</th><th className="text-right">Výdaje</th><th className="text-right">Cashflow</th><th className="text-right">Kumulativně</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 12 }, (_, i) => {
                const d = new Date(new Date().getFullYear(), new Date().getMonth() + i);
                const label = d.toLocaleString('cs-CZ', { month: 'short', year: '2-digit' });
                const cum = netMonthly * (i + 1);
                return (
                  <tr key={i} className="[&>td]:py-1.5 [&>td]:border-b [&>td]:border-border/50">
                    <td className="text-muted-foreground">{label}</td>
                    <td className="text-right text-green-600">{formatCZK(monthlyIncome)}</td>
                    <td className="text-right text-red-600">{formatCZK(monthlyExpense)}</td>
                    <td className={`text-right font-medium ${netMonthly >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>{netMonthly >= 0 ? '+' : ''}{formatCZK(netMonthly)}</td>
                    <td className={`text-right font-semibold ${cum >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCZK(cum)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Net Worth Tracker ────────────────────────────────────────────────────────

export function NetWorthTracker() {
  const [items, setItems] = useState<NetWorthItem[]>(() => loadJSON<NetWorthItem[]>(NETWORTH_KEY, []));
  const [open, setOpen] = useState(true);
  const [adding, setAdding] = useState<'asset' | 'liability' | null>(null);
  const [form, setForm] = useState({ name: '', value: 0, category: 'Hotovost', type: 'asset' as 'asset' | 'liability' });

  const ASSET_CATS = ['Hotovost', 'Spořicí účet', 'Investice', 'Nemovitost', 'Vozidlo', 'Ostatní'];
  const LIAB_CATS  = ['Hypotéka', 'Spotřebitelský úvěr', 'Kreditní karta', 'Ostatní'];

  const save = (updated: NetWorthItem[]) => { setItems(updated); saveJSON(NETWORTH_KEY, updated); };
  const deleteItem = (id: string) => save(items.filter((i) => i.id !== id));
  const addItem = () => {
    if (!form.name || form.value <= 0) { toast.error('Vyplňte název a hodnotu'); return; }
    save([...items, { ...form, id: uid() }]);
    setForm({ name: '', value: 0, category: 'Hotovost', type: 'asset' });
    setAdding(null);
  };

  const totalAssets = items.filter((i) => i.type === 'asset').reduce((s, i) => s + i.value, 0);
  const totalLiabilities = items.filter((i) => i.type === 'liability').reduce((s, i) => s + i.value, 0);
  const netWorth = totalAssets - totalLiabilities;

  return (
    <Card>
      <CardHeader className="pb-2 pt-4 px-5 cursor-pointer" onClick={() => setOpen((o) => !o)}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold flex items-center gap-2"><Wallet className="size-4 text-violet-500" /> Čistá hodnota majetku (Net Worth)</span>
          <div className="flex items-center gap-3">
            <span className={`text-sm font-bold ${netWorth >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCZK(netWorth)}</span>
            {open ? <ChevronUp className="size-4 text-muted-foreground" /> : <ChevronDown className="size-4 text-muted-foreground" />}
          </div>
        </div>
      </CardHeader>
      {open && (
        <CardContent className="px-5 pb-5 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-green-50 border border-green-100 p-3 text-center">
              <div className="text-xs text-muted-foreground mb-1">Aktiva</div>
              <div className="font-bold text-green-700">{formatCZK(totalAssets)}</div>
            </div>
            <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-center">
              <div className="text-xs text-muted-foreground mb-1">Závazky</div>
              <div className="font-bold text-red-700">{formatCZK(totalLiabilities)}</div>
            </div>
            <div className={`rounded-lg border p-3 text-center ${netWorth >= 0 ? 'bg-blue-50 border-blue-100' : 'bg-orange-50 border-orange-100'}`}>
              <div className="text-xs text-muted-foreground mb-1">Čistá hodnota</div>
              <div className={`font-bold ${netWorth >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>{formatCZK(netWorth)}</div>
            </div>
          </div>

          {/* Assets */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">Aktiva</span>
              <button onClick={() => setAdding('asset')} className="text-xs text-green-600 hover:underline flex items-center gap-1"><Plus className="size-3" />Přidat</button>
            </div>
            {adding === 'asset' && (
              <div className="flex gap-2 mb-2 flex-wrap">
                <Input className="flex-1 min-w-32" placeholder="Název" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, type: 'asset' }))} />
                <Input className="w-32" type="number" placeholder="Hodnota Kč" value={form.value || ''} onChange={(e) => setForm((f) => ({ ...f, value: +e.target.value }))} />
                <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                  {ASSET_CATS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <Button size="sm" onClick={addItem}>Přidat</Button>
                <Button size="sm" variant="outline" onClick={() => setAdding(null)}>Zrušit</Button>
              </div>
            )}
            {items.filter((i) => i.type === 'asset').length === 0
              ? <div className="text-xs text-muted-foreground">Žádná aktiva.</div>
              : items.filter((i) => i.type === 'asset').map((item) => (
                <div key={item.id} className="flex justify-between items-center py-1.5 border-b border-border/40 last:border-0">
                  <div>
                    <span className="text-sm font-medium">{item.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">{item.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-green-600">{formatCZK(item.value)}</span>
                    <button onClick={() => deleteItem(item.id)} className="text-muted-foreground hover:text-red-500"><Trash2 className="size-3.5" /></button>
                  </div>
                </div>
              ))
            }
          </div>

          {/* Liabilities */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-red-700 uppercase tracking-wide">Závazky</span>
              <button onClick={() => setAdding('liability')} className="text-xs text-red-600 hover:underline flex items-center gap-1"><Plus className="size-3" />Přidat</button>
            </div>
            {adding === 'liability' && (
              <div className="flex gap-2 mb-2 flex-wrap">
                <Input className="flex-1 min-w-32" placeholder="Název" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, type: 'liability' }))} />
                <Input className="w-32" type="number" placeholder="Zůstatek Kč" value={form.value || ''} onChange={(e) => setForm((f) => ({ ...f, value: +e.target.value }))} />
                <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                  {LIAB_CATS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <Button size="sm" variant="destructive" onClick={addItem}>Přidat</Button>
                <Button size="sm" variant="outline" onClick={() => setAdding(null)}>Zrušit</Button>
              </div>
            )}
            {items.filter((i) => i.type === 'liability').length === 0
              ? <div className="text-xs text-muted-foreground">Žádné závazky.</div>
              : items.filter((i) => i.type === 'liability').map((item) => (
                <div key={item.id} className="flex justify-between items-center py-1.5 border-b border-border/40 last:border-0">
                  <div>
                    <span className="text-sm font-medium">{item.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">{item.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-red-600">{formatCZK(item.value)}</span>
                    <button onClick={() => deleteItem(item.id)} className="text-muted-foreground hover:text-red-500"><Trash2 className="size-3.5" /></button>
                  </div>
                </div>
              ))
            }
          </div>
        </CardContent>
      )}
    </Card>
  );
}

// ─── FIRE Calculator ──────────────────────────────────────────────────────────

function FIRECalculator() {
  const [currentAge, setCurrentAge] = useState(30);
  const [currentSavings, setCurrentSavings] = useState(500000);
  const [monthlyExpenseRetire, setMonthlyExpenseRetire] = useState(30000);
  const [monthlyContrib, setMonthlyContrib] = useState(15000);
  const [returnRate, setReturnRate] = useState(7);
  const [swr, setSwr] = useState(4);
  const [open, setOpen] = useState(true);

  const result = useMemo(() => {
    const annualExpenses = monthlyExpenseRetire * 12;
    const fireNumber = annualExpenses / (swr / 100);
    const r = returnRate / 100 / 12;
    let portfolio = currentSavings;
    let months = 0;
    while (portfolio < fireNumber && months < 600) {
      portfolio = portfolio * (1 + r) + monthlyContrib;
      months++;
    }
    const yearsToFire = months / 12;
    const fireAge = currentAge + yearsToFire;

    // Year-by-year projection
    const rows: { year: number; portfolio: number }[] = [];
    let p = currentSavings;
    for (let y = 1; y <= Math.min(Math.ceil(yearsToFire) + 5, 40); y++) {
      for (let m = 0; m < 12; m++) { p = p * (1 + r) + monthlyContrib; }
      rows.push({ year: currentAge + y, portfolio: p });
    }
    return { fireNumber, yearsToFire, fireAge, rows, annualExpenses, reachedFire: portfolio >= fireNumber };
  }, [currentAge, currentSavings, monthlyExpenseRetire, monthlyContrib, returnRate, swr]);

  return (
    <Card>
      <CardHeader className="pb-2 pt-4 px-5 cursor-pointer" onClick={() => setOpen((o) => !o)}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold flex items-center gap-2"><Flame className="size-4 text-red-500" /> FIRE Kalkulačka — Finanční nezávislost</span>
          {open ? <ChevronUp className="size-4 text-muted-foreground" /> : <ChevronDown className="size-4 text-muted-foreground" />}
        </div>
      </CardHeader>
      {open && (
        <CardContent className="px-5 pb-5 space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Aktuální věk</label>
              <Input type="number" value={currentAge} onChange={(e) => setCurrentAge(+e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Aktuální portfolio (Kč)</label>
              <Input type="number" value={currentSavings} onChange={(e) => setCurrentSavings(+e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Měsíční výdaje v důchodu (Kč)</label>
              <Input type="number" value={monthlyExpenseRetire} onChange={(e) => setMonthlyExpenseRetire(+e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Měsíční investice (Kč)</label>
              <Input type="number" value={monthlyContrib} onChange={(e) => setMonthlyContrib(+e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Očekávaný výnos (% p.a.)</label>
              <Input type="number" step={0.5} value={returnRate} onChange={(e) => setReturnRate(+e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Safe Withdrawal Rate (%)</label>
              <div className="flex gap-1">
                {[3, 3.5, 4, 5].map((r) => (
                  <button key={r} onClick={() => setSwr(r)}
                    className={`flex-1 py-2 text-xs rounded border font-medium ${swr === r ? 'bg-red-500 text-white border-red-500' : 'bg-background border-border hover:bg-muted'}`}>
                    {r}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-center">
              <div className="text-xs text-muted-foreground mb-1">FIRE číslo</div>
              <div className="font-bold text-red-700 text-lg">{formatCZK(result.fireNumber)}</div>
              <div className="text-xs text-muted-foreground">při SWR {swr} %</div>
            </div>
            <div className={`rounded-lg border p-3 text-center ${result.reachedFire ? 'bg-green-50 border-green-100' : 'bg-orange-50 border-orange-100'}`}>
              <div className="text-xs text-muted-foreground mb-1">Roky do FIRE</div>
              <div className={`font-bold text-lg ${result.reachedFire ? 'text-green-700' : 'text-orange-700'}`}>
                {result.reachedFire ? result.yearsToFire.toFixed(1) : '> 50'} let
              </div>
            </div>
            <div className="rounded-lg bg-purple-50 border border-purple-100 p-3 text-center">
              <div className="text-xs text-muted-foreground mb-1">FIRE věk</div>
              <div className="font-bold text-purple-700 text-lg">{result.reachedFire ? Math.round(result.fireAge) : '?'} let</div>
            </div>
            <div className="rounded-lg bg-blue-50 border border-blue-100 p-3 text-center">
              <div className="text-xs text-muted-foreground mb-1">Roční výdaje v důchodu</div>
              <div className="font-bold text-blue-700 text-lg">{formatCZK(result.annualExpenses)}</div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-xs border-collapse">
              <thead className="bg-muted/50">
                <tr className="[&>th]:px-3 [&>th]:py-2 [&>th]:text-left [&>th]:font-medium [&>th]:text-muted-foreground">
                  <th>Věk</th><th className="text-right">Portfolio</th><th className="text-right">% FIRE čísla</th><th className="text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((r) => {
                  const pct = (r.portfolio / result.fireNumber) * 100;
                  return (
                    <tr key={r.year} className="[&>td]:px-3 [&>td]:py-1.5 [&>td]:border-t [&>td]:border-border/50">
                      <td>{r.year}</td>
                      <td className="text-right font-medium">{formatCZK(r.portfolio)}</td>
                      <td className="text-right">{pct.toFixed(0)} %</td>
                      <td className="text-right">{pct >= 100 ? <span className="text-green-600 font-semibold">🔥 FIRE!</span> : <span className="text-muted-foreground">{(100 - pct).toFixed(0)} % zbývá</span>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground flex gap-1.5 items-start">
            <Info className="size-3.5 shrink-0 mt-0.5" />
            FIRE číslo = roční výdaje ÷ SWR. Pravidlo 4 % (SWR) vychází z Trinity Study — portfolio vydrží 30+ let při 4% ročním výběru.
          </p>
        </CardContent>
      )}
    </Card>
  );
}

// ─── Mortgage Calculator ──────────────────────────────────────────────────────

function MortgageCalculator() {
  const [price, setPrice] = useState(5000000);
  const [down, setDown] = useState(1000000);
  const [rate, setRate] = useState(5.5);
  const [years, setYears] = useState(30);
  const [extra, setExtra] = useState(0);
  const [open, setOpen] = useState(true);

  const result = useMemo(() => {
    const loan = price - down;
    const mr = rate / 100 / 12;
    const n = years * 12;
    const payment = loan > 0 && mr > 0 ? loan * mr / (1 - Math.pow(1 + mr, -n)) : loan / n;
    const totalPaid = payment * n;
    const totalInterest = totalPaid - loan;

    // With extra payment
    let balance = loan;
    let monthsExtra = 0;
    let totalPaidExtra = 0;
    while (balance > 0 && monthsExtra < n) {
      const interestPart = balance * mr;
      const principalPart = Math.min(payment - interestPart + extra, balance);
      balance -= principalPart;
      totalPaidExtra += payment + extra;
      monthsExtra++;
    }
    const savedInterest = totalPaid - totalPaidExtra;

    // Amortization first 24 months
    const schedule: { month: number; payment: number; interest: number; principal: number; balance: number }[] = [];
    let bal = loan;
    for (let m = 1; m <= Math.min(24, n); m++) {
      const int = bal * mr;
      const prin = payment - int;
      bal -= prin;
      schedule.push({ month: m, payment, interest: int, principal: prin, balance: Math.max(bal, 0) });
    }
    return { loan, payment, totalPaid, totalInterest, monthsExtra, savedInterest, schedule };
  }, [price, down, rate, years, extra]);

  return (
    <Card>
      <CardHeader className="pb-2 pt-4 px-5 cursor-pointer" onClick={() => setOpen((o) => !o)}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold flex items-center gap-2"><Building className="size-4 text-blue-600" /> Hypotéka kalkulačka</span>
          {open ? <ChevronUp className="size-4 text-muted-foreground" /> : <ChevronDown className="size-4 text-muted-foreground" />}
        </div>
      </CardHeader>
      {open && (
        <CardContent className="px-5 pb-5 space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Cena nemovitosti (Kč)</label>
              <Input type="number" value={price} onChange={(e) => setPrice(+e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Vlastní vklad (Kč)</label>
              <Input type="number" value={down} onChange={(e) => setDown(+e.target.value)} />
              <div className="text-xs text-muted-foreground mt-0.5">LTV: {price > 0 ? ((result.loan / price) * 100).toFixed(0) : 0} %</div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Úroková sazba (% p.a.)</label>
              <Input type="number" step={0.1} value={rate} onChange={(e) => setRate(+e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Splatnost (let)</label>
              <div className="flex gap-1">
                {[15, 20, 25, 30].map((y) => (
                  <button key={y} onClick={() => setYears(y)}
                    className={`flex-1 py-2 text-xs rounded border font-medium ${years === y ? 'bg-blue-600 text-white border-blue-600' : 'bg-background border-border hover:bg-muted'}`}>
                    {y}r
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Mimořádná splátka / měs (Kč)</label>
              <Input type="number" value={extra} onChange={(e) => setExtra(+e.target.value)} placeholder="0" />
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="rounded-lg bg-blue-50 border border-blue-100 p-3 text-center">
              <div className="text-xs text-muted-foreground mb-1">Měsíční splátka</div>
              <div className="font-bold text-blue-700 text-lg">{formatCZK(result.payment)}</div>
            </div>
            <div className="rounded-lg bg-orange-50 border border-orange-100 p-3 text-center">
              <div className="text-xs text-muted-foreground mb-1">Celkové úroky</div>
              <div className="font-bold text-orange-700 text-lg">{formatCZK(result.totalInterest)}</div>
            </div>
            <div className="rounded-lg bg-gray-50 border border-gray-200 p-3 text-center">
              <div className="text-xs text-muted-foreground mb-1">Celkem zaplaceno</div>
              <div className="font-bold text-gray-700 text-lg">{formatCZK(result.totalPaid)}</div>
            </div>
            {extra > 0 && (
              <div className="rounded-lg bg-green-50 border border-green-100 p-3 text-center">
                <div className="text-xs text-muted-foreground mb-1">Úspora mimořád. splátkou</div>
                <div className="font-bold text-green-700 text-lg">{formatCZK(result.savedInterest)}</div>
                <div className="text-xs text-muted-foreground">Splatno za {(result.monthsExtra / 12).toFixed(1)} let</div>
              </div>
            )}
          </div>

          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-xs border-collapse">
              <thead className="bg-muted/50">
                <tr className="[&>th]:px-3 [&>th]:py-2 [&>th]:text-left [&>th]:font-medium [&>th]:text-muted-foreground">
                  <th>Měsíc</th><th className="text-right">Splátka</th><th className="text-right">Úrok</th><th className="text-right">Jistina</th><th className="text-right">Zůstatek</th>
                </tr>
              </thead>
              <tbody>
                {result.schedule.map((r) => (
                  <tr key={r.month} className="[&>td]:px-3 [&>td]:py-1.5 [&>td]:border-t [&>td]:border-border/50">
                    <td>{r.month}</td>
                    <td className="text-right">{formatCZK(r.payment)}</td>
                    <td className="text-right text-orange-600">{formatCZK(r.interest)}</td>
                    <td className="text-right text-green-600">{formatCZK(r.principal)}</td>
                    <td className="text-right font-medium">{formatCZK(r.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="text-xs text-muted-foreground px-3 py-2">Zobrazeno prvních 24 měsíců ze {years * 12} celkem.</div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

// ─── Inflation Calculator ─────────────────────────────────────────────────────

function InflationCalculator() {
  const [amount, setAmount] = useState(1000000);
  const [inflation, setInflation] = useState(3.5);
  const [years, setYears] = useState(10);
  const [returnRate, setReturnRate] = useState(7);
  const [open, setOpen] = useState(true);

  const rows = useMemo(() => Array.from({ length: years }, (_, i) => {
    const y = i + 1;
    const nominal = amount * Math.pow(1 + returnRate / 100, y);
    const real = amount * Math.pow(1 + (returnRate - inflation) / 100, y);
    const savings = amount * Math.pow(1 + 0.04, y); // spořicí účet 4%
    const cash = amount * Math.pow(1 - inflation / 100, y);
    return { year: y, nominal, real, savings, cash };
  }), [amount, inflation, years, returnRate]);

  return (
    <Card>
      <CardHeader className="pb-2 pt-4 px-5 cursor-pointer" onClick={() => setOpen((o) => !o)}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold flex items-center gap-2"><TrendingDown className="size-4 text-orange-500" /> Inflační kalkulačka — kupní síla</span>
          {open ? <ChevronUp className="size-4 text-muted-foreground" /> : <ChevronDown className="size-4 text-muted-foreground" />}
        </div>
      </CardHeader>
      {open && (
        <CardContent className="px-5 pb-5 space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Částka (Kč)</label>
              <Input type="number" value={amount} onChange={(e) => setAmount(+e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Inflace (% p.a.)</label>
              <Input type="number" step={0.1} value={inflation} onChange={(e) => setInflation(+e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Výnos investice (% p.a.)</label>
              <Input type="number" step={0.5} value={returnRate} onChange={(e) => setReturnRate(+e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Horizont (let)</label>
              <Input type="number" value={years} min={1} max={40} onChange={(e) => setYears(+e.target.value)} />
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-xs border-collapse">
              <thead className="bg-muted/50">
                <tr className="[&>th]:px-3 [&>th]:py-2 [&>th]:text-left [&>th]:font-medium [&>th]:text-muted-foreground">
                  <th>Rok</th>
                  <th className="text-right text-green-700">Investice ({returnRate}%)</th>
                  <th className="text-right text-blue-700">Reálná hodnota</th>
                  <th className="text-right text-yellow-700">Spořicí účet (4%)</th>
                  <th className="text-right text-red-700">Pod polštářem</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.year} className="[&>td]:px-3 [&>td]:py-1.5 [&>td]:border-t [&>td]:border-border/50">
                    <td>{r.year}</td>
                    <td className="text-right text-green-600 font-medium">{formatCZK(r.nominal)}</td>
                    <td className="text-right text-blue-600">{formatCZK(r.real)}</td>
                    <td className="text-right text-yellow-600">{formatCZK(r.savings)}</td>
                    <td className="text-right text-red-600">{formatCZK(r.cash)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground flex gap-1.5 items-start">
            <Info className="size-3.5 shrink-0 mt-0.5" />
            „Reálná hodnota" = kupní síla investice po inflaci. CZ inflace 2021–2023 dosáhla až 18 % — peníze pod polštářem ztrácejí vše.
          </p>
        </CardContent>
      )}
    </Card>
  );
}

// ─── Debt Payoff Planner ──────────────────────────────────────────────────────

function DebtPayoffPlanner() {
  const [debts, setDebts] = useState<DebtItem[]>(() => loadJSON<DebtItem[]>(DEBTS_KEY, []));
  const [extra, setExtra] = useState(0);
  const [method, setMethod] = useState<'avalanche' | 'snowball'>('avalanche');
  const [open, setOpen] = useState(true);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: '', balance: 0, rate: 0, minPayment: 0 });

  const saveDebts = (d: DebtItem[]) => { setDebts(d); saveJSON(DEBTS_KEY, d); };
  const addDebt = () => {
    if (!form.name || form.balance <= 0) { toast.error('Vyplňte název a zůstatek'); return; }
    saveDebts([...debts, { ...form, id: uid() }]);
    setForm({ name: '', balance: 0, rate: 0, minPayment: 0 });
    setAdding(false);
  };

  const result = useMemo(() => {
    if (debts.length === 0) return null;
    const totalMin = debts.reduce((s, d) => s + d.minPayment, 0);
    const totalExtra = extra;

    const simulate = (order: DebtItem[]) => {
      let ds = order.map((d) => ({ ...d, balance: d.balance }));
      let month = 0;
      let totalInterestPaid = 0;
      while (ds.some((d) => d.balance > 0) && month < 600) {
        month++;
        const extraLeft = totalExtra;
        ds = ds.map((d) => {
          if (d.balance <= 0) return d;
          const int = d.balance * (d.rate / 100 / 12);
          totalInterestPaid += int;
          let payment = d.minPayment;
          if (ds.indexOf(d) === ds.findIndex((x) => x.balance > 0)) {
            payment += extraLeft;
          }
          const newBal = Math.max(d.balance + int - payment, 0);
          return { ...d, balance: newBal };
        });
      }
      return { months: month, totalInterest: totalInterestPaid };
    };

    const avalanche = simulate([...debts].sort((a, b) => b.rate - a.rate));
    const snowball = simulate([...debts].sort((a, b) => a.balance - b.balance));

    return { avalanche, snowball, totalDebt: debts.reduce((s, d) => s + d.balance, 0), totalMin };
  }, [debts, extra]);

  return (
    <Card>
      <CardHeader className="pb-2 pt-4 px-5 cursor-pointer" onClick={() => setOpen((o) => !o)}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold flex items-center gap-2"><Minus className="size-4 text-red-600" /> Splácení dluhů — Snowball / Avalanche</span>
          {open ? <ChevronUp className="size-4 text-muted-foreground" /> : <ChevronDown className="size-4 text-muted-foreground" />}
        </div>
      </CardHeader>
      {open && (
        <CardContent className="px-5 pb-5 space-y-4">
          {/* Debts list */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Dluhy</span>
              <button onClick={() => setAdding(true)} className="text-xs text-primary hover:underline flex items-center gap-1"><Plus className="size-3" />Přidat dluh</button>
            </div>
            {adding && (
              <div className="grid grid-cols-2 gap-2 mb-3 p-3 rounded-lg bg-muted/30 border border-border">
                <Input placeholder="Název (např. Půjčka ČSOB)" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                <Input type="number" placeholder="Zůstatek Kč" value={form.balance || ''} onChange={(e) => setForm((f) => ({ ...f, balance: +e.target.value }))} />
                <Input type="number" step={0.1} placeholder="Úrok % p.a." value={form.rate || ''} onChange={(e) => setForm((f) => ({ ...f, rate: +e.target.value }))} />
                <Input type="number" placeholder="Min. splátka Kč/měs" value={form.minPayment || ''} onChange={(e) => setForm((f) => ({ ...f, minPayment: +e.target.value }))} />
                <Button size="sm" onClick={addDebt}>Přidat</Button>
                <Button size="sm" variant="outline" onClick={() => setAdding(false)}>Zrušit</Button>
              </div>
            )}
            {debts.length === 0 ? (
              <div className="text-xs text-muted-foreground">Žádné dluhy. Přidejte první.</div>
            ) : debts.map((d) => (
              <div key={d.id} className="flex items-center justify-between py-1.5 border-b border-border/40 last:border-0">
                <div>
                  <span className="text-sm font-medium">{d.name}</span>
                  <span className="text-xs text-muted-foreground ml-2">{d.rate} % p.a. · min. {formatCZK(d.minPayment)}/měs</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-red-600">{formatCZK(d.balance)}</span>
                  <button onClick={() => saveDebts(debts.filter((x) => x.id !== d.id))} className="text-muted-foreground hover:text-red-500"><Trash2 className="size-3.5" /></button>
                </div>
              </div>
            ))}
          </div>

          {debts.length > 0 && (
            <>
              <div className="flex gap-3 items-end flex-wrap">
                <div className="flex-1 min-w-40">
                  <label className="text-xs text-muted-foreground mb-1 block">Extra splátka / měs (Kč)</label>
                  <Input type="number" value={extra} onChange={(e) => setExtra(+e.target.value)} placeholder="0" />
                </div>
                <div className="flex rounded-lg overflow-hidden border border-border text-sm">
                  <button onClick={() => setMethod('avalanche')}
                    className={`px-3 py-2 font-medium ${method === 'avalanche' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'}`}>
                    Avalanche (úrok)
                  </button>
                  <button onClick={() => setMethod('snowball')}
                    className={`px-3 py-2 font-medium ${method === 'snowball' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'}`}>
                    Snowball (zůstatek)
                  </button>
                </div>
              </div>

              {result && (
                <div className="grid grid-cols-2 gap-3">
                  <div className={`rounded-lg border p-3 ${method === 'avalanche' ? 'bg-blue-50 border-blue-200' : 'bg-muted/30 border-border'}`}>
                    <div className="text-xs font-semibold text-blue-700 mb-1">🏔 Avalanche (matematicky lepší)</div>
                    <div className="text-lg font-bold">{(result.avalanche.months / 12).toFixed(1)} let</div>
                    <div className="text-xs text-muted-foreground">Celkové úroky: {formatCZK(result.avalanche.totalInterest)}</div>
                  </div>
                  <div className={`rounded-lg border p-3 ${method === 'snowball' ? 'bg-purple-50 border-purple-200' : 'bg-muted/30 border-border'}`}>
                    <div className="text-xs font-semibold text-purple-700 mb-1">⛄ Snowball (psychologicky lepší)</div>
                    <div className="text-lg font-bold">{(result.snowball.months / 12).toFixed(1)} let</div>
                    <div className="text-xs text-muted-foreground">Celkové úroky: {formatCZK(result.snowball.totalInterest)}</div>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      )}
    </Card>
  );
}

// ─── SP500 Calculator ─────────────────────────────────────────────────────────

function SP500Calculator() {
  const [initial, setInitial] = useState(100000);
  const [monthly, setMonthly] = useState(5000);
  const [years, setYears] = useState(10);
  const [rate, setRate] = useState(9);
  const [open, setOpen] = useState(true);

  const result = useMemo(() => {
    const r = rate / 100 / 12;
    let value = initial;
    const rows: { year: number; value: number; invested: number }[] = [];
    let totalInvested = initial;
    for (let m = 1; m <= years * 12; m++) {
      value = value * (1 + r) + monthly;
      totalInvested += monthly;
      if (m % 12 === 0) rows.push({ year: m / 12, value, invested: totalInvested });
    }
    return { finalValue: value, totalInvested, gain: value - totalInvested, rows };
  }, [initial, monthly, years, rate]);

  return (
    <Card>
      <CardHeader className="pb-2 pt-4 px-5 cursor-pointer" onClick={() => setOpen((o) => !o)}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold flex items-center gap-2"><BarChart2 className="size-4 text-blue-500" /> S&P 500 / ETF — složené úročení</span>
          {open ? <ChevronUp className="size-4 text-muted-foreground" /> : <ChevronDown className="size-4 text-muted-foreground" />}
        </div>
      </CardHeader>
      {open && (
        <CardContent className="px-5 pb-5 space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div><label className="text-xs text-muted-foreground mb-1 block">Počáteční investice (Kč)</label><Input type="number" value={initial} onChange={(e) => setInitial(+e.target.value)} /></div>
            <div><label className="text-xs text-muted-foreground mb-1 block">Měsíční příspěvek (Kč)</label><Input type="number" value={monthly} onChange={(e) => setMonthly(+e.target.value)} /></div>
            <div><label className="text-xs text-muted-foreground mb-1 block">Počet let</label><Input type="number" value={years} min={1} max={50} onChange={(e) => setYears(+e.target.value)} /></div>
            <div><label className="text-xs text-muted-foreground mb-1 block">Roční výnos (%)</label><Input type="number" step={0.5} value={rate} onChange={(e) => setRate(+e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-blue-50 border border-blue-100 p-3 text-center">
              <div className="text-xs text-muted-foreground mb-1">Investováno</div>
              <div className="font-bold text-blue-700">{formatCZK(result.totalInvested)}</div>
            </div>
            <div className="rounded-lg bg-green-50 border border-green-100 p-3 text-center">
              <div className="text-xs text-muted-foreground mb-1">Hodnota za {years} let</div>
              <div className="font-bold text-green-700">{formatCZK(result.finalValue)}</div>
            </div>
            <div className="rounded-lg bg-purple-50 border border-purple-100 p-3 text-center">
              <div className="text-xs text-muted-foreground mb-1">Zisk (úroky)</div>
              <div className="font-bold text-purple-700">{formatCZK(result.gain)}</div>
            </div>
          </div>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-xs border-collapse">
              <thead className="bg-muted/50">
                <tr className="[&>th]:px-3 [&>th]:py-2 [&>th]:text-left [&>th]:font-medium [&>th]:text-muted-foreground">
                  <th>Rok</th><th className="text-right">Investováno</th><th className="text-right">Hodnota</th><th className="text-right">Zisk</th><th className="text-right">Zhodnocení</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((r) => (
                  <tr key={r.year} className="[&>td]:px-3 [&>td]:py-1.5 [&>td]:border-t [&>td]:border-border/50">
                    <td>{r.year}</td><td className="text-right">{formatCZK(r.invested)}</td>
                    <td className="text-right font-medium text-green-600">{formatCZK(r.value)}</td>
                    <td className="text-right text-blue-600">{formatCZK(r.value - r.invested)}</td>
                    <td className="text-right text-purple-600">{((r.value / r.invested - 1) * 100).toFixed(1)} %</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground flex gap-1.5 items-start"><Info className="size-3.5 shrink-0 mt-0.5" />Historický průměr S&P 500 ~9–10 % nominálně. Nezohledňuje daně a poplatky.</p>
        </CardContent>
      )}
    </Card>
  );
}

// ─── Property & Land Calculators (abbreviated from original) ──────────────────

function PropertyCalculator() {
  const [price, setPrice] = useState(3000000);
  const [downPayment, setDownPayment] = useState(600000);
  const [rent, setRent] = useState(12000);
  const [maintenance, setMaintenance] = useState(1500);
  const [appreciationRate, setAppreciationRate] = useState(4);
  const [mortgageRate, setMortgageRate] = useState(5.5);
  const [years, setYears] = useState(10);
  const [open, setOpen] = useState(true);

  const result = useMemo(() => {
    const loan = price - downPayment;
    const mr = mortgageRate / 100 / 12;
    const n = years * 12;
    const monthlyMortgage = loan > 0 ? loan * mr / (1 - Math.pow(1 + mr, -n)) : 0;
    const grossYield = ((rent * 12) / price) * 100;
    const netYield = (((rent - maintenance) * 12 - monthlyMortgage * 12) / price) * 100;
    const annualCashflow = (rent - maintenance) * 12 - monthlyMortgage * 12;
    const futureValue = price * Math.pow(1 + appreciationRate / 100, years);
    return { monthlyMortgage, grossYield, netYield, annualCashflow, futureValue };
  }, [price, downPayment, rent, maintenance, mortgageRate, appreciationRate, years]);

  return (
    <Card>
      <CardHeader className="pb-2 pt-4 px-5 cursor-pointer" onClick={() => setOpen((o) => !o)}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold flex items-center gap-2"><Home className="size-4 text-orange-500" /> Investiční byt</span>
          {open ? <ChevronUp className="size-4 text-muted-foreground" /> : <ChevronDown className="size-4 text-muted-foreground" />}
        </div>
      </CardHeader>
      {open && (
        <CardContent className="px-5 pb-5 space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div><label className="text-xs text-muted-foreground mb-1 block">Kupní cena (Kč)</label><Input type="number" value={price} onChange={(e) => setPrice(+e.target.value)} /></div>
            <div><label className="text-xs text-muted-foreground mb-1 block">Vlastní vklad (Kč)</label><Input type="number" value={downPayment} onChange={(e) => setDownPayment(+e.target.value)} /></div>
            <div><label className="text-xs text-muted-foreground mb-1 block">Měsíční nájem (Kč)</label><Input type="number" value={rent} onChange={(e) => setRent(+e.target.value)} /></div>
            <div><label className="text-xs text-muted-foreground mb-1 block">Náklady/měs (Kč)</label><Input type="number" value={maintenance} onChange={(e) => setMaintenance(+e.target.value)} /></div>
            <div><label className="text-xs text-muted-foreground mb-1 block">Úrok hypotéky (%)</label><Input type="number" step={0.1} value={mortgageRate} onChange={(e) => setMortgageRate(+e.target.value)} /></div>
            <div><label className="text-xs text-muted-foreground mb-1 block">Zhodnocení / rok (%)</label><Input type="number" step={0.5} value={appreciationRate} onChange={(e) => setAppreciationRate(+e.target.value)} /></div>
            <div><label className="text-xs text-muted-foreground mb-1 block">Horizont (let)</label><Input type="number" value={years} min={1} max={30} onChange={(e) => setYears(+e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="rounded-lg bg-orange-50 border border-orange-100 p-3">
              <div className="text-xs text-muted-foreground mb-1">Hrubý výnos</div>
              <div className="font-bold text-orange-700 text-lg">{result.grossYield.toFixed(2)} %</div>
            </div>
            <div className={`rounded-lg border p-3 ${result.netYield >= 0 ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
              <div className="text-xs text-muted-foreground mb-1">Čistý výnos</div>
              <div className={`font-bold text-lg ${result.netYield >= 0 ? 'text-green-700' : 'text-red-700'}`}>{result.netYield.toFixed(2)} %</div>
            </div>
            <div className={`rounded-lg border p-3 ${result.annualCashflow >= 0 ? 'bg-blue-50 border-blue-100' : 'bg-red-50 border-red-100'}`}>
              <div className="text-xs text-muted-foreground mb-1">Roční cashflow</div>
              <div className={`font-bold text-lg ${result.annualCashflow >= 0 ? 'text-blue-700' : 'text-red-700'}`}>{formatCZK(result.annualCashflow)}</div>
            </div>
            <div className="rounded-lg bg-purple-50 border border-purple-100 p-3">
              <div className="text-xs text-muted-foreground mb-1">Hodnota za {years} let</div>
              <div className="font-bold text-purple-700 text-lg">{formatCZK(result.futureValue)}</div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

function LandCalculator() {
  const [price, setPrice] = useState(1000000);
  const [annualAppreciation, setAnnualAppreciation] = useState(6);
  const [holdingCosts, setHoldingCosts] = useState(5000);
  const [years, setYears] = useState(7);
  const [open, setOpen] = useState(true);

  const result = useMemo(() => {
    const futureValue = price * Math.pow(1 + annualAppreciation / 100, years);
    const totalCosts = holdingCosts * 12 * years;
    const gain = futureValue - price - totalCosts;
    const rows = Array.from({ length: years }, (_, i) => {
      const y = i + 1;
      const val = price * Math.pow(1 + annualAppreciation / 100, y);
      const costs = holdingCosts * 12 * y;
      return { year: y, value: val, costs, gain: val - price - costs };
    });
    return { futureValue, totalCosts, gain, rows };
  }, [price, annualAppreciation, holdingCosts, years]);

  return (
    <Card>
      <CardHeader className="pb-2 pt-4 px-5 cursor-pointer" onClick={() => setOpen((o) => !o)}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold flex items-center gap-2"><TreePine className="size-4 text-green-600" /> Pozemek / investice</span>
          {open ? <ChevronUp className="size-4 text-muted-foreground" /> : <ChevronDown className="size-4 text-muted-foreground" />}
        </div>
      </CardHeader>
      {open && (
        <CardContent className="px-5 pb-5 space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div><label className="text-xs text-muted-foreground mb-1 block">Kupní cena (Kč)</label><Input type="number" value={price} onChange={(e) => setPrice(+e.target.value)} /></div>
            <div><label className="text-xs text-muted-foreground mb-1 block">Zhodnocení / rok (%)</label><Input type="number" step={0.5} value={annualAppreciation} onChange={(e) => setAnnualAppreciation(+e.target.value)} /></div>
            <div><label className="text-xs text-muted-foreground mb-1 block">Holding náklady / měs (Kč)</label><Input type="number" value={holdingCosts} onChange={(e) => setHoldingCosts(+e.target.value)} /></div>
            <div><label className="text-xs text-muted-foreground mb-1 block">Horizont (let)</label><Input type="number" value={years} min={1} max={30} onChange={(e) => setYears(+e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-green-50 border border-green-100 p-3 text-center">
              <div className="text-xs text-muted-foreground mb-1">Hodnota za {years} let</div>
              <div className="font-bold text-green-700">{formatCZK(result.futureValue)}</div>
            </div>
            <div className="rounded-lg bg-orange-50 border border-orange-100 p-3 text-center">
              <div className="text-xs text-muted-foreground mb-1">Celkové náklady</div>
              <div className="font-bold text-orange-700">{formatCZK(result.totalCosts)}</div>
            </div>
            <div className={`rounded-lg border p-3 text-center ${result.gain >= 0 ? 'bg-blue-50 border-blue-100' : 'bg-red-50 border-red-100'}`}>
              <div className="text-xs text-muted-foreground mb-1">Čistý zisk</div>
              <div className={`font-bold ${result.gain >= 0 ? 'text-blue-700' : 'text-red-700'}`}>{formatCZK(result.gain)}</div>
            </div>
          </div>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-xs border-collapse">
              <thead className="bg-muted/50">
                <tr className="[&>th]:px-3 [&>th]:py-2 [&>th]:text-left [&>th]:font-medium [&>th]:text-muted-foreground">
                  <th>Rok</th><th className="text-right">Hodnota pozemku</th><th className="text-right">Náklady celkem</th><th className="text-right">Čistý zisk</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((r) => (
                  <tr key={r.year} className="[&>td]:px-3 [&>td]:py-1.5 [&>td]:border-t [&>td]:border-border/50">
                    <td>{r.year}</td>
                    <td className="text-right text-green-600 font-medium">{formatCZK(r.value)}</td>
                    <td className="text-right text-orange-600">{formatCZK(r.costs)}</td>
                    <td className={`text-right font-semibold ${r.gain >= 0 ? 'text-blue-600' : 'text-red-600'}`}>{formatCZK(r.gain)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

function InvestmentComparison() {
  const [capital, setCapital] = useState(1000000);
  const [years, setYears] = useState(10);
  const [open, setOpen] = useState(false);

  const scenarios = useMemo(() => [
    { label: 'S&P 500 (9 % p.a.)', rate: 9, colorClass: 'bg-blue-500' },
    { label: 'ETF smíšené (6 % p.a.)', rate: 6, colorClass: 'bg-purple-500' },
    { label: 'Nemovitost (5 % p.a.)', rate: 5, colorClass: 'bg-orange-500' },
    { label: 'Pozemek (6 % p.a.)', rate: 6, colorClass: 'bg-green-500' },
    { label: 'Spořicí účet (4 % p.a.)', rate: 4, colorClass: 'bg-yellow-500' },
    { label: 'Pod polštářem (0 %)', rate: 0, colorClass: 'bg-red-400' },
  ].map((s) => ({ ...s, value: capital * Math.pow(1 + s.rate / 100, years), gain: capital * Math.pow(1 + s.rate / 100, years) - capital })), [capital, years]);

  const maxValue = Math.max(...scenarios.map((s) => s.value));

  return (
    <Card>
      <CardHeader className="pb-2 pt-4 px-5 cursor-pointer" onClick={() => setOpen((o) => !o)}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold flex items-center gap-2"><Calculator className="size-4 text-indigo-500" /> Srovnání investičních scénářů</span>
          {open ? <ChevronUp className="size-4 text-muted-foreground" /> : <ChevronDown className="size-4 text-muted-foreground" />}
        </div>
      </CardHeader>
      {open && (
        <CardContent className="px-5 pb-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-muted-foreground mb-1 block">Počáteční kapitál (Kč)</label><Input type="number" value={capital} onChange={(e) => setCapital(+e.target.value)} /></div>
            <div><label className="text-xs text-muted-foreground mb-1 block">Horizont (let)</label><Input type="number" value={years} min={1} max={40} onChange={(e) => setYears(+e.target.value)} /></div>
          </div>
          <div className="space-y-2.5">
            {scenarios.map((s) => (
              <div key={s.label} className="flex items-center gap-3">
                <div className="text-xs w-44 shrink-0">{s.label}</div>
                <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                  <div className={`h-3 rounded-full ${s.colorClass}`} style={{ width: `${(s.value / maxValue) * 100}%` }} />
                </div>
                <div className="text-xs font-semibold w-28 text-right shrink-0">{formatCZK(s.value)}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground flex gap-1.5 items-start"><Info className="size-3.5 shrink-0 mt-0.5" />Orientační hodnoty bez daní a inflace.</p>
        </CardContent>
      )}
    </Card>
  );
}

// ─── Advisor Tab ──────────────────────────────────────────────────────────────

function AdvisorTab({ items, savings }: { items: FinanceItem[]; savings: number }) {
  const [expandedIncome, setExpandedIncome] = useState<string | null>(null);
  const [expandedExpense, setExpandedExpense] = useState<string | null>(null);
  const [checkedActions, setCheckedActions] = useState<Record<string, boolean>>(
    () => loadJSON<Record<string, boolean>>('crm-advisor-checked', {}),
  );

  const toggleCheck = (key: string) => {
    setCheckedActions((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      saveJSON('crm-advisor-checked', updated);
      return updated;
    });
  };

  const monthlyIncome = useMemo(
    () => items.filter((i) => i.type === 'income').reduce((s, i) => s + toMonthly(i.amount, i.frequency), 0),
    [items],
  );
  const monthlyExpense = useMemo(
    () => items.filter((i) => i.type === 'expense').reduce((s, i) => s + toMonthly(i.amount, i.frequency), 0),
    [items],
  );
  const net = monthlyIncome - monthlyExpense;
  const savingsRate = monthlyIncome > 0 ? (net / monthlyIncome) * 100 : 0;
  const emergencyMonths = monthlyExpense > 0 ? savings / monthlyExpense : 0;

  const expenseByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    items.filter((i) => i.type === 'expense').forEach((i) => {
      map[i.category] = (map[i.category] ?? 0) + toMonthly(i.amount, i.frequency);
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [items]);

  // 50/30/20 rule buckets
  const NEEDS_CATS = new Set(['Bydlení', 'Jídlo', 'Zdraví', 'Pojištění']);
  const WANTS_CATS = new Set(['Zábava', 'Telefon/Internet', 'Doprava', 'Ostatní']);
  const needsTotal = expenseByCategory.filter(([c]) => NEEDS_CATS.has(c)).reduce((s, [, v]) => s + v, 0);
  const wantsTotal = expenseByCategory.filter(([c]) => WANTS_CATS.has(c)).reduce((s, [, v]) => s + v, 0);
  const savingsTotal = Math.max(net, 0);
  const total503020 = needsTotal + wantsTotal + savingsTotal;
  const needsPct = total503020 > 0 ? (needsTotal / total503020) * 100 : 0;
  const wantsPct = total503020 > 0 ? (wantsTotal / total503020) * 100 : 0;
  const savingsPct503020 = total503020 > 0 ? (savingsTotal / total503020) * 100 : 0;

  // Overspending analysis
  const overspendingCats = expenseByCategory.filter(([cat, amount]) => {
    const b = EXPENSE_BENCHMARKS[cat];
    return b && monthlyIncome > 0 && (amount / monthlyIncome) * 100 > b.max;
  });
  const potentialMonthlySavings = overspendingCats.reduce((total, [cat, amount]) => {
    const b = EXPENSE_BENCHMARKS[cat];
    if (!b || monthlyIncome === 0) return total;
    return total + Math.max(0, amount - (monthlyIncome * b.max) / 100);
  }, 0);

  // Alerts
  const alerts: { level: 'error' | 'warning' | 'info'; msg: string }[] = [];
  if (net < 0) alerts.push({ level: 'error', msg: `Záporný cashflow ${formatCZK(Math.abs(net))}/měs — okamžitě snižte výdaje nebo zvyšte příjmy.` });
  if (savingsRate < 5 && monthlyIncome > 0 && net >= 0) alerts.push({ level: 'error', msg: `Míra úspor ${savingsRate.toFixed(1)} % — kriticky nízká. Zvyšte ji na 20 % a otevřete si cestu k finanční svobodě.` });
  if (emergencyMonths < 1 && savings > 0 && monthlyExpense > 0) alerts.push({ level: 'error', msg: `Nouzový fond pokryje jen ${emergencyMonths.toFixed(1)} měs výdajů — jste zranitelní. Cíl: 6 měsíců.` });
  if (savingsRate >= 5 && savingsRate < 15 && monthlyIncome > 0) alerts.push({ level: 'warning', msg: `Míra úspor ${savingsRate.toFixed(1)} % — ušetřete ${formatCZK((0.2 - savingsRate / 100) * monthlyIncome)} Kč/měs navíc a dosáhnete doporučených 20 %.` });
  if (emergencyMonths >= 1 && emergencyMonths < 3 && monthlyExpense > 0) alerts.push({ level: 'warning', msg: `Nouzový fond na ${emergencyMonths.toFixed(1)} měsíce — doplňte na alespoň 3 měsíce výdajů.` });
  overspendingCats.forEach(([cat, amount]) => {
    const b = EXPENSE_BENCHMARKS[cat];
    if (!b || monthlyIncome === 0) return;
    const pct = (amount / monthlyIncome) * 100;
    const saving = amount - (monthlyIncome * b.max) / 100;
    alerts.push({ level: 'warning', msg: `${cat}: ${pct.toFixed(0)} % příjmů (max ${b.max} %) — potenciální úspora ${formatCZK(saving)}/měs.` });
  });
  if (monthlyIncome === 0) alerts.push({ level: 'info', msg: 'Přidejte příjmy v záložce Náklady & Příjmy pro plně personalizované tipy.' });

  // Dynamic action items
  const actionItems: { key: string; text: string; priority: 'high' | 'medium' | 'low' }[] = [
    { key: 'open-xtb', text: 'Otevřete investiční účet na XTB.com — zdarma, online, 10 minut', priority: 'high' },
    { key: 'pension', text: 'Zkontrolujte penzijní spoření — příspěvek nad 1 000 Kč/měs = odpočet z daní až 24 000 Kč/rok', priority: 'high' },
    { key: 'compare-phone', text: 'Porovnejte mobilní tarify na gsmsrovnavac.cz — 15 minut, stovky korun úspor/měs', priority: 'medium' },
    { key: 'subscriptions', text: 'Projděte výpisy z účtu a zrušte nevyužívaná předplatná (průměrně 3 zbytečné)', priority: 'medium' },
    { key: 'sell-stuff', text: 'Vylistujte 5 nepotřebných věcí na Vinted nebo Bazoš — rychlé extra peníze', priority: 'low' },
    { key: 'energy', text: 'Srovnejte dodavatele energií na energie.cz — úspora 3 000–10 000 Kč/rok', priority: 'medium' },
    ...(savingsRate < 20 && monthlyIncome > 0
      ? [{ key: 'savings-target', text: `Nastavte automatický převod ${formatCZK(Math.max(500, Math.ceil((monthlyIncome * 0.2 - Math.max(net, 0)) / 100) * 100))} Kč/měs na spořicí účet hned po výplatě`, priority: 'high' as const }]
      : []),
    ...(emergencyMonths < 3 && monthlyExpense > 0
      ? [{ key: 'emergency-fund', text: `Doplňte nouzový fond o ${formatCZK(Math.max(0, monthlyExpense * 3 - savings))} Kč na pokrytí 3 měsíců výdajů`, priority: 'high' as const }]
      : []),
  ];

  if (items.length === 0) {
    return (
      <div className="text-center py-20 space-y-4">
        <div className="text-5xl">🎯</div>
        <div className="text-lg font-semibold">Váš osobní finanční rádce</div>
        <div className="text-sm text-muted-foreground max-w-sm mx-auto">
          Zadejte příjmy a výdaje v záložce <strong>Náklady & Příjmy</strong>. Systém pak automaticky vygeneruje personalizovaný akční plán.
        </div>
        <Link to="/core/crm/naklady/polozky">
          <Button className="mt-2">Zadat příjmy a výdaje</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: 'Míra úspor', value: `${savingsRate.toFixed(1)} %`, sub: 'cíl: 20 %',
            ok: savingsRate >= 20, warn: savingsRate >= 10,
          },
          {
            label: 'Nouzový fond', value: `${emergencyMonths.toFixed(1)} měs`, sub: 'cíl: 6 měsíců',
            ok: emergencyMonths >= 6, warn: emergencyMonths >= 3,
          },
          {
            label: 'Cashflow / měs', value: `${net >= 0 ? '+' : ''}${formatCZK(net)}`, sub: 'příjmy − výdaje',
            ok: net >= 5000, warn: net >= 0,
          },
          {
            label: 'Potenciál úspor', value: potentialMonthlySavings > 0 ? formatCZK(potentialMonthlySavings) : '—', sub: 'měsíčně k dispozici',
            ok: potentialMonthlySavings === 0, warn: potentialMonthlySavings < 2000,
          },
        ].map((kpi) => (
          <div key={kpi.label} className={`rounded-xl border p-4 text-center ${kpi.ok ? 'bg-green-50 border-green-200' : kpi.warn ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'}`}>
            <div className="text-xs text-muted-foreground mb-1">{kpi.label}</div>
            <div className={`text-2xl font-bold ${kpi.ok ? 'text-green-700' : kpi.warn ? 'text-yellow-700' : 'text-red-700'}`}>{kpi.value}</div>
            <div className="text-xs text-muted-foreground">{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((a, i) => (
            <div key={i} className={`flex gap-3 items-start rounded-lg px-4 py-3 text-sm border ${
              a.level === 'error' ? 'bg-red-50 border-red-200 text-red-900' :
              a.level === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-900' :
              'bg-blue-50 border-blue-200 text-blue-900'
            }`}>
              <span className="text-base shrink-0 mt-0.5">{a.level === 'error' ? '🚨' : a.level === 'warning' ? '⚠️' : 'ℹ️'}</span>
              <span>{a.msg}</span>
            </div>
          ))}
        </div>
      )}

      {/* 50/30/20 rule */}
      {monthlyIncome > 0 && (
        <Card>
          <CardHeader className="pb-2 pt-4 px-5">
            <span className="text-sm font-semibold">Pravidlo 50/30/20 — jak rozdělujete příjmy</span>
          </CardHeader>
          <CardContent className="px-5 pb-4 space-y-3">
            {[
              { label: 'Potřeby (bydlení, jídlo, zdraví, pojištění)', pct: needsPct, target: 50, amount: needsTotal, color: 'bg-blue-500' },
              { label: 'Přání (zábava, telefon, doprava)', pct: wantsPct, target: 30, amount: wantsTotal, color: 'bg-purple-500' },
              { label: 'Úspory & investice (zbytek po výdajích)', pct: savingsPct503020, target: 20, amount: savingsTotal, color: 'bg-green-500' },
            ].map((row) => {
              const isSavings = row.label.startsWith('Úspory');
              const isGood = isSavings ? row.pct >= row.target : row.pct <= row.target;
              return (
                <div key={row.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{row.label}</span>
                    <span className={`font-semibold ${isGood ? 'text-green-600' : 'text-red-600'}`}>
                      {row.pct.toFixed(0)} % <span className="text-muted-foreground font-normal">/ cíl {row.target} %</span>
                    </span>
                  </div>
                  <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                    <div className={`h-3 rounded-full ${row.color} transition-all`} style={{ width: `${Math.min(row.pct, 100)}%` }} />
                    <div className="absolute top-0 bottom-0 w-px bg-foreground/40" style={{ left: `${row.target}%` }} />
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5 text-right">{formatCZK(row.amount)}/měs</div>
                </div>
              );
            })}
            <p className="text-xs text-muted-foreground flex gap-1.5 items-start">
              <Info className="size-3.5 shrink-0 mt-0.5" />
              Pravidlo 50/30/20: max 50 % na nutné výdaje, max 30 % na přání, min 20 % na úspory a investice. Svislá čára = cíl.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Expense analysis */}
      {expenseByCategory.length > 0 && (
        <div>
          <div className="text-sm font-semibold mb-3 flex items-center gap-2">
            <TrendingDown className="size-4 text-red-500" />
            Snížení výdajů — analýza kategorií
            {potentialMonthlySavings > 0 && (
              <Badge variant="outline" className="text-green-700 border-green-300 text-xs">
                Celkový potenciál: {formatCZK(potentialMonthlySavings)}/měs
              </Badge>
            )}
          </div>
          <div className="space-y-2">
            {expenseByCategory.map(([cat, amount]) => {
              const b = EXPENSE_BENCHMARKS[cat];
              const pct = monthlyIncome > 0 ? (amount / monthlyIncome) * 100 : 0;
              const isOver = !!b && monthlyIncome > 0 && pct > b.max;
              const potential = b && monthlyIncome > 0 ? Math.max(0, amount - (monthlyIncome * b.max) / 100) : 0;
              const isExpanded = expandedExpense === cat;
              return (
                <div key={cat} className={`rounded-lg border transition-colors ${isOver ? 'border-orange-200 bg-orange-50/60' : 'border-border bg-background'}`}>
                  <button
                    className="w-full flex items-center justify-between px-4 py-3 text-left"
                    onClick={() => setExpandedExpense(isExpanded ? null : cat)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`size-2 rounded-full shrink-0 ${isOver ? 'bg-orange-500' : 'bg-green-500'}`} />
                      <span className="text-sm font-medium">{cat}</span>
                      {isOver && (
                        <Badge variant="outline" className="text-xs text-orange-700 border-orange-300 shrink-0">
                          ušetřit {formatCZK(potential)}/měs
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className="text-sm font-semibold">{formatCZK(amount)}/měs</div>
                        {monthlyIncome > 0 && (
                          <div className={`text-xs ${isOver ? 'text-orange-600 font-medium' : 'text-muted-foreground'}`}>
                            {pct.toFixed(0)} % příjmů{b ? ` · max ${b.max} %` : ''}
                          </div>
                        )}
                      </div>
                      {b ? (isExpanded ? <ChevronUp className="size-4 text-muted-foreground" /> : <ChevronDown className="size-4 text-muted-foreground" />) : null}
                    </div>
                  </button>
                  {isExpanded && b && (
                    <div className="px-4 pb-4 border-t border-border/50 pt-3">
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Konkrétní tipy jak ušetřit</div>
                      <ul className="space-y-2">
                        {b.savingTips.map((tip, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <span className="text-green-600 font-bold shrink-0">→</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Income strategies */}
      <div>
        <div className="text-sm font-semibold mb-3 flex items-center gap-2">
          <TrendingUp className="size-4 text-green-500" />
          Jak zvýšit příjmy — konkrétní strategie
        </div>
        <div className="space-y-2">
          {INCOME_IDEAS.map((idea) => {
            const isExpanded = expandedIncome === idea.id;
            return (
              <div key={idea.id} className="rounded-lg border border-border bg-background overflow-hidden">
                <button
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/30 transition-colors"
                  onClick={() => setExpandedIncome(isExpanded ? null : idea.id)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xl shrink-0">{idea.icon}</span>
                    <div className="min-w-0">
                      <div className="text-sm font-medium">{idea.title}</div>
                      <div className="text-xs text-muted-foreground">
                        <span className="text-green-700 font-medium">{idea.potential}</span>
                        {' · '}{idea.timeToStart} na start · {idea.difficulty}
                      </div>
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp className="size-4 text-muted-foreground shrink-0" /> : <ChevronDown className="size-4 text-muted-foreground shrink-0" />}
                </button>
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-border/50 bg-muted/20">
                    <p className="text-sm text-muted-foreground mt-3 mb-3 leading-relaxed">{idea.desc}</p>
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Konkrétní kroky (klikněte pro označení)</div>
                    <ol className="space-y-1.5">
                      {idea.steps.map((step, i) => {
                        const key = `income-${idea.id}-step-${i}`;
                        const checked = !!checkedActions[key];
                        return (
                          <li
                            key={i}
                            className={`flex items-start gap-3 text-sm cursor-pointer rounded-md px-2 py-1.5 hover:bg-muted/50 transition-colors ${checked ? 'opacity-40' : ''}`}
                            onClick={() => toggleCheck(key)}
                          >
                            <div className={`size-4 rounded shrink-0 mt-0.5 border-2 flex items-center justify-center ${checked ? 'bg-green-500 border-green-500' : 'border-border'}`}>
                              {checked && <Check className="size-2.5 text-white" />}
                            </div>
                            <span className={checked ? 'line-through' : ''}>{step}</span>
                          </li>
                        );
                      })}
                    </ol>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action plan this month */}
      <Card>
        <CardHeader className="pb-2 pt-4 px-5">
          <span className="text-sm font-semibold flex items-center gap-2">
            <Target className="size-4 text-indigo-500" /> Akční plán — udělejte tento měsíc
          </span>
        </CardHeader>
        <CardContent className="px-5 pb-4">
          <div className="space-y-1.5">
            {actionItems.map(({ key, text, priority }) => {
              const checked = !!checkedActions[`action-${key}`];
              return (
                <div
                  key={key}
                  className={`flex items-start gap-3 rounded-lg px-3 py-2.5 cursor-pointer hover:bg-muted/40 transition-colors ${checked ? 'opacity-40' : ''}`}
                  onClick={() => toggleCheck(`action-${key}`)}
                >
                  <div className={`size-5 rounded shrink-0 mt-0.5 border-2 flex items-center justify-center ${
                    checked ? 'bg-green-500 border-green-500' :
                    priority === 'high' ? 'border-red-400' :
                    priority === 'medium' ? 'border-yellow-400' : 'border-muted-foreground'
                  }`}>
                    {checked && <Check className="size-3 text-white" />}
                  </div>
                  <div className="flex items-start gap-2 flex-wrap">
                    <span className={`text-sm ${checked ? 'line-through' : ''}`}>{text}</span>
                    {!checked && (
                      <Badge variant="outline" className={`text-xs shrink-0 ${
                        priority === 'high' ? 'text-red-600 border-red-200' :
                        priority === 'medium' ? 'text-yellow-600 border-yellow-200' :
                        'text-muted-foreground'
                      }`}>
                        {priority === 'high' ? 'Priorita' : priority === 'medium' ? 'Doporučené' : 'Bonus'}
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 text-xs text-muted-foreground flex items-center gap-1.5">
            <Info className="size-3.5 shrink-0" />
            Váš postup se ukládá automaticky. Označené kroky přetrvají i po zavření prohlížeče.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Calculators Tab ──────────────────────────────────────────────────────────

function CalculatorsTab() {
  return (
    <div className="space-y-4">
      <FIRECalculator />
      <MortgageCalculator />
      <InflationCalculator />
      <DebtPayoffPlanner />
      <SP500Calculator />
      <PropertyCalculator />
      <LandCalculator />
      <InvestmentComparison />
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const NAV_TABS = [
  { path: '/core/crm/naklady',            label: 'Přehled',          key: 'overview' },
  { path: '/core/crm/naklady/polozky',    label: 'Náklady & Příjmy', key: 'items' },
  { path: '/core/crm/naklady/radce',      label: '🎯 Rádce',          key: 'advisor' },
  { path: '/core/crm/naklady/kalkulacky', label: 'Kalkulačky',       key: 'calculators' },
] as const;

export function NakladyPage() {
  const [items, setItems] = useState<FinanceItem[]>(loadItems);
  const [savings, setSavings] = useState(() => loadJSON<number>(SAVINGS_KEY, 0));
  const location = useLocation();

  const activeTab = location.pathname.endsWith('/polozky')
    ? 'items'
    : location.pathname.endsWith('/kalkulacky')
    ? 'calculators'
    : location.pathname.endsWith('/radce')
    ? 'advisor'
    : 'overview';

  const monthlyIncome = useMemo(
    () => items.filter((i) => i.type === 'income').reduce((s, i) => s + toMonthly(i.amount, i.frequency), 0), [items]);
  const monthlyExpense = useMemo(
    () => items.filter((i) => i.type === 'expense').reduce((s, i) => s + toMonthly(i.amount, i.frequency), 0), [items]);
  const net = monthlyIncome - monthlyExpense;

  return (
    <>
      <ContentHeader>
        <div className="flex items-center gap-3">
          <Wallet className="size-4 text-primary" />
          <h1 className="text-sm font-semibold">Osobní finance</h1>
          <Badge variant="outline" className="text-xs">
            {net >= 0 ? '+' : ''}{formatCZK(net)} / měs
          </Badge>
          {savings > 0 && (
            <Badge variant="outline" className="text-xs text-blue-600 border-blue-200">
              úspory {formatCZK(savings)}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-border overflow-hidden">
          {NAV_TABS.map((t) => (
            <Link key={t.key} to={t.path}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${activeTab === t.key ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'}`}>
              {t.label}
            </Link>
          ))}
        </div>
      </ContentHeader>

      <Content className="block py-5 px-4 space-y-4 max-w-6xl">
        {activeTab === 'overview' && <OverviewTab items={items} savings={savings} onSavingsChange={setSavings} />}
        {activeTab === 'items' && <ItemsTab items={items} setItems={setItems} />}
        {activeTab === 'advisor' && <AdvisorTab items={items} savings={savings} />}
        {activeTab === 'calculators' && <CalculatorsTab />}
      </Content>
    </>
  );
}
