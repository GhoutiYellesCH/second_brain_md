import React from 'react';
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  Code,
  Quote,
  List,
  CheckSquare,
  Table,
  Link,
  Sigma,
  FileCode,
  Sparkles,
} from 'lucide-react';

interface FormattingToolbarProps {
  onInsertMarkdown: (prefix: string, suffix?: string, defaultText?: string) => void;
  onOpenTemplates: () => void;
}

export const FormattingToolbar: React.FC<FormattingToolbarProps> = ({
  onInsertMarkdown,
  onOpenTemplates,
}) => {
  return (
    <div className="h-8 bg-[#16161e] border-b border-[#24283b] px-2 flex items-center gap-0.5 text-[#787c99] select-none shrink-0 overflow-x-auto no-scrollbar">
      {/* Headings */}
      <button
        onClick={() => onInsertMarkdown('# ', '', 'Heading 1')}
        className="p-1 rounded hover:bg-[#24283b] hover:text-[#c0caf5] transition-colors"
        title="Heading 1"
      >
        <Heading1 className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => onInsertMarkdown('## ', '', 'Heading 2')}
        className="p-1 rounded hover:bg-[#24283b] hover:text-[#c0caf5] transition-colors"
        title="Heading 2"
      >
        <Heading2 className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => onInsertMarkdown('### ', '', 'Heading 3')}
        className="p-1 rounded hover:bg-[#24283b] hover:text-[#c0caf5] transition-colors"
        title="Heading 3"
      >
        <Heading3 className="w-3.5 h-3.5" />
      </button>

      <div className="h-3.5 w-[1px] bg-[#24283b] mx-1" />

      {/* Basic Inline Formats */}
      <button
        onClick={() => onInsertMarkdown('**', '**', 'bold text')}
        className="p-1 rounded hover:bg-[#24283b] hover:text-[#c0caf5] transition-colors"
        title="Bold (Ctrl+B)"
      >
        <Bold className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => onInsertMarkdown('*', '*', 'italic text')}
        className="p-1 rounded hover:bg-[#24283b] hover:text-[#c0caf5] transition-colors"
        title="Italic (Ctrl+I)"
      >
        <Italic className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => onInsertMarkdown('~~', '~~', 'strikethrough')}
        className="p-1 rounded hover:bg-[#24283b] hover:text-[#c0caf5] transition-colors"
        title="Strikethrough"
      >
        <Strikethrough className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => onInsertMarkdown('`', '`', 'code')}
        className="p-1 rounded hover:bg-[#24283b] hover:text-[#c0caf5] transition-colors"
        title="Inline Code"
      >
        <Code className="w-3.5 h-3.5" />
      </button>

      <div className="h-3.5 w-[1px] bg-[#24283b] mx-1" />

      {/* Lists & Quotes */}
      <button
        onClick={() => onInsertMarkdown('- ', '', 'List item')}
        className="p-1 rounded hover:bg-[#24283b] hover:text-[#c0caf5] transition-colors"
        title="Bullet List"
      >
        <List className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => onInsertMarkdown('- [ ] ', '', 'Task item')}
        className="p-1 rounded hover:bg-[#24283b] hover:text-[#c0caf5] transition-colors"
        title="Task Checkbox"
      >
        <CheckSquare className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => onInsertMarkdown('> ', '', 'Quote text')}
        className="p-1 rounded hover:bg-[#24283b] hover:text-[#c0caf5] transition-colors"
        title="Blockquote"
      >
        <Quote className="w-3.5 h-3.5" />
      </button>

      <div className="h-3.5 w-[1px] bg-[#24283b] mx-1" />

      {/* Advanced: Table, Math, Mermaid, Wikilink */}
      <button
        onClick={() => onInsertMarkdown('| Column 1 | Column 2 |\n| -------- | -------- |\n| Item 1   | Item 2   |\n')}
        className="p-1 rounded hover:bg-[#24283b] hover:text-[#c0caf5] transition-colors"
        title="Insert Table"
      >
        <Table className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => onInsertMarkdown('$$\n', '\n$$\n', 'E = mc^2')}
        className="p-1 rounded hover:bg-[#24283b] hover:text-[#c0caf5] transition-colors"
        title="KaTeX Math Block"
      >
        <Sigma className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => onInsertMarkdown('```mermaid\ngraph TD\n    A[Start] --> B(Process)\n```\n')}
        className="p-1 rounded hover:bg-[#24283b] hover:text-[#c0caf5] transition-colors"
        title="Mermaid Diagram"
      >
        <FileCode className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => onInsertMarkdown('[[', ']]', 'Note Name')}
        className="p-1 rounded hover:bg-[#24283b] hover:text-[#7aa2f7] transition-colors text-[#7aa2f7]"
        title="Bi-directional Wikilink"
      >
        <Link className="w-3.5 h-3.5" />
      </button>

      <div className="h-3.5 w-[1px] bg-[#24283b] mx-1" />

      {/* Insert Template */}
      <button
        onClick={onOpenTemplates}
        className="px-2 py-0.5 rounded hover:bg-[#24283b] text-[#bb9af7] hover:text-[#c0caf5] text-xs flex items-center gap-1 transition-colors"
        title="Insert Note Template"
      >
        <Sparkles className="w-3 h-3" />
        <span className="text-[11px]">Templates</span>
      </button>
    </div>
  );
};
