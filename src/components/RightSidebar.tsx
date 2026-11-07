import React, { useState } from 'react';
import { GraphNode, GraphLink, NoteBacklinks, HeadingItem } from '../types';
import { SynapsesGraph } from './SynapsesGraph';
import { Sparkles, Link2, ListTree, ChevronRight, ArrowUpRight } from 'lucide-react';

interface RightSidebarProps {
  activeNoteTitle: string;
  activeNotePath: string;
  nodes: GraphNode[];
  links: GraphLink[];
  backlinks: NoteBacklinks;
  headings: HeadingItem[];
  onNodeClick: (node: GraphNode) => void;
  onNavigateToNote: (targetTitle: string) => void;
  onHeadingClick?: (heading: HeadingItem) => void;
  onClose?: () => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  activeNoteTitle,
  activeNotePath,
  nodes,
  links,
  backlinks,
  headings,
  onNodeClick,
  onNavigateToNote,
  onHeadingClick,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'graph' | 'backlinks' | 'outline'>('graph');

  return (
    <div className="flex flex-col h-full bg-[#121214] border-l border-zinc-800/80 w-72 select-none">
      {/* Right Sidebar Tab Bar */}
      <div className="flex items-center justify-between px-2 py-1.5 border-b border-zinc-800 bg-[#161619] shrink-0 text-xs">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('graph')}
            className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
              activeTab === 'graph'
                ? 'bg-purple-600 text-white font-medium shadow'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
            title="Local Synapses Graph"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Synapses</span>
          </button>
          <button
            onClick={() => setActiveTab('backlinks')}
            className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
              activeTab === 'backlinks'
                ? 'bg-purple-600 text-white font-medium shadow'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
            title="Backlinks & Outgoing Links"
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>Links</span>
          </button>
          <button
            onClick={() => setActiveTab('outline')}
            className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
              activeTab === 'outline'
                ? 'bg-purple-600 text-white font-medium shadow'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
            title="Note Table of Contents"
          >
            <ListTree className="w-3.5 h-3.5" />
            <span>Outline</span>
          </button>
        </div>

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

      {/* Main Tab Panel */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* TAB 1: Local Synapses Graph */}
        {activeTab === 'graph' && (
          <div className="flex-1 flex flex-col h-full relative">
            <div className="p-2 border-b border-zinc-800/80 bg-zinc-900/40 text-[11px] text-zinc-400 flex items-center justify-between">
              <span>LOCAL SYNAPSE CLUSTER</span>
              <span className="text-purple-400 font-mono font-medium truncate max-w-[130px]">
                {activeNoteTitle}
              </span>
            </div>
            <div className="flex-1 relative">
              <SynapsesGraph
                nodes={nodes}
                links={links}
                activeNotePath={activeNotePath}
                onNodeClick={onNodeClick}
                isLocalMode={true}
                localCenterId={activeNoteTitle}
              />
            </div>
          </div>
        )}

        {/* TAB 2: Backlinks & Outgoing Links */}
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
                        <span>{item.sourceTitle}</span>
                        <ArrowUpRight className="w-3 h-3 text-zinc-500" />
                      </div>
                      <p className="text-[11px] text-zinc-400 truncate mt-0.5 font-mono">
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
                <span>OUTGOING SYNAPSES</span>
                <span className="text-purple-400 font-mono">
                  {backlinks.outgoingLinks.length}
                </span>
              </div>
              {backlinks.outgoingLinks.length === 0 ? (
                <p className="text-zinc-500 italic text-[11px]">No outgoing [[links]] in note</p>
              ) : (
                <div className="space-y-1">
                  {backlinks.outgoingLinks.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => onNavigateToNote(item.targetTitle)}
                      className="px-2.5 py-1.5 rounded bg-zinc-900/60 hover:bg-zinc-800 flex items-center justify-between text-zinc-300 cursor-pointer transition-colors"
                    >
                      <span className="text-purple-400 font-mono">[[{item.targetTitle}]]</span>
                      <ArrowUpRight className="w-3 h-3 text-zinc-500" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: Outline / Headings */}
        {activeTab === 'outline' && (
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            <div className="text-[11px] font-semibold text-zinc-400 mb-2">NOTE OUTLINE</div>
            {headings.length === 0 ? (
              <p className="text-zinc-500 italic text-xs">No headings (H1-H6) in note</p>
            ) : (
              headings.map((h, idx) => (
                <div
                  key={idx}
                  onClick={() => onHeadingClick?.(h)}
                  className="py-1 px-2 rounded hover:bg-zinc-800/80 cursor-pointer text-xs text-zinc-300 hover:text-white transition-colors truncate"
                  style={{ paddingLeft: `${(h.level - 1) * 12 + 8}px` }}
                >
                  <span className="text-zinc-500 font-mono mr-1.5 text-[10px]">
                    {'#'.repeat(h.level)}
                  </span>
                  <span>{h.text}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
