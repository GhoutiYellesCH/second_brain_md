import React from 'react';
import { History, FileText } from 'lucide-react';
import { RecentItem } from '../../services/documentApi';

interface RecentFilesViewProps {
  recentFiles: RecentItem[];
  onSelectFile: (path: string) => void;
  onClearRecent: () => void;
}

export const RecentFilesView: React.FC<RecentFilesViewProps> = ({
  recentFiles,
  onSelectFile,
  onClearRecent,
}) => {
  return (
    <div className="flex flex-col h-full text-xs p-2">
      <div className="flex items-center justify-between px-1 mb-2">
        <div className="text-[10px] text-[#565f89] uppercase tracking-wider font-semibold flex items-center gap-1.5">
          <History className="w-3.5 h-3.5 text-[#73daca]" /> Recent Documents
        </div>
        {recentFiles.length > 0 && (
          <button
            onClick={onClearRecent}
            className="text-[10px] text-[#565f89] hover:text-[#f7768e] transition-colors"
            title="Clear Recent History"
          >
            Clear
          </button>
        )}
      </div>

      {recentFiles.length > 0 ? (
        <div className="space-y-1 overflow-y-auto flex-1">
          {recentFiles.map((item) => (
            <div
              key={item.path}
              onClick={() => onSelectFile(item.path)}
              className="p-2 rounded bg-[#16161e]/60 hover:bg-[#24283b] cursor-pointer transition-colors border border-[#24283b]/60"
            >
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-3.5 h-3.5 text-[#7aa2f7] shrink-0" />
                <span className="truncate text-[#c0caf5] font-medium">{item.title}</span>
              </div>
              <div className="text-[10px] text-[#565f89] truncate pl-5 font-mono">
                {item.path}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-[#565f89]">
          No recent documents.
        </div>
      )}
    </div>
  );
};
