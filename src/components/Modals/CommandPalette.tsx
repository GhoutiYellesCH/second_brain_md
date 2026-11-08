import React, { useState, useEffect } from 'react';
import { CommandItem } from '../../types';
import { Sparkles } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  commands: CommandItem[];
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  commands,
  onClose,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filtered = commands.filter((c) =>
    c.title.toLowerCase().includes(query.toLowerCase()) ||
    c.category.toLowerCase().includes(query.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(query.toLowerCase()))
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
          filtered[selectedIndex].action();
          onClose();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-24 select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-[#1f2335] border border-[#24283b] rounded-xl shadow-2xl overflow-hidden flex flex-col text-xs"
      >
        {/* Search Input */}
        <div className="p-3 border-b border-[#24283b] flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-[#7aa2f7]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search actions..."
            className="w-full bg-transparent text-sm text-[#c0caf5] placeholder-[#565f89] outline-none"
            autoFocus
          />
          <kbd className="px-1.5 py-0.5 rounded bg-[#16161e] text-[10px] text-[#565f89] font-mono border border-[#24283b]">
            ESC
          </kbd>
        </div>

        {/* Command List */}
        <div className="max-h-80 overflow-y-auto p-1.5 space-y-0.5">
          {filtered.length > 0 ? (
            filtered.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => {
                  item.action();
                  onClose();
                }}
                className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                  idx === selectedIndex ? 'bg-[#24283b] text-[#c0caf5]' : 'text-[#787c99] hover:bg-[#24283b]/50'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#16161e] text-[#7aa2f7] font-medium border border-[#414868]/40">
                    {item.category}
                  </span>
                  <span className="font-medium truncate text-xs text-[#c0caf5]">
                    {item.title}
                  </span>
                  {item.description && (
                    <span className="text-[11px] text-[#565f89] truncate hidden sm:inline">
                      - {item.description}
                    </span>
                  )}
                </div>

                {item.shortcut && (
                  <kbd className="px-2 py-0.5 rounded bg-[#16161e] text-[10px] text-[#787c99] font-mono border border-[#24283b] shrink-0">
                    {item.shortcut}
                  </kbd>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-[#565f89]">No matching commands</div>
          )}
        </div>
      </div>
    </div>
  );
};
