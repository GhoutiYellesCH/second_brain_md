import React, { useRef } from 'react';
import { DocumentTab, FindState, VaultSettings } from '../../types';
import { FormattingToolbar } from './FormattingToolbar';
import { FindReplaceBar } from './FindReplaceBar';
import { TextSourceEditor } from './TextSourceEditor';
import { MarkdownPreview } from './MarkdownPreview';
import { CodeEditor } from './CodeEditor';

interface EditorAreaProps {
  activeTab: DocumentTab | null;
  settings: VaultSettings;
  findState: FindState;
  onChangeContent: (value: string) => void;
  onSave: () => void;
  onChangeFindState: (updater: (prev: FindState) => FindState) => void;
  onNavigateWikilink: (target: string) => void;
  onOpenTemplates: () => void;
  onCursorChange?: (line: number, col: number) => void;
}

export const EditorArea: React.FC<EditorAreaProps> = ({
  activeTab,
  settings,
  findState,
  onChangeContent,
  onSave,
  onChangeFindState,
  onNavigateWikilink,
  onOpenTemplates,
  onCursorChange,
}) => {
  const previewScrollRef = useRef<HTMLDivElement>(null);
  const isSyncingScroll = useRef(false);

  if (!activeTab) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#16161e] text-[#565f89] select-none">
        <img src="/icon.svg" alt="Synapse" className="w-16 h-16 opacity-30 mb-4" />
        <p className="text-sm">No Document Selected</p>
        <p className="text-xs text-[#414868] mt-1">Press <kbd className="px-1.5 py-0.5 bg-[#24283b] rounded text-[#7aa2f7] font-mono">Ctrl+N</kbd> to create a note or <kbd className="px-1.5 py-0.5 bg-[#24283b] rounded text-[#7aa2f7] font-mono">Ctrl+O</kbd> to open</p>
      </div>
    );
  }

  // If this tab is a code file (like .py, .rs, .js, .ts, etc.), use the dedicated CodeEditor!
  if (activeTab.fileKind === 'code') {
    return (
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <FindReplaceBar
          findState={findState}
          onChangeFindState={onChangeFindState}
          onFindNext={() => {}}
          onFindPrevious={() => {}}
          onReplaceCurrent={() => {}}
          onReplaceAll={() => {}}
          onClose={() => onChangeFindState((prev) => ({ ...prev, isOpen: false }))}
        />
        <CodeEditor
          filePath={activeTab.path}
          content={activeTab.content}
          fontSize={settings.fontSize}
          tabSize={settings.tabSize || 2}
          isDirty={activeTab.isDirty}
          onChange={onChangeContent}
          onSave={onSave}
          onCursorChange={onCursorChange}
        />
      </div>
    );
  }

  // Handle Markdown insertions from toolbar
  const handleInsertMarkdown = (prefix: string, suffix: string = '', defaultText: string = '') => {
    const text = activeTab.content;
    const insertion = `${prefix}${defaultText}${suffix}`;
    onChangeContent(`${text}\n${insertion}`);
  };

  // Synchronized scroll handler
  const handleEditorScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (isSyncingScroll.current || !previewScrollRef.current) return;
    const target = e.currentTarget;
    const scrollRatio = target.scrollTop / (target.scrollHeight - target.clientHeight || 1);
    isSyncingScroll.current = true;
    previewScrollRef.current.scrollTop = scrollRatio * (previewScrollRef.current.scrollHeight - previewScrollRef.current.clientHeight);
    setTimeout(() => {
      isSyncingScroll.current = false;
    }, 50);
  };

  const handlePreviewScroll = () => {
    // Optional reverse scroll sync
  };

  const handleToggleCheckbox = (lineIndex: number, newChecked: boolean) => {
    const lines = activeTab.content.split('\n');
    if (lines[lineIndex]) {
      lines[lineIndex] = lines[lineIndex].replace(
        /- \[[ xX]\]/,
        newChecked ? '- [x]' : '- [ ]'
      );
      onChangeContent(lines.join('\n'));
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#16161e]">
      {/* Formatting Toolbar */}
      <FormattingToolbar
        onInsertMarkdown={handleInsertMarkdown}
        onOpenTemplates={onOpenTemplates}
      />

      {/* Find & Replace Bar */}
      <FindReplaceBar
        findState={findState}
        onChangeFindState={onChangeFindState}
        onFindNext={() => {}}
        onFindPrevious={() => {}}
        onReplaceCurrent={() => {}}
        onReplaceAll={() => {}}
        onClose={() => onChangeFindState((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Main Workspace Area (Edit / Split / Preview) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Source Editor */}
        {(activeTab.viewMode === 'edit' || activeTab.viewMode === 'split') && (
          <TextSourceEditor
            content={activeTab.content}
            fontSize={settings.fontSize}
            wordWrap={settings.wordWrap ?? true}
            lineNumbers={settings.lineNumbers ?? true}
            tabSize={settings.tabSize || 2}
            onChange={onChangeContent}
            onCursorChange={onCursorChange}
            onScroll={activeTab.viewMode === 'split' ? handleEditorScroll : undefined}
          />
        )}

        {/* Split Divider */}
        {activeTab.viewMode === 'split' && (
          <div className="w-[1px] bg-[#24283b] shrink-0" />
        )}

        {/* Live Preview */}
        {(activeTab.viewMode === 'preview' || activeTab.viewMode === 'split') && (
          <MarkdownPreview
            content={activeTab.content}
            fontSize={settings.fontSize}
            designatedFolder={settings.designatedFolder}
            onNavigateWikilink={onNavigateWikilink}
            onToggleCheckbox={handleToggleCheckbox}
            scrollRef={previewScrollRef}
            onScroll={handlePreviewScroll}
          />
        )}
      </div>
    </div>
  );
};
