import React from 'react';
import { Star, FileText, Trash2 } from 'lucide-react';

interface BookmarksViewProps {
  bookmarks: string[];
  onSelectBookmark: (path: string) => void;
  onRemoveBookmark: (path: string, e: React.MouseEvent) => void;
}

export const BookmarksView: React.FC<BookmarksViewProps> = ({
  bookmarks,
  onSelectBookmark,
  onRemoveBookmark,
}) => {
  return (
    <div className="flex flex-col h-full text-xs p-2">
      <div className="text-[10px] text-[#565f89] uppercase tracking-wider px-1 font-semibold mb-2 flex items-center gap-1.5">
        <Star className="w-3.5 h-3.5 text-[#e0af68]" /> Starred Notes
      </div>

      {bookmarks.length > 0 ? (
        <div className="space-y-1">
          {bookmarks.map((path) => {
            const name = path.split('/').pop() || path;
            return (
              <div
                key={path}
                onClick={() => onSelectBookmark(path)}
                className="group flex items-center justify-between p-2 rounded bg-[#16161e]/60 hover:bg-[#24283b] cursor-pointer transition-colors border border-[#24283b]/60"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <FileText className="w-3.5 h-3.5 text-[#7aa2f7] shrink-0" />
                  <span className="truncate text-[#c0caf5]">{name}</span>
                </div>
                <button
                  onClick={(e) => onRemoveBookmark(path, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-[#f7768e] text-[#565f89] transition-opacity"
                  title="Remove Bookmark"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-[#565f89]">
          No bookmarks yet. Star notes from the editor or menu to find them quickly here.
        </div>
      )}
    </div>
  );
};
