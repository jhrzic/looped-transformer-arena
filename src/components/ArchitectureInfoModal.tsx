import { motion, AnimatePresence } from "motion/react";
import { X, Cpu, Info, CheckCircle2, Zap } from "lucide-react";

interface ArchitectureInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ArchitectureInfoModal({
  isOpen,
  onClose,
}: ArchitectureInfoModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl font-mono text-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-pink-500/10 border border-pink-500/30 text-pink-400">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-wide text-white">
                    Interactive Architecture Simulator / Sandbox
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Client-side mathematical emulation of Looping Transformation
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors p-1 cursor-pointer flex items-center gap-1"
              >
                <span>ESC</span>
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4 text-xs text-slate-300">
              <div className="bg-pink-950/30 border border-pink-500/30 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center gap-2 text-pink-300 font-bold text-[11px] uppercase tracking-wider">
                  <Zap className="w-3.5 h-3.5 text-pink-400" />
                  <span>Market Release Frontier: Looping Transformation</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  As next-generation recurrent transformer models hit the market, they introduce weight-tied computational loops to solve deep reasoning tasks without ballooning parameter size or VRAM requirements.
                </p>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-[11px] uppercase tracking-wider">
                  <Info className="w-3.5 h-3.5" />
                  <span>Entirely Frontend Simulation Sandbox</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  This interactive playground operates <strong className="text-white">entirely in your browser</strong> via client-side JavaScript. It does not spin up a live multi-gigabyte machine learning model on a remote cloud GPU.
                </p>
                <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-[10px] text-slate-400">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span><strong className="text-slate-200">Mathematical Mirroring:</strong> Accurately reflects standard depth limits, layer starvation, and fixed-point state convergence ($\Delta_t &lt; 0.005$).</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span><strong className="text-slate-200">Deterministic Logic Paths:</strong> Reproduces PonderNet stopping distributions and graph-traversal decision horizons step-by-step.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span><strong className="text-slate-200">Zero Server Latency:</strong> Immediate, responsive exploration of multi-hop graphs with zero GPU token consumption.</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  onClick={onClose}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-bold py-2 px-4 rounded-xl transition cursor-pointer border border-slate-700"
                >
                  Return to Sandbox
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
