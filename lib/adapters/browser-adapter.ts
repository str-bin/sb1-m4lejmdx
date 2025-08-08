import type {
  Bookmark,
  BookmarkCategory,
  BookmarkDataAdapter,
} from "../../types/bookmark";
import { generateId } from "../utils";

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
          category: this.determineCategory(node.title, node.url),
          tags: this.extractTags(node.title, node.url),
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
            category: undefined,
            tags: [],
            createdAt: new Date(node.dateAdded || Date.now()),
            updatedAt: new Date(node.dateAdded || Date.now()),
            isFolder: true,
            children: folderBookmarks,
          });
        }
      }
    }
  }

  private determineCategory(title: string, url: string): string {
    const lowerTitle = title.toLowerCase();
    const lowerUrl = url.toLowerCase();

    // 基于标题和URL判断分类
    if (lowerTitle.includes("github") || lowerUrl.includes("github.com"))
      return "1"; // 工作
    if (lowerTitle.includes("stack") || lowerUrl.includes("stackoverflow.com"))
      return "2"; // 工作
    if (
      lowerTitle.includes("mdn") ||
      lowerUrl.includes("developer.mozilla.org")
    )
      return "3"; // 学习
    if (lowerTitle.includes("youtube") || lowerUrl.includes("youtube.com"))
      return "4"; // 娱乐
    if (lowerTitle.includes("figma") || lowerUrl.includes("figma.com"))
      return "5"; // 工具
    if (lowerTitle.includes("twitter") || lowerUrl.includes("twitter.com"))
      return "4"; // 娱乐

    // 默认分类
    return "1"; // 常用
  }

  private extractTags(title: string, url: string): string[] {
    const tags: string[] = [];
    const lowerTitle = title.toLowerCase();
    const lowerUrl = url.toLowerCase();

    // 基于内容提取标签
    if (
      lowerTitle.includes("开发") ||
      lowerUrl.includes("dev") ||
      lowerUrl.includes("github")
    ) {
      tags.push("开发");
    }
    if (
      lowerTitle.includes("学习") ||
      lowerUrl.includes("learn") ||
      lowerUrl.includes("tutorial")
    ) {
      tags.push("学习");
    }
    if (lowerTitle.includes("工具") || lowerUrl.includes("tool")) {
      tags.push("工具");
    }
    if (
      lowerTitle.includes("娱乐") ||
      lowerUrl.includes("game") ||
      lowerUrl.includes("video")
    ) {
      tags.push("娱乐");
    }

    return tags;
  }

  async getCategories(): Promise<BookmarkCategory[]> {
    // 返回默认分类，浏览器书签不支持自定义分类
    return [
      { id: "1", name: "常用", color: "#3b82f6", icon: "Star" },
      { id: "2", name: "工作", color: "#ef4444", icon: "Briefcase" },
      { id: "3", name: "学习", color: "#10b981", icon: "BookOpen" },
      { id: "4", name: "娱乐", color: "#f59e0b", icon: "GamepadIcon" },
      { id: "5", name: "工具", color: "#8b5cf6", icon: "Wrench" },
    ];
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
            category: bookmarkData.category,
            tags: bookmarkData.tags || [],
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
            category: bookmarkData.category,
            tags: bookmarkData.tags || [],
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
          category: updates.category,
          tags: updates.tags || [],
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
    sourceIndex: number,
    destinationIndex: number
  ): Promise<void> {
    // 浏览器书签API不支持直接重排序，这里只是占位实现
    console.warn("Browser bookmarks reordering is not supported");
    return Promise.resolve();
  }

  async addCategory(
    categoryData: Omit<BookmarkCategory, "id">
  ): Promise<BookmarkCategory> {
    // 浏览器书签不支持自定义分类
    throw new Error("Browser bookmarks do not support custom categories");
  }

  async updateCategory(
    id: string,
    updates: Partial<BookmarkCategory>
  ): Promise<BookmarkCategory> {
    // 浏览器书签不支持自定义分类
    throw new Error("Browser bookmarks do not support custom categories");
  }

  async deleteCategory(id: string): Promise<void> {
    // 浏览器书签不支持自定义分类
    throw new Error("Browser bookmarks do not support custom categories");
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
          category: this.determineCategory(bookmark.title, bookmark.url || ""),
          tags: this.extractTags(bookmark.title, bookmark.url || ""),
          createdAt: new Date(bookmark.dateAdded || Date.now()),
          updatedAt: new Date(bookmark.dateAdded || Date.now()),
          isFolder: false,
        }));

        resolve(result);
      });
    });
  }

  async getBookmarksByCategory(categoryId: string): Promise<Bookmark[]> {
    const bookmarks = await this.getBookmarks();
    return bookmarks.filter((bookmark) => bookmark.category === categoryId);
  }
}
