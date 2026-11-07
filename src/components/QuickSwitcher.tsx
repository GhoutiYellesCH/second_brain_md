import React, { useState, useEffect, useRef } from 'react';
import { Search, FileText, Plus } from 'lucide-react';

interface QuickSwitcherProps {
  isOpen: boolean;
  onClose: () => void;
  files: { path: string; title: string; relativePath: string }[];
  onSelectNote: (path: string) => void;
  onCreateNote: (title: string) => void;
}

export const QuickSwitcher: React.FC<QuickSwitcherProps> = ({
  isOpen,
  onClose,
  files,
  onSelectNote,
  onCreateNote,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = files.filter(
    (f) =>
      f.title.toLowerCase().includes(query.toLowerCase()) ||
      f.relativePath.toLowerCase().includes(query.toLowerCase())
  );

  const exactMatch = filtered.some((f) => f.title.toLowerCase() === query.trim().toLowerCase());

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        onSelectNote(filtered[selectedIndex].path);
        onClose();
      } else if (query.trim() && !exactMatch) {
        onCreateNote(query.trim());
        onClose();
      }
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-24 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-[#161619] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-xs"
      >
        {/* Search Input Box */}
        <div className="flex items-center px-4 py-3 border-b border-zinc-800 bg-[#1a1a1e]">
          <Search className="w-4 h-4 text-purple-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a note name to jump to or create..."
            className="w-full bg-transparent border-none outline-none text-zinc-100 text-sm placeholder-zinc-500 font-medium"
          />
        </div>

        {/* Note Results List */}
        <div className="max-h-80 overflow-y-auto p-1.5 space-y-0.5">
          {filtered.length === 0 && !query && (
            <p className="text-zinc-500 text-center py-6">Type note name or title...</p>
          )}

          {filtered.map((item, idx) => (
            <div
              key={item.path}
              onClick={() => {
                onSelectNote(item.path);
                onClose();
              }}
              onMouseEnter={() => setSelectedIndex(idx)}
              className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                selectedIndex === idx
                  ? 'bg-purple-600 text-white font-medium shadow-sm'
                  : 'text-zinc-300 hover:bg-zinc-800/60'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <FileText
                  className={`w-3.5 h-3.5 ${
                    selectedIndex === idx ? 'text-white' : 'text-purple-400'
                  }`}
                />
                <span className="truncate">{item.title}</span>
              </div>
              <span
                className={`text-[11px] truncate max-w-[200px] font-mono ${
                  selectedIndex === idx ? 'text-purple-200' : 'text-zinc-500'
                }`}
              >
                {item.relativePath}
              </span>
            </div>
          ))}

          {/* Create New Note Option if not matched */}
          {query.trim() && !exactMatch && (
            <div
              onClick={() => {
                onCreateNote(query.trim());
                onClose();
              }}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer bg-purple-950/40 border border-purple-800/50 hover:bg-purple-900/50 text-purple-300 transition-colors mt-1"
            >
              <Plus className="w-4 h-4 text-purple-400 shrink-0" />
              <span>
                Create note <strong className="text-white">"{query.trim()}"</strong>
              </span>
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-zinc-800 bg-[#121214] text-[10px] text-zinc-500 font-mono">
          <div className="flex gap-3">
            <span>↑↓ to navigate</span>
            <span>↵ to select</span>
            <span>esc to close</span>
          </div>
          <span>Obsidian Quick Switcher</span>
        </div>
      </div>
    </div>
  );
};
