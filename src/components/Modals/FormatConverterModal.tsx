import React from 'react';
import { ArrowLeftRight, X, Check } from 'lucide-react';

interface FormatConverterModalProps {
  isOpen: boolean;
  content: string;
  onApplyConversion: (newContent: string) => void;
  onClose: () => void;
}

export const FormatConverterModal: React.FC<FormatConverterModalProps> = ({
  isOpen,
  content,
  onApplyConversion,
  onClose,
}) => {
  if (!isOpen) return null;

  const handleConvertWikilinksToMarkdown = () => {
    // [[Note Name|Alias]] -> [Alias](Note%20Name.md)
    // [[Note Name]] -> [Note Name](Note%20Name.md)
    const converted = content.replace(/\[\[(.*?)\]\]/g, (_, inner) => {
      const parts = inner.split('|');
      const target = parts[0].trim();
      const alias = parts[1] ? parts[1].trim() : target;
      return `[${alias}](${encodeURIComponent(target)}.md)`;
    });
    onApplyConversion(converted);
    onClose();
  };

  const handleConvertMarkdownToWikilinks = () => {
    // [Label](Target.md) -> [[Target|Label]] or [[Target]]
    const converted = content.replace(/\[([^\]]+)\]\(([^)]+)\.md\)/g, (_, label, path) => {
      const decoded = decodeURIComponent(path.split('/').pop() || path);
      if (label === decoded) {
        return `[[${decoded}]]`;
      }
      return `[[${decoded}|${label}]]`;
    });
    onApplyConversion(converted);
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[#1f2335] border border-[#24283b] rounded-xl shadow-2xl p-5 text-xs flex flex-col gap-4"
      >
        <div className="flex items-center justify-between border-b border-[#24283b] pb-3">
          <div className="flex items-center gap-2 font-semibold text-sm text-[#c0caf5]">
            <ArrowLeftRight className="w-4 h-4 text-[#7aa2f7]" />
            <span>Format Converter</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-[#24283b] text-[#565f89] hover:text-[#c0caf5]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-[#a9b1d6] leading-relaxed">
          Convert links in the active document between Bi-directional Wikilinks and Standard Markdown Links.
        </p>

        <div className="flex flex-col gap-2 pt-2">
          <button
            onClick={handleConvertWikilinksToMarkdown}
            className="p-3 rounded-lg bg-[#24283b] hover:bg-[#3d59a1] text-[#c0caf5] text-left transition-colors flex items-center justify-between"
          >
            <div>
              <div className="font-medium text-[#7aa2f7]">
                Wikilinks to Markdown Links
              </div>
              <div className="text-[11px] text-[#565f89] font-mono mt-0.5">
                [[Note|Alias]] &rarr; [Alias](Note.md)
              </div>
            </div>
            <Check className="w-4 h-4 text-[#7aa2f7]" />
          </button>

          <button
            onClick={handleConvertMarkdownToWikilinks}
            className="p-3 rounded-lg bg-[#24283b] hover:bg-[#3d59a1] text-[#c0caf5] text-left transition-colors flex items-center justify-between"
          >
            <div>
              <div className="font-medium text-[#73daca]">
                Markdown Links to Wikilinks
              </div>
              <div className="text-[11px] text-[#565f89] font-mono mt-0.5">
                [Alias](Note.md) &rarr; [[Note|Alias]]
              </div>
            </div>
            <Check className="w-4 h-4 text-[#73daca]" />
          </button>
        </div>
      </div>
    </div>
  );
};
