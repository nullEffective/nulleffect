/**
 * Shared backend base-URL resolution for all NullEffect frontend modules.
 *
 * Resolution order (first non-empty wins):
 *  1. Runtime override on window (__API_BASE__ / __EDEN_BASE__) — lets a
 *     deployed bundle be repointed without a rebuild.
 *  2. Build-time env (VITE_API_BASE / VITE_EDEN_BASE) — injected by the
 *     Docker build via cloudbuild substitutions.
 *  3. Hardcoded default — localhost for the nulleffect backend (dev),
 *     the Cloud Run URL for Eden (it has no local dev equivalent).
 */

export function apiBase(): string {
  const fromWindow = (window as any).__API_BASE__;
  if (typeof fromWindow === "string" && fromWindow) return fromWindow;
  const fromEnv = import.meta.env.VITE_API_BASE;
  if (typeof fromEnv === "string" && fromEnv) return fromEnv;
  return "http://localhost:8080";
}

export function edenBase(): string {
  const fromWindow = (window as any).__EDEN_BASE__;
  if (typeof fromWindow === "string" && fromWindow) return fromWindow;
  const fromEnv = import.meta.env.VITE_EDEN_BASE;
  if (typeof fromEnv === "string" && fromEnv) return fromEnv;
  return "https://eden-backend-sugbtmtbtq-uc.a.run.app";
}
