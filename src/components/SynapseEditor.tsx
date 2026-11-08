import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ViewMode, VaultSettings, HeadingItem } from '../types';
import { parseMarkdown, resolveAssetPath, isArabicOrRtlText } from '../services/markdownParser';
import { vaultApi } from '../services/vaultApi';
import { detectLanguage } from '../services/codeLanguages';
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  CheckSquare,
  Code,
  Quote,
  Table,
  Sigma,
  FileCode,
  Save,
  Search,
  Replace,
  X,
  CaseSensitive,
  WholeWord,
  Regex,
} from 'lucide-react';

interface SynapseEditorProps {
  content: string;
  onChange: (newContent: string) => void;
  filePath: string;
  settings: VaultSettings;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onNavigateWikilink: (targetNote: string) => void;
  onOpenAssetViewer: (assetName: string, assetPath: string) => void;
  onOutlineExtracted?: (headings: HeadingItem[]) => void;
  onSave?: () => void;
}

export const SynapseEditor: React.FC<SynapseEditorProps> = ({
  content,
  onChange,
  filePath,
  settings,
  viewMode,
  onViewModeChange,
  onNavigateWikilink,
  onOpenAssetViewer,
  onOutlineExtracted,
  onSave,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const [assetUrls, setAssetUrls] = useState<Record<string, string>>({});

  // Local text state for instantaneous (0ms) keystroke response
  const [localText, setLocalText] = useState<string>(content);
  const [debouncedText, setDebouncedText] = useState<string>(content);
  const saveTimerRef = useRef<number | null>(null);
  const isTypingRef = useRef<boolean>(false);
  const currentFilePathRef = useRef<string>(filePath);
  const lastSavedRef = useRef<string>(content);

  // Find & Replace state
  const [showFind, setShowFind] = useState(false);
  const [findQuery, setFindQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const [matchCount, setMatchCount] = useState({ current: 0, total: 0 });

  // Detect file kind (Code vs Markdown)
  const isCodeFile = useMemo(() => {
    const ext = filePath.split('.').pop()?.toLowerCase() || '';
    return !['md', 'markdown', 'mdown', 'mkd', 'txt'].includes(ext);
  }, [filePath]);

  const languageInfo = useMemo(() => detectLanguage(filePath), [filePath]);

  // Synchronize when filePath changes or external content changes while idle
  useEffect(() => {
    if (currentFilePathRef.current !== filePath) {
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
    if (viewMode === 'source' || isCodeFile) return;
    const timer = setTimeout(() => {
      setDebouncedText(localText);
    }, 150);
    return () => clearTimeout(timer);
  }, [localText, viewMode, isCodeFile]);

  // Handle instant typing
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setLocalText(val);
    isTypingRef.current = true;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(() => {
      isTypingRef.current = false;
      lastSavedRef.current = val;
      onChange(val);
    }, 350);
  };

  // Detect RTL / Arabic
  const isContentRtl = useMemo(() => {
    if (settings.rtlMode === 'rtl') return true;
    if (settings.rtlMode === 'ltr') return false;
    return isArabicOrRtlText(localText);
  }, [localText, settings.rtlMode]);

  // Parse markdown
  const parsed = useMemo(() => {
    if (viewMode === 'source' || isCodeFile) {
      return { html: '', headings: [], outgoingLinks: [], tags: [] };
    }
    return parseMarkdown(debouncedText, filePath, settings, assetUrls);
  }, [debouncedText, filePath, settings, assetUrls, viewMode, isCodeFile]);

  // Notify headings
  useEffect(() => {
    if (parsed.headings && parsed.headings.length > 0) {
      onOutlineExtracted?.(parsed.headings);
    }
  }, [parsed.headings, onOutlineExtracted]);

  // Load asset previews
  useEffect(() => {
    if (viewMode === 'source' || isCodeFile) return;
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
          } catch (e) {}
        }
      }
      if (isMounted && Object.keys(newUrls).length > 0) {
        setAssetUrls((prev) => ({ ...prev, ...newUrls }));
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [debouncedText, filePath, settings, viewMode, isCodeFile, assetUrls]);

  // Handle Find in Document
  useEffect(() => {
    if (!findQuery || !localText) {
      setMatchCount({ current: 0, total: 0 });
      return;
    }
    try {
      let flags = 'g';
      if (!caseSensitive) flags += 'i';
      let pattern = findQuery;
      if (!useRegex) {
        pattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      }
      if (wholeWord) {
        pattern = `\\b${pattern}\\b`;
      }
      const regex = new RegExp(pattern, flags);
      const matches = localText.match(regex);
      setMatchCount({ current: matches ? 1 : 0, total: matches ? matches.length : 0 });
    } catch {
      setMatchCount({ current: 0, total: 0 });
    }
  }, [findQuery, localText, caseSensitive, wholeWord, useRegex]);

  // Replace Next
  const handleReplaceNext = () => {
    if (!findQuery || !localText) return;
    try {
      let flags = caseSensitive ? '' : 'i';
      let pattern = findQuery;
      if (!useRegex) pattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (wholeWord) pattern = `\\b${pattern}\\b`;
      const regex = new RegExp(pattern, flags);
      const next = localText.replace(regex, replaceQuery);
      setLocalText(next);
      onChange(next);
    } catch {}
  };

  // Replace All
  const handleReplaceAll = () => {
    if (!findQuery || !localText) return;
    try {
      let flags = 'g';
      if (!caseSensitive) flags += 'i';
      let pattern = findQuery;
      if (!useRegex) pattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (wholeWord) pattern = `\\b${pattern}\\b`;
      const regex = new RegExp(pattern, flags);
      const next = localText.replace(regex, replaceQuery);
      setLocalText(next);
      onChange(next);
    } catch {}
  };

  // Formatting insert helpers
  const insertFormatting = (prefix: string, suffix: string = '', defaultPlaceholder: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = localText.substring(start, end) || defaultPlaceholder;

    const replacement = `${prefix}${selected}${suffix}`;
    const next = localText.substring(0, start) + replacement + localText.substring(end);

    setLocalText(next);
    onChange(next);

    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start + prefix.length;
      textarea.selectionEnd = start + prefix.length + selected.length;
    }, 0);
  };

  // Synchronized scrolling between editor & preview
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (viewMode !== 'split' || !previewRef.current) return;
    const target = e.currentTarget;
    const ratio = target.scrollTop / (target.scrollHeight - target.clientHeight || 1);
    previewRef.current.scrollTop = ratio * (previewRef.current.scrollHeight - previewRef.current.clientHeight);
  };

  // Handle clicks inside rendered preview
  const handlePreviewClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;

    const wikilinkElem = target.closest('.synapse-wikilink, .wikilink') as HTMLElement;
    if (wikilinkElem && (wikilinkElem.dataset.wikilink || wikilinkElem.dataset.target)) {
      e.preventDefault();
      onNavigateWikilink(wikilinkElem.dataset.wikilink || wikilinkElem.dataset.target || '');
      return;
    }

    const assetImg = target.closest('.vault-asset-img') as HTMLImageElement;
    if (assetImg) {
      const p = assetImg.dataset.assetPath || '';
      const name = assetImg.alt || p.split('/').pop() || 'Asset';
      onOpenAssetViewer(name, p);
      return;
    }

    const assetBtn = target.closest('.open-asset-btn') as HTMLElement;
    if (assetBtn && assetBtn.dataset.assetPath) {
      const p = assetBtn.dataset.assetPath;
      const name = p.split('/').pop() || 'Asset';
      onOpenAssetViewer(name, p);
      return;
    }

    if (target instanceof HTMLInputElement && target.type === 'checkbox') {
      const li = target.closest('li');
      if (li) {
        const itemText = (li.textContent || '').trim();
        const checked = target.checked;
        const targetSearch = checked ? `- [ ] ${itemText}` : `- [x] ${itemText}`;
        const replacement = checked ? `- [x] ${itemText}` : `- [ ] ${itemText}`;
        if (localText.includes(targetSearch)) {
          const updated = localText.replace(targetSearch, replacement);
          setLocalText(updated);
          onChange(updated);
        }
      }
    }
  };

  const lines = localText.split('\n');

  return (
    <div className="flex flex-col h-full bg-[#16161e] select-none overflow-hidden">
      {/* Top Toolbar */}
      <div className="h-9 px-3 bg-[#1a1b26] border-b border-[#24283b] flex items-center justify-between text-xs shrink-0">
        {/* Left Toolbar formatting icons */}
        <div className="flex items-center gap-0.5 overflow-x-auto no-scrollbar">
          {isCodeFile ? (
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-[#73daca]" />
              <span className="font-mono text-xs text-[#c0caf5] font-medium">
                {filePath.split('/').pop()}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#24283b] text-[#73daca] font-mono border border-[#414868]/50">
                {languageInfo.name}
              </span>
            </div>
          ) : (
            <>
              <button
                onClick={() => insertFormatting('# ', '', 'Heading 1')}
                className="p-1.5 rounded hover:bg-[#24283b] text-[#787c99] hover:text-[#c0caf5] transition-colors"
                title="Heading 1"
              >
                <Heading1 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => insertFormatting('## ', '', 'Heading 2')}
                className="p-1.5 rounded hover:bg-[#24283b] text-[#787c99] hover:text-[#c0caf5] transition-colors"
                title="Heading 2"
              >
                <Heading2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => insertFormatting('### ', '', 'Heading 3')}
                className="p-1.5 rounded hover:bg-[#24283b] text-[#787c99] hover:text-[#c0caf5] transition-colors"
                title="Heading 3"
              >
                <Heading3 className="w-3.5 h-3.5" />
              </button>

              <div className="h-4 w-[1px] bg-[#24283b] mx-1" />

              <button
                onClick={() => insertFormatting('**', '**', 'bold text')}
                className="p-1.5 rounded hover:bg-[#24283b] text-[#787c99] hover:text-[#c0caf5] transition-colors"
                title="Bold (Ctrl+B)"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => insertFormatting('*', '*', 'italic text')}
                className="p-1.5 rounded hover:bg-[#24283b] text-[#787c99] hover:text-[#c0caf5] transition-colors"
                title="Italic (Ctrl+I)"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => insertFormatting('~~', '~~', 'strikethrough')}
                className="p-1.5 rounded hover:bg-[#24283b] text-[#787c99] hover:text-[#c0caf5] transition-colors"
                title="Strikethrough"
              >
                <Strikethrough className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => insertFormatting('`', '`', 'code')}
                className="p-1.5 rounded hover:bg-[#24283b] text-[#787c99] hover:text-[#c0caf5] transition-colors"
                title="Inline Code"
              >
                <Code className="w-3.5 h-3.5" />
              </button>

              <div className="h-4 w-[1px] bg-[#24283b] mx-1" />

              <button
                onClick={() => insertFormatting('- ', '', 'List item')}
                className="p-1.5 rounded hover:bg-[#24283b] text-[#787c99] hover:text-[#c0caf5] transition-colors"
                title="Bullet List"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => insertFormatting('- [ ] ', '', 'Task item')}
                className="p-1.5 rounded hover:bg-[#24283b] text-[#787c99] hover:text-[#c0caf5] transition-colors"
                title="Task Item"
              >
                <CheckSquare className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => insertFormatting('> ', '', 'Quote text')}
                className="p-1.5 rounded hover:bg-[#24283b] text-[#787c99] hover:text-[#c0caf5] transition-colors"
                title="Blockquote"
              >
                <Quote className="w-3.5 h-3.5" />
              </button>

              <div className="h-4 w-[1px] bg-[#24283b] mx-1" />

              <button
                onClick={() => insertFormatting('| Column 1 | Column 2 |\n| -------- | -------- |\n| Cell 1   | Cell 2   |\n')}
                className="p-1.5 rounded hover:bg-[#24283b] text-[#787c99] hover:text-[#c0caf5] transition-colors"
                title="Insert Table"
              >
                <Table className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => insertFormatting('$$\n', '\n$$\n', 'E = mc^2')}
                className="p-1.5 rounded hover:bg-[#24283b] text-[#787c99] hover:text-[#c0caf5] transition-colors"
                title="KaTeX Math Block"
              >
                <Sigma className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => insertFormatting('```mermaid\ngraph TD\n    A[Start] --> B(Process)\n```\n')}
                className="p-1.5 rounded hover:bg-[#24283b] text-[#787c99] hover:text-[#c0caf5] transition-colors"
                title="Mermaid Diagram"
              >
                <FileCode className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => insertFormatting('[[', ']]', 'Note Name')}
                className="p-1.5 rounded hover:bg-[#24283b] text-[#7aa2f7] hover:text-[#7dcfff] transition-colors font-medium"
                title="Wikilink"
              >
                [[wikilink]]
              </button>
            </>
          )}
        </div>

        {/* Right Action Controls: Find, View Mode toggles, Save */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowFind(!showFind)}
            className={`p-1.5 rounded transition-colors ${
              showFind ? 'bg-[#24283b] text-[#7aa2f7]' : 'text-[#787c99] hover:bg-[#24283b] hover:text-[#c0caf5]'
            }`}
            title="Find & Replace (Ctrl+F)"
          >
            <Search className="w-3.5 h-3.5" />
          </button>

          {!isCodeFile && (
            <div className="flex items-center bg-[#16161e] p-0.5 rounded border border-[#24283b]">
              <button
                onClick={() => onViewModeChange('source')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  viewMode === 'source' ? 'bg-[#24283b] text-[#7aa2f7]' : 'text-[#787c99] hover:text-[#c0caf5]'
                }`}
                title="Source View"
              >
                Source
              </button>
              <button
                onClick={() => onViewModeChange('split')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  viewMode === 'split' ? 'bg-[#24283b] text-[#7aa2f7]' : 'text-[#787c99] hover:text-[#c0caf5]'
                }`}
                title="Split View"
              >
                Split
              </button>
              <button
                onClick={() => onViewModeChange('reading')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  viewMode === 'reading' || viewMode === 'preview' ? 'bg-[#24283b] text-[#7aa2f7]' : 'text-[#787c99] hover:text-[#c0caf5]'
                }`}
                title="Reading View"
              >
                Reading
              </button>
            </div>
          )}

          {onSave && (
            <button
              onClick={onSave}
              className="px-2.5 py-1 rounded bg-[#7aa2f7] hover:bg-[#89b4fa] text-[#16161e] font-medium text-[11px] transition-colors flex items-center gap-1 shadow-sm"
              title="Save File (Ctrl+S)"
            >
              <Save className="w-3 h-3" />
              <span>Save</span>
            </button>
          )}
        </div>
      </div>

      {/* Find and Replace Bar */}
      {showFind && (
        <div className="bg-[#1f2335] border-b border-[#24283b] p-2 flex flex-col gap-1.5 text-xs shadow-md z-10 shrink-0">
          <div className="flex items-center gap-1.5">
            <div className="relative flex-1 flex items-center">
              <Search className="w-3.5 h-3.5 text-[#565f89] absolute left-2 pointer-events-none" />
              <input
                type="text"
                value={findQuery}
                onChange={(e) => setFindQuery(e.target.value)}
                placeholder="Find in document..."
                className="w-full bg-[#16161e] border border-[#24283b] focus:border-[#7aa2f7] rounded pl-7 pr-16 py-1 text-xs text-[#c0caf5] outline-none"
                autoFocus
              />
              <div className="absolute right-2 text-[10px] text-[#565f89] font-mono">
                {matchCount.total > 0 ? `${matchCount.current}/${matchCount.total}` : findQuery ? 'No match' : ''}
              </div>
            </div>

            <div className="flex items-center bg-[#16161e] border border-[#24283b] rounded p-0.5">
              <button
                onClick={() => setCaseSensitive(!caseSensitive)}
                className={`p-1 rounded transition-colors ${
                  caseSensitive ? 'bg-[#24283b] text-[#7aa2f7]' : 'text-[#565f89]'
                }`}
                title="Match Case"
              >
                <CaseSensitive className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setWholeWord(!wholeWord)}
                className={`p-1 rounded transition-colors ${
                  wholeWord ? 'bg-[#24283b] text-[#7aa2f7]' : 'text-[#565f89]'
                }`}
                title="Match Whole Word"
              >
                <WholeWord className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setUseRegex(!useRegex)}
                className={`p-1 rounded transition-colors ${
                  useRegex ? 'bg-[#24283b] text-[#7aa2f7]' : 'text-[#565f89]'
                }`}
                title="Use Regular Expression"
              >
                <Regex className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={() => setShowFind(false)}
              className="p-1 rounded hover:bg-[#24283b] text-[#565f89] hover:text-[#c0caf5]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="relative flex-1 flex items-center">
              <Replace className="w-3.5 h-3.5 text-[#565f89] absolute left-2 pointer-events-none" />
              <input
                type="text"
                value={replaceQuery}
                onChange={(e) => setReplaceQuery(e.target.value)}
                placeholder="Replace with..."
                className="w-full bg-[#16161e] border border-[#24283b] focus:border-[#7aa2f7] rounded pl-7 pr-3 py-1 text-xs text-[#c0caf5] outline-none"
              />
            </div>
            <button
              onClick={handleReplaceNext}
              className="px-2.5 py-1 rounded bg-[#24283b] hover:bg-[#3d59a1] text-[#c0caf5] text-[11px] font-medium transition-colors"
            >
              Replace
            </button>
            <button
              onClick={handleReplaceAll}
              className="px-2.5 py-1 rounded bg-[#24283b] hover:bg-[#3d59a1] text-[#c0caf5] text-[11px] font-medium transition-colors"
            >
              Replace All
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Source / Code Editor Area */}
        {(viewMode === 'source' || viewMode === 'split' || isCodeFile) && (
          <div className="flex-1 flex h-full overflow-hidden bg-[#16161e]">
            {/* Line numbers gutter */}
            <div
              style={{ fontSize: `${settings.fontSize || 15}px`, lineHeight: 1.6 }}
              className="w-12 bg-[#16161e] text-[#414868] text-right pr-3 font-mono select-none pt-4 border-r border-[#24283b] shrink-0 overflow-hidden"
            >
              {lines.map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={localText}
              onChange={handleTextareaChange}
              onScroll={handleScroll}
              style={{
                fontSize: `${settings.fontSize || 15}px`,
                lineHeight: 1.6,
                fontFamily: "'JetBrains Mono', 'Fira Code', Menlo, monospace",
                direction: isContentRtl ? 'rtl' : 'ltr',
                tabSize: settings.tabSize || 2,
              }}
              spellCheck={false}
              className="flex-1 w-full h-full p-4 bg-[#16161e] text-[#c0caf5] outline-none resize-none overflow-y-auto font-mono selection:bg-[#3d59a1]/50 caret-[#7aa2f7]"
            />
          </div>
        )}

        {/* Split Divider */}
        {viewMode === 'split' && !isCodeFile && (
          <div className="w-[1px] bg-[#24283b] shrink-0" />
        )}

        {/* Live Preview Area */}
        {(viewMode === 'reading' || viewMode === 'split' || viewMode === 'live') && !isCodeFile && (
          <div
            ref={previewRef}
            onClick={handlePreviewClick}
            style={{ fontSize: `${settings.fontSize || 15}px`, lineHeight: 1.7 }}
            className="flex-1 h-full overflow-y-auto p-8 bg-[#1a1b26] text-[#c0caf5] prose prose-invert max-w-none selection:bg-[#3d59a1]/50"
            dangerouslySetInnerHTML={{ __html: parsed.html }}
          />
        )}
      </div>
    </div>
  );
};
