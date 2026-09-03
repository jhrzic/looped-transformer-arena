import { useRef, useEffect } from "react";
import { ReasoningScenario } from "../types";
import { drawNetworkGraph } from "../utils/canvasRenderer";

interface StandardPanelProps {
  scenario: ReasoningScenario;
  stdStatus: string;
  stdLayer: number;
  stdHopsFound: number;
  complexityHops: number;
  isRunning: boolean;
}

export default function StandardPanel({
  scenario,
  stdStatus,
  stdLayer,
  stdHopsFound,
  complexityHops,
  isRunning,
}: StandardPanelProps) {
  const canvasRefLeft = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let animFrame: number;

    const render = (time: number) => {
      const canvas = canvasRefLeft.current;
      if (canvas) {
        // Auto-scale canvas resolution with DPR for ultra-crisp mobile display
        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        const targetW = Math.floor(rect.width * dpr);
        const targetH = Math.floor(rect.height * dpr);

        if (canvas.width !== targetW || canvas.height !== targetH) {
          canvas.width = targetW;
          canvas.height = targetH;
        }

        drawNetworkGraph({
          canvas,
          scenario,
          resolvedHops: stdHopsFound,
          activeHop: isRunning ? Math.min(stdHopsFound + 1, complexityHops) : 0,
          theme: "standard",
          isFailed: stdStatus.includes("FAIL"),
          isSuccess: false,
          animTime: time,
        });
      }
      animFrame = requestAnimationFrame(render);
    };

    animFrame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animFrame);
  }, [scenario, stdHopsFound, stdStatus, isRunning, complexityHops]);

  return (
    <article className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl relative flex flex-col justify-between h-full">
      {/* Header */}
      <div className="p-3 sm:p-4 bg-slate-900/60 border-b border-slate-800 flex justify-between items-center">
        <div>
          <h2 className="text-xs sm:text-sm font-bold text-slate-200">Standard Transformer</h2>
          <p className="text-[10px] text-slate-500 font-mono">Fixed Feed-Forward Array</p>
        </div>
        <span
          className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
            stdStatus.includes("FAIL")
              ? "bg-rose-950/50 text-rose-400 border border-rose-900/50 animate-pulse"
              : stdStatus.includes("PROCESSING")
              ? "bg-purple-950/50 text-purple-400 border border-purple-900/50"
              : "text-slate-500 bg-slate-800/60"
          }`}
        >
          {stdStatus}
        </span>
      </div>

      {/* Canvas Viewport */}
      <div className="p-1 relative bg-slate-950/40 flex-1 flex items-center justify-center">
        <canvas ref={canvasRefLeft} className="w-full h-[260px] sm:h-[360px] block" />
        
        {stdStatus.includes("FAIL") && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col justify-center items-center text-center p-4 transition-all">
            <span className="text-rose-500 text-[10px] sm:text-xs font-bold font-mono tracking-widest mb-1 animate-pulse">
              ❌ CONTEXT BLINDNESS OVERFLOW
            </span>
            <p className="text-[10px] text-slate-300 max-w-xs px-2 font-medium">
              The model ran out of operational layers (12/12) before establishing vector return loops. Core sequence blind to long-range dependencies.
            </p>
          </div>
        )}
      </div>

      {/* Metrics Row */}
      <div className="p-3 border-t border-slate-800 grid grid-cols-3 gap-1.5 bg-slate-900/40 text-center font-mono text-[10px] sm:text-xs">
        <div className="bg-slate-950 p-2 rounded-lg border border-slate-800/60">
          <div className="text-[9px] text-slate-400 uppercase">Allocated Layers</div>
          <div className="text-slate-200 font-bold mt-0.5">{stdLayer} / 12</div>
        </div>
        <div className="bg-slate-950 p-2 rounded-lg border border-slate-800/60">
          <div className="text-[9px] text-slate-400 uppercase">VRAM Footprint</div>
          <div className="text-amber-400 font-bold mt-0.5">100% Full</div>
        </div>
        <div className="bg-slate-950 p-2 rounded-lg border border-slate-800/60">
          <div className="text-[9px] text-slate-400 uppercase">Hops Spanned</div>
          <div
            className={`font-bold mt-0.5 ${
              stdStatus.includes("FAIL") ? "text-rose-400" : "text-slate-200"
            }`}
          >
            {stdHopsFound} / {complexityHops}
          </div>
        </div>
      </div>
    </article>
  );
}
