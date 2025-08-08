import React from 'react'
import { Plus, Moon, Sun, Settings } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '../../components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu'
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

  return (
    <header className="flex items-center justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
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
          className="rounded-full h-10 w-10 p-0 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
        >
          <Plus className="h-5 w-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="lg"
              className="rounded-full h-10 w-10 p-0 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
            >
              {theme === 'dark' ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => setTheme('light')}>
              <Sun className="mr-2 h-4 w-4" />
              浅色主题
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('dark')}>
              <Moon className="mr-2 h-4 w-4" />
              深色主题
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('system')}>
              <Settings className="mr-2 h-4 w-4" />
              跟随系统
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

export default Header