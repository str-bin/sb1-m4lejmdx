import React, { useState } from 'react'
import { Folder, ChevronDown, ChevronRight, MoreVertical, Edit, Trash2 } from 'lucide-react'
import { Badge } from '../../components/ui/badge'
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
  const { deleteBookmark, categories } = useBookmarkStore()

  const category = categories.find(cat => cat.id === folder.category)
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
        <div className="glass rounded-lg border border-white/20 backdrop-blur-sm overflow-hidden">
          {/* 文件夹头部 */}
          <div 
            className="p-3 border-b border-white/10 cursor-pointer hover:bg-white/5 transition-colors"
            onClick={handleFolderClick}
          >
            <div className="flex items-center space-x-2.5">
              {/* 展开/收缩按钮 */}
              <button
                onClick={handleToggle}
                className="p-0.5 rounded-md hover:bg-white/10 transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5 text-white/80" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-white/80" />
                )}
              </button>

              {/* 文件夹图标 */}
              <div className="w-8 h-8 rounded-md bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                <Folder className="w-5 h-5 text-white" />
              </div>

              {/* 文件夹信息 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-0.5">
                  <h3 className="font-semibold text-base text-white truncate">
                    {folder.title}
                  </h3>
                  {category && (
                    <Badge
                      variant="secondary"
                      className="text-xs px-1.5 py-0.5 rounded-full"
                      style={{ backgroundColor: `${category.color}20`, color: category.color }}
                    >
                      {category.name}
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-white/60">
                  {hasChildren ? `${folder.children!.length} 个项目` : '空文件夹'}
                </div>
              </div>

              {/* 操作菜单 */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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
            <div className="p-3 bg-white/5">
              {/* 子文件夹 */}
              {childFolders.length > 0 && (
                <div className="mb-3">
                  <h4 className="text-sm font-medium text-white/80 mb-2">子文件夹</h4>
                  <div className="space-y-1.5">
                    {childFolders.map(childFolder => (
                      <div
                        key={childFolder.id}
                        onClick={() => onFolderNavigate?.(childFolder.id)}
                        className="flex items-center space-x-2.5 p-2.5 rounded-md bg-white/10 hover:bg-white/20 cursor-pointer transition-colors"
                      >
                        <div className="w-5 h-5 rounded-sm bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                          <Folder className="w-3 h-3 text-white" />
                        </div>
                        <span className="font-medium text-sm text-white truncate">
                          {childFolder.title}
                        </span>
                        <span className="text-xs text-white/60 ml-auto">
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
                    <h4 className="text-sm font-medium text-white/80 mb-2">书签</h4>
                  )}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {childBookmarks.map(bookmark => (
                      <BookmarkCard key={bookmark.id} bookmark={bookmark} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 空状态 */}
          {isExpanded && !hasChildren && (
            <div className="p-6 text-center">
              <div className="text-white/40 text-sm">
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
