import './setup';

import { Telemetry } from '@affine/core/components/telemetry';
import { bindNativeDBApis } from '@affine/nbstore/sqlite';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './app';
import { NbStoreNativeDBApis } from './plugins/nbstore';

bindNativeDBApis(NbStoreNativeDBApis);

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
  mountApp();
} catch (err) {
  console.error('Failed to bootstrap app', err);
}
