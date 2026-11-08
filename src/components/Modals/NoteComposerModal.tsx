import React, { useState } from 'react';
import { Layers, X, FilePlus, GitMerge } from 'lucide-react';

interface NoteComposerModalProps {
  isOpen: boolean;
  activeTitle: string;
  vaultNotes: { name: string; path: string }[];
  onMergeInto: (targetPath: string) => void;
  onExtractSelection: (newNoteTitle: string) => void;
  onClose: () => void;
}

export const NoteComposerModal: React.FC<NoteComposerModalProps> = ({
  isOpen,
  activeTitle,
  vaultNotes,
  onMergeInto,
  onExtractSelection,
  onClose,
}) => {
  const [mode, setMode] = useState<'merge' | 'extract'>('merge');
  const [selectedTarget, setSelectedTarget] = useState(vaultNotes[0]?.path || '');
  const [newTitle, setNewTitle] = useState('');

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[#1f2335] border border-[#24283b] rounded-xl shadow-2xl p-5 text-xs flex flex-col gap-4"
      >
        <div className="flex items-center justify-between border-b border-[#24283b] pb-3">
          <div className="flex items-center gap-2 font-semibold text-sm text-[#c0caf5]">
            <Layers className="w-4 h-4 text-[#bb9af7]" />
            <span>Note Composer</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-[#24283b] text-[#565f89] hover:text-[#c0caf5]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center bg-[#16161e] border border-[#24283b] rounded-lg p-1">
          <button
            onClick={() => setMode('merge')}
            className={`flex-1 py-1.5 rounded-md font-medium transition-colors flex items-center justify-center gap-1.5 ${
              mode === 'merge' ? 'bg-[#24283b] text-[#7aa2f7]' : 'text-[#565f89]'
            }`}
          >
            <GitMerge className="w-3.5 h-3.5" />
            <span>Merge Note</span>
          </button>
          <button
            onClick={() => setMode('extract')}
            className={`flex-1 py-1.5 rounded-md font-medium transition-colors flex items-center justify-center gap-1.5 ${
              mode === 'extract' ? 'bg-[#24283b] text-[#7aa2f7]' : 'text-[#565f89]'
            }`}
          >
            <FilePlus className="w-3.5 h-3.5" />
            <span>Extract to Note</span>
          </button>
        </div>

        {mode === 'merge' ? (
          <div className="space-y-3">
            <p className="text-xs text-[#a9b1d6]">
              Append contents of <span className="font-semibold text-[#c0caf5]">{activeTitle}</span> to another existing note:
            </p>
            <select
              value={selectedTarget}
              onChange={(e) => setSelectedTarget(e.target.value)}
              className="w-full bg-[#16161e] border border-[#24283b] rounded-lg px-3 py-2 text-xs text-[#c0caf5] outline-none"
            >
              {vaultNotes.map((n) => (
                <option key={n.path} value={n.path}>
                  {n.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                if (selectedTarget) {
                  onMergeInto(selectedTarget);
                  onClose();
                }
              }}
              className="w-full py-2 rounded-lg bg-[#7aa2f7] hover:bg-[#89b4fa] text-[#16161e] font-medium transition-colors"
            >
              Merge Notes
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-[#a9b1d6]">
              Extract selected text or current note into a newly created note:
            </p>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="New note title..."
              className="w-full bg-[#16161e] border border-[#24283b] rounded-lg px-3 py-2 text-xs text-[#c0caf5] outline-none"
            />
            <button
              onClick={() => {
                if (newTitle.trim()) {
                  onExtractSelection(newTitle.trim());
                  onClose();
                }
              }}
              className="w-full py-2 rounded-lg bg-[#73daca] hover:bg-[#8ae4d5] text-[#16161e] font-medium transition-colors"
            >
              Create Extracted Note
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
