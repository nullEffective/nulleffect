import { ReactNode } from "react";
import TopBar from "./TopBar";

/**
 * PageFrame — CRT chrome for standalone module pages (/void, /fist).
 *
 * Reproduces the splash's terminal atmosphere (black phosphor background,
 * scanlines, radial glow) around a single module, with the shared TopBar
 * for navigation back home or across modules.
 */
export default function PageFrame({ children }: { children: ReactNode }): JSX.Element {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-emerald-200">
      {/* Scanlines + glow */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(transparent 96%, rgba(255,255,255,0.25) 97%, transparent 98%)",
            backgroundSize: "100% 3px",
          }}
        />
        <div
          className="absolute inset-0 mix-blend-screen"
          style={{
            backgroundImage:
              "radial-gradient(circle at 50% 10%, rgba(16,185,129,0.10), transparent 40%)",
          }}
        />
      </div>

      <TopBar />

      <div className="relative z-10">{children}</div>
    </div>
  );
}
