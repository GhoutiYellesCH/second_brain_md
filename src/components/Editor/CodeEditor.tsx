import React, { useRef } from 'react';
import 'prismjs';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-toml';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-css';
import { detectLanguage } from '../../services/codeLanguages';
import { Code, Save, Copy, Check } from 'lucide-react';

interface CodeEditorProps {
  filePath: string;
  content: string;
  fontSize: number;
  tabSize: number;
  isDirty?: boolean;
  onChange: (value: string) => void;
  onSave: () => void;
  onCursorChange?: (line: number, col: number) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  filePath,
  content,
  fontSize,
  tabSize,
  isDirty,
  onChange,
  onSave,
  onCursorChange,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [copied, setCopied] = React.useState(false);
  const language = React.useMemo(() => detectLanguage(filePath), [filePath]);

  const lines = content.split('\n');

  const updateCursor = () => {
    if (!textareaRef.current) return;
    const pos = textareaRef.current.selectionStart;
    const textBefore = content.substring(0, pos);
    const lineIndex = textBefore.split('\n').length;
    const lastNewline = textBefore.lastIndexOf('\n');
    const colIndex = lastNewline === -1 ? pos + 1 : pos - lastNewline;
    onCursorChange?.(lineIndex, colIndex);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      onSave();
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const spaces = ' '.repeat(tabSize);

      if (e.shiftKey) {
        const lastNewline = content.lastIndexOf('\n', start - 1);
        const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;
        if (content.substring(lineStart, lineStart + tabSize) === spaces) {
          const next = content.substring(0, lineStart) + content.substring(lineStart + tabSize);
          onChange(next);
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = Math.max(lineStart, start - tabSize);
          }, 0);
        }
      } else {
        const next = content.substring(0, start) + spaces + content.substring(end);
        onChange(next);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + tabSize;
        }, 0);
      }
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[#16161e] select-none">
      {/* Code Editor Header Bar */}
      <div className="h-9 bg-[#1a1b26] border-b border-[#24283b] px-3 flex items-center justify-between text-xs shrink-0">
        <div className="flex items-center gap-2">
          <Code className="w-4 h-4 text-[#73daca]" />
          <span className="font-mono text-[#c0caf5] text-xs font-medium">
            {filePath.split('/').pop() || 'code'}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-[#24283b] text-[#73daca] font-mono border border-[#414868]/50">
            {language.name}
          </span>
          {isDirty && (
            <span className="text-[#e0af68] text-[10px] font-semibold">(Unsaved)</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="p-1.5 rounded hover:bg-[#24283b] text-[#787c99] hover:text-[#c0caf5] transition-colors flex items-center gap-1 text-[11px]"
            title="Copy Code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#73daca]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            onClick={onSave}
            className="px-2.5 py-1 rounded bg-[#7aa2f7] hover:bg-[#89b4fa] text-[#16161e] font-medium text-[11px] transition-colors flex items-center gap-1 shadow-sm"
            title="Save File (Ctrl+S)"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save</span>
          </button>
        </div>
      </div>

      {/* Editor Body with Gutter */}
      <div className="flex-1 flex overflow-hidden">
        {/* Line Numbers Gutter */}
        <div
          style={{ fontSize: `${fontSize}px`, lineHeight: 1.6 }}
          className="w-12 bg-[#16161e] text-[#414868] text-right pr-3 font-mono select-none pt-4 border-r border-[#24283b] shrink-0 overflow-hidden"
        >
          {lines.map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        {/* Text Area */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => {
            onChange(e.target.value);
            updateCursor();
          }}
          onKeyUp={updateCursor}
          onClick={updateCursor}
          onKeyDown={handleKeyDown}
          style={{
            fontSize: `${fontSize}px`,
            lineHeight: 1.6,
            fontFamily: "'JetBrains Mono', 'Fira Code', Menlo, monospace",
            whiteSpace: 'pre',
            tabSize,
          }}
          spellCheck={false}
          className="flex-1 w-full h-full p-4 bg-[#16161e] text-[#c0caf5] outline-none resize-none overflow-y-auto font-mono selection:bg-[#3d59a1]/50 caret-[#73daca]"
        />
      </div>
    </div>
  );
};
