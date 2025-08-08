import React, { useState, useEffect } from 'react'
import { DragDropContext, DropResult } from 'react-beautiful-dnd'
import Header from './components/Header'
import BookmarkGrid from './components/BookmarkGrid'
import AddBookmarkDialog from './components/AddBookmarkDialog'
import { useBookmarkStore } from '../store/bookmarkStore'
import { useTheme } from 'next-themes'
import { initializeTestData } from '../lib/init-test-data'


const NewTabPage: React.FC = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [currentFolderPath, setCurrentFolderPath] = useState<string[]>([])
  const { theme } = useTheme()
  
  const {
    bookmarks,
    initializeBookmarks,
    addBookmark,
    moveBookmark,
    findBookmarkById,
    getBookmarksByPath,
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

  // 获取当前显示的书签
  const getCurrentBookmarks = () => {
    if (currentFolderPath.length === 0) {
      return bookmarks
    }
    return getBookmarksByPath(bookmarks, currentFolderPath) || []
  }

  // 获取面包屑数据
  const getBreadcrumbs = () => {
    const breadcrumbs = [{ id: '', name: '首页', path: [] }]
    
    let currentPath: string[] = []
    for (const folderId of currentFolderPath) {
      currentPath = [...currentPath, folderId]
      const folder = findBookmarkById(bookmarks, folderId)
      if (folder) {
        breadcrumbs.push({
          id: folderId,
          name: folder.title,
          path: [...currentPath] as string[]
        })
      }
    }
    
    return breadcrumbs
  }

  // 处理文件夹导航
  const handleFolderNavigate = (folderId: string) => {
    setCurrentFolderPath([...currentFolderPath, folderId])
  }

  // 处理面包屑导航
  const handleBreadcrumbClick = (path: string[]) => {
    setCurrentFolderPath(path)
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
      <div className="container mx-auto px-6 py-4 max-w-full">
        {/* 顶部区域 */}
        <div className="mb-4">
          <Header onAddBookmark={() => setIsAddDialogOpen(true)} />
        </div>

        {/* 面包屑导航 */}
        {currentFolderPath.length > 0 && (
          <div className="mb-4">
            <nav className="flex items-center space-x-2 text-sm text-muted-foreground glass rounded-lg p-3">
              {getBreadcrumbs().map((breadcrumb, index) => (
                <div key={breadcrumb.id || 'root'} className="flex items-center">
                  {index > 0 && <span className="mx-2">/</span>}
                  <button
                    onClick={() => handleBreadcrumbClick(breadcrumb.path)}
                    className={`hover:text-foreground transition-colors ${
                      index === getBreadcrumbs().length - 1 
                        ? 'text-foreground font-medium' 
                        : 'hover:underline'
                    }`}
                  >
                    {breadcrumb.name}
                  </button>
                </div>
              ))}
            </nav>
          </div>
        )}

        {/* 书签网格 - 主体内容区域 */}
        <div>
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="transition-all duration-200 rounded-2xl p-8 shadow-xl glass">
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
              <h3 className="text-lg font-semibold mb-2">
                {currentFolderPath.length > 0 ? '此文件夹为空' : '还没有书签或文件夹'}
              </h3>
              <p className="text-muted-foreground mb-4 text-sm">
                {currentFolderPath.length > 0 
                  ? '这个文件夹中还没有任何内容'
                  : '点击右上角的 + 按钮添加您的第一个书签或文件夹'
                }
              </p>
              <button
                onClick={() => setIsAddDialogOpen(true)}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:scale-105 transition-transform text-sm"
              >
                添加项目
              </button>
            </div>
          </div>
        )}
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