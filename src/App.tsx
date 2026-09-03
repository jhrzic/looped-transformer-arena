import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { SCENARIOS } from "./utils/scenarios";
import { ReasoningScenario } from "./types";
import StandardPanel from "./components/StandardPanel";
import LoopedPanel from "./components/LoopedPanel";
import TelemetryConsole from "./components/TelemetryConsole";
import BenchmarkModal from "./components/BenchmarkModal";
import ArchitectureInfoModal from "./components/ArchitectureInfoModal";
import { downloadEngineSourceZip } from "./utils/downloadZip";
import { Brain, Sparkles, Sliders, Download, BarChart2, ShieldCheck, Flame, Info, Compass, Network, Gauge } from "lucide-react";

const CLOCK_SPEED_OPTIONS = [
  { value: 0.5, label: "0.5x", hz: "1.6 Hz", ms: 640 },
  { value: 1.0, label: "1.0x", hz: "3.1 Hz", ms: 320 },
  { value: 2.0, label: "2.0x", hz: "6.2 Hz", ms: 160 },
  { value: 4.0, label: "4.0x", hz: "12.5 Hz", ms: 80 },
];

export default function App() {
  const [selectedScenario, setSelectedScenario] = useState<ReasoningScenario>(SCENARIOS[0]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [clockSpeed, setClockSpeed] = useState<number>(1.0);

  // Standard Transformer Model state
  const [stdStatus, setStdStatus] = useState<string>("IDLE");
  const [stdLayer, setStdLayer] = useState<number>(0);
  const [stdHopsFound, setStdHopsFound] = useState<number>(0);

  // Looped Transformer Model state
  const [loopStatus, setLoopStatus] = useState<string>("IDLE");
  const [loopCount, setLoopCount] = useState<number>(0);
  const [loopHopsFound, setLoopHopsFound] = useState<number>(0);
  const [loopDelta, setLoopDelta] = useState<number>(1.0);
  const [loopConfidence, setLoopConfidence] = useState<number>(0);

  // Telemetry & Modal state
  const [logs, setLogs] = useState<string[]>([
    "System standby. Configure test scenario and press [EXECUTE PARALLEL RUN].",
  ]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);

  const stepTimerRef = useRef<number | null>(null);
  const stepRef = useRef<number>(0);
  const clockSpeedRef = useRef<number>(1.0);

  const addLog = (msg: string) => {
    const timestamp = new Date().toISOString().substring(11, 19);
    setLogs((prev) => [...prev.slice(-40), `[${timestamp}] ${msg}`]);
  };

  const currentClockOpt = CLOCK_SPEED_OPTIONS.find((o) => o.value === clockSpeed) || CLOCK_SPEED_OPTIONS[1];

  const resetDemo = () => {
    if (stepTimerRef.current) {
      clearInterval(stepTimerRef.current);
      stepTimerRef.current = null;
    }
    stepRef.current = 0;
    setIsRunning(false);
    setStdStatus("IDLE");
    setStdLayer(0);
    setStdHopsFound(0);

    setLoopStatus("IDLE");
    setLoopCount(0);
    setLoopHopsFound(0);
    setLoopDelta(1.0);
    setLoopConfidence(0);

    setLogs(["Arena reset. State cleared. Awaiting next computational trigger event."]);
  };

  const executeStep = () => {
    stepRef.current += 1;
    const step = stepRef.current;
    const maxStandardLayers = 12;
    const totalHops = selectedScenario.complexityHops;
    const maxLoopSteps = totalHops === 6 ? 18 : totalHops === 7 ? 20 : 22;

    // ---- 1. Standard Transformer Updates (Cap at 12 layers) ----
    if (step <= maxStandardLayers) {
      setStdLayer(step);
      // Each hop in standard takes ~3 layers of deep attention mapping
      const currentStdHops = Math.min(Math.floor(step / 3.5), totalHops - 2);
      setStdHopsFound(currentStdHops);

      if (step % 4 === 0) {
        addLog(`[STD-T] Forward layer ${step}/12 computing self-attention keys... Hop ${currentStdHops} mapped.`);
      }

      if (step === maxStandardLayers) {
        // Reached cap without solving the path!
        setStdStatus("FAIL: HORIZON OVERFLOW");
        addLog(`[STD-T] CRITICAL: Maximum layer depth capacity reached (${step}/12).`);
        addLog(`[STD-T] ❌ FAIL: CONTEXT BLINDNESS OVERFLOW. Model ran out of operational layers.`);
      }
    }

    // ---- 2. Looped Transformer Updates (Recursive weight re-entry) ----
    if (step <= maxLoopSteps) {
      setLoopCount(step);
      setLoopStatus(`RECURSIVE LOOP ${step}`);

      // Gradual convergence metrics
      const progress = step / maxLoopSteps;
      const currentLoopHops = Math.min(
        totalHops,
        Math.max(1, Math.floor(progress * (totalHops + 1)))
      );
      setLoopHopsFound(currentLoopHops);

      // Delta decreases towards zero (< 0.005)
      const newDelta = Math.max(0.003, Math.exp(-progress * 5.8) * 0.95);
      setLoopDelta(newDelta);

      // Halting probability / PonderNet confidence increases towards 100%
      const newConf = Math.min(100, Math.floor(progress * 94 + (step >= maxLoopSteps - 1 ? 6 : 0)));
      setLoopConfidence(newConf);

      if (step % 3 === 0 || step === maxLoopSteps) {
        addLog(`[LOOP-T] Iteration ${step}: Δ=${newDelta.toFixed(3)}, PonderNet Conf=${newConf}%, Hop ${currentLoopHops}/${totalHops} linked.`);
      }

      if (step === maxLoopSteps) {
        setLoopStatus("SUCCESS: PATH RESOLVED");
        addLog(`[LOOP-T] Fixed-point stability achieved (Δ=0.003 < 0.005 limit).`);
        addLog(`[LOOP-T] ✅ SUCCESS: Entire ${totalHops}-hop reasoning graph completely resolved (100% MATCH).`);

        // Stop execution
        setIsRunning(false);
        if (stepTimerRef.current) {
          clearInterval(stepTimerRef.current);
          stepTimerRef.current = null;
        }

        // Trigger processing report modal
        setTimeout(() => {
          setShowModal(true);
        }, 800);
      }
    }
  };

  const startInference = () => {
    if (isRunning) return;

    resetDemo();
    setIsRunning(true);
    setStdStatus("PROCESSING");
    setLoopStatus("RECURSIVE LOOP 1");

    stepRef.current = 0;

    const opt = CLOCK_SPEED_OPTIONS.find((o) => o.value === clockSpeedRef.current) || CLOCK_SPEED_OPTIONS[1];
    addLog(`INIT: Parallel benchmarking launched on [${selectedScenario.name}] at ${opt.label} clock speed (${opt.hz})`);
    addLog(`[STD-T] Allocating 12 distinct physical layer blocks (12 x block size).`);
    addLog(`[LOOP-T] Binding a single recurrent block with weight-tied feedback loop (1 x block size).`);

    stepTimerRef.current = window.setInterval(executeStep, opt.ms);
  };

  const handleClockSpeedChange = (newSpeed: number) => {
    setClockSpeed(newSpeed);
    clockSpeedRef.current = newSpeed;
    const opt = CLOCK_SPEED_OPTIONS.find((o) => o.value === newSpeed) || CLOCK_SPEED_OPTIONS[1];
    
    addLog(`Clock speed calibrated to ${opt.label} (${opt.hz}, ${opt.ms}ms cycle frequency).`);

    // Dynamically adjust ongoing simulation without resetting step counter
    if (isRunning) {
      if (stepTimerRef.current) {
        clearInterval(stepTimerRef.current);
      }
      stepTimerRef.current = window.setInterval(executeStep, opt.ms);
    }
  };

  const handleDownloadSource = async () => {
    try {
      addLog("Exporting standalone engine source bundle (ZIP)...");
      await downloadEngineSourceZip();
      addLog("Source bundle generated and downloaded successfully.");
    } catch (err) {
      console.error(err);
      addLog("Error generating source ZIP.");
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stepTimerRef.current) {
        clearInterval(stepTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-pink-500/30 selection:text-white relative overflow-x-hidden">
      {/* Visual Accent Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[300px] bg-pink-600/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-[500px] h-[300px] bg-purple-600/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-5">
        
        {/* Header & Command Bar */}
        <header className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 sm:p-5 backdrop-blur-md shadow-xl flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-500/20 text-pink-400 rounded-2xl shadow-inner">
                <Brain className="w-7 h-7" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-base sm:text-lg font-black tracking-tight text-white uppercase font-mono">
                    Looped Transformer Arena
                  </h1>
                  <span className="text-[10px] bg-pink-500/10 border border-pink-500/20 text-pink-300 font-bold px-2 py-0.5 rounded-full uppercase font-mono">
                    Adaptive Compute
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowInfoModal(true)}
                    className="text-[10px] bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-bold px-2 py-0.5 rounded-full uppercase font-mono flex items-center gap-1 cursor-pointer transition"
                    title="Interactive Architecture Simulator / Sandbox Details"
                  >
                    <Info className="w-3 h-3 text-cyan-400" />
                    <span>Frontend Simulator</span>
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-0.5 max-w-2xl font-medium">
                  Fixed Feedforward Arrays vs. Weight-Tied Recurrent Engines on long-range dependency graphs.
                </p>
              </div>
            </div>

            {/* Scenario Selector & Hops info */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400 flex items-center gap-1 shrink-0">
                <Sliders className="w-3.5 h-3.5 text-purple-400" />
                Scenario:
              </span>
              <div className="flex flex-wrap gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
                {SCENARIOS.map((scen) => (
                  <button
                    key={scen.id}
                    onClick={() => {
                      if (!isRunning) {
                        setSelectedScenario(scen);
                        resetDemo();
                      }
                    }}
                    disabled={isRunning}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer flex items-center gap-1.5 ${
                      selectedScenario.id === scen.id
                        ? "bg-purple-600 text-white font-bold shadow-sm"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {scen.id === "maze-traversal" && <Compass className="w-3 h-3 text-cyan-300" />}
                    {scen.id === "fraud-ring" && <Network className="w-3 h-3 text-pink-300" />}
                    <span>{scen.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Market Concept Showcase & Sandbox Architecture Notice */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-2.5 sm:p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex items-start sm:items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5 shrink-0 mt-1 sm:mt-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-pink-500"></span>
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-white font-bold uppercase tracking-wider text-[11px]">
                    Market Horizon Concept:
                  </span>
                  <span className="text-pink-300 font-mono font-semibold text-[11px] bg-pink-500/10 border border-pink-500/20 px-1.5 py-0.5 rounded">
                    Live Maze Traversal / Fraud Ring Discovery
                  </span>
                  <span className="text-[10px] text-amber-300/90 font-mono font-medium">
                    (Looping Transformation release vanguard)
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Interactive Architecture Simulator & Sandbox running 100% in frontend JavaScript — mathematically mirroring recurrent weight-tied feedback and exit conditions with zero GPU overhead.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowInfoModal(true)}
              className="self-start md:self-auto shrink-0 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white font-mono text-[11px] py-1 px-2.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer"
            >
              <Info className="w-3 h-3 text-purple-400" />
              <span>Simulator Spec</span>
            </button>
          </div>
        </header>

        {/* Action & Clock Speed Control Row */}
        <section className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-3 sm:p-4 backdrop-blur-sm">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 w-full">
            {/* Primary Execution Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
              {/* Execute Parallel Run Button */}
              <button
                id="btn-start-inference"
                onClick={startInference}
                disabled={isRunning || stdStatus !== "IDLE"}
                className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 disabled:opacity-40 text-white font-bold font-mono tracking-wider uppercase py-2.5 px-4 rounded-xl text-xs transition duration-200 shadow-[0_0_20px_rgba(236,72,153,0.3)] cursor-pointer flex items-center justify-center gap-2"
              >
                <Flame className="w-4 h-4" />
                <span>{isRunning ? "Parallel Execution in Progress..." : "Execute Parallel Run"}</span>
              </button>

              {/* Reset Arena Button */}
              <button
                id="btn-reset-arena"
                onClick={resetDemo}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono py-2.5 px-4 rounded-xl text-xs transition border border-slate-700 cursor-pointer text-center"
              >
                Reset Arena
              </button>
            </div>

            {/* Clock Speed & Utility Controls */}
            <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2.5">
              {/* Clock Speed Control Selector */}
              <div className="flex items-center gap-1 bg-slate-950/90 p-1 rounded-xl border border-slate-800 shadow-inner">
                <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400 pl-2 pr-1">
                  <Gauge className="w-3.5 h-3.5 text-pink-400" />
                  <span className="font-semibold text-slate-300">Clock:</span>
                </div>
                <div className="flex items-center gap-1">
                  {CLOCK_SPEED_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleClockSpeedChange(opt.value)}
                      title={`${opt.label} (${opt.hz}, ${opt.ms}ms cycle)`}
                      className={`px-2 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                        clockSpeed === opt.value
                          ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-sm"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <span className="text-[10px] font-mono text-slate-500 pr-2 pl-0.5 hidden sm:inline-block">
                  {currentClockOpt.hz}
                </span>
              </div>

              {/* Glowing Repository Download Button Component */}
              <button
                id="btn-download-zip"
                onClick={handleDownloadSource}
                className="bg-slate-950 hover:bg-slate-900 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:border-emerald-500/60 text-emerald-400 font-mono font-bold py-2 px-3 sm:px-4 rounded-xl text-xs transition flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Clone .ZIP</span>
              </button>

              {/* Open Summary Modal Button */}
              {(stdStatus.includes("FAIL") || loopStatus.includes("SUCCESS")) && (
                <button
                  onClick={() => setShowModal(true)}
                  className="bg-purple-950/60 hover:bg-purple-900/80 border border-purple-500/40 text-purple-300 font-mono font-bold py-2 px-3 sm:px-4 rounded-xl text-xs transition flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <BarChart2 className="w-3.5 h-3.5" />
                  <span>Summary</span>
                </button>
              )}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* Main Grid Viewports (Mobile-First: Single col on mobile, 2 cols on desktop) */}
        {/* ========================================================================= */}
        <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-6">
          
          {/* STANDARD FEED-FORWARD PANEL */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="flex flex-col h-full"
          >
            <StandardPanel
              scenario={selectedScenario}
              stdStatus={stdStatus}
              stdLayer={stdLayer}
              stdHopsFound={stdHopsFound}
              complexityHops={selectedScenario.complexityHops}
              isRunning={isRunning}
            />
          </motion.div>

          {/* LOOPED TRANSFORMER MODEL PANEL */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25, ease: "easeOut" }}
            className="flex flex-col h-full"
          >
            <LoopedPanel
              scenario={selectedScenario}
              loopStatus={loopStatus}
              loopCount={loopCount}
              loopHopsFound={loopHopsFound}
              complexityHops={selectedScenario.complexityHops}
              loopDelta={loopDelta}
              loopConfidence={loopConfidence}
              isRunning={isRunning}
            />
          </motion.div>

        </main>

        {/* Cyberpunk Terminal Console Output panel */}
        <TelemetryConsole
          logs={logs}
          onClearLogs={() => setLogs([])}
          clockSpeedLabel={`${currentClockOpt.label} (${currentClockOpt.hz})`}
        />

      </div>

      {/* Benchmark Summary Modal */}
      <BenchmarkModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        loopCount={loopCount}
        complexityHops={selectedScenario.complexityHops}
      />

      {/* Architecture Simulator / Sandbox Info Modal */}
      <ArchitectureInfoModal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
      />
    </div>
  );
}
