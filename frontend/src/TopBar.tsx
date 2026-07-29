import { ReactNode } from "react";
import { edenBase } from "./apiBase";

/**
 * TopBar — shared NE//CORE header used by the splash and module pages.
 *
 * Left: NE//CORE identity (links home). Right: module nav links plus an
 * optional caller-supplied slot (e.g. the backend status lamp on the splash).
 * Full page loads on nav are intentional — no client-side router needed;
 * nginx falls back to index.html and main.tsx renders by pathname.
 */
export default function TopBar({ rightSlot }: { rightSlot?: ReactNode }): JSX.Element {
  const path = window.location.pathname;
  const linkClass = (href: string) =>
    `font-mono text-[10px] tracking-[0.25em] hover:text-emerald-200 ${
      path === href ? "text-emerald-300" : "text-emerald-300/60"
    }`;

  return (
    <div className="relative z-10 flex items-center justify-between border-b border-emerald-500/30 bg-black/60 px-6 py-3 md:px-10">
      <a href="/" className="flex items-center gap-3">
        <div className="h-3 w-3 rounded-[2px] bg-emerald-400 shadow-[0_0_20px_2px_rgba(16,185,129,0.9)]" />
        <span className="font-mono text-[11px] tracking-[0.25em] text-emerald-300/90">NE//CORE</span>
      </a>
      <nav className="flex items-center gap-6">
        <a href="/void" className={linkClass("/void")}>VOID</a>
        <a href="/fist" className={linkClass("/fist")}>FIST</a>
        <a
          href={`${edenBase()}/eden_ray_demo.html`}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass("/eden")}
        >
          EDEN ↗
        </a>
        {rightSlot}
      </nav>
    </div>
  );
}
