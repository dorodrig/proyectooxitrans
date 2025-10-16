import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.scss'
import App from './App.tsx'
import './config/extremeErrorSilencer'
import './config/chartConfig'
import './config/localizationPolyfill'
import './config/errorHandler'
import './config/networkConfig'

// PWA Service Worker Registration
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    }).then((registration) => {
      console.log('SW registered: ', registration);
    }).catch((registrationError) => {
      console.log('SW registration failed: ', registrationError);
    });
  });
}

// PWA Validation in development
if (import.meta.env.DEV) {
  import('./utils/pwaValidator').then(({ default: validatePWA }) => {
    // Ejecutar validación después de 2 segundos para dar tiempo a que cargue todo
    setTimeout(validatePWA, 2000);
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
