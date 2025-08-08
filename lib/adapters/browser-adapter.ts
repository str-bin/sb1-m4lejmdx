import type {
  Bookmark,
  BookmarkDataAdapter,
} from "../../types/bookmark";


export class BrowserAdapter implements BookmarkDataAdapter {
  type = "browser" as const;

  async initialize(): Promise<void> {
    // 浏览器适配器不需要特殊初始化
    return Promise.resolve();
  }

  async getBookmarks(): Promise<Bookmark[]> {
    if (typeof chrome === "undefined" || !chrome.bookmarks) {
      throw new Error("Chrome bookmarks API not available");
    }

    return new Promise((resolve, reject) => {
      chrome.bookmarks.getTree((bookmarkTreeNodes) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }

        const bookmarks: Bookmark[] = [];
        this.extractBookmarks(bookmarkTreeNodes, bookmarks);
        
        // 清理空文件夹和不必要的层级
        const cleanedBookmarks = this.cleanBookmarks(bookmarks);
        resolve(cleanedBookmarks);
      });
    });
  }

  private cleanBookmarks(bookmarks: Bookmark[]): Bookmark[] {
    return bookmarks.filter(bookmark => {
      if (bookmark.isFolder) {
        // 递归清理子项目
        if (bookmark.children) {
          bookmark.children = this.cleanBookmarks(bookmark.children);
        }
        // 只保留有子项目的文件夹
        return bookmark.children && bookmark.children.length > 0;
      }
      return true; // 保留所有书签
    });
  }

  private extractBookmarks(
    nodes: chrome.bookmarks.BookmarkTreeNode[],
    result: Bookmark[]
  ): void {
    for (const node of nodes) {
      // 跳过根节点和系统文件夹
      if (node.id === '0' || node.id === '1') {
        // 根节点 (0) 和书签栏 (1) 跳过，直接处理其子节点
        if (node.children) {
          this.extractBookmarks(node.children, result);
        }
        continue;
      }

      // 跳过系统文件夹名称
      const systemFolderNames = ['书签栏', '其他书签', 'Bookmarks Bar', 'Other Bookmarks'];
      if (systemFolderNames.includes(node.title)) {
        if (node.children) {
          this.extractBookmarks(node.children, result);
        }
        continue;
      }

      if (node.url) {
        // 这是一个书签
        result.push({
          id: node.id,
          title: node.title,
          url: node.url,
          favicon: node.url ? `chrome://favicon/${node.url}` : undefined,


          createdAt: new Date(node.dateAdded || Date.now()),
          updatedAt: new Date(node.dateAdded || Date.now()),
          isFolder: false,
        });
      } else if (node.children && node.children.length > 0) {
        // 这是一个文件夹，只有当它有子项目时才创建
        const folderBookmarks: Bookmark[] = [];
        this.extractBookmarks(node.children, folderBookmarks);
        
        // 只有当文件夹包含有意义的书签时才添加
        if (folderBookmarks.length > 0) {
          result.push({
            id: node.id,
            title: node.title,
            url: '', // 文件夹没有 URL
            favicon: undefined,


            createdAt: new Date(node.dateAdded || Date.now()),
            updatedAt: new Date(node.dateAdded || Date.now()),
            isFolder: true,
            children: folderBookmarks,
          });
        }
      }
    }
  }







  async addBookmark(
    bookmarkData: Omit<Bookmark, "id" | "createdAt" | "updatedAt">
  ): Promise<Bookmark> {
    if (typeof chrome === "undefined" || !chrome.bookmarks) {
      throw new Error("Chrome bookmarks API not available");
    }

    return new Promise((resolve, reject) => {
      const createData: chrome.bookmarks.BookmarkCreateArg = {
        title: bookmarkData.title,
        parentId: "1", // 添加到书签栏
      };

      if (bookmarkData.isFolder) {
        // 创建文件夹
        chrome.bookmarks.create(createData, (bookmark) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }

          const newFolder: Bookmark = {
            id: bookmark.id,
            title: bookmark.title,
            url: "",
            favicon: undefined,


            createdAt: new Date(bookmark.dateAdded || Date.now()),
            updatedAt: new Date(bookmark.dateAdded || Date.now()),
            isFolder: true,
            children: bookmarkData.children || [],
          };

          resolve(newFolder);
        });
      } else {
        // 创建书签
        createData.url = bookmarkData.url;
        chrome.bookmarks.create(createData, (bookmark) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }

          const newBookmark: Bookmark = {
            id: bookmark.id,
            title: bookmark.title,
            url: bookmark.url || "",
            favicon: bookmark.url
              ? `chrome://favicon/${bookmark.url}`
              : undefined,


            createdAt: new Date(bookmark.dateAdded || Date.now()),
            updatedAt: new Date(bookmark.dateAdded || Date.now()),
            isFolder: false,
          };

          resolve(newBookmark);
        });
      }
    });
  }

  async updateBookmark(
    id: string,
    updates: Partial<Bookmark>
  ): Promise<Bookmark> {
    if (typeof chrome === "undefined" || !chrome.bookmarks) {
      throw new Error("Chrome bookmarks API not available");
    }

    return new Promise((resolve, reject) => {
      const updateData: chrome.bookmarks.BookmarkChangesArg = {};
      if (updates.title) updateData.title = updates.title;
      if (updates.url && !updates.isFolder) updateData.url = updates.url;

      chrome.bookmarks.update(id, updateData, (bookmark) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }

        const updatedBookmark: Bookmark = {
          id: bookmark.id,
          title: bookmark.title,
          url: bookmark.url || "",
          favicon: bookmark.url
            ? `chrome://favicon/${bookmark.url}`
            : undefined,


          createdAt: new Date(bookmark.dateAdded || Date.now()),
          updatedAt: new Date(),
          isFolder: updates.isFolder || false,
          children: updates.children || [],
        };

        resolve(updatedBookmark);
      });
    });
  }

  async deleteBookmark(id: string): Promise<void> {
    if (typeof chrome === "undefined" || !chrome.bookmarks) {
      throw new Error("Chrome bookmarks API not available");
    }

    return new Promise((resolve, reject) => {
      chrome.bookmarks.remove(id, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        resolve();
      });
    });
  }

  async reorderBookmarks(
    _sourceIndex: number,
    _destinationIndex: number
  ): Promise<void> {
    // 浏览器书签API不支持直接重排序，这里只是占位实现
    console.warn("Browser bookmarks reordering is not supported");
    return Promise.resolve();
  }



  async searchBookmarks(query: string): Promise<Bookmark[]> {
    if (typeof chrome === "undefined" || !chrome.bookmarks) {
      throw new Error("Chrome bookmarks API not available");
    }

    return new Promise((resolve, reject) => {
      chrome.bookmarks.search(query, (bookmarks) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }

        const result: Bookmark[] = bookmarks.map((bookmark) => ({
          id: bookmark.id,
          title: bookmark.title,
          url: bookmark.url || "",
          favicon: bookmark.url
            ? `chrome://favicon/${bookmark.url}`
            : undefined,


          createdAt: new Date(bookmark.dateAdded || Date.now()),
          updatedAt: new Date(bookmark.dateAdded || Date.now()),
          isFolder: false,
        }));

        resolve(result);
      });
    });
  }


}
