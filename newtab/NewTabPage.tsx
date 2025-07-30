import React, { useState, useEffect } from 'react'
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd'
import Header from './components/Header'
import SearchBar from './components/SearchBar'
import CategoryFilter from './components/CategoryFilter'
import BookmarkGrid from './components/BookmarkGrid'
import AddBookmarkDialog from './components/AddBookmarkDialog'
import { useBookmarkStore } from '../store/bookmarkStore'
import { useTheme } from 'next-themes'

const NewTabPage: React.FC = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const { theme } = useTheme()
  
  const {
    bookmarks,
    searchQuery,
    selectedCategory,
    reorderBookmarks,
    initializeBookmarks,
  } = useBookmarkStore()

  // 初始化数据
  useEffect(() => {
    initializeBookmarks()
  }, [initializeBookmarks])

  // 过滤书签
  const filteredBookmarks = bookmarks.filter(bookmark => {
    const matchesSearch = bookmark.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         bookmark.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         bookmark.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = !selectedCategory || bookmark.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return
    
    const sourceIndex = result.source.index
    const destinationIndex = result.destination.index
    
    reorderBookmarks(sourceIndex, destinationIndex)
  }

  return (
    <div className={`min-h-screen transition-all duration-300 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    }`}>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* 顶部区域 */}
        <div className="space-y-8">
          <Header onAddBookmark={() => setIsAddDialogOpen(true)} />
          
          <div className="glass rounded-3xl p-8 shadow-2xl">
            <SearchBar />
            <div className="mt-6">
              <CategoryFilter />
            </div>
          </div>
        </div>

        {/* 书签网格 */}
        <div className="mt-12">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="bookmarks">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`transition-all duration-200 rounded-2xl p-4 ${
                    snapshot.isDraggingOver ? 'bookmark-drop-zone' : ''
                  }`}
                >
                  <BookmarkGrid bookmarks={filteredBookmarks} />
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        {/* 空状态 */}
        {filteredBookmarks.length === 0 && (
          <div className="text-center py-20">
            <div className="glass rounded-2xl p-12 inline-block">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold mb-2">
                {searchQuery || selectedCategory ? '未找到匹配的书签' : '还没有书签'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery || selectedCategory 
                  ? '尝试更改搜索条件或选择其他分类' 
                  : '点击右上角的 + 按钮添加您的第一个书签'
                }
              </p>
              {!searchQuery && !selectedCategory && (
                <button
                  onClick={() => setIsAddDialogOpen(true)}
                  className="bg-primary text-primary-foreground px-6 py-3 rounded-xl hover:scale-105 transition-transform"
                >
                  添加书签
                </button>
              )}
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