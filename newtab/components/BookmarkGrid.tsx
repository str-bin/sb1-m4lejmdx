import React from 'react'
import { Draggable } from 'react-beautiful-dnd'
import BookmarkCard from './BookmarkCard'
import type { Bookmark } from '../../types/bookmark'

interface BookmarkGridProps {
  bookmarks: Bookmark[]
}

const BookmarkGrid: React.FC<BookmarkGridProps> = ({ bookmarks }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
      {bookmarks.map((bookmark, index) => (
        <Draggable key={bookmark.id} draggableId={bookmark.id} index={index}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              className={`transition-all duration-200 ${
                snapshot.isDragging ? 'bookmark-dragging' : ''
              }`}
            >
              <BookmarkCard bookmark={bookmark} />
            </div>
          )}
        </Draggable>
      ))}
    </div>
  )
}

export default BookmarkGrid