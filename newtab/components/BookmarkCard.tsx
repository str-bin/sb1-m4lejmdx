import React, { useState } from 'react'
import { MoreVertical, Edit, Trash2, ExternalLink, Copy } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu'
import { Button } from '../../components/ui/button'

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
  const { deleteBookmark } = useBookmarkStore()
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
          className="glass rounded-xl p-4 cursor-pointer h-[80px] w-[400px] flex items-center flex-shrink-0"
        >
          {/* 左侧：网站图标 */}
          <div className="flex items-center flex-shrink-0">
            <div className="w-12 h-12 rounded-xl bg-muted/20 border border-border flex items-center justify-center overflow-hidden">
              <img
                src={faviconUrl}
                alt={bookmark.title}
                className="w-7 h-7"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiByeD0iNCIgZmlsbD0iIzY2NjY2NiIvPgo8dGV4dCB4PSIxMCIgeT0iMTQiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPj88L3RleHQ+Cjwvc3ZnPgo='
                }}
              />
            </div>
          </div>

          {/* 右侧：内容信息 */}
          <div className="flex-1 ml-3 min-w-0 flex flex-col justify-between h-full">
            {/* 顶部：标题和操作按钮 */}
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm text-foreground leading-tight line-clamp-1 mb-1">
                  {bookmark.title}
                </h3>
                <div className="text-xs text-muted-foreground truncate">
                  {new URL(bookmark.url).hostname}
                </div>
              </div>
              
              {/* 操作菜单 */}
              <div className="ml-2 flex-shrink-0">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-5 w-5 rounded-full border border-border"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-3 w-3" />
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

            {/* 底部：日期 */}
            <div className="flex items-center justify-end">
              <div className="text-xs text-muted-foreground/60">
                {new Date(bookmark.createdAt).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
              </div>
            </div>
          </div>
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