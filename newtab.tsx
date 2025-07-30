import React, { useEffect } from 'react'
import { ThemeProvider } from 'next-themes'
import NewTabPage from './newtab/NewTabPage'
import { useBookmarkStore } from './store/bookmarkStore'
import { Toaster } from './components/ui/sonner'
import './style.css'

function IndexNewtab() {
  const initializeBookmarks = useBookmarkStore(state => state.initializeBookmarks)

  useEffect(() => {
    initializeBookmarks()
  }, [initializeBookmarks])

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <NewTabPage />
      <Toaster />
    </ThemeProvider>
  )
}

export default IndexNewtab