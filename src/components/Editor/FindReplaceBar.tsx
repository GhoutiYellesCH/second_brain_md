import React from 'react';
import { FindState } from '../../types';
import {
  Search,
  Replace,
  ChevronDown,
  ChevronUp,
  X,
  CaseSensitive,
  WholeWord,
  Regex,
} from 'lucide-react';

interface FindReplaceBarProps {
  findState: FindState;
  onChangeFindState: (updater: (prev: FindState) => FindState) => void;
  onFindNext: () => void;
  onFindPrevious: () => void;
  onReplaceCurrent: () => void;
  onReplaceAll: () => void;
  onClose: () => void;
}

export const FindReplaceBar: React.FC<FindReplaceBarProps> = ({
  findState,
  onChangeFindState,
  onFindNext,
  onFindPrevious,
  onReplaceCurrent,
  onReplaceAll,
  onClose,
}) => {
  if (!findState.isOpen) return null;

  return (
    <div className="bg-[#1f2335] border-b border-[#24283b] p-2 flex flex-col gap-1.5 text-xs shadow-md z-10 shrink-0">
      {/* Row 1: Find */}
      <div className="flex items-center gap-1.5">
        <div className="relative flex-1 flex items-center">
          <Search className="w-3.5 h-3.5 text-[#565f89] absolute left-2 pointer-events-none" />
          <input
            type="text"
            value={findState.query}
            onChange={(e) =>
              onChangeFindState((prev) => ({ ...prev, query: e.target.value }))
            }
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (e.shiftKey) onFindPrevious();
                else onFindNext();
              } else if (e.key === 'Escape') {
                onClose();
              }
            }}
            placeholder="Find in document..."
            className="w-full bg-[#16161e] border border-[#24283b] focus:border-[#7aa2f7] rounded pl-7 pr-16 py-1 text-xs text-[#c0caf5] outline-none"
            autoFocus
          />
          <div className="absolute right-2 text-[10px] text-[#565f89] font-mono">
            {findState.totalMatches > 0
              ? `${findState.currentMatchIndex + 1}/${findState.totalMatches}`
              : findState.query
              ? 'No match'
              : ''}
          </div>
        </div>

        {/* Search Options: Case, Word, Regex */}
        <div className="flex items-center bg-[#16161e] border border-[#24283b] rounded p-0.5">
          <button
            onClick={() =>
              onChangeFindState((prev) => ({
                ...prev,
                caseSensitive: !prev.caseSensitive,
              }))
            }
            className={`p-1 rounded transition-colors ${
              findState.caseSensitive ? 'bg-[#24283b] text-[#7aa2f7]' : 'text-[#565f89]'
            }`}
            title="Match Case"
          >
            <CaseSensitive className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() =>
              onChangeFindState((prev) => ({
                ...prev,
                wholeWord: !prev.wholeWord,
              }))
            }
            className={`p-1 rounded transition-colors ${
              findState.wholeWord ? 'bg-[#24283b] text-[#7aa2f7]' : 'text-[#565f89]'
            }`}
            title="Match Whole Word"
          >
            <WholeWord className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() =>
              onChangeFindState((prev) => ({
                ...prev,
                useRegex: !prev.useRegex,
              }))
            }
            className={`p-1 rounded transition-colors ${
              findState.useRegex ? 'bg-[#24283b] text-[#7aa2f7]' : 'text-[#565f89]'
            }`}
            title="Use Regular Expression"
          >
            <Regex className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Prev / Next Buttons */}
        <button
          onClick={onFindPrevious}
          className="p-1 rounded hover:bg-[#24283b] text-[#c0caf5]"
          title="Previous Match (Shift+Enter)"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
        <button
          onClick={onFindNext}
          className="p-1 rounded hover:bg-[#24283b] text-[#c0caf5]"
          title="Next Match (Enter)"
        >
          <ChevronDown className="w-4 h-4" />
        </button>

        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-[#24283b] text-[#565f89] hover:text-[#c0caf5]"
          title="Close (Escape)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Row 2: Replace */}
      <div className="flex items-center gap-1.5">
        <div className="relative flex-1 flex items-center">
          <Replace className="w-3.5 h-3.5 text-[#565f89] absolute left-2 pointer-events-none" />
          <input
            type="text"
            value={findState.replaceText}
            onChange={(e) =>
              onChangeFindState((prev) => ({
                ...prev,
                replaceText: e.target.value,
              }))
            }
            placeholder="Replace with..."
            className="w-full bg-[#16161e] border border-[#24283b] focus:border-[#7aa2f7] rounded pl-7 pr-3 py-1 text-xs text-[#c0caf5] outline-none"
          />
        </div>

        <button
          onClick={onReplaceCurrent}
          className="px-2.5 py-1 rounded bg-[#24283b] hover:bg-[#3d59a1] text-[#c0caf5] text-[11px] font-medium transition-colors"
        >
          Replace
        </button>
        <button
          onClick={onReplaceAll}
          className="px-2.5 py-1 rounded bg-[#24283b] hover:bg-[#3d59a1] text-[#c0caf5] text-[11px] font-medium transition-colors"
        >
          Replace All
        </button>
      </div>
    </div>
  );
};
