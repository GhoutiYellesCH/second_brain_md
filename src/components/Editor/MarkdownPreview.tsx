import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { renderMarkdown, isArabicOrRtlText } from '../../services/markdownParser';

interface MarkdownPreviewProps {
  content: string;
  fontSize: number;
  designatedFolder: string;
  onNavigateWikilink: (target: string) => void;
  onToggleCheckbox?: (lineIndex: number, newChecked: boolean) => void;
  scrollRef?: React.RefObject<HTMLDivElement | null>;
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
}

export const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({
  content,
  fontSize,
  designatedFolder,
  onNavigateWikilink,
  onToggleCheckbox,
  scrollRef,
  onScroll,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isRtl = React.useMemo(() => isArabicOrRtlText(content), [content]);
  const renderedHtml = React.useMemo(() => {
    return renderMarkdown(content, designatedFolder);
  }, [content, designatedFolder]);

  // Render Mermaid diagrams
  useEffect(() => {
    if (!containerRef.current) return;
    try {
      mermaid.contentLoaded();
    } catch (e) {
      console.warn('Mermaid render error:', e);
    }
  }, [renderedHtml]);

  // Intercept clicks for wikilinks and checkboxes
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;

    // 1. Wikilink click
    const wikilink = target.closest('.wikilink') as HTMLElement;
    if (wikilink) {
      e.preventDefault();
      const targetNote = wikilink.getAttribute('data-target');
      if (targetNote) {
        onNavigateWikilink(targetNote);
      }
      return;
    }

    // 2. Task Checkbox toggle
    if (target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'checkbox') {
      const checkbox = target as HTMLInputElement;
      const li = checkbox.closest('li');
      if (li && onToggleCheckbox) {
        // Find line in content
        const text = li.innerText.trim();
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].includes(text) && lines[i].includes('- [')) {
            onToggleCheckbox(i, checkbox.checked);
            break;
          }
        }
      }
    }
  };

  return (
    <div
      ref={scrollRef || containerRef}
      onScroll={onScroll}
      onClick={handleClick}
      dir={isRtl ? 'rtl' : 'ltr'}
      style={{
        fontSize: `${fontSize}px`,
        lineHeight: 1.7,
        direction: isRtl ? 'rtl' : 'ltr',
        textAlign: isRtl ? 'right' : 'left',
      }}
      className={`flex-1 h-full overflow-y-auto p-8 bg-[#1a1b26] text-[#c0caf5] prose prose-invert max-w-none selection:bg-[#3d59a1]/50 ${
        isRtl ? 'rtl-preview text-right' : 'text-left'
      }`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
};
