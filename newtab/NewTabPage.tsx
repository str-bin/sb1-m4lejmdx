import React, { useState, useEffect } from 'react'

import Header from './components/Header'
import BookmarkGrid from './components/BookmarkGrid'
import AddBookmarkDialog from './components/AddBookmarkDialog'
import { FolderSidebar } from './components/FolderSidebar'

import { useBookmarkStore } from '../store/bookmarkStore'

import { initializeTestData } from '../lib/init-test-data'


const NewTabPage: React.FC = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const [currentFolder, setCurrentFolder] = useState<string | null>(null)
  
  const {
    bookmarks,
    initializeBookmarks,
    addBookmark,
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

  // 获取顶层文件夹（只有根级别的文件夹）
  const getTopLevelFolders = (bookmarkList: any[]): any[] => {
    return bookmarkList.filter(bookmark => bookmark.isFolder)
  }

  // 自动选择第一个文件夹
  useEffect(() => {
    if (bookmarks.length > 0 && currentFolder === null) {
      const topLevelFolders = getTopLevelFolders(bookmarks)
      if (topLevelFolders.length > 0) {
        setCurrentFolder(topLevelFolders[0].id)
      }
    }
  }, [bookmarks, currentFolder])

  // 获取当前显示的书签
  const getCurrentBookmarks = () => {
    if (currentFolder === null) {
      return bookmarks
    }
    const folder = findBookmarkById(bookmarks, currentFolder)
    return folder?.children || []
  }

  // 处理文件夹导航
  const handleFolderNavigate = (folderId: string) => {
    setCurrentFolder(folderId)
  }

  // 处理文件夹选择（侧边栏）
  const handleFolderSelect = (folderId: string | null) => {
    setCurrentFolder(folderId)
  }

  return (
    <div className="h-screen overflow-hidden transition-all duration-300 bg-gradient-to-br from-background via-muted/30 to-background relative">
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-20 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl opacity-20 pointer-events-none" />
      {/* 顶部 Header */}
      <div className="border-b border-border relative z-10">
        <div className="px-6 py-4">
          <Header onAddBookmark={() => setIsAddDialogOpen(true)} />
        </div>
      </div>

      {/* 主体内容 - 左右布局 */}
      <div className="flex h-[calc(100vh-80px)] relative z-10">
        {/* 左侧文件夹边栏 */}
        <div className="w-64 border-r backdrop-blur-sm border-border bg-card/80">
                  <FolderSidebar
          folders={getTopLevelFolders(bookmarks)}
          currentFolder={currentFolder}
          onFolderSelect={handleFolderSelect}
        />
        </div>
        
        {/* 右侧主要内容区域 */}
        <div className="flex-1 overflow-hidden">
          <div className="p-6 h-full overflow-y-auto">
            {/* 书签网格 - 主体内容区域 */}
            <div className="h-full">
              <div className="min-h-full">
                <BookmarkGrid 
                  bookmarks={getCurrentBookmarks()} 
                  onFolderNavigate={handleFolderNavigate}
                />
              </div>
            </div>

            {/* 空状态 */}
            {getCurrentBookmarks().length === 0 && (
              <div className="text-center py-12">
                <div className="glass rounded-2xl p-8 inline-block">
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
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg border border-blue-600 text-sm"
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