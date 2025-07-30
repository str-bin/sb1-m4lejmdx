import { IndexedDBAdapter } from './indexeddb-adapter'
import { BrowserAdapter } from './browser-adapter'
import type { BookmarkDataAdapter, DataSourceType } from '../../types/bookmark'
import { getRecommendedDataSource, isBrowserExtension } from '../utils'

class AdapterFactory {
  private static instance: AdapterFactory
  private currentAdapter: BookmarkDataAdapter | null = null

  private constructor() {}

  static getInstance(): AdapterFactory {
    if (!AdapterFactory.instance) {
      AdapterFactory.instance = new AdapterFactory()
    }
    return AdapterFactory.instance
  }

  async getAdapter(type?: DataSourceType): Promise<BookmarkDataAdapter> {
    const dataSourceType = type || getRecommendedDataSource()

    if (this.currentAdapter && this.currentAdapter.type === dataSourceType) {
      return this.currentAdapter
    }

    let adapter: BookmarkDataAdapter

    switch (dataSourceType) {
      case 'indexeddb':
        adapter = new IndexedDBAdapter()
        break
      case 'browser':
        if (!isBrowserExtension()) {
          throw new Error('Browser adapter requires browser extension environment')
        }
        adapter = new BrowserAdapter()
        break
      default:
        throw new Error(`Unsupported data source type: ${dataSourceType}`)
    }

    await adapter.initialize()
    this.currentAdapter = adapter
    return adapter
  }

  async switchAdapter(type: DataSourceType): Promise<BookmarkDataAdapter> {
    this.currentAdapter = null
    return this.getAdapter(type)
  }

  getCurrentAdapter(): BookmarkDataAdapter | null {
    return this.currentAdapter
  }
}

export const adapterFactory = AdapterFactory.getInstance() 