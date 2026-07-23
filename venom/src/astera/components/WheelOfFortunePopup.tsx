"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useContent } from "@/astera/context/ContentContext";
import { UI_STRINGS } from "@/astera/lib/i18n";
import type { WheelSegment } from "@/astera/lib/content-types";
import { asteraWheelUrl } from "@/astera/lib/host";

// ── Confetti ────────────────────────────────────────────────────────────────

const CONFETTI_COLORS = ["#7c3bb2", "#c9a84c", "#f5e9c8", "#e74c3c", "#2ecc71", "#3498db", "#ff6b9d", "#fff"];
const CONFETTI_COUNT_DESKTOP = 180;
const CONFETTI_COUNT_MOBILE  = 80;

type Particle = {
  x: number; y: number;
  vx: number; vy: number;
  rot: number; rotV: number;
  color: string;
  w: number; h: number;
  shape: "rect" | "circle" | "strip";
  alpha: number;
};

function Confetti({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number | null>(null);
  const particles = useRef<Particle[]>([]);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const isMobileDevice = window.innerWidth <= 620;
    const W = window.innerWidth;
    const H = window.innerHeight;

    // CSS pixel canvas — žádné DPR scaling (jednodušší, bez bugů)
    canvas.width  = W;
    canvas.height = H;

    const ctx = canvas.getContext("2d")!;

    const count = isMobileDevice ? CONFETTI_COUNT_MOBILE : CONFETTI_COUNT_DESKTOP;

    const ox = W * 0.5;
    const oy = isMobileDevice ? H * 0.55 : H * 0.65;

    particles.current = Array.from({ length: count }, () => {
      const angle = (-130 + Math.random() * 80) * (Math.PI / 180);
      const speed = isMobileDevice ? 10 + Math.random() * 16 : 14 + Math.random() * 22;
      return {
        x:     ox + (Math.random() - 0.5) * 40,
        y:     oy,
        vx:    Math.cos(angle) * speed,
        vy:    Math.sin(angle) * speed,
        rot:   Math.random() * 360,
        rotV:  (Math.random() - 0.5) * 14,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        w:     7 + Math.random() * 9,
        h:     3 + Math.random() * 5,
        shape: (["rect", "rect", "circle", "strip"] as const)[Math.floor(Math.random() * 4)],
        alpha: 1,
      };
    });

    const startTime = performance.now();
    const TOTAL_MS  = 5000;

    const tick = (now: number) => {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / TOTAL_MS, 1);
      ctx.clearRect(0, 0, W, H);

      for (const p of particles.current) {
        p.x   += p.vx;
        p.y   += p.vy;
        p.vy  += 0.55;        // gravitace
        p.vx  *= 0.97;        // vzdušný odpor
        p.vy  *= 0.99;
        p.rot += p.rotV;
        p.rotV *= 0.98;
        p.alpha = progress > 0.65 ? 1 - (progress - 0.65) / 0.35 : 1;

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.color;
        if (p.shape === "circle") {
          ctx.beginPath();
          ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === "strip") {
          ctx.fillRect(-p.w / 2, -1, p.w * 1.8, 2);
        } else {
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        }
        ctx.restore();
      }

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [active]);

  if (!active) return null;
  return (
    <canvas
      ref={canvasRef}
      style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1200 }}
    />
  );
}

const purple = "#7c3bb2";
const gold   = "#c9a84c";
const goldLight = "#f5e9c8";
const cream  = "#fffcf5";
const creamDeep = "#f5ede0";

const WHEEL_SIZE_DESKTOP = 300;
const WHEEL_SIZE_MOBILE  = 220;

// ── Sparkle particles on entrance ──────────────────────────────────────────

const SPARKS = [
  { angle:   0, d: 120 }, { angle:  40, d: 100 }, { angle:  80, d: 130 },
  { angle: 130, d:  90 }, { angle: 170, d: 115 }, { angle: 210, d: 105 },
  { angle: 250, d: 125 }, { angle: 300, d:  95 }, { angle: 340, d: 110 },
];

function Sparks({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 5, overflow: "hidden", borderRadius: 22 }}>
      {SPARKS.map((s, i) => {
        const rad = (s.angle * Math.PI) / 180;
        const dx = Math.cos(rad) * s.d;
        const dy = Math.sin(rad) * s.d;
        const symbols = ["✦", "★", "✸", "◆", "✺"];
        return (
          <div key={i} style={{
            position: "absolute",
            top: "50%", left: "50%",
            fontSize: 14 + (i % 3) * 4,
            color: i % 2 === 0 ? gold : goldLight,
            animation: `sparkFly${i % 3} 0.85s ${i * 0.06}s cubic-bezier(0.2, 0.8, 0.4, 1) both`,
            "--dx": `${dx}px`, "--dy": `${dy}px`,
          } as React.CSSProperties}>
            {symbols[i % symbols.length]}
          </div>
        );
      })}
    </div>
  );
}

// ── Ornament divider ────────────────────────────────────────────────────────

function OrnamentDivider({ tight = false }: { tight?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: tight ? "10px 0" : "18px 0", color: gold }}>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, transparent, ${gold}77)` }} />
      <span style={{ fontSize: 11, letterSpacing: 7, opacity: 0.85 }}>✦ ✦ ✦</span>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(to left, transparent, ${gold}77)` }} />
    </div>
  );
}

// ── Canvas wheel drawing ────────────────────────────────────────────────────

function lightenColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, (num >> 16) + amount);
  const g = Math.min(255, ((num >> 8) & 0xff) + amount);
  const b = Math.min(255, (num & 0xff) + amount);
  return `rgb(${r},${g},${b})`;
}

function drawWheel(canvas: HTMLCanvasElement, segments: WheelSegment[], size = WHEEL_SIZE_DESKTOP) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width  = size * dpr;
  canvas.height = size * dpr;
  canvas.style.width  = `${size}px`;
  canvas.style.height = `${size}px`;

  const ctx = canvas.getContext("2d")!;
  ctx.scale(dpr, dpr);

  const cx = size / 2, cy = size / 2;
  const R = size / 2 - 6;
  const innerR = R - 10;

  const sliceAngleEqual = (2 * Math.PI) / segments.length;
  let startAngle = 0;

  for (const seg of segments) {
    const sliceAngle = sliceAngleEqual;
    const endAngle   = startAngle + sliceAngle;
    const midAngle   = startAngle + sliceAngle / 2;

    const segGrad = ctx.createRadialGradient(cx, cy, innerR * 0.3, cx, cy, innerR);
    segGrad.addColorStop(0, lightenColor(seg.color, 28));
    segGrad.addColorStop(1, seg.color);

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, innerR, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = segGrad;
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.42)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(startAngle);
    ctx.beginPath();
    ctx.moveTo(innerR, 0);
    ctx.lineTo(R - 2, 0);
    ctx.strokeStyle = `${gold}cc`;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    const fontSize = size < 260 ? 9 : 11;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(midAngle);
    ctx.textAlign = "right";
    ctx.fillStyle = "#fff";
    ctx.font = `bold ${fontSize}px Poppins, sans-serif`;
    ctx.shadowColor = "rgba(0,0,0,0.65)";
    ctx.shadowBlur = 5;
    ctx.fillText(seg.label, innerR - 8, 4);
    ctx.shadowBlur = 0;
    ctx.fillStyle = `${goldLight}bb`;
    ctx.font = "8px serif";
    ctx.textAlign = "left";
    ctx.fillText("◆", 22, 4);
    ctx.restore();

    startAngle = endAngle;
  }

  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, 2 * Math.PI);
  const ringGrad = ctx.createLinearGradient(cx - R, cy, cx + R, cy);
  ringGrad.addColorStop(0, goldLight);
  ringGrad.addColorStop(0.5, gold);
  ringGrad.addColorStop(1, goldLight);
  ctx.strokeStyle = ringGrad;
  ctx.lineWidth = 10;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, R - 5, 0, 2 * Math.PI);
  ctx.strokeStyle = "rgba(255,255,255,0.28)";
  ctx.lineWidth = 1;
  ctx.stroke();

  const glossGrad = ctx.createRadialGradient(cx - R * 0.28, cy - R * 0.28, 0, cx, cy, R);
  glossGrad.addColorStop(0, "rgba(255,255,255,0.22)");
  glossGrad.addColorStop(0.45, "rgba(255,255,255,0.06)");
  glossGrad.addColorStop(1, "rgba(255,255,255,0)");
  ctx.beginPath();
  ctx.arc(cx, cy, innerR, 0, 2 * Math.PI);
  ctx.fillStyle = glossGrad;
  ctx.fill();

  let a2 = 0;
  for (let i = 0; i < segments.length; i++) {
    const sx = cx + (R - 5) * Math.cos(a2);
    const sy = cy + (R - 5) * Math.sin(a2);
    ctx.beginPath();
    ctx.arc(sx, sy, 3.5, 0, 2 * Math.PI);
    ctx.fillStyle = "#fff";
    ctx.fill();
    a2 += sliceAngleEqual;
  }

  const cR = 26;
  const cGrad = ctx.createRadialGradient(cx - 8, cy - 8, 2, cx, cy, cR);
  cGrad.addColorStop(0, "#fffae8");
  cGrad.addColorStop(0.5, gold);
  cGrad.addColorStop(1, "#8a6020");
  ctx.beginPath();
  ctx.arc(cx, cy, cR, 0, 2 * Math.PI);
  ctx.fillStyle = cGrad;
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.8)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = "#3d1a00";
  ctx.font = "bold 18px serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("✦", cx, cy);
}

// ── Frequency check ─────────────────────────────────────────────────────────

function shouldSkipForFrequency(freq: string, isAdmin: boolean): boolean {
  if (isAdmin) return false;
  if (freq === "every_visit") return false;
  if (freq === "once_per_session") {
    return !!sessionStorage.getItem("wheel_shown");
  }
  // once_per_day (default)
  const lastShown = localStorage.getItem("wheel_shown_at");
  return !!lastShown && Date.now() - Number(lastShown) < 24 * 60 * 60 * 1000;
}

function markShown(freq: string) {
  if (freq === "once_per_session") {
    sessionStorage.setItem("wheel_shown", "1");
  } else if (freq === "once_per_day") {
    localStorage.setItem("wheel_shown_at", String(Date.now()));
  }
  // every_visit: no mark needed
}

// ── Main component ──────────────────────────────────────────────────────────

type Phase = "idle" | "spinning" | "win" | "loss" | "done";

export default function WheelOfFortunePopup() {
  const { content, admin } = useContent();
  const cfg = content.wheelOfFortune;
  // Read once, so the value the callbacks close over is the same expression
  // they list as a dependency — otherwise the compiler drops their memoization.
  const segments = cfg?.segments;
  const displayStyle = cfg?.displayStyle || "popup";
  const showFrequency = cfg?.showFrequency || "once_per_day";

  const [visible,    setVisible]    = useState(false);
  const [sparks,     setSparks]     = useState(false);
  const [confetti,   setConfetti]   = useState(false);
  const [phase,      setPhase]      = useState<Phase>("idle");
  const [email,      setEmail]      = useState("");
  const [sending,    setSending]    = useState(false);
  const [winner,     setWinner]     = useState<WheelSegment | null>(null);
  const [isMobile,   setIsMobile]   = useState(false);
  const wheelSize = isMobile ? WHEEL_SIZE_MOBILE : WHEEL_SIZE_DESKTOP;

  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const wheelWrapRef = useRef<HTMLDivElement>(null);
  const spinTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioCtxRef  = useRef<AudioContext | null>(null);
  const audioReadyRef = useRef(false);

  // iOS Safari: vytvoř a odemkni AudioContext při prvním dotyku (ještě před spinem)
  useEffect(() => {
    if (!visible) return;
    const unlock = () => {
      if (audioReadyRef.current) return;
      try {
        const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AC) return;
        const ctx = audioCtxRef.current ?? new AC();
        audioCtxRef.current = ctx;
        // Tiché přehrání odemkne kontext pro budoucí plánování
        const silentBuf = ctx.createBuffer(1, 1, 22050);
        const src = ctx.createBufferSource();
        src.buffer = silentBuf;
        src.connect(ctx.destination);
        src.start(0);
        ctx.resume().catch(() => {});
        audioReadyRef.current = true;
      } catch { /* ignore */ }
    };
    document.addEventListener("touchstart", unlock, { once: true, passive: true });
    document.addEventListener("mousedown",  unlock, { once: true });
    return () => {
      document.removeEventListener("touchstart", unlock);
      document.removeEventListener("mousedown",  unlock);
    };
  }, [visible]);

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 620);
    check();
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, []);

  // Draw on mount / segment / size change
  useEffect(() => {
    if (!visible || !canvasRef.current || !cfg?.segments?.length) return;
    drawWheel(canvasRef.current, cfg.segments, wheelSize);
  }, [visible, cfg?.segments, wheelSize]);

  // ── Trigger logic based on displayStyle ──
  useEffect(() => {
    if (!cfg?.enabled) return;

    if (displayStyle === "side_tab") {
      // Tab is always visible — frequency doesn't apply (user opens manually)
      setVisible(true);
      return;
    }

    if (shouldSkipForFrequency(showFrequency, admin.isAdmin)) return;

    if (displayStyle === "embedded") {
      setVisible(true);
      markShown(showFrequency);
      return;
    }

    // popup: scroll trigger
    const check = () => {
      if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 220) {
        setTimeout(() => {
          setVisible(true);
          setSparks(true);
          setTimeout(() => setSparks(false), 1200);
          markShown(showFrequency);
        }, 700);
        window.removeEventListener("scroll", check);
      }
    };
    window.addEventListener("scroll", check, { passive: true });
    return () => window.removeEventListener("scroll", check);
  }, [cfg?.enabled, displayStyle, showFrequency, admin.isAdmin]);

  // Lock scroll only for popup
  useEffect(() => {
    if (displayStyle !== "popup") return;
    if (visible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [visible, displayStyle]);

  // Vrátí AudioContext připravený k použití (obnoví i po Safari suspend)
  const getAudioCtx = useCallback((): Promise<AudioContext | null> => {
    return new Promise(resolve => {
      try {
        const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AC) return resolve(null);
        let ctx = audioCtxRef.current;
        if (!ctx || ctx.state === "closed") {
          ctx = new AC();
          audioCtxRef.current = ctx;
        }
        if (ctx.state === "suspended") {
          ctx.resume().then(() => resolve(ctx!)).catch(() => resolve(null));
        } else {
          resolve(ctx);
        }
      } catch { resolve(null); }
    });
  }, []);

  // Naplánuje spin ticky + thud + výherní nebo proherní zvuk — vše z user gesture
  const playAllSounds = useCallback((isLoss: boolean) => {
    getAudioCtx().then(ctx => {
      if (!ctx) return;
      const sr = ctx.sampleRate;
      const now = ctx.currentTime;
      const SPIN = 5.2;

      // ── Ticky ────────────────────────────────────────────────────────────
      let t = 0;
      while (t < SPIN) {
        const progress = t / SPIN;
        const interval = 0.055 + Math.pow(progress, 1.8) * 0.595;
        const buf = ctx.createBuffer(1, sr * 0.04, sr);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) {
          d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (sr * 0.008));
        }
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const bpf = ctx.createBiquadFilter();
        bpf.type = "bandpass";
        bpf.frequency.value = 1800 + Math.random() * 400;
        bpf.Q.value = 3;
        const gain = ctx.createGain();
        gain.gain.value = 0.18 + progress * 0.14;
        src.connect(bpf); bpf.connect(gain); gain.connect(ctx.destination);
        src.start(now + t);
        src.stop(now + t + 0.04);
        t += interval;
      }

      // ── Thud (zastavení) ──────────────────────────────────────────────────
      const thudAt = now + SPIN + 0.05;
      const thudBuf = ctx.createBuffer(1, sr * 0.12, sr);
      const thudD = thudBuf.getChannelData(0);
      for (let i = 0; i < thudD.length; i++) {
        thudD[i] = (Math.random() * 2 - 1) * Math.exp(-i / (sr * 0.03));
      }
      const thudSrc = ctx.createBufferSource();
      thudSrc.buffer = thudBuf;
      const thudG = ctx.createGain();
      thudG.gain.value = 0.38;
      thudSrc.connect(thudG); thudG.connect(ctx.destination);
      thudSrc.start(thudAt);

      // ── Výsledkový zvuk (reálné MP3 publika) ─────────────────────────────
      const resultAt = now + SPIN + 0.35;

      // Reálný zvuk publika — fetch + decode, spustí se 5.4s po kliknutí
      const RESULT_DELAY_MS = (SPIN + 0.35) * 1000;
      const file = isLoss ? "/sounds/crowd-loss.mp3" : "/sounds/crowd-cheer.mp3";
      fetch(file)
        .then(r => r.arrayBuffer())
        .then(ab => ctx.decodeAudioData(ab))
        .then(audioBuf => {
          // Počkáme na správný moment (fetch trvá < 100ms z localhostu)
          const remaining = resultAt - ctx.currentTime;
          const startIn   = Math.max(0, remaining);
          const src = ctx.createBufferSource();
          src.buffer = audioBuf;
          const g = ctx.createGain();
          g.gain.value = 0.9;
          src.connect(g); g.connect(ctx.destination);
          src.start(ctx.currentTime + startIn);
        })
        .catch(() => {});
      void RESULT_DELAY_MS;
    });
  }, [getAudioCtx]);

  const resetAndClose = useCallback(() => {
    if (spinTimerRef.current) clearTimeout(spinTimerRef.current);
    setConfetti(false);
    // For side_tab: collapse back to tab (don't hide entirely)
    if (displayStyle === "side_tab") {
      setPhase("idle");
      setEmail("");
      setWinner(null);
      setSending(false);
      if (wheelWrapRef.current) {
        wheelWrapRef.current.style.transition = "none";
        wheelWrapRef.current.style.transform  = "rotate(0deg)";
      }
    } else {
      setVisible(false);
      setPhase("idle");
      setEmail("");
      setWinner(null);
      setSending(false);
      if (wheelWrapRef.current) {
        wheelWrapRef.current.style.transition = "none";
        wheelWrapRef.current.style.transform  = "rotate(0deg)";
      }
    }
  }, [displayStyle]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") resetAndClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [resetAndClose]);

  const selectWinner = useCallback((): WheelSegment => {
    const segs = segments!;
    const totalW = segs.reduce((s, seg) => s + Number(seg.weight), 0);
    let r = Math.random() * totalW;
    for (const seg of segs) {
      r -= Number(seg.weight);
      if (r <= 0) return seg;
    }
    return segs[segs.length - 1];
  }, [segments]);

  const doSpin = useCallback(() => {
    const won = selectWinner();
    setWinner(won);
    setPhase("spinning");

    const segs   = segments!;
    // Vizuální díly jsou vždy stejně velké — segDeg = 360/N
    const segDeg = 360 / segs.length;
    const wonIdx = segs.findIndex(s => s.id === won.id);

    if (wonIdx !== -1) {
      const cumDeg = wonIdx * segDeg;
      const midDeg = cumDeg + segDeg / 2;
      const R_base = ((270 - midDeg) % 360 + 360) % 360;
      const jitter = (Math.random() - 0.5) * segDeg * 0.35;
      const target = R_base + 5 * 360 + jitter;

      if (wheelWrapRef.current) {
        wheelWrapRef.current.style.transition = "none";
        wheelWrapRef.current.style.transform  = "rotate(0deg)";
        void wheelWrapRef.current.offsetHeight;
        wheelWrapRef.current.style.transition = "transform 5.2s cubic-bezier(0.12, 0, 0.22, 1)";
        wheelWrapRef.current.style.transform  = `rotate(${target}deg)`;
      }
      playAllSounds(won.isLoss);

      spinTimerRef.current = setTimeout(() => {
        if (!won.isLoss) {
          setPhase("win");
          setConfetti(true);
          setTimeout(() => setConfetti(false), 5000);
        } else {
          setPhase("loss");
        }
      }, 5400);
    }
  }, [selectWinner, segments, playAllSounds]);

  const handleSpin = useCallback(() => {
    if (phase !== "idle") return;
    doSpin();
  }, [phase, doSpin]);

  const handleEmailSubmit = useCallback(async () => {
    if (!email.includes("@") || !email.includes(".") || !winner) return;
    setSending(true);
    try {
      await fetch(asteraWheelUrl(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          segmentLabel: winner.label,
          coupon: winner.coupon,
          isWin: true,
        }),
      });
    } catch { /* silent */ }
    setSending(false);
    setPhase("done");
  }, [email, winner]);

  if (!cfg?.enabled || !visible) return null;

  const isEmailValid = email.includes("@") && email.includes(".");

  const sharedProps = {
    cfg, phase, email, setEmail, sending, winner, isMobile, wheelSize,
    canvasRef, wheelWrapRef, isEmailValid,
    handleSpin, handleEmailSubmit, resetAndClose, doSpin, setWinner,
  };

  // ── Side Tab render ──────────────────────────────────────────────────────
  if (displayStyle === "side_tab") {
    return <>
      <Confetti active={confetti} />
      <SideTabWheel {...sharedProps} sparks={sparks} />
    </>;
  }

  // ── Embedded render ──────────────────────────────────────────────────────
  if (displayStyle === "embedded") {
    return <>
      <Confetti active={confetti} />
      <EmbeddedWheel {...sharedProps} />
    </>;
  }

  // ── Popup render (default) ───────────────────────────────────────────────
  return (
    <>
      <Confetti active={confetti} />
      <div
        onClick={e => { if (e.target === e.currentTarget) resetAndClose(); }}
        style={{
          position: "fixed", inset: 0, zIndex: 1100,
          background: "rgba(14, 4, 30, 0.82)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "16px",
          overflowY: "auto",
          animation: "wfBackdropIn 0.45s ease both",
        }}
      >
        <WheelCard {...sharedProps} sparks={sparks} showClose />
        <WheelStyles />
      </div>
    </>
  );
}

// ── Shared props type ────────────────────────────────────────────────────────

type SharedProps = {
  cfg: ReturnType<typeof useContent>["content"]["wheelOfFortune"];
  phase: Phase;
  email: string;
  setEmail: (v: string) => void;
  sending: boolean;
  winner: WheelSegment | null;
  isMobile: boolean;
  wheelSize: number;
  sparks?: boolean;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  wheelWrapRef: React.RefObject<HTMLDivElement | null>;
  isEmailValid: boolean;
  handleSpin: () => void;
  handleEmailSubmit: () => void;
  resetAndClose: () => void;
  doSpin: () => void;
  setWinner: (w: WheelSegment | null) => void;
  showClose?: boolean;
  // When true: parent handles scroll/height — card uses full width, no maxHeight
  contained?: boolean;
};

// ── WheelCard — shared modal body ────────────────────────────────────────────

function WheelCard({ cfg, phase, email, setEmail, sending, winner, isMobile: _isMobile, wheelSize, sparks = false, canvasRef, wheelWrapRef, isEmailValid, handleSpin, handleEmailSubmit, resetAndClose, doSpin, setWinner, showClose = false, contained = false }: SharedProps) {
  const { currentLang } = useContent();
  const ui = UI_STRINGS[currentLang];
  return (
    <div
      style={{
        width: contained ? "100%" : "min(100%, 820px)",
        maxHeight: contained ? undefined : "calc(100dvh - 28px)",
        overflowX: "hidden",
        overflowY: contained ? undefined : "auto",
        background: `linear-gradient(160deg, ${cream} 0%, #fdf5e8 60%, ${creamDeep} 100%)`,
        borderRadius: contained ? 0 : 22,
        border: contained ? "none" : `1px solid ${gold}88`,
        boxShadow: contained ? "none" : `0 50px 120px rgba(14,4,30,0.7), 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.9)`,
        position: "relative",
        animation: contained ? undefined : "wfModalIn 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) both",
      }}
      role="dialog"
      aria-modal="true"
      aria-label={cfg.title}
    >
      <Sparks active={sparks} />

      {(["tl","tr","bl","br"] as const).map(c => (
        <div key={c} aria-hidden style={{
          position: "absolute",
          top: c[0]==="t" ? 10 : undefined, bottom: c[0]==="b" ? 10 : undefined,
          left: c[1]==="l" ? 10 : undefined, right: c[1]==="r" ? 10 : undefined,
          width: 22, height: 22, pointerEvents: "none",
          borderTop:    c[0]==="t" ? `1px solid ${gold}66` : undefined,
          borderBottom: c[0]==="b" ? `1px solid ${gold}66` : undefined,
          borderLeft:   c[1]==="l" ? `1px solid ${gold}66` : undefined,
          borderRight:  c[1]==="r" ? `1px solid ${gold}66` : undefined,
          borderRadius: c==="tl"?"5px 0 0 0":c==="tr"?"0 5px 0 0":c==="bl"?"0 0 0 5px":"0 0 5px 0",
        }} />
      ))}

      {showClose && (
        <button
          onClick={resetAndClose} aria-label={ui.close}
          style={{
            position: "absolute", top: 13, right: 13, zIndex: 20,
            width: 30, height: 30, borderRadius: "50%",
            background: `${goldLight}cc`, border: `1px solid ${gold}55`,
            color: "#5a3a00", fontSize: 13, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Poppins', sans-serif",
          }}
        >✕</button>
      )}

      <div className="wf-header" style={{
        padding: "22px 44px 16px", textAlign: "center",
        borderBottom: `1px solid ${gold}44`,
        background: `radial-gradient(ellipse at 50% 0%, ${goldLight}66 0%, transparent 70%)`,
        position: "relative",
      }}>
        <div aria-hidden style={{
          position: "absolute", top: 4, left: "50%", transform: "translateX(-50%)",
          fontSize: 80, lineHeight: 1, color: gold, opacity: 0.05,
          fontFamily: "serif", pointerEvents: "none", userSelect: "none",
        }}>🎡</div>
        <h2 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "clamp(17px, 2.4vw, 23px)", fontWeight: 700,
          color: "#2a1a00", margin: "0 0 5px", lineHeight: 1.25, position: "relative",
        }}>{cfg.title}</h2>
        <p style={{
          fontSize: 13, color: "#4a3728", margin: 0,
          fontFamily: "'Poppins', sans-serif", lineHeight: 1.5, position: "relative",
        }}>{cfg.subtitle}</p>
      </div>

      <div className="wf-grid" style={{
        display: "grid", gridTemplateColumns: "auto 1fr",
        alignItems: "center", minHeight: 340,
      }}>
        <WheelColumn phase={phase} wheelSize={wheelSize} canvasRef={canvasRef} wheelWrapRef={wheelWrapRef} />
        <RightColumn
          cfg={cfg} phase={phase} email={email} setEmail={setEmail}
          sending={sending} winner={winner} isEmailValid={isEmailValid}
          handleSpin={handleSpin} handleEmailSubmit={handleEmailSubmit}
          resetAndClose={resetAndClose} doSpin={doSpin} setWinner={setWinner}
        />
      </div>
    </div>
  );
}

// ── Wheel column ─────────────────────────────────────────────────────────────

function WheelColumn({ phase, wheelSize, canvasRef, wheelWrapRef }: {
  phase: Phase;
  wheelSize: number;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  wheelWrapRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className="wf-wheel-col" style={{
      padding: "28px 22px 28px 30px",
      borderRight: `1px solid ${gold}33`,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{ position: "relative", display: "inline-block" }}>
        <div aria-hidden style={{
          position: "absolute", inset: -20, borderRadius: "50%",
          background: `radial-gradient(circle, ${gold}30 0%, transparent 68%)`,
          pointerEvents: "none",
          animation: phase === "idle"
            ? "wfIdleGlow 2.4s ease-in-out infinite alternate"
            : phase === "spinning"
            ? "wfSpinGlow 0.8s ease-in-out infinite alternate"
            : "none",
        }} />
        <div aria-hidden style={{
          position: "absolute", top: -14, left: "50%",
          transform: "translateX(-50%)", zIndex: 10,
          filter: `drop-shadow(0 3px 7px rgba(0,0,0,0.5))`,
          animation: phase === "idle" ? "wfPointerBounce 1.8s ease-in-out infinite" : "none",
        }}>
          <svg width="26" height="22" viewBox="0 0 26 22" fill="none">
            <polygon points="0,0 26,0 13,22" fill={gold} />
            <polygon points="3,1 23,1 13,17" fill={goldLight} opacity="0.55" />
          </svg>
        </div>
        <div aria-hidden style={{
          position: "absolute", inset: -4, borderRadius: "50%",
          border: `4px solid ${gold}55`,
          boxShadow: `0 0 0 2px ${goldLight}44, 0 0 24px ${gold}44`,
          pointerEvents: "none",
        }} />
        <div style={{
          borderRadius: "50%",
          animation: phase === "idle" ? "wfIdleWobble 4s ease-in-out infinite" : "none",
        }}>
          <div ref={wheelWrapRef} style={{
            borderRadius: "50%",
            boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 0 3px ${gold}66`,
            willChange: "transform",
          }}>
            <canvas ref={canvasRef} style={{ display: "block", borderRadius: "50%", width: wheelSize, height: wheelSize }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Right column (phases) ────────────────────────────────────────────────────

function RightColumn({ cfg, phase, email, setEmail, sending, winner, isEmailValid, handleSpin, handleEmailSubmit, resetAndClose, doSpin, setWinner }: {
  cfg: ReturnType<typeof useContent>["content"]["wheelOfFortune"];
  phase: Phase;
  email: string;
  setEmail: (v: string) => void;
  sending: boolean;
  winner: WheelSegment | null;
  isEmailValid: boolean;
  handleSpin: () => void;
  handleEmailSubmit: () => void;
  resetAndClose: () => void;
  doSpin: () => void;
  setWinner: (w: WheelSegment | null) => void;
}) {
  const { currentLang } = useContent();
  const ui = UI_STRINGS[currentLang];
  return (
    <div className="wf-right-col" style={{ padding: "28px 30px 28px 22px" }}>

      {phase === "idle" && (
        <div style={{ animation: "wfSlideIn 0.5s 0.2s cubic-bezier(0.34,1.56,0.64,1) both" }}>
          <OrnamentDivider tight />
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: "#2a1a00", margin: "0 0 8px" }}>
            {ui.wheelTryLuck}
          </p>
          <p style={{ fontSize: 12, color: "#4a3728", margin: "0 0 20px", lineHeight: 1.7, fontFamily: "'Poppins', sans-serif" }}>
            {ui.wheelSpinDesc}
          </p>
          <button
            onClick={handleSpin}
            style={{
              width: "100%", padding: "14px 16px",
              background: `linear-gradient(135deg, ${purple} 0%, #5f2a8d 100%)`,
              color: "#fff", border: "none", borderRadius: 999,
              fontSize: 15, fontWeight: 800, fontFamily: "'Poppins', sans-serif",
              cursor: "pointer", boxShadow: `0 6px 24px ${purple}55`,
              letterSpacing: 0.4,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              animation: "wfBtnPulse 2.2s ease-in-out infinite",
            }}
          >{cfg.spinButtonText}</button>
          <div style={{ marginTop: 18, padding: "11px 14px", background: `linear-gradient(135deg, ${cream}, ${goldLight}55)`, borderRadius: 12, border: `1px solid ${gold}44` }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: "#5a3a00", margin: "0 0 7px", fontFamily: "'Poppins', sans-serif", textTransform: "uppercase", letterSpacing: "0.07em" }}>
              {ui.wheelWhatToWin}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {cfg.segments.filter(s => !s.isLoss).map(s => (
                <span key={s.id} style={{ fontSize: 10, padding: "3px 9px", borderRadius: 999, background: s.color + "22", border: `1px solid ${s.color}55`, color: "#3d2000", fontFamily: "'Poppins', sans-serif" }}>
                  {s.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {phase === "spinning" && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 120 }}>
          <div style={{ display: "flex", gap: 10 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ width: 12, height: 12, borderRadius: "50%", background: gold, animation: `wfDotPulse 1.2s ${i * 0.22}s ease-in-out infinite` }} />
            ))}
          </div>
        </div>
      )}

      {phase === "win" && winner && (
        <div style={{ animation: "wfWinIn 0.6s cubic-bezier(0.34,1.56,0.64,1) both" }}>
          <OrnamentDivider tight />
          <div style={{ textAlign: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 42, animation: "wfBounce 0.7s cubic-bezier(0.34,1.56,0.64,1)" }}>🎉</div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "#2a1a00", margin: "4px 0 6px" }}>{cfg.winTitle}</h3>
            <div style={{ display: "inline-block", background: `linear-gradient(135deg, ${goldLight} 0%, ${cream} 100%)`, border: `2px solid ${gold}`, borderRadius: 14, padding: "10px 20px", margin: "0 0 4px", boxShadow: `0 4px 20px ${gold}33` }}>
              <p style={{ fontSize: 11, color: "#6b5a3a", margin: "0 0 3px", fontFamily: "'Poppins',sans-serif", textTransform: "uppercase", letterSpacing: "0.07em" }}>{ui.wheelYourPrize}</p>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "#3d2000", margin: 0 }}>{winner.label}</p>
            </div>
          </div>
          <p style={{ fontSize: 12, color: "#4a3728", margin: "0 0 10px", lineHeight: 1.6, fontFamily: "'Poppins', sans-serif" }}>
            {ui.wheelEnterEmail}
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleEmailSubmit(); }}
              placeholder={cfg.emailPlaceholder} autoFocus autoComplete="email"
              style={{ flex: 1, minWidth: 0, padding: "11px 14px", borderRadius: 10, border: `1.5px solid ${isEmailValid ? gold : gold + "55"}`, background: cream, fontSize: 13, fontFamily: "'Poppins', sans-serif", outline: "none", color: "#2a1a00", transition: "border-color 0.2s" }}
            />
            <button
              onClick={handleEmailSubmit} disabled={!isEmailValid || sending}
              style={{ padding: "11px 18px", borderRadius: 10, background: isEmailValid && !sending ? `linear-gradient(135deg, ${purple}, #5f2a8d)` : "#d1d5db", color: "#fff", border: "none", fontSize: 13, fontWeight: 700, fontFamily: "'Poppins', sans-serif", cursor: isEmailValid && !sending ? "pointer" : "not-allowed", boxShadow: isEmailValid ? `0 4px 14px ${purple}44` : "none", whiteSpace: "nowrap" }}
            >{sending ? ui.wheelSending : ui.wheelSendPrize}</button>
          </div>
          <p style={{ fontSize: 10, color: "#9b8570", margin: "8px 0 0", fontFamily: "'Poppins', sans-serif" }}>
            🔒 {cfg.privacyText}
          </p>
        </div>
      )}

      {phase === "done" && winner && (
        <div style={{ textAlign: "center", animation: "wfWinIn 0.5s ease both" }}>
          <OrnamentDivider tight />
          <div style={{ fontSize: 46, margin: "6px 0 10px", animation: "wfBounce 0.6s ease" }}>✅</div>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 19, fontWeight: 700, color: "#2a1a00", margin: "0 0 8px" }}>{ui.wheelPrizeSent}</h3>
          <p style={{ fontSize: 12, color: "#4a3728", lineHeight: 1.65, fontFamily: "'Poppins', sans-serif", margin: "0 0 6px" }}>{cfg.winText}</p>
          {winner.coupon && (
            <div style={{ display: "inline-block", marginBottom: 16, background: `linear-gradient(135deg, ${purple}, #5f2a8d)`, color: "#fff", borderRadius: 10, padding: "8px 18px", fontFamily: "'Poppins', sans-serif", fontSize: 16, fontWeight: 800, letterSpacing: "0.14em", boxShadow: `0 4px 16px ${purple}44` }}>
              {winner.coupon}
            </div>
          )}
          <br />
          <button onClick={resetAndClose} style={{ padding: "11px 30px", background: `linear-gradient(135deg, ${purple}, #5f2a8d)`, color: "#fff", border: "none", borderRadius: 999, fontSize: 13, fontWeight: 600, fontFamily: "'Poppins', sans-serif", cursor: "pointer", boxShadow: `0 4px 14px ${purple}44` }}>
            {ui.close}
          </button>
        </div>
      )}

      {phase === "loss" && (
        <div style={{ textAlign: "center", animation: "wfSlideIn 0.4s ease both" }}>
          <OrnamentDivider tight />
          <div style={{ fontSize: 13, letterSpacing: 6, color: gold, margin: "8px 0 10px", animation: "wfIdleGlow 2s ease-in-out infinite alternate" }}>✦ ✦ ✦</div>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 19, fontWeight: 700, color: "#2a1a00", margin: "0 0 8px", lineHeight: 1.3 }}>{cfg.lossTitle}</h3>
          <p style={{ fontSize: 12, color: "#4a3728", lineHeight: 1.75, fontFamily: "'Poppins', sans-serif", margin: "0 0 6px" }}>{cfg.lossText}</p>
          <p style={{ fontSize: 11, color: `${gold}cc`, fontFamily: "'Playfair Display', serif", fontStyle: "italic", margin: "0 0 20px" }}>
            {ui.wheelAnotherChance}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button onClick={() => { setWinner(null); doSpin(); }} style={{ padding: "13px 30px", background: `linear-gradient(135deg, ${purple}, #5f2a8d)`, color: "#fff", border: "none", borderRadius: 999, fontSize: 14, fontWeight: 700, fontFamily: "'Poppins', sans-serif", cursor: "pointer", boxShadow: `0 4px 18px ${purple}44`, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, animation: "wfBtnPulse 2.2s ease-in-out infinite" }}>
              {ui.wheelSpinAgain}
            </button>
            <button onClick={resetAndClose} style={{ padding: "10px 30px", background: "transparent", color: "#9b8570", border: `1px solid ${gold}55`, borderRadius: 999, fontSize: 12, fontFamily: "'Poppins', sans-serif", cursor: "pointer" }}>
              {ui.close}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Side Tab variant ─────────────────────────────────────────────────────────

function SideTabWheel(props: SharedProps) {
  const { currentLang } = useContent();
  const ui = UI_STRINGS[currentLang];
  const [expanded, setExpanded] = useState(false);
  const [isNarrow, setIsNarrow] = useState(false);

  useEffect(() => {
    const check = () => setIsNarrow(window.innerWidth <= 620);
    check();
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, []);

  // Lock body scroll while panel is open
  useEffect(() => {
    if (expanded) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [expanded]);

  const open = () => {
    setExpanded(true);
    setTimeout(() => {
      if (props.canvasRef.current && props.cfg?.segments?.length) {
        drawWheel(props.canvasRef.current, props.cfg.segments, props.wheelSize);
      }
    }, 50);
  };

  const close = () => {
    setExpanded(false);
    props.resetAndClose();
  };

  return (
    <>
      <WheelStyles />

      {/* Sticky tab button — always visible when not expanded */}
      {!expanded && (
        <button
          onClick={open}
          aria-label={ui.openWheel}
          style={{
            position: "fixed", right: 0, top: "50%",
            transform: "translateY(-50%)",
            zIndex: 1050,
            background: `linear-gradient(180deg, ${purple} 0%, #5f2a8d 100%)`,
            color: "#fff",
            border: "none",
            borderRadius: "10px 0 0 10px",
            // 44px min touch target — padding 16px 12px = ~44px wide
            padding: "16px 12px",
            cursor: "pointer",
            boxShadow: `-4px 0 20px ${purple}55`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            writingMode: "vertical-rl",
            textOrientation: "mixed",
            fontFamily: "'Poppins', sans-serif",
            fontSize: isNarrow ? 11 : 12,
            fontWeight: 800,
            letterSpacing: "0.05em",
            animation: "wfTabPulse 3s ease-in-out infinite",
            minHeight: 44,
            minWidth: 44,
          }}
        >
          <span style={{ fontSize: isNarrow ? 16 : 18, writingMode: "horizontal-tb" }}>🎡</span>
          <span>{ui.wheelTabLabel}</span>
        </button>
      )}

      {/* Expanded panel */}
      {expanded && (
        <div
          onClick={e => { if (e.target === e.currentTarget) close(); }}
          style={{
            position: "fixed", inset: 0, zIndex: 1100,
            background: "rgba(14, 4, 30, 0.82)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            // On mobile: center / full-screen; on desktop: slide from right
            display: "flex",
            alignItems: isNarrow ? "flex-start" : "center",
            justifyContent: isNarrow ? "center" : "flex-end",
            animation: "wfBackdropIn 0.35s ease both",
          }}
        >
          <div style={{
            width: isNarrow ? "100%" : "min(100%, 820px)",
            height: isNarrow ? "100dvh" : "100dvh",
            overflowY: "auto",
            overflowX: "hidden",
            background: `linear-gradient(160deg, ${cream} 0%, #fdf5e8 60%, ${creamDeep} 100%)`,
            borderLeft: isNarrow ? "none" : `1px solid ${gold}88`,
            boxShadow: isNarrow ? "none" : `-30px 0 80px rgba(14,4,30,0.6)`,
            animation: isNarrow ? "wfModalIn 0.4s cubic-bezier(0.34, 1.2, 0.64, 1) both" : "wfSlideFromRight 0.4s cubic-bezier(0.34, 1.2, 0.64, 1) both",
          }}>
            <WheelCard {...props} sparks={props.sparks ?? false} showClose contained resetAndClose={close} />
          </div>
        </div>
      )}
    </>
  );
}

// ── Embedded variant ─────────────────────────────────────────────────────────

function EmbeddedWheel(props: SharedProps) {
  useEffect(() => {
    if (props.canvasRef.current && props.cfg?.segments?.length) {
      drawWheel(props.canvasRef.current, props.cfg.segments, props.wheelSize);
    }
  }, [props.cfg?.segments, props.wheelSize]);

  return (
    <section style={{
      background: `linear-gradient(160deg, ${cream} 0%, #fdf5e8 60%, ${creamDeep} 100%)`,
      borderTop: `1px solid ${gold}44`,
      borderBottom: `1px solid ${gold}44`,
      padding: "48px 24px",
    }}>
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        <WheelCard {...props} sparks={false} showClose={false} contained />
      </div>
      <WheelStyles />
    </section>
  );
}

// ── Shared CSS ───────────────────────────────────────────────────────────────

function WheelStyles() {
  return (
    <style>{`
      @keyframes wfBackdropIn {
        from { opacity: 0; }
        to   { opacity: 1; }
      }
      @keyframes wfModalIn {
        from { opacity: 0; transform: translateY(40px) scale(0.88); }
        to   { opacity: 1; transform: translateY(0)   scale(1); }
      }
      @keyframes wfSlideFromRight {
        from { opacity: 0; transform: translateX(60px); }
        to   { opacity: 1; transform: translateX(0); }
      }
      @keyframes wfSlideIn {
        from { opacity: 0; transform: translateX(18px); }
        to   { opacity: 1; transform: translateX(0); }
      }
      @keyframes wfWinIn {
        from { opacity: 0; transform: scale(0.85) translateY(10px); }
        to   { opacity: 1; transform: scale(1)    translateY(0); }
      }
      @keyframes wfBounce {
        0%   { transform: scale(0.4); opacity: 0; }
        60%  { transform: scale(1.25); }
        100% { transform: scale(1);   opacity: 1; }
      }
      @keyframes wfIdleGlow {
        from { opacity: 0.4; transform: scale(1); }
        to   { opacity: 0.9; transform: scale(1.12); }
      }
      @keyframes wfSpinGlow {
        from { opacity: 0.6; transform: scale(1.05); }
        to   { opacity: 1;   transform: scale(1.22); }
      }
      @keyframes wfIdleWobble {
        0%,100% { transform: rotate(-1.5deg); }
        50%     { transform: rotate(1.5deg); }
      }
      @keyframes wfPointerBounce {
        0%,100% { transform: translateX(-50%) translateY(0px); }
        50%     { transform: translateX(-50%) translateY(-5px); }
      }
      @keyframes wfBtnPulse {
        0%,100% { box-shadow: 0 6px 24px ${purple}55; }
        50%     { box-shadow: 0 6px 36px ${purple}99, 0 0 0 4px ${purple}22; }
      }
      @keyframes wfTabPulse {
        0%,100% { box-shadow: -4px 0 20px ${purple}55; }
        50%     { box-shadow: -4px 0 32px ${purple}99, 0 0 0 3px ${purple}22; }
      }
      @keyframes wfDotPulse {
        0%, 100% { transform: scale(0.6); opacity: 0.4; }
        50%      { transform: scale(1.3); opacity: 1; }
      }
      @keyframes sparkFly0 {
        0%   { transform: translate(-50%,-50%) translate(0,0) scale(1.2); opacity: 1; }
        100% { transform: translate(-50%,-50%) translate(var(--dx),var(--dy)) scale(0); opacity: 0; }
      }
      @keyframes sparkFly1 {
        0%   { transform: translate(-50%,-50%) translate(0,0) scale(1.4) rotate(0deg); opacity: 1; }
        100% { transform: translate(-50%,-50%) translate(var(--dx),var(--dy)) scale(0) rotate(180deg); opacity: 0; }
      }
      @keyframes sparkFly2 {
        0%   { transform: translate(-50%,-50%) translate(0,0) scale(1); opacity: 1; }
        40%  { opacity: 1; }
        100% { transform: translate(-50%,-50%) translate(var(--dx),var(--dy)) scale(0.2) rotate(-90deg); opacity: 0; }
      }
      @media (max-width: 620px) {
        .wf-grid { grid-template-columns: 1fr !important; }
        .wf-wheel-col {
          border-right: none !important;
          border-bottom: 1px solid ${gold}33 !important;
          padding: 18px 16px 12px !important;
        }
        .wf-right-col { padding: 12px 18px 20px !important; }
        .wf-header { padding: 16px 24px 12px !important; }
        .wf-header h2 { font-size: 17px !important; }
        .wf-header p  { font-size: 12px !important; }
      }
    `}</style>
  );
}
