export interface Bookmark {
  id: string
  title: string
  url: string
  favicon?: string
  category?: string
  tags?: string[]
  createdAt: Date
  updatedAt: Date
  isFolder?: boolean
  children?: Bookmark[]
}

export interface BookmarkCategory {
  id: string
  name: string
  color: string
  icon?: string
}

// 数据源类型
export type DataSourceType = 'indexeddb' | 'browser'

// 数据适配器接口
export interface BookmarkDataAdapter {
  type: DataSourceType
  initialize(): Promise<void>
  getBookmarks(): Promise<Bookmark[]>
  getCategories(): Promise<BookmarkCategory[]>
  addBookmark(bookmark: Omit<Bookmark, 'id' | 'createdAt' | 'updatedAt'>): Promise<Bookmark>
  updateBookmark(id: string, updates: Partial<Bookmark>): Promise<Bookmark>
  deleteBookmark(id: string): Promise<void>
  reorderBookmarks(sourceIndex: number, destinationIndex: number): Promise<void>
  addCategory(category: Omit<BookmarkCategory, 'id'>): Promise<BookmarkCategory>
  updateCategory(id: string, updates: Partial<BookmarkCategory>): Promise<BookmarkCategory>
  deleteCategory(id: string): Promise<void>
  searchBookmarks(query: string): Promise<Bookmark[]>
  getBookmarksByCategory(categoryId: string): Promise<Bookmark[]>
}

export interface BookmarkStore {
  bookmarks: Bookmark[]
  categories: BookmarkCategory[]
  searchQuery: string
  selectedCategory: string | null
  isLoading: boolean
  dataSource: DataSourceType
  
  // Actions
  addBookmark: (bookmark: Omit<Bookmark, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateBookmark: (id: string, updates: Partial<Bookmark>) => void
  deleteBookmark: (id: string) => void
  reorderBookmarks: (sourceIndex: number, destinationIndex: number) => void
  setSearchQuery: (query: string) => void
  setSelectedCategory: (categoryId: string | null) => void
  addCategory: (category: Omit<BookmarkCategory, 'id'>) => void
  updateCategory: (id: string, updates: Partial<BookmarkCategory>) => void
  deleteCategory: (id: string) => void
  initializeBookmarks: () => Promise<void>
  saveToStorage: () => Promise<void>
  switchDataSource: (type: DataSourceType) => Promise<void>
}