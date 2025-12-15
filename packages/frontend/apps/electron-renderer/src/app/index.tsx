import './setup';

import { appConfigProxy } from '@affine/core/components/hooks/use-app-config-storage';
import { Telemetry } from '@affine/core/components/telemetry';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './app';

function main() {
  appConfigProxy
    .getSync()
    .catch(() => console.error('failed to load app config'));

  mountApp();
}

function mountApp() {
  const root = document.getElementById('app');

  if (!root) {
    console.error('Root element #app not found — unable to mount React app.');
    return;
  }

  createRoot(root).render(
    <StrictMode>
      <Telemetry />
      <App />
    </StrictMode>
  );
}

try {
  main();
} catch (err) {
  console.error('Failed to bootstrap app', err);
}
