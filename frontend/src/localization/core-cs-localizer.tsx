import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import type { AppLanguage } from "./language-context";

const originalText = new WeakMap<Text, string>();
const originalAttr = new WeakMap<Element, Map<string, string>>();

const EXACT_MAP: Record<string, string> = {
  Dashboard: "Přehled",
  Dashboards: "Přehledy",
  Default: "Výchozí",
  Calendar: "Kalendář",
  Mail: "Pošta",
  Inbox: "Doručené",
  Draft: "Koncepty",
  Drafts: "Koncepty",
  Sent: "Odeslané",
  Contacts: "Kontakty",
  Companies: "Firmy",
  Company: "Firma",
  Deals: "Obchody",
  Tasks: "Úkoly",
  Notes: "Poznámky",
  Notifications: "Oznámení",
  Settings: "Nastavení",
  Search: "Hledat",
  Filters: "Filtry",
  Filter: "Filtr",
  Apply: "Použít",
  Clear: "Vyčistit",
  Save: "Uložit",
  Cancel: "Zrušit",
  Delete: "Smazat",
  Edit: "Upravit",
  Create: "Vytvořit",
  Update: "Aktualizovat",
  Loading: "Načítání",
  "Loading...": "Načítání...",
  "Loading calendar...": "Načítání kalendáře...",
  "Loading messages...": "Načítání zpráv...",
  "No messages in this folder.": "V této složce nejsou žádné zprávy.",
  "No events": "Žádné události",
  "Not connected": "Nepřipojeno",
  Connected: "Připojeno",
  "Sync now": "Synchronizovat nyní",
  Today: "Dnes",
  Week: "Týden",
  Month: "Měsíc",
  Day: "Den",
  Agenda: "Agenda",
  "All Tasks": "Všechny úkoly",
  Upcoming: "Nadcházející",
  Priority: "Priorita",
  Completed: "Dokončeno",
  "New event": "Nová událost",
  "Event added": "Událost přidána",
  "Event updated": "Událost upravena",
  "Event deleted": "Událost smazána",
  "Apple Calendar Sync": "Synchronizace Apple kalendáře",
  "App-Specific Password": "Heslo pro konkrétní aplikaci",
  "Calendar URL (optional)": "URL kalendáře (volitelné)",
  "Apple ID": "Apple ID",
  "Last sync: nikdy": "Poslední synchronizace: nikdy",
  "Připojit Apple": "Připojit Apple",
  "Odpojit": "Odpojit",
  "Vyber kalendář...": "Vyber kalendář...",
  "Použít vybraný": "Použít vybraný",
  "CRM Activity": "CRM aktivita",
  "Go to Apps": "Přejít do aplikací",
  "See All": "Zobrazit vše",
  View: "Zobrazit",
  "View all": "Zobrazit vše",
  "clear filters": "vyčistit filtry",
  CRM: "CRM",
  TODO: "Úkoly",
  "Real Estate": "Reality",
  Labels: "Štítky",
  Archive: "Archiv",
  Snoozed: "Odloženo",
  Spam: "Spam",
  Trash: "Koš",
  Support: "Podpora",
  Feedback: "Zpětná vazba",
  Events: "Události",
  Meetings: "Schůzky",
  Reminders: "Připomínky",
  Schedule: "Rozvrh",
  "Add Task": "Přidat úkol",
  "Task title": "Název úkolu",
  Description: "Popis",
  Status: "Stav",
  "Add a new task": "Přidat nový úkol",
  Primary: "Primární",
  Social: "Sociální",
  Promotions: "Promo",
  Updates: "Aktualizace",
  Forums: "Fóra",
  Shopping: "Nakupování",
  Travel: "Cestování",
  Finance: "Finance",
  Newsletters: "Newslettery",
  "Enter email": "Zadej email",
  "Enter CC email": "Zadej CC email",
  "Enter BCC email": "Zadej BCC email",
  "Enter subject": "Zadej předmět",
  "Enter label name": "Zadej název štítku",
  "Enter tag name": "Zadej název štítku",
  "Company Name": "Název firmy",
  Domain: "Doména",
  Email: "Email",
  "Dark mode": "Tmavý režim",
  "Light mode": "Světlý režim",
  Generate: "Generovat",
  "Generating...": "Generuji...",
  "High Priority": "Vysoká priorita",
  Normal: "Normální",
  "Rows per page": "Řádků na stránku",
  "Search shop": "Hledat v obchodě",
  "Search deals ....": "Hledat obchody ....",
  "Search deals...": "Hledat obchody...",
  "Search by ID": "Hledat podle ID",
  "Search payment status...": "Hledat stav platby...",
  "Search status...": "Hledat stav...",
  "Search priority...": "Hledat prioritu...",
  Payment: "Platba",
  Payments: "Platby",
  "Payment Method": "Metoda platby",
  "Payment Methods": "Platební metody",
  "Payment Status": "Stav platby",
  Orders: "Objednávky",
  Order: "Objednávka",
  "Order List": "Seznam objednávek",
  "Order Tracking": "Sledování objednávek",
  "Recent Orders": "Nedávné objednávky",
  "Category List": "Seznam kategorií",
  Categories: "Kategorie",
  Category: "Kategorie",
  Products: "Produkty",
  Product: "Produkt",
  Inventory: "Sklad",
  "Closed Won": "Uzavřeno - výhra",
  "Closed Lost": "Uzavřeno - prohra",
  Prospecting: "Průzkum",
  Qualification: "Kvalifikace",
  Proposal: "Nabídka",
  Negotiation: "Vyjednávání",
  Paid: "Zaplaceno",
  Pending: "Čeká",
  Failed: "Neúspěšné",
  "Deal #": "Obchod #",
  "No results found.": "Nenalezeny žádné výsledky.",
  "No results.": "Žádné výsledky.",
  "Ad Listings": "Seznam inzerátů",
  "Costs & Income": "Náklady & Příjmy",
  "Advisor & Tips": "Rádce & Tipy",
  "Calculators": "Kalkulačky",
  "Planner": "Plánovač",
  "Goals & Habits": "Cíle & Návyky",
  "Advisor": "Rádce",
  "All Stock": "Celý sklad",
  "Current Stock": "Aktuální sklad",
  "Inbound Stock": "Příjem na sklad",
  "Outbound Stock": "Výdej ze skladu",
  "Stock Planner": "Plánovač skladu",
  "Tracking Shipments": "Sledování zásilek",
  "Create Shipping Label": "Vytvořit štítek zásilky",
  "Product List": "Seznam produktů",
  "Create Product": "Vytvořit produkt",
  "Variant Management": "Správa variant",
  "Create Category": "Vytvořit kategorii",
  "Customer List": "Seznam zákazníků",
  "Customer Detail": "Detail zákazníka",
  "Order Detail": "Detail objednávky",
  "Orders - Products": "Objednávky - produkty",
  "Projects Overview": "Přehled projektů",
  "Free Domains": "Volné domény",
  "Settings (Modal)": "Nastavení (modální okno)",
  "Light": "Bílá",
  "Dark": "Tmavá",
  "Sidebar Appearance": "Vzhled sidebaru",
  "Board": "Nástěnka",
  "Projects Dashboard": "Nástěnka",
  "Overview": "Přehled",
  "Bazos Scraper": "Bazoš Scraper",
};

const REVERSE_EXACT_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(EXACT_MAP).map(([en, cs]) => [cs, en]),
);

const REPLACEMENTS: Array<[RegExp, string]> = [
  [/\bLoading\b/g, "Načítání"],
  [/\bFailed to load\b/g, "Nepodařilo se načíst"],
  [/\bInternal server error\b/g, "Interní chyba serveru"],
  [/\bSearch\b/g, "Hledat"],
  [/\bSave\b/g, "Uložit"],
  [/\bCancel\b/g, "Zrušit"],
  [/\bDelete\b/g, "Smazat"],
  [/\bEdit\b/g, "Upravit"],
  [/\bCreate\b/g, "Vytvořit"],
  [/\bUpdate\b/g, "Aktualizovat"],
  [/\bConnected\b/g, "Připojeno"],
  [/\bNot connected\b/g, "Nepřipojeno"],
  [/\bLast sync\b/g, "Poslední synchronizace"],
  [/\bTracked events\b/g, "Sledované události"],
  [/\bError\b/g, "Chyba"],
  [/\bToday\b/g, "Dnes"],
  [/\bTomorrow\b/g, "Zítra"],
  [/\bYesterday\b/g, "Včera"],
  [/\bMonth\b/g, "Měsíc"],
  [/\bWeek\b/g, "Týden"],
  [/\bDay\b/g, "Den"],
  [/\bAgenda\b/g, "Agenda"],
  [/\bInbox\b/g, "Doručené"],
  [/\bDrafts?\b/g, "Koncepty"],
  [/\bSent\b/g, "Odeslané"],
  [/\bCalendar\b/g, "Kalendář"],
  [/\bMail\b/g, "Pošta"],
  [/\bDashboard\b/g, "Přehled"],
  [/\bDashboards\b/g, "Přehledy"],
  [/\bDefault\b/g, "Výchozí"],
  [/\bContacts\b/g, "Kontakty"],
  [/\bCompanies\b/g, "Firmy"],
  [/\bDeals\b/g, "Obchody"],
  [/\bTasks\b/g, "Úkoly"],
  [/\bNotes\b/g, "Poznámky"],
  [/\bNotifications\b/g, "Oznámení"],
  [/\bSettings\b/g, "Nastavení"],
  [/\bAll Tasks\b/g, "Všechny úkoly"],
  [/\bUpcoming\b/g, "Nadcházející"],
  [/\bPriority\b/g, "Priorita"],
  [/\bCompleted\b/g, "Dokončeno"],
  [/\bReal Estate\b/g, "Reality"],
  [/\bStock\b/g, "Sklad"],
  [/\bLabels\b/g, "Štítky"],
  [/\bArchive\b/g, "Archiv"],
  [/\bSnoozed\b/g, "Odloženo"],
  [/\bTrash\b/g, "Koš"],
  [/\bSupport\b/g, "Podpora"],
  [/\bFeedback\b/g, "Zpětná vazba"],
  [/\bEvents\b/g, "Události"],
  [/\bMeetings\b/g, "Schůzky"],
  [/\bReminders\b/g, "Připomínky"],
  [/\bSchedule\b/g, "Rozvrh"],
  [/\bStatus\b/g, "Stav"],
  [/\bDescription\b/g, "Popis"],
  [/\bDark mode\b/g, "Tmavý režim"],
  [/\bLight mode\b/g, "Světlý režim"],
  [/\bGenerate\b/g, "Generovat"],
  [/\bOrder\b/g, "Objednávka"],
  [/\bOrders\b/g, "Objednávky"],
  [/\bCategory\b/g, "Kategorie"],
  [/\bCategories\b/g, "Kategorie"],
  [/\bRows per page\b/g, "Řádků na stránku"],
  [/\bPayment\b/g, "Platba"],
  [/\bPayments\b/g, "Platby"],
  [/\bPayment Method\b/g, "Metoda platby"],
  [/\bPayment Methods\b/g, "Platební metody"],
  [/\bPayment Status\b/g, "Stav platby"],
  [/\bClosed Won\b/g, "Uzavřeno - výhra"],
  [/\bClosed Lost\b/g, "Uzavřeno - prohra"],
  [/\bProspecting\b/g, "Průzkum"],
  [/\bQualification\b/g, "Kvalifikace"],
  [/\bProposal\b/g, "Nabídka"],
  [/\bNegotiation\b/g, "Vyjednávání"],
  [/\bPaid\b/g, "Zaplaceno"],
  [/\bPending\b/g, "Čeká"],
  [/\bFailed\b/g, "Neúspěšné"],
  [/\bSearch shop\b/g, "Hledat v obchodě"],
  [/Search deals\.\.\./g, "Hledat obchody..."],
  [/\bSearch by ID\b/g, "Hledat podle ID"],
  [/Search payment status\.\.\./g, "Hledat stav platby..."],
  [/\borders found\b/g, "objednávek nalezeno"],
  [/\bneeds your attention\b/g, "vyžaduje vaši pozornost"],
  [/\bCustomer\b/g, "Zákazník"],
  [/\bProduct\b/g, "Produkt"],
  [/\bInventory\b/g, "Inventář"],
  [/\bProducts\b/g, "Produkty"],
  [/Search deals\s*\.{3,4}/g, "Hledat obchody..."],
  [/Type your message here\./g, "Sem napište zprávu."],
  [/Type your message\.\.\./g, "Napište zprávu..."],
  [/Write a message\.\.\./g, "Napište zprávu..."],
  [/Write your reply\.\.\./g, "Napište odpověď..."],
  [/Write your comment\.\.\./g, "Napište komentář..."],
  [/\bMessage\.\.\./g, "Zpráva..."],
  [/\bMore Actions\b/g, "Další akce"],
  [/\bFilter\.\.\./g, "Filtr..."],
  [/\bSearch\.\.\./g, "Hledat..."],
  [/Search tasks\.\.\./g, "Hledat úkoly..."],
  [/Search contacts\.\.\./g, "Hledat kontakty..."],
  [/Search notes or category\.\.\./g, "Hledat poznámky nebo kategorii..."],
  [/Search category\.\.\./g, "Hledat kategorii..."],
  [/Search supplier\.\.\./g, "Hledat dodavatele..."],
  [/Search carrier\.\.\./g, "Hledat dopravce..."],
  [/Search trends\.\.\./g, "Hledat trendy..."],
  [/Search handler\.\.\./g, "Hledat správce..."],
  [/Search stock levels\.\.\./g, "Hledat stav skladu..."],
  [/Search Reorder In\.\.\./g, "Hledat doplnění za..."],
  [/Search user\.\.\./g, "Hledat uživatele..."],
  [/Search company\.\.\./g, "Hledat firmu..."],
  [/Search position\.\.\./g, "Hledat pozici..."],
  [/Search social media\.\.\./g, "Hledat sociální síť..."],
  [/Search Email\.\.\./g, "Hledat email..."],
  [/Search Address\.\.\./g, "Hledat adresu..."],
  [/Search country\.\.\./g, "Hledat zemi..."],
  [/Search location\.\.\./g, "Hledat lokaci..."],
  [/Search ARR\.\.\./g, "Hledat ARR..."],
  [/Search Employee Range\.\.\./g, "Hledat rozsah zaměstnanců..."],
  [/\bGeneral Settings\b/g, "Obecné nastavení"],
  [/\bShipping & Delivery\b/g, "Doprava a doručení"],
  [/\bInventory Summary\b/g, "Souhrn skladu"],
  [/\bBest Sellers\b/g, "Nejprodávanější"],
  [/\bExport CSV\b/g, "Export CSV"],
  [/\bArchive all\b/g, "Archivovat vše"],
  [/\bMark all as read\b/g, "Označit vše jako přečtené"],
  [/\bView Projects\b/g, "Zobrazit projekty"],
  [/\bNo Results\b/g, "Žádné výsledky"],
  [/\bSave Task\b/g, "Uložit úkol"],
  [/\bSave Note\b/g, "Uložit poznámku"],
  [/\bAdd company\b/g, "Přidat firmu"],
  [/\bCustomer View\b/g, "Pohled zákazníka"],
  [/\bEdit Product\b/g, "Upravit produkt"],
  [/\bBuy Shipping Label\b/g, "Koupit štítek zásilky"],
  [/\bCancel Order\b/g, "Zrušit objednávku"],
  [/\bNotify Customer\b/g, "Informovat zákazníka"],
  [/\bSend Email\b/g, "Poslat email"],
  [/\bEdit Details\b/g, "Upravit detaily"],
  [/\bOverview\b/g, "Přehled"],
  [/\bInvoices\b/g, "Faktury"],
  [/\bBilling Details\b/g, "Fakturační údaje"],
  [/\bReviews\b/g, "Hodnocení"],
  [/\bActivity\b/g, "Aktivita"],
  [/\bOrder Status\b/g, "Stav objednávky"],
  [/\bDue Date\b/g, "Datum splatnosti"],
  [/\bPayment St\.\b/g, "Stav platby"],
  [/\bActions\b/g, "Akce"],
  [/\bDate\b/g, "Datum"],
  [/\bAmount\b/g, "Částka"],
  [/\bCountry\b/g, "Země"],
  [/\bWarehouse\b/g, "Sklad"],
  [/\bTracking\b/g, "Tracking"],
  [/\bNotify\b/g, "Upozornit"],
  [/\bUpdated\b/g, "Aktualizováno"],
  [/\bSupplier\b/g, "Dodavatel"],
  [/\bPrice\b/g, "Cena"],
  [/\bTrends\b/g, "Trendy"],
  [/\bStock Flow\b/g, "Tok skladu"],
  [/\bDelta\b/g, "Rozdíl"],
  [/\bFlow\b/g, "Tok"],
  [/\bReorder In\b/g, "Doplnit za"],
  [/\bReorder\b/g, "Doplnit"],
  [/\bLead Time\b/g, "Dodací lhůta"],
  [/\bOrder Date\b/g, "Datum objednávky"],
  [/\bArrival Date\b/g, "Datum doručení"],
  [/\bExp\. Delivery\b/g, "Oček. doručení"],
  [/\bProduct Info\b/g, "Info o produktu"],
  [/\bProducts QTY\b/g, "Počet produktů"],
  [/\bTotal Earnings\b/g, "Celkové výnosy"],
  [/\bFeatured\b/g, "Doporučené"],
  [/\bTotal Spent\b/g, "Celkem utraceno"],
  [/\bAvg\. Spent\b/g, "Průměrně utraceno"],
  [/\bLast Order\b/g, "Poslední objednávka"],
  [/\bInvoiceID\b/g, "ID faktury"],
  [/\bOrderID?\b/g, "ID objednávky"],
];

const SKIP_TAGS = new Set([
  "SCRIPT",
  "STYLE",
  "CODE",
  "PRE",
  "NOSCRIPT",
]);

function isLikelyNonUiText(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return true;
  if (/^https?:\/\//i.test(trimmed)) return true;
  if (/^\/core\//.test(trimmed)) return true;
  if (/^[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}$/.test(trimmed)) return true;
  if (/^[\d\s.,:;()[\]{}\-+/*%#]+$/.test(trimmed)) return true;
  return false;
}

function translateText(input: string): string {
  if (!input) return input;
  const match = input.match(/^(\s*)(.*?)(\s*)$/s);
  if (!match) return input;

  const [, leading, core, trailing] = match;
  if (!core || isLikelyNonUiText(core)) return input;

  if (EXACT_MAP[core]) {
    return `${leading}${EXACT_MAP[core]}${trailing}`;
  }

  let next = core;
  for (const [pattern, replacement] of REPLACEMENTS) {
    next = next.replace(pattern, replacement);
  }

  return `${leading}${next}${trailing}`;
}

function translateTextToEn(input: string): string {
  if (!input) return input;
  const match = input.match(/^(\s*)(.*?)(\s*)$/s);
  if (!match) return input;

  const [, leading, core, trailing] = match;
  if (!core || isLikelyNonUiText(core)) return input;

  const exact = REVERSE_EXACT_MAP[core];
  if (exact) return `${leading}${exact}${trailing}`;

  let next = core;
  for (const [en, cs] of Object.entries(EXACT_MAP)) {
    if (!cs) continue;
    next = next.split(cs).join(en);
  }
  return `${leading}${next}${trailing}`;
}

function rememberOriginalAttribute(el: Element, attrName: string, value: string) {
  let attrs = originalAttr.get(el);
  if (!attrs) {
    attrs = new Map<string, string>();
    originalAttr.set(el, attrs);
  }
  if (!attrs.has(attrName)) {
    attrs.set(attrName, value);
  }
}

function translateAttributes(el: Element): void {
  const attributeNames = ["placeholder", "title", "aria-label"];
  for (const name of attributeNames) {
    const value = el.getAttribute(name);
    if (!value) continue;
    rememberOriginalAttribute(el, name, value);
    const translated = translateText(value);
    if (translated !== value) {
      el.setAttribute(name, translated);
    }
  }
}

function translateAttributesToEn(el: Element): void {
  const attributeNames = ["placeholder", "title", "aria-label"];
  for (const name of attributeNames) {
    const value = el.getAttribute(name);
    if (!value) continue;
    rememberOriginalAttribute(el, name, value);
    const translated = translateTextToEn(value);
    if (translated !== value) {
      el.setAttribute(name, translated);
    }
  }
}

function restoreAttributes(el: Element): void {
  const attrs = originalAttr.get(el);
  if (!attrs) return;
  for (const [key, value] of attrs.entries()) {
    el.setAttribute(key, value);
  }
}

function translateNodeTreeToEn(root: Node): void {
  if (root.nodeType === Node.TEXT_NODE) {
    const textNode = root as Text;
    const parent = textNode.parentElement;
    if (!parent) return;
    if (SKIP_TAGS.has(parent.tagName)) return;
    if (parent.closest("[data-no-localize='true']")) return;

    const current = textNode.textContent ?? "";
    if (!originalText.has(textNode)) {
      originalText.set(textNode, current);
    }

    const translated = translateTextToEn(current);
    if (translated !== current) {
      textNode.textContent = translated;
    }
    return;
  }

  if (root.nodeType !== Node.ELEMENT_NODE) return;

  const element = root as Element;
  if (SKIP_TAGS.has(element.tagName)) return;
  if (element.closest("[data-no-localize='true']")) return;

  translateAttributesToEn(element);

  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  let current = walker.nextNode();
  while (current) {
    translateNodeTreeToEn(current);
    current = walker.nextNode();
  }
}

function translateNodeTree(root: Node): void {
  if (root.nodeType === Node.TEXT_NODE) {
    const textNode = root as Text;
    const parent = textNode.parentElement;
    if (!parent) return;
    if (SKIP_TAGS.has(parent.tagName)) return;
    if (parent.closest("[data-no-localize='true']")) return;

    const current = textNode.textContent ?? "";
    if (!originalText.has(textNode)) {
      originalText.set(textNode, current);
    }

    const translated = translateText(current);
    if (translated !== current) {
      textNode.textContent = translated;
    }
    return;
  }

  if (root.nodeType !== Node.ELEMENT_NODE) return;

  const element = root as Element;
  if (SKIP_TAGS.has(element.tagName)) return;
  if (element.closest("[data-no-localize='true']")) return;

  translateAttributes(element);

  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  let current = walker.nextNode();
  while (current) {
    translateNodeTree(current);
    current = walker.nextNode();
  }
}

function restoreNodeTree(root: Node): void {
  if (root.nodeType === Node.TEXT_NODE) {
    const textNode = root as Text;
    const parent = textNode.parentElement;
    if (!parent || SKIP_TAGS.has(parent.tagName)) return;
    const original = originalText.get(textNode);
    if (original !== undefined) {
      textNode.textContent = original;
    }
    return;
  }

  if (root.nodeType !== Node.ELEMENT_NODE) return;

  const element = root as Element;
  if (SKIP_TAGS.has(element.tagName)) return;
  restoreAttributes(element);

  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  let current = walker.nextNode();
  while (current) {
    restoreNodeTree(current);
    current = walker.nextNode();
  }
}

export function CoreCsLocalizer({ language }: { language: AppLanguage }) {
  const location = useLocation();

  useEffect(() => {
    const isCore = location.pathname.startsWith("/core");
    if (!isCore) {
      document.documentElement.lang = "en";
      return;
    }

    document.documentElement.lang = language === "cs" ? "cs" : "en";
    const root = document.querySelector("main") ?? document.body;

    if (language === "cs") {
      translateNodeTree(root);
    } else {
      restoreNodeTree(root);
      translateNodeTreeToEn(root);
    }

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "characterData" && mutation.target) {
          if (language === "cs") {
            translateNodeTree(mutation.target);
          } else {
            restoreNodeTree(mutation.target);
            translateNodeTreeToEn(mutation.target);
          }
          continue;
        }

        for (const node of Array.from(mutation.addedNodes)) {
          if (language === "cs") {
            translateNodeTree(node);
          } else {
            restoreNodeTree(node);
            translateNodeTreeToEn(node);
          }
        }
      }
    });

    observer.observe(root, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => observer.disconnect();
  }, [location.pathname, language]);

  return null;
}
