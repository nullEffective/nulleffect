import React, { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { apiBase } from "./apiBase";

/**
 * The Void — NullEffect's namesake full-stack feature.
 *
 * You type a message and cast it into the void. The backend (POST /void)
 * consumes it without ever storing it, returning only a faint reversed
 * "whisper" and an ephemeral tally. On screen, the text visibly dissolves and
 * falls into nothing. The whole point: your message has null effect.
 *
 * Matches NullEffectSplash conventions:
 *  - reads the backend base from (window as any).__API_BASE__ (same as splash)
 *  - dark terminal aesthetic, monospace, framer-motion for motion
 *  - self-contained; no router or external UI libs required
 */

type CastResponse = {
  status: string;
  effect: string;
  whispered_back: string;
  characters_consumed: number;
  voided_count: number;
};

type Stats = {
  voided_count: number;
  characters_consumed: number;
  since: string;
};

export default function TheVoid(): JSX.Element {
  const [message, setMessage] = useState<string>("");
  const [whisper, setWhisper] = useState<string | null>(null);
  const [dissolving, setDissolving] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [busy, setBusy] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const loadStats = useCallback(async (): Promise<void> => {
    try {
      const res = await fetch(`${apiBase()}/void/stats`);
      if (!res.ok) throw new Error(`stats ${res.status}`);
      const data: Stats = await res.json();
      setStats(data);
      console.debug("[void] stats", data);
    } catch (e) {
      // Non-fatal: the void simply hasn't reported. Leave prior stats intact.
      console.warn("[void] stats unavailable:", e);
    }
  }, []);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  const cast = useCallback(async (): Promise<void> => {
    const text = message;
    if (!text.trim() || busy) return;
    setBusy(true);
    setError(null);
    setWhisper(null);

    // Kick off the on-screen dissolve immediately; the network call confirms it.
    setDissolving(text);
    setMessage("");

    try {
      console.info("[void] casting %d chars into the void", text.length);
      const res = await fetch(`${apiBase()}/void`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      if (!res.ok) throw new Error(`cast ${res.status}`);
      const data: CastResponse = await res.json();
      console.info("[void] consumed; effect=%s count=%d", data.effect, data.voided_count);
      setWhisper(data.whispered_back);
      setStats((prev) => ({
        voided_count: data.voided_count,
        characters_consumed:
          (prev?.characters_consumed ?? 0) + data.characters_consumed,
        since: prev?.since ?? new Date().toISOString(),
      }));
    } catch (e) {
      console.error("[void] cast failed:", e);
      setError("the void is unreachable. nothing was consumed.");
    } finally {
      setBusy(false);
      // Let the dissolve animation finish, then clear it.
      window.setTimeout(() => setDissolving(null), 1400);
      inputRef.current?.focus();
    }
  }, [message, busy]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    // Cmd/Ctrl+Enter casts, matching terminal muscle memory.
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      void cast();
    }
  };

  return (
    <section className="w-full bg-black text-green-400 font-mono px-6 py-16 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        <h2 className="text-lg tracking-widest text-green-500 mb-1">
          [ THE VOID ]
        </h2>
        <p className="text-xs text-green-700 mb-6">
          cast a message below. it will not be stored. it will have no effect.
        </p>

        <div className="relative border border-green-900 bg-black/60 rounded-sm">
          <textarea
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={onKeyDown}
            rows={3}
            maxLength={10000}
            placeholder="> type something you want to let go of..."
            className="w-full bg-transparent text-green-300 placeholder-green-800 p-3 outline-none resize-none"
            aria-label="message to cast into the void"
          />

          {/* The dissolving ghost of the last cast, falling into nothing. */}
          <AnimatePresence>
            {dissolving && (
              <motion.div
                key={dissolving + String(stats?.voided_count)}
                initial={{ opacity: 0.9, y: 0, filter: "blur(0px)" }}
                animate={{ opacity: 0, y: 40, filter: "blur(6px)" }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.3, ease: "easeIn" }}
                className="pointer-events-none absolute inset-0 p-3 text-green-500/70 overflow-hidden"
                aria-hidden="true"
              >
                {dissolving}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between mt-3">
          <button
            onClick={() => void cast()}
            disabled={busy || !message.trim()}
            className="text-xs tracking-wider border border-green-700 px-4 py-2 rounded-sm
                       text-green-300 hover:bg-green-900/40 disabled:opacity-40
                       disabled:cursor-not-allowed transition-colors"
          >
            {busy ? "consuming..." : "cast into the void  ⏎"}
          </button>
          <span className="text-[10px] text-green-800">⌘/Ctrl + Enter</span>
        </div>

        {/* The faint whisper that momentarily escapes before it's gone. */}
        <div className="h-6 mt-4">
          <AnimatePresence>
            {whisper && (
              <motion.p
                key={whisper}
                initial={{ opacity: 0.8 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 3, ease: "easeOut" }}
                className="text-xs text-green-700 italic truncate"
              >
                the void whispers back: {whisper}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {error && <p className="text-xs text-red-500 mt-2">{error}</p>}

        <p className="text-[10px] text-green-900 mt-8 border-t border-green-950 pt-3">
          {stats
            ? `${stats.voided_count} message(s) and ${stats.characters_consumed} character(s) consumed this lifetime · 0 effects · resets to nothing on restart`
            : "the void is quiet."}
        </p>
      </div>
    </section>
  );
}
