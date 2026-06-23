import React, { useRef, useState } from "react";

/**
 * The Fist — a keyboard has a "fist".
 *
 * In WWII, radio operators sending Morse could be identified by their "fist":
 * the personal rhythm of how they keyed, independent of the message or its
 * cipher. The same is true of an ordinary keyboard. Your identity leaks through
 * timing — how long you *hold* each key (dwell), the gaps *between* keys
 * (flight), and the overlaps fast typists make (rollover) — not through the
 * characters themselves.
 *
 * So everyone types the SAME line. The words are identical; the hand is not.
 * Enroll a typist, then have someone else type the exact same phrase: the demo
 * catches the imposter from touch alone.
 *
 * Entirely client-side (keystroke timings via performance.now(), a 6-feature
 * vector, nearest-centroid match). Nothing leaves the page. Matches the
 * NullEffect terminal aesthetic; self-contained, no router/backend.
 */

type KeyEv = { k: string; down: number; up: number | null };
type DoneEv = { k: string; down: number; up: number };
const isDone = (x: KeyEv): x is DoneEv => x.up !== null;

type Fist = {
  wpm: number;
  dwell: number;
  dwellCV: number;
  flight: number;
  flightSpread: number;
  rollover: number;
  cps: number;
  vec: number[];
};

type Operator = { name: string; vecs: number[][] };

type Tone = "muted" | "ok" | "warn" | "bad";

const TARGET = "the quick brown fox";
const LS_KEY = "nulleffect_kb_fist_ops";

const mean = (a: number[]): number =>
  a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;

const std = (a: number[]): number => {
  if (a.length < 2) return 0;
  const m = mean(a);
  return Math.sqrt(mean(a.map((x) => (x - m) * (x - m))));
};

function analyze(ev: KeyEv[]): Fist {
  const valid = ev.filter(isDone);
  const dwell = valid.map((x) => x.up - x.down);
  const flights: number[] = [];
  for (let i = 1; i < ev.length; i++) {
    const prevUp = ev[i - 1].up;
    if (prevUp !== null) flights.push(ev[i].down - prevUp);
  }
  const first = ev[0].down;
  const lastUp = Math.max(...valid.map((x) => x.up));
  const total = (lastUp - first) / 1000;
  const cps = valid.length / Math.max(0.2, total);
  const meanDwell = mean(dwell);
  const dwellCV = meanDwell ? std(dwell) / meanDwell : 0.3;
  const meanFlight = mean(flights);
  const flightSpread = std(flights);
  const rollover = flights.length
    ? flights.filter((f) => f < 0).length / flights.length
    : 0;
  return {
    wpm: cps * 12,
    dwell: meanDwell,
    dwellCV,
    flight: meanFlight,
    flightSpread,
    rollover,
    cps,
    // rate/style features so the same hand matches across speeds:
    vec: [meanDwell / 80, meanFlight / 80, dwellCV * 3, flightSpread / 80, rollover * 4, cps / 3],
  };
}

const dist = (a: number[], b: number[]): number => {
  let s = 0;
  for (let i = 0; i < a.length; i++) {
    const d = a[i] - b[i];
    s += d * d;
  }
  return Math.sqrt(s);
};

function centroid(v: number[][]): number[] {
  const n = v[0].length;
  const c = new Array(n).fill(0);
  v.forEach((x) => {
    for (let i = 0; i < n; i++) c[i] += x[i];
  });
  return c.map((x) => x / v.length);
}

const TONE: Record<Tone, string> = {
  muted: "text-green-700",
  ok: "text-green-300",
  warn: "text-amber-400",
  bad: "text-red-500",
};

export default function TheFist(): JSX.Element {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const nameRef = useRef<HTMLInputElement | null>(null);
  const eventsRef = useRef<KeyEv[]>([]);
  const doneRef = useRef(false);

  const [session, setSession] = useState<{ ev: KeyEv[]; fist: Fist } | null>(null);
  const [operators, setOperators] = useState<Operator[]>(() => {
    try {
      const s = localStorage.getItem(LS_KEY);
      return s ? (JSON.parse(s) as Operator[]) : [];
    } catch {
      return [];
    }
  });
  const [verdict, setVerdict] = useState<{ text: string; tone: Tone }>({
    text: 'Type the line and press Enter. Enroll yourself — then have someone else type the exact same words and hit "Who\'s typing?"',
    tone: "muted",
  });

  const persist = (ops: Operator[]): void => {
    setOperators(ops);
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(ops));
    } catch {
      /* private mode — keep in memory only */
    }
  };

  const finish = (): void => {
    const ev = eventsRef.current;
    const validCount = ev.filter((x) => x.up !== null).length;
    if (validCount < 8) {
      setVerdict({ text: "Type a bit more so there's enough rhythm to read (at least 8 keys).", tone: "warn" });
      return;
    }
    doneRef.current = true;
    const fist = analyze(ev);
    setSession({ ev: ev.slice(), fist });
    setVerdict({ text: 'Fist read. Name it and "Enroll", or hit "Who\'s typing?" to match it against the roster.', tone: "muted" });
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") {
      e.preventDefault();
      finish();
      return;
    }
    if (e.key.length !== 1 && e.key !== "Backspace") return;
    if (doneRef.current) {
      eventsRef.current = [];
      doneRef.current = false;
      if (inputRef.current) inputRef.current.value = "";
    }
    if (e.key === "Backspace" || e.repeat) return;
    eventsRef.current.push({ k: e.key.toLowerCase(), down: performance.now(), up: null });
  };

  const onKeyUp = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key.length !== 1) return;
    const k = e.key.toLowerCase();
    const ev = eventsRef.current;
    for (let i = ev.length - 1; i >= 0; i--) {
      if (ev[i].k === k && ev[i].up === null) {
        ev[i].up = performance.now();
        break;
      }
    }
    if (ev.filter((x) => x.up !== null).length >= 18) finish();
  };

  const enroll = (): void => {
    if (!session) {
      setVerdict({ text: "Type the line and press Enter first.", tone: "warn" });
      return;
    }
    const nm = (nameRef.current?.value || "").trim();
    if (!nm) {
      setVerdict({ text: "Give the operator a name first.", tone: "warn" });
      return;
    }
    const ops = operators.map((o) => ({ name: o.name, vecs: o.vecs.slice() }));
    const ex = ops.find((o) => o.name.toLowerCase() === nm.toLowerCase());
    if (ex) ex.vecs.push(session.fist.vec);
    else ops.push({ name: nm, vecs: [session.fist.vec] });
    persist(ops);
    setVerdict({ text: `Enrolled "${nm}". Type it again to add a sample, or hand the keyboard to someone else.`, tone: "ok" });
  };

  const identify = (): void => {
    if (!session) {
      setVerdict({ text: "Type the line and press Enter first.", tone: "warn" });
      return;
    }
    if (!operators.length) {
      setVerdict({ text: "No one enrolled yet — enroll a fist first.", tone: "warn" });
      return;
    }
    const scored = operators
      .map((o) => ({ name: o.name, d: dist(session.fist.vec, centroid(o.vecs)) }))
      .sort((a, b) => a.d - b.d);
    const sim = (d: number): number => Math.round(100 * Math.exp(-d / 1.9));
    const best = scored[0];
    const s = sim(best.d);
    const runner = scored[1] ? ` · next closest ${scored[1].name} ${sim(scored[1].d)}%` : "";
    if (s >= 60) setVerdict({ text: `Identified: ${best.name} — ${s}% fist match${runner}`, tone: "ok" });
    else if (s >= 42) setVerdict({ text: `Uncertain: most like ${best.name} (${s}%), but the hand is off${runner}`, tone: "warn" });
    else setVerdict({ text: `Fist mismatch — ${s}% to closest (${best.name}). Not the enrolled typist.`, tone: "bad" });
  };

  const clear = (): void => {
    persist([]);
    setVerdict({ text: "Roster cleared.", tone: "muted" });
  };

  const validEv: DoneEv[] = session ? session.ev.filter(isDone) : [];
  const maxDwell = validEv.length ? Math.max(...validEv.map((x) => x.up - x.down)) : 1;
  const f = session?.fist;

  const card = (label: string, value: string) => (
    <div className="border border-green-900 rounded-sm px-3 py-2">
      <div className="text-[11px] text-green-700">{label}</div>
      <div className="text-lg text-green-300">{value}</div>
    </div>
  );

  return (
    <section className="w-full bg-black text-green-400 font-mono px-6 py-16 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        <h2 className="text-lg tracking-widest text-green-500 mb-1">[ THE FIST ]</h2>
        <p className="text-xs text-green-700 mb-5">
          a keyboard has a fist. everyone types the same line — your identity is in the timing, not the words.
        </p>

        <div className="text-[11px] text-green-700 mb-1">target</div>
        <div className="text-base text-green-300 bg-green-950/30 border border-green-900 rounded-sm px-3 py-2 mb-3 tracking-wide">
          {TARGET}
        </div>

        <input
          ref={inputRef}
          onKeyDown={onKeyDown}
          onKeyUp={onKeyUp}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          placeholder="> type the line above, then press Enter"
          className="w-full bg-transparent text-green-200 placeholder-green-800 border border-green-800 rounded-sm px-3 py-3 outline-none focus:border-green-600 mb-5"
          aria-label="type the target line"
        />

        <div className="grid grid-cols-4 gap-3 mb-5">
          {card("speed", f ? `${Math.round(f.wpm)} wpm` : "—")}
          {card("hold (dwell)", f ? `${Math.round(f.dwell)} ms` : "—")}
          {card("flight (gap)", f ? `${Math.round(f.flight)} ms` : "—")}
          {card("overlap", f ? `${Math.round(f.rollover * 100)}%` : "—")}
        </div>

        <div className="flex items-end gap-[2px] h-11 mb-6 overflow-hidden" aria-hidden="true">
          {validEv.map((x, i) => (
            <div
              key={i}
              className="flex-none w-2 rounded-sm bg-green-500"
              style={{ height: `${Math.max(6, Math.round(8 + (30 * (x.up - x.down)) / maxDwell))}px` }}
            />
          ))}
        </div>

        <div className="flex gap-2 flex-wrap items-center mb-4">
          <input
            ref={nameRef}
            placeholder="operator name"
            className="flex-1 min-w-[150px] bg-transparent text-green-200 placeholder-green-800 border border-green-800 rounded-sm px-3 py-2 outline-none focus:border-green-600"
            aria-label="operator name"
          />
          <button onClick={enroll} className="text-xs tracking-wider border border-green-700 px-3 py-2 rounded-sm text-green-300 hover:bg-green-900/40 transition-colors">
            enroll this fist
          </button>
          <button onClick={identify} className="text-xs tracking-wider border border-green-700 px-3 py-2 rounded-sm text-green-300 hover:bg-green-900/40 transition-colors">
            who's typing?
          </button>
          <button onClick={clear} className="text-xs tracking-wider border border-green-900 px-3 py-2 rounded-sm text-green-700 hover:bg-green-900/30 transition-colors" aria-label="clear operators">
            clear
          </button>
        </div>

        <p className={`text-sm min-h-[24px] mb-4 ${TONE[verdict.tone]}`}>{verdict.text}</p>

        <div className="flex flex-col gap-2">
          {operators.map((o, idx) => {
            const c = centroid(o.vecs);
            return (
              <div key={o.name + idx} className="flex items-center justify-between gap-3 border border-green-900 rounded-sm px-3 py-2">
                <div className="flex items-center gap-2 min-w-0 text-sm">
                  <span className="w-2 h-2 rounded-full bg-green-500 flex-none" />
                  <span className="text-green-300">{o.name}</span>
                  <span className="text-[11px] text-green-700 truncate">
                    {o.vecs.length} sample{o.vecs.length > 1 ? "s" : ""} · hold {Math.round(c[0] * 80)}ms · overlap {Math.round(c[4] * 25)}%
                  </span>
                </div>
                <button
                  onClick={() => persist(operators.filter((_, i) => i !== idx))}
                  className="flex-none text-[11px] text-green-700 border border-green-900 px-2 py-1 rounded-sm hover:bg-green-900/30"
                >
                  remove
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
