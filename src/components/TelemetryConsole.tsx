import { useRef, useEffect } from "react";
import { Terminal, Shield, Trash2 } from "lucide-react";

interface TelemetryConsoleProps {
  logs: string[];
  onClearLogs?: () => void;
  clockSpeedLabel?: string;
}

export default function TelemetryConsole({
  logs,
  onClearLogs,
  clockSpeedLabel,
}: TelemetryConsoleProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <section className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col font-mono">
      {/* Console Header */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-slate-300 font-semibold">
          <Terminal className="w-4 h-4 text-pink-500" />
          <span>Console Telemetry Streams // ActiveBuffer: Secured</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
            <Shield className="w-3 h-3" />
            <span>LIVE MON</span>
          </div>
          {onClearLogs && logs.length > 0 && (
            <button
              onClick={onClearLogs}
              title="Clear terminal"
              className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Terminal Body */}
      <div
        ref={scrollRef}
        className="p-4 bg-black/70 max-h-48 sm:max-h-56 overflow-y-auto space-y-1 text-xs select-text scrollbar-thin scrollbar-thumb-slate-800"
      >
        {logs.length === 0 ? (
          <div className="text-slate-600 italic py-2">
            &gt; Awaiting next computational trigger event...
          </div>
        ) : (
          logs.map((log, index) => {
            let clr = "text-slate-400";
            if (log.includes("SUCCESS")) clr = "text-emerald-400 font-bold";
            if (log.includes("FAIL") || log.includes("ERROR") || log.includes("OVERFLOW")) {
              clr = "text-rose-500 font-bold animate-pulse";
            }
            if (log.includes("Iteration") || log.includes("[LOOP-T]")) {
              clr = "text-pink-400";
            }
            if (log.includes("[STD-T]")) {
              clr = "text-purple-300";
            }

            return (
              <div key={index} className={`font-mono leading-relaxed ${clr}`}>
                &gt; {log}
              </div>
            );
          })
        )}
      </div>

      {/* Console Status Footer */}
      <div className="bg-slate-900/50 border-t border-slate-900 px-4 py-1.5 flex items-center justify-between text-[10px] text-slate-500">
        <span>OISC Pipeline Status: Operational</span>
        {clockSpeedLabel && (
          <span className="text-pink-400/90 font-semibold">
            Clock: {clockSpeedLabel}
          </span>
        )}
        <span>Log Buffer: {logs.length} events</span>
      </div>
    </section>
  );
}
