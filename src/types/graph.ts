export interface GraphNode {
  id: string;
  title: string;
  path: string;
  extension: string;
  val: number; // link weight / connections count
  color?: string;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  tags?: string[];
  isCurrent?: boolean;
}

export interface GraphLink {
  source: string;
  target: string;
  strength?: number;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}
