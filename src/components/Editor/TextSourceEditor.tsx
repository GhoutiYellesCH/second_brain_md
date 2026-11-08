import React, { useRef, useState } from 'react';
import { SlashMenu } from './SlashMenu';

interface TextSourceEditorProps {
  content: string;
  fontSize: number;
  wordWrap: boolean;
  lineNumbers: boolean;
  tabSize: number;
  onChange: (value: string) => void;
  onCursorChange?: (line: number, col: number) => void;
  onScroll?: (e: React.UIEvent<HTMLTextAreaElement>) => void;
}

export const TextSourceEditor: React.FC<TextSourceEditorProps> = ({
  content,
  fontSize,
  wordWrap,
  lineNumbers,
  tabSize,
  onChange,
  onCursorChange,
  onScroll,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [slashState, setSlashState] = useState<{
    isOpen: boolean;
    query: string;
    position: { top: number; left: number };
    startPos: number;
  }>({
    isOpen: false,
    query: '',
    position: { top: 0, left: 0 },
    startPos: 0,
  });

  const lines = content.split('\n');

  // Handle cursor movement
  const updateCursorPos = () => {
    if (!textareaRef.current) return;
    const pos = textareaRef.current.selectionStart;
    const textBefore = content.substring(0, pos);
    const lineIndex = textBefore.split('\n').length;
    const lastNewline = textBefore.lastIndexOf('\n');
    const colIndex = lastNewline === -1 ? pos + 1 : pos - lastNewline;

    onCursorChange?.(lineIndex, colIndex);

    // Check for slash command at current line start or after space
    const currentLine = lines[lineIndex - 1] || '';
    const slashIdx = currentLine.lastIndexOf('/');
    if (slashIdx !== -1 && pos >= textBefore.length - (currentLine.length - slashIdx)) {
      const query = currentLine.substring(slashIdx + 1);
      const rect = textareaRef.current.getBoundingClientRect();
      setSlashState({
        isOpen: true,
        query,
        position: {
          top: Math.min(window.innerHeight - 300, rect.top + lineIndex * (fontSize * 1.5) + 20),
          left: Math.min(window.innerWidth - 280, rect.left + 50),
        },
        startPos: pos - query.length - 1,
      });
    } else {
      if (slashState.isOpen) {
        setSlashState((prev) => ({ ...prev, isOpen: false }));
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // 1. Tab / Shift+Tab Indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const spaces = ' '.repeat(tabSize);

      if (e.shiftKey) {
        // Outdent line
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
        // Indent
        const next = content.substring(0, start) + spaces + content.substring(end);
        onChange(next);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + tabSize;
        }, 0);
      }
    }

    // 2. Automatic list continuation on Enter
    if (e.key === 'Enter' && !slashState.isOpen) {
      const start = textarea.selectionStart;
      const lineStart = content.lastIndexOf('\n', start - 1) + 1;
      const currentLine = content.substring(lineStart, start);

      const taskMatch = currentLine.match(/^(\s*)-\s\[([ xX])\]\s/);
      const bulletMatch = currentLine.match(/^(\s*)-\s/);
      const numberedMatch = currentLine.match(/^(\s*)(\d+)\.\s/);

      if (taskMatch) {
        e.preventDefault();
        const prefix = taskMatch[0].replace(/\[[xX]\]/, '[ ]');
        const next = content.substring(0, start) + '\n' + prefix + content.substring(start);
        onChange(next);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 1 + prefix.length;
        }, 0);
      } else if (bulletMatch) {
        e.preventDefault();
        const prefix = bulletMatch[0];
        const next = content.substring(0, start) + '\n' + prefix + content.substring(start);
        onChange(next);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 1 + prefix.length;
        }, 0);
      } else if (numberedMatch) {
        e.preventDefault();
        const nextNum = parseInt(numberedMatch[2], 10) + 1;
        const prefix = `${numberedMatch[1]}${nextNum}. `;
        const next = content.substring(0, start) + '\n' + prefix + content.substring(start);
        onChange(next);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 1 + prefix.length;
        }, 0);
      }
    }

    // 3. Bracket / Quote auto-close
    const pairMap: Record<string, string> = {
      '[': ']',
      '(': ')',
      '{': '}',
      '`': '`',
      '"': '"',
      "'": "'",
    };
    if (pairMap[e.key] && textarea.selectionStart === textarea.selectionEnd) {
      e.preventDefault();
      const pos = textarea.selectionStart;
      const closeChar = pairMap[e.key];
      const next = content.substring(0, pos) + e.key + closeChar + content.substring(pos);
      onChange(next);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = pos + 1;
      }, 0);
    }
  };

  const handleSlashSelect = (insertText: string) => {
    if (!textareaRef.current) return;
    const start = slashState.startPos;
    const end = textareaRef.current.selectionStart;
    const next = content.substring(0, start) + insertText + content.substring(end);
    onChange(next);
    setSlashState((prev) => ({ ...prev, isOpen: false }));
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + insertText.length;
      }
    }, 0);
  };

  return (
    <div className="relative flex-1 flex h-full overflow-hidden bg-[#16161e]">
      {/* Line Numbers Gutter */}
      {lineNumbers && (
        <div
          style={{ fontSize: `${fontSize}px`, lineHeight: 1.6 }}
          className="w-12 bg-[#16161e] text-[#414868] text-right pr-3 font-mono select-none pt-4 border-r border-[#24283b] shrink-0 overflow-hidden"
        >
          {lines.map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
      )}

      {/* Main Textarea */}
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => {
          onChange(e.target.value);
          updateCursorPos();
        }}
        onKeyUp={updateCursorPos}
        onClick={updateCursorPos}
        onKeyDown={handleKeyDown}
        onScroll={onScroll}
        style={{
          fontSize: `${fontSize}px`,
          lineHeight: 1.6,
          fontFamily: "'JetBrains Mono', 'Fira Code', Menlo, monospace",
          whiteSpace: wordWrap ? 'pre-wrap' : 'pre',
          tabSize,
        }}
        spellCheck={false}
        className="flex-1 w-full h-full p-4 bg-[#16161e] text-[#c0caf5] outline-none resize-none overflow-y-auto font-mono selection:bg-[#3d59a1]/50 caret-[#7aa2f7]"
      />

      {/* Inline Slash Command Menu */}
      {slashState.isOpen && (
        <SlashMenu
          query={slashState.query}
          position={slashState.position}
          onSelect={handleSlashSelect}
          onClose={() => setSlashState((prev) => ({ ...prev, isOpen: false }))}
        />
      )}
    </div>
  );
};
