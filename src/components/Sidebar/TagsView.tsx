import React from 'react';
import { Tag, Hash } from 'lucide-react';

interface TagsViewProps {
  tags: Map<string, number>;
  onSelectTag: (tag: string) => void;
}

export const TagsView: React.FC<TagsViewProps> = ({ tags, onSelectTag }) => {
  const tagList = Array.from(tags.entries()).sort((a, b) => b[1] - a[1]);

  return (
    <div className="flex flex-col h-full text-xs p-2">
      <div className="text-[10px] text-[#565f89] uppercase tracking-wider px-1 font-semibold mb-2 flex items-center gap-1.5">
        <Tag className="w-3.5 h-3.5 text-[#7aa2f7]" /> Vault Tags ({tagList.length})
      </div>

      {tagList.length > 0 ? (
        <div className="space-y-1 overflow-y-auto flex-1">
          {tagList.map(([tag, count]) => (
            <div
              key={tag}
              onClick={() => onSelectTag(tag)}
              className="flex items-center justify-between p-2 rounded bg-[#16161e]/60 hover:bg-[#24283b] cursor-pointer transition-colors border border-[#24283b]/60"
            >
              <div className="flex items-center gap-1.5 text-[#7aa2f7] font-mono">
                <Hash className="w-3 h-3 text-[#565f89]" />
                <span className="truncate">{tag}</span>
              </div>
              <span className="text-[10px] bg-[#24283b] text-[#787c99] px-1.5 py-0.5 rounded-full font-mono">
                {count}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-[#565f89]">
          No tags found in vault notes. Add `#tag` to any note to organize your second brain.
        </div>
      )}
    </div>
  );
};
