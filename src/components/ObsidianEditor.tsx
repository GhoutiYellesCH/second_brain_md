import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ViewMode, VaultSettings, HeadingItem } from '../types';
import { parseMarkdown, resolveAssetPath, isArabicOrRtlText } from '../services/markdownParser';
import { vaultApi } from '../services/vaultApi';
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Code,
  Quote,
  Table,
  Sigma,
  FileCode,
  Eye,
  Columns,
  Sparkles,
  Paperclip,
  Languages,
} from 'lucide-react';

interface ObsidianEditorProps {
  content: string;
  onChange: (newContent: string) => void;
  filePath: string;
  settings: VaultSettings;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onNavigateWikilink: (targetNote: string) => void;
  onOpenAssetViewer: (assetName: string, assetPath: string) => void;
  onOutlineExtracted?: (headings: HeadingItem[]) => void;
}

export const ObsidianEditor: React.FC<ObsidianEditorProps> = ({
  content,
  onChange,
  filePath,
  settings,
  viewMode,
  onViewModeChange,
  onNavigateWikilink,
  onOpenAssetViewer,
  onOutlineExtracted,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const [assetUrls, setAssetUrls] = useState<Record<string, string>>({});
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  // Local text state for instantaneous (0ms) keystroke response
  const [localText, setLocalText] = useState<string>(content);
  const [debouncedText, setDebouncedText] = useState<string>(content);
  const saveTimerRef = useRef<number | null>(null);
  const isTypingRef = useRef<boolean>(false);
  const currentFilePathRef = useRef<string>(filePath);
  const lastSavedRef = useRef<string>(content);

  // Synchronize when filePath changes or external content changes while idle
  useEffect(() => {
    if (currentFilePathRef.current !== filePath) {
      // Flush previous file if dirty
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
        if (localText !== lastSavedRef.current) {
          onChange(localText);
        }
      }
      currentFilePathRef.current = filePath;
      setLocalText(content);
      setDebouncedText(content);
      lastSavedRef.current = content;
      isTypingRef.current = false;
    } else if (content !== localText && !isTypingRef.current) {
      setLocalText(content);
      setDebouncedText(content);
      lastSavedRef.current = content;
    }
  }, [filePath, content, localText, onChange]);

  // Debounce preview rendering for live/split modes (150ms)
  useEffect(() => {
    if (viewMode === 'source') return;
    const timer = setTimeout(() => {
      setDebouncedText(localText);
    }, 150);
    return () => clearTimeout(timer);
  }, [localText, viewMode]);

  // Immediate save flush on blur or unmount
  const flushSave = () => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    isTypingRef.current = false;
    if (localText !== lastSavedRef.current) {
      lastSavedRef.current = localText;
      onChange(localText);
    }
  };

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  // Instant typing handler
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setLocalText(val); // 0ms delay inside editor!
    isTypingRef.current = true;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(() => {
      isTypingRef.current = false;
      lastSavedRef.current = val;
      onChange(val);
    }, 350);
  };

  // Arabic / RTL Writing Direction State
  const [editorRtl, setEditorRtl] = useState<'auto' | 'rtl' | 'ltr'>(settings.rtlMode || 'auto');

  // Detect whether content is predominantly RTL / Arabic
  const isContentRtl = useMemo(() => {
    if (editorRtl === 'rtl') return true;
    if (editorRtl === 'ltr') return false;
    return isArabicOrRtlText(localText);
  }, [localText, editorRtl]);

  // Parse markdown content only for preview modes (never parse in source mode)
  const parsed = useMemo(() => {
    if (viewMode === 'source') {
      return { html: '', headings: [] };
    }
    return parseMarkdown(debouncedText, filePath, settings, assetUrls);
  }, [debouncedText, filePath, settings, assetUrls, viewMode]);

  // Notify parent of headings for Outline pane
  useEffect(() => {
    if (parsed.headings && parsed.headings.length > 0) {
      onOutlineExtracted?.(parsed.headings);
    }
  }, [parsed.headings, onOutlineExtracted]);

  // Load and cache asset previews from vault (on debounced text, not on every keystroke)
  useEffect(() => {
    if (viewMode === 'source') return;
    const assetRegex = /!\[\[(.*?)\]\]/g;
    let match;
    const assetsToLoad: string[] = [];
    while ((match = assetRegex.exec(debouncedText)) !== null) {
      const assetName = match[1].split('|')[0].trim();
      assetsToLoad.push(assetName);
    }

    if (assetsToLoad.length === 0) return;

    let isMounted = true;
    (async () => {
      const newUrls: Record<string, string> = {};
      for (const assetName of assetsToLoad) {
        const fullPath = resolveAssetPath(assetName, filePath, settings);
        if (!assetUrls[fullPath] && !newUrls[fullPath]) {
          try {
            const data = await vaultApi.readAssetFile(fullPath);
            newUrls[fullPath] = `data:${data.mime_type};base64,${data.base64_data}`;
            newUrls[assetName] = newUrls[fullPath];
          } catch (e) {
            // Asset might not exist or failed to load
          }
        }
      }
      if (isMounted && Object.keys(newUrls).length > 0) {
        setAssetUrls((prev) => ({ ...prev, ...newUrls }));
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [debouncedText, filePath, settings, viewMode]);

  // Handle clicks inside rendered preview (wikilinks, copy code, asset clicks)
  const handlePreviewClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;

    // Check if wikilink clicked
    const wikilinkElem = target.closest('.obsidian-wikilink') as HTMLElement;
    if (wikilinkElem && wikilinkElem.dataset.wikilink) {
      e.preventDefault();
      onNavigateWikilink(wikilinkElem.dataset.wikilink);
      return;
    }

    // Check if asset image clicked
    const assetImg = target.closest('.vault-asset-img') as HTMLImageElement;
    if (assetImg) {
      const assetPath = assetImg.dataset.assetPath || '';
      const assetName = assetImg.alt || assetPath.split('/').pop() || 'Asset';
      onOpenAssetViewer(assetName, assetPath);
      return;
    }

    // Check if PDF open button clicked
    const assetBtn = target.closest('.open-asset-btn') as HTMLElement;
    if (assetBtn && assetBtn.dataset.assetPath) {
      const assetPath = assetBtn.dataset.assetPath;
      const assetName = assetPath.split('/').pop() || 'Asset';
      onOpenAssetViewer(assetName, assetPath);
      return;
    }

    // Check if Copy Code clicked
    const copyBtn = target.closest('.copy-code-btn') as HTMLElement;
    if (copyBtn && copyBtn.dataset.code) {
      const code = decodeURIComponent(copyBtn.dataset.code);
      navigator.clipboard.writeText(code);
      copyBtn.textContent = 'Copied!';
      setTimeout(() => {
        copyBtn.textContent = 'Copy';
      }, 2000);
      return;
    }

    // Check if Task list checkbox clicked
    if (target instanceof HTMLInputElement && target.type === 'checkbox') {
      const li = target.closest('.task-list-item');
      if (li && li.parentElement) {
        const itemText = (li.textContent || '').trim();
        // Toggle in markdown content
        const checked = target.checked;
        const targetSearch = checked ? `- [ ] ${itemText}` : `- [x] ${itemText}`;
        const replacement = checked ? `- [x] ${itemText}` : `- [ ] ${itemText}`;
        if (localText.includes(targetSearch)) {
          const updated = localText.replace(targetSearch, replacement);
          setLocalText(updated);
          setDebouncedText(updated);
          lastSavedRef.current = updated;
          if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
          onChange(updated);
        }
      }
    }
  };

  // Text insertion helper for formatting toolbar
  const insertText = (before: string, after: string = '', defaultPlaceholder: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = localText.substring(start, end) || defaultPlaceholder;

    const newContent =
      localText.substring(0, start) + before + selected + after + localText.substring(end);
    setLocalText(newContent);
    setDebouncedText(newContent);
    lastSavedRef.current = newContent;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    onChange(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 0);
  };

  // Drag and Drop files / images into editor
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    for (const file of files) {
      await saveAndInsertAsset(file);
    }
  };

  // Paste image directly from clipboard
  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData.items);
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          e.preventDefault();
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const ext = file.type.split('/')[1] || 'png';
          const namedFile = new File([file], `Pasted_Image_${timestamp}.${ext}`, {
            type: file.type,
          });
          await saveAndInsertAsset(namedFile);
        }
      }
    }
  };

  const saveAndInsertAsset = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result as string;
      const targetPath = resolveAssetPath(file.name, filePath, settings);

      try {
        await vaultApi.saveAssetFile(targetPath, base64Data);
        // Cache data uri locally
        setAssetUrls((prev) => ({
          ...prev,
          [targetPath]: base64Data,
          [file.name]: base64Data,
        }));

        // Insert ![[filename]] into markdown
        insertText(`\n![[${file.name}]]\n`);
      } catch (err) {
        console.error('Failed to save asset:', err);
      }
    };
    reader.readAsDataURL(file);
  };

  // File Picker for "Insert Attachment" button
  const handleInsertAttachmentClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,audio/*,video/*,application/pdf';
    input.onchange = async () => {
      if (input.files && input.files[0]) {
        await saveAndInsertAsset(input.files[0]);
      }
    };
    input.click();
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col h-full bg-[#18181b] relative select-text ${
        isDragOver ? 'ring-2 ring-purple-500 ring-inset bg-purple-950/20' : ''
      }`}
    >
      {/* Top Editor Toolbar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#141416] border-b border-zinc-800 text-zinc-300 text-xs shrink-0 select-none">
        {/* Formatting Actions */}
        <div className="flex items-center gap-1 overflow-x-auto py-0.5">
          <button
            onClick={() => insertText('**', '**', 'bold text')}
            className="p-1.5 hover:bg-zinc-800 rounded text-zinc-300 hover:text-white"
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertText('*', '*', 'italic text')}
            className="p-1.5 hover:bg-zinc-800 rounded text-zinc-300 hover:text-white"
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertText('~~', '~~', 'strikethrough')}
            className="p-1.5 hover:bg-zinc-800 rounded text-zinc-300 hover:text-white"
            title="Strikethrough"
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </button>

          <div className="w-[1px] h-4 bg-zinc-700/60 mx-1" />

          <button
            onClick={() => insertText('# ', '', 'Heading 1')}
            className="p-1.5 hover:bg-zinc-800 rounded text-zinc-300 hover:text-white"
            title="Heading 1"
          >
            <Heading1 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertText('## ', '', 'Heading 2')}
            className="p-1.5 hover:bg-zinc-800 rounded text-zinc-300 hover:text-white"
            title="Heading 2"
          >
            <Heading2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertText('### ', '', 'Heading 3')}
            className="p-1.5 hover:bg-zinc-800 rounded text-zinc-300 hover:text-white"
            title="Heading 3"
          >
            <Heading3 className="w-3.5 h-3.5" />
          </button>

          <div className="w-[1px] h-4 bg-zinc-700/60 mx-1" />

          <button
            onClick={() => insertText('- ', '', 'List item')}
            className="p-1.5 hover:bg-zinc-800 rounded text-zinc-300 hover:text-white"
            title="Bullet List"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertText('1. ', '', 'Numbered item')}
            className="p-1.5 hover:bg-zinc-800 rounded text-zinc-300 hover:text-white"
            title="Numbered List"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertText('- [ ] ', '', 'Task todo')}
            className="p-1.5 hover:bg-zinc-800 rounded text-zinc-300 hover:text-white"
            title="Task Checkbox"
          >
            <CheckSquare className="w-3.5 h-3.5" />
          </button>

          <div className="w-[1px] h-4 bg-zinc-700/60 mx-1" />

          <button
            onClick={() => insertText('[[', ']]', 'Note Title')}
            className="p-1.5 hover:bg-zinc-800 rounded text-purple-400 hover:text-purple-300 font-mono text-[11px] font-bold"
            title="Obsidian Wikilink [[Note]]"
          >
            [[ ]]
          </button>
          <button
            onClick={handleInsertAttachmentClick}
            className="p-1.5 hover:bg-zinc-800 rounded text-purple-400 hover:text-purple-300"
            title="Insert Vault Attachment / Asset"
          >
            <Paperclip className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertText('```\n', '\n```', 'code here')}
            className="p-1.5 hover:bg-zinc-800 rounded text-zinc-300 hover:text-white"
            title="Code Block"
          >
            <Code className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertText('> [!NOTE] ', '\n> Callout content', 'Important Note')}
            className="p-1.5 hover:bg-zinc-800 rounded text-blue-400 hover:text-blue-300"
            title="Obsidian Callout Box"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertText('$$\n', '\n$$', 'E = mc^2')}
            className="p-1.5 hover:bg-zinc-800 rounded text-emerald-400 hover:text-emerald-300"
            title="LaTeX Math Equation"
          >
            <Sigma className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() =>
              insertText(
                '| Header 1 | Header 2 |\n| :--- | :--- |\n| Content 1 | Content 2 |\n'
              )
            }
            className="p-1.5 hover:bg-zinc-800 rounded text-zinc-300 hover:text-white"
            title="Table"
          >
            <Table className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right Section: RTL Toggle & View Mode Switcher */}
        <div className="flex items-center gap-2">
          {/* RTL / Arabic Direction Toggle */}
          <button
            onClick={() => {
              const nextMode = editorRtl === 'auto' ? 'rtl' : editorRtl === 'rtl' ? 'ltr' : 'auto';
              setEditorRtl(nextMode);
            }}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium border transition-colors ${
              isContentRtl
                ? 'bg-purple-950/60 text-purple-300 border-purple-700/60'
                : 'bg-zinc-900/60 text-zinc-400 border-zinc-800 hover:text-zinc-200'
            }`}
            title={`Text Direction: ${editorRtl.toUpperCase()} (Click to toggle Auto / RTL Arabic / LTR)`}
          >
            <Languages className="w-3.5 h-3.5" />
            <span className="font-mono text-[11px]">
              {editorRtl === 'rtl' ? 'RTL (ع)' : editorRtl === 'ltr' ? 'LTR' : isContentRtl ? 'AUTO (ع)' : 'AUTO'}
            </span>
          </button>

          {/* View Mode Switcher Pill */}
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 shadow-inner">
          <button
            onClick={() => onViewModeChange('live')}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
              viewMode === 'live'
                ? 'bg-purple-600 text-white shadow'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Live Preview Mode"
          >
            <Sparkles className="w-3 h-3" />
            <span>Live</span>
          </button>
          <button
            onClick={() => onViewModeChange('reading')}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
              viewMode === 'reading'
                ? 'bg-purple-600 text-white shadow'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Reading / Preview Mode"
          >
            <Eye className="w-3 h-3" />
            <span>Reading</span>
          </button>
          <button
            onClick={() => onViewModeChange('source')}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
              viewMode === 'source'
                ? 'bg-purple-600 text-white shadow'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Source Mode"
          >
            <FileCode className="w-3 h-3" />
            <span>Source</span>
          </button>
          <button
            onClick={() => onViewModeChange('split')}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
              viewMode === 'split'
                ? 'bg-purple-600 text-white shadow'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Split Mode (Editor + Preview)"
          >
            <Columns className="w-3 h-3" />
            <span>Split</span>
          </button>
        </div>
      </div>
    </div>

      {/* Editor Content Area based on mode */}
      <div className={`flex-1 flex overflow-hidden relative ${isContentRtl ? 'is-rtl' : ''}`}>
        {/* Mode: Source Only */}
        {viewMode === 'source' && (
          <textarea
            ref={textareaRef}
            dir={isContentRtl ? 'rtl' : 'auto'}
            value={localText}
            onChange={handleTextareaChange}
            onBlur={flushSave}
            onPaste={handlePaste}
            placeholder="Write your markdown note here..."
            className={`w-full h-full bg-[#161619] text-zinc-100 font-mono p-6 resize-none outline-none leading-relaxed text-sm selection:bg-purple-900/60 ${
              isContentRtl ? 'text-right' : ''
            }`}
            style={{ fontSize: `${settings.fontSize}px` }}
          />
        )}

        {/* Mode: Reading Only */}
        {viewMode === 'reading' && (
          <div
            ref={previewRef}
            dir={isContentRtl ? 'rtl' : 'auto'}
            onClick={handlePreviewClick}
            dangerouslySetInnerHTML={{ __html: parsed.html }}
            className={`w-full h-full overflow-y-auto px-10 py-8 prose prose-invert max-w-4xl mx-auto text-zinc-200 selection:bg-purple-900/60 leading-relaxed font-sans ${
              isContentRtl ? 'text-right' : ''
            }`}
            style={{ fontSize: `${settings.fontSize}px` }}
          />
        )}

        {/* Mode: Split Mode (Left Editor, Right Rendered Preview) */}
        {viewMode === 'split' && (
          <div className="flex w-full h-full divide-x divide-zinc-800">
            <div className="w-1/2 h-full flex flex-col">
              <textarea
                ref={textareaRef}
                dir={isContentRtl ? 'rtl' : 'auto'}
                value={localText}
                onChange={handleTextareaChange}
                onBlur={flushSave}
                onPaste={handlePaste}
                placeholder="Write your note in markdown..."
                className={`w-full h-full bg-[#161619] text-zinc-100 font-mono p-5 resize-none outline-none leading-relaxed text-sm selection:bg-purple-900/60 ${
                  isContentRtl ? 'text-right' : ''
                }`}
                style={{ fontSize: `${settings.fontSize}px` }}
              />
            </div>
            <div
              ref={previewRef}
              dir={isContentRtl ? 'rtl' : 'auto'}
              onClick={handlePreviewClick}
              dangerouslySetInnerHTML={{ __html: parsed.html }}
              className={`w-1/2 h-full overflow-y-auto p-6 prose prose-invert text-zinc-200 selection:bg-purple-900/60 leading-relaxed font-sans ${
                isContentRtl ? 'text-right' : ''
              }`}
              style={{ fontSize: `${settings.fontSize}px` }}
            />
          </div>
        )}

        {/* Mode: Live Preview (Obsidian hybrid) */}
        {viewMode === 'live' && (
          <div className="w-full h-full flex flex-col overflow-y-auto">
            <div className="max-w-4xl w-full mx-auto p-8 flex flex-col flex-1">
              <textarea
                ref={textareaRef}
                dir={isContentRtl ? 'rtl' : 'auto'}
                value={localText}
                onChange={handleTextareaChange}
                onBlur={flushSave}
                onPaste={handlePaste}
                placeholder="Start typing your thoughts with [[wikilinks]], #tags, and assets..."
                className={`w-full min-h-[300px] bg-transparent text-zinc-100 font-mono resize-none outline-none leading-relaxed text-sm border-b border-zinc-800/80 pb-6 focus:border-purple-500/80 transition-colors ${
                  isContentRtl ? 'text-right' : ''
                }`}
                style={{ fontSize: `${settings.fontSize}px` }}
              />

              {/* Live Rendered Canvas Below / Synced */}
              <div className="mt-6 pt-2">
                <div className="flex items-center gap-2 text-xs text-purple-400 font-medium mb-4 select-none">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Live Rendered Components</span>
                </div>
                <div
                  dir={isContentRtl ? 'rtl' : 'auto'}
                  onClick={handlePreviewClick}
                  dangerouslySetInnerHTML={{ __html: parsed.html }}
                  className={`prose prose-invert max-w-none text-zinc-200 selection:bg-purple-900/60 leading-relaxed font-sans ${
                    isContentRtl ? 'text-right' : ''
                  }`}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Drag & drop overlay cue */}
      {isDragOver && (
        <div className="absolute inset-0 bg-purple-950/70 backdrop-blur-sm z-30 flex flex-col items-center justify-center text-white pointer-events-none animate-in fade-in">
          <Paperclip className="w-12 h-12 text-purple-400 mb-2 animate-bounce" />
          <p className="font-semibold text-lg">Drop Asset into Vault</p>
          <p className="text-xs text-purple-300">
            Will automatically save to{' '}
            <span className="font-mono bg-purple-900/80 px-1.5 py-0.5 rounded">
              {settings.assetsMode === 'designated' ? settings.designatedFolder : settings.assetsMode}
            </span>{' '}
            and link as ![[...]]
          </p>
        </div>
      )}
    </div>
  );
};
