"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Step = "choice" | "register" | "templates" | "agency-form" | "building" | "done";

const BUILD_STEPS = [
  "Připravuje se doména",
  "Vytváří se databáze",
  "Kopíruje se šablona",
  "Nastavuje se design",
  "Aktivuje se editor",
  "Hotovo",
];

export interface ModalTemplate {
  key: string;
  name: string;
  industry?: string | null;
  previewImage?: string;
  demoUrl?: string | null;
}

interface Props {
  onClose: () => void;
  initialTemplate?: string;
  templateName?: string;
  catalogTemplates?: ModalTemplate[];
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

const CATEGORY_LABELS: Record<string, string> = {
  all: "Vše",
  sluzby: "Služby",
  hotel: "Hotely",
  realEstate: "Reality",
  landing: "Landing page",
  gastro: "Gastronomie",
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

const PROJECT_TYPES = [
  "Firemní web",
  "E-shop",
  "Landing page",
  "Portfolio",
  "Blog / magazín",
  "Jiné",
];

export function OnboardingModal({ onClose, initialTemplate, templateName, catalogTemplates }: Props) {
  const [step, setStep] = useState<Step>(initialTemplate ? "register" : "choice");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
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
      .map(([code, n]) => ({ code, label: INDUSTRY_LABELS[code] ?? code, count: n }))
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

  async function startBuilding() {
    setError("");
    setStep("building");
    setBuildStep(0);

    for (let i = 0; i < BUILD_STEPS.length - 1; i++) {
      await delay(1100);
      setBuildStep(i + 1);
    }

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, phone, templateKey: template }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Chyba při vytváření webu");
        setStep("register");
        return;
      }

      setEditorUrl(data.editorUrl);
      setPreviewUrl(data.previewUrl);
      setAccessToken(data.accessToken ?? "");
      await delay(600);
      setStep("done");
    } catch {
      setError("Nepodařilo se připojit k serveru. Zkuste to znovu.");
      setStep("register");
    }
  }

  async function handleRegisterSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (initialTemplate) {
      await startBuilding();
    } else {
      setStep("templates");
    }
  }

  async function handleAgencySubmit(e: React.FormEvent) {
    e.preventDefault();
    setAgSent(true);
  }

  const progressPercent = ((buildStep + 1) / BUILD_STEPS.length) * 100;

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
              aria-label="Zavřít"
              className="absolute right-6 top-6 z-20 grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white/60 transition hover:bg-white/20 hover:text-white"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>

            {/* Heading */}
            <div className="flex-shrink-0 px-6 pb-4 pt-10 text-center">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/50">webero.</p>
              <h1 className="mt-2 text-[clamp(20px,2.2vw,28px)] font-bold text-white">
                Jak chcete začít?
              </h1>
            </div>

            {/* Cards row */}
            <div className="flex flex-1 flex-col gap-3 overflow-hidden px-5 pb-4 md:flex-row md:gap-4 md:px-8">

              {/* LEFT — DIY */}
              <button
                type="button"
                onClick={() => setStep("register")}
                className="group relative flex flex-1 cursor-pointer flex-col overflow-hidden rounded-2xl border border-white/10 text-left outline-none transition-all duration-300 hover:border-white/40 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.15),0_24px_60px_rgba(0,0,0,0.6)] focus-visible:ring-2 focus-visible:ring-white/40"
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
                    Samostatně
                  </span>
                  <h2 className="font-bold leading-tight tracking-tight text-white" style={{ fontSize: "clamp(22px, 2.6vw, 34px)" }}>
                    Web chci stavět sám
                  </h2>
                  <p className="mt-2.5 text-[14px] leading-relaxed text-white/75">
                    Prvních 14 dní zdarma. Bez kreditní karty.<br className="hidden sm:block" />Žádné riziko, žádné závazky.
                  </p>
                  <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[13.5px] font-bold text-[#0d0d0d] shadow-lg transition-all duration-300 group-hover:bg-[#2563eb] group-hover:text-white group-hover:shadow-[0_8px_24px_rgba(37,99,235,0.5)]">
                    Vytvořit zkušební verzi
                    <svg className="transition-transform group-hover:translate-x-0.5" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
                  </div>
                </div>
              </button>

              {/* RIGHT — Agency */}
              <button
                type="button"
                onClick={() => setStep("agency-form")}
                className="group relative flex flex-1 cursor-pointer flex-col overflow-hidden rounded-2xl border border-white/10 text-left outline-none transition-all duration-300 hover:border-white/40 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.15),0_24px_60px_rgba(0,0,0,0.6)] focus-visible:ring-2 focus-visible:ring-white/40"
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
                    Na zakázku
                  </span>
                  <h2 className="font-bold leading-tight tracking-tight text-white" style={{ fontSize: "clamp(22px, 2.6vw, 34px)" }}>
                    Web chci kompletně dodat
                  </h2>
                  <p className="mt-2.5 text-[14px] leading-relaxed text-white/75">
                    Web vám připravíme na zakázku.<br className="hidden sm:block" />Přijímáme jen 8 klientů měsíčně.
                  </p>
                  <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[13.5px] font-bold text-[#0d0d0d] shadow-lg transition-all duration-300 group-hover:bg-[#a855f7] group-hover:text-white group-hover:shadow-[0_8px_24px_rgba(168,85,247,0.5)]">
                    Získat nabídku
                    <svg className="transition-transform group-hover:translate-x-0.5" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
                  </div>
                </div>
              </button>
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
              <button type="button" onClick={() => setStep("choice")} className="absolute left-6 top-6 inline-flex items-center gap-1.5 text-[13px] font-medium text-white/35 transition hover:text-white/65">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                Zpět
              </button>
            )}
            <button type="button" onClick={onClose} aria-label="Zavřít" className="absolute right-6 top-6 z-20 grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white/60 transition hover:bg-white/20 hover:text-white">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>

            <div className="w-full max-w-[500px] text-center">
              <h1 className="font-extrabold leading-tight tracking-tight text-white" style={{ fontSize: "clamp(34px, 5vw, 62px)" }}>
                Vytvořte si<br />zkušební verzi zdarma
              </h1>
              <p className="mt-4 text-[15px] leading-relaxed text-white/45">
                14denní zkušební verze, bez kreditní karty, přístup ke všem funkcím.
              </p>

              <form onSubmit={handleRegisterSubmit} className="mt-10 space-y-3 text-left">
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Jméno *"
                  className="w-full rounded-lg border border-[#2e2e2e] bg-[#1c1c1c] px-5 py-4 text-[15px] text-white placeholder-white/28 outline-none transition focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20" />
                <input type="email" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail *"
                  className="w-full rounded-lg border border-[#2e2e2e] bg-[#1c1c1c] px-5 py-4 text-[15px] text-white placeholder-white/28 outline-none transition focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20" />
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Telefon"
                  className="w-full rounded-lg border border-[#2e2e2e] bg-[#1c1c1c] px-5 py-4 text-[15px] text-white placeholder-white/28 outline-none transition focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20" />

                {error && <div className="rounded-lg border border-red-900/40 bg-red-950/40 px-4 py-3 text-[13px] text-red-400">{error}</div>}

                <button type="submit" className="group flex w-full items-center justify-center gap-2 rounded-lg bg-[#2563eb] px-6 py-4 text-[15px] font-semibold text-white transition hover:bg-[#1d4ed8] active:scale-[0.99]">
                  Vytvořit účet zdarma
                  <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
                </button>
              </form>
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
            <button type="button" onClick={() => setStep("register")} className="absolute left-6 top-6 z-10 inline-flex items-center gap-1.5 text-[13px] font-medium text-white/35 transition hover:text-white/65">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
              Zpět
            </button>
            <button type="button" onClick={onClose} aria-label="Zavřít" className="absolute right-6 top-6 z-20 grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white/60 transition hover:bg-white/20 hover:text-white">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>

            {/* Header */}
            <div className="flex-shrink-0 px-8 pb-5 pt-16 text-center md:pt-14">
              <h1 className="font-extrabold leading-tight tracking-tight text-white" style={{ fontSize: "clamp(28px, 4vw, 52px)" }}>
                Přivítejte webové koncepty
              </h1>
              <p className="mx-auto mt-3 max-w-lg text-[14.5px] leading-relaxed text-white/40">
                Jsou kombinací designu, obsahu a funkcí pro daný obor.<br />
                Představují nejlepší startovní bod pro váš web. Změnit v nich můžete vše.
              </p>

              {/* Category tabs — plain text, no pills */}
              <div className="-mx-8 mt-7 flex items-center justify-center gap-7 overflow-x-auto px-8 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {[{ code: "all", label: "Vše", count: pickerTemplates.length }, ...categories].map((c) => (
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
                    {CATEGORY_LABELS[c.code] ?? c.label}
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
                  <p className="text-[14px] text-white/40">V kategorii nic nenalezeno</p>
                  <button type="button" onClick={() => setCategory("all")} className="text-[13px] font-semibold text-[#2563eb] hover:underline">
                    Zobrazit vše →
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {filteredTemplates.map((t) => (
                    <TemplateCard
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
                      Zpět
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
                          Mobil
                        </button>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => { setPreviewSheet(null); void startBuilding(); }}
                      className="flex-shrink-0 rounded-full bg-[#2563eb] px-4 py-2 text-[12.5px] font-semibold text-white"
                    >
                      Použít →
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
                              title={`Mobilní náhled ${previewSheet.name}`}
                            />
                            <div className="absolute bottom-1.5 left-1/2 h-0.5 w-16 -translate-x-1/2 rounded-full bg-white/30" />
                          </div>
                        </div>
                      ) : (
                        /* Desktop: full-width iframe */
                        <iframe
                          src={previewSheet.demoUrl}
                          style={{ width: "100%", height: "100%", border: 0, display: "block" }}
                          title={`Desktop náhled ${previewSheet.name}`}
                        />
                      )
                    ) : (
                      <div className="h-full overflow-y-auto">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={previewSheet.previewImage ?? `/templates/${previewSheet.key}/preview.png`}
                          alt={previewSheet.name}
                          className="w-full object-cover object-top"
                        />
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Sticky bottom */}
            <div className="fixed inset-x-0 bottom-0 z-10 flex items-center justify-center gap-5 border-t border-[#1e1e1e] bg-[#111]/96 px-6 py-4 backdrop-blur-md">
              {template && selectedName && (
                <span className="hidden text-[13px] text-white/40 sm:inline">
                  Vybráno: <span className="font-semibold text-white/80">{selectedName}</span>
                </span>
              )}
              <button
                type="button"
                disabled={!template}
                onClick={startBuilding}
                className="inline-flex items-center gap-2 rounded-lg bg-[#2563eb] px-8 py-3 text-[14px] font-semibold text-white transition hover:bg-[#1d4ed8] disabled:opacity-40 active:scale-[0.99]"
              >
                Pokračovat dál
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
              Zpět
            </button>
            <button type="button" onClick={onClose} aria-label="Zavřít" className="absolute right-6 top-6 z-20 grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white/60 transition hover:bg-white/20 hover:text-white">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>

            {/* Blue hero */}
            <div className="flex-shrink-0 bg-[#2563eb] px-8 pb-12 pt-16 text-center">
              <p className="mb-3 text-[12px] font-bold uppercase tracking-[0.22em] text-white/70">webero.</p>
              <h1 className="font-extrabold leading-tight tracking-tight text-white" style={{ fontSize: "clamp(28px, 4vw, 52px)" }}>
                Řekněte nám více o projektu
              </h1>
              <p className="mx-auto mt-4 max-w-md text-[14.5px] leading-relaxed text-white/70">
                Vyplnit formuláře zabere jednotky minut a ušetří hodiny času.<br />
                Na první schůzku budeme připraveni = bude maximálně užitečná.
              </p>
            </div>

            {/* Form area */}
            {agSent ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
                <div className="grid h-16 w-16 place-items-center rounded-full bg-[#22c55e]/15">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7" /></svg>
                </div>
                <h2 className="text-[22px] font-bold text-white">Poptávka odeslána!</h2>
                <p className="text-[14px] text-white/45">Ozveme se vám do 24 hodin.</p>
              </div>
            ) : (
              <form onSubmit={handleAgencySubmit} className="flex-1 px-6 py-10 md:px-16">
                <div className="mx-auto grid max-w-[900px] gap-10 md:grid-cols-[1fr_240px]">
                  <div className="space-y-10">

                    {/* Section 1 */}
                    <div>
                      <h3 className="mb-5 text-[16px] font-bold text-white">1. Informace o vás a firmě</h3>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <AgInput value={agFirstName} onChange={setAgFirstName} placeholder="Jméno *" required />
                        <AgInput value={agLastName} onChange={setAgLastName} placeholder="Příjmení *" required />
                        <AgInput value={agCompany} onChange={setAgCompany} placeholder="Název firmy *" required />
                        <AgInput value={agEmail} onChange={setAgEmail} placeholder="E-mail *" type="email" required />
                        <AgInput value={agPhone} onChange={setAgPhone} placeholder="Telefon *" type="tel" required />
                        <AgInput value={agWebsite} onChange={setAgWebsite} placeholder="www adresa firmy *" />
                      </div>
                    </div>

                    {/* Section 2 */}
                    <div>
                      <h3 className="mb-5 text-[16px] font-bold text-white">2. Informace o projektu</h3>
                      <div className="space-y-3">
                        <select
                          value={agProjectType}
                          onChange={(e) => setAgProjectType(e.target.value)}
                          required
                          className="w-full rounded-lg border border-[#2e2e2e] bg-[#1c1c1c] px-4 py-3.5 text-[14px] text-white outline-none transition focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20"
                        >
                          <option value="" disabled className="text-white/30">Jaký typ projektu chcete realizovat? *</option>
                          {PROJECT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <textarea
                          value={agGoal}
                          onChange={(e) => setAgGoal(e.target.value)}
                          required
                          rows={4}
                          placeholder="Proč chcete realizovat nový web? Čeho přesně chcete dosáhnout? *"
                          className="w-full resize-none rounded-lg border border-[#2e2e2e] bg-[#1c1c1c] px-4 py-3.5 text-[14px] text-white placeholder-white/28 outline-none transition focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20"
                        />
                        <textarea
                          value={agInspo}
                          onChange={(e) => setAgInspo(e.target.value)}
                          rows={3}
                          placeholder="Jaké weby jsou pro vás cílový stav inspirací?"
                          className="w-full resize-none rounded-lg border border-[#2e2e2e] bg-[#1c1c1c] px-4 py-3.5 text-[14px] text-white placeholder-white/28 outline-none transition focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20"
                        />
                      </div>
                    </div>

                    {/* Section 3 */}
                    <div>
                      <h3 className="mb-1 text-[16px] font-bold text-white">3. Rozpočet a termín projektu</h3>
                      <p className="mb-5 text-[13px] text-white/38">
                        Každé zadání má svůj rozsah. Je důležité vědět, jaký rozpočet máte připravený.
                      </p>
                      <p className="mb-3 text-[12px] font-semibold uppercase tracking-wider text-white/40">Rozpočet (CZK) *</p>
                      <div className="mb-5 flex flex-wrap gap-3">
                        {BUDGET_OPTIONS.map((opt) => (
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
                      <AgInput value={agDeadline} onChange={setAgDeadline} placeholder="Očekávaný termín spuštění" />
                    </div>

                    <button
                      type="submit"
                      className="group inline-flex items-center gap-2 rounded-lg bg-[#2563eb] px-8 py-3.5 text-[14.5px] font-semibold text-white transition hover:bg-[#1d4ed8] active:scale-[0.99]"
                    >
                      Odeslat poptávku
                      <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
                    </button>
                  </div>

                  {/* Sidebar */}
                  <div className="hidden md:block">
                    <div className="sticky top-6 rounded-2xl border border-[#2a2a2a] bg-[#171717] p-6 text-center">
                      <div className="mx-auto mb-4 h-16 w-16 overflow-hidden rounded-full bg-[#2a2a2a]">
                        <div className="flex h-full items-center justify-center text-[24px] text-white/20">👤</div>
                      </div>
                      <p className="text-[14px] font-bold text-white">Na zprávu odpoví</p>
                      <p className="mt-0.5 text-[12px] text-white/45">Jan Novák – sales</p>
                      <p className="mt-4 text-[13px] leading-relaxed text-white/40">
                        Reagujeme do 24 hodin. V dalším kroku si domluvíme 30minutovou online schůzku, při které projdeme detaily vašeho zadání.
                      </p>
                    </div>
                  </div>
                </div>
              </form>
            )}

            {/* Quote + logos */}
            <div className="flex-shrink-0 bg-[#2563eb] px-8 py-12 text-center">
              <p className="mx-auto max-w-2xl text-[clamp(18px,2.5vw,26px)] font-bold leading-snug text-white">
                „Díky za výbornou spolupráci a hlavně za výborný produkt! Skvěle se nám s ním pracuje."
              </p>
              <p className="mt-4 text-[13px] text-white/60">Tatána le Moigne – Inspire &amp; Impact, ex-Google</p>
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
                Váš web se už chystá
              </h1>
              <p className="mt-5 flex items-center justify-center gap-2 text-[15px] text-white/40">
                {buildStep + 1}. krok z {BUILD_STEPS.length} – {BUILD_STEPS[buildStep]}
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

            <p className="mb-3 text-[10.5px] font-bold uppercase tracking-[0.22em] text-[#22c55e]">Hotovo</p>
            <h2 className="font-extrabold leading-tight tracking-tight text-white" style={{ fontSize: "clamp(28px, 4vw, 48px)" }}>
              Váš web je<br /><span className="text-[#22c55e]">připravený.</span>
            </h2>

            {/* Access password — most important, shown first */}
            <div className="mt-7 w-full max-w-[420px] rounded-xl border border-[#f59e0b]/40 bg-[#f59e0b]/8 p-4 text-left">
              <div className="mb-2 flex items-center gap-2">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                <span className="text-[12px] font-bold text-[#f59e0b]">Zapište si přístupové heslo</span>
              </div>
              <p className="mb-3 text-[12px] leading-relaxed text-white/75">
                Toto heslo používáte pro přihlášení do editoru. Uložte ho na bezpečné místo — {email !== "" ? "zašleme ho také na váš e-mail, ale" : ""}
                {" "}v případě ztráty ho nelze obnovit bez kontaktu podpory.
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 rounded-lg border border-[#2e2e2e] bg-[#161616] px-3 py-2.5 font-mono text-[14px] tracking-wide text-white/90 select-all truncate">
                  {accessToken || "••••••••••••••••••••••••"}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!accessToken) return;
                    void navigator.clipboard.writeText(accessToken);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="shrink-0 rounded-lg border border-[#2e2e2e] bg-[#1c1c1c] px-3 py-2.5 text-[12px] font-semibold text-white/60 transition hover:border-[#3a3a3a] hover:text-white"
                >
                  {copied ? "✓ Zkopírováno" : "Kopírovat"}
                </button>
              </div>
            </div>

            {/* Email confirmation */}
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#242424] bg-[#191919] px-4 py-2 text-[12.5px] text-white/45">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="6" width="18" height="12" rx="2" /><path d="M3 7l9 7 9-7" />
              </svg>
              Posíláme přihlašovací údaje na <span className="ml-0.5 font-semibold text-white/80">{email}</span>
            </div>

            <div className="mt-7 flex w-full max-w-[360px] flex-col gap-3">
              <a href={editorUrl} className="group flex w-full items-center justify-center gap-2 rounded-lg bg-[#2563eb] px-6 py-4 text-[15px] font-semibold text-white transition hover:bg-[#1d4ed8]">
                Otevřít editor
                <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
              </a>
              <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#242424] px-6 py-3.5 text-[14px] font-semibold text-white/60 transition hover:border-[#3a3a3a] hover:text-white/90">
                Náhled webu <span aria-hidden>↗</span>
              </a>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}

/* ─── TemplateCard — real img scroll on hover, same style as /vybrat-design ─── */
function TemplateCard({ t, active, onSelect }: { t: ModalTemplate; active: boolean; onSelect: () => void }) {
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

  const previewSrc = t.previewImage ?? `/templates/${t.key}/preview.png`;
  const industry = t.industry ?? industryFromKey(t.key);

  return (
    <button type="button" onClick={onSelect} aria-label={`Vybrat šablonu ${t.name}`} className="block w-full text-left">
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
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src={previewSrc}
          alt={t.name}
          className="absolute left-0 top-0 block w-full will-change-transform"
          style={{ height: "auto", minHeight: "100%", objectFit: "cover", objectPosition: "top", transform: "translateY(0)", transitionProperty: "transform" }}
          loading="lazy"
        />
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
        {industry && <div className="mt-0.5 text-[11px] text-white/35">{INDUSTRY_LABELS[industry] ?? industry}</div>}
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
