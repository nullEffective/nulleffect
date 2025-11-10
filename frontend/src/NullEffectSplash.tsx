import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/**
 * NullEffect Alien‑style Splash + Conway Life panel
 * - Self-contained React component (no external UI libs required)
 * - Fixes React #130 (objects as children) by ensuring only strings/numbers/elements are rendered
 * - Adds speed controls (▲/▼/reset) and visible cursor trails
 * - Default speed: complete one full Conway step in ~3 seconds
 * - Includes lightweight console tests for Life rules
 * - ENHANCED: Backend ping integration with status display
 */

export default function NullEffectSplash(): JSX.Element {
  const [ts, setTs] = useState<string>(new Date().toISOString());
  const [pong, setPong] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  
  // Backend ping
  const apiBase = (typeof (window as any).__API_BASE__ === "string" && (window as any).__API_BASE__) || "";
  
  useEffect(() => {
    const t = setInterval(() => setTs(new Date().toISOString()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const fetchPing = async () => {
      try {
        const base = apiBase || "http://localhost:8080";
        const res = await fetch(`${base}/ping`);
        const data = await res.json();
        setPong(data.response);
        setIsLoading(false);
      } catch (e) {
        setPong(`Error: ${(e as Error).message}`);
        setIsLoading(false);
      }
    };
    
    fetchPing();
    const interval = setInterval(fetchPing, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, [apiBase]);

  // Parallax glow
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 80, damping: 20 });
  const sy = useSpring(my, { stiffness: 80, damping: 20 });
  const onMouseMove = (e: React.MouseEvent) => {
    const { innerWidth, innerHeight } = window;
    mx.set((e.clientX / innerWidth - 0.5) * 2);
    my.set((e.clientY / innerHeight - 0.5) * 2);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-emerald-200" onMouseMove={onMouseMove}>
      {/* Scanlines + glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "linear-gradient(transparent 96%, rgba(255,255,255,0.25) 97%, transparent 98%)", backgroundSize: "100% 3px" }} />
        <div className="absolute inset-0 mix-blend-screen" style={{ backgroundImage: "radial-gradient(circle at 50% 10%, rgba(16,185,129,0.10), transparent 40%)" }} />
      </div>

      {/* Parallax phosphor glow */}
      <motion.div aria-hidden className="pointer-events-none absolute -inset-40 rounded-full" style={{ x: sx, y: sy, background: "radial-gradient(420px 420px at 50% 50%, rgba(16,185,129,0.10), transparent 60%)", filter: "blur(10px)" }} />

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between border-b border-emerald-500/30 bg-black/60 px-6 py-3 md:px-10">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-[2px] bg-emerald-400 shadow-[0_0_20px_2px_rgba(16,185,129,0.9)]" />
          <span className="font-mono text-[11px] tracking-[0.25em] text-emerald-300/90">NE//CORE</span>
        </div>
        <nav className="flex items-center gap-6">
          <div className="flex items-center gap-2 font-mono text-[10px] text-emerald-300/70">
            <div 
              className={`h-2 w-2 rounded-full ${isLoading ? 'bg-yellow-400 animate-pulse' : (pong && !pong.startsWith('Error') ? 'bg-green-400' : 'bg-red-400')}`}
              style={{ boxShadow: isLoading ? '0 0 10px rgba(251, 191, 36, 0.8)' : (pong && !pong.startsWith('Error') ? '0 0 10px rgba(74, 222, 128, 0.8)' : '0 0 10px rgba(248, 113, 113, 0.8)') }}
            />
            <span>BACKEND: {isLoading ? 'CONNECTING' : (pong && !pong.startsWith('Error') ? 'ONLINE' : 'OFFLINE')}</span>
          </div>
        </nav>
      </div>

      {/* Header */}
      <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center px-6 pt-16 md:pt-24">
        <div className="w-full rounded-sm border border-emerald-600/40 bg-black/50 p-6 text-center shadow-[0_0_24px_rgba(16,185,129,0.12)]">
          <div className="mb-4 font-mono text-sm tracking-[0.35em] text-emerald-300/80 md:text-base">[ SYS/IDENT ]</div>
          <h1 className="inline-block font-mono uppercase tracking-[0.4em] text-4xl text-emerald-300/90 md:text-7xl">
            [ nullEffect ]<span className="ml-1 inline-block animate-blink">▌</span>
          </h1>
          <p className="mt-4 font-mono text-xs leading-relaxed text-emerald-300/80">
            WEYLAND-ESQUE TERMINAL INTERFACE — MONOCHROME MODE ENABLED — SAFE OPERATIONS
          </p>
          <p className="mt-1 font-mono text-[10px] text-emerald-300/60">
            ts={ts} · route=/ · mode=prod · backend={apiBase || "localhost:8080"}
          </p>
        </div>

        {/* Main: Conway Life */}
        <section id="main" className="relative z-10 mx-auto mt-8 w-full max-w-6xl px-6">
          <div className="rounded-sm border border-emerald-600/40 bg-black/60 p-4 shadow-[0_0_24px_rgba(16,185,129,0.08)]">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <div className="font-mono text-[11px] tracking-[0.25em] text-emerald-300/80">[ MAIN // LIFE_SIM ]</div>
              <div className="font-mono text-[10px] text-emerald-300/60">Conway's Game of Life · click or [Space] to pause/resume · [R] reseed · [▲/▼] speed · [1][2][3] presets</div>
            </div>
            <LifeSim />
          </div>
        </section>
      </div>

      {/* Styles */}
      <style>{`
        @keyframes blink { 0%, 49% { opacity: 1 } 50%, 100% { opacity: 0 } }
        .animate-blink { animation: blink 1s step-end infinite; }
      `}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Conway's Game of Life with cursor writer, trails, and speed controls
// ─────────────────────────────────────────────────────────────
function LifeSim(): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [running, setRunning] = useState<boolean>(true);
  const [uiTick, setUiTick] = useState<number>(0); // to refresh text UI

  // Grid
  const COLS = 120;
  const ROWS = 60;
  const CELL = 8;
  const TOTAL = COLS * ROWS;

  // Buffers for step N (read) and step N+1 (write)
  const stepN = useRef<Uint8Array>(new Uint8Array(TOTAL));
  const stepNp1 = useRef<Uint8Array>(new Uint8Array(TOTAL));

  // Cursor & generation
  const cursorIndexRef = useRef<number>(0);
  const genRef = useRef<number>(0);

  // Timing
  const timerRef = useRef<number | null>(null);
  const cellAccumulatorRef = useRef<number>(0); // fractional cells between ticks
  const lastTickRef = useRef<number>(0);

  // Trails (phosphor afterglow)
  const trailRef = useRef<Array<{ i: number; t: number }>>([]);
  const TRAIL_MS = 1200; // fade

  // Hover-to-flip support
  const lastHoverRef = useRef<number>(-1);

  // Map mouse event -> cell index in current grid, accounting for CSS scaling
  const getIndexFromEvent = (ev: React.MouseEvent<HTMLCanvasElement, MouseEvent>): number => {
    const canvas = canvasRef.current;
    if (!canvas) return -1;
    const rect = canvas.getBoundingClientRect();
    const x = ev.clientX - rect.left;
    const y = ev.clientY - rect.top;
    if (x < 0 || y < 0 || x >= rect.width || y >= rect.height) return -1;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const cx = Math.floor((x * scaleX) / CELL);
    const cy = Math.floor((y * scaleY) / CELL);
    if (cx < 0 || cy < 0 || cx >= COLS || cy >= ROWS) return -1;
    return cy * COLS + cx;
  };

  // Toggle a cell immediately when hovered
  const toggleAtIndex = (i: number) => {
    const gN = stepN.current;
    const gNp1 = stepNp1.current;
    gN[i] = gN[i] ^ 1; // flip current generation cell
    // If this cell has already been processed this sweep, also flip its shown N+1 value
    if (i < cursorIndexRef.current) {
      gNp1[i] = gNp1[i] ^ 1;
    }
    trailRef.current.push({ i, t: performance.now() });
    setUiTick((t) => t + 1); // refresh UI
  };

  const handleCanvasMove = (ev: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    const i = getIndexFromEvent(ev);
    if (i >= 0 && i !== lastHoverRef.current) {
      toggleAtIndex(i);
      lastHoverRef.current = i;
    }
  };

  const handleCanvasLeave = () => { lastHoverRef.current = -1; };

  // === Speed controls ===
  // Default: complete one full step in ~3s → cps = TOTAL / 3
  const [speedCps, setSpeedCps] = useState<number>(TOTAL / 3);
  const speedRef = useRef<number>(speedCps);
  useEffect(() => { speedRef.current = speedCps; }, [speedCps]);
  const clamp = (v: number) => Math.max(0.01, Math.min(v, TOTAL * 10));
  const slower = () => setSpeedCps((s) => clamp(s / 2));
  const faster = () => setSpeedCps((s) => clamp(s * 2));
  const resetSpeed = () => setSpeedCps(TOTAL / 3);

  // Helpers
  const idx = (x: number, y: number) => y * COLS + x;
  const xyFrom = (i: number) => ({ x: i % COLS, y: Math.floor(i / COLS) });

  // Seed step N randomly; clear step N+1
  const seed = () => {
    const g = stepN.current;
    for (let i = 0; i < TOTAL; i++) g[i] = Math.random() < 0.18 ? 1 : 0;
    stepNp1.current.fill(0);
    cursorIndexRef.current = 0;
    genRef.current = 0;
    trailRef.current = [];
    cellAccumulatorRef.current = 0;
    lastTickRef.current = performance.now();
  };

  // Neighbor count from read buffer (step N)
  const neighborCount = (x: number, y: number, g: Uint8Array) => {
    let c = 0;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const xx = (x + dx + COLS) % COLS;
        const yy = (y + dy + ROWS) % ROWS;
        c += g[idx(xx, yy)];
      }
    }
    return c;
  };

  // Write next state at cell i reading from step N
  const writeNextAt = (i: number) => {
    const g = stepN.current;
    const n = stepNp1.current;
    const { x, y } = xyFrom(i);
    const alive = g[i] === 1;
    const c = neighborCount(x, y, g);
    n[i] = (alive && (c === 2 || c === 3)) || (!alive && c === 3) ? 1 : 0;
  };

  // Advance cursor (possibly multiple cells per frame)
  const advanceCursor = (cells: number) => {
    let remaining = cells;
    while (remaining > 0) {
      const i = cursorIndexRef.current;
      writeNextAt(i);
      trailRef.current.push({ i, t: performance.now() });
      cursorIndexRef.current++;
      if (cursorIndexRef.current >= TOTAL) {
        // Full Conway step done → swap buffers
        const old = stepN.current;
        stepN.current = stepNp1.current;
        stepNp1.current = old;
        stepNp1.current.fill(0);
        cursorIndexRef.current = 0;
        genRef.current++;
        // Trim trail
        const cutoff = performance.now() - TRAIL_MS;
        trailRef.current = trailRef.current.filter((p) => p.t >= cutoff);
      }
      remaining--;
    }
  };

  const draw = (ctx: CanvasRenderingContext2D) => {
    const gN = stepN.current;
    const gNp1 = stepNp1.current;
    const processedUpto = cursorIndexRef.current;
    const now = performance.now();

    ctx.clearRect(0, 0, COLS * CELL, ROWS * CELL);

    // background
    ctx.fillStyle = "rgba(16,185,129,0.05)";
    ctx.fillRect(0, 0, COLS * CELL, ROWS * CELL);

    // grid lines
    ctx.strokeStyle = "rgba(16,185,129,0.08)";
    ctx.lineWidth = 1;
    for (let x = 0; x <= COLS; x++) {
      ctx.beginPath();
      ctx.moveTo(x * CELL + 0.5, 0);
      ctx.lineTo(x * CELL + 0.5, ROWS * CELL);
      ctx.stroke();
    }
    for (let y = 0; y <= ROWS; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * CELL + 0.5);
      ctx.lineTo(COLS * CELL, y * CELL + 0.5);
      ctx.stroke();
    }

    // Render N+1 for processed cells; N for others
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const i = y * COLS + x;
        const v = i < processedUpto ? gNp1[i] : gN[i];
        if (v === 1) {
          ctx.fillStyle = i < processedUpto ? "rgba(110,231,183,0.95)" : "rgba(110,231,183,0.75)";
          ctx.fillRect(x * CELL + 1, y * CELL + 1, CELL - 1, CELL - 1);
        }
      }
    }

    // Trail overlay (fade)
    const cutoff = now - TRAIL_MS;
    trailRef.current = trailRef.current.filter((p) => p.t >= cutoff);
    for (const p of trailRef.current) {
      const age = now - p.t;
      const a = Math.max(0, 1 - age / TRAIL_MS);
      const x = p.i % COLS;
      const y = Math.floor(p.i / COLS);
      const px = x * CELL + 0.5;
      const py = y * CELL + 0.5;
      ctx.fillStyle = `rgba(16,185,129,${(0.25 * a).toFixed(3)})`;
      ctx.fillRect(px + 1, py + 1, CELL - 2, CELL - 2);
      ctx.lineWidth = 1;
      ctx.strokeStyle = `rgba(16,185,129,${(0.7 * a).toFixed(3)})`;
      ctx.strokeRect(px, py, CELL - 1, CELL - 1);
    }

    // Cursor overlay
    const cur = xyFrom(cursorIndexRef.current % TOTAL);
    const px = cur.x * CELL + 0.5;
    const py = cur.y * CELL + 0.5;
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(16,185,129,0.9)";
    ctx.strokeRect(px, py, CELL - 1, CELL - 1);
    ctx.fillStyle = "rgba(16,185,129,0.12)";
    ctx.fillRect(px + 1, py + 1, CELL - 3, CELL - 3);

    // scanlines
    ctx.fillStyle = "rgba(255,255,255,0.04)";
    for (let y = 0; y < ROWS * CELL; y += 3) ctx.fillRect(0, y, COLS * CELL, 1);
  };

  useEffect(() => {
    seed();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // keyboard controls
    const onKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        setRunning((r) => !r);
      } else if (e.key === 'r' || e.key === 'R') {
        seed();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSpeedCps((s) => Math.max(0.01, Math.min(s * 2, TOTAL * 10)));
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSpeedCps((s) => Math.max(0.01, Math.min(s / 2, TOTAL * 10)));
      } else if (e.key === '1') {
        setSpeedCps(TOTAL / 10); // slow
      } else if (e.key === '2') {
        setSpeedCps(TOTAL / 3); // medium (default)
      } else if (e.key === '3') {
        setSpeedCps(TOTAL); // fast (1 full step per second)
      }
    };
    window.addEventListener('keydown', onKey);

    // 50ms timer; accumulate fractional cells for smooth speeds
    lastTickRef.current = performance.now();
    timerRef.current = window.setInterval(() => {
      if (!running) return;
      const now = performance.now();
      const dt = now - lastTickRef.current; // ms
      lastTickRef.current = now;

      cellAccumulatorRef.current += (dt * speedRef.current) / 1000; // cells to process
      const advance = Math.floor(cellAccumulatorRef.current);
      if (advance > 0) {
        cellAccumulatorRef.current -= advance;
        advanceCursor(advance);
      }

      draw(ctx);
      setUiTick((t) => t + 1);
    }, 50);

    draw(ctx);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      window.removeEventListener('keydown', onKey);
    };
  }, [running]);

  // UI derived values (strings only — avoid object children)
  const progress = Math.floor((cursorIndexRef.current / TOTAL) * 100);
  const etaSec = Math.max(0.01, TOTAL / speedRef.current);

  return (
    <div className="w-full">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] text-emerald-300/70">
        <div>
          STATE: {running ? "RUN" : "PAUSE"} · STEP N: {String(genRef.current)} · PROGRESS: {String(progress)}%
        </div>
        <div className="flex items-center gap-2">
          <span>SPD: {speedCps.toFixed(2)} cells/s (~{etaSec.toFixed(2)}s/step)</span>
          <button onClick={slower} className="rounded-sm border border-emerald-600/40 px-2 py-0.5 hover:bg-emerald-900/20">▼</button>
          <button onClick={faster} className="rounded-sm border border-emerald-600/40 px-2 py-0.5 hover:bg-emerald-900/20">▲</button>
          <button onClick={resetSpeed} className="rounded-sm border border-emerald-600/40 px-2 py-0.5 hover:bg-emerald-900/20">reset</button>
          <button onClick={() => setRunning((r) => !r)} className="ml-2 underline underline-offset-2">toggle</button>
          <button onClick={seed} className="underline underline-offset-2">reseed</button>
        </div>
      </div>
      <div className="overflow-x-auto rounded-sm border border-emerald-600/30 bg-black/70 p-2">
        <canvas
          ref={canvasRef}
          width={COLS * CELL}
          height={ROWS * CELL}
          className="h-auto w-full"
          onClick={() => setRunning((r) => !r)}
          onMouseMove={handleCanvasMove}
          onMouseLeave={handleCanvasLeave}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Lightweight console tests (run once in dev; harmless in prod)
// ─────────────────────────────────────────────────────────────
(function selfTest() {
  try {
    // Test 1: neighborCount on blinker configuration
    const COLS = 5, ROWS = 5, TOTAL = COLS * ROWS;
    const idx = (x: number, y: number) => y * COLS + x;
    const g = new Uint8Array(TOTAL);
    // vertical blinker at (2,1),(2,2),(2,3)
    g[idx(2,1)] = 1; g[idx(2,2)] = 1; g[idx(2,3)] = 1;

    const neighborCount = (x: number, y: number) => {
      let c = 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const xx = (x + dx + COLS) % COLS;
        const yy = (y + dy + ROWS) % ROWS;
        c += g[idx(xx, yy)];
      }
      return c;
    };

    console.assert(neighborCount(2,2) === 2, "center should have 2 neighbors");
    console.assert(neighborCount(1,2) === 3, "left of center should have 3 neighbors");

    // Test 2: one Conway step of blinker -> horizontal
    const step = (G: Uint8Array) => {
      const N = new Uint8Array(TOTAL);
      for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
        const i = idx(x,y);
        let c = 0;
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          const xx = (x + dx + COLS) % COLS; const yy = (y + dy + ROWS) % ROWS;
          c += G[idx(xx,yy)];
        }
        const alive = G[i] === 1;
        N[i] = (alive && (c === 2 || c === 3)) || (!alive && c === 3) ? 1 : 0;
      }
      return N;
    };
    const N1 = step(g);
    console.assert(N1[idx(1,2)] === 1 && N1[idx(2,2)] === 1 && N1[idx(3,2)] === 1, "blinker should flip to horizontal");
  } catch (e) {
    // Do nothing; avoid crashing UI if console is unavailable
  }
})();
