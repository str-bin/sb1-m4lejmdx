import React from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '../../components/ui/input'
import { Button } from '../../components/ui/button'
import { useBookmarkStore } from '../../store/bookmarkStore'

const SearchBar: React.FC = () => {
  const { searchQuery, setSearchQuery } = useBookmarkStore()

  return (
    <div className="relative max-w-2xl mx-auto">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-muted-foreground" />
      </div>
      
      <Input
        type="text"
        placeholder="搜索书签..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pl-12 pr-12 h-14 text-lg rounded-2xl border-0 bg-white/50 dark:bg-black/20 backdrop-blur-sm focus:ring-2 focus:ring-primary/50 transition-all duration-200"
      />
      
      {searchQuery && (
        <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSearchQuery('')}
            className="h-10 w-10 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}

export default SearchBar