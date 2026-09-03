import { motion, AnimatePresence } from "motion/react";
import { X, CheckCircle2, XCircle, Cpu, Zap, RotateCcw } from "lucide-react";

interface BenchmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  loopCount: number;
  complexityHops: number;
}

export default function BenchmarkModal({
  isOpen,
  onClose,
  loopCount,
  complexityHops,
}: BenchmarkModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl font-mono text-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
          <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">📊</span>
              <h3 className="font-bold text-sm tracking-wide text-white">
                Processing Summary Report
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors p-1 cursor-pointer flex items-center gap-1"
            >
              <span>CLOSE</span>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Body Head-to-Head */}
          <div className="p-6 space-y-6">
            
            {/* Standard vs Looped Comparison Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Standard Card */}
              <div className="bg-slate-950 border border-rose-900/40 rounded-xl p-4 space-y-3 relative overflow-hidden">
                <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800 pb-1.5 flex items-center justify-between">
                  <span>[ STANDARD BASELINE ]</span>
                  <XCircle className="w-4 h-4 text-rose-500" />
                </div>
                
                <div>
                  <div className="text-xl font-black text-rose-400">12 Layers (Cap)</div>
                  <div className="text-xs text-rose-500 font-bold mt-1">
                    FALSE NEGATIVE (0% MATCH)
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 space-y-1 pt-2 border-t border-slate-900">
                  <div className="flex justify-between">
                    <span>Depth Limit:</span>
                    <span className="text-slate-300 font-bold">12 / 12 Exhausted</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Blocks stored:</span>
                    <span className="text-slate-300 font-bold">12 blocks stored</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Reasoning State:</span>
                    <span className="text-rose-400 font-bold">Horizon Overflow</span>
                  </div>
                </div>
              </div>

              {/* Looped Card */}
              <div className="bg-slate-950 border border-emerald-800/60 rounded-xl p-4 space-y-3 relative overflow-hidden">
                <div className="text-[11px] text-emerald-400 uppercase tracking-wider font-semibold border-b border-slate-800 pb-1.5 flex items-center justify-between">
                  <span>[ LOOPED ARCHITECTURE ]</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>

                <div>
                  <div className="text-xl font-black text-emerald-400">
                    {loopCount} Recurrent Loops
                  </div>
                  <div className="text-xs text-emerald-400 font-bold mt-1">
                    PATH RESOLVED (100% MATCH)
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 space-y-1 pt-2 border-t border-slate-900">
                  <div className="flex justify-between">
                    <span>Depth Traversed:</span>
                    <span className="text-slate-300 font-bold">{complexityHops} / {complexityHops} Complete</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Blocks stored:</span>
                    <span className="text-emerald-300 font-bold">1 shared vs 12 (−91.7%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Convergence:</span>
                    <span className="text-emerald-400 font-bold">Fixed-Point Δ &lt; 0.005</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Why Looped Won Explanation */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 text-xs space-y-1.5 text-slate-300">
              <div className="font-bold text-white flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Architectural Takeaway:</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                The standard transformer exhausted its layer budget at Layer 12, leaving it blind to the {complexityHops}-hop problem structure. The looped transformer dynamically re-applied its single shared block until convergence, resolving all dependencies without storing additional layer blocks.
              </p>
            </div>

            {/* Action Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
              <button
                onClick={onClose}
                className="w-full sm:w-auto bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-mono text-xs font-bold py-2.5 px-5 rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer"
              >
                Keep Inspecting Layout
              </button>
            </div>

          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);
}
