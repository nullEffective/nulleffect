import { edenBase } from "./apiBase";

/**
 * Sidebar — left rail listing the NullEffect projects.
 *
 * Shown on md+ screens (the TopBar's inline links cover mobile). The entry
 * matching the current pathname is highlighted. External projects (Eden)
 * open in a new tab and are marked with ↗.
 */

type Project = {
  label: string;
  desc: string;
  href: string;
  external?: boolean;
};

export default function Sidebar(): JSX.Element {
  const projects: Project[] = [
    { label: "LIFE_SIM", desc: "conway core", href: "/" },
    { label: "THE VOID", desc: "cast · consume · no effect", href: "/void" },
    { label: "THE FIST", desc: "keystroke identity", href: "/fist" },
    { label: "EDEN", desc: "evolutionary garden", href: `${edenBase()}/eden_ray_demo.html`, external: true },
  ];
  const path = window.location.pathname;

  return (
    <aside className="relative z-10 hidden w-56 shrink-0 border-r border-emerald-500/30 bg-black/50 md:block">
      <div className="px-5 py-5">
        <div className="mb-4 font-mono text-[11px] tracking-[0.3em] text-emerald-300/80">[ PROJECTS ]</div>
        <nav className="flex flex-col gap-1">
          {projects.map((p) => {
            const active = !p.external && path === p.href;
            return (
              <a
                key={p.label}
                href={p.href}
                target={p.external ? "_blank" : undefined}
                rel={p.external ? "noopener noreferrer" : undefined}
                className={`rounded-sm border px-3 py-2 hover:bg-emerald-900/20 ${
                  active ? "border-emerald-500/60 bg-emerald-900/20" : "border-transparent"
                }`}
              >
                <div className={`font-mono text-[11px] tracking-[0.2em] ${active ? "text-emerald-200" : "text-emerald-300/90"}`}>
                  {"> "}{p.label}{p.external ? " ↗" : ""}
                </div>
                <div className="mt-0.5 font-mono text-[9px] text-emerald-300/50">{p.desc}</div>
              </a>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
