import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Note: @antv/infographic automatically registers built-in fonts:
// - Alibaba PuHuiTi (default)
// - Source Han Sans, Source Han Serif, LXGW WenKai
// - 851tegakizatsu (for hand-drawn theme)
// The "Font family not registered" warning occurs when font CSS hasn't loaded yet,
// but the library will use fallback fonts and load them asynchronously.

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
