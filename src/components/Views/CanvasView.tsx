import React, { useState } from 'react';
import { CanvasData, CanvasNode } from '../../types';
import { Plus, X, Move, Trash2 } from 'lucide-react';

interface CanvasViewProps {
  canvasData?: CanvasData;
  onClose: () => void;
  onSaveCanvas?: (data: CanvasData) => void;
}

export const CanvasView: React.FC<CanvasViewProps> = ({
  canvasData: initialData,
  onClose,
  onSaveCanvas,
}) => {
  const [nodes, setNodes] = useState<CanvasNode[]>(
    initialData?.nodes || [
      {
        id: 'node-1',
        type: 'text',
        text: '🧠 Synapse Central Idea\n\n- Connect ideas\n- High performance\n- Tokyo Night aesthetic',
        x: 120,
        y: 120,
        width: 240,
        height: 140,
        color: '#7aa2f7',
      },
      {
        id: 'node-2',
        type: 'text',
        text: '⚡ Axon Connections\n\nSub-concepts and research topics linked seamlessly.',
        x: 440,
        y: 180,
        width: 220,
        height: 120,
        color: '#73daca',
      },
    ]
  );

  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleAddCard = () => {
    const newNode: CanvasNode = {
      id: `node-${Date.now()}`,
      type: 'text',
      text: 'New Idea Card\n\nDouble click to edit.',
      x: 200 + Math.random() * 200,
      y: 200 + Math.random() * 150,
      width: 220,
      height: 120,
      color: '#bb9af7',
    };
    const next = [...nodes, newNode];
    setNodes(next);
    onSaveCanvas?.({ nodes: next, edges: [] });
  };

  const handleDeleteCard = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = nodes.filter((n) => n.id !== id);
    setNodes(next);
    onSaveCanvas?.({ nodes: next, edges: [] });
  };

  const handleCardTextChange = (id: string, newText: string) => {
    const next = nodes.map((n) => (n.id === id ? { ...n, text: newText } : n));
    setNodes(next);
    onSaveCanvas?.({ nodes: next, edges: [] });
  };

  const handleMouseDown = (id: string, e: React.MouseEvent) => {
    setActiveDragId(id);
    const node = nodes.find((n) => n.id === id);
    if (node) {
      setDragOffset({
        x: e.clientX - node.x,
        y: e.clientY - node.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!activeDragId) return;
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id === activeDragId) {
          return {
            ...n,
            x: Math.max(20, e.clientX - dragOffset.x),
            y: Math.max(20, e.clientY - dragOffset.y),
          };
        }
        return n;
      })
    );
  };

  const handleMouseUp = () => {
    setActiveDragId(null);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className="relative flex-1 w-full h-full bg-[#16161e] overflow-hidden select-none bg-[radial-gradient(#24283b_1px,transparent_1px)] [background-size:24px_24px]"
    >
      {/* Canvas Top Bar */}
      <div className="absolute top-4 left-4 z-30 flex items-center gap-2">
        <button
          onClick={handleAddCard}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#7aa2f7] hover:bg-[#89b4fa] text-[#16161e] text-xs font-medium shadow-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Card</span>
        </button>
      </div>

      <div className="absolute top-4 right-4 z-30">
        <button
          onClick={onClose}
          className="p-1.5 rounded-full bg-[#1f2335]/90 backdrop-blur border border-[#24283b] text-[#565f89] hover:text-[#c0caf5] shadow-lg transition-colors"
          title="Close Canvas"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Render Canvas Nodes */}
      {nodes.map((node) => (
        <div
          key={node.id}
          style={{
            transform: `translate(${node.x}px, ${node.y}px)`,
            width: `${node.width}px`,
            minHeight: `${node.height}px`,
            borderColor: node.color || '#414868',
          }}
          className="absolute top-0 left-0 bg-[#1f2335]/95 backdrop-blur border rounded-lg shadow-2xl flex flex-col overflow-hidden text-xs transition-shadow hover:shadow-[0_0_15px_rgba(122,162,247,0.25)]"
        >
          {/* Card Header Drag Handle */}
          <div
            onMouseDown={(e) => handleMouseDown(node.id, e)}
            style={{ backgroundColor: `${node.color || '#7aa2f7'}18` }}
            className="h-6 px-2 flex items-center justify-between cursor-move border-b border-[#24283b]"
          >
            <div className="flex items-center gap-1 text-[#787c99]">
              <Move className="w-3 h-3" />
              <span className="text-[10px] uppercase font-mono font-semibold" style={{ color: node.color }}>
                Card
              </span>
            </div>
            <button
              onClick={(e) => handleDeleteCard(node.id, e)}
              className="p-0.5 rounded hover:text-[#f7768e] text-[#565f89]"
              title="Delete Card"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>

          {/* Card Content Editable Area */}
          <textarea
            value={node.text || ''}
            onChange={(e) => handleCardTextChange(node.id, e.target.value)}
            className="w-full flex-1 p-2.5 bg-transparent text-[#c0caf5] outline-none resize-none font-sans text-xs leading-relaxed"
            placeholder="Write card thoughts..."
          />
        </div>
      ))}
    </div>
  );
};
