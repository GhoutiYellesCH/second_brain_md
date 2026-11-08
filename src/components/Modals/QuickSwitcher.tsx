import React, { useState, useEffect } from 'react';
import { Search, FileText, Code, Image as ImageIcon } from 'lucide-react';
import { getFileKind } from '../../services/codeLanguages';

interface QuickSwitcherProps {
  isOpen: boolean;
  files: { name: string; path: string }[];
  onSelect: (path: string) => void;
  onClose: () => void;
}

export const QuickSwitcher: React.FC<QuickSwitcherProps> = ({
  isOpen,
  files,
  onSelect,
  onClose,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filtered = files.filter(
    (f) =>
      f.name.toLowerCase().includes(query.toLowerCase()) ||
      f.path.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          onSelect(filtered[selectedIndex].path);
          onClose();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex, onSelect, onClose]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-24 select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-[#1f2335] border border-[#24283b] rounded-xl shadow-2xl overflow-hidden flex flex-col text-xs"
      >
        {/* Search Input */}
        <div className="p-3 border-b border-[#24283b] flex items-center gap-2.5">
          <Search className="w-4 h-4 text-[#7aa2f7]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by file or note name..."
            className="w-full bg-transparent text-sm text-[#c0caf5] placeholder-[#565f89] outline-none"
            autoFocus
          />
          <kbd className="px-1.5 py-0.5 rounded bg-[#16161e] text-[10px] text-[#565f89] font-mono border border-[#24283b]">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-1.5 space-y-0.5">
          {filtered.length > 0 ? (
            filtered.map((item, idx) => {
              const kind = getFileKind(item.name);
              return (
                <div
                  key={item.path}
                  onClick={() => {
                    onSelect(item.path);
                    onClose();
                  }}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                    idx === selectedIndex ? 'bg-[#24283b] text-[#c0caf5]' : 'text-[#787c99] hover:bg-[#24283b]/50'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {kind === 'code' ? (
                      <Code className="w-3.5 h-3.5 text-[#73daca] shrink-0" />
                    ) : kind === 'asset' ? (
                      <ImageIcon className="w-3.5 h-3.5 text-[#ff9e64] shrink-0" />
                    ) : (
                      <FileText className="w-3.5 h-3.5 text-[#7aa2f7] shrink-0" />
                    )}
                    <span className="font-medium truncate text-xs text-[#c0caf5]">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#565f89] font-mono truncate max-w-[200px]">
                    {item.path}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-[#565f89]">No matching files</div>
          )}
        </div>
      </div>
    </div>
  );
};
