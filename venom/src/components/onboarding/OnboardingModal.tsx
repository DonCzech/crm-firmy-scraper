"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { PlatformLocale } from "@/lib/platform-i18n";
import { CATEGORIES as DESIGN_CATEGORIES, categoryForSlug } from "@/lib/templates/design-categories";

type Step = "choice" | "ai-brief" | "templates" | "register" | "agency" | "building" | "done";
type Kind = "web" | "eshop";

const BUILD_STEPS = [
  "Připravuje se doména",
  "Vytváří se databáze",
  "Kopíruje se šablona",
  "Nastavuje se design",
  "Aktivuje se editor",
  "Hotovo",
];

const BUILD_STEPS_EN = [
  "Preparing the domain",
  "Creating the database",
  "Copying the template",
  "Setting up the design",
  "Activating the editor",
  "Done",
];

const ESHOP_BUILD_STEPS = [
  "Připravuje se doména",
  "Vytváří se databáze",
  "Nahrávají se produkty",
  "Nastavuje se košík a platby",
  "Aktivuje se administrace",
  "Hotovo",
];

const ESHOP_BUILD_STEPS_EN = [
  "Preparing the domain",
  "Creating the database",
  "Loading the products",
  "Setting up cart and payments",
  "Activating the admin",
  "Done",
];

const BUILDER_BUILD_STEPS = [
  "Zakládá se projekt",
  "Připravuje se prázdné plátno",
  "Startuje AI studio",
  "Připisují se kredity zdarma",
  "Hotovo",
];

const BUILDER_BUILD_STEPS_EN = [
  "Creating the project",
  "Preparing the blank canvas",
  "Starting the AI studio",
  "Adding free credits",
  "Done",
];

/** Klíč, přes který builder převezme první zadání (viz BuilderShell). */
const builderBriefKey = (slug: string) => `webero-builder-brief:${slug}`;

const BRIEF_EXAMPLES = [
  "Web pro půjčovnu lodí s ceníkem a rezervačním formulářem",
  "E-shop s ručně šitými batohy",
  "Portfolio pro fotografku — galerie a kontakt",
  "Landing page pro mobilní aplikaci",
];

const BRIEF_EXAMPLES_EN = [
  "A website for a boat rental with pricing and a booking form",
  "An e-shop with handmade backpacks",
  "A portfolio for a photographer — gallery and contact",
  "A landing page for a mobile app",
];

export interface ModalTemplate {
  key: string;
  name: string;
  industry?: string | null;
  previewImage?: string | null;
  demoUrl?: string | null;
}

interface Props {
  onClose: () => void;
  locale?: PlatformLocale;
  initialTemplate?: string;
  templateName?: string;
  catalogTemplates?: ModalTemplate[];
  /** Deep-link vstup (dashboard „Nový projekt"): rovnou AI brief / výběr šablony. */
  initialStep?: "ai-brief" | "templates" | "templates-eshop";
}

const INDUSTRY_LABELS: Record<string, string> = {
  barber: "Barber", beauty: "Beauty", bakery: "Pekárny", catering: "Catering",
  stavba: "Stavba", elektro: "Elektro", instala: "Instalatérství", florist: "Květinářství",
  sweet: "Sweet", autoskola: "Autoškoly", lang: "Jazyky", kids: "Děti",
  vet: "Veterináři", pethotel: "Pet hotely", grooming: "Grooming", ucetni: "Účetnictví",
  solar: "Fotovoltaika", arch: "Architekti", clean: "Úklid", klima: "Klimatizace",
  floors: "Podlahy", malir: "Malíři", garden: "Zahrady", klempir: "Klempířství",
  arbo: "Arboristika", ddd: "DDD", chalet: "Chalupy", hotel: "Hotely",
  photo: "Fotografové", events: "Eventy", dj: "DJ", video: "Video",
  autoservis: "Autoservis", hairdresser: "Kadeřnictví", wellness: "Wellness",
  nails: "Nehty", tattoo: "Tattoo", fitness: "Fitness", physio: "Fyzio",
  dentist: "Stomatologie", lawyer: "Advokát", realEstate: "Reality",
  auto: "Auto", construction: "Stavebnictví", clinic: "Klinika",
  accounting: "Účetnictví", finance: "Finance", architecture: "Architektura",
  photographer: "Foto", restaurant: "Restaurace", cafe: "Kavárny",
  education: "Vzdělávání", pets: "Mazlíčci", sluzby: "Služby",
  landing: "Landing page", gastro: "Gastronomie", eshop: "E-shopy",
};

const INDUSTRY_LABELS_EN: Record<string, string> = {
  barber: "Barber", beauty: "Beauty", bakery: "Bakery", catering: "Catering",
  stavba: "Construction", elektro: "Electrical", instala: "Plumbing", florist: "Florist",
  sweet: "Sweets", autoskola: "Driving schools", lang: "Languages", kids: "Kids",
  vet: "Veterinary", pethotel: "Pet hotels", grooming: "Grooming", ucetni: "Accounting",
  solar: "Solar", arch: "Architects", clean: "Cleaning", klima: "Air conditioning",
  floors: "Flooring", malir: "Painters", garden: "Gardens", klempir: "Sheet metal",
  arbo: "Arborists", ddd: "Pest control", chalet: "Chalets", hotel: "Hotels",
  photo: "Photographers", events: "Events", dj: "DJ", video: "Video",
  autoservis: "Car service", hairdresser: "Hair salon", wellness: "Wellness",
  nails: "Nails", tattoo: "Tattoo", fitness: "Fitness", physio: "Physio",
  dentist: "Dentistry", lawyer: "Lawyer", realEstate: "Real estate",
  auto: "Auto", construction: "Construction", clinic: "Clinic",
  accounting: "Accounting", finance: "Finance", architecture: "Architecture",
  photographer: "Photo", restaurant: "Restaurant", cafe: "Cafe",
  education: "Education", pets: "Pets", sluzby: "Services",
  landing: "Landing page", gastro: "Gastronomy", eshop: "E-shops",
};

function industryFromKey(key: string): string {
  return key.split("-")[0] ?? "";
}

function isEshopTemplate(t: ModalTemplate): boolean {
  return (t.industry ?? industryFromKey(t.key)) === "eshop";
}

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

const FALLBACK_TEMPLATES: ModalTemplate[] = [
  { key: "stavba-01", name: "Stavba Pro", industry: "stavba", previewImage: "/images/template-previews/barber-hero-1440x900.webp" },
  { key: "wellness", name: "Wellness Studio", industry: "wellness", previewImage: "/images/template-gallery/wellness-05-relax-massage-full-1920x1080.webp" },
  { key: "lawyer", name: "Advokátní kancelář", industry: "lawyer", previewImage: "/images/template-previews/lawyer-hero-1440x900.webp" },
];

const BUDGET_OPTIONS = [
  "20 – 50 tis.",
  "50 – 120 tis.",
  "120 – 300 tis.",
  "300 tis. a více",
];

const BUDGET_OPTIONS_EN = [
  "CZK 20-50k",
  "CZK 50-120k",
  "CZK 120-300k",
  "CZK 300k and more",
];

const TIMELINE_OPTIONS = ["Co nejdřív", "Do měsíce", "Do 3 měsíců", "Nespěchá to"];
const TIMELINE_OPTIONS_EN = ["ASAP", "Within a month", "Within 3 months", "No rush"];

const AGENCY_PROJECT_TYPES: { value: string; cs: string; en: string; icon: "web" | "eshop" | "redesign" | "other" }[] = [
  { value: "Nový web", cs: "Nový web", en: "New website", icon: "web" },
  { value: "Nový e-shop", cs: "Nový e-shop", en: "New e-shop", icon: "eshop" },
  { value: "Redesign stávajícího webu", cs: "Redesign stávajícího webu", en: "Redesign of an existing site", icon: "redesign" },
  { value: "Něco jiného", cs: "Něco jiného", en: "Something else", icon: "other" },
];

const ONBOARDING_COPY = {
  cs: {
    close: "Zavřít",
    back: "Zpět",
    // ── Krok volby ──
    choiceKicker: "webero.",
    choiceTitle: "Co dnes postavíme?",
    choiceSub: "Vyberte si cestu. Všechno jde kdykoliv změnit — nic není napořád.",
    webTag: "Šablony",
    webTitle: "Web",
    webText: "Prezentace firmy, služeb nebo portfolia. Vyberete si hotový design a jen doplníte své.",
    webMeta: "90+ šablon podle oborů",
    webCta: "Vybrat šablonu webu",
    eshopTag: "Prodej online",
    eshopTitle: "E-shop",
    eshopText: "Kompletní obchod — produkty, košík, doprava i platby. Připravený prodávat od prvního dne.",
    eshopMeta: "20 e-shopů · platby v ceně",
    eshopCta: "Vybrat šablonu e-shopu",
    aiTag: "Webero Builder",
    aiBadge: "Novinka",
    aiTitle: "Postavit cokoliv",
    aiText: "Popište svůj nápad a AI postaví web nebo e-shop od nuly — během pár minut, přesně podle vás.",
    aiMeta: "Startovní kredity zdarma",
    aiCta: "Začít tvořit s AI",
    proTag: "Prémiová služba",
    proTitle: "Uděláme to za vás",
    proText: "Nechte to na profesionálech. Návrh, texty, spuštění — web i e-shop na klíč. Přijímáme jen 8 klientů měsíčně.",
    proMeta: "Odpověď do 24 hodin",
    proCta: "Nezávazná poptávka",
    trialNote: "14 dní zdarma · bez kreditní karty",
    // ── AI brief ──
    briefTitle: "Co spolu postavíme?",
    briefText: "Popište projekt vlastními slovy. Čím víc detailů — obor, služby, styl — tím lepší první verze. Doladíme ji pak společně v konverzaci.",
    briefPlaceholder: "Např. „Web pro moje bistro v Brně — menu, otevírací doba, rezervace stolu. Moderní, teplé barvy…“",
    briefContinue: "Pokračovat",
    briefHint: "První sestavení webu máte zdarma — na účet dostanete startovní kredity.",
    briefTry: "Nebo zkuste:",
    // ── Registrace (až po výběru šablony) ──
    registerTitle: "Poslední krok — váš účet",
    registerText: "14 dní zdarma, bez kreditní karty, přístup ke všem funkcím. Web vytvoříme hned po registraci.",
    registerBuilderTitle: "Poslední krok — váš účet",
    registerBuilderText: "14 dní zdarma, bez kreditní karty. AI studio se otevře hned po registraci.",
    yourChoice: "Vaše volba",
    name: "Jméno *",
    email: "E-mail *",
    phone: "Telefon",
    password: "Heslo (min. 6 znaků) *",
    createAccount: "Vytvořit web zdarma",
    createEshopAccount: "Vytvořit e-shop zdarma",
    haveAccount: "Máte účet?",
    login: "Přihlásit se",
    // ── Šablony ──
    conceptsTitleWeb: "Vyberte si šablonu webu",
    conceptsTitleEshop: "Vyberte si šablonu e-shopu",
    conceptsTextWeb: "Hotové koncepty s designem, obsahem i funkcemi pro váš obor. Změnit v nich můžete úplně všechno.",
    conceptsTextEshop: "Každý e-shop má produkty, košík, dopravu i platby. Vyberte design — zboží pak nahrajete své.",
    all: "Vše",
    none: "V kategorii nic nenalezeno",
    showAll: "Zobrazit vše →",
    use: "Použít",
    mobile: "Mobil",
    desktopPreview: "Desktop náhled",
    mobilePreview: "Mobilní náhled",
    selected: "Vybráno:",
    continue: "Pokračovat dál",
    // ── Dotazník „Uděláme to za vás" ──
    agStepWord: "Krok",
    agOf: "ze",
    agNext: "Pokračovat",
    agBack: "Zpět",
    agSubmit: "Odeslat poptávku",
    agSending: "Odesílám…",
    agQ1: "Co pro vás máme postavit?",
    agQ1Sub: "Vyberte, co je vašemu projektu nejblíž.",
    agQ2: "Řekněte nám o projektu",
    agQ2Sub: "Pár vět stačí. Na detailech se domluvíme na společné schůzce.",
    agGoal: "Čeho má web dosáhnout? Co má umět? *",
    agGoalPlaceholder: "Např. „Chceme prodávat kurzy online, dnes vše řešíme přes e-maily. Web má působit prémiově a odbavit platby.“",
    agInspo: "Weby, které se vám líbí (odkazy)",
    agInspoPlaceholder: "www.priklad.cz, www.dalsi-inspirace.com",
    agCurrentWeb: "Váš stávající web (pokud existuje)",
    agCurrentWebPlaceholder: "www.vase-firma.cz",
    agQ3: "Rozpočet a termín",
    agQ3Sub: "Podle rozpočtu poznáme, jaký rozsah řešení má smysl navrhnout.",
    agBudgetLabel: "Rozpočet (CZK) *",
    agTimelineLabel: "Kdy chcete spustit?",
    agQ4: "Na koho se máme obrátit?",
    agQ4Sub: "Ozveme se do 24 hodin a domluvíme 30minutovou online schůzku.",
    agName: "Jméno a příjmení *",
    agCompany: "Firma",
    agEmailField: "E-mail *",
    agPhoneField: "Telefon",
    agReplyName: "Jan Novák — Webero studio",
    agReplyNote: "Odpovídá do 24 hodin",
    sentTitle: "Poptávka odeslána!",
    sentText: "Ozveme se vám do 24 hodin a domluvíme si 30minutovou online schůzku, kde projdeme detaily zadání.",
    sentMeanwhile: "Mezitím si můžete prohlédnout šablony",
    sentClose: "Zavřít",
    goalTooShort: "Popište prosím cíl projektu alespoň pár slovy.",
    // ── Building / done ──
    buildingTitle: "Váš web se už chystá",
    buildingTitleEshop: "Váš e-shop se už chystá",
    stepWord: "krok z",
    doneLabel: "Hotovo",
    doneTitleA: "Váš web je",
    doneTitleAEshop: "Váš e-shop je",
    doneTitleB: "připravený.",
    credentials: "Přihlašovací údaje",
    passwordValue: "vaše zadané heslo",
    loginHelp: "Pro přihlášení do editoru kdykoliv znovu.",
    confirmation: "Potvrzení na",
    openEditor: "Otevřít editor",
    websitePreview: "Náhled webu",
    serverError: "Nepodařilo se připojit k serveru. Zkuste to znovu.",
    buildError: "Chyba při vytváření webu",
    chooseTemplate: "Vybrat šablonu",
    signedInAs: "Přihlášen jako",
  },
  en: {
    close: "Close",
    back: "Back",
    choiceKicker: "webero.",
    choiceTitle: "What are we building today?",
    choiceSub: "Pick your path. Everything can be changed later — nothing is forever.",
    webTag: "Templates",
    webTitle: "Website",
    webText: "A presentation for your company, services, or portfolio. Pick a finished design and add your content.",
    webMeta: "90+ templates by industry",
    webCta: "Choose a website template",
    eshopTag: "Sell online",
    eshopTitle: "E-shop",
    eshopText: "A complete store — products, cart, shipping, and payments. Ready to sell from day one.",
    eshopMeta: "20 e-shops · payments included",
    eshopCta: "Choose an e-shop template",
    aiTag: "Webero Builder",
    aiBadge: "New",
    aiTitle: "Build anything",
    aiText: "Describe your idea and AI builds a website or e-shop from scratch — in minutes, exactly your way.",
    aiMeta: "Free starter credits",
    aiCta: "Start building with AI",
    proTag: "Premium service",
    proTitle: "We build it for you",
    proText: "Leave it to the professionals. Design, copy, launch — website or e-shop turnkey. We accept only 8 clients per month.",
    proMeta: "Reply within 24 hours",
    proCta: "Request a quote",
    trialNote: "14 days free · no credit card",
    briefTitle: "What shall we build?",
    briefText: "Describe your project in your own words. The more detail — industry, services, style — the better the first version. We'll fine-tune it together in a conversation.",
    briefPlaceholder: "E.g. “A website for my bistro in Brno — menu, opening hours, table booking. Modern, warm colors…”",
    briefContinue: "Continue",
    briefHint: "Your first website build is free — you'll get starter credits on your account.",
    briefTry: "Or try:",
    registerTitle: "Last step — your account",
    registerText: "14 days free, no credit card, access to every feature. Your site is created right after sign-up.",
    registerBuilderTitle: "Last step — your account",
    registerBuilderText: "14 days free, no credit card. The AI studio opens right after sign-up.",
    yourChoice: "Your choice",
    name: "Name *",
    email: "Email *",
    phone: "Phone",
    password: "Password (min. 6 characters) *",
    createAccount: "Create my website free",
    createEshopAccount: "Create my e-shop free",
    haveAccount: "Already have an account?",
    login: "Log in",
    conceptsTitleWeb: "Choose your website template",
    conceptsTitleEshop: "Choose your e-shop template",
    conceptsTextWeb: "Finished concepts with design, content, and features for your industry. You can change absolutely everything.",
    conceptsTextEshop: "Every e-shop includes products, cart, shipping, and payments. Pick the design — then upload your own goods.",
    all: "All",
    none: "Nothing found in this category",
    showAll: "Show all →",
    use: "Use",
    mobile: "Mobile",
    desktopPreview: "Desktop preview",
    mobilePreview: "Mobile preview",
    selected: "Selected:",
    continue: "Continue",
    agStepWord: "Step",
    agOf: "of",
    agNext: "Continue",
    agBack: "Back",
    agSubmit: "Send request",
    agSending: "Sending…",
    agQ1: "What should we build for you?",
    agQ1Sub: "Pick whatever is closest to your project.",
    agQ2: "Tell us about the project",
    agQ2Sub: "A few sentences are enough. We'll cover the details in a call.",
    agGoal: "What should the website achieve? What should it do? *",
    agGoalPlaceholder: "E.g. “We want to sell courses online; today everything runs over e-mail. The site should feel premium and handle payments.”",
    agInspo: "Websites you like (links)",
    agInspoPlaceholder: "www.example.com, www.another-inspiration.com",
    agCurrentWeb: "Your current website (if any)",
    agCurrentWebPlaceholder: "www.your-company.com",
    agQ3: "Budget and timing",
    agQ3Sub: "The budget tells us what scope of solution makes sense to propose.",
    agBudgetLabel: "Budget (CZK) *",
    agTimelineLabel: "When do you want to launch?",
    agQ4: "Who should we contact?",
    agQ4Sub: "We'll get back within 24 hours and schedule a 30-minute online call.",
    agName: "Full name *",
    agCompany: "Company",
    agEmailField: "Email *",
    agPhoneField: "Phone",
    agReplyName: "Jan Novak — Webero studio",
    agReplyNote: "Replies within 24 hours",
    sentTitle: "Request sent!",
    sentText: "We will get back to you within 24 hours and schedule a 30-minute online call to go through your brief.",
    sentMeanwhile: "Meanwhile, you can browse the templates",
    sentClose: "Close",
    goalTooShort: "Please describe the project goal in at least a few words.",
    buildingTitle: "Your website is being prepared",
    buildingTitleEshop: "Your e-shop is being prepared",
    stepWord: "step of",
    doneLabel: "Done",
    doneTitleA: "Your website is",
    doneTitleAEshop: "Your e-shop is",
    doneTitleB: "ready.",
    credentials: "Login details",
    passwordValue: "your chosen password",
    loginHelp: "Use these to log into the editor anytime.",
    confirmation: "Confirmation sent to",
    openEditor: "Open editor",
    websitePreview: "Website preview",
    serverError: "Could not connect to the server. Please try again.",
    buildError: "Error while creating the website",
    chooseTemplate: "Choose template",
    signedInAs: "Signed in as",
  },
} as const;

/* Ikony pro dotazník */
function AgTypeIcon({ icon }: { icon: "web" | "eshop" | "redesign" | "other" }) {
  const common = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (icon === "web") return <svg {...common}><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 9h20M6 6.5h.01M9 6.5h.01"/></svg>;
  if (icon === "eshop") return <svg {...common}><path d="M6 7h12l1.5 13h-15L6 7z"/><path d="M9 10V6a3 3 0 016 0v4"/></svg>;
  if (icon === "redesign") return <svg {...common}><path d="M21 12a9 9 0 11-2.6-6.4"/><path d="M21 3v6h-6"/></svg>;
  return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 114 2c-.8.6-1.5 1-1.5 2M12 17h.01"/></svg>;
}

export function OnboardingModal({ onClose, locale = "cs", initialTemplate, templateName, catalogTemplates, initialStep }: Props) {
  const copy = ONBOARDING_COPY[locale];
  const budgetOptions = locale === "en" ? BUDGET_OPTIONS_EN : BUDGET_OPTIONS;
  const timelineOptions = locale === "en" ? TIMELINE_OPTIONS_EN : TIMELINE_OPTIONS;
  const [step, setStep] = useState<Step>(
    initialTemplate
      ? "register"
      : initialStep === "templates" || initialStep === "templates-eshop"
        ? "templates"
        : initialStep === "ai-brief"
          ? "ai-brief"
          : "choice"
  );
  // "diy" = klasický výběr šablony, "builder" = AI Builder („Postavit cokoliv")
  const [flow, setFlow] = useState<"diy" | "builder">(initialStep === "ai-brief" ? "builder" : "diy");
  // "web" | "eshop" — kterou rodinu šablon uživatel vybírá
  const [kind, setKind] = useState<Kind>(
    initialStep === "templates-eshop" || initialTemplate?.startsWith("eshop-") ? "eshop" : "web"
  );
  const [brief, setBrief] = useState("");
  // Přihlášený uživatel (webero_user_token) přeskakuje registraci — další
  // projekt se založí pod jeho účtem přes /api/account/tenants.
  const [loggedInEmail, setLoggedInEmail] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [template, setTemplate] = useState<string>(initialTemplate ?? "");
  const [category, setCategory] = useState<string>("all");
  const [buildStep, setBuildStep] = useState(0);
  const [editorUrl, setEditorUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [, setAccessToken] = useState("");
  const [error, setError] = useState("");

  // Dotazník „Uděláme to za vás" — 4 kroky
  const [agStep, setAgStep] = useState(0);
  const [agProjectType, setAgProjectType] = useState("");
  const [agGoal, setAgGoal] = useState("");
  const [agInspo, setAgInspo] = useState("");
  const [agCurrentWeb, setAgCurrentWeb] = useState("");
  const [agBudget, setAgBudget] = useState("");
  const [agTimeline, setAgTimeline] = useState("");
  const [agName, setAgName] = useState("");
  const [agCompany, setAgCompany] = useState("");
  const [agEmail, setAgEmail] = useState("");
  const [agPhone, setAgPhone] = useState("");
  const [agSending, setAgSending] = useState(false);
  const [agError, setAgError] = useState("");
  const [agSent, setAgSent] = useState(false);

  const [fetchedTemplates, setFetchedTemplates] = useState<ModalTemplate[] | null>(null);
  const [fetching, setFetching] = useState(false);
  const [previewSheet, setPreviewSheet] = useState<ModalTemplate | null>(null);
  const [previewView, setPreviewView] = useState<"desktop" | "mobile">("desktop");
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(max-width: 640px)").matches) setIsMobileDevice(true);
  }, []);

  useEffect(() => {
    fetch("/api/account/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.email) {
          setLoggedInEmail(data.email as string);
          setEmail(data.email as string);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    /* Načítáme i s initialTemplate — katalog nese demoUrl, bez kterého by
       náhled spadl na statický obrázek místo živé stránky. */
    if (catalogTemplates && catalogTemplates.length > 0) return;
    if (fetchedTemplates) return;
    setFetching(true);
    fetch("/api/templates/approved")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data?.items)) setFetchedTemplates(data.items);
      })
      .catch(() => {})
      .finally(() => setFetching(false));
  }, [initialTemplate, catalogTemplates, fetchedTemplates]);

  const allTemplates: ModalTemplate[] = useMemo(() => {
    if (catalogTemplates && catalogTemplates.length > 0) return catalogTemplates;
    if (fetchedTemplates && fetchedTemplates.length > 0) return fetchedTemplates;
    return FALLBACK_TEMPLATES;
  }, [catalogTemplates, fetchedTemplates]);

  /* Šablony rozdělené podle zvolené cesty: Web vs E-shop. */
  const pickerTemplates: ModalTemplate[] = useMemo(
    () => allTemplates.filter((t) => (kind === "eshop" ? isEshopTemplate(t) : !isEshopTemplate(t))),
    [allTemplates, kind]
  );

  /* Přepnutí Web ↔ E-shop nesmí nechat viset výběr z druhé rodiny.
     Nic se NEPŘEDVYBÍRÁ — uživatel musí šablonu zvolit sám. */
  useEffect(() => {
    if (!initialTemplate && template && !pickerTemplates.some((t) => t.key === template)) {
      setTemplate("");
    }
  }, [pickerTemplates, template, initialTemplate]);

  /* Kategorie = široké skupiny sdílené s /vybrat-design a homepage
     (místo desítek oborových kódů, kde některé měly jedinou šablonu). */
  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const t of pickerTemplates) {
      const cat = categoryForSlug(t.key);
      if (cat) counts.set(cat.label, (counts.get(cat.label) ?? 0) + 1);
    }
    return DESIGN_CATEGORIES.filter((c) => c.prefixes.length > 0 && counts.has(c.label)).map((c) => ({
      code: c.label,
      label: locale === "en" ? c.labelEn : c.label,
      count: counts.get(c.label)!,
    }));
  }, [pickerTemplates, locale]);

  const filteredTemplates = useMemo(() => {
    if (category === "all") return pickerTemplates;
    return pickerTemplates.filter((t) => categoryForSlug(t.key)?.label === category);
  }, [pickerTemplates, category]);

  const selectedTemplate = allTemplates.find((t) => t.key === template);
  const selectedName = selectedTemplate?.name ?? templateName ?? template;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && step !== "building") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, step]);

  const isBuilderFlow = flow === "builder";
  const isEshopKind = !isBuilderFlow && (kind === "eshop" || (selectedTemplate ? isEshopTemplate(selectedTemplate) : false));
  const activeBuildSteps = isBuilderFlow
    ? (locale === "en" ? BUILDER_BUILD_STEPS_EN : BUILDER_BUILD_STEPS)
    : isEshopKind
      ? (locale === "en" ? ESHOP_BUILD_STEPS_EN : ESHOP_BUILD_STEPS)
      : (locale === "en" ? BUILD_STEPS_EN : BUILD_STEPS);

  async function startBuilding() {
    setError("");
    setStep("building");
    setBuildStep(0);

    for (let i = 0; i < activeBuildSteps.length - 1; i++) {
      await delay(1100);
      setBuildStep(i + 1);
    }

    try {
      // Přihlášený uživatel: nový projekt pod stejným účtem (žádná registrace).
      const endpoint = loggedInEmail ? "/api/account/tenants" : "/api/onboarding";
      const payload = loggedInEmail
        ? (isBuilderFlow ? { mode: "builder" } : { templateKey: template })
        : (isBuilderFlow
            ? { email, name, phone, password: password || undefined, mode: "builder" }
            : { email, name, phone, password: password || undefined, templateKey: template });

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? copy.buildError);
        setStep(loggedInEmail ? (isBuilderFlow ? "ai-brief" : "templates") : "register");
        return;
      }

      if (isBuilderFlow) {
        // Zadání z onboardingu si builder převezme přes sessionStorage a pošle
        // ho jako první AI prompt. Rovnou předáváme do fullscreen builderu —
        // žádná mezizastávka, ať neztratíme momentum (Lovable-style handoff).
        try {
          if (brief.trim()) sessionStorage.setItem(builderBriefKey(data.slug), brief.trim());
        } catch { /* noop */ }
        window.location.href = data.builderUrl ?? `/demo/${data.slug}/admin?builder=1`;
        return;
      }

      setEditorUrl(data.editorUrl);
      setPreviewUrl(data.previewUrl);
      setAccessToken(data.accessToken ?? "");
      await delay(600);
      setStep("done");
    } catch {
      setError(copy.serverError);
      setStep(loggedInEmail ? (isBuilderFlow ? "ai-brief" : "templates") : "register");
    }
  }

  /* Registrace přichází až PO výběru šablony (resp. po AI briefu) —
     odeslání formuláře rovnou spouští build. */
  async function handleRegisterSubmit(e: React.FormEvent) {
    e.preventDefault();
    await startBuilding();
  }

  /* Šablona vybrána → přihlášený staví rovnou, ostatní jdou na registraci. */
  function continueFromTemplates() {
    if (!template) return;
    if (loggedInEmail) void startBuilding();
    else setStep("register");
  }

  /* ── Dotazník: validace per krok + odeslání ── */
  const agStepValid =
    agStep === 0 ? agProjectType !== ""
    : agStep === 1 ? agGoal.trim().length >= 10
    : agStep === 2 ? agBudget !== ""
    : agName.trim().length >= 2 && /.+@.+\..+/.test(agEmail);

  function agNext() {
    setAgError("");
    if (!agStepValid) {
      if (agStep === 1) setAgError(copy.goalTooShort);
      return;
    }
    setAgStep((s) => Math.min(3, s + 1));
  }

  async function handleAgencySubmit() {
    if (!agStepValid || agSending) return;
    setAgError("");
    setAgSending(true);
    try {
      const res = await fetch("/api/onboarding/agency-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectType: agProjectType,
          goal: agGoal.trim(),
          inspiration: agInspo.trim() || undefined,
          currentWeb: agCurrentWeb.trim() || undefined,
          budget: agBudget,
          timeline: agTimeline || undefined,
          name: agName.trim(),
          company: agCompany.trim() || undefined,
          email: agEmail.trim(),
          phone: agPhone.trim() || undefined,
          locale,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setAgError(data.error ?? copy.serverError);
        return;
      }
      setAgSent(true);
    } catch {
      setAgError(copy.serverError);
    } finally {
      setAgSending(false);
    }
  }

  const progressPercent = ((buildStep + 1) / activeBuildSteps.length) * 100;

  const closeBtn = (
    <button
      type="button"
      onClick={onClose}
      aria-label={copy.close}
      className="absolute right-5 top-4 z-20 grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white/60 transition hover:bg-white/20 hover:text-white"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
    </button>
  );

  const backBtn = (to: Step) => (
    <button type="button" onClick={() => setStep(to)} className="absolute left-5 top-4 z-10 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-white/35 transition hover:text-white/65">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
      {copy.back}
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#0c0c14]">
      <AnimatePresence mode="wait">

        {/* ══════════════ STEP 1: CHOICE — 4 cesty ══════════════ */}
        {step === "choice" && (
          <motion.div
            key="choice"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex h-full flex-col bg-[#0c0c14]"
          >
            {/* Jemné barevné záře v pozadí (navazuje na tmavé další kroky) */}
            <div className="pointer-events-none absolute -left-40 top-[-180px] h-[420px] w-[560px] rounded-full bg-[#2563eb]/12 blur-[130px]" />
            <div className="pointer-events-none absolute -right-40 top-[-140px] h-[420px] w-[560px] rounded-full bg-violet-600/12 blur-[130px]" />
            <div className="pointer-events-none absolute -bottom-40 left-1/2 h-[360px] w-[560px] -translate-x-1/2 rounded-full bg-amber-500/8 blur-[130px]" />

            {closeBtn}

            {/* Heading */}
            <div className="relative flex-shrink-0 px-6 pb-4 pt-7 text-center md:pt-8">
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/45">{copy.choiceKicker}</p>
              <h1 className="mt-1.5 font-extrabold leading-tight tracking-tight text-white" style={{ fontSize: "clamp(23px, 2.8vw, 38px)" }}>
                {copy.choiceTitle}
              </h1>
              <p className="mx-auto mt-1.5 max-w-md text-[13.5px] leading-relaxed text-white/45">{copy.choiceSub}</p>
            </div>

            {/* Content — skleněné karty přes plné náhledy šablon (desktop bez scrollu) */}
            <div className="relative flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-5 pb-5 md:gap-3.5 md:overflow-hidden md:px-8 lg:px-14">

              {/* Řada tří self-serve karet */}
              <div className="grid grid-cols-1 gap-3.5 md:min-h-0 md:flex-1 md:grid-cols-3 md:grid-rows-1 md:gap-4">

                {/* WEB */}
                <ChoiceCard
                  onClick={() => { setFlow("diy"); setKind("web"); setCategory("all"); setStep("templates"); }}
                  accent="#2563eb"
                  tag={copy.webTag}
                  title={copy.webTitle}
                  text={copy.webText}
                  meta={copy.webMeta}
                  cta={copy.webCta}
                  image="/images/onboarding-card-web.webp"
                  icon={
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 9h20M6 6.5h.01M9 6.5h.01"/></svg>
                  }
                />

                {/* E-SHOP */}
                <ChoiceCard
                  onClick={() => { setFlow("diy"); setKind("eshop"); setCategory("all"); setStep("templates"); }}
                  accent="#059669"
                  tag={copy.eshopTag}
                  title={copy.eshopTitle}
                  text={copy.eshopText}
                  meta={copy.eshopMeta}
                  cta={copy.eshopCta}
                  image="/images/onboarding-card-eshop.webp"
                  icon={
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 7h12l1.5 13h-15L6 7z"/><path d="M9 10V6a3 3 0 016 0v4"/></svg>
                  }
                />

                {/* WEBERO BUILDER — AI, reálný screenshot builderu */}
                <ChoiceCard
                  onClick={() => { setFlow("builder"); setStep("ai-brief"); }}
                  accent="#7c3aed"
                  tag={copy.aiTag}
                  badge={copy.aiBadge}
                  title={copy.aiTitle}
                  text={copy.aiText}
                  meta={copy.aiMeta}
                  cta={copy.aiCta}
                  image="/images/onboarding-card-ai.webp"
                  icon={
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2z"/></svg>
                  }
                />
              </div>

              {/* PROFÍCI — světlý pás „Uděláme to za vás" */}
              <button
                type="button"
                onClick={() => { setAgStep(0); setAgSent(false); setAgError(""); setStep("agency"); }}
                className="group relative flex w-full flex-shrink-0 cursor-pointer items-stretch overflow-hidden rounded-2xl bg-white text-left outline-none shadow-[0_8px_28px_rgba(15,15,25,0.1)] ring-1 ring-black/[0.06] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_50px_rgba(15,15,25,0.18)] focus-visible:ring-2 focus-visible:ring-amber-400"
              >
                <div className="relative z-10 flex flex-1 flex-col justify-center gap-2 p-4 sm:flex-row sm:items-center sm:gap-6 md:px-7 md:py-5">
                  <div className="min-w-0 flex-1">
                    <span className="mb-1.5 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-amber-700 ring-1 ring-amber-200">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      {copy.proTag}
                    </span>
                    <div className="flex flex-wrap items-baseline gap-x-3">
                      <h2 className="text-[19px] font-bold tracking-tight text-[#0f0f14] md:text-[22px]">{copy.proTitle}</h2>
                      <span className="hidden text-[12px] font-semibold text-amber-600 sm:inline">{copy.proMeta}</span>
                    </div>
                    <p className="mt-1 max-w-xl text-[13px] leading-relaxed text-gray-500">{copy.proText}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="inline-flex items-center gap-2 rounded-full bg-[#0f0f14] px-5 py-2.5 text-[13px] font-bold text-white shadow-sm transition-all duration-300 group-hover:bg-amber-500 group-hover:text-[#1c1917] group-hover:shadow-[0_8px_24px_rgba(245,158,11,0.4)]">
                      {copy.proCta}
                      <svg className="transition-transform group-hover:translate-x-0.5" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
                    </div>
                  </div>
                </div>
                {/* Foto týmu vpravo (bright), plynulý přechod do bílé */}
                <div className="relative hidden w-[30%] max-w-[320px] flex-shrink-0 overflow-hidden md:block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/onboarding-team.webp"
                    alt=""
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                    className="absolute inset-0 h-full w-full object-cover object-[center_28%] transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-white via-white/25 to-transparent" />
                </div>
              </button>

              <p className="flex-shrink-0 pb-1 text-center text-[11.5px] font-medium text-white/40">{copy.trialNote}</p>
            </div>
          </motion.div>
        )}

        {/* ══════════════ STEP 1b: AI BRIEF ══════════════ */}
        {step === "ai-brief" && (
          <motion.div
            key="ai-brief"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            className="flex h-full flex-col items-center justify-center overflow-y-auto px-4 py-10"
          >
            {backBtn("choice")}
            {closeBtn}

            <div className="w-full max-w-[640px] text-center">
              <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-violet-300/25 bg-violet-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-violet-200">
                <svg aria-hidden width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2z"/></svg>
                {copy.aiTag}
              </span>
              <h1 className="font-extrabold leading-tight tracking-tight text-white" style={{ fontSize: "clamp(30px, 4.5vw, 56px)" }}>
                {copy.briefTitle}
              </h1>
              <p className="mx-auto mt-4 max-w-lg text-[14.5px] leading-relaxed text-white/45">
                {copy.briefText}
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (brief.trim().length < 10) return;
                  if (loggedInEmail) void startBuilding();
                  else setStep("register");
                }}
                className="mt-8 text-left"
              >
                <div className="rounded-2xl border border-[#2e2e3e] bg-[#191924] p-1.5 transition focus-within:border-violet-500/70 focus-within:ring-2 focus-within:ring-violet-500/20">
                  <textarea
                    value={brief}
                    onChange={(e) => setBrief(e.target.value)}
                    autoFocus
                    rows={5}
                    maxLength={2000}
                    placeholder={copy.briefPlaceholder}
                    className="w-full resize-none bg-transparent px-4 py-3 text-[15px] leading-relaxed text-white placeholder-white/28 outline-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && brief.trim().length >= 10) {
                        if (loggedInEmail) void startBuilding();
                        else setStep("register");
                      }
                    }}
                  />
                  <div className="flex items-center justify-between px-2 pb-1.5">
                    <span className="text-[11px] text-white/25">{brief.length}/2000</span>
                    <button
                      type="submit"
                      disabled={brief.trim().length < 10}
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 px-5 py-2.5 text-[13.5px] font-bold text-white shadow-[0_6px_20px_rgba(139,92,246,0.4)] transition hover:brightness-110 disabled:opacity-35 disabled:shadow-none"
                    >
                      {copy.briefContinue}
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
                    </button>
                  </div>
                </div>
              </form>

              {error && (
                <div className="mt-3 rounded-lg border border-red-900/40 bg-red-950/40 px-4 py-3 text-left text-[13px] text-red-400">{error}</div>
              )}

              {loggedInEmail && (
                <p className="mt-3 text-[12px] text-white/30">
                  {copy.signedInAs} <span className="text-white/55">{loggedInEmail}</span>
                </p>
              )}

              {/* Příklady zadání */}
              <div className="mt-6">
                <p className="mb-2.5 text-[11.5px] font-semibold uppercase tracking-wider text-white/30">{copy.briefTry}</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {(locale === "en" ? BRIEF_EXAMPLES_EN : BRIEF_EXAMPLES).map((ex) => (
                    <button
                      key={ex}
                      type="button"
                      onClick={() => setBrief(ex)}
                      className="rounded-full border border-[#2e2e3e] bg-[#1a1a26] px-3.5 py-2 text-[12px] text-white/55 transition hover:border-violet-500/50 hover:text-white"
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </div>

              <p className="mt-7 inline-flex items-center gap-2 text-[12px] text-white/35">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2z"/></svg>
                {copy.briefHint}
              </p>
            </div>
          </motion.div>
        )}

        {/* ══════════════ STEP 2: TEMPLATES (web / e-shop) ══════════════ */}
        {step === "templates" && (
          <motion.div
            key="templates"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            className="flex h-full flex-col"
          >
            {backBtn("choice")}
            {closeBtn}

            {/* Header — kompaktní, ať zbyde co nejvíc místa na šablony */}
            <div className="flex-shrink-0 px-8 pb-3.5 pt-14 text-center md:pt-9">
              <h1 className="font-extrabold leading-[1.1] tracking-tight text-white" style={{ fontSize: "clamp(22px, 2.4vw, 32px)" }}>
                {kind === "eshop" ? copy.conceptsTitleEshop : copy.conceptsTitleWeb}
              </h1>
              <p className="mx-auto mt-1.5 max-w-3xl text-[13px] leading-snug text-white/35">
                {kind === "eshop" ? copy.conceptsTextEshop : copy.conceptsTextWeb}
              </p>

              {/* Category tabs — jen pro weby (e-shopy jsou jedna rodina) */}
              {kind === "web" && (
                <div className="-mx-8 mt-4 flex flex-wrap items-center justify-center gap-1.5 px-8">
                  {[{ code: "all", label: copy.all, count: pickerTemplates.length }, ...categories].map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => { setCategory(c.code); setPreviewSheet(null); }}
                      className={`flex-shrink-0 rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold transition ${
                        category === c.code
                          ? "bg-white text-[#0a0a0a]"
                          : "bg-white/[0.06] text-white/55 hover:bg-white/[0.11] hover:text-white/85"
                      }`}
                    >
                      {c.label}
                      <span className={category === c.code ? "ml-1.5 text-[11px] text-black/40" : "ml-1.5 text-[11px] text-white/30"}>{c.count}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Template grid */}
            <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-10 md:px-10">
              {fetching ? (
                <div className="flex h-48 items-center justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/15 border-t-white/60" />
                </div>
              ) : filteredTemplates.length === 0 ? (
                <div className="flex h-48 flex-col items-center justify-center gap-3">
                  <p className="text-[14px] text-white/40">{copy.none}</p>
                  <button type="button" onClick={() => setCategory("all")} className="text-[13px] font-semibold text-[#2563eb] hover:underline">
                    {copy.showAll}
                  </button>
                </div>
              ) : (
                <div className="mx-auto grid max-w-[1180px] grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8">
                  {filteredTemplates.map((t) => (
                    <TemplateCard
                      locale={locale}
                      key={t.key}
                      t={t}
                      active={template === t.key}
                      onSelect={() => { setTemplate(t.key); setPreviewView("desktop"); setPreviewSheet(t); }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Preview bottom sheet */}
            <AnimatePresence>
              {previewSheet && (
                <motion.div
                  key="preview-sheet"
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="fixed inset-0 z-20 flex flex-col bg-white"
                >
                  {/* Top bar */}
                  <div className="flex flex-shrink-0 items-center gap-3 border-b border-[#e5e5e5] bg-white px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setPreviewSheet(null)}
                      className="inline-flex flex-shrink-0 items-center gap-1.5 text-[13px] font-semibold text-[#374151]"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                      {copy.back}
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13px] font-bold text-[#0a0a0a]">{previewSheet.name}</div>
                    </div>
                    {/* Desktop/Mobile přepínač — na telefonu nedává smysl: „Mobil" by byl
                        zmenšený telefon v telefonu a plný iframe se stejně vykreslí
                        v reálné šířce zařízení. Proto jen na desktopu. */}
                    {previewSheet.demoUrl && !isMobileDevice && (
                      <div className="flex flex-shrink-0 items-center gap-1 rounded-xl bg-[#f3f4f6] p-1">
                        <button
                          type="button"
                          onClick={() => setPreviewView("desktop")}
                          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold transition ${previewView === "desktop" ? "bg-white text-[#0a0a0a] shadow-sm" : "text-[#6b7280] hover:text-[#0a0a0a]"}`}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
                          Desktop
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewView("mobile")}
                          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold transition ${previewView === "mobile" ? "bg-white text-[#0a0a0a] shadow-sm" : "text-[#6b7280] hover:text-[#0a0a0a]"}`}
                        >
                          <svg width="11" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/></svg>
                          {copy.mobile}
                        </button>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => { setPreviewSheet(null); continueFromTemplates(); }}
                      className="flex-shrink-0 rounded-full bg-[#2563eb] px-4 py-2 text-[12.5px] font-semibold text-white"
                    >
                      {copy.use} →
                    </button>
                  </div>

                  {/* Preview content */}
                  <div className="flex-1 overflow-hidden bg-[#f8f8f8]">
                    {previewSheet.demoUrl ? (
                      previewView === "mobile" ? (
                        /* Mobile: iPhone frame, 390px iframe scaled to fit — identické s /vybrat-design */
                        <div className="flex h-full items-center justify-center">
                          <div className="relative flex-shrink-0 overflow-hidden rounded-[38px] bg-[#1a1a1a] shadow-[0_32px_80px_rgba(0,0,0,0.35)]" style={{ width: 256, height: 512, border: "8px solid #2a2a2a" }}>
                            <div className="absolute left-1/2 top-0 z-10 h-5 w-20 -translate-x-1/2 rounded-b-2xl bg-[#1a1a1a]" />
                            <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between px-5 pt-1 text-[9px] font-semibold text-white/70">
                              <span>9:41</span>
                              <div className="flex items-center gap-1">
                                <svg width="11" height="7" viewBox="0 0 17 12" fill="currentColor"><rect x="0" y="4" width="3" height="8" rx="1" opacity="0.4"/><rect x="4.5" y="2.5" width="3" height="9.5" rx="1" opacity="0.6"/><rect x="9" y="0.5" width="3" height="11.5" rx="1" opacity="0.8"/><rect x="13.5" y="0" width="3" height="12" rx="1"/></svg>
                                <svg width="13" height="7" viewBox="0 0 24 12" fill="currentColor"><rect x="0" y="0" width="20" height="12" rx="3" opacity="0.3"/><rect x="1" y="1" width="14" height="10" rx="2"/><path d="M21 4v4a2 2 0 000-4z" opacity="0.4"/></svg>
                              </div>
                            </div>
                            <iframe
                              src={previewSheet.demoUrl}
                              style={{ width: 390, height: 806, transform: `scale(${240 / 390})`, transformOrigin: "top left", border: 0 }}
                              title={`${copy.mobilePreview} ${previewSheet.name}`}
                            />
                            <div className="absolute bottom-1.5 left-1/2 h-0.5 w-16 -translate-x-1/2 rounded-full bg-white/30" />
                          </div>
                        </div>
                      ) : (
                        /* Desktop: full-width iframe */
                        <iframe
                          src={previewSheet.demoUrl}
                          style={{ width: "100%", height: "100%", border: 0, display: "block" }}
                          title={`${copy.desktopPreview} ${previewSheet.name}`}
                        />
                      )
                    ) : (
                      <div className="h-full overflow-y-auto">
                        {previewSheet.previewImage ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={previewSheet.previewImage}
                            alt={previewSheet.name}
                            className="w-full object-cover object-top"
                          />
                        ) : (
                          <div className="grid min-h-full place-items-center bg-gradient-to-br from-[#20202a] to-[#111118] px-6 text-center text-sm font-semibold text-white/45">
                            {previewSheet.name}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Žádná spodní lišta — cesta dál vede tlačítkem „Použít" v náhledu šablony. */}
          </motion.div>
        )}

        {/* ══════════════ STEP 3: REGISTER — až po výběru šablony ══════════════ */}
        {step === "register" && (
          <motion.div
            key="register"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            className="flex h-full flex-col items-center justify-center overflow-y-auto px-4 py-10"
          >
            {!initialTemplate && backBtn(isBuilderFlow ? "ai-brief" : "templates")}
            {closeBtn}

            <div className="w-full max-w-[500px] text-center">
              <h1 className="font-extrabold leading-tight tracking-tight text-white" style={{ fontSize: "clamp(30px, 4.5vw, 54px)" }}>
                {isBuilderFlow ? copy.registerBuilderTitle : copy.registerTitle}
              </h1>
              <p className="mt-4 text-[15px] leading-relaxed text-white/45">
                {isBuilderFlow ? copy.registerBuilderText : copy.registerText}
              </p>

              {/* Rekapitulace vybrané šablony / AI zadání */}
              {!isBuilderFlow && selectedName && (
                <div className="mx-auto mt-6 flex max-w-[420px] items-center gap-3 rounded-xl border border-[#26263a] bg-[#15151f] p-2.5 pr-4 text-left">
                  <div className="h-12 w-[72px] flex-shrink-0 overflow-hidden rounded-lg bg-[#20202c]">
                    {selectedTemplate?.previewImage ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={selectedTemplate.previewImage} alt="" className="h-full w-full object-cover object-top" />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-white/25">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 9h20"/></svg>
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10.5px] font-semibold uppercase tracking-wider text-white/35">{copy.yourChoice}</p>
                    <p className="truncate text-[14px] font-bold text-white">{selectedName}</p>
                  </div>
                  {!initialTemplate && (
                    <button type="button" onClick={() => setStep("templates")} className="flex-shrink-0 text-[12px] font-semibold text-white/40 underline underline-offset-2 transition hover:text-white/75">
                      {locale === "en" ? "Change" : "Změnit"}
                    </button>
                  )}
                </div>
              )}
              {isBuilderFlow && brief.trim() && (
                <div className="mx-auto mt-6 max-w-[420px] rounded-xl border border-violet-500/25 bg-violet-500/[0.07] p-3.5 text-left">
                  <p className="mb-1 inline-flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-violet-300/80">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2z"/></svg>
                    {copy.yourChoice}
                  </p>
                  <p className="line-clamp-2 text-[13px] leading-relaxed text-white/70">{brief.trim()}</p>
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="mt-8 space-y-3 text-left">
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder={copy.name}
                  className="w-full rounded-lg border border-[#2e2e2e] bg-[#1c1c1c] px-5 py-4 text-[15px] text-white placeholder-white/28 outline-none transition focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20" />
                <input type="email" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)} placeholder={copy.email}
                  className="w-full rounded-lg border border-[#2e2e2e] bg-[#1c1c1c] px-5 py-4 text-[15px] text-white placeholder-white/28 outline-none transition focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20" />
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={copy.phone}
                  className="w-full rounded-lg border border-[#2e2e2e] bg-[#1c1c1c] px-5 py-4 text-[15px] text-white placeholder-white/28 outline-none transition focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20" />
                <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={copy.password}
                  className="w-full rounded-lg border border-[#2e2e2e] bg-[#1c1c1c] px-5 py-4 text-[15px] text-white placeholder-white/28 outline-none transition focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20" />

                {error && <div className="rounded-lg border border-red-900/40 bg-red-950/40 px-4 py-3 text-[13px] text-red-400">{error}</div>}

                <button type="submit" className="group flex w-full items-center justify-center gap-2 rounded-lg bg-[#2563eb] px-6 py-4 text-[15px] font-semibold text-white transition hover:bg-[#1d4ed8] active:scale-[0.99]">
                  {isEshopKind ? copy.createEshopAccount : copy.createAccount}
                  <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
                </button>
              </form>

              <p className="mt-5 text-center text-[13px] text-white/35">
                {copy.haveAccount}{" "}
                <Link href="/account/login" className="text-white/65 underline underline-offset-2 transition-colors hover:text-white">
                  {copy.login}
                </Link>
              </p>
            </div>
          </motion.div>
        )}

        {/* ══════════════ DOTAZNÍK „Uděláme to za vás" — 4 kroky ══════════════ */}
        {step === "agency" && (
          <motion.div
            key="agency"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex h-full flex-col"
          >
            {/* Jantarová záře */}
            <div className="pointer-events-none absolute -right-40 top-[-160px] h-[380px] w-[520px] rounded-full bg-amber-500/[0.08] blur-[120px]" />

            {agSent ? (
              <>
                {closeBtn}
                <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                  <motion.div
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", delay: 0.1, stiffness: 200, damping: 18 }}
                    className="relative mb-7 grid h-20 w-20 place-items-center"
                  >
                    <div className="absolute h-20 w-20 rounded-full bg-amber-400/15 blur-2xl" />
                    <div className="relative grid h-[72px] w-[72px] place-items-center rounded-full bg-gradient-to-br from-amber-400 to-amber-500 shadow-[0_10px_40px_rgba(251,191,36,0.4)]">
                      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#1c1917" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7" /></svg>
                    </div>
                  </motion.div>
                  <h2 className="font-extrabold tracking-tight text-white" style={{ fontSize: "clamp(26px, 3.5vw, 44px)" }}>{copy.sentTitle}</h2>
                  <p className="mt-3 max-w-md text-[14.5px] leading-relaxed text-white/50">{copy.sentText}</p>

                  <div className="mt-7 flex items-center gap-3 rounded-full border border-[#26263a] bg-[#15151f] py-2 pl-2 pr-5">
                    <div className="grid h-9 w-9 place-items-center rounded-full bg-amber-400/15 text-[15px]">👋</div>
                    <div className="text-left">
                      <p className="text-[12.5px] font-bold text-white">{copy.agReplyName}</p>
                      <p className="text-[11px] text-white/40">{copy.agReplyNote}</p>
                    </div>
                  </div>

                  <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => { setStep("choice"); }}
                      className="inline-flex items-center gap-2 rounded-lg border border-[#2e2e3e] px-6 py-3 text-[13.5px] font-semibold text-white/70 transition hover:border-[#4a4a5e] hover:text-white"
                    >
                      {copy.sentMeanwhile}
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-[13.5px] font-bold text-[#0d0d0d] transition hover:bg-amber-300"
                    >
                      {copy.sentClose}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Progres nahoře */}
                <div className="fixed inset-x-0 top-0 z-10 h-[3px] bg-[#1c1c28]">
                  <motion.div
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-500"
                    animate={{ width: `${((agStep + 1) / 4) * 100}%` }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => (agStep === 0 ? setStep("choice") : setAgStep(agStep - 1))}
                  className="absolute left-5 top-4 z-10 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-white/35 transition hover:text-white/65"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                  {copy.agBack}
                </button>
                {closeBtn}

                <div className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto px-4 py-16">
                  <div className="w-full max-w-[620px]">
                    <p className="mb-3 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-amber-300/70">
                      {copy.agStepWord} {agStep + 1} {copy.agOf} 4
                    </p>

                    <AnimatePresence mode="wait">
                      {/* ── 1/4: Typ projektu ── */}
                      {agStep === 0 && (
                        <motion.div key="ag0" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}>
                          <h1 className="text-center font-extrabold leading-tight tracking-tight text-white" style={{ fontSize: "clamp(26px, 3.4vw, 42px)" }}>{copy.agQ1}</h1>
                          <p className="mt-2.5 text-center text-[14px] text-white/40">{copy.agQ1Sub}</p>
                          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {AGENCY_PROJECT_TYPES.map((t) => {
                              const active = agProjectType === t.value;
                              return (
                                <button
                                  key={t.value}
                                  type="button"
                                  onClick={() => {
                                    setAgProjectType(t.value);
                                    // typeform-style: výběr rovnou posouvá dál
                                    setTimeout(() => setAgStep(1), 260);
                                  }}
                                  className={`group flex items-center gap-4 rounded-xl border text-left transition-all duration-200 ${
                                    active
                                      ? "border-amber-400/80 bg-amber-400/10 shadow-[0_0_0_1px_rgba(251,191,36,0.4)]"
                                      : "border-[#2a2a3a] bg-[#15151f] hover:border-[#3d3d52] hover:bg-[#1a1a26]"
                                  }`}
                                  style={{ padding: "18px" }}
                                >
                                  <span className={`grid h-11 w-11 flex-shrink-0 place-items-center rounded-lg transition ${active ? "bg-amber-400 text-[#1c1917]" : "bg-[#22222e] text-white/55 group-hover:text-amber-300"}`}>
                                    <AgTypeIcon icon={t.icon} />
                                  </span>
                                  <span className={`text-[15px] font-bold ${active ? "text-white" : "text-white/85"}`}>
                                    {locale === "en" ? t.en : t.cs}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}

                      {/* ── 2/4: O projektu ── */}
                      {agStep === 1 && (
                        <motion.div key="ag1" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}>
                          <h1 className="text-center font-extrabold leading-tight tracking-tight text-white" style={{ fontSize: "clamp(26px, 3.4vw, 42px)" }}>{copy.agQ2}</h1>
                          <p className="mt-2.5 text-center text-[14px] text-white/40">{copy.agQ2Sub}</p>
                          <div className="mt-8 space-y-4">
                            <div>
                              <label className="mb-2 block text-[12.5px] font-semibold text-white/60">{copy.agGoal}</label>
                              <textarea
                                value={agGoal}
                                onChange={(e) => setAgGoal(e.target.value)}
                                autoFocus
                                rows={4}
                                maxLength={4000}
                                placeholder={copy.agGoalPlaceholder}
                                className="w-full resize-none rounded-xl border border-[#2a2a3a] bg-[#15151f] px-4 py-3.5 text-[14.5px] leading-relaxed text-white placeholder-white/25 outline-none transition focus:border-amber-400/70 focus:ring-2 focus:ring-amber-400/15"
                              />
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                              <div>
                                <label className="mb-2 block text-[12.5px] font-semibold text-white/60">{copy.agInspo}</label>
                                <input
                                  value={agInspo}
                                  onChange={(e) => setAgInspo(e.target.value)}
                                  placeholder={copy.agInspoPlaceholder}
                                  className="w-full rounded-xl border border-[#2a2a3a] bg-[#15151f] px-4 py-3.5 text-[14px] text-white placeholder-white/25 outline-none transition focus:border-amber-400/70 focus:ring-2 focus:ring-amber-400/15"
                                />
                              </div>
                              <div>
                                <label className="mb-2 block text-[12.5px] font-semibold text-white/60">{copy.agCurrentWeb}</label>
                                <input
                                  value={agCurrentWeb}
                                  onChange={(e) => setAgCurrentWeb(e.target.value)}
                                  placeholder={copy.agCurrentWebPlaceholder}
                                  className="w-full rounded-xl border border-[#2a2a3a] bg-[#15151f] px-4 py-3.5 text-[14px] text-white placeholder-white/25 outline-none transition focus:border-amber-400/70 focus:ring-2 focus:ring-amber-400/15"
                                />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* ── 3/4: Rozpočet a termín ── */}
                      {agStep === 2 && (
                        <motion.div key="ag2" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}>
                          <h1 className="text-center font-extrabold leading-tight tracking-tight text-white" style={{ fontSize: "clamp(26px, 3.4vw, 42px)" }}>{copy.agQ3}</h1>
                          <p className="mt-2.5 text-center text-[14px] text-white/40">{copy.agQ3Sub}</p>
                          <div className="mt-8">
                            <p className="mb-3 text-[12.5px] font-semibold text-white/60">{copy.agBudgetLabel}</p>
                            <div className="grid grid-cols-2 gap-3">
                              {budgetOptions.map((opt) => (
                                <button
                                  key={opt}
                                  type="button"
                                  onClick={() => setAgBudget(opt)}
                                  className={`rounded-xl border px-4 py-3.5 text-[14px] font-semibold transition-all duration-200 ${
                                    agBudget === opt
                                      ? "border-amber-400/80 bg-amber-400/10 text-white shadow-[0_0_0_1px_rgba(251,191,36,0.4)]"
                                      : "border-[#2a2a3a] bg-[#15151f] text-white/70 hover:border-[#3d3d52] hover:text-white"
                                  }`}
                                >
                                  {opt}
                                </button>
                              ))}
                            </div>
                            <p className="mb-3 mt-7 text-[12.5px] font-semibold text-white/60">{copy.agTimelineLabel}</p>
                            <div className="flex flex-wrap gap-2.5">
                              {timelineOptions.map((opt) => (
                                <button
                                  key={opt}
                                  type="button"
                                  onClick={() => setAgTimeline(agTimeline === opt ? "" : opt)}
                                  className={`rounded-full border px-4 py-2.5 text-[13px] font-medium transition-all duration-200 ${
                                    agTimeline === opt
                                      ? "border-amber-400/80 bg-amber-400/10 text-white"
                                      : "border-[#2a2a3a] bg-[#15151f] text-white/60 hover:border-[#3d3d52] hover:text-white"
                                  }`}
                                >
                                  {opt}
                                </button>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* ── 4/4: Kontakt ── */}
                      {agStep === 3 && (
                        <motion.div key="ag3" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}>
                          <h1 className="text-center font-extrabold leading-tight tracking-tight text-white" style={{ fontSize: "clamp(26px, 3.4vw, 42px)" }}>{copy.agQ4}</h1>
                          <p className="mt-2.5 text-center text-[14px] text-white/40">{copy.agQ4Sub}</p>
                          <div className="mt-8 grid gap-3 sm:grid-cols-2">
                            <AgInput value={agName} onChange={setAgName} placeholder={copy.agName} required autoFocus />
                            <AgInput value={agCompany} onChange={setAgCompany} placeholder={copy.agCompany} />
                            <AgInput value={agEmail} onChange={setAgEmail} placeholder={copy.agEmailField} type="email" required />
                            <AgInput value={agPhone} onChange={setAgPhone} placeholder={copy.agPhoneField} type="tel" />
                          </div>
                          <div className="mt-5 flex items-center justify-center gap-3 text-[12px] text-white/35">
                            <span className="grid h-7 w-7 place-items-center rounded-full bg-amber-400/12 text-[12px]">👋</span>
                            {copy.agReplyName} · {copy.agReplyNote}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {agError && (
                      <div className="mt-4 rounded-lg border border-red-900/40 bg-red-950/40 px-4 py-3 text-center text-[13px] text-red-400">{agError}</div>
                    )}

                    {/* Navigace dotazníku */}
                    <div className="mt-9 flex items-center justify-center">
                      {agStep < 3 ? (
                        <button
                          type="button"
                          onClick={agNext}
                          disabled={!agStepValid}
                          className="group inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-[14.5px] font-bold text-[#0d0d0d] shadow-lg transition-all duration-200 hover:bg-amber-300 disabled:opacity-30 disabled:hover:bg-white"
                        >
                          {copy.agNext}
                          <svg className="transition-transform group-hover:translate-x-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => void handleAgencySubmit()}
                          disabled={!agStepValid || agSending}
                          className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-8 py-3.5 text-[14.5px] font-bold text-[#1c1917] shadow-[0_8px_28px_rgba(251,191,36,0.35)] transition-all duration-200 hover:brightness-110 disabled:opacity-40"
                        >
                          {agSending ? copy.agSending : copy.agSubmit}
                          {!agSending && (
                            <svg className="transition-transform group-hover:translate-x-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* ══════════════ STEP 4: BUILDING ══════════════ */}
        {step === "building" && (
          <motion.div
            key="building"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="flex h-full flex-col items-center justify-center"
          >
            {/* Progress bar at very top */}
            <div className="fixed inset-x-0 top-0 h-[3px] bg-[#1e1e1e]">
              <motion.div
                className="h-full bg-[#2563eb]"
                initial={{ width: "0%" }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>

            <div className="text-center">
              <h1
                className="font-extrabold leading-tight tracking-tight text-white"
                style={{ fontSize: "clamp(34px, 5.5vw, 72px)" }}
              >
                {isEshopKind ? copy.buildingTitleEshop : copy.buildingTitle}
              </h1>
              <p className="mt-5 flex items-center justify-center gap-2 text-[15px] text-white/40">
                {buildStep + 1}. {copy.stepWord} {activeBuildSteps.length} - {activeBuildSteps[buildStep]}
                {/* Spinning circle */}
                <svg
                  className="h-4 w-4 animate-spin text-white/40"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" strokeDasharray="44" strokeDashoffset="30" strokeLinecap="round" />
                </svg>
              </p>
            </div>
          </motion.div>
        )}

        {/* ══════════════ STEP 5: DONE ══════════════ */}
        {step === "done" && (
          <motion.div
            key="done"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.45 }}
            className="flex h-full flex-col items-center justify-center px-4 text-center"
          >
            <motion.div
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", delay: 0.15, stiffness: 200, damping: 18 }}
              className="relative mb-8 grid h-24 w-24 place-items-center"
            >
              <div className="absolute h-24 w-24 rounded-full bg-[#22c55e]/15 blur-2xl" />
              <div className="relative grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-[#22c55e] to-[#16a34a] shadow-[0_10px_40px_rgba(34,197,94,0.45)]">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7" /></svg>
              </div>
            </motion.div>

            <p className="mb-3 text-[10.5px] font-bold uppercase tracking-[0.22em] text-[#22c55e]">{copy.doneLabel}</p>
            <h2 className="font-extrabold leading-tight tracking-tight text-white" style={{ fontSize: "clamp(28px, 4vw, 48px)" }}>
              {isEshopKind ? copy.doneTitleAEshop : copy.doneTitleA}<br /><span className="text-[#22c55e]">{copy.doneTitleB}</span>
            </h2>

            {/* Account info */}
            <div className="mt-7 w-full max-w-[420px] rounded-xl border border-[#1e3a5f]/60 bg-[#0f2040]/60 p-4 text-left">
              <div className="mb-2 flex items-center gap-2">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                <span className="text-[12px] font-bold text-[#60a5fa]">{copy.credentials}</span>
              </div>
              <p className="text-[12.5px] leading-relaxed text-white/70">
                <strong className="text-white/90">E-mail:</strong> {email || "—"}<br/>
                <strong className="text-white/90">{copy.password.replace(/ \(.*$/, "").replace(" *", "")}:</strong> {copy.passwordValue}
              </p>
              <p className="mt-2 text-[11px] text-white/35">{copy.loginHelp}</p>
            </div>

            {/* Email confirmation */}
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#242424] bg-[#191919] px-4 py-2 text-[12.5px] text-white/45">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="6" width="18" height="12" rx="2" /><path d="M3 7l9 7 9-7" />
              </svg>
              {copy.confirmation} <span className="ml-0.5 font-semibold text-white/80">{email}</span>
            </div>

            <div className="mt-7 flex w-full max-w-[360px] flex-col gap-3">
              <a href={editorUrl} className="group flex w-full items-center justify-center gap-2 rounded-lg bg-[#2563eb] px-6 py-4 text-[15px] font-semibold text-white transition hover:bg-[#1d4ed8]">
                {copy.openEditor}
                <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
              </a>
              <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#242424] px-6 py-3.5 text-[14px] font-semibold text-white/60 transition hover:border-[#3a3a3a] hover:text-white/90">
                {copy.websitePreview} <span aria-hidden>↗</span>
              </a>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}

/* ─── ChoiceCard — skleněná karta: šablona vyplní kartu, text na matném skle ─── */
function ChoiceCard({
  onClick, accent, tag, badge, title, text, meta, cta, image, icon,
}: {
  onClick: () => void;
  accent: string;
  tag: string;
  badge?: string;
  title: string;
  text: string;
  meta: string;
  cta: string;
  image: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex aspect-[5/6] cursor-pointer flex-col overflow-hidden rounded-[20px] text-left outline-none ring-1 ring-white/10 shadow-[0_14px_40px_rgba(6,6,12,0.5)] transition-all duration-500 ease-out hover:-translate-y-1.5 hover:ring-1 hover:ring-[color:var(--accent)] hover:shadow-[0_34px_70px_var(--accent-glow)] focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] md:aspect-auto md:h-full"
      style={{ ["--accent" as string]: accent, ["--accent-glow" as string]: `${accent}55` }}
    >
      {/* Profi stock fotka přes celou kartu */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image}
        alt=""
        onError={(e) => { (e.currentTarget as HTMLImageElement).style.background = "#1a1a24"; }}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.06]"
      />
      {/* Čitelnostní gradient — jemný nahoře (kvůli štítku), sytější dole */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/45 via-black/5 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[78%] bg-gradient-to-t from-[#07070c] via-[#07070c]/85 to-transparent" />
      {/* Barevný nádech značky při hoveru */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: `linear-gradient(to top, ${accent}33, transparent 55%)` }} />

      {/* Štítek nahoře */}
      <div className="relative z-10 flex items-center gap-2 p-4 md:p-5">
        <span className="grid h-6 w-6 place-items-center rounded-lg text-white shadow-sm md:h-7 md:w-7" style={{ backgroundColor: accent }}>{icon}</span>
        <span className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-white/90 [text-shadow:0_1px_6px_rgba(0,0,0,0.5)] md:text-[11px]">{tag}</span>
        {badge && (
          <span className="rounded-full bg-white/95 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide" style={{ color: accent }}>{badge}</span>
        )}
      </div>

      {/* Obsah dole — přímo na fotce, žádná tabulka */}
      <div className="relative z-10 mt-auto p-4 md:p-5">
        <h2 className="text-[22px] font-extrabold leading-none tracking-tight text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.5)] md:text-[26px]">{title}</h2>
        <p className="mt-2 max-w-[30ch] text-[12.5px] leading-relaxed text-white/70 md:text-[13px]">{text}</p>
        <p className="mt-2.5 flex items-center gap-1.5 text-[11px] font-semibold text-white/85 md:text-[11.5px]">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
          {meta}
        </p>

        {/* CTA — plná barva pásu, rozjede se při hoveru */}
        <div
          className="mt-4 flex w-full items-center justify-between gap-2 rounded-xl px-4 py-3 text-[13px] font-bold text-white shadow-[0_8px_24px_var(--accent-glow)] transition-all duration-300 md:text-[13.5px]"
          style={{ backgroundColor: accent }}
        >
          <span>{cta}</span>
          <svg className="transition-transform duration-300 group-hover:translate-x-1" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
        </div>
      </div>
    </button>
  );
}

/* ─── TemplateCard — real img scroll on hover, same style as /vybrat-design ─── */
function TemplateCard({ t, active, onSelect, locale = "cs" }: { t: ModalTemplate; active: boolean; onSelect: () => void; locale?: PlatformLocale }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [scrollPx, setScrollPx] = useState(0);
  const [duration, setDuration] = useState(3000);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    function recompute() {
      const wrap = wrapRef.current;
      const img = imgRef.current;
      if (!wrap || !img || !img.naturalWidth) return;
      const renderedH = (img.naturalHeight / img.naturalWidth) * wrap.clientWidth;
      const dist = Math.max(0, renderedH - wrap.clientHeight);
      setScrollPx(dist);
      setDuration(Math.max(2400, Math.min(6000, Math.round((dist / 240) * 1000))));
    }
    if (imgRef.current?.complete) recompute();
    else imgRef.current?.addEventListener("load", recompute, { once: true });
    const ro = new ResizeObserver(recompute);
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  function startScroll() {
    const el = imgRef.current;
    if (!el || scrollPx <= 0) return;
    el.style.transitionDuration = `${duration}ms`;
    el.style.transitionTimingFunction = "cubic-bezier(0.4, 0, 0.2, 1)";
    el.style.transform = `translateY(-${scrollPx}px)`;
  }
  function resetScroll() {
    const el = imgRef.current;
    if (!el) return;
    el.style.transitionDuration = "900ms";
    el.style.transitionTimingFunction = "cubic-bezier(0.22, 1, 0.36, 1)";
    el.style.transform = "translateY(0)";
  }

  const previewSrc = t.previewImage || null;
  const industry = t.industry ?? industryFromKey(t.key);
  const industryLabel = industry ? ((locale === "en" ? INDUSTRY_LABELS_EN[industry] : INDUSTRY_LABELS[industry]) ?? industry) : null;

  return (
    <button
      type="button"
      onClick={onSelect}
      onMouseEnter={() => { setHovered(true); startScroll(); }}
      onMouseLeave={() => { setHovered(false); resetScroll(); }}
      aria-label={`${ONBOARDING_COPY[locale].chooseTemplate} ${t.name}`}
      className="group block w-full text-left outline-none"
    >
      {/* Tmavý rám „monitoru" kolem snímku — awwwards styl */}
      <div
        className="relative overflow-hidden rounded-2xl bg-[#15151c] p-2 transition-all duration-500 ease-out group-hover:-translate-y-1.5 md:p-2.5"
        style={{
          boxShadow: active
            ? "0 0 0 2px #2563eb, 0 24px 60px -18px rgba(37,99,235,0.6)"
            : hovered
              ? "0 0 0 1px rgba(255,255,255,0.14), 0 32px 64px -24px rgba(0,0,0,0.75)"
              : "0 0 0 1px rgba(255,255,255,0.07), 0 12px 30px -18px rgba(0,0,0,0.6)",
        }}
      >
        {/* Viewport se snímkem — scroll na hoveru */}
        <div
          ref={wrapRef}
          className="relative overflow-hidden rounded-xl bg-[#0e0e13]"
          style={{ aspectRatio: "16/10" }}
        >
          {previewSrc ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              ref={imgRef}
              src={previewSrc}
              alt={t.name}
              className="absolute left-0 top-0 block w-full will-change-transform"
              style={{ height: "auto", minHeight: "100%", objectFit: "cover", objectPosition: "top", transform: "translateY(0)", transitionProperty: "transform" }}
              loading="lazy"
            />
          ) : t.demoUrl ? (
            <iframe
              src={t.demoUrl}
              title={t.name}
              tabIndex={-1}
              loading="lazy"
              className="pointer-events-none absolute left-0 top-0 border-0"
              style={{ width: "200%", height: "200%", transform: "scale(0.5)", transformOrigin: "top left" }}
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-[#20202a] to-[#111118] text-[12px] font-semibold text-white/45">
              {t.name}
            </div>
          )}

          {/* Hover CTA overlay */}
          <div className="pointer-events-none absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/70 via-black/0 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[12.5px] font-bold text-[#0a0a0a] shadow-[0_10px_30px_-8px_rgba(0,0,0,0.6)]">
              {locale === "en" ? "View & choose" : "Prohlédnout a vybrat"}
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
            </span>
          </div>

          {/* Active checkmark */}
          {active && (
            <div className="absolute right-2.5 top-2.5 z-10 grid h-7 w-7 place-items-center rounded-full bg-[#2563eb] shadow-lg">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7" /></svg>
            </div>
          )}
        </div>
      </div>

      {/* Popis pod monitorem */}
      <div className="mt-3 flex items-center justify-between gap-3 px-1">
        <div className="min-w-0">
          <div className="truncate text-[14px] font-bold text-white/90">{t.name}</div>
          {industryLabel && <div className="mt-0.5 truncate text-[11.5px] text-white/40">{industryLabel}</div>}
        </div>
        <span className="flex-shrink-0 text-[12px] font-semibold text-white/30 transition-colors duration-300 group-hover:text-[#2563eb]">
          {locale === "en" ? "Preview" : "Náhled"} →
        </span>
      </div>
    </button>
  );
}

/* ─── AgInput helper ─── */
function AgInput({
  value, onChange, placeholder, type = "text", required = false, autoFocus = false,
}: { value: string; onChange: (v: string) => void; placeholder: string; type?: string; required?: boolean; autoFocus?: boolean }) {
  return (
    <input
      type={type}
      required={required}
      autoFocus={autoFocus}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-xl border border-[#2a2a3a] bg-[#15151f] px-4 py-3.5 text-[14px] text-white placeholder-white/25 outline-none transition focus:border-amber-400/70 focus:ring-2 focus:ring-amber-400/15"
    />
  );
}
