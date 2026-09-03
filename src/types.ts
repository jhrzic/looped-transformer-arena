export type ModelStatus = 
  | "IDLE"
  | "INITIALIZING"
  | "PROCESSING"
  | "FAIL: HORIZON OVERFLOW"
  | "SUCCESS: PATH RESOLVED";

export interface GraphNode {
  id: string;
  label: string;
  sublabel: string;
  x: number; // 0 to 1 relative
  y: number; // 0 to 1 relative
  isTarget?: boolean;
  isNoise?: boolean;
}

export interface GraphEdge {
  from: string;
  to: string;
  hopIndex: number; // 1-based hop
  isNoise?: boolean;
}

export interface ReasoningScenario {
  id: string;
  name: string;
  complexityHops: number;
  description: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface TelemetryLog {
  id: string;
  timestamp: string;
  text: string;
}
