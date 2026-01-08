import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerFont } from '@antv/infographic'
import './index.css'
import App from './App.tsx'

// Register Alibaba PuHuiTi font to suppress "Font family not registered" warnings
// Using AntV's official font asset
registerFont({
  fontFamily: 'Alibaba PuHuiTi',
  name: '阿里巴巴普惠体',
  baseUrl: 'https://assets.antv.antgroup.com/AlibabaPuHuiTi-Regular',
  fontWeight: {
    regular: 'result.css',
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
