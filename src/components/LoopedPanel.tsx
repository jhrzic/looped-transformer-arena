import { useRef, useEffect } from "react";
import { ReasoningScenario } from "../types";
import { drawNetworkGraph } from "../utils/canvasRenderer";

interface LoopedPanelProps {
  scenario: ReasoningScenario;
  loopStatus: string;
  loopCount: number;
  loopHopsFound: number;
  complexityHops: number;
  loopDelta: number;
  loopConfidence: number;
  isRunning: boolean;
}

export default function LoopedPanel({
  scenario,
  loopStatus,
  loopCount,
  loopHopsFound,
  complexityHops,
  loopDelta,
  loopConfidence,
  isRunning,
}: LoopedPanelProps) {
  const canvasRefRight = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let animFrame: number;

    const render = (time: number) => {
      const canvas = canvasRefRight.current;
      if (canvas) {
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
          resolvedHops: loopHopsFound,
          activeHop: isRunning ? Math.min(loopHopsFound + 1, complexityHops) : 0,
          theme: "looped",
          isFailed: false,
          isSuccess: loopStatus.includes("SUCCESS"),
          animTime: time,
        });
      }
      animFrame = requestAnimationFrame(render);
    };

    animFrame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animFrame);
  }, [scenario, loopHopsFound, loopStatus, isRunning, complexityHops]);

  return (
    <article className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl relative flex flex-col justify-between h-full">
      {/* Header */}
      <div className="p-3 sm:p-4 bg-slate-900/60 border-b border-slate-800 flex justify-between items-center">
        <div>
          <h2 className="text-xs sm:text-sm font-bold text-slate-200">Looped Transformer Model</h2>
          <p className="text-[10px] text-emerald-400/80 font-mono">Weight-Tied Recurrent Engine</p>
        </div>
        <span
          className={`text-xs font-bold font-mono px-2 py-0.5 rounded-full ${
            loopStatus.includes("SUCCESS")
              ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
              : loopStatus.includes("RECURSIVE")
              ? "bg-cyan-950/60 text-cyan-400 border border-cyan-800/60 animate-pulse"
              : "bg-slate-800 text-slate-400"
          }`}
        >
          {loopStatus}
        </span>
      </div>

      {/* Canvas Viewport */}
      <div className="p-1 relative bg-slate-950/40 flex-1 flex items-center justify-center">
        <canvas ref={canvasRefRight} className="w-full h-[260px] sm:h-[360px] block" />

        {loopStatus.includes("SUCCESS") && (
          <div className="absolute top-3 right-3 bg-emerald-950/80 border border-emerald-500/50 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-lg pointer-events-none">
            <span className="text-[10px] font-mono font-bold text-emerald-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              PATH RESOLVED (100% MATCH)
            </span>
          </div>
        )}
      </div>

      {/* Custom Instrument Dash Dials */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60 grid grid-cols-2 gap-3">
        {/* Dial 1: Fixed-Point Delta */}
        <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl flex items-center gap-3">
          <div className="relative w-11 h-11 flex-shrink-0 flex items-center justify-center">
            <svg viewBox="0 0 36 36" className="w-11 h-11 -rotate-90">
              <path
                className="text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-purple-500 transition-all duration-300"
                strokeDasharray={`${Math.max(5, Math.min(100, (1 - loopDelta) * 100))}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-[10px] font-mono font-bold text-purple-300">
              Δ
            </span>
          </div>
          <div className="min-w-0">
            <div className="text-xs font-mono font-bold text-purple-400">
              Δ: {loopDelta.toFixed(3)}
            </div>
            <div className="text-[9px] font-semibold text-slate-300">Fixed-Point Delta</div>
            <div className="text-[8px] text-slate-400 font-mono">Target criteria &lt; 0.005</div>
          </div>
        </div>

        {/* Dial 2: Halting Probability / PonderNet */}
        <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl flex items-center gap-3">
          <div className="relative w-11 h-11 flex-shrink-0 flex items-center justify-center">
            <svg viewBox="0 0 36 36" className="w-11 h-11 -rotate-90">
              <path
                className="text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-amber-500 transition-all duration-300"
                strokeDasharray={`${Math.min(100, loopConfidence)}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-[9px] font-mono font-bold text-amber-300">
              %
            </span>
          </div>
          <div className="min-w-0">
            <div className="text-xs font-mono font-bold text-amber-400">
              {Math.floor(loopConfidence)}%
            </div>
            <div className="text-[9px] font-semibold text-slate-300">Halting Probability</div>
            <div className="text-[8px] text-slate-400 font-mono">PonderNet auxiliary bounds</div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="p-3 border-t border-slate-800 grid grid-cols-3 gap-1.5 bg-slate-900/40 text-center font-mono text-[10px] sm:text-xs">
        <div className="bg-slate-950 p-2 rounded-lg border border-slate-800/60">
          <div className="text-[9px] text-slate-400 uppercase">Recurrent Loops</div>
          <div className="text-emerald-400 font-bold mt-0.5">{loopCount}</div>
        </div>
        <div className="bg-slate-950 p-2 rounded-lg border border-slate-800/60">
          <div className="text-[9px] text-slate-400 uppercase">Blocks Stored</div>
          <div className="text-emerald-400 font-bold mt-0.5">1 of 12 (−91.7%)</div>
        </div>
        <div className="bg-slate-950 p-2 rounded-lg border border-slate-800/60">
          <div className="text-[9px] text-slate-400 uppercase">Hops Spanned</div>
          <div
            className={`font-bold mt-0.5 ${
              loopStatus.includes("SUCCESS") ? "text-emerald-400" : "text-slate-200"
            }`}
          >
            {loopHopsFound} / {complexityHops}
          </div>
        </div>
      </div>
    </article>
  );
}
