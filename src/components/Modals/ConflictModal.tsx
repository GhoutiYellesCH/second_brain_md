import React from 'react';
import { AlertTriangle, RefreshCw, Save } from 'lucide-react';

interface ConflictModalProps {
  isOpen: boolean;
  fileName: string;
  onReloadDisk: () => void;
  onKeepEditor: () => void;
  onSaveAs: () => void;
  onCancel: () => void;
}

export const ConflictModal: React.FC<ConflictModalProps> = ({
  isOpen,
  fileName,
  onReloadDisk,
  onKeepEditor,
  onSaveAs,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div
      onClick={onCancel}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[#1f2335] border border-[#f7768e]/50 rounded-xl shadow-2xl p-6 text-xs flex flex-col gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-full bg-[#f7768e]/15 text-[#f7768e] shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-[#c0caf5]">
              External File Modification Conflict
            </h3>
            <p className="text-[11px] text-[#565f89] mt-0.5">
              The file <span className="font-mono text-[#7aa2f7]">{fileName}</span> was changed on disk by another program.
            </p>
          </div>
        </div>

        <p className="text-xs text-[#a9b1d6] leading-relaxed">
          How would you like to resolve this conflict? You can overwrite with your current editor version, reload the disk version, or save your version under a new name.
        </p>

        <div className="flex flex-col gap-2 pt-2">
          <button
            onClick={onReloadDisk}
            className="w-full py-2 px-3 rounded-lg bg-[#24283b] hover:bg-[#3d59a1] text-[#c0caf5] font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#7aa2f7]" />
            <span>Reload Disk Version (Discard In-Memory Edits)</span>
          </button>

          <button
            onClick={onKeepEditor}
            className="w-full py-2 px-3 rounded-lg bg-[#24283b] hover:bg-[#3d59a1] text-[#c0caf5] font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <Save className="w-3.5 h-3.5 text-[#73daca]" />
            <span>Keep Editing (Overwrite Disk on Next Save)</span>
          </button>

          <button
            onClick={onSaveAs}
            className="w-full py-2 px-3 rounded-lg bg-[#7aa2f7] hover:bg-[#89b4fa] text-[#16161e] font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <span>Save Editor Version As New File...</span>
          </button>
        </div>
      </div>
    </div>
  );
};
