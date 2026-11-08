import React from 'react';
import { VaultStats } from '../../types';
import { Database, FileText } from 'lucide-react';

interface AppStatusBarProps {
  activeFilePath?: string;
  activeFileName?: string;
  content: string;
  cursorLine?: number;
  cursorCol?: number;
  vaultStats?: VaultStats;
  isSingleFileMode: boolean;
  isDirty?: boolean;
}

export const AppStatusBar: React.FC<AppStatusBarProps> = ({
  activeFilePath,
  activeFileName,
  content,
  cursorLine = 1,
  cursorCol = 1,
  vaultStats,
  isSingleFileMode,
  isDirty,
}) => {
  // Calculate statistics
  const wordCount = React.useMemo(() => {
    if (!content) return 0;
    const words = content.trim().split(/\s+/).filter(Boolean);
    return words.length;
  }, [content]);

  const charCount = content ? content.length : 0;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <footer className="h-6 bg-[#16161e] border-t border-[#24283b] px-3 flex items-center justify-between text-[11px] text-[#565f89] font-mono select-none shrink-0 z-20">
      {/* Left: Active file name & status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-[#787c99]">
          <FileText className="w-3 h-3 text-[#7aa2f7]" />
          <span className="truncate max-w-[280px]" title={activeFilePath || activeFileName}>
            {activeFileName || 'No Document Open'}
          </span>
          {isDirty && (
            <span className="text-[#e0af68] text-[10px] font-semibold">(Unsaved)</span>
          )}
        </div>

        {!isSingleFileMode && vaultStats && (
          <div className="hidden md:flex items-center gap-1.5 pl-3 border-l border-[#24283b]">
            <Database className="w-3 h-3 text-[#bb9af7]" />
            <span>{vaultStats.totalNotes} notes</span>
            <span className="text-[#3b4261]">•</span>
            <span>{(((vaultStats.totalSizeBytes || vaultStats.total_size_bytes || 0)) / 1024 / 1024).toFixed(1)} MB</span>
          </div>
        )}
      </div>

      {/* Right: Word count, Char count, Line/Col, Encoding */}
      <div className="flex items-center gap-3">
        <span>{wordCount} words</span>
        <span className="text-[#3b4261]">•</span>
        <span>{charCount} chars</span>
        <span className="text-[#3b4261]">•</span>
        <span>~{readingTimeMinutes} min read</span>
        <span className="text-[#3b4261]">•</span>
        <span>Ln {cursorLine}, Col {cursorCol}</span>
        <span className="text-[#3b4261]">•</span>
        <span className="text-[#73daca]">UTF-8</span>
      </div>
    </footer>
  );
};
