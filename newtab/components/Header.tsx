import React from 'react'
import { Plus, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '../../components/ui/button'
import { formatDate } from '../../lib/utils'
import DataSourceToggle from './DataSourceToggle'

interface HeaderProps {
  onAddBookmark: () => void
}

const Header: React.FC<HeaderProps> = ({ onAddBookmark }) => {
  const { theme, setTheme } = useTheme()
  const [currentTime, setCurrentTime] = React.useState(new Date())

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <header className="flex items-center justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl md:text-4xl font-bold text-foreground">
          欢迎回来
        </h1>
        <p className="text-muted-foreground text-sm">
          {formatDate(currentTime)}
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <DataSourceToggle />
        
        <Button
          onClick={onAddBookmark}
          size="lg"
          className="rounded-full h-10 w-10 p-0 border border-border"
        >
          <Plus className="h-5 w-5" />
        </Button>

        <Button
          onClick={toggleTheme}
          variant="outline"
          size="lg"
          className="rounded-full h-10 w-10 p-0 border border-border"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">切换主题</span>
        </Button>
      </div>
    </header>
  )
}

export default Header