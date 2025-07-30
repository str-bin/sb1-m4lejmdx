import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Bookmark, BookmarkCategory, BookmarkStore, DataSourceType } from '../types/bookmark'
import { adapterFactory } from '../lib/adapters'
import { toast } from 'sonner'

const defaultCategories: BookmarkCategory[] = [
  { id: '1', name: '常用', color: '#3b82f6', icon: 'Star' },
  { id: '2', name: '工作', color: '#ef4444', icon: 'Briefcase' },
  { id: '3', name: '学习', color: '#10b981', icon: 'BookOpen' },
  { id: '4', name: '娱乐', color: '#f59e0b', icon: 'GamepadIcon' },
  { id: '5', name: '工具', color: '#8b5cf6', icon: 'Wrench' },
]

export const useBookmarkStore = create<BookmarkStore>()(
  persist(
    (set, get) => ({
      bookmarks: [],
      categories: defaultCategories,
      searchQuery: '',
      selectedCategory: null,
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

      setSearchQuery: (query) => {
        set({ searchQuery: query })
      },

      setSelectedCategory: (categoryId) => {
        set({ selectedCategory: categoryId })
      },

      addCategory: async (categoryData) => {
        try {
          set({ isLoading: true })
          const adapter = await adapterFactory.getAdapter()
          const newCategory = await adapter.addCategory(categoryData)
          
          set((state) => ({
            categories: [...state.categories, newCategory],
            isLoading: false
          }))
          
          toast.success(`已添加分类 "${newCategory.name}"`)
        } catch (error) {
          set({ isLoading: false })
          toast.error(`添加分类失败: ${error instanceof Error ? error.message : '未知错误'}`)
        }
      },

      updateCategory: async (id, updates) => {
        try {
          set({ isLoading: true })
          const adapter = await adapterFactory.getAdapter()
          const updatedCategory = await adapter.updateCategory(id, updates)
          
          set((state) => ({
            categories: state.categories.map(category =>
              category.id === id ? updatedCategory : category
            ),
            isLoading: false
          }))
          
          toast.success(`已更新分类 "${updatedCategory.name}"`)
        } catch (error) {
          set({ isLoading: false })
          toast.error(`更新分类失败: ${error instanceof Error ? error.message : '未知错误'}`)
        }
      },

      deleteCategory: async (id) => {
        try {
          set({ isLoading: true })
          const adapter = await adapterFactory.getAdapter()
          await adapter.deleteCategory(id)
          
          set((state) => ({
            categories: state.categories.filter(category => category.id !== id),
            isLoading: false
          }))
          
          toast.success('分类已删除')
        } catch (error) {
          set({ isLoading: false })
          toast.error(`删除分类失败: ${error instanceof Error ? error.message : '未知错误'}`)
        }
      },

      initializeBookmarks: async () => {
        try {
          set({ isLoading: true })
          const adapter = await adapterFactory.getAdapter()
          
          const [bookmarks, categories] = await Promise.all([
            adapter.getBookmarks(),
            adapter.getCategories()
          ])
          
          set({
            bookmarks,
            categories: categories.length > 0 ? categories : defaultCategories,
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
          
          const [bookmarks, categories] = await Promise.all([
            adapter.getBookmarks(),
            adapter.getCategories()
          ])
          
          set({
            bookmarks,
            categories: categories.length > 0 ? categories : defaultCategories,
            dataSource: type,
            isLoading: false
          })
          
          toast.success(`已切换到${type === 'browser' ? '浏览器书签' : '本地存储'}模式`)
        } catch (error) {
          set({ isLoading: false })
          toast.error(`切换数据源失败: ${error instanceof Error ? error.message : '未知错误'}`)
        }
      }
    }),
    {
      name: 'smart-newtab-store',
      partialize: (state) => ({
        searchQuery: state.searchQuery,
        selectedCategory: state.selectedCategory,
        dataSource: state.dataSource
      })
    }
  )
)