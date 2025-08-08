import React from 'react'

import BookmarkCard from './BookmarkCard'
import FolderContainer from './FolderContainer'
import type { Bookmark } from '../../types/bookmark'

interface BookmarkGridProps {
  bookmarks: Bookmark[]
  level?: number
  onFolderNavigate?: (folderId: string) => void
}

const BookmarkGrid: React.FC<BookmarkGridProps> = ({ bookmarks, level = 0, onFolderNavigate }) => {
  // 分离文件夹和书签
  const folders = bookmarks.filter(bookmark => bookmark.isFolder)
  const regularBookmarks = bookmarks.filter(bookmark => !bookmark.isFolder)

  return (
    <div className={`space-y-4 ${level > 0 ? 'min-w-0' : ''}`}>
      {/* 渲染文件夹 */}
      {folders.length > 0 && (
        <div className="space-y-4">
          {folders.map((folder) => (
            <div key={folder.id}>
              <FolderContainer folder={folder} onFolderNavigate={onFolderNavigate} />
            </div>
          ))}
        </div>
      )}

      {/* 渲染普通书签 */}
      {regularBookmarks.length > 0 && (
        <div className={folders.length > 0 ? 'mt-4' : ''}>
          <div className="flex flex-wrap gap-3">
            {regularBookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                style={{
                  width: '400px',
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