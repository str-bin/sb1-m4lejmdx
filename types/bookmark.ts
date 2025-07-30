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

export interface BookmarkStore {
  bookmarks: Bookmark[]
  categories: BookmarkCategory[]
  searchQuery: string
  selectedCategory: string | null
  isLoading: boolean
  
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
}