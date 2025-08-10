import React from 'react'

import BookmarkCard from './BookmarkCard'
import FolderContainer from './FolderContainer'
import type { Bookmark } from '../../types/bookmark'

interface BookmarkGridProps {
  bookmarks: Bookmark[]
  level?: number
}

const BookmarkGrid: React.FC<BookmarkGridProps> = ({ bookmarks, level = 0 }) => {
  // 分离文件夹和书签
  const folders = bookmarks.filter(bookmark => bookmark.isFolder)
  const regularBookmarks = bookmarks.filter(bookmark => !bookmark.isFolder)

  return (
    <div className={`space-y-3 ${level > 0 ? 'min-w-0' : ''}`}>
      {/* 渲染文件夹 - 瀑布流布局 */}
      {folders.length > 0 && (
        <div 
          className="masonry-layout"
          style={{
            columnCount: 'auto',
            columnWidth: '400px',
            columnGap: '12px',
            columnFill: 'balance'
          }}
        >
          {folders.map((folder) => (
            <div 
              key={folder.id} 
              className="masonry-item"
              style={{
                display: 'inline-block',
                width: '100%',
                marginBottom: '12px',
                breakInside: 'avoid'
              }}
            >
              <FolderContainer folder={folder} />
            </div>
          ))}
        </div>
      )}

      {/* 渲染普通书签 */}
      {regularBookmarks.length > 0 && (
        <div className={folders.length > 0 ? 'mt-3' : ''}>
                  <div className="flex flex-wrap gap-2">
          {regularBookmarks.map((bookmark) => (
            <div
              key={bookmark.id}
              style={{
                width: '360px',
                flexShrink: 0
              }}
            >
              <BookmarkCard bookmark={bookmark} />
            </div>
          ))}
        </div>
        </div>
      )}
    </div>
  )
}

export default BookmarkGrid