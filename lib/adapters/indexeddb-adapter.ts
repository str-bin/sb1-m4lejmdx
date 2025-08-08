import type { Bookmark, BookmarkDataAdapter } from '../../types/bookmark'
import { generateId } from '../utils'

const DB_NAME = 'SmartNewTabDB'
const DB_VERSION = 1
const BOOKMARKS_STORE = 'bookmarks'


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
          bookmarkStore.createIndex('createdAt', 'createdAt', { unique: false })
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



  async searchBookmarks(query: string): Promise<Bookmark[]> {
    const bookmarks = await this.getBookmarks()
    const lowerQuery = query.toLowerCase()

    return bookmarks.filter(bookmark => 
      bookmark.title.toLowerCase().includes(lowerQuery) ||
      bookmark.url.toLowerCase().includes(lowerQuery)
    )
  }


} 