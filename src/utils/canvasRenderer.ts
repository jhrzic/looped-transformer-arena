import { ReasoningScenario } from "../types";

export interface RenderParams {
  canvas: HTMLCanvasElement;
  scenario: ReasoningScenario;
  resolvedHops: number;
  activeHop: number;
  theme: "standard" | "looped";
  isFailed: boolean;
  isSuccess: boolean;
  animTime: number;
}

export function drawNetworkGraph({
  canvas,
  scenario,
  resolvedHops,
  activeHop,
  theme,
  isFailed,
  isSuccess,
  animTime,
}: RenderParams) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;

  // Clear background
  ctx.clearRect(0, 0, width, height);

  // Subtle grid lines in background
  ctx.save();
  ctx.strokeStyle = "rgba(30, 41, 59, 0.4)";
  ctx.lineWidth = 1;
  const gridSize = 24;
  for (let x = 0; x < width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  ctx.restore();

  // Helper to map 0..1 to canvas coordinates with margin
  const marginX = width * 0.08;
  const marginY = height * 0.12;
  const usableWidth = width - marginX * 2;
  const usableHeight = height - marginY * 2;

  const nodePosMap = new Map<string, { x: number; y: number }>();
  for (const n of scenario.nodes) {
    nodePosMap.set(n.id, {
      x: marginX + n.x * usableWidth,
      y: marginY + n.y * usableHeight,
    });
  }

  // Draw edges
  for (const edge of scenario.edges) {
    const p1 = nodePosMap.get(edge.from);
    const p2 = nodePosMap.get(edge.to);
    if (!p1 || !p2) continue;

    const isResolved = edge.hopIndex <= resolvedHops && !edge.isNoise;
    const isActive = edge.hopIndex === activeHop && !edge.isNoise;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);

    if (edge.isNoise) {
      // Background distractor / noise
      ctx.strokeStyle = "rgba(71, 85, 105, 0.25)";
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 4]);
      ctx.stroke();
    } else if (isFailed && isResolved) {
      // Failed standard path
      ctx.strokeStyle = "rgba(244, 63, 94, 0.7)";
      ctx.lineWidth = 2.5;
      ctx.stroke();
    } else if (isResolved) {
      // Resolved path
      if (theme === "looped") {
        ctx.strokeStyle = "rgba(16, 185, 129, 0.9)";
        ctx.shadowColor = "rgba(16, 185, 129, 0.8)";
        ctx.shadowBlur = 10;
        ctx.lineWidth = 3;
      } else {
        ctx.strokeStyle = "rgba(217, 70, 239, 0.8)";
        ctx.shadowColor = "rgba(217, 70, 239, 0.6)";
        ctx.shadowBlur = 8;
        ctx.lineWidth = 2.5;
      }
      ctx.stroke();

      // Traveling animated particles along active or resolved edges
      const particleProgress = ((animTime * 0.001 * 0.8) + (edge.hopIndex * 0.25)) % 1;
      const partX = p1.x + (p2.x - p1.x) * particleProgress;
      const partY = p1.y + (p2.y - p1.y) * particleProgress;

      ctx.beginPath();
      ctx.arc(partX, partY, theme === "looped" ? 3.5 : 2.5, 0, Math.PI * 2);
      ctx.fillStyle = theme === "looped" ? "#a7f3d0" : "#f5d0fe";
      ctx.shadowColor = theme === "looped" ? "#34d399" : "#e879f9";
      ctx.shadowBlur = 8;
      ctx.fill();

    } else if (isActive) {
      // Active in-progress hop
      ctx.strokeStyle = theme === "looped" ? "rgba(52, 211, 153, 0.5)" : "rgba(168, 85, 247, 0.5)";
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
    } else {
      // Inactive unexplored edge
      ctx.strokeStyle = "rgba(51, 65, 85, 0.35)";
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
    ctx.restore();

    // Draw small directional arrow along resolved edges
    if (isResolved || isActive) {
      ctx.save();
      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;
      const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
      ctx.translate(midX, midY);
      ctx.rotate(angle);

      ctx.fillStyle = isFailed
        ? "#f43f5e"
        : theme === "looped"
        ? "#10b981"
        : "#d946ef";

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-6, -3);
      ctx.lineTo(-6, 3);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }

  // Draw nodes
  for (const node of scenario.nodes) {
    const pos = nodePosMap.get(node.id);
    if (!pos) continue;

    // Check node status
    // A node is active or reached if any incoming or outgoing resolved edge connects to it
    const isReached = scenario.edges.some(
      (e) => (e.to === node.id && e.hopIndex <= resolvedHops) ||
             (e.from === node.id && (e.hopIndex <= resolvedHops + 1 || e.hopIndex === 1))
    );

    const isCurrentFrontier = scenario.edges.some(
      (e) => (e.from === node.id && e.hopIndex === activeHop) ||
             (e.to === node.id && e.hopIndex === activeHop)
    );

    ctx.save();

    // Outer glow for frontier / target
    const pulse = 1 + 0.15 * Math.sin(animTime * 0.005);
    const radius = node.isTarget ? 13 * pulse : node.isNoise ? 7 : 10;

    if (isFailed && isReached) {
      ctx.shadowColor = "rgba(244, 63, 94, 0.9)";
      ctx.shadowBlur = 12;
    } else if (isReached) {
      ctx.shadowColor = theme === "looped" ? "rgba(16, 185, 129, 0.9)" : "rgba(217, 70, 239, 0.8)";
      ctx.shadowBlur = 10;
    } else if (node.isTarget) {
      ctx.shadowColor = "rgba(251, 191, 36, 0.6)";
      ctx.shadowBlur = 8;
    }

    // Node Circle Background
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);

    if (node.isNoise) {
      ctx.fillStyle = "#1e293b";
      ctx.strokeStyle = "#334155";
      ctx.lineWidth = 1;
    } else if (isFailed && isReached) {
      ctx.fillStyle = "#881337";
      ctx.strokeStyle = "#f43f5e";
      ctx.lineWidth = 2;
    } else if (isReached) {
      if (theme === "looped") {
        ctx.fillStyle = isSuccess && node.isTarget ? "#064e3b" : "#022c22";
        ctx.strokeStyle = "#10b981";
        ctx.lineWidth = 2.5;
      } else {
        ctx.fillStyle = "#3b0764";
        ctx.strokeStyle = "#d946ef";
        ctx.lineWidth = 2;
      }
    } else if (node.isTarget) {
      ctx.fillStyle = "#451a03";
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 1.5;
    } else {
      ctx.fillStyle = "#0f172a";
      ctx.strokeStyle = "#334155";
      ctx.lineWidth = 1.5;
    }

    ctx.fill();
    ctx.stroke();

    // Node label text
    ctx.font = "bold 9px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    if (isFailed && isReached) {
      ctx.fillStyle = "#fecdd3";
    } else if (isReached) {
      ctx.fillStyle = theme === "looped" ? "#a7f3d0" : "#f5d0fe";
    } else {
      ctx.fillStyle = "#94a3b8";
    }
    ctx.fillText(node.label, pos.x, pos.y + radius + 10);

    // Sublabel
    if (!node.isNoise && height > 280) {
      ctx.font = "8px sans-serif";
      ctx.fillStyle = "#64748b";
      ctx.fillText(node.sublabel, pos.x, pos.y + radius + 20);
    }

    ctx.restore();
  }
}
