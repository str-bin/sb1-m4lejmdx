import React from 'react'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '../../lib/utils'

interface BreadcrumbProps {
  folderPath: string[]
  onNavigate: (folderId: string | null) => void
  folders: any[]
}

export function Breadcrumb({ folderPath, onNavigate, folders }: BreadcrumbProps) {
  const getFolderById = (folderId: string) => {
    return folders.find(f => f.id === folderId)
  }

  const getFolderIdByName = (name: string) => {
    const folder = folders.find(f => f.title === name)
    return folder?.id || null
  }

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
      {/* 主页 */}
      <button
        onClick={() => onNavigate(null)}
        className={cn(
          "flex items-center space-x-1 hover:text-blue-600 transition-colors",
          folderPath.length === 0 && "text-blue-600 font-medium"
        )}
      >
        <Home className="w-4 h-4" />
        <span>主页</span>
      </button>

      {/* 文件夹路径 */}
      {folderPath.map((folderName, index) => {
        const isLast = index === folderPath.length - 1
        const folderId = getFolderIdByName(folderName)
        
        return (
          <React.Fragment key={index}>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            
            {isLast ? (
              <span className="text-gray-900 font-medium">{folderName}</span>
            ) : (
              <button
                onClick={() => onNavigate(folderId)}
                className="hover:text-blue-600 transition-colors"
              >
                {folderName}
              </button>
            )}
          </React.Fragment>
        )
      })}
    </nav>
  )
}
