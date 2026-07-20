"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { PlatformLocale } from "@/lib/platform-i18n";

type Step = "choice" | "ai-brief" | "register" | "templates" | "agency-form" | "building" | "done";

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
  initialStep?: "ai-brief" | "templates";
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
  landing: "Landing page", gastro: "Gastronomie",
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
  landing: "Landing page", gastro: "Gastronomy",
};

const CATEGORY_LABELS: Record<string, string> = {
  all: "Vše",
  sluzby: "Služby",
  hotel: "Hotely",
  realEstate: "Reality",
  landing: "Landing page",
  gastro: "Gastronomie",
};

const CATEGORY_LABELS_EN: Record<string, string> = {
  all: "All",
  sluzby: "Services",
  hotel: "Hotels",
  realEstate: "Real estate",
  landing: "Landing page",
  gastro: "Gastronomy",
};

function industryFromKey(key: string): string {
  return key.split("-")[0] ?? "";
}

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

const FALLBACK_TEMPLATES: ModalTemplate[] = [
  { key: "stavba-01", name: "Stavba Pro", industry: "stavba", previewImage: "/images/template-previews/barber-hero-1440x900.webp" },
  { key: "wellness", name: "Wellness Studio", industry: "wellness", previewImage: "/images/template-gallery/wellness-05-relax-massage-full-1920x1080.webp" },
  { key: "lawyer", name: "Advokátní kancelář", industry: "lawyer", previewImage: "/images/template-previews/lawyer-hero-1440x900.webp" },
];

const TRUST_LOGOS = ["Chateau Mcely", "PPF", "trask", "GANT", "Hunger Wall", "Banka Creditas", "Studio Najbrt"];

const BUDGET_OPTIONS = [
  "110 – 170 tis.",
  "170 – 330 tis.",
  "330 – 970 tis.",
  "970 tis. a více",
];

const BUDGET_OPTIONS_EN = [
  "CZK 110-170k",
  "CZK 170-330k",
  "CZK 330-970k",
  "CZK 970k and more",
];

const PROJECT_TYPES = [
  "Firemní web",
  "E-shop",
  "Landing page",
  "Portfolio",
  "Blog / magazín",
  "Jiné",
];

const PROJECT_TYPES_EN = [
  "Company website",
  "E-shop",
  "Landing page",
  "Portfolio",
  "Blog / magazine",
  "Other",
];

const ONBOARDING_COPY = {
  cs: {
    close: "Zavřít",
    back: "Zpět",
    choiceTitle: "Jak chcete začít?",
    aiTag: "AI Builder",
    aiBadge: "Novinka",
    aiTitle: "Postavit cokoliv",
    aiText: "Popište svůj nápad a AI postaví web nebo e-shop od nuly — během pár minut, přesně podle vás.",
    aiCta: "Začít tvořit s AI",
    briefTitle: "Co spolu postavíme?",
    briefText: "Popište projekt vlastními slovy. Čím víc detailů — obor, služby, styl — tím lepší první verze. Doladíme ji pak společně v konverzaci.",
    briefPlaceholder: "Např. „Web pro moje bistro v Brně — menu, otevírací doba, rezervace stolu. Moderní, teplé barvy…“",
    briefContinue: "Pokračovat",
    briefHint: "První sestavení webu máte zdarma — na účet dostanete startovní kredity.",
    briefTry: "Nebo zkuste:",
    diyTag: "Samostatně",
    diyTitle: "Web chci stavět sám",
    diyText: "Prvních 14 dní zdarma. Bez kreditní karty. Žádné riziko, žádné závazky.",
    diyCta: "Vytvořit zkušební verzi",
    agencyTag: "Na zakázku",
    agencyTitle: "Web chci kompletně dodat",
    agencyText: "Web vám připravíme na zakázku. Přijímáme jen 8 klientů měsíčně.",
    agencyCta: "Získat nabídku",
    registerTitle: "Vytvořte si zkušební verzi zdarma",
    registerText: "14denní zkušební verze, bez kreditní karty, přístup ke všem funkcím.",
    name: "Jméno *",
    email: "E-mail *",
    phone: "Telefon",
    password: "Heslo (min. 6 znaků) *",
    createAccount: "Vytvořit účet zdarma",
    haveAccount: "Máte účet?",
    login: "Přihlásit se",
    conceptsTitle: "Přivítejte webové koncepty",
    conceptsText: "Jsou kombinací designu, obsahu a funkcí pro daný obor. Představují nejlepší startovní bod pro váš web. Změnit v nich můžete vše.",
    all: "Vše",
    none: "V kategorii nic nenalezeno",
    showAll: "Zobrazit vše →",
    use: "Použít",
    mobile: "Mobil",
    desktopPreview: "Desktop náhled",
    mobilePreview: "Mobilní náhled",
    selected: "Vybráno:",
    continue: "Pokračovat dál",
    agencyHero: "Řekněte nám více o projektu",
    agencyIntro: "Vyplnit formulář zabere jednotky minut a ušetří hodiny času. Na první schůzku budeme připraveni a bude maximálně užitečná.",
    sentTitle: "Poptávka odeslána!",
    sentText: "Ozveme se vám do 24 hodin.",
    sectionAbout: "1. Informace o vás a firmě",
    firstName: "Jméno *",
    lastName: "Příjmení *",
    company: "Název firmy *",
    website: "www adresa firmy *",
    sectionProject: "2. Informace o projektu",
    projectType: "Jaký typ projektu chcete realizovat? *",
    goal: "Proč chcete realizovat nový web? Čeho přesně chcete dosáhnout? *",
    inspo: "Jaké weby jsou pro vás cílový stav inspirací?",
    sectionBudget: "3. Rozpočet a termín projektu",
    budgetIntro: "Každé zadání má svůj rozsah. Je důležité vědět, jaký rozpočet máte připravený.",
    budget: "Rozpočet (CZK) *",
    deadline: "Očekávaný termín spuštění",
    submitRequest: "Odeslat poptávku",
    replyTitle: "Na zprávu odpoví",
    replyPerson: "Jan Novák – sales",
    replyText: "Reagujeme do 24 hodin. V dalším kroku si domluvíme 30minutovou online schůzku, při které projdeme detaily vašeho zadání.",
    quote: "„Díky za výbornou spolupráci a hlavně za výborný produkt! Skvěle se nám s ním pracuje.\"",
    quoteBy: "Tatána le Moigne – Inspire & Impact, ex-Google",
    buildingTitle: "Váš web se už chystá",
    stepWord: "krok z",
    doneLabel: "Hotovo",
    doneTitleA: "Váš web je",
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
  },
  en: {
    close: "Close",
    back: "Back",
    choiceTitle: "How do you want to start?",
    aiTag: "AI Builder",
    aiBadge: "New",
    aiTitle: "Build anything",
    aiText: "Describe your idea and AI builds a website or e-shop from scratch — in minutes, exactly your way.",
    aiCta: "Start building with AI",
    briefTitle: "What shall we build?",
    briefText: "Describe your project in your own words. The more detail — industry, services, style — the better the first version. We'll fine-tune it together in a conversation.",
    briefPlaceholder: "E.g. “A website for my bistro in Brno — menu, opening hours, table booking. Modern, warm colors…”",
    briefContinue: "Continue",
    briefHint: "Your first website build is free — you'll get starter credits on your account.",
    briefTry: "Or try:",
    diyTag: "Self-serve",
    diyTitle: "I want to build the site myself",
    diyText: "First 14 days free. No credit card. No risk, no commitment.",
    diyCta: "Create trial website",
    agencyTag: "Done for you",
    agencyTitle: "I want the website delivered for me",
    agencyText: "We will prepare the website for you. We accept only 8 clients per month.",
    agencyCta: "Get an offer",
    registerTitle: "Create your free trial",
    registerText: "14-day trial, no credit card, access to every feature.",
    name: "Name *",
    email: "Email *",
    phone: "Phone",
    password: "Password (min. 6 characters) *",
    createAccount: "Create free account",
    haveAccount: "Already have an account?",
    login: "Log in",
    conceptsTitle: "Meet website concepts",
    conceptsText: "They combine design, content, and features for a specific industry. They are the best starting point for your website. You can change everything.",
    all: "All",
    none: "Nothing found in this category",
    showAll: "Show all →",
    use: "Use",
    mobile: "Mobile",
    desktopPreview: "Desktop preview",
    mobilePreview: "Mobile preview",
    selected: "Selected:",
    continue: "Continue",
    agencyHero: "Tell us more about your project",
    agencyIntro: "The form takes only a few minutes and saves hours later. We will come to the first call prepared, so it is actually useful.",
    sentTitle: "Request sent!",
    sentText: "We will get back to you within 24 hours.",
    sectionAbout: "1. About you and your company",
    firstName: "First name *",
    lastName: "Last name *",
    company: "Company name *",
    website: "Company website *",
    sectionProject: "2. Project information",
    projectType: "What type of project do you want to build? *",
    goal: "Why do you want a new website? What exactly should it achieve? *",
    inspo: "Which websites are close to your target state?",
    sectionBudget: "3. Project budget and timing",
    budgetIntro: "Every assignment has a different scope. It helps to know what budget you have prepared.",
    budget: "Budget (CZK) *",
    deadline: "Expected launch date",
    submitRequest: "Send request",
    replyTitle: "Your message will be answered by",
    replyPerson: "Jan Novak – sales",
    replyText: "We respond within 24 hours. Next, we schedule a 30-minute online call and go through the details of your brief.",
    quote: "\"Thank you for the great collaboration and, above all, for a great product. It is excellent to work with.\"",
    quoteBy: "Tatana le Moigne – Inspire & Impact, ex-Google",
    buildingTitle: "Your website is being prepared",
    stepWord: "step of",
    doneLabel: "Done",
    doneTitleA: "Your website is",
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
  },
} as const;

export function OnboardingModal({ onClose, locale = "cs", initialTemplate, templateName, catalogTemplates, initialStep }: Props) {
  const copy = ONBOARDING_COPY[locale];
  const buildSteps = locale === "en" ? BUILD_STEPS_EN : BUILD_STEPS;
  const budgetOptions = locale === "en" ? BUDGET_OPTIONS_EN : BUDGET_OPTIONS;
  const projectTypes = locale === "en" ? PROJECT_TYPES_EN : PROJECT_TYPES;
  const [step, setStep] = useState<Step>(
    initialTemplate ? "register" : initialStep ?? "choice"
  );
  // "diy" = klasický výběr šablony, "builder" = AI Builder („Postavit cokoliv")
  const [flow, setFlow] = useState<"diy" | "builder">(initialStep === "ai-brief" ? "builder" : "diy");
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
  const [accessToken, setAccessToken] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  // Agency form fields
  const [agFirstName, setAgFirstName] = useState("");
  const [agLastName, setAgLastName] = useState("");
  const [agCompany, setAgCompany] = useState("");
  const [agEmail, setAgEmail] = useState("");
  const [agPhone, setAgPhone] = useState("");
  const [agWebsite, setAgWebsite] = useState("");
  const [agProjectType, setAgProjectType] = useState("");
  const [agGoal, setAgGoal] = useState("");
  const [agInspo, setAgInspo] = useState("");
  const [agBudget, setAgBudget] = useState("");
  const [agDeadline, setAgDeadline] = useState("");
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
    if (initialTemplate) return;
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

  const pickerTemplates: ModalTemplate[] = useMemo(() => {
    if (catalogTemplates && catalogTemplates.length > 0) return catalogTemplates;
    if (fetchedTemplates && fetchedTemplates.length > 0) return fetchedTemplates;
    return FALLBACK_TEMPLATES;
  }, [catalogTemplates, fetchedTemplates]);

  useEffect(() => {
    if (!initialTemplate && pickerTemplates.length > 0 && !template) {
      setTemplate(pickerTemplates[0]!.key);
    }
  }, [pickerTemplates, template, initialTemplate]);

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const t of pickerTemplates) {
      const ind = t.industry ?? industryFromKey(t.key);
      counts.set(ind, (counts.get(ind) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([code, n]) => ({ code, label: (locale === "en" ? INDUSTRY_LABELS_EN[code] : INDUSTRY_LABELS[code]) ?? code, count: n }))
      .sort((a, b) => b.count - a.count);
  }, [pickerTemplates]);

  const filteredTemplates = useMemo(() => {
    if (category === "all") return pickerTemplates;
    return pickerTemplates.filter((t) => (t.industry ?? industryFromKey(t.key)) === category);
  }, [pickerTemplates, category]);

  const selectedTemplate = pickerTemplates.find((t) => t.key === template);
  const selectedName = selectedTemplate?.name ?? templateName ?? template;
  const collageTemplates = pickerTemplates.slice(0, 3);

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
  const activeBuildSteps = isBuilderFlow
    ? (locale === "en" ? BUILDER_BUILD_STEPS_EN : BUILDER_BUILD_STEPS)
    : buildSteps;

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

  async function handleRegisterSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (initialTemplate || isBuilderFlow) {
      await startBuilding();
    } else {
      setStep("templates");
    }
  }

  async function handleAgencySubmit(e: React.FormEvent) {
    e.preventDefault();
    setAgSent(true);
  }

  const progressPercent = ((buildStep + 1) / activeBuildSteps.length) * 100;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#111111]">
      <AnimatePresence mode="wait">

        {/* ══════════════ STEP 1: CHOICE ══════════════ */}
        {step === "choice" && (
          <motion.div
            key="choice"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="flex h-full flex-col bg-[#14141e]"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label={copy.close}
              className="absolute right-6 top-6 z-20 grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white/60 transition hover:bg-white/20 hover:text-white"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>

            {/* Heading */}
            <div className="flex-shrink-0 px-6 pb-4 pt-10 text-center">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/50">webero.</p>
              <h1 className="mt-2 text-[clamp(20px,2.2vw,28px)] font-bold text-white">
                {copy.choiceTitle}
              </h1>
            </div>

            {/* Cards row */}
            <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-5 pb-4 md:flex-row md:gap-4 md:overflow-hidden md:px-8">

              {/* AI BUILDER — „Postavit cokoliv" */}
              <button
                type="button"
                onClick={() => { setFlow("builder"); setStep("ai-brief"); }}
                className="group relative flex min-h-[220px] flex-1 cursor-pointer flex-col overflow-hidden rounded-2xl border border-violet-500/40 text-left outline-none transition-all duration-300 hover:border-violet-400/80 hover:shadow-[0_0_0_1px_rgba(167,139,250,0.35),0_24px_60px_rgba(88,28,135,0.55)] focus-visible:ring-2 focus-visible:ring-violet-400/60"
              >
                {/* Gradient plátno místo fotky */}
                <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_80%_0%,#4c1d95_0%,#312e81_45%,#14141e_100%)]" />
                {/* Jemná animovaná záře */}
                <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-violet-500/30 blur-3xl transition-opacity duration-700 group-hover:opacity-100 opacity-60" />
                {/* Dekorativní hvězdičky */}
                <svg aria-hidden className="absolute right-6 top-6 h-8 w-8 text-violet-300/70 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2z"/></svg>
                <svg aria-hidden className="absolute right-14 top-14 h-4 w-4 text-indigo-300/60 transition-transform duration-500 group-hover:-rotate-12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2z"/></svg>

                {/* Hover ring */}
                <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 ring-2 ring-inset ring-violet-300/40 transition-opacity duration-300 group-hover:opacity-100" />

                <div className="relative z-10 mt-auto w-full p-7 md:p-8">
                  <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-violet-300/30 bg-violet-400/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-violet-100 backdrop-blur-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-violet-300" />
                    {copy.aiTag}
                    <span className="ml-1 rounded-full bg-gradient-to-r from-violet-400 to-indigo-400 px-1.5 py-px text-[9px] font-bold normal-case tracking-normal text-white">{copy.aiBadge}</span>
                  </span>
                  <h2 className="font-bold leading-tight tracking-tight text-white" style={{ fontSize: "clamp(22px, 2.6vw, 34px)" }}>
                    {copy.aiTitle}
                  </h2>
                  <p className="mt-2.5 text-[14px] leading-relaxed text-white/75">
                    {copy.aiText}
                  </p>
                  <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[13.5px] font-bold text-[#0d0d0d] shadow-lg transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-violet-500 group-hover:to-indigo-500 group-hover:text-white group-hover:shadow-[0_8px_24px_rgba(139,92,246,0.55)]">
                    {copy.aiCta}
                    <svg className="transition-transform group-hover:translate-x-0.5" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
                  </div>
                </div>
              </button>

              {/* DIY — výběr šablony */}
              <button
                type="button"
                onClick={() => { setFlow("diy"); setStep(loggedInEmail ? "templates" : "register"); }}
                className="group relative flex min-h-[220px] flex-1 cursor-pointer flex-col overflow-hidden rounded-2xl border border-white/10 text-left outline-none transition-all duration-300 hover:border-white/40 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.15),0_24px_60px_rgba(0,0,0,0.6)] focus-visible:ring-2 focus-visible:ring-white/40"
              >
                {/* Photo */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/onboarding-diy.webp"
                  alt=""
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                  className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                {/* Hover border glow */}
                <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 ring-2 ring-inset ring-white/30 transition-opacity duration-300 group-hover:opacity-100" />

                {/* Content */}
                <div className="relative z-10 mt-auto w-full p-7 md:p-8">
                  {/* Tag */}
                  <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-white/80 backdrop-blur-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#2563eb]" />
                    {copy.diyTag}
                  </span>
                  <h2 className="font-bold leading-tight tracking-tight text-white" style={{ fontSize: "clamp(22px, 2.6vw, 34px)" }}>
                    {copy.diyTitle}
                  </h2>
                  <p className="mt-2.5 text-[14px] leading-relaxed text-white/75">
                    {copy.diyText}
                  </p>
                  <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[13.5px] font-bold text-[#0d0d0d] shadow-lg transition-all duration-300 group-hover:bg-[#2563eb] group-hover:text-white group-hover:shadow-[0_8px_24px_rgba(37,99,235,0.5)]">
                    {copy.diyCta}
                    <svg className="transition-transform group-hover:translate-x-0.5" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
                  </div>
                </div>
              </button>

              {/* RIGHT — Agency */}
              <button
                type="button"
                onClick={() => setStep("agency-form")}
                className="group relative flex min-h-[220px] flex-1 cursor-pointer flex-col overflow-hidden rounded-2xl border border-white/10 text-left outline-none transition-all duration-300 hover:border-white/40 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.15),0_24px_60px_rgba(0,0,0,0.6)] focus-visible:ring-2 focus-visible:ring-white/40"
              >
                {/* Photo */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/onboarding-team.webp"
                  alt="Tým Webero"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                  className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                {/* Hover border glow */}
                <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 ring-2 ring-inset ring-white/30 transition-opacity duration-300 group-hover:opacity-100" />

                {/* Content */}
                <div className="relative z-10 mt-auto w-full p-7 md:p-8">
                  {/* Tag */}
                  <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-white/80 backdrop-blur-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#a855f7]" />
                    {copy.agencyTag}
                  </span>
                  <h2 className="font-bold leading-tight tracking-tight text-white" style={{ fontSize: "clamp(22px, 2.6vw, 34px)" }}>
                    {copy.agencyTitle}
                  </h2>
                  <p className="mt-2.5 text-[14px] leading-relaxed text-white/75">
                    {copy.agencyText}
                  </p>
                  <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[13.5px] font-bold text-[#0d0d0d] shadow-lg transition-all duration-300 group-hover:bg-[#a855f7] group-hover:text-white group-hover:shadow-[0_8px_24px_rgba(168,85,247,0.5)]">
                    {copy.agencyCta}
                    <svg className="transition-transform group-hover:translate-x-0.5" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
                  </div>
                </div>
              </button>
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
            <button type="button" onClick={() => setStep("choice")} className="absolute left-6 top-6 z-10 inline-flex items-center gap-1.5 text-[13px] font-medium text-white/35 transition hover:text-white/65">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
              {copy.back}
            </button>
            <button type="button" onClick={onClose} aria-label={copy.close} className="absolute right-6 top-6 z-20 grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white/60 transition hover:bg-white/20 hover:text-white">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>

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
                  {locale === "en" ? "Signed in as" : "Přihlášen jako"} <span className="text-white/55">{loggedInEmail}</span>
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

        {/* ══════════════ STEP 2: REGISTER ══════════════ */}
        {step === "register" && (
          <motion.div
            key="register"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            className="flex h-full flex-col items-center justify-center px-4"
          >
            {!initialTemplate && (
              <button type="button" onClick={() => setStep(isBuilderFlow ? "ai-brief" : "choice")} className="absolute left-6 top-6 inline-flex items-center gap-1.5 text-[13px] font-medium text-white/35 transition hover:text-white/65">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                {copy.back}
              </button>
            )}
            <button type="button" onClick={onClose} aria-label={copy.close} className="absolute right-6 top-6 z-20 grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white/60 transition hover:bg-white/20 hover:text-white">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>

            <div className="w-full max-w-[500px] text-center">
              <h1 className="font-extrabold leading-tight tracking-tight text-white" style={{ fontSize: "clamp(34px, 5vw, 62px)" }}>
                {copy.registerTitle}
              </h1>
              <p className="mt-4 text-[15px] leading-relaxed text-white/45">
                {copy.registerText}
              </p>

              <form onSubmit={handleRegisterSubmit} className="mt-10 space-y-3 text-left">
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
                  {copy.createAccount}
                  <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
                </button>
              </form>

              <p className="mt-5 text-center text-[13px] text-white/35">
                {copy.haveAccount}{" "}
                <Link href="/account/login" className="text-white/65 underline underline-offset-2 hover:text-white transition-colors">
                  {copy.login}
                </Link>
              </p>
            </div>
          </motion.div>
        )}

        {/* ══════════════ STEP 3: TEMPLATES ══════════════ */}
        {step === "templates" && (
          <motion.div
            key="templates"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            className="flex h-full flex-col"
          >
            <button type="button" onClick={() => setStep(loggedInEmail ? "choice" : "register")} className="absolute left-6 top-6 z-10 inline-flex items-center gap-1.5 text-[13px] font-medium text-white/35 transition hover:text-white/65">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
              {copy.back}
            </button>
            <button type="button" onClick={onClose} aria-label={copy.close} className="absolute right-6 top-6 z-20 grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white/60 transition hover:bg-white/20 hover:text-white">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>

            {/* Header */}
            <div className="flex-shrink-0 px-8 pb-5 pt-16 text-center md:pt-14">
              <h1 className="font-extrabold leading-tight tracking-tight text-white" style={{ fontSize: "clamp(28px, 4vw, 52px)" }}>
                {copy.conceptsTitle}
              </h1>
              <p className="mx-auto mt-3 max-w-lg text-[14.5px] leading-relaxed text-white/40">
                {copy.conceptsText}
              </p>

              {/* Category tabs — plain text, no pills */}
              <div className="-mx-8 mt-7 flex items-center justify-center gap-7 overflow-x-auto px-8 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {[{ code: "all", label: copy.all, count: pickerTemplates.length }, ...categories].map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => { setCategory(c.code); setPreviewSheet(null); }}
                    className={`flex-shrink-0 text-[14px] font-bold transition ${
                      category === c.code
                        ? "text-white"
                        : "text-white/38 hover:text-white/65"
                    }`}
                  >
                    {c.code === "all" ? copy.all : (locale === "en" ? CATEGORY_LABELS_EN[c.code] : CATEGORY_LABELS[c.code]) ?? c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Template grid */}
            <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-24 md:px-10">
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
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {filteredTemplates.map((t) => (
                    <TemplateCard
                      locale={locale}
                      key={t.key}
                      t={t}
                      active={template === t.key}
                      onSelect={() => { setTemplate(t.key); setPreviewView(isMobileDevice ? "mobile" : "desktop"); setPreviewSheet(t); }}
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
                    {/* Desktop/Mobile toggle — only when demoUrl available */}
                    {previewSheet.demoUrl && (
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
                      onClick={() => { setPreviewSheet(null); void startBuilding(); }}
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

            {/* Sticky bottom */}
            <div className="fixed inset-x-0 bottom-0 z-10 flex items-center justify-center gap-5 border-t border-[#1e1e1e] bg-[#111]/96 px-6 py-4 backdrop-blur-md">
              {error && (
                <span className="text-[12.5px] text-red-400">{error}</span>
              )}
              {template && selectedName && (
                <span className="hidden text-[13px] text-white/40 sm:inline">
                  {copy.selected} <span className="font-semibold text-white/80">{selectedName}</span>
                </span>
              )}
              <button
                type="button"
                disabled={!template}
                onClick={startBuilding}
                className="inline-flex items-center gap-2 rounded-lg bg-[#2563eb] px-8 py-3 text-[14px] font-semibold text-white transition hover:bg-[#1d4ed8] disabled:opacity-40 active:scale-[0.99]"
              >
                {copy.continue}
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
              </button>
            </div>
          </motion.div>
        )}

        {/* ══════════════ AGENCY FORM ══════════════ */}
        {step === "agency-form" && (
          <motion.div
            key="agency-form"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            className="flex h-full flex-col overflow-y-auto"
          >
            <button type="button" onClick={() => setStep("choice")} className="absolute left-6 top-6 z-10 inline-flex items-center gap-1.5 text-[13px] font-medium text-white/35 transition hover:text-white/65">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
              {copy.back}
            </button>
            <button type="button" onClick={onClose} aria-label={copy.close} className="absolute right-6 top-6 z-20 grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white/60 transition hover:bg-white/20 hover:text-white">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>

            {/* Blue hero */}
            <div className="flex-shrink-0 bg-[#2563eb] px-8 pb-12 pt-16 text-center">
              <p className="mb-3 text-[12px] font-bold uppercase tracking-[0.22em] text-white/70">webero.</p>
              <h1 className="font-extrabold leading-tight tracking-tight text-white" style={{ fontSize: "clamp(28px, 4vw, 52px)" }}>
                {copy.agencyHero}
              </h1>
              <p className="mx-auto mt-4 max-w-md text-[14.5px] leading-relaxed text-white/70">
                {copy.agencyIntro}
              </p>
            </div>

            {/* Form area */}
            {agSent ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
                <div className="grid h-16 w-16 place-items-center rounded-full bg-[#22c55e]/15">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7" /></svg>
                </div>
                <h2 className="text-[22px] font-bold text-white">{copy.sentTitle}</h2>
                <p className="text-[14px] text-white/45">{copy.sentText}</p>
              </div>
            ) : (
              <form onSubmit={handleAgencySubmit} className="flex-1 px-6 py-10 md:px-16">
                <div className="mx-auto grid max-w-[900px] gap-10 md:grid-cols-[1fr_240px]">
                  <div className="space-y-10">

                    {/* Section 1 */}
                    <div>
                      <h3 className="mb-5 text-[16px] font-bold text-white">{copy.sectionAbout}</h3>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <AgInput value={agFirstName} onChange={setAgFirstName} placeholder={copy.firstName} required />
                        <AgInput value={agLastName} onChange={setAgLastName} placeholder={copy.lastName} required />
                        <AgInput value={agCompany} onChange={setAgCompany} placeholder={copy.company} required />
                        <AgInput value={agEmail} onChange={setAgEmail} placeholder={copy.email} type="email" required />
                        <AgInput value={agPhone} onChange={setAgPhone} placeholder={copy.phone} type="tel" required />
                        <AgInput value={agWebsite} onChange={setAgWebsite} placeholder={copy.website} />
                      </div>
                    </div>

                    {/* Section 2 */}
                    <div>
                      <h3 className="mb-5 text-[16px] font-bold text-white">{copy.sectionProject}</h3>
                      <div className="space-y-3">
                        <select
                          value={agProjectType}
                          onChange={(e) => setAgProjectType(e.target.value)}
                          required
                          className="w-full rounded-lg border border-[#2e2e2e] bg-[#1c1c1c] px-4 py-3.5 text-[14px] text-white outline-none transition focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20"
                        >
                          <option value="" disabled className="text-white/30">{copy.projectType}</option>
                          {projectTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <textarea
                          value={agGoal}
                          onChange={(e) => setAgGoal(e.target.value)}
                          required
                          rows={4}
                          placeholder={copy.goal}
                          className="w-full resize-none rounded-lg border border-[#2e2e2e] bg-[#1c1c1c] px-4 py-3.5 text-[14px] text-white placeholder-white/28 outline-none transition focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20"
                        />
                        <textarea
                          value={agInspo}
                          onChange={(e) => setAgInspo(e.target.value)}
                          rows={3}
                          placeholder={copy.inspo}
                          className="w-full resize-none rounded-lg border border-[#2e2e2e] bg-[#1c1c1c] px-4 py-3.5 text-[14px] text-white placeholder-white/28 outline-none transition focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20"
                        />
                      </div>
                    </div>

                    {/* Section 3 */}
                    <div>
                      <h3 className="mb-1 text-[16px] font-bold text-white">{copy.sectionBudget}</h3>
                      <p className="mb-5 text-[13px] text-white/38">
                        {copy.budgetIntro}
                      </p>
                      <p className="mb-3 text-[12px] font-semibold uppercase tracking-wider text-white/40">{copy.budget}</p>
                      <div className="mb-5 flex flex-wrap gap-3">
                        {budgetOptions.map((opt) => (
                          <label
                            key={opt}
                            className={`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2.5 text-[13.5px] font-medium transition ${
                              agBudget === opt
                                ? "border-[#2563eb] bg-[#2563eb]/10 text-white"
                                : "border-[#2e2e2e] bg-[#1c1c1c] text-white/75 hover:border-[#444]"
                            }`}
                          >
                            <input
                              type="radio"
                              name="budget"
                              value={opt}
                              checked={agBudget === opt}
                              onChange={() => setAgBudget(opt)}
                              className="sr-only"
                            />
                            {opt}
                          </label>
                        ))}
                      </div>
                      <AgInput value={agDeadline} onChange={setAgDeadline} placeholder={copy.deadline} />
                    </div>

                    <button
                      type="submit"
                      className="group inline-flex items-center gap-2 rounded-lg bg-[#2563eb] px-8 py-3.5 text-[14.5px] font-semibold text-white transition hover:bg-[#1d4ed8] active:scale-[0.99]"
                    >
                      {copy.submitRequest}
                      <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
                    </button>
                  </div>

                  {/* Sidebar */}
                  <div className="hidden md:block">
                    <div className="sticky top-6 rounded-2xl border border-[#2a2a2a] bg-[#171717] p-6 text-center">
                      <div className="mx-auto mb-4 h-16 w-16 overflow-hidden rounded-full bg-[#2a2a2a]">
                        <div className="flex h-full items-center justify-center text-[24px] text-white/20">👤</div>
                      </div>
                      <p className="text-[14px] font-bold text-white">{copy.replyTitle}</p>
                      <p className="mt-0.5 text-[12px] text-white/45">{copy.replyPerson}</p>
                      <p className="mt-4 text-[13px] leading-relaxed text-white/40">
                        {copy.replyText}
                      </p>
                    </div>
                  </div>
                </div>
              </form>
            )}

            {/* Quote + logos */}
            <div className="flex-shrink-0 bg-[#2563eb] px-8 py-12 text-center">
              <p className="mx-auto max-w-2xl text-[clamp(18px,2.5vw,26px)] font-bold leading-snug text-white">
                {copy.quote}
              </p>
              <p className="mt-4 text-[13px] text-white/60">{copy.quoteBy}</p>
            </div>
            <div className="hidden">
            </div>
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
                {copy.buildingTitle}
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
              {copy.doneTitleA}<br /><span className="text-[#22c55e]">{copy.doneTitleB}</span>
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

  return (
    <button type="button" onClick={onSelect} aria-label={`${ONBOARDING_COPY[locale].chooseTemplate} ${t.name}`} className="block w-full text-left">
      <div
        ref={wrapRef}
        onMouseEnter={() => { setHovered(true); startScroll(); }}
        onMouseLeave={() => { setHovered(false); resetScroll(); }}
        className="relative overflow-hidden rounded-xl bg-[#1a1a1a]"
        style={{
          aspectRatio: "3/2",
          boxShadow: active ? "0 0 0 2px #2563eb, 0 0 0 4px #111" : hovered ? "0 8px 24px rgba(0,0,0,0.4)" : "0 0 0 1px rgba(255,255,255,0.08)",
          transition: "box-shadow 0.25s",
        }}
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
        {/* Hover gradient overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent transition-opacity duration-300" style={{ opacity: hovered ? 1 : 0 }} />
        {/* Active checkmark */}
        {active && (
          <div className="absolute right-2 top-2 z-10 grid h-6 w-6 place-items-center rounded-full bg-[#2563eb] shadow-lg">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7" /></svg>
          </div>
        )}
      </div>
      <div className="mt-2 px-0.5">
        <div className="truncate text-[13px] font-bold text-white/90">{t.name}</div>
        {industry && <div className="mt-0.5 text-[11px] text-white/35">{(locale === "en" ? INDUSTRY_LABELS_EN[industry] : INDUSTRY_LABELS[industry]) ?? industry}</div>}
      </div>
    </button>
  );
}

/* ─── AgInput helper ─── */
function AgInput({
  value, onChange, placeholder, type = "text", required = false,
}: { value: string; onChange: (v: string) => void; placeholder: string; type?: string; required?: boolean }) {
  return (
    <input
      type={type}
      required={required}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-lg border border-[#2e2e2e] bg-[#1c1c1c] px-4 py-3.5 text-[14px] text-white placeholder-white/28 outline-none transition focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20"
    />
  );
}
