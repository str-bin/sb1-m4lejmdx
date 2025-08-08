export interface Bookmark {
  id: string
  title: string
  url: string
  favicon?: string
  createdAt: Date
  updatedAt: Date
  isFolder?: boolean
  children?: Bookmark[]
}



// 数据源类型
export type DataSourceType = 'indexeddb' | 'browser'

// 数据适配器接口
export interface BookmarkDataAdapter {
  type: DataSourceType
  initialize(): Promise<void>
  getBookmarks(): Promise<Bookmark[]>
  addBookmark(bookmark: Omit<Bookmark, 'id' | 'createdAt' | 'updatedAt'>): Promise<Bookmark>
  updateBookmark(id: string, updates: Partial<Bookmark>): Promise<Bookmark>
  deleteBookmark(id: string): Promise<void>
  reorderBookmarks(sourceIndex: number, destinationIndex: number): Promise<void>
  searchBookmarks(query: string): Promise<Bookmark[]>
}

export interface BookmarkStore {
  bookmarks: Bookmark[]
  isLoading: boolean
  dataSource: DataSourceType
  
  // Actions
  addBookmark: (bookmark: Omit<Bookmark, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateBookmark: (id: string, updates: Partial<Bookmark>) => void
  deleteBookmark: (id: string) => void
  reorderBookmarks: (sourceIndex: number, destinationIndex: number) => void
  moveBookmark: (draggedId: string, sourcePath: string[], destPath: string[], sourceIndex: number, destIndex: number) => void
  initializeBookmarks: () => Promise<void>
  saveToStorage: () => Promise<void>
  switchDataSource: (type: DataSourceType) => Promise<void>
  findBookmarkById: (bookmarks: Bookmark[], id: string) => Bookmark | null
  getBookmarksByPath: (bookmarks: Bookmark[], path: string[]) => Bookmark[] | null
}