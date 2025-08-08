
import { Bookmark } from '../../types/bookmark'
import { Folder } from 'lucide-react'
import { cn } from '../../lib/utils'

interface FolderSidebarProps {
  folders: Bookmark[]
  currentFolder: string | null
  onFolderSelect: (folderId: string | null) => void
}

export function FolderSidebar({ folders, currentFolder, onFolderSelect }: FolderSidebarProps) {
  // 构建文件夹树结构
  const buildFolderTree = (folders: Bookmark[]): Bookmark[] => {
    // 目前简单地返回所有文件夹，未来可以根据 parentId 构建树结构
    return folders.filter(f => f.isFolder)
  }

  const folderTree = buildFolderTree(folders)

  const renderFolderItem = (folder: Bookmark, level = 0) => {
    const isSelected = currentFolder === folder.id
    const hasChildren = folder.children && folder.children.length > 0

    return (
      <div key={folder.id}>
        <button
          onClick={() => onFolderSelect(folder.id)}
          className={cn(
            "w-full flex items-center space-x-2 px-3 py-2 text-left text-sm rounded-md transition-colors",
            "",
            isSelected && "bg-accent text-accent-foreground border-r border-primary",
            !isSelected && "text-muted-foreground"
          )}
          style={{ paddingLeft: `${12 + level * 16}px` }}
        >
          <Folder className="w-4 h-4 flex-shrink-0 text-primary" />
          <span className="truncate">{folder.title}</span>
          {hasChildren && (
            <span className="ml-auto text-xs text-muted-foreground">
              {folder.children!.length}
            </span>
          )}
        </button>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-foreground mb-4">文件夹</h2>
        
        {/* 文件夹树 */}
        <div className="space-y-1">
          {folderTree.map(folder => renderFolderItem(folder))}
        </div>
      </div>
    </div>
  )
}
