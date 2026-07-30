import { ReactNode } from "react";
import TopBar from "./TopBar";
import Banner from "./Banner";
import Sidebar from "./Sidebar";

/**
 * Shell — the shared CRT chrome around every page.
 *
 * Layout: phosphor background + scanlines, TopBar across the top, then a
 * flex row of the projects Sidebar (md+) and the page content. Replaces the
 * former PageFrame and the chrome that used to live inside the splash.
 */
export default function Shell({ children }: { children: ReactNode }): JSX.Element {
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
      <Banner />

      <div className="relative flex">
        <Sidebar />
        <main className="relative z-10 min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
