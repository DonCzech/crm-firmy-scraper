"use client";

import { useEffect, useState } from "react";
import { ArrowRight, X, Sparkles, Rocket } from "@/components/studio/icons";
import { Button } from "./ui";

/**
 * Multi-step welcome tour. Shown automatically the first time a tenant opens
 * studio (persisted via localStorage). Anchored via data-tour-id attributes on
 * shell elements.
 */
interface Step {
  id: string;
  title: string;
  body: string;
  target?: string; // data-tour-id selector
  side?: "left" | "right" | "top" | "bottom";
}

const STEPS: Step[] = [
  {
    id: "welcome",
    title: "Vítej v Webero Studio",
    body: "Tvůj vlastní web — nastavený za pár minut. Tady ti rychle ukážeme nejdůležitější ovládání. Můžeš to vynechat kdykoli.",
  },
  {
    id: "rail",
    target: "rail",
    side: "right",
    title: "Levý panel — výběr nástroje",
    body: "Vrstvy, Přidat sekci, Stránky, Knihovna obrázků, Identita firmy, Nastavení. Klikni na ikonu, panel se otevře.",
  },
  {
    id: "brand",
    target: "rail-brand",
    side: "right",
    title: "Identita firmy",
    body: "Vyplň název, kontakt a hodiny. Tyto údaje se propíší do všech sekcí — a zachovají se i když si vyměníš design.",
  },
  {
    id: "canvas",
    target: "canvas",
    side: "left",
    title: "Náhled webu uprostřed",
    body: "Klikni na sekci — vpravo se otevře editor. Texty změníš přímo na stránce. Obrázky vyměníš jedním klikem.",
  },
  {
    id: "inspector",
    target: "inspector",
    side: "left",
    title: "Inspector — finální dolazení",
    body: "Vpravo upravíš obsah, layout a styly. Modrá tečka znamená, že jsi pole změnil oproti šabloně.",
  },
  {
    id: "topbar",
    target: "topbar-publish",
    side: "bottom",
    title: "Spuštění webu",
    body: "Až bude vše hotové, klikni Spustit web. Šablona se objeví v katalogu a tenant přejde do produkce.",
  },
];

const LS_KEY = "webero-studio-onboarding-done";

export function OnboardingTour({ tenantSlug }: { tenantSlug: string }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [target, setTarget] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const done = localStorage.getItem(`${LS_KEY}:${tenantSlug}`);
    if (!done) setOpen(true);
  }, [tenantSlug]);

  useEffect(() => {
    if (!open) return;
    const s = STEPS[step];
    if (!s?.target) { setTarget(null); return; }
    const el = document.querySelector<HTMLElement>(`[data-tour-id="${s.target}"]`);
    if (el) setTarget(el.getBoundingClientRect());
    else setTarget(null);
  }, [open, step]);

  function finish() {
    localStorage.setItem(`${LS_KEY}:${tenantSlug}`, "1");
    setOpen(false);
  }

  if (!open) return null;
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div
      role="dialog"
      aria-modal
      className="pointer-events-none fixed inset-0 z-[90]"
    >
      {/* Spotlight backdrop with rectangular cutout for the target */}
      <div className="pointer-events-auto absolute inset-0 bg-black/65 backdrop-blur-[2px] transition-opacity duration-300">
        {target && (
          <svg className="absolute inset-0 h-full w-full" aria-hidden>
            <defs>
              <mask id="vs-tour-mask">
                <rect width="100%" height="100%" fill="white" />
                <rect
                  x={target.left - 8}
                  y={target.top - 8}
                  width={target.width + 16}
                  height={target.height + 16}
                  rx="10"
                  fill="black"
                />
              </mask>
            </defs>
            <rect width="100%" height="100%" fill="black" opacity="0.55" mask="url(#vs-tour-mask)" />
            <rect
              x={target.left - 8}
              y={target.top - 8}
              width={target.width + 16}
              height={target.height + 16}
              rx="10"
              fill="none"
              stroke="rgba(165,180,252,0.85)"
              strokeWidth="2"
            />
          </svg>
        )}
      </div>

      {/* Card */}
      <Card target={target} side={current.side} step={step} total={STEPS.length}>
        <div className="mb-2 flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[var(--vs-accent-bg)] text-[var(--vs-accent-hi)]">
            {step === 0 ? <Sparkles className="h-3.5 w-3.5" /> : <Rocket className="h-3.5 w-3.5" />}
          </div>
          <h3 className="text-[14px] font-semibold text-[var(--vs-text)]">{current.title}</h3>
        </div>
        <p className="text-[12.5px] leading-relaxed text-[var(--vs-text-soft)]">{current.body}</p>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex gap-1">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step
                    ? "w-6 bg-[var(--vs-accent-hi)]"
                    : i < step
                    ? "w-1.5 bg-[var(--vs-accent)]"
                    : "w-1.5 bg-[var(--vs-border-strong)]"
                }`}
              />
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="xs" onClick={finish}>Přeskočit</Button>
            {isLast ? (
              <Button variant="primary" size="sm" onClick={finish} iconLeft={<Rocket className="h-3 w-3" />}>
                Začít upravovat
              </Button>
            ) : (
              <Button variant="primary" size="sm" onClick={() => setStep((s) => s + 1)} iconRight={<ArrowRight className="h-3 w-3" />}>
                Dál
              </Button>
            )}
          </div>
        </div>

        <button
          aria-label="Zavřít"
          onClick={finish}
          className="absolute right-2 top-2 rounded p-1 text-[var(--vs-text-muted)] hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text)]"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </Card>
    </div>
  );
}

function Card({
  target, side, step, total, children,
}: {
  target: DOMRect | null;
  side?: Step["side"];
  step: number;
  total: number;
  children: React.ReactNode;
}) {
  const [viewport, setViewport] = useState({ width: 1024, height: 768 });

  useEffect(() => {
    const update = () => setViewport({ width: window.innerWidth, height: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const style: React.CSSProperties = (() => {
    const W = Math.min(340, Math.max(280, viewport.width - 24));
    const H = 220;
    const gap = 16;
    const clampLeft = (value: number) => Math.max(12, Math.min(value, viewport.width - W - 12));
    const clampTop = (value: number) => Math.max(12, Math.min(value, viewport.height - H - 12));

    if (!target) {
      return {
        left: "50%",
        top: "50%",
        width: W,
        transform: "translate(-50%, -50%)",
      };
    }

    let left = target.left + target.width / 2 - W / 2;
    let top = target.bottom + gap;
    switch (side) {
      case "right":
        left = target.right + gap;
        top = target.top;
        break;
      case "left":
        left = target.left - W - gap;
        top = target.top;
        break;
      case "top":
        top = target.top - H - gap;
        break;
      case "bottom":
      default:
        break;
    }
    return { left: clampLeft(left), top: clampTop(top), width: W };
  })();

  return (
    <div
      className="pointer-events-auto absolute rounded-xl bg-[var(--vs-surface)] p-4 shadow-[var(--vs-shadow-xl)] ring-1 ring-[var(--vs-border-strong)] vs-enter"
      style={style}
    >
      <div className="mb-3 flex items-center justify-between text-[10px] uppercase tracking-[var(--vs-tracking-wider)] text-[var(--vs-text-muted)]">
        <span>Průvodce {step + 1} z {total}</span>
        <span className="max-[380px]:hidden">Webero Studio</span>
      </div>
      {children}
    </div>
  );
}
