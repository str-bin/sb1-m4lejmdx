import React from 'react'
import { Draggable, Droppable } from 'react-beautiful-dnd'
import BookmarkCard from './BookmarkCard'
import FolderCard from './FolderCard'
import FolderRow from './FolderRow'
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
  
  // 判断是否使用多列布局（仅在顶级且有足够项目时）
  const useGridLayout = level === 0 && (folders.length + regularBookmarks.length) > 4

  return (
    <Droppable droppableId={droppableId}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`${useGridLayout ? 'space-y-4' : 'space-y-2'} ${level > 0 ? 'min-w-0' : ''} ${
            snapshot.isDraggingOver ? 'bg-blue-50/20 rounded-lg' : ''
          } dragging-container`}
          style={{ position: 'relative' }}
        >
          {/* 渲染文件夹 */}
          {folders.length > 0 && (
            <div className={useGridLayout ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mb-4' : ''}>
              {useGridLayout ? (
                folders.map((folder, index) => (
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
                        <FolderCard folder={folder} level={level} onNavigate={onFolderNavigate} />
                      </div>
                    )}
                  </Draggable>
                ))
              ) : (
                <FolderRow 
                  folders={folders} 
                  level={level}
                  path={path}
                  onFolderNavigate={onFolderNavigate}
                />
              )}
            </div>
          )}

          {/* 渲染普通书签 */}
          {regularBookmarks.length > 0 && (
            <div className={useGridLayout ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3' : 'space-y-2'}>
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
          )}
          
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  )
}

export default BookmarkGrid