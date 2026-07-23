"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useContent } from "@/astera/context/ContentContext";
import { Testimonial } from "@/astera/lib/content-types";
import EditableText from "./admin/EditableText";

const MAX_TEXT = 350;
const SWIPE_THRESHOLD_PX = 42;
const AUTOPLAY_DELAY_MS = 9000;

export default function TestimonialsSlider() {
  const { content, admin, updateSection, currentLang } = useContent();
  const sec = content.testimonials;
  const items: Testimonial[] = sec?.items ?? [];
  const localizedSectionTitle =
    currentLang === "en" && sec?.sectionTitle === "Co o mně říkají"
      ? "What people say about me"
      : currentLang === "ua" && sec?.sectionTitle === "Co o mně říkají"
        ? "Що про мене кажуть"
        : sec?.sectionTitle;

  const [active, setActive] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState<"left" | "right">("right");
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const swipeStartRef = useRef<{ x: number; y: number } | null>(null);
  const isAdmin = admin.isAdmin;

  useEffect(() => {
    if (active < items.length || items.length === 0) return;
    const frame = requestAnimationFrame(() => setActive(items.length - 1));
    return () => cancelAnimationFrame(frame);
  }, [items.length, active]);

  const goTo = useCallback((index: number, dir: "left" | "right") => {
    if (animating || items.length === 0) return;
    setDirection(dir);
    setAnimating(true);
    setTimeout(() => { setActive(index); setAnimating(false); }, 320);
  }, [animating, items.length]);

  const next = useCallback(() => {
    if (items.length === 0) return;
    goTo((active + 1) % items.length, "right");
  }, [active, goTo, items.length]);

  const prev = useCallback(() => {
    if (items.length === 0) return;
    goTo((active - 1 + items.length) % items.length, "left");
  }, [active, goTo, items.length]);

  useEffect(() => {
    if (isAdmin || isPaused || items.length <= 1) return;
    timerRef.current = setTimeout(next, AUTOPLAY_DELAY_MS);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [active, next, isAdmin, isPaused, items.length]);

  function updateItems(newItems: Testimonial[]) {
    updateSection("testimonials", { ...sec, items: newItems });
  }

  function updateField(i: number, k: keyof Testimonial, v: string) {
    updateItems(items.map((t, idx) => idx === i ? { ...t, [k]: v } : t));
  }

  function addItem() {
    const newItems = [...items, { name: "Jméno Příjmení", emoji: "✨", text: "Text recenze..." }];
    updateItems(newItems);
    setActive(newItems.length - 1);
  }

  function removeItem(i: number) {
    if (items.length <= 1) return;
    const newItems = items.filter((_, idx) => idx !== i);
    updateItems(newItems);
    setActive(Math.min(active, newItems.length - 1));
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (isAdmin || items.length <= 1) return;
    swipeStartRef.current = { x: e.clientX, y: e.clientY };
  }

  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (isAdmin || items.length <= 1 || !swipeStartRef.current) return;
    const dx = e.clientX - swipeStartRef.current.x;
    const dy = e.clientY - swipeStartRef.current.y;
    swipeStartRef.current = null;

    if (Math.abs(dx) < SWIPE_THRESHOLD_PX || Math.abs(dx) < Math.abs(dy) * 1.2) return;
    if (dx < 0) next();
    else prev();
  }

  if (items.length === 0) {
    return isAdmin ? (
      <div style={{ textAlign: "center", padding: "40px 20px" }}>
        <button className="ts-add-btn" onClick={addItem}>+ Přidat první recenzi</button>
      </div>
    ) : null;
  }

  const t = items[active];
  const textLen = t.text.length;

  return (
    <div className="testimonials-slider">
      {isAdmin ? (
        <EditableText section="testimonials" field="sectionTitle" tag="h3" className="ts-heading" />
      ) : (
        <h3 className="ts-heading">{localizedSectionTitle}</h3>
      )}

      {/* Admin: tab selector */}
      {isAdmin && (
        <div className="ts-admin-tabs">
          {items.map((_, i) => (
            <button key={i} className={`ts-tab${i === active ? " ts-tab-active" : ""}`}
              onClick={() => goTo(i, i > active ? "right" : "left")}>{i + 1}</button>
          ))}
          <button className="ts-add-btn-sm" onClick={addItem} title="Přidat recenzi">+</button>
        </div>
      )}

      {/* Card */}
      <div
        className="ts-card-wrap"
        onMouseEnter={() => { if (!isAdmin) setIsPaused(true); }}
        onMouseLeave={() => {
          swipeStartRef.current = null;
          if (!isAdmin) setIsPaused(false);
        }}
        onFocus={() => { if (!isAdmin) setIsPaused(true); }}
        onBlur={() => { if (!isAdmin) setIsPaused(false); }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => { swipeStartRef.current = null; }}
      >
        <div className={`ts-card ts-${animating ? (direction === "right" ? "exit-left" : "exit-right") : "enter"}`}>

          {/* Emoji */}
          {isAdmin ? (
            <div className="ts-emoji-wrap">
              <input type="text" value={t.emoji} maxLength={4}
                onChange={e => updateField(active, "emoji", e.target.value)}
                className="ts-emoji-input" />
            </div>
          ) : (
            <div className="ts-emoji">{t.emoji}</div>
          )}

          {/* Text — admin: textarea s live counterem; visitor: plain text */}
          {isAdmin ? (
            <div className="ts-textarea-wrap">
              <textarea
                className="ts-textarea"
                value={t.text}
                maxLength={MAX_TEXT}
                rows={4}
                onChange={e => updateField(active, "text", e.target.value)}
              />
              <div className={`ts-char-counter${textLen >= MAX_TEXT ? " ts-char-over" : textLen > MAX_TEXT * 0.85 ? " ts-char-warn" : ""}`}>
                {textLen}/{MAX_TEXT}
              </div>
            </div>
          ) : (
            <blockquote className="ts-text">„{t.text}“</blockquote>
          )}

          {/* Name — admin: input; visitor: styled div */}
          {isAdmin ? (
            <input type="text" value={t.name} maxLength={60}
              onChange={e => updateField(active, "name", e.target.value)}
              className="ts-name-input" placeholder="Jméno Příjmení" />
          ) : (
            <div className="ts-name">— {t.name}</div>
          )}

          {isAdmin && items.length > 1 && (
            <button className="ts-delete-btn" onClick={() => removeItem(active)}>× smazat recenzi</button>
          )}
        </div>
      </div>

      {/* Dots */}
      <div className="ts-dots">
        {items.map((_, i) => (
          <button key={i} className={`ts-dot${i === active ? " ts-dot-active" : ""}`}
            onClick={() => goTo(i, i > active ? "right" : "left")} aria-label={`Recenze ${i + 1}`} />
        ))}
      </div>

      {items.length > 1 && (
        <div className="ts-arrows">
          <button className="ts-arrow" onClick={prev} aria-label="Předchozí">‹</button>
          <button className="ts-arrow" onClick={next} aria-label="Další">›</button>
        </div>
      )}

      <style>{`
        .testimonials-slider {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
        }
        .ts-heading {
          font-family: 'Playfair Display', serif;
          font-size: 22px;
          font-weight: 700;
          color: #2d1a42;
          margin: 0 0 22px;
          text-align: center;
          letter-spacing: 0.3px;
        }
        .ts-admin-tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 14px;
          justify-content: center;
        }
        .ts-tab {
          width: 28px; height: 28px; border-radius: 50%;
          border: 1.5px solid rgba(124,59,178,0.3);
          background: transparent; color: #7c3bb2;
          font-size: 12px; font-weight: 600; cursor: pointer;
          transition: background 0.15s; padding: 0;
        }
        .ts-tab-active { background: #7c3bb2; border-color: #7c3bb2; color: #fff; }
        .ts-add-btn-sm {
          width: 28px; height: 28px; border-radius: 50%;
          border: 1.5px dashed #7c3bb2; background: transparent;
          color: #7c3bb2; font-size: 18px; line-height: 1;
          cursor: pointer; padding: 0;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.15s;
        }
        .ts-add-btn-sm:hover { background: rgba(124,59,178,0.1); }
        .ts-add-btn {
          background: #7c3bb2; color: #fff; border: none;
          border-radius: 8px; padding: 10px 20px;
          font-family: 'Poppins', sans-serif; font-size: 13px; cursor: pointer;
        }
        .ts-card-wrap {
          width: 100%; min-height: 230px; position: relative;
          overflow: hidden; display: flex; align-items: center; justify-content: center;
          touch-action: pan-y;
        }
        .ts-card {
          background: #fff; border-radius: 16px; padding: 28px 24px 24px;
          box-shadow: 0 4px 24px rgba(124,59,178,0.10), 0 1px 4px rgba(0,0,0,0.06);
          border: 1px solid rgba(124,59,178,0.10);
          width: 100%; box-sizing: border-box; position: relative;
          transition: opacity 0.32s ease, transform 0.32s ease;
        }
        .ts-enter  { opacity: 1; transform: translateX(0); }
        .ts-exit-left  { opacity: 0; transform: translateX(-24px); }
        .ts-exit-right { opacity: 0; transform: translateX(24px); }
        .ts-emoji { font-size: 26px; margin-bottom: 12px; text-align: center; }
        .ts-emoji-wrap { display: flex; justify-content: center; margin-bottom: 12px; }
        .ts-emoji-input {
          font-size: 24px; width: 52px; text-align: center;
          border: 1px dashed rgba(124,59,178,0.4); border-radius: 6px;
          background: rgba(124,59,178,0.04); padding: 2px 4px; outline: none;
        }
        .ts-text {
          font-family: 'Poppins', sans-serif; font-size: 14px; line-height: 1.75;
          color: #3a2a50; margin: 0 0 14px; font-style: italic;
          text-align: center; display: block; quotes: none;
        }
        .ts-textarea-wrap { position: relative; margin-bottom: 6px; }
        .ts-textarea {
          width: 100%; box-sizing: border-box; resize: vertical;
          font-family: 'Poppins', sans-serif; font-size: 13.5px; line-height: 1.7;
          color: #3a2a50; font-style: italic; text-align: center;
          border: 1.5px solid rgba(124,59,178,0.25); border-radius: 8px;
          padding: 10px 12px; outline: none; background: rgba(124,59,178,0.03);
          transition: border-color 0.15s;
        }
        .ts-textarea:focus { border-color: #7c3bb2; }
        .ts-char-counter {
          font-family: 'Poppins', sans-serif; font-size: 10px;
          color: #9ca3af; text-align: right; margin-top: 3px;
        }
        .ts-char-warn { color: #f59e0b; }
        .ts-char-over { color: #f87171; font-weight: 600; }
        .ts-name {
          font-family: 'Poppins', sans-serif; font-size: 13px; font-weight: 600;
          color: #7c3bb2; text-align: center; letter-spacing: 0.4px; display: block;
        }
        .ts-name-input {
          display: block; width: 100%; box-sizing: border-box; text-align: center;
          font-family: 'Poppins', sans-serif; font-size: 13px; font-weight: 600;
          color: #7c3bb2; letter-spacing: 0.4px;
          border: none; border-bottom: 1.5px dashed rgba(124,59,178,0.35);
          background: transparent; outline: none; padding: 2px 0;
          margin-top: 8px;
        }
        .ts-name-input:focus { border-bottom-color: #7c3bb2; }
        .ts-delete-btn {
          display: block; margin: 14px auto 0;
          background: none; border: 1px solid #f87171; color: #f87171;
          border-radius: 6px; padding: 4px 12px;
          font-size: 11px; font-family: 'Poppins', sans-serif;
          cursor: pointer; transition: background 0.15s;
        }
        .ts-delete-btn:hover { background: #fef2f2; }
        .ts-dots { display: flex; gap: 8px; margin-top: 18px; }
        .ts-dot {
          width: 8px; height: 8px; border-radius: 50%; border: none;
          background: rgba(124,59,178,0.2); cursor: pointer; padding: 0;
          transition: background 0.2s, transform 0.2s;
        }
        .ts-dot-active { background: #7c3bb2; transform: scale(1.3); }
        .ts-arrows { display: flex; gap: 10px; margin-top: 14px; }
        .ts-arrow {
          width: 36px; height: 36px; border-radius: 50%;
          border: 1.5px solid rgba(124,59,178,0.3); background: transparent;
          color: #7c3bb2; font-size: 22px; line-height: 1; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.18s, border-color 0.18s; padding: 0;
        }
        .ts-arrow:hover { background: #7c3bb2; border-color: #7c3bb2; color: #fff; }
        @media (max-width: 768px) {
          .ts-heading { font-size: 20px; margin-bottom: 18px; }
          .ts-card { padding: 22px 18px 20px; }
          .ts-text { font-size: 13.5px; }
          .ts-card-wrap { min-height: 200px; }
          .ts-arrows { display: none; }
        }
      `}</style>
    </div>
  );
}
