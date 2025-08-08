import React from 'react'
import { Folder } from 'lucide-react'
import { Badge } from '../../components/ui/badge'
import { useBookmarkStore } from '../../store/bookmarkStore'
import type { Bookmark } from '../../types/bookmark'

import { Draggable } from 'react-beautiful-dnd'

interface FolderRowProps {
  folders: Bookmark[]
  level: number
  path?: string[]
  onFolderNavigate?: (folderId: string) => void
}

const FolderRow: React.FC<FolderRowProps> = ({ folders, level, onFolderNavigate }) => {
  const { categories } = useBookmarkStore()

  const handleFolderClick = (folder: Bookmark) => {
    if (onFolderNavigate) {
      onFolderNavigate(folder.id)
    }
  }

  if (folders.length === 0) return null

  return (
    <div className={`mb-4 ${level > 0 ? 'ml-4' : ''}`}>
      {/* 文件夹行和展开内容 */}
      <div className="space-y-3">
        {folders.map((folder, index) => {
          const category = categories.find(cat => cat.id === folder.category)
          const hasChildren = folder.children && folder.children.length > 0

          return (
            <Draggable key={folder.id} draggableId={folder.id} index={index}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  className={`transition-all duration-200 ${
                    snapshot.isDragging ? 'bookmark-dragging' : ''
                  }`}
                  style={{
                    ...provided.draggableProps.style,
                    position: snapshot.isDragging ? 'relative' : 'static',
                    zIndex: snapshot.isDragging ? 9999 : 'auto'
                  }}
                >
                  {/* 文件夹卡片 */}
                  <div
                    onClick={() => handleFolderClick(folder)}
                    className="group relative glass rounded-lg p-2 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl border border-white/20 backdrop-blur-sm min-w-48 flex-shrink-0 h-8 flex items-center"
                  >
                      {/* 文件夹图标和标题行 */}
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <div className="w-5 h-5 rounded-md bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center overflow-hidden flex-shrink-0">
                          <Folder className="w-3 h-3 text-white" />
                        </div>
                        <h4 className="font-semibold text-sm line-clamp-1 flex-1">
                          {folder.title}
                        </h4>
                      </div>

                      {/* 分类标签和项目数量 */}
                      <div className="flex items-center space-x-1 ml-2">
                        {category && (
                          <Badge
                            variant="secondary"
                            className="text-xs px-1 py-0.5 rounded-full"
                            style={{ backgroundColor: `${category.color}20`, color: category.color }}
                          >
                            {category.name}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {hasChildren ? `${folder.children!.length}` : '0'}
                        </span>
                      </div>

                      {/* 悬停指示器 */}
                      <div className="absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-white/20 transition-colors pointer-events-none" />
                    </div>
                </div>
              )}
            </Draggable>
          )
        })}
      </div>
    </div>
  )
}

export default FolderRow 