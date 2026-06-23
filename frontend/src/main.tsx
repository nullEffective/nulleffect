import React from 'react';
import ReactDOM from 'react-dom/client';
import NullEffectSplash from './NullEffectSplash';
import TheVoid from './TheVoid';
import TheFist from './TheFist';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <NullEffectSplash />
    <TheVoid />
    <TheFist />
  </React.StrictMode>
);
