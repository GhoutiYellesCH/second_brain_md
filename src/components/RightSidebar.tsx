import React, { useState } from 'react';
import { NoteBacklinks, HeadingItem, VaultSettings } from '../types';
import { Sparkles, Link2, ListTree, ChevronRight, ArrowUpRight, ExternalLink } from 'lucide-react';

interface RightSidebarProps {
  activeNoteTitle: string;
  activeNotePath: string;
  backlinks: NoteBacklinks;
  headings: HeadingItem[];
  onNavigateToNote: (targetTitle: string) => void;
  onHeadingClick?: (heading: HeadingItem) => void;
  onOpenSynapseGraph: () => void;
  onClose?: () => void;
  settings?: VaultSettings;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  activeNoteTitle,
  backlinks,
  headings,
  onNavigateToNote,
  onHeadingClick,
  onOpenSynapseGraph,
  onClose,
  settings,
}) => {
  const showLinks = settings?.corePlugins?.wikilinks !== false;
  const showOutline = settings?.corePlugins?.outline !== false;
  const [activeTab, setActiveTab] = useState<'backlinks' | 'outline'>(showLinks ? 'backlinks' : 'outline');

  return (
    <div className="flex flex-col h-full bg-[#121214] border-l border-zinc-800/80 w-72 select-none">
      {/* Right Sidebar Tab Bar */}
      <div className="flex items-center justify-between px-2 py-1.5 border-b border-zinc-800 bg-[#161619] shrink-0 text-xs">
        <div className="flex items-center gap-1">
          {showLinks && (
            <button
              onClick={() => setActiveTab('backlinks')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
                activeTab === 'backlinks'
                  ? 'bg-[#7aa2f7] text-[#16161e] font-semibold shadow'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
              title="Backlinks & Outgoing Links"
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>Links</span>
            </button>
          )}
          {showOutline && (
            <button
              onClick={() => setActiveTab('outline')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
                activeTab === 'outline'
                  ? 'bg-[#7aa2f7] text-[#16161e] font-semibold shadow'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
              title="Note Table of Contents"
            >
              <ListTree className="w-3.5 h-3.5" />
              <span>Outline</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-1">
          {settings?.corePlugins?.graph !== false && (
            <button
              onClick={onOpenSynapseGraph}
              className="p-1 rounded text-[#7aa2f7] hover:text-[#7dcfff] hover:bg-zinc-800 transition-colors"
              title="Open Synapse Graph in external window"
            >
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded"
              title="Close Sidebar"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Synapse Graph Quick Launch Banner */}
      <div className="p-2.5 bg-gradient-to-r from-purple-950/30 to-zinc-900 border-b border-zinc-800/80">
        <button
          onClick={onOpenSynapseGraph}
          className="w-full flex items-center justify-between p-2 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-200 text-xs font-medium transition-colors group"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
            <div className="flex flex-col text-left">
              <span>Open Synapse Graph</span>
              {activeNoteTitle && (
                <span className="text-[10px] text-zinc-400 truncate max-w-[180px]">
                  Focus: {activeNoteTitle}
                </span>
              )}
            </div>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-purple-400" />
        </button>
      </div>

      {/* Main Tab Panel */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* TAB 1: Backlinks & Outgoing Links */}
        {activeTab === 'backlinks' && (
          <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs">
            {/* Linked Mentions */}
            <div>
              <div className="text-[11px] font-semibold text-zinc-400 mb-2 flex items-center justify-between">
                <span>LINKED MENTIONS</span>
                <span className="text-purple-400 font-mono">
                  {backlinks.linkedMentions.length}
                </span>
              </div>
              {backlinks.linkedMentions.length === 0 ? (
                <p className="text-zinc-500 italic text-[11px]">No notes link here yet</p>
              ) : (
                <div className="space-y-1.5">
                  {backlinks.linkedMentions.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => onNavigateToNote(item.sourceTitle)}
                      className="p-2 rounded bg-zinc-900/80 hover:bg-zinc-800 cursor-pointer border border-zinc-800/60 transition-colors"
                    >
                      <div className="font-medium text-purple-300 flex items-center justify-between">
                        <span dir="auto">{item.sourceTitle}</span>
                        <ArrowUpRight className="w-3 h-3 text-zinc-500" />
                      </div>
                      <p dir="auto" className="text-[11px] text-zinc-400 truncate mt-0.5 font-mono">
                        {item.snippet}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Outgoing Links */}
            <div>
              <div className="text-[11px] font-semibold text-zinc-400 mb-2 flex items-center justify-between">
                <span>OUTGOING LINKS</span>
                <span className="text-purple-400 font-mono">
                  {backlinks.outgoingLinks.length}
                </span>
              </div>
              {backlinks.outgoingLinks.length === 0 ? (
                <p className="text-zinc-500 italic text-[11px]">No outgoing [[links]]</p>
              ) : (
                <div className="space-y-1.5">
                  {backlinks.outgoingLinks.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => onNavigateToNote(item.targetTitle)}
                      className="p-2 rounded bg-zinc-900/80 hover:bg-zinc-800 cursor-pointer border border-zinc-800/60 transition-colors flex items-center justify-between"
                    >
                      <span dir="auto" className="font-medium text-zinc-200">{item.targetTitle}</span>
                      <ArrowUpRight className="w-3 h-3 text-zinc-500" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: Outline Headings */}
        {activeTab === 'outline' && (
          <div className="flex-1 overflow-y-auto p-3 space-y-1 text-xs">
            <div className="text-[11px] font-semibold text-zinc-400 mb-2">
              NOTE OUTLINE
            </div>
            {headings.length === 0 ? (
              <p className="text-zinc-500 italic text-[11px]">No headings in this note</p>
            ) : (
              headings.map((h, idx) => (
                <div
                  key={idx}
                  onClick={() => onHeadingClick?.(h)}
                  className={`py-1 px-2 rounded hover:bg-zinc-800 cursor-pointer text-zinc-300 hover:text-white transition-colors truncate`}
                  style={{ paddingLeft: `${Math.max(6, (h.level - 1) * 12 + 6)}px` }}
                >
                  <span dir="auto" className={h.level === 1 ? 'font-bold text-zinc-100' : ''}>
                    {h.text}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
