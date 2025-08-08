
import { ThemeProvider } from 'next-themes'
import NewTabPage from './newtab/NewTabPage'
import { Toaster } from './components/ui/sonner'
import './style.css'

function IndexNewtab() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <NewTabPage />
      <Toaster />
    </ThemeProvider>
  )
}

export default IndexNewtab