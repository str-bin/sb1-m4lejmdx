import type { Bookmark, BookmarkCategory, BookmarkDataAdapter } from '../../types/bookmark'
import { generateId } from '../utils'

const DB_NAME = 'SmartNewTabDB'
const DB_VERSION = 1
const BOOKMARKS_STORE = 'bookmarks'
const CATEGORIES_STORE = 'categories'

export class IndexedDBAdapter implements BookmarkDataAdapter {
  type = 'indexeddb' as const
  private db: IDBDatabase | null = null

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // 创建书签存储
        if (!db.objectStoreNames.contains(BOOKMARKS_STORE)) {
          const bookmarkStore = db.createObjectStore(BOOKMARKS_STORE, { keyPath: 'id' })
          bookmarkStore.createIndex('category', 'category', { unique: false })
          bookmarkStore.createIndex('createdAt', 'createdAt', { unique: false })
        }

        // 创建分类存储
        if (!db.objectStoreNames.contains(CATEGORIES_STORE)) {
          const categoryStore = db.createObjectStore(CATEGORIES_STORE, { keyPath: 'id' })
          categoryStore.createIndex('name', 'name', { unique: true })
        }
      }
    })
  }

  async getBookmarks(): Promise<Bookmark[]> {
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([BOOKMARKS_STORE], 'readonly')
      const store = transaction.objectStore(BOOKMARKS_STORE)
      const request = store.getAll()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const bookmarks = request.result.map((bookmark: any) => ({
          ...bookmark,
          createdAt: new Date(bookmark.createdAt),
          updatedAt: new Date(bookmark.updatedAt)
        }))
        resolve(bookmarks)
      }
    })
  }

  async getCategories(): Promise<BookmarkCategory[]> {
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([CATEGORIES_STORE], 'readonly')
      const store = transaction.objectStore(CATEGORIES_STORE)
      const request = store.getAll()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }

  async addBookmark(bookmarkData: Omit<Bookmark, 'id' | 'createdAt' | 'updatedAt'>): Promise<Bookmark> {
    if (!this.db) throw new Error('Database not initialized')

    const bookmark: Bookmark = {
      id: generateId(),
      ...bookmarkData,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([BOOKMARKS_STORE], 'readwrite')
      const store = transaction.objectStore(BOOKMARKS_STORE)
      const request = store.add(bookmark)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(bookmark)
    })
  }

  async updateBookmark(id: string, updates: Partial<Bookmark>): Promise<Bookmark> {
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([BOOKMARKS_STORE], 'readwrite')
      const store = transaction.objectStore(BOOKMARKS_STORE)
      const getRequest = store.get(id)

      getRequest.onerror = () => reject(getRequest.error)
      getRequest.onsuccess = () => {
        const bookmark = getRequest.result
        if (!bookmark) {
          reject(new Error('Bookmark not found'))
          return
        }

        const updatedBookmark = {
          ...bookmark,
          ...updates,
          updatedAt: new Date()
        }

        const putRequest = store.put(updatedBookmark)
        putRequest.onerror = () => reject(putRequest.error)
        putRequest.onsuccess = () => resolve(updatedBookmark)
      }
    })
  }

  async deleteBookmark(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([BOOKMARKS_STORE], 'readwrite')
      const store = transaction.objectStore(BOOKMARKS_STORE)
      const request = store.delete(id)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async reorderBookmarks(sourceIndex: number, destinationIndex: number): Promise<void> {
    const bookmarks = await this.getBookmarks()
    const [movedBookmark] = bookmarks.splice(sourceIndex, 1)
    bookmarks.splice(destinationIndex, 0, movedBookmark)

    // 更新所有书签的顺序
    const transaction = this.db!.transaction([BOOKMARKS_STORE], 'readwrite')
    const store = transaction.objectStore(BOOKMARKS_STORE)

    for (let i = 0; i < bookmarks.length; i++) {
      const bookmark = { ...bookmarks[i], order: i }
      store.put(bookmark)
    }

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    })
  }

  async addCategory(categoryData: Omit<BookmarkCategory, 'id'>): Promise<BookmarkCategory> {
    if (!this.db) throw new Error('Database not initialized')

    const category: BookmarkCategory = {
      id: generateId(),
      ...categoryData
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([CATEGORIES_STORE], 'readwrite')
      const store = transaction.objectStore(CATEGORIES_STORE)
      const request = store.add(category)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(category)
    })
  }

  async updateCategory(id: string, updates: Partial<BookmarkCategory>): Promise<BookmarkCategory> {
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([CATEGORIES_STORE], 'readwrite')
      const store = transaction.objectStore(CATEGORIES_STORE)
      const getRequest = store.get(id)

      getRequest.onerror = () => reject(getRequest.error)
      getRequest.onsuccess = () => {
        const category = getRequest.result
        if (!category) {
          reject(new Error('Category not found'))
          return
        }

        const updatedCategory = { ...category, ...updates }
        const putRequest = store.put(updatedCategory)
        putRequest.onerror = () => reject(putRequest.error)
        putRequest.onsuccess = () => resolve(updatedCategory)
      }
    })
  }

  async deleteCategory(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([CATEGORIES_STORE], 'readwrite')
      const store = transaction.objectStore(CATEGORIES_STORE)
      const request = store.delete(id)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async searchBookmarks(query: string): Promise<Bookmark[]> {
    const bookmarks = await this.getBookmarks()
    const lowerQuery = query.toLowerCase()

    return bookmarks.filter(bookmark => 
      bookmark.title.toLowerCase().includes(lowerQuery) ||
      bookmark.url.toLowerCase().includes(lowerQuery) ||
      bookmark.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    )
  }

  async getBookmarksByCategory(categoryId: string): Promise<Bookmark[]> {
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([BOOKMARKS_STORE], 'readonly')
      const store = transaction.objectStore(BOOKMARKS_STORE)
      const index = store.index('category')
      const request = index.getAll(categoryId)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const bookmarks = request.result.map((bookmark: any) => ({
          ...bookmark,
          createdAt: new Date(bookmark.createdAt),
          updatedAt: new Date(bookmark.updatedAt)
        }))
        resolve(bookmarks)
      }
    })
  }
} 