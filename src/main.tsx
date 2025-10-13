import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.scss'
import App from './App.tsx'
import './config/extremeErrorSilencer'
import './config/chartConfig'
import './config/localizationPolyfill'
import './config/errorHandler'
import './config/networkConfig'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
