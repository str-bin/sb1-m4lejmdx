import React from 'react'
import { Draggable, Droppable } from 'react-beautiful-dnd'
import BookmarkCard from './BookmarkCard'
import FolderContainer from './FolderContainer'
import type { Bookmark } from '../../types/bookmark'

interface BookmarkGridProps {
  bookmarks: Bookmark[]
  level?: number
  path?: string[]
  onFolderNavigate?: (folderId: string) => void
}

const BookmarkGrid: React.FC<BookmarkGridProps> = ({ bookmarks, level = 0, path = [], onFolderNavigate }) => {
  // 分离文件夹和书签
  const folders = bookmarks.filter(bookmark => bookmark.isFolder)
  const regularBookmarks = bookmarks.filter(bookmark => !bookmark.isFolder)

  // 生成当前层级的 droppableId
  const droppableId = path.length === 0 ? 'droppable-root' : `droppable-${path.join('-')}`

  return (
    <Droppable droppableId={droppableId}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`space-y-4 ${level > 0 ? 'min-w-0' : ''} ${
            snapshot.isDraggingOver ? 'bg-blue-50/20 rounded-lg' : ''
          } dragging-container`}
          style={{ position: 'relative' }}
        >
          {/* 渲染文件夹 */}
          {folders.length > 0 && (
            <div className="space-y-4">
              {folders.map((folder, index) => (
                <Draggable key={folder.id} draggableId={folder.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`transition-all duration-200 ${
                        snapshot.isDragging ? 'bookmark-dragging' : ''
                      }`}
                      style={{
                        ...provided.draggableProps.style,
                        position: snapshot.isDragging ? 'relative' : 'static',
                        zIndex: snapshot.isDragging ? 9999 : 'auto'
                      }}
                    >
                      <FolderContainer folder={folder} onFolderNavigate={onFolderNavigate} />
                    </div>
                  )}
                </Draggable>
              ))}
            </div>
          )}

          {/* 渲染普通书签 */}
          {regularBookmarks.length > 0 && (
            <div className={folders.length > 0 ? 'mt-4' : ''}>
              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-3">
                {regularBookmarks.map((bookmark, index) => (
                  <Draggable key={bookmark.id} draggableId={bookmark.id} index={folders.length + index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`transition-all duration-200 ${
                          snapshot.isDragging ? 'bookmark-dragging' : ''
                        }`}
                        style={{
                          ...provided.draggableProps.style,
                          position: snapshot.isDragging ? 'relative' : 'static',
                          zIndex: snapshot.isDragging ? 9999 : 'auto'
                        }}
                      >
                        <BookmarkCard bookmark={bookmark} />
                      </div>
                    )}
                  </Draggable>
                ))}
              </div>
            </div>
          )}
          
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  )
}

export default BookmarkGrid