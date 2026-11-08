export type CanvasNodeType = 'text' | 'file' | 'link' | 'group';

export interface CanvasNode {
  id: string;
  type: CanvasNodeType;
  text?: string;
  file?: string;
  url?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;
}

export interface CanvasEdge {
  id: string;
  fromNode: string;
  toNode: string;
  label?: string;
  color?: string;
}

export interface CanvasData {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
}
