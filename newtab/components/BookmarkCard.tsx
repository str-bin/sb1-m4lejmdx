import React, { useState } from 'react'
import { MoreVertical, Edit, Trash2, ExternalLink, Copy } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { useBookmarkStore } from '../../store/bookmarkStore'
import { getFaviconUrl } from '../../lib/utils'
import type { Bookmark } from '../../types/bookmark'
import { toast } from 'sonner'
import EditBookmarkDialog from './EditBookmarkDialog'

interface BookmarkCardProps {
  bookmark: Bookmark
}

const BookmarkCard: React.FC<BookmarkCardProps> = ({ bookmark }) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const { deleteBookmark, categories } = useBookmarkStore()

  const category = categories.find(cat => cat.id === bookmark.category)
  const faviconUrl = getFaviconUrl(bookmark.url)

  const handleClick = () => {
    window.open(bookmark.url, '_blank')
  }

  const handleDelete = () => {
    deleteBookmark(bookmark.id)
    toast.success(`已删除 "${bookmark.title}"`)
  }

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(bookmark.url)
    toast.success('链接已复制到剪贴板')
  }

  return (
    <>
      <div className="group relative">
        <div
          onClick={handleClick}
          className="glass rounded-lg p-3 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl border border-white/20 backdrop-blur-sm min-h-[90px] flex flex-col justify-between"
        >
          {/* 顶部：网站图标和域名 */}
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
              <img
                src={faviconUrl}
                alt={bookmark.title}
                className="w-4 h-4"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiByeD0iNCIgZmlsbD0iIzY2NjY2NiIvPgo8dGV4dCB4PSIxMCIgeT0iMTQiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPj88L3RleHQ+Cjwvc3ZnPgo='
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-white/60 truncate">
                {new URL(bookmark.url).hostname}
              </div>
            </div>
          </div>

          {/* 中间：标题 */}
          <div className="flex-1 flex items-center">
            <h3 className="font-medium text-sm text-white leading-tight line-clamp-2">
              {bookmark.title}
            </h3>
          </div>

          {/* 底部：分类标签 */}
          <div className="flex items-center justify-between mt-2">
            {category ? (
              <Badge
                variant="secondary"
                className="text-xs px-1.5 py-0.5 rounded-full"
                style={{ backgroundColor: `${category.color}20`, color: category.color }}
              >
                {category.name}
              </Badge>
            ) : (
              <div></div>
            )}
            
            <div className="text-xs text-white/40">
              {new Date(bookmark.createdAt).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
            </div>
          </div>
        </div>

        {/* 操作菜单 */}
        <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="h-6 w-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-white/20 backdrop-blur-sm border border-white/30"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-3 w-3 text-white" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleClick}>
                <ExternalLink className="mr-2 h-4 w-4" />
                打开链接
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCopyUrl}>
                <Copy className="mr-2 h-4 w-4" />
                复制链接
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                <Edit className="mr-2 h-4 w-4" />
                编辑
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                删除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <EditBookmarkDialog
        bookmark={bookmark}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
    </>
  )
}

export default BookmarkCard