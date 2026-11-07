import React, { useRef, useEffect, useState, useMemo } from 'react';
import { GraphNode, GraphLink } from '../types';
import { Search, ZoomIn, ZoomOut, RotateCcw, Sliders, Sparkles, Filter } from 'lucide-react';

interface SynapsesGraphProps {
  nodes: GraphNode[];
  links: GraphLink[];
  activeNotePath?: string;
  onNodeClick: (node: GraphNode) => void;
  isLocalMode?: boolean;
  localCenterId?: string;
}

interface Particle {
  linkIndex: number;
  progress: number;
  speed: number;
}

export const SynapsesGraph: React.FC<SynapsesGraphProps> = ({
  nodes: initialNodes,
  links: initialLinks,
  activeNotePath,
  onNodeClick,
  isLocalMode = false,
  localCenterId,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Physics simulation state
  const [repulsion, setRepulsion] = useState<number>(350);
  const [linkDistance, setLinkDistance] = useState<number>(100);
  const [gravity, setGravity] = useState<number>(0.06);
  const [showOrphans, setShowOrphans] = useState<boolean>(true);
  const [showParticles, setShowParticles] = useState<boolean>(true);
  const [showControls, setShowControls] = useState<boolean>(!isLocalMode);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('all');

  // Camera / Transform state
  const transformRef = useRef({ x: 0, y: 0, scale: 1 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const draggedNodeRef = useRef<GraphNode | null>(null);
  const hoveredNodeRef = useRef<GraphNode | null>(null);

  // Simulation nodes and links copies
  const simNodesRef = useRef<GraphNode[]>([]);
  const simLinksRef = useRef<GraphLink[]>([]);
  const particlesRef = useRef<Particle[]>([]);

  // Collect available tags
  const allTags = useMemo(() => {
    const set = new Set<string>();
    initialNodes.forEach((n) => n.tags.forEach((t) => set.add(t)));
    return Array.from(set);
  }, [initialNodes]);

  // Filter nodes based on settings
  const filteredData = useMemo(() => {
    let activeNodes = [...initialNodes];

    // Local mode filter (1 or 2 hops from localCenterId)
    if (isLocalMode && localCenterId) {
      const neighborIds = new Set<string>([localCenterId]);
      initialLinks.forEach((l) => {
        if (l.source === localCenterId) neighborIds.add(l.target);
        if (l.target === localCenterId) neighborIds.add(l.source);
      });
      activeNodes = activeNodes.filter((n) => neighborIds.has(n.id) || neighborIds.has(n.title));
    }

    if (!showOrphans) {
      activeNodes = activeNodes.filter((n) => n.connections > 0);
    }

    if (selectedTag !== 'all') {
      activeNodes = activeNodes.filter((n) => n.tags.includes(selectedTag));
    }

    const activeNodeIds = new Set(activeNodes.map((n) => n.id));
    const activeLinks = initialLinks.filter(
      (l) => activeNodeIds.has(l.source) && activeNodeIds.has(l.target)
    );

    return { nodes: activeNodes, links: activeLinks };
  }, [initialNodes, initialLinks, isLocalMode, localCenterId, showOrphans, selectedTag]);

  // Synchronize simulation nodes
  useEffect(() => {
    const existingMap = new Map<string, GraphNode>();
    simNodesRef.current.forEach((n) => existingMap.set(n.id, n));

    const width = canvasRef.current?.width || 800;
    const height = canvasRef.current?.height || 600;

    simNodesRef.current = filteredData.nodes.map((node) => {
      const existing = existingMap.get(node.id);
      if (existing) {
        return {
          ...node,
          x: existing.x,
          y: existing.y,
          vx: existing.vx,
          vy: existing.vy,
        };
      }
      return {
        ...node,
        x: (Math.random() - 0.5) * (width * 0.6),
        y: (Math.random() - 0.5) * (height * 0.6),
        vx: 0,
        vy: 0,
      };
    });

    simLinksRef.current = filteredData.links;

    // Initialize synapse pulses
    particlesRef.current = Array.from({ length: Math.min(simLinksRef.current.length * 2, 40) }, () => ({
      linkIndex: Math.floor(Math.random() * Math.max(1, simLinksRef.current.length)),
      progress: Math.random(),
      speed: 0.003 + Math.random() * 0.005,
    }));
  }, [filteredData]);

  // Main 60fps physics and render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      // Background grid dots
      const scale = transformRef.current.scale;
      const panX = transformRef.current.x;
      const panY = transformRef.current.y;

      ctx.save();
      ctx.translate(width / 2 + panX, height / 2 + panY);
      ctx.scale(scale, scale);

      // Draw subtle background grid
      const gridSize = 40;
      const startX = -width / (2 * scale) - panX / scale;
      const endX = width / (2 * scale) - panX / scale;
      const startY = -height / (2 * scale) - panY / scale;
      const endY = height / (2 * scale) - panY / scale;

      ctx.fillStyle = '#27272a33';
      const snapStartX = Math.floor(startX / gridSize) * gridSize;
      const snapStartY = Math.floor(startY / gridSize) * gridSize;

      for (let x = snapStartX; x < endX; x += gridSize) {
        for (let y = snapStartY; y < endY; y += gridSize) {
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      const nodes = simNodesRef.current;
      const links = simLinksRef.current;
      const nodeMap = new Map<string, GraphNode>();
      nodes.forEach((n) => nodeMap.set(n.id, n));

      // 1. Physics Step (Repulsion, Attraction, Gravity)
      const numNodes = nodes.length;
      for (let i = 0; i < numNodes; i++) {
        const n1 = nodes[i];
        if (draggedNodeRef.current && draggedNodeRef.current.id === n1.id) continue;

        // Gravity towards center
        n1.vx -= n1.x * gravity * 0.04;
        n1.vy -= n1.y * gravity * 0.04;

        // Node-node repulsion
        for (let j = i + 1; j < numNodes; j++) {
          const n2 = nodes[j];
          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const distSq = dx * dx + dy * dy + 1;
          const dist = Math.sqrt(distSq);

          if (dist < 450) {
            const force = repulsion / distSq;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;

            n1.vx -= fx;
            n1.vy -= fy;
            n2.vx += fx;
            n2.vy += fy;
          }
        }
      }

      // Link attraction (Spring force)
      links.forEach((link) => {
        const source = nodeMap.get(link.source);
        const target = nodeMap.get(link.target);
        if (!source || !target) return;

        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const displacement = dist - linkDistance;
        const force = displacement * 0.035;

        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;

        if (draggedNodeRef.current?.id !== source.id) {
          source.vx += fx;
          source.vy += fy;
        }
        if (draggedNodeRef.current?.id !== target.id) {
          target.vx -= fx;
          target.vy -= fy;
        }
      });

      // Update positions with friction damping
      const damping = 0.88;
      nodes.forEach((node) => {
        if (draggedNodeRef.current?.id === node.id) return;
        node.vx *= damping;
        node.vy *= damping;
        node.x += node.vx;
        node.y += node.vy;
      });

      const hoveredNode = hoveredNodeRef.current;
      const isSearchActive = searchQuery.trim().length > 0;
      const lowerQuery = searchQuery.toLowerCase();

      // Set of connected node IDs if a node is hovered
      const connectedNodeIds = new Set<string>();
      if (hoveredNode) {
        connectedNodeIds.add(hoveredNode.id);
        links.forEach((l) => {
          if (l.source === hoveredNode.id) connectedNodeIds.add(l.target);
          if (l.target === hoveredNode.id) connectedNodeIds.add(l.source);
        });
      }

      // 2. Render Synapses (Edges)
      links.forEach((link) => {
        const source = nodeMap.get(link.source);
        const target = nodeMap.get(link.target);
        if (!source || !target) return;

        const isConnectedToHover =
          hoveredNode && (link.source === hoveredNode.id || link.target === hoveredNode.id);

        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);

        if (isConnectedToHover) {
          // Glowing synaptic pulse
          ctx.strokeStyle = '#c084fc';
          ctx.lineWidth = 2.5;
          ctx.shadowColor = '#a855f7';
          ctx.shadowBlur = 10;
        } else if (hoveredNode) {
          // Dim unrelated links
          ctx.strokeStyle = 'rgba(63, 63, 70, 0.15)';
          ctx.lineWidth = 0.8;
          ctx.shadowBlur = 0;
        } else {
          // Default synapse appearance
          ctx.strokeStyle = 'rgba(161, 161, 170, 0.22)';
          ctx.lineWidth = 1.2;
          ctx.shadowBlur = 0;
        }
        ctx.stroke();
        ctx.shadowBlur = 0; // reset shadow
      });

      // 3. Render Synaptic Flow Particles
      if (showParticles && links.length > 0) {
        particlesRef.current.forEach((p) => {
          p.progress += p.speed;
          if (p.progress >= 1) {
            p.progress = 0;
            p.linkIndex = Math.floor(Math.random() * links.length);
          }
          const link = links[p.linkIndex];
          if (!link) return;
          const source = nodeMap.get(link.source);
          const target = nodeMap.get(link.target);
          if (!source || !target) return;

          const px = source.x + (target.x - source.x) * p.progress;
          const py = source.y + (target.y - source.y) * p.progress;

          ctx.beginPath();
          ctx.arc(px, py, 2, 0, Math.PI * 2);
          ctx.fillStyle = '#c084fc';
          ctx.shadowColor = '#a855f7';
          ctx.shadowBlur = 6;
          ctx.fill();
          ctx.shadowBlur = 0;
        });
      }

      // 4. Render Nodes (Neurons)
      nodes.forEach((node) => {
        const isHovered = hoveredNode?.id === node.id;
        const isConnected = connectedNodeIds.has(node.id);
        const isActive = activeNotePath && node.path === activeNotePath;
        const matchesSearch = isSearchActive && node.title.toLowerCase().includes(lowerQuery);

        const nodeRadius = Math.max(5, Math.min(22, 5 + Math.sqrt(node.connections) * 3));

        // Dim non-connected nodes when hovering
        let alpha = 1;
        if (hoveredNode && !isConnected) {
          alpha = 0.2;
        } else if (isSearchActive && !matchesSearch) {
          alpha = 0.2;
        }

        ctx.save();
        ctx.globalAlpha = alpha;

        // Outer glow halo for active / hovered / matched nodes
        if (isHovered || isActive || matchesSearch) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, nodeRadius + 6, 0, Math.PI * 2);
          ctx.fillStyle = isHovered ? 'rgba(168, 85, 247, 0.35)' : 'rgba(192, 132, 252, 0.25)';
          ctx.fill();
        }

        // Neuron Body
        ctx.beginPath();
        ctx.arc(node.x, node.y, nodeRadius, 0, Math.PI * 2);

        // Color determination
        let fillColor = node.color || '#a855f7';
        if (isActive) fillColor = '#c084fc';
        if (matchesSearch) fillColor = '#fbbf24';

        ctx.fillStyle = fillColor;
        ctx.shadowColor = fillColor;
        ctx.shadowBlur = isHovered || isActive ? 12 : 3;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = isActive || isHovered ? 2 : 1;
        ctx.stroke();

        // Node Label
        const shouldShowLabel =
          isHovered || isActive || matchesSearch || scale > 1.2 || node.connections > 2;

        if (shouldShowLabel) {
          const fontSize = Math.max(10, Math.min(14, 11 / Math.sqrt(scale)));
          ctx.font = `${isHovered || isActive ? '600' : '400'} ${fontSize}px sans-serif`;
          ctx.fillStyle = isHovered || isActive ? '#ffffff' : '#d4d4d8';
          ctx.textAlign = 'center';
          ctx.fillText(node.title, node.x, node.y + nodeRadius + fontSize + 2);
        }

        ctx.restore();
      });

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [repulsion, linkDistance, gravity, showParticles, searchQuery, activeNotePath]);

  // Canvas resize handler
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mouse interaction: finding hovered node
  const getNodeAtPoint = (clientX: number, clientY: number): GraphNode | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left) * window.devicePixelRatio;
    const y = (clientY - rect.top) * window.devicePixelRatio;

    const { scale, x: panX, y: panY } = transformRef.current;
    const worldX = (x - canvas.width / 2 - panX) / scale;
    const worldY = (y - canvas.height / 2 - panY) / scale;

    const nodes = simNodesRef.current;
    for (let i = nodes.length - 1; i >= 0; i--) {
      const node = nodes[i];
      const r = Math.max(8, 5 + Math.sqrt(node.connections) * 3);
      const dx = worldX - node.x;
      const dy = worldY - node.y;
      if (dx * dx + dy * dy <= r * r * 1.5) {
        return node;
      }
    }
    return null;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const hitNode = getNodeAtPoint(e.clientX, e.clientY);
    if (hitNode) {
      draggedNodeRef.current = hitNode;
    } else {
      isDraggingRef.current = true;
      dragStartRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggedNodeRef.current) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * window.devicePixelRatio;
      const y = (e.clientY - rect.top) * window.devicePixelRatio;
      const { scale, x: panX, y: panY } = transformRef.current;

      draggedNodeRef.current.x = (x - canvas.width / 2 - panX) / scale;
      draggedNodeRef.current.y = (y - canvas.height / 2 - panY) / scale;
      draggedNodeRef.current.vx = 0;
      draggedNodeRef.current.vy = 0;
      return;
    }

    if (isDraggingRef.current) {
      const dx = (e.clientX - dragStartRef.current.x) * window.devicePixelRatio;
      const dy = (e.clientY - dragStartRef.current.y) * window.devicePixelRatio;
      transformRef.current.x += dx;
      transformRef.current.y += dy;
      dragStartRef.current = { x: e.clientX, y: e.clientY };
      return;
    }

    // Hover detection
    const hit = getNodeAtPoint(e.clientX, e.clientY);
    hoveredNodeRef.current = hit;
    if (canvasRef.current) {
      canvasRef.current.style.cursor = hit ? 'pointer' : 'grab';
    }
  };

  const handleMouseUp = () => {
    if (draggedNodeRef.current) {
      draggedNodeRef.current = null;
    }
    isDraggingRef.current = false;
  };

  const handleClick = (e: React.MouseEvent) => {
    const hit = getNodeAtPoint(e.clientX, e.clientY);
    if (hit) {
      onNodeClick(hit);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.12 : 0.88;
    const newScale = Math.max(0.2, Math.min(4.0, transformRef.current.scale * zoomFactor));
    transformRef.current.scale = newScale;
  };

  const resetView = () => {
    transformRef.current = { x: 0, y: 0, scale: 1 };
  };

  const zoomIn = () => {
    transformRef.current.scale = Math.min(4.0, transformRef.current.scale * 1.25);
  };

  const zoomOut = () => {
    transformRef.current.scale = Math.max(0.2, transformRef.current.scale * 0.8);
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#0e0e11] select-none flex flex-col">
      {/* Top Bar / Graph Search & Filter */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
        <div className="relative flex items-center bg-zinc-900/90 backdrop-blur border border-zinc-700/80 rounded-lg shadow-xl px-2.5 py-1.5 text-xs text-zinc-300">
          <Search className="w-3.5 h-3.5 text-zinc-400 mr-2" />
          <input
            type="text"
            placeholder="Filter nodes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-xs text-zinc-100 placeholder-zinc-500 w-36 focus:w-48 transition-all"
          />
        </div>

        {allTags.length > 0 && (
          <div className="flex items-center bg-zinc-900/90 backdrop-blur border border-zinc-700/80 rounded-lg shadow-xl px-2 py-1 text-xs">
            <Filter className="w-3 h-3 text-purple-400 mr-1.5" />
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="bg-transparent text-xs text-zinc-300 border-none outline-none cursor-pointer"
            >
              <option value="all">All Tags</option>
              {allTags.map((tag) => (
                <option key={tag} value={tag} className="bg-zinc-900 text-zinc-200">
                  #{tag}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Top-Right Controls Toggle */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
        <button
          onClick={zoomIn}
          title="Zoom In"
          className="p-2 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 rounded-lg border border-zinc-800 shadow-md transition-colors"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={zoomOut}
          title="Zoom Out"
          className="p-2 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 rounded-lg border border-zinc-800 shadow-md transition-colors"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={resetView}
          title="Reset View"
          className="p-2 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 rounded-lg border border-zinc-800 shadow-md transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setShowControls(!showControls)}
          title="Graph Settings"
          className={`p-2 rounded-lg border shadow-md transition-colors ${
            showControls
              ? 'bg-purple-600 border-purple-500 text-white'
              : 'bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 border-zinc-800'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Physics & Display Controls Drawer */}
      {showControls && (
        <div className="absolute top-14 right-3 z-10 w-64 bg-zinc-900/95 backdrop-blur-md border border-zinc-800 rounded-xl p-3.5 shadow-2xl text-xs space-y-3.5 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-zinc-200 font-semibold">
            <span className="flex items-center gap-1.5 text-purple-400">
              <Sparkles className="w-3.5 h-3.5" /> Synapses Physics
            </span>
            <span className="text-[10px] text-zinc-500">{filteredData.nodes.length} nodes</span>
          </div>

          <div>
            <div className="flex justify-between text-zinc-400 mb-1">
              <span>Repulsion Force</span>
              <span className="font-mono text-zinc-200">{repulsion}</span>
            </div>
            <input
              type="range"
              min="100"
              max="800"
              value={repulsion}
              onChange={(e) => setRepulsion(Number(e.target.value))}
              className="w-full accent-purple-500 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-zinc-400 mb-1">
              <span>Synapse Length</span>
              <span className="font-mono text-zinc-200">{linkDistance}px</span>
            </div>
            <input
              type="range"
              min="40"
              max="250"
              value={linkDistance}
              onChange={(e) => setLinkDistance(Number(e.target.value))}
              className="w-full accent-purple-500 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-zinc-400 mb-1">
              <span>Center Gravity</span>
              <span className="font-mono text-zinc-200">{gravity}</span>
            </div>
            <input
              type="range"
              min="0.01"
              max="0.2"
              step="0.01"
              value={gravity}
              onChange={(e) => setGravity(Number(e.target.value))}
              className="w-full accent-purple-500 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="pt-2 border-t border-zinc-800/80 space-y-2">
            <label className="flex items-center justify-between cursor-pointer text-zinc-300">
              <span>Show Orphan Notes</span>
              <input
                type="checkbox"
                checked={showOrphans}
                onChange={(e) => setShowOrphans(e.target.checked)}
                className="accent-purple-500 w-4 h-4 rounded"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer text-zinc-300">
              <span>Synaptic Pulses</span>
              <input
                type="checkbox"
                checked={showParticles}
                onChange={(e) => setShowParticles(e.target.checked)}
                className="accent-purple-500 w-4 h-4 rounded"
              />
            </label>
          </div>
        </div>
      )}

      {/* Main Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleClick}
        onWheel={handleWheel}
        className="w-full h-full flex-1 block touch-none"
      />

      {/* Footer Info Pill */}
      <div className="absolute bottom-3 left-3 z-10 px-2.5 py-1 bg-zinc-900/80 backdrop-blur rounded-md border border-zinc-800/80 text-[11px] text-zinc-400 flex items-center gap-3">
        <span>⚡ Double-click note to navigate</span>
        <span className="text-zinc-600">•</span>
        <span>Drag to pan, Scroll to zoom</span>
      </div>
    </div>
  );
};
