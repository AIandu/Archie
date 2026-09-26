import React from 'react';
import { Cpu, ShieldCheck, Zap, Activity, AlertTriangle } from 'lucide-react';
import { SubstrateTelemetry } from '../types/architecture';

interface HeaderProps {
  telemetry: SubstrateTelemetry;
  activeStage: string;
  onSelectStage: (stage: any) => void;
  onRunAutonomousCycle: () => void;
  isRunningCycle: boolean;
  onEmergencyKill: () => void;
  onRearmKill: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  telemetry,
  activeStage,
  onSelectStage,
  onRunAutonomousCycle,
  isRunningCycle,
  onEmergencyKill,
  onRearmKill,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur sticky top-0 z-50 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand & Concept */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/40">
              <Cpu className="w-6 h-6 text-white" />
            </div>
            {telemetry.killPathSevered && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                THE SUPERPOWER
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/80 font-mono font-medium">
                  AUTONOMOUS ARCHITECTURE
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Womb Governance • Virtual Neuromorphic Silicon • Twin Mind + Patty • CHEK Authority
            </p>
          </div>
        </div>

        {/* Live Substrate Telemetry Strip */}
        <div className="flex items-center gap-4 bg-slate-900/80 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="text-slate-400">Tick:</span>
            <span className="text-cyan-300 font-semibold">{telemetry.tick}</span>
          </div>

          <div className="h-3 w-px bg-slate-800" />

          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">Power:</span>
            <span className="text-amber-300 font-semibold">{telemetry.powerMillwatts} mW</span>
          </div>

          <div className="h-3 w-px bg-slate-800" />

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Entropy:</span>
            <span
              className={`font-semibold ${
                telemetry.entropy > 3.8 ? 'text-red-400 animate-pulse' : 'text-emerald-400'
              }`}
            >
              {telemetry.entropy} bits
            </span>
          </div>

          <div className="h-3 w-px bg-slate-800" />

          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-400">Refusal:</span>
            <span
              className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                telemetry.refusalGateTripped
                  ? 'bg-red-950 text-red-400 border border-red-800'
                  : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
              }`}
            >
              {telemetry.refusalGateTripped ? 'TRIPPED' : 'ARMED'}
            </span>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onRunAutonomousCycle}
            disabled={isRunningCycle || telemetry.killPathSevered}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all shadow-md ${
              isRunningCycle
                ? 'bg-indigo-700/60 text-indigo-200 cursor-wait'
                : telemetry.killPathSevered
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-cyan-500/20 active:scale-95'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${isRunningCycle ? 'animate-spin' : ''}`} />
            {isRunningCycle ? 'Executing Full Cycle...' : 'Run Autonomous Cycle'}
          </button>

          {telemetry.killPathSevered ? (
            <button
              onClick={onRearmKill}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-slate-950 flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Re-Arm Kill Path
            </button>
          ) : (
            <button
              onClick={onEmergencyKill}
              title="Hardware Emergency Pull-Down: quenches all axonal activity instantly"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800 flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              Kill Wire
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
