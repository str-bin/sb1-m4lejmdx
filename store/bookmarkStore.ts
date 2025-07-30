import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Bookmark, BookmarkCategory, BookmarkStore } from '~types/bookmark'
import { generateId } from '~lib/utils'

const defaultCategories: BookmarkCategory[] = [
  { id: '1', name: '常用', color: '#3b82f6', icon: 'Star' },
  { id: '2', name: '工作', color: '#ef4444', icon: 'Briefcase' },
  { id: '3', name: '学习', color: '#10b981', icon: 'BookOpen' },
  { id: '4', name: '娱乐', color: '#f59e0b', icon: 'GamepadIcon' },
  { id: '5', name: '工具', color: '#8b5cf6', icon: 'Wrench' },
]

const defaultBookmarks: Bookmark[] = [
  {
    id: '1',
    title: 'GitHub',
    url: 'https://github.com',
    category: '1',
    tags: ['开发', '代码'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    title: 'Stack Overflow',
    url: 'https://stackoverflow.com',
    category: '2',
    tags: ['编程', '问答'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    title: 'MDN Web Docs',
    url: 'https://developer.mozilla.org',
    category: '3',
    tags: ['文档', 'Web开发'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    title: 'YouTube',
    url: 'https://youtube.com',
    category: '4',
    tags: ['视频', '娱乐'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '5',
    title: 'Figma',
    url: 'https://figma.com',
    category: '5',
    tags: ['设计', '工具'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '6',
    title: 'Twitter',
    url: 'https://twitter.com',
    category: '4',
    tags: ['社交', '资讯'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

export const useBookmarkStore = create<BookmarkStore>()(
  persist(
    (set, get) => ({
      bookmarks: [],
      categories: defaultCategories,
      searchQuery: '',
      selectedCategory: null,
      isLoading: false,

      addBookmark: (bookmarkData) => {
        const newBookmark: Bookmark = {
          id: generateId(),
          ...bookmarkData,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        set((state) => ({
          bookmarks: [...state.bookmarks, newBookmark],
        }))
        get().saveToStorage()
      },

      updateBookmark: (id, updates) => {
        set((state) => ({
          bookmarks: state.bookmarks.map(bookmark =>
            bookmark.id === id
              ? { ...bookmark, ...updates, updatedAt: new Date() }
              : bookmark
          ),
        }))
        get().saveToStorage()
      },

      deleteBookmark: (id) => {
        set((state) => ({
          bookmarks: state.bookmarks.filter(bookmark => bookmark.id !== id),
        }))
        get().saveToStorage()
      },

      reorderBookmarks: (sourceIndex, destinationIndex) => {
        set((state) => {
          const newBookmarksArray = Array.from(state.bookmarks)
          const [removed] = newBookmarksArray.splice(sourceIndex, 1)
          newBookmarksArray.splice(destinationIndex, 0, removed)
          return { bookmarks: newBookmarksArray }
        })
        get().saveToStorage()
      },

      setSearchQuery: (query) => {
        set({ searchQuery: query })
      },

      setSelectedCategory: (categoryId) => {
        set({ selectedCategory: categoryId })
      },

      addCategory: (categoryData) => {
        const newCategory: BookmarkCategory = {
          id: generateId(),
          ...categoryData,
        }
        set((state) => ({
          categories: [...state.categories, newCategory],
        }))
        get().saveToStorage()
      },

      updateCategory: (id, updates) => {
        set((state) => ({
          categories: state.categories.map(category =>
            category.id === id ? { ...category, ...updates } : category
          ),
        }))
        get().saveToStorage()
      },

      deleteCategory: (id) => {
        set((state) => ({
          categories: state.categories.filter(category => category.id !== id),
          bookmarks: state.bookmarks.map(bookmark =>
            bookmark.category === id ? { ...bookmark, category: undefined } : bookmark
          ),
        }))
        get().saveToStorage()
      },

      initializeBookmarks: async () => {
        set({ isLoading: true })
        
        // 如果没有书签数据，使用默认数据
        const { bookmarks } = get()
        if (bookmarks.length === 0) {
          set({ bookmarks: defaultBookmarks })
        }
        
        set({ isLoading: false })
      },

      saveToStorage: async () => {
        // Zustand persist 中间件会自动处理存储
      },
    }),
    {
      name: 'bookmark-storage',
      version: 1,
    }
  )
)