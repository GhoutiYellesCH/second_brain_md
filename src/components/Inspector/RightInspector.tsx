import React, { useState } from 'react';
import { HeadingItem, NoteBacklink } from '../../types';
import { Link2, ArrowUpRight, ListTree, X, ExternalLink } from 'lucide-react';

interface RightInspectorProps {
  activeTitle: string;
  backlinks: NoteBacklink[];
  outgoingLinks: string[];
  headings: HeadingItem[];
  onNavigateNote: (title: string) => void;
  onScrollToHeading: (line: number) => void;
  onOpenSynapseGraph: () => void;
  onClose: () => void;
}

export const RightInspector: React.FC<RightInspectorProps> = ({
  backlinks,
  outgoingLinks,
  headings,
  onNavigateNote,
  onScrollToHeading,
  onOpenSynapseGraph,
  onClose,
}) => {
  const [tab, setTab] = useState<'backlinks' | 'outgoing' | 'outline'>('backlinks');

  return (
    <aside className="w-64 bg-[#16161e] border-l border-[#24283b] flex flex-col h-full shrink-0 select-none text-xs">
      {/* Top Header & Close */}
      <div className="h-10 border-b border-[#24283b] px-3 flex items-center justify-between">
        <span className="font-semibold text-xs text-[#c0caf5] truncate">Inspector</span>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-[#24283b] text-[#565f89] hover:text-[#c0caf5] transition-colors"
          title="Close Inspector"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center justify-around border-b border-[#24283b] bg-[#1a1b26]/60 p-1 text-[#565f89]">
        <button
          onClick={() => setTab('backlinks')}
          className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
            tab === 'backlinks' ? 'bg-[#24283b] text-[#7aa2f7] font-medium' : 'hover:text-[#c0caf5]'
          }`}
          title="Backlinks to this note"
        >
          <Link2 className="w-3.5 h-3.5" />
          <span>Links ({backlinks.length})</span>
        </button>
        <button
          onClick={() => setTab('outgoing')}
          className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
            tab === 'outgoing' ? 'bg-[#24283b] text-[#7aa2f7] font-medium' : 'hover:text-[#c0caf5]'
          }`}
          title="Outgoing links from this note"
        >
          <ArrowUpRight className="w-3.5 h-3.5" />
          <span>Out ({outgoingLinks.length})</span>
        </button>
        <button
          onClick={() => setTab('outline')}
          className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
            tab === 'outline' ? 'bg-[#24283b] text-[#7aa2f7] font-medium' : 'hover:text-[#c0caf5]'
          }`}
          title="Outline / Table of Contents"
        >
          <ListTree className="w-3.5 h-3.5" />
          <span>Outline</span>
        </button>
      </div>

      {/* Content Panels */}
      <div className="flex-1 overflow-y-auto p-2">
        {/* Backlinks */}
        {tab === 'backlinks' && (
          <div className="space-y-2">
            <div className="text-[10px] text-[#565f89] uppercase tracking-wider font-semibold px-1">
              Linked Mentions
            </div>
            {backlinks.length > 0 ? (
              backlinks.map((b, idx) => (
                <div
                  key={idx}
                  onClick={() => onNavigateNote(b.sourceTitle)}
                  className="p-2 rounded bg-[#1f2335]/60 hover:bg-[#24283b] cursor-pointer transition-colors border border-[#24283b]"
                >
                  <div className="font-medium text-[#7aa2f7] truncate flex items-center justify-between">
                    <span>{b.sourceTitle}</span>
                    <span className="text-[10px] text-[#565f89]">Ln {b.line}</span>
                  </div>
                  <div className="text-[11px] text-[#a9b1d6] mt-1 font-mono truncate">
                    {b.snippet}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-[#565f89]">
                No backlinks yet for this note.
              </div>
            )}
          </div>
        )}

        {/* Outgoing Links */}
        {tab === 'outgoing' && (
          <div className="space-y-1.5">
            <div className="text-[10px] text-[#565f89] uppercase tracking-wider font-semibold px-1">
              Outgoing References
            </div>
            {outgoingLinks.length > 0 ? (
              outgoingLinks.map((target, idx) => (
                <div
                  key={idx}
                  onClick={() => onNavigateNote(target)}
                  className="p-2 rounded bg-[#1f2335]/60 hover:bg-[#24283b] cursor-pointer transition-colors border border-[#24283b] flex items-center justify-between"
                >
                  <span className="text-[#c0caf5] font-medium truncate">{target}</span>
                  <ExternalLink className="w-3 h-3 text-[#565f89]" />
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-[#565f89]">
                No wikilinks in this note.
              </div>
            )}
          </div>
        )}

        {/* Outline / TOC */}
        {tab === 'outline' && (
          <div className="space-y-1">
            <div className="text-[10px] text-[#565f89] uppercase tracking-wider font-semibold px-1">
              Table of Contents
            </div>
            {headings.length > 0 ? (
              headings.map((h, idx) => (
                <div
                  key={idx}
                  onClick={() => onScrollToHeading(h.line)}
                  style={{ paddingLeft: `${Math.max(6, (h.level - 1) * 12)}px` }}
                  className="py-1 pr-2 rounded hover:bg-[#24283b] cursor-pointer transition-colors text-[#9aa5ce] hover:text-[#c0caf5] truncate"
                  title={h.text}
                >
                  <span className="font-mono text-[#565f89] mr-1.5">{'#'.repeat(h.level)}</span>
                  <span>{h.text}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-[#565f89]">
                No headings in this note.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Launcher for external Synapse Graph */}
      <div className="p-2.5 border-t border-[#24283b] bg-[#1a1b26]/80">
        <button
          onClick={onOpenSynapseGraph}
          className="w-full py-1.5 px-2.5 rounded bg-[#24283b] hover:bg-[#3d59a1] text-[#7aa2f7] hover:text-[#ffffff] text-xs font-medium transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          title="Open big picture in external Synapse Graph"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Open Synapse Graph</span>
        </button>
      </div>
    </aside>
  );
};
