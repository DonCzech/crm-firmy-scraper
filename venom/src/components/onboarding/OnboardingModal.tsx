"use client";

import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Step = "form" | "building" | "done";
type TemplateKey = "barber" | "wellness" | "lawyer" | "astera";

const TEMPLATES = [
  {
    key: "barber" as TemplateKey,
    name: "Barber & Salon",
    description: "Střihy, holení, luxusní salon",
    previewImage: "/images/template-previews/barber-hero-1440x900.webp",
    logo: "/images/logos/demo-barber-logo.svg",
  },
  {
    key: "wellness" as TemplateKey,
    name: "Wellness & Masáže",
    description: "Masáže, terapie, relaxace",
    previewImage: "/images/template-gallery/wellness-05-relax-massage-full-1920x1080.webp",
    logo: "/images/logos/demo-wellness-logo.svg",
  },
  {
    key: "lawyer" as TemplateKey,
    name: "Advokát & Poradce",
    description: "Právní kancelář, poradenství",
    previewImage: "/images/template-previews/lawyer-hero-1440x900.webp",
    logo: "/images/logos/demo-lawyer-logo.svg",
  },
  {
    key: "astera" as TemplateKey,
    name: "Petra Studio",
    description: "Konzultace, obsah, akce",
    previewImage: "/images/template-previews/petra-hero-1787x880.webp",
    logo: "/demo-assets/petra-logo.svg",
  },
];

const BUILD_STEPS = [
  "Připravujeme váš web",
  "Kopírujeme šablonu",
  "Nastavujeme design",
  "Připravujeme editor",
  "Optimalizujeme mobilní verzi",
  "Hotovo!",
];

interface Props {
  onClose: () => void;
}

export function OnboardingModal({ onClose }: Props) {
  const [step, setStep] = useState<Step>("form");
  const [email, setEmail] = useState("");
  const [template, setTemplate] = useState<TemplateKey>("barber");
  const [buildStep, setBuildStep] = useState(0);
  const [editorUrl, setEditorUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setStep("building");
    setBuildStep(0);

    // Animate build steps
    for (let i = 0; i < BUILD_STEPS.length - 1; i++) {
      await delay(900);
      setBuildStep(i + 1);
    }

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, templateKey: template }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Chyba při vytváření webu");
        setStep("form");
        return;
      }

      setEditorUrl(data.editorUrl);
      setPreviewUrl(data.previewUrl);
      await delay(600);
      setStep("done");
    } catch {
      setError("Nepodařilo se připojit k serveru. Zkuste to znovu.");
      setStep("form");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
    >
      <AnimatePresence mode="wait">
        {step === "form" && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.97 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 relative"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl leading-none"
            >
              ×
            </button>

            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              Vyzkoušejte zdarma
            </h2>
            <p className="text-gray-500 mb-6 text-sm">
              Za 30 sekund budete mít svůj profesionální web
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Váš e-mail
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vas@email.cz"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vyberte šablonu
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {TEMPLATES.map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setTemplate(t.key)}
                      className={`overflow-hidden rounded-xl border-2 text-center transition-all ${
                        template === t.key
                          ? "border-indigo-500 bg-indigo-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="relative h-16 bg-gray-100">
                        <Image src={t.previewImage} alt="" fill sizes="128px" className="object-cover" />
                        <div className="absolute inset-0 bg-black/15" />
                        <div className="absolute left-2 top-2 h-5 w-16 rounded bg-white/90 p-0.5 shadow-sm">
                          <Image src={t.logo} alt={t.name} fill sizes="64px" className="object-contain p-0.5" unoptimized />
                        </div>
                      </div>
                      <div className="px-2 py-2 text-xs font-medium text-gray-800 leading-tight">{t.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <p className="text-red-500 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors text-base"
              >
                Vytvořit web zdarma →
              </button>

              <p className="text-xs text-gray-400 text-center">
                Bez platební karty. Trial na 14 dní.
              </p>
            </form>
          </motion.div>
        )}

        {step === "building" && (
          <motion.div
            key="building"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-10 text-center"
          >
            <div className="mb-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                className="inline-block w-14 h-14 rounded-full border-4 border-indigo-200 border-t-indigo-600"
              />
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Připravujeme váš web…
            </h3>

            <div className="space-y-3 text-left">
              {BUILD_STEPS.map((label, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={i <= buildStep ? { opacity: 1, x: 0 } : { opacity: 0.3, x: 0 }}
                  className="flex items-center gap-3"
                >
                  <span className="text-lg">
                    {i < buildStep ? "✅" : i === buildStep ? "⏳" : "○"}
                  </span>
                  <span className={`text-sm ${i <= buildStep ? "text-gray-800 font-medium" : "text-gray-400"}`}>
                    {label}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {step === "done" && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-10 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.1 }}
              className="text-5xl mb-4"
            >
              🎉
            </motion.div>

            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Váš web je hotový!
            </h3>
            <p className="text-gray-500 text-sm mb-8">
              Přihlášení posíláme na <strong>{email}</strong>
            </p>

            <div className="space-y-3">
              <a
                href={editorUrl}
                className="block w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors"
              >
                Otevřít editor →
              </a>
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-medium hover:border-gray-300 transition-colors text-sm"
              >
                Náhled webu
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
