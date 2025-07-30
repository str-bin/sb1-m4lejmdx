import React from 'react'
import ReactDOM from 'react-dom/client'
import { ThemeProvider } from 'next-themes'
import NewTabPage from '../newtab/NewTabPage'
import { Toaster } from '../components/ui/sonner'
import '../style.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <NewTabPage />
      <Toaster />
    </ThemeProvider>
  </React.StrictMode>,
)