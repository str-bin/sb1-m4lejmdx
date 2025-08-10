import React, { useState } from 'react'
import { Folder, ChevronDown, ChevronRight, MoreVertical, Edit, Trash2 } from 'lucide-react'

import { Button } from '../../components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu'
import { useBookmarkStore } from '../../store/bookmarkStore'
import BookmarkCard from './BookmarkCard'
import type { Bookmark } from '../../types/bookmark'
import { toast } from 'sonner'
import EditBookmarkDialog from './EditBookmarkDialog'

interface FolderContainerProps {
  folder: Bookmark
  onFolderNavigate?: (folderId: string) => void
}

const FolderContainer: React.FC<FolderContainerProps> = ({ folder, onFolderNavigate }) => {
  const [isExpanded, setIsExpanded] = useState(true)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const { deleteBookmark } = useBookmarkStore()


  const hasChildren = folder.children && folder.children.length > 0
  const childBookmarks = folder.children?.filter(child => !child.isFolder) || []
  const childFolders = folder.children?.filter(child => child.isFolder) || []

  const handleFolderClick = () => {
    if (onFolderNavigate) {
      onFolderNavigate(folder.id)
    }
  }

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsExpanded(!isExpanded)
  }

  const handleDelete = () => {
    deleteBookmark(folder.id)
    toast.success(`已删除文件夹 "${folder.title}"`)
  }

  return (
    <>
      <div className="group relative">
        {/* 文件夹大框 */}
        <div className="glass rounded-xl border border-border backdrop-blur-sm overflow-hidden">
          {/* 文件夹头部 */}
          <div 
            className="p-2 border-b border-border cursor-pointer"
            onClick={handleFolderClick}
          >
            <div className="flex items-center space-x-2.5">
              {/* 展开/收缩按钮 */}
              <button
                onClick={handleToggle}
                className="p-0.5 rounded-md border border-border"
              >
                {isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                )}
              </button>

              {/* 文件夹图标 */}
              <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Folder className="w-4 h-4 text-primary" />
              </div>

              {/* 文件夹信息 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold text-sm text-foreground truncate">
                    {folder.title}
                  </h3>

                </div>
                <div className="text-xs text-muted-foreground">
                  {hasChildren ? `${folder.children!.length} 个项目` : '空文件夹'}
                </div>
              </div>

              {/* 操作菜单 */}
              <div>
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
          </div>

          {/* 文件夹内容区域 */}
          {isExpanded && hasChildren && (
            <div className="p-2 bg-muted/30">
              {/* 子文件夹 */}
              {childFolders.length > 0 && (
                <div className="mb-2">
                  <h4 className="text-sm font-medium text-muted-foreground mb-1.5">子文件夹</h4>
                  <div className="space-y-1">
                    {childFolders.map(childFolder => (
                      <div
                        key={childFolder.id}
                        onClick={() => onFolderNavigate?.(childFolder.id)}
                        className="flex items-center space-x-2 p-2 rounded-lg bg-muted/20 cursor-pointer border border-border"
                      >
                        <div className="w-5 h-5 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Folder className="w-3 h-3 text-primary" />
                        </div>
                        <span className="font-medium text-sm text-foreground truncate">
                          {childFolder.title}
                        </span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {childFolder.children?.length || 0} 项
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 子书签 */}
              {childBookmarks.length > 0 && (
                <div>
                  {childFolders.length > 0 && (
                    <h4 className="text-sm font-medium text-muted-foreground mb-1.5">书签</h4>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    {childBookmarks.map(bookmark => (
                      <div
                        key={bookmark.id}
                        className="w-full"
                      >
                        <BookmarkCard bookmark={bookmark} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 空状态 */}
          {isExpanded && !hasChildren && (
            <div className="p-4 text-center">
              <div className="text-muted-foreground/60 text-sm">
                这个文件夹是空的
              </div>
            </div>
          )}
        </div>
      </div>

      <EditBookmarkDialog
        bookmark={folder}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
    </>
  )
}

export default FolderContainer
