import { useCallback, useEffect, useState } from "react";
import { edenBase } from "./apiBase";

/**
 * Eden — portal panel to the Eden evolutionary plant simulation.
 *
 * Eden runs continuously on its own Cloud Run service (separate from the
 * nulleffect backend), evolving plant genomes day by day. This panel shows a
 * live status readout (day, population, births/deaths, sim state) and links
 * out to the WebGL viewer.
 *
 * Matches NullEffectSplash conventions:
 *  - dark terminal aesthetic, monospace, emerald phosphor palette
 *  - self-contained; no router or external UI libs required
 *  - backend base overridable via (window as any).__EDEN_BASE__
 */

type WorldState = {
  day: number;
  num_plants: number;
  death_stats: {
    total_deaths: number;
    total_births: number;
  };
};

type SimStatus = {
  running: boolean;
  speed: number;
};

export default function Eden(): JSX.Element {
  const [world, setWorld] = useState<WorldState | null>(null);
  const [sim, setSim] = useState<SimStatus | null>(null);
  const [error, setError] = useState<boolean>(false);

  const load = useCallback(async (): Promise<void> => {
    try {
      const [worldRes, simRes] = await Promise.all([
        fetch(`${edenBase()}/world/state`),
        fetch(`${edenBase()}/sim/status`),
      ]);
      if (!worldRes.ok || !simRes.ok) throw new Error(`eden ${worldRes.status}/${simRes.status}`);
      const worldData: WorldState = await worldRes.json();
      const simData: SimStatus = await simRes.json();
      setWorld(worldData);
      setSim(simData);
      setError(false);
      console.debug("[eden] state", worldData, simData);
    } catch (e) {
      // Non-fatal: Eden may be cold-starting. Keep prior readout, mark stale.
      console.warn("[eden] status unavailable:", e);
      setError(true);
    }
  }, []);

  useEffect(() => {
    void load();
    const interval = setInterval(() => void load(), 10000);
    return () => clearInterval(interval);
  }, [load]);

  const viewerUrl = `${edenBase()}/eden_ray_demo.html`;
  const fmt = (n: number | undefined) => (n === undefined ? "—" : n.toLocaleString());

  return (
    <section className="relative z-10 mx-auto mt-8 w-full bg-black px-6 pb-8" style={{ width: "95%" }}>
      <div className="rounded-sm border border-emerald-600/40 bg-black/60 p-4 shadow-[0_0_24px_rgba(16,185,129,0.08)]">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <div className="font-mono text-[11px] tracking-[0.25em] text-emerald-300/80">[ EDEN // EVOLUTION_SIM ]</div>
          <div className="flex items-center gap-2 font-mono text-[10px] text-emerald-300/70">
            <div
              className={`h-2 w-2 rounded-full ${error ? "bg-red-400" : sim?.running ? "bg-green-400" : "bg-yellow-400"}`}
              style={{
                boxShadow: error
                  ? "0 0 10px rgba(248, 113, 113, 0.8)"
                  : sim?.running
                  ? "0 0 10px rgba(74, 222, 128, 0.8)"
                  : "0 0 10px rgba(251, 191, 36, 0.8)",
              }}
            />
            <span>SIM: {error ? "UNREACHABLE" : sim ? (sim.running ? "RUNNING" : "PAUSED") : "CONNECTING"}</span>
          </div>
        </div>

        <p className="mb-3 font-mono text-[10px] leading-relaxed text-emerald-300/60">
          A closed world of evolving plant genomes — growth, light, death, and mutation — running
          unattended since day zero. This readout is live.
        </p>

        <div className="mb-4 flex flex-wrap gap-6 font-mono text-[10px] text-emerald-300/80">
          <span>DAY: {fmt(world?.day)}</span>
          <span>PLANTS: {fmt(world?.num_plants)}</span>
          <span>BIRTHS: {fmt(world?.death_stats?.total_births)}</span>
          <span>DEATHS: {fmt(world?.death_stats?.total_deaths)}</span>
        </div>

        <a
          href={viewerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block rounded-sm border border-emerald-600/40 px-3 py-1 font-mono text-[11px] tracking-[0.2em] text-emerald-300/90 hover:bg-emerald-900/20"
        >
          ENTER EDEN →
        </a>
      </div>
    </section>
  );
}
