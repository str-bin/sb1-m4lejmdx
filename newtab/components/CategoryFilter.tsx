import React from 'react'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { useBookmarkStore } from '../../store/bookmarkStore'
import { X } from 'lucide-react'

const CategoryFilter: React.FC = () => {
  const { categories, selectedCategory, setSelectedCategory } = useBookmarkStore()

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-sm font-medium text-muted-foreground">分类:</span>
      
      <Button
        variant={!selectedCategory ? "default" : "outline"}
        size="sm"
        onClick={() => setSelectedCategory(null)}
        className="rounded-full h-8 transition-all duration-200 hover:scale-105"
      >
        全部
      </Button>

      {categories.map((category) => (
        <Badge
          key={category.id}
          variant={selectedCategory === category.id ? "default" : "secondary"}
          className="cursor-pointer rounded-full px-4 py-2 transition-all duration-200 hover:scale-105 text-sm"
          style={{
            backgroundColor: selectedCategory === category.id ? category.color : undefined,
            borderColor: category.color,
          }}
          onClick={() => setSelectedCategory(
            selectedCategory === category.id ? null : category.id
          )}
        >
          {category.name}
          {selectedCategory === category.id && (
            <X
              className="ml-2 h-3 w-3 cursor-pointer hover:scale-110"
              onClick={(e) => {
                e.stopPropagation()
                setSelectedCategory(null)
              }}
            />
          )}
        </Badge>
      ))}
    </div>
  )
}

export default CategoryFilter