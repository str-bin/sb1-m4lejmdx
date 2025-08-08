import React from 'react'
import { Folder } from 'lucide-react'

import { useBookmarkStore } from '../../store/bookmarkStore'
import type { Bookmark } from '../../types/bookmark'



interface FolderRowProps {
  folders: Bookmark[]
  level: number
  onFolderNavigate?: (folderId: string) => void
}

const FolderRow: React.FC<FolderRowProps> = ({ folders, level, onFolderNavigate }) => {
  const {} = useBookmarkStore()

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
        {folders.map((folder) => {
      
          const hasChildren = folder.children && folder.children.length > 0

          return (
            <div key={folder.id}>
              {/* 文件夹卡片 */}
              <div
                onClick={() => handleFolderClick(folder)}
                className="group relative glass rounded-xl p-2 cursor-pointer min-w-48 flex-shrink-0 h-8 flex items-center"
              >
                  {/* 文件夹图标和标题行 */}
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <div className="w-5 h-5 rounded-lg bg-primary/10 border border-primary flex items-center justify-center overflow-hidden flex-shrink-0">
                      <Folder className="w-3 h-3 text-primary" />
                    </div>
                    <h4 className="font-semibold text-sm line-clamp-1 flex-1">
                      {folder.title}
                    </h4>
                  </div>

                  {/* 分类标签和项目数量 */}
                  <div className="flex items-center space-x-1 ml-2">

                    <span className="text-xs text-muted-foreground">
                      {hasChildren ? `${folder.children!.length}` : '0'}
                    </span>
                  </div>

                  {/* 悬停指示器 */}

                </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default FolderRow 