"use client";
import { useState, useEffect } from "react";
import Header from "@/astera/components/Header";
import Footer from "@/astera/components/Footer";
import { useContent } from "@/astera/context/ContentContext";
import { DEFAULT_CONTENT, PickACardGameCard } from "@/astera/lib/content-types";
import { UI_STRINGS } from "@/astera/lib/i18n";
import OptimizedImage from "@/astera/components/OptimizedImage";

const CARD_W = 200;
const CARD_H = 290;
const GAP = 20;
const DAILY_PICK_STORAGE_KEY = "astera-pick-card-daily";

type DailyPick = {
  dateKey: string;
  cardId: string;
};

function todayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function timeUntilReset() {
  const now = new Date();
  const reset = new Date(now);
  reset.setHours(23, 59, 59, 999);
  const diff = Math.max(0, reset.getTime() - now.getTime());
  const hours = Math.floor(diff / 3_600_000);
  const minutes = Math.max(1, Math.ceil((diff % 3_600_000) / 60_000));
  return hours > 0 ? `${hours} h ${minutes} min` : `${minutes} min`;
}

function uniqueDailyDeck(cards: PickACardGameCard[]) {
  const uniqueCards = [...new Map(cards.map((card) => [card.id, card])).values()];
  const shuffled = [...uniqueCards];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, 30);
}

function randomCard(cards: PickACardGameCard[]) {
  return cards[Math.floor(Math.random() * cards.length)] ?? cards[0];
}

export default function PickACardGame() {
  const { content, currentLang } = useContent();
  const ui = UI_STRINGS[currentLang];
  const pickContent = {
    ...DEFAULT_CONTENT.pickacard,
    ...content.pickacard,
    cards: content.pickacard.cards?.length ? content.pickacard.cards : DEFAULT_CONTENT.pickacard.cards,
  };
  const cards = pickContent.cards;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedLoopIndex, setSelectedLoopIndex] = useState<number | null>(null);
  const [phase, setPhase] = useState<"idle" | "zoom" | "flip" | "shown">("idle");
  const [shuffled, setShuffled] = useState<PickACardGameCard[]>(() => [...new Map(cards.map((card) => [card.id, card])).values()].slice(0, 30));
  const [dailyPick, setDailyPick] = useState<DailyPick | null>(null);
  const [alreadyPicked, setAlreadyPicked] = useState(false);
  const [resetText, setResetText] = useState("");
  const [sliderIndex, setSliderIndex] = useState(cards.length);
  const [sliderTransition, setSliderTransition] = useState(true);
  const loopedCards = [...shuffled, ...shuffled, ...shuffled];
  const cardStep = CARD_W + GAP;

  useEffect(() => {
    setShuffled(uniqueDailyDeck(cards));
  }, [cards]);

  useEffect(() => {
    if (!shuffled.length) return;
    setSliderTransition(false);
    setSliderIndex(shuffled.length);
    const frame = window.requestAnimationFrame(() => setSliderTransition(true));
    return () => window.cancelAnimationFrame(frame);
  }, [shuffled.length]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(DAILY_PICK_STORAGE_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored) as DailyPick;
      if (parsed.dateKey === todayKey() && parsed.cardId) {
        setDailyPick(parsed);
        setResetText(timeUntilReset());
      } else {
        window.localStorage.removeItem(DAILY_PICK_STORAGE_KEY);
      }
    } catch {
      window.localStorage.removeItem(DAILY_PICK_STORAGE_KEY);
    }
  }, []);

  const moveSlider = (dir: 1 | -1) => {
    if (phase !== "idle") return;
    setSliderTransition(true);
    setSliderIndex((current) => current + dir);
  };

  const handleSliderTransitionEnd = (event: React.TransitionEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget || !shuffled.length) return;
    if (sliderIndex >= shuffled.length * 2) {
      setSliderTransition(false);
      setSliderIndex(sliderIndex - shuffled.length);
      window.requestAnimationFrame(() => setSliderTransition(true));
    } else if (sliderIndex < shuffled.length) {
      setSliderTransition(false);
      setSliderIndex(sliderIndex + shuffled.length);
      window.requestAnimationFrame(() => setSliderTransition(true));
    }
  };

  const [revealedCard, setRevealedCard] = useState<PickACardGameCard | null>(null);

  const pickCard = (loopIndex: number) => {
    if (phase !== "idle") return;
    const activeDailyPick = dailyPick?.dateKey === todayKey() ? dailyPick : null;
    if (activeDailyPick) {
      const storedCard = shuffled.find(card => card.id === activeDailyPick.cardId) ?? cards.find(card => card.id === activeDailyPick.cardId) ?? shuffled[0] ?? cards[0];
      setSelectedId(storedCard.id);
      setSelectedLoopIndex(loopIndex);
      setRevealedCard(storedCard);
      setAlreadyPicked(true);
      setResetText(timeUntilReset());
      setPhase("zoom");
      setTimeout(() => setPhase("flip"), 700);
      setTimeout(() => setPhase("shown"), 1400);
      return;
    }

    const picked = randomCard(shuffled);
    const nextPick = { dateKey: todayKey(), cardId: picked.id };
    try {
      window.localStorage.setItem(DAILY_PICK_STORAGE_KEY, JSON.stringify(nextPick));
    } catch {}
    setDailyPick(nextPick);
    setAlreadyPicked(false);
    setResetText(timeUntilReset());
    setSelectedId(picked.id);
    setSelectedLoopIndex(loopIndex);
    setRevealedCard(picked);
    setPhase("zoom");
    setTimeout(() => setPhase("flip"), 700);
    setTimeout(() => setPhase("shown"), 1400);
  };

  const closeReveal = () => {
    if (phase !== "shown") return;
    setSelectedId(null);
    setSelectedLoopIndex(null);
    setRevealedCard(null);
    setAlreadyPicked(false);
    setPhase("idle");
  };

  const selected = revealedCard;

  return (
    <>
      <Header />
      <main className="pick-card-main" style={{ background: "linear-gradient(180deg, #fffcf5 0%, #f5ede0 100%)", minHeight: "calc(100vh - 80px)", paddingTop: "146px", paddingBottom: "80px" }}>
        <div className="container-main" style={{ textAlign: "center" }}>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(34px, 5vw, 52px)", lineHeight: 1.18, color: "#2d2540", margin: "0 0 18px", fontWeight: 500, overflow: "visible" }}>
            {pickContent.gameTitle}
          </h1>
          <div style={{ maxWidth: 720, margin: "0 auto 42px", padding: "0 18px" }}>
            <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: "16px", color: "#5a5566", margin: 0, lineHeight: 1.75, overflow: "visible" }}>
              {pickContent.gameIntro}
            </p>
          </div>

          {/* Slider */}
          <div style={{ position: "relative", maxWidth: 1100, margin: "0 auto" }}>
            <button
              aria-label={ui.scrollLeft}
              onClick={() => moveSlider(-1)}
              style={arrowStyle("left")}
              disabled={phase !== "idle"}
            >
              ‹
            </button>
            <div
              style={{
                overflow: "hidden",
                padding: "30px 60px",
              }}
              className="card-slider"
            >
              <div
                onTransitionEnd={handleSliderTransitionEnd}
                style={{
                  display: "flex",
                  gap: `${GAP}px`,
                  transform: `translateX(-${sliderIndex * cardStep}px)`,
                  transition: sliderTransition ? "transform 0.42s ease" : "none",
                  willChange: "transform",
                }}
              >
                {loopedCards.map((card, index) => {
                  const isSelected = index === selectedLoopIndex;
                  const hidden = selectedId !== null && !isSelected;
                  return (
                    <div
                      key={`${card.id}-${index}`}
                      onClick={() => pickCard(index)}
                      className="card-back"
                      style={{
                        flex: `0 0 ${CARD_W}px`,
                        height: `${CARD_H}px`,
                        borderRadius: "14px",
                        background: pickContent.cardBackGradient,
                        cursor: phase === "idle" ? "pointer" : "default",
                        position: "relative",
                        transition: "opacity 0.5s ease, transform 0.35s ease",
                        opacity: hidden ? 0 : isSelected && phase !== "idle" ? 0 : 1,
                        transform: isSelected && phase !== "idle" ? "scale(0.85)" : "scale(1)",
                        boxShadow: "0 8px 24px rgba(45, 37, 64, 0.18)",
                        pointerEvents: phase === "idle" ? "auto" : "none",
                        overflow: "hidden",
                      }}
                    >
                      <CardBackPattern />
                    </div>
                  );
                })}
              </div>
            </div>
            <button
              aria-label={ui.scrollRight}
              onClick={() => moveSlider(1)}
              style={arrowStyle("right")}
              disabled={phase !== "idle"}
            >
              ›
            </button>
            <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: "13px", color: "#8a8497", marginTop: "16px" }}>
              {dailyPick?.dateKey === todayKey()
                ? `Karta dne již byla vybrána. Její poselství zůstává otevřené do 23:59.`
                : pickContent.gameInstructions}
            </p>
          </div>
        </div>

        {/* Selected card overlay */}
        {selected && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: phase === "shown" ? "rgba(20, 14, 40, 0.78)" : "rgba(20, 14, 40, 0)",
              transition: "background 0.6s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              pointerEvents: phase === "shown" ? "auto" : "none",
            }}
            onClick={closeReveal}
          >
            {phase === "shown" && (
              <button
                type="button"
                aria-label={ui.closeCard}
                onClick={closeReveal}
                style={{
                  position: "absolute",
                  top: "22px",
                  right: "22px",
                  width: "38px",
                  height: "38px",
                  borderRadius: "50%",
                  border: "1px solid rgba(255,255,255,0.35)",
                  background: "rgba(255,255,255,0.12)",
                  color: "#fff",
                  fontSize: "22px",
                  lineHeight: 1,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 2,
                }}
              >
                ×
              </button>
            )}
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                perspective: "1400px",
                width: "min(340px, 88vw)",
                height: "min(490px, 80vh)",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  position: "relative",
                  transformStyle: "preserve-3d",
                  transition: "transform 0.9s cubic-bezier(0.7, 0, 0.3, 1), scale 0.7s ease",
                  transform: phase === "zoom" ? "scale(0.6) rotateY(0deg)" : phase === "flip" ? "scale(1) rotateY(90deg)" : phase === "shown" ? "scale(1) rotateY(180deg)" : "scale(0.3) rotateY(0deg)",
                }}
              >
                {/* Back */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "20px",
                    background: pickContent.cardBackGradient,
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                    boxShadow: "0 30px 80px rgba(0, 0, 0, 0.5)",
                    overflow: "hidden",
                  }}
                >
                  <CardBackPattern />
                </div>
                {/* Front */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "20px",
                    background: selected.gradient,
                    transform: "rotateY(180deg)",
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                    boxShadow: "0 30px 80px rgba(0, 0, 0, 0.5)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "40px 30px",
                    textAlign: "center",
                    color: "#fff",
                    overflow: "hidden",
                  }}
                >
                  <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 30%, rgba(255,255,255,0.18) 0%, transparent 60%)" }} />
                  {selected.image && (
                    <div style={{ position: "absolute", inset: 0 }}>
                      <OptimizedImage
                        src={selected.image}
                        mobileSrc={selected.mobileImage}
                        alt={selected.title}
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", opacity: 0.78 }}
                      />
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(20,14,40,0.18), rgba(20,14,40,0.70))" }} />
                      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 28%, rgba(255,255,255,0.16) 0%, transparent 54%)" }} />
                    </div>
                  )}
                  <div style={{ position: "relative", fontFamily: "'Cormorant Garamond', serif", fontSize: "70px", lineHeight: 1, opacity: 0.9, marginBottom: "18px" }}>
                    {selected.symbol}
                  </div>
                  <h2 style={{ position: "relative", fontFamily: "'Cormorant Garamond', serif", fontSize: "32px", fontWeight: 500, margin: "0 0 14px", letterSpacing: "0.5px" }}>
                    {selected.title}
                  </h2>
                  {alreadyPicked && (
                    <div style={{ position: "relative", fontFamily: "'Poppins', sans-serif", fontSize: "10px", textTransform: "uppercase", letterSpacing: "2.4px", border: "1px solid rgba(255,255,255,0.42)", borderRadius: 999, padding: "7px 12px", marginBottom: "16px", background: "rgba(255,255,255,0.12)", backdropFilter: "blur(6px)" }}>
                      Karta dne již byla vybrána
                    </div>
                  )}
                  <div style={{ position: "relative", fontFamily: "'Poppins', sans-serif", fontSize: "12px", textTransform: "uppercase", letterSpacing: "2px", opacity: 0.85, marginBottom: "22px" }}>
                    {selected.concepts}
                  </div>
                  <div style={{ position: "relative", width: "40px", height: "1px", background: "rgba(255,255,255,0.5)", marginBottom: "22px" }} />
                  <p style={{ position: "relative", fontFamily: "'Cormorant Garamond', serif", fontSize: "19px", lineHeight: 1.5, fontStyle: "italic", margin: 0 }}>
                    {selected.message}
                  </p>
                </div>
              </div>
            </div>

            {phase === "shown" && (
              <div
                style={{
                  position: "absolute",
                  bottom: alreadyPicked ? "30px" : "40px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  textAlign: "center",
                  color: "rgba(255,255,255,0.85)",
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: alreadyPicked ? "12px" : "13px",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  width: "min(92vw, 520px)",
                }}
              >
                {alreadyPicked
                  ? `Dnešní poselství už máte. Nová karta se otevře po 23:59, přibližně za ${resetText}.`
                  : pickContent.revealLabel}
              </div>
            )}
          </div>
        )}
      </main>

      <style>{`
        .card-slider::-webkit-scrollbar { display: none; }
        .card-back:hover { transform: translateY(-8px) !important; }
        @media (max-width: 640px) {
          .pick-card-main {
            padding-top: 108px !important;
          }
        }
      `}</style>
      <Footer />
    </>
  );
}

function arrowStyle(side: "left" | "right"): React.CSSProperties {
  return {
    position: "absolute",
    top: "50%",
    [side]: "8px",
    transform: "translateY(-50%)",
    zIndex: 10,
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    border: "none",
    background: "#fff",
    boxShadow: "0 4px 14px rgba(45, 37, 64, 0.15)",
    cursor: "pointer",
    fontSize: "26px",
    color: "#2d2540",
    fontFamily: "serif",
    lineHeight: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };
}

function CardBackPattern() {
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", inset: "12px", border: "1px solid rgba(255,255,255,0.35)", borderRadius: "10px" }} />
      <div style={{ position: "absolute", inset: "18px", border: "1px solid rgba(255,255,255,0.18)", borderRadius: "8px" }} />
      <div style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: "44px",
        color: "rgba(255,255,255,0.85)",
        textShadow: "0 2px 12px rgba(0,0,0,0.25)",
      }}>
        ✦
      </div>
      <div style={{
        position: "absolute",
        inset: 0,
        background: "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.15) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(0,0,0,0.15) 0%, transparent 50%)",
      }} />
    </div>
  );
}
