import React, { useEffect, useState } from 'react';
import {
  Heading1,
  Heading2,
  List,
  CheckSquare,
  Code,
  Table,
  Sigma,
  FileCode,
  Calendar,
  AlertTriangle,
} from 'lucide-react';

interface SlashCommandItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  insertText: string;
}

const SLASH_COMMANDS: SlashCommandItem[] = [
  {
    id: 'h1',
    title: 'Heading 1',
    description: 'Large section heading',
    icon: <Heading1 className="w-4 h-4 text-[#7aa2f7]" />,
    insertText: '# ',
  },
  {
    id: 'h2',
    title: 'Heading 2',
    description: 'Medium section heading',
    icon: <Heading2 className="w-4 h-4 text-[#7aa2f7]" />,
    insertText: '## ',
  },
  {
    id: 'task',
    title: 'To-do / Task',
    description: 'Interactive checklist item',
    icon: <CheckSquare className="w-4 h-4 text-[#73daca]" />,
    insertText: '- [ ] ',
  },
  {
    id: 'bullet',
    title: 'Bullet List',
    description: 'Create an unordered list',
    icon: <List className="w-4 h-4 text-[#bb9af7]" />,
    insertText: '- ',
  },
  {
    id: 'code',
    title: 'Code Block',
    description: 'Syntax-highlighted code fence',
    icon: <Code className="w-4 h-4 text-[#7dcfff]" />,
    insertText: '```typescript\n\n```\n',
  },
  {
    id: 'table',
    title: 'Table',
    description: 'Insert a 2-column markdown table',
    icon: <Table className="w-4 h-4 text-[#e0af68]" />,
    insertText: '| Header 1 | Header 2 |\n| -------- | -------- |\n| Cell 1   | Cell 2   |\n',
  },
  {
    id: 'math',
    title: 'KaTeX Math Formula',
    description: 'LaTeX math block',
    icon: <Sigma className="w-4 h-4 text-[#bb9af7]" />,
    insertText: '$$\nE = mc^2\n$$\n',
  },
  {
    id: 'mermaid',
    title: 'Mermaid Diagram',
    description: 'Flowchart or sequence diagram',
    icon: <FileCode className="w-4 h-4 text-[#7aa2f7]" />,
    insertText: '```mermaid\ngraph TD\n    A[Start] --> B(Process)\n```\n',
  },
  {
    id: 'callout',
    title: 'Callout Note',
    description: 'Styled note callout box',
    icon: <AlertTriangle className="w-4 h-4 text-[#ff9e64]" />,
    insertText: '> [!NOTE]\n> Important details here.\n\n',
  },
  {
    id: 'date',
    title: 'Current Date',
    description: "Insert today's date",
    icon: <Calendar className="w-4 h-4 text-[#73daca]" />,
    insertText: new Date().toISOString().split('T')[0] + ' ',
  },
];

interface SlashMenuProps {
  query: string;
  position: { top: number; left: number };
  onSelect: (insertText: string) => void;
  onClose: () => void;
}

export const SlashMenu: React.FC<SlashMenuProps> = ({
  query,
  position,
  onSelect,
  onClose,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filtered = SLASH_COMMANDS.filter((cmd) =>
    cmd.title.toLowerCase().includes(query.toLowerCase()) ||
    cmd.description.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          onSelect(filtered[selectedIndex].insertText);
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filtered, selectedIndex, onSelect, onClose]);

  if (filtered.length === 0) return null;

  return (
    <div
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
      className="fixed z-50 w-64 bg-[#1f2335] border border-[#24283b] rounded-lg shadow-2xl p-1 text-xs select-none max-h-72 overflow-y-auto"
    >
      <div className="px-2 py-1 text-[10px] text-[#565f89] uppercase tracking-wider font-semibold">
        Commands
      </div>
      {filtered.map((cmd, idx) => (
        <div
          key={cmd.id}
          onClick={() => onSelect(cmd.insertText)}
          className={`flex items-center gap-2.5 px-2 py-1.5 rounded cursor-pointer transition-colors ${
            idx === selectedIndex ? 'bg-[#24283b] text-[#c0caf5]' : 'text-[#787c99] hover:bg-[#24283b]/60'
          }`}
        >
          {cmd.icon}
          <div className="min-w-0 flex-1">
            <div className="font-medium text-[#c0caf5] text-xs">{cmd.title}</div>
            <div className="text-[10px] text-[#565f89] truncate">{cmd.description}</div>
          </div>
        </div>
      ))}
    </div>
  );
};
