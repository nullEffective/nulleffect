import React from 'react';
import ReactDOM from 'react-dom/client';
import NullEffectSplash from './NullEffectSplash';
import TheVoid from './TheVoid';
import TheFist from './TheFist';
import Eden from './Eden';
import Shell from './Shell';
import './index.css';

/**
 * Path-based page selection, resolved once at load. Navigation between pages
 * is plain <a href> full page loads (see TopBar/Sidebar) — no client-side
 * router. nginx serves index.html for every path (try_files fallback), so
 * /void and /fist land here and render the matching module page.
 */
function pageFor(path: string): JSX.Element {
  console.info('[router] rendering page for path:', path);
  switch (path) {
    case '/void':
      return <TheVoid />;
    case '/fist':
      return <TheFist />;
    default:
      return (
        <>
          <NullEffectSplash />
          <Eden />
        </>
      );
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Shell>{pageFor(window.location.pathname)}</Shell>
  </React.StrictMode>
);
