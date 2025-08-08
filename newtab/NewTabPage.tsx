import React, { useState, useEffect } from 'react'
import { DragDropContext, DropResult } from 'react-beautiful-dnd'
import Header from './components/Header'
import BookmarkGrid from './components/BookmarkGrid'
import AddBookmarkDialog from './components/AddBookmarkDialog'
import { FolderSidebar } from './components/FolderSidebar'
import { Breadcrumb } from './components/Breadcrumb'
import { useBookmarkStore } from '../store/bookmarkStore'
import { useTheme } from 'next-themes'
import { initializeTestData } from '../lib/init-test-data'


const NewTabPage: React.FC = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [currentFolderPath, setCurrentFolderPath] = useState<string[]>([])
  const [currentFolder, setCurrentFolder] = useState<string | null>(null)
  const { theme } = useTheme()
  
  const {
    bookmarks,
    initializeBookmarks,
    addBookmark,
    moveBookmark,
    findBookmarkById,
  } = useBookmarkStore()

  // 初始化数据
  useEffect(() => {
    initializeBookmarks()
  }, [initializeBookmarks])

  // 开发环境下暴露 store 到全局，方便测试
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      (window as any).useBookmarkStore = useBookmarkStore;
    }
  }, [])

  // 开发环境下初始化测试数据
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && bookmarks.length === 0) {
      // 延迟初始化，确保 store 已经准备好
      const timer = setTimeout(() => {
        initializeTestData(addBookmark)
      }, 1000)
      
      return () => clearTimeout(timer)
    }
  }, [bookmarks.length, addBookmark])

  // 获取所有文件夹
  const getAllFolders = (bookmarkList: any[]): any[] => {
    let folders: any[] = []
    for (const bookmark of bookmarkList) {
      if (bookmark.isFolder) {
        folders.push(bookmark)
        if (bookmark.children) {
          folders = folders.concat(getAllFolders(bookmark.children))
        }
      }
    }
    return folders
  }

  // 获取当前显示的书签
  const getCurrentBookmarks = () => {
    if (currentFolder === null) {
      return bookmarks
    }
    const folder = findBookmarkById(bookmarks, currentFolder)
    return folder?.children || []
  }

  // 获取当前文件夹的路径
  const getCurrentFolderPath = (): string[] => {
    if (currentFolder === null) return []
    
    const buildPath = (folderId: string): string[] => {
      const folder = findBookmarkById(bookmarks, folderId)
      if (!folder) return []
      
      const path = [folder.title]
      // 这里假设未来会添加 parentId 字段，目前先返回单层路径
      return path
    }
    
    return buildPath(currentFolder)
  }



  // 处理文件夹导航
  const handleFolderNavigate = (folderId: string) => {
    setCurrentFolderPath([...currentFolderPath, folderId])
  }

  // 处理文件夹选择（侧边栏）
  const handleFolderSelect = (folderId: string | null) => {
    setCurrentFolder(folderId)
  }

  // 处理面包屑导航
  const handleBreadcrumbClick = (folderId: string | null) => {
    setCurrentFolder(folderId)
  }

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return
    
    const { source, destination, draggableId } = result
    
    // 如果拖拽到同一个位置，不做任何操作
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return
    }
    
    // 解析拖拽路径
    const sourcePath = source.droppableId === 'droppable-root' ? [] : source.droppableId.split('-').slice(1)
    const destPath = destination.droppableId === 'droppable-root' ? [] : destination.droppableId.split('-').slice(1)
    
    // 执行移动操作
    moveBookmark(draggableId, sourcePath, destPath, source.index, destination.index)
  }

  return (
    <div className={`min-h-screen transition-all duration-300 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    }`}>
      {/* 顶部 Header */}
      <div className="border-b border-white/20">
        <div className="px-6 py-4">
          <Header onAddBookmark={() => setIsAddDialogOpen(true)} />
        </div>
      </div>

      {/* 主体内容 - 左右布局 */}
      <div className="flex min-h-[calc(100vh-80px)]">
        {/* 左侧文件夹边栏 */}
        <div className="w-64 border-r border-white/20 bg-white/10 backdrop-blur-sm">
          <FolderSidebar
            folders={getAllFolders(bookmarks)}
            currentFolder={currentFolder}
            onFolderSelect={handleFolderSelect}
          />
        </div>
        
        {/* 右侧主要内容区域 */}
        <div className="flex-1 overflow-hidden">
          <div className="p-6 h-full">
            {/* 面包屑导航 */}
            <Breadcrumb
              folderPath={getCurrentFolderPath()}
              onNavigate={handleBreadcrumbClick}
              folders={getAllFolders(bookmarks)}
            />

            {/* 书签网格 - 主体内容区域 */}
            <div className="h-[calc(100vh-200px)] overflow-y-auto">
              <DragDropContext onDragEnd={handleDragEnd}>
                <div className="min-h-full">
                  <BookmarkGrid 
                    bookmarks={getCurrentBookmarks()} 
                    onFolderNavigate={handleFolderNavigate}
                  />
                </div>
              </DragDropContext>
            </div>

            {/* 空状态 */}
            {getCurrentBookmarks().length === 0 && (
              <div className="text-center py-12">
                <div className="glass rounded-2xl p-8 inline-block shadow-lg">
                  <div className="text-4xl mb-3">📚</div>
                  <h3 className="text-lg font-semibold mb-2 text-white">
                    {currentFolder ? '此文件夹为空' : '还没有书签或文件夹'}
                  </h3>
                  <p className="text-white/60 mb-4 text-sm">
                    {currentFolder 
                      ? '这个文件夹中还没有任何内容'
                      : '点击右上角的 + 按钮添加您的第一个书签或文件夹'
                    }
                  </p>
                  <button
                    onClick={() => setIsAddDialogOpen(true)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg hover:scale-105 transition-all text-sm"
                  >
                    添加项目
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 添加书签对话框 */}
      <AddBookmarkDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />
    </div>
  )
}

export default NewTabPage