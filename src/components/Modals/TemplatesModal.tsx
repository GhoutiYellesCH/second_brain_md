import React, { useState } from 'react';
import { DEFAULT_TEMPLATES, NoteTemplate, applyTemplate } from '../../services/templateService';
import { Sparkles, X } from 'lucide-react';

interface TemplatesModalProps {
  isOpen: boolean;
  activeTitle: string;
  onInsert: (content: string) => void;
  onClose: () => void;
}

export const TemplatesModal: React.FC<TemplatesModalProps> = ({
  isOpen,
  activeTitle,
  onInsert,
  onClose,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<NoteTemplate>(DEFAULT_TEMPLATES[0]);

  if (!isOpen) return null;

  const handleApply = () => {
    const rendered = applyTemplate(selectedTemplate.content, activeTitle || 'Untitled');
    onInsert(rendered);
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-[#1f2335] border border-[#24283b] rounded-xl shadow-2xl overflow-hidden flex flex-col text-xs max-h-[85vh]"
      >
        {/* Header */}
        <div className="h-11 px-4 border-b border-[#24283b] flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-sm text-[#c0caf5]">
            <Sparkles className="w-4 h-4 text-[#bb9af7]" />
            <span>Insert Note Template</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-[#24283b] text-[#565f89] hover:text-[#c0caf5]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Templates list on left */}
          <div className="w-56 border-r border-[#24283b] p-2 space-y-1 overflow-y-auto">
            {DEFAULT_TEMPLATES.map((tmpl) => (
              <div
                key={tmpl.id}
                onClick={() => setSelectedTemplate(tmpl)}
                className={`p-2.5 rounded-lg cursor-pointer transition-colors ${
                  selectedTemplate.id === tmpl.id
                    ? 'bg-[#24283b] text-[#7aa2f7] font-medium'
                    : 'text-[#787c99] hover:bg-[#24283b]/50'
                }`}
              >
                <div className="text-xs text-[#c0caf5]">{tmpl.name}</div>
                <div className="text-[10px] text-[#565f89] truncate mt-0.5">
                  {tmpl.description}
                </div>
              </div>
            ))}
          </div>

          {/* Template Preview on right */}
          <div className="flex-1 flex flex-col p-4 bg-[#16161e]">
            <div className="text-[10px] text-[#565f89] uppercase tracking-wider font-semibold mb-2">
              Template Preview
            </div>
            <pre className="flex-1 overflow-y-auto p-3 rounded-lg bg-[#1a1b26] border border-[#24283b] text-[11px] font-mono text-[#a9b1d6] whitespace-pre-wrap">
              {applyTemplate(selectedTemplate.content, activeTitle || 'Current Note')}
            </pre>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="h-12 px-4 border-t border-[#24283b] flex items-center justify-end gap-2 bg-[#1a1b26]/50">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded text-[#787c99] hover:text-[#c0caf5] hover:bg-[#24283b] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-1.5 rounded bg-[#7aa2f7] hover:bg-[#89b4fa] text-[#16161e] font-medium transition-colors shadow-sm"
          >
            Insert Template
          </button>
        </div>
      </div>
    </div>
  );
};
