import './global.css';
import './setup';

import { createRoot } from 'react-dom/client';
import { App } from './app';

const appElement = document.getElementById('app');

if (!appElement) {
  throw new Error("Root element #app not found");
}

createRoot(appElement).render(<App />);
