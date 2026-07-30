import { useEffect, useState } from "react";
import { apiBase } from "./apiBase";

/**
 * BackendStatus — the top-bar lamp that pings the nulleffect backend.
 *
 * Polls GET /ping every 10s. Yellow while connecting, green when the backend
 * answers, red on error. Extracted from the splash so every page shows it.
 */
export default function BackendStatus(): JSX.Element {
  const [pong, setPong] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const base = apiBase();

  useEffect(() => {
    const fetchPing = async () => {
      try {
        const res = await fetch(`${base}/ping`);
        const data = await res.json();
        setPong(data.response);
        setIsLoading(false);
      } catch (e) {
        console.warn("[status] backend ping failed:", e);
        setPong(`Error: ${(e as Error).message}`);
        setIsLoading(false);
      }
    };

    fetchPing();
    const interval = setInterval(fetchPing, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, [base]);

  const online = pong && !pong.startsWith("Error");
  return (
    <div className="flex items-center gap-2 font-mono text-[10px] text-emerald-300/70">
      <div
        className={`h-2 w-2 rounded-full ${isLoading ? "bg-yellow-400 animate-pulse" : online ? "bg-green-400" : "bg-red-400"}`}
        style={{
          boxShadow: isLoading
            ? "0 0 10px rgba(251, 191, 36, 0.8)"
            : online
            ? "0 0 10px rgba(74, 222, 128, 0.8)"
            : "0 0 10px rgba(248, 113, 113, 0.8)",
        }}
      />
      <span className="whitespace-nowrap">
        <span className="hidden sm:inline">BACKEND: </span>
        {isLoading ? "CONNECTING" : online ? "ONLINE" : "OFFLINE"}
      </span>
    </div>
  );
}
