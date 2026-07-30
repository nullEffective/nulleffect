import { useEffect, useState } from "react";
import { apiBase } from "./apiBase";

/**
 * Banner — the full-width [ NULLEFFECT ] identity strip at the top of every
 * page, directly under the TopBar and spanning across the sidebar column.
 *
 * Carries the typewriter title (with keystroke clicks and inline blinking
 * cursor), the Weyland-esque tagline, and the live ts/backend readout.
 * Moved out of the old splash so all pages share it.
 */

// ── Alien-computer voice ─────────────────────────────────────
// MU/TH/UR-style data chatter: short soft blips on quantized tones,
// occasional double-chirps, and a two-tone confirm when typing lands.
const CHATTER_TONES = [523, 659, 784, 932, 1109, 1319, 1568]; // C5-ish pentatonic-ish ladder

function playBlip(ctx: AudioContext, freq: number, at: number, dur = 0.055, gain = 0.06): void {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.connect(g);
  g.connect(ctx.destination);
  osc.type = "sine";
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(gain, at + 0.008); // fast attack
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur); // soft decay
  osc.start(at);
  osc.stop(at + dur + 0.01);
}

function playChatter(ctx: AudioContext): void {
  const now = ctx.currentTime;
  const tone = CHATTER_TONES[Math.floor(Math.random() * CHATTER_TONES.length)];
  playBlip(ctx, tone, now);
  // ~1 in 4 characters get a trailing second chirp a fifth-ish away
  if (Math.random() < 0.25) {
    const tone2 = CHATTER_TONES[Math.floor(Math.random() * CHATTER_TONES.length)];
    playBlip(ctx, tone2, now + 0.07, 0.045, 0.04);
  }
}

function playConfirm(ctx: AudioContext): void {
  const now = ctx.currentTime;
  playBlip(ctx, 659, now, 0.09, 0.05);
  playBlip(ctx, 880, now + 0.11, 0.14, 0.05);
}

// Typewriter component for the title
function TypewriterTitle(): JSX.Element {
  const [displayText, setDisplayText] = useState<string>("");
  const [showCursor, setShowCursor] = useState<boolean>(true);
  const [isTypingComplete, setIsTypingComplete] = useState<boolean>(false);
  const fullText = "[ NULLEFFECT ]";
  const typingSpeed = 100; // ms per character

  useEffect(() => {
    let audioContext: AudioContext | null = null;

    // Initialize audio context (may be suspended until user interaction)
    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

      // Resume audio context if suspended (required by some browsers)
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
    } catch (e) {
      console.warn('Audio context not available:', e);
    }

    let currentIndex = 0;

    const typeInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setDisplayText(fullText.slice(0, currentIndex));

        // Alien-computer data chatter for each character
        if (currentIndex < fullText.length && audioContext && audioContext.state === 'running') {
          try {
            playChatter(audioContext);
          } catch (e) {
            // Silently fail if audio doesn't work
          }
        }

        currentIndex++;
      } else {
        clearInterval(typeInterval);
        setIsTypingComplete(true);
        // Two-tone confirm as the ident lands
        if (audioContext && audioContext.state === 'running') {
          try {
            playConfirm(audioContext);
          } catch (e) {
            // Silently fail if audio doesn't work
          }
        }
      }
    }, typingSpeed);

    return () => {
      clearInterval(typeInterval);
      if (audioContext) {
        audioContext.close();
      }
    };
  }, []);

  // Blink cursor
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530); // Blink every 530ms

    return () => clearInterval(blinkInterval);
  }, []);

  return (
    <h1 className="whitespace-nowrap text-center font-mono uppercase tracking-[0.4em] text-emerald-300/90" style={{ fontSize: "clamp(1.3rem, 3vw, 3.5rem)" }}>
      {displayText}
      <span className={`inline-block transition-opacity duration-100 ${!isTypingComplete || showCursor ? 'opacity-100' : 'opacity-0'}`}>▌</span>
    </h1>
  );
}

export default function Banner(): JSX.Element {
  const [ts, setTs] = useState<string>(new Date().toISOString());
  const base = apiBase();

  useEffect(() => {
    const t = setInterval(() => setTs(new Date().toISOString()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative z-10 border-b border-emerald-500/30 bg-black/50 px-6 py-5 text-center shadow-[0_0_24px_rgba(16,185,129,0.10)]">
      <div className="mb-2 font-mono text-[11px] tracking-[0.35em] text-emerald-300/80">[ SYS/IDENT ]</div>
      <TypewriterTitle />
      <p className="mt-3 font-mono text-xs leading-relaxed text-emerald-300/80">
        WEYLAND-ESQUE TERMINAL INTERFACE — MONOCHROME MODE ENABLED — SAFE OPERATIONS
      </p>
      <p className="mt-1 font-mono text-[10px] text-emerald-300/60">
        ts={ts} · mode=prod · backend={base}
      </p>
    </div>
  );
}
