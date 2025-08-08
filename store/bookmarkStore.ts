import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Bookmark, BookmarkStore } from '../types/bookmark'
import { adapterFactory } from '../lib/adapters'
import { toast } from 'sonner'



export const useBookmarkStore = create<BookmarkStore>()(
  persist(
    (set, get) => ({
      bookmarks: [],

      isLoading: false,
      dataSource: 'indexeddb',

      addBookmark: async (bookmarkData) => {
        try {
          set({ isLoading: true })
          const adapter = await adapterFactory.getAdapter()
          const newBookmark = await adapter.addBookmark(bookmarkData)
          
          set((state) => ({
            bookmarks: [...state.bookmarks, newBookmark],
            isLoading: false
          }))
          
          toast.success(`已添加 "${newBookmark.title}"`)
        } catch (error) {
          set({ isLoading: false })
          toast.error(`添加书签失败: ${error instanceof Error ? error.message : '未知错误'}`)
        }
      },

      updateBookmark: async (id, updates) => {
        try {
          set({ isLoading: true })
          const adapter = await adapterFactory.getAdapter()
          const updatedBookmark = await adapter.updateBookmark(id, updates)
          
          set((state) => ({
            bookmarks: state.bookmarks.map(bookmark =>
              bookmark.id === id ? updatedBookmark : bookmark
            ),
            isLoading: false
          }))
          
          toast.success(`已更新 "${updatedBookmark.title}"`)
        } catch (error) {
          set({ isLoading: false })
          toast.error(`更新书签失败: ${error instanceof Error ? error.message : '未知错误'}`)
        }
      },

      deleteBookmark: async (id) => {
        try {
          set({ isLoading: true })
          const adapter = await adapterFactory.getAdapter()
          await adapter.deleteBookmark(id)
          
          set((state) => ({
            bookmarks: state.bookmarks.filter(bookmark => bookmark.id !== id),
            isLoading: false
          }))
          
          toast.success('书签已删除')
        } catch (error) {
          set({ isLoading: false })
          toast.error(`删除书签失败: ${error instanceof Error ? error.message : '未知错误'}`)
        }
      },

      reorderBookmarks: async (sourceIndex, destinationIndex) => {
        try {
          const adapter = await adapterFactory.getAdapter()
          await adapter.reorderBookmarks(sourceIndex, destinationIndex)
          
          set((state) => {
            const newBookmarks = [...state.bookmarks]
            const [movedBookmark] = newBookmarks.splice(sourceIndex, 1)
            newBookmarks.splice(destinationIndex, 0, movedBookmark)
            return { bookmarks: newBookmarks }
          })
        } catch (error) {
          console.warn('重排序失败:', error)
          // 重排序失败不影响用户体验，只记录警告
        }
      },



      initializeBookmarks: async () => {
        try {
          set({ isLoading: true })
          const adapter = await adapterFactory.getAdapter()
          
          const bookmarks = await adapter.getBookmarks()
          
          set({
            bookmarks,
            isLoading: false
          })
        } catch (error) {
          set({ isLoading: false })
          console.error('初始化书签失败:', error)
          toast.error('初始化书签失败，请刷新页面重试')
        }
      },

      saveToStorage: async () => {
        // 数据通过适配器自动保存，这里不需要额外操作
        return Promise.resolve()
      },

      switchDataSource: async (type) => {
        try {
          set({ isLoading: true })
          const adapter = await adapterFactory.switchAdapter(type)
          
          const bookmarks = await adapter.getBookmarks()
          
          set({
            bookmarks,
            dataSource: type,
            isLoading: false
          })
          
          toast.success(`已切换到${type === 'browser' ? '浏览器书签' : '本地存储'}模式`)
        } catch (error) {
          set({ isLoading: false })
          toast.error(`切换数据源失败: ${error instanceof Error ? error.message : '未知错误'}`)
        }
      },

      moveBookmark: async (draggedId: string, sourcePath: string[], destPath: string[], sourceIndex: number, destIndex: number) => {
        try {
          set({ isLoading: true })
          
          // 深拷贝书签数组
          const newBookmarks = JSON.parse(JSON.stringify(get().bookmarks))
          
          // 查找并移除拖拽的项目
          const draggedItem = get().findBookmarkById(newBookmarks, draggedId)
          if (!draggedItem) {
            set({ isLoading: false })
            return
          }
          
          // 从源位置移除
          const sourceBookmarks = sourcePath.length === 0 ? newBookmarks : get().getBookmarksByPath(newBookmarks, sourcePath)
          if (sourceBookmarks) {
            sourceBookmarks.splice(sourceIndex, 1)
          }
          
          // 添加到目标位置
          const destBookmarks = destPath.length === 0 ? newBookmarks : get().getBookmarksByPath(newBookmarks, destPath)
          if (destBookmarks) {
            destBookmarks.splice(destIndex, 0, draggedItem)
          }
          
          // 更新状态
          set({ bookmarks: newBookmarks, isLoading: false })
          toast.success(`已移动 "${draggedItem.title}"`)
        } catch (error) {
          set({ isLoading: false })
          toast.error(`移动书签失败: ${error instanceof Error ? error.message : '未知错误'}`)
        }
      },

      // 根据ID查找书签
      findBookmarkById: (bookmarks: Bookmark[], id: string): Bookmark | null => {
        for (const bookmark of bookmarks) {
          if (bookmark.id === id) return bookmark
          if (bookmark.children) {
            const found = get().findBookmarkById(bookmark.children, id)
            if (found) return found
          }
        }
        return null
      },

      // 根据路径获取书签数组
      getBookmarksByPath: (bookmarks: Bookmark[], path: string[]): Bookmark[] | null => {
        if (path.length === 0) return bookmarks
        
        let current = bookmarks
        for (const id of path) {
          const bookmark = current.find(b => b.id === id)
          if (!bookmark || !bookmark.children) return null
          current = bookmark.children
        }
        return current
      },
    }),
    {
      name: 'smart-newtab-store',
      partialize: (state) => ({
        dataSource: state.dataSource
      })
    }
  )
)