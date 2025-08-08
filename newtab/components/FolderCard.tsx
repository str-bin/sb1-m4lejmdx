import React, { useState } from 'react'
import { ChevronRight, Folder, MoreVertical, Edit, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu'
import { Button } from '../../components/ui/button'

import { useBookmarkStore } from '../../store/bookmarkStore'
import type { Bookmark } from '../../types/bookmark'
import { toast } from 'sonner'
import EditBookmarkDialog from './EditBookmarkDialog'

interface FolderCardProps {
  folder: Bookmark
  level?: number
  onNavigate?: (folderId: string) => void
}

const FolderCard: React.FC<FolderCardProps> = ({ folder, level = 0, onNavigate }) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const { deleteBookmark } = useBookmarkStore()

  // 处理文件夹点击 - 导航到文件夹内部
  const handleFolderClick = () => {
    if (onNavigate) {
      onNavigate(folder.id)
    }
  }
  const hasChildren = folder.children && folder.children.length > 0

  // 调试信息
  console.log('Folder:', folder.title, 'hasChildren:', hasChildren, 'children:', folder.children)

  const handleDelete = () => {
    deleteBookmark(folder.id)
    toast.success(`已删除文件夹 "${folder.title}"`)
  }

  return (
    <div className={`folder-container relative ${level > 0 ? 'ml-4' : ''}`}>
      {/* 层级连接线 */}
      {level > 0 && (
        <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />
      )}
      
      <div className="group relative max-w-full" style={{ position: 'relative' }}>
        <div
          onClick={handleFolderClick}
          className="glass rounded-xl p-2 cursor-pointer h-8 flex items-center"
          style={{ 
            position: 'relative',
            visibility: 'visible',
            opacity: 1
          }}
        >
          {/* 文件夹图标 */}
          <div className="w-5 h-5 rounded-lg bg-primary/10 border border-primary flex items-center justify-center overflow-hidden folder-icon flex-shrink-0 mr-2">
            <Folder className="w-3 h-3 text-primary" />
          </div>

          {/* 标题和展开指示器 */}
          <div className="flex items-center justify-between flex-1 min-w-0">
            <h3 className="font-semibold text-sm line-clamp-1 flex-1">
              {folder.title}
            </h3>
            <div className="flex items-center space-x-1 ml-2">
              <span className="text-xs text-muted-foreground">
                {hasChildren ? `${folder.children!.length}` : '0'}
              </span>
              <ChevronRight className="w-3 h-3 text-muted-foreground" />
            </div>
          </div>

          {/* 悬停指示器 */}

        </div>

        {/* 操作菜单 */}
        <div className="absolute -top-1 -right-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="h-5 w-5 rounded-full border border-border"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-2.5 w-2.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                <Edit className="mr-2 h-4 w-4" />
                编辑文件夹
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                删除文件夹
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>



      <EditBookmarkDialog
        bookmark={folder}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
    </div>
  )
}

export default FolderCard 