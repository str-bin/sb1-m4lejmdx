
import { Bookmark } from '../../types/bookmark'
import { Folder, Home } from 'lucide-react'
import { cn } from '../../lib/utils'

interface FolderSidebarProps {
  folders: Bookmark[]
  currentFolder: string | null
  onFolderSelect: (folderId: string | null) => void
}

export function FolderSidebar({ folders, currentFolder, onFolderSelect }: FolderSidebarProps) {
  // 构建文件夹树结构
  const buildFolderTree = (folders: Bookmark[]): Bookmark[] => {
    const folderMap = new Map<string, Bookmark & { children: Bookmark[] }>()
    const rootFolders: (Bookmark & { children: Bookmark[] })[] = []

    // 初始化所有文件夹
    folders.forEach(folder => {
      folderMap.set(folder.id, { ...folder, children: [] })
    })

    // 构建树结构
    folders.forEach(folder => {
      const folderWithChildren = folderMap.get(folder.id)!
      if (folder.parentId && folderMap.has(folder.parentId)) {
        const parent = folderMap.get(folder.parentId)!
        parent.children.push(folderWithChildren)
      } else {
        rootFolders.push(folderWithChildren)
      }
    })

    return rootFolders
  }

  const folderTree = buildFolderTree(folders)

  const renderFolderItem = (folder: Bookmark & { children?: Bookmark[] }, level = 0) => {
    const isSelected = currentFolder === folder.id
    const hasChildren = folder.children && folder.children.length > 0

    return (
      <div key={folder.id}>
        <button
          onClick={() => onFolderSelect(folder.id)}
          className={cn(
            "w-full flex items-center space-x-2 px-3 py-2 text-left text-sm rounded-md transition-colors",
            "hover:bg-gray-100",
            isSelected && "bg-blue-50 text-blue-700 border-r-2 border-blue-600",
            !isSelected && "text-gray-700"
          )}
          style={{ paddingLeft: `${12 + level * 16}px` }}
        >
          <Folder className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{folder.title}</span>
        </button>
        
        {hasChildren && folder.children!.map(child => 
          renderFolderItem(child, level + 1)
        )}
      </div>
    )
  }

  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen overflow-y-auto">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">文件夹</h2>
        
        {/* 根目录 */}
        <button
          onClick={() => onFolderSelect(null)}
          className={cn(
            "w-full flex items-center space-x-2 px-3 py-2 text-left text-sm rounded-md transition-colors mb-2",
            "hover:bg-gray-100",
            currentFolder === null && "bg-blue-50 text-blue-700 border-r-2 border-blue-600",
            currentFolder !== null && "text-gray-700"
          )}
        >
          <Home className="w-4 h-4 flex-shrink-0" />
          <span>主页</span>
        </button>

        {/* 文件夹树 */}
        <div className="space-y-1">
          {folderTree.map(folder => renderFolderItem(folder))}
        </div>
      </div>
    </div>
  )
}
