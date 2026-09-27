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
    <header className="border-b border-amber-200/10 bg-[#080807]/95 backdrop-blur sticky top-0 z-50 px-4 py-3">
      <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3">
        {/* Brand & Concept */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#f5e6bd] via-[#c8a96b] to-[#6e552c] flex items-center justify-center shadow-lg shadow-amber-900/20 ring-1 ring-amber-200/30">
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
            <div className="flex items-center gap-2 flex-wrap justify-center xl:justify-end">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                THE SUPERPOWER
                <span className="hidden sm:inline text-xs px-2 py-0.5 rounded-full bg-amber-950/30 text-amber-200/80 border border-amber-200/15 font-mono font-medium">
                  AUTONOMOUS ARCHITECTURE
                </span>
              </h1>
            </div>
            <p className="text-xs text-stone-400 font-mono truncate max-w-[72vw] xl:max-w-none">
              Womb Governance • Virtual Neuromorphic Silicon • Twin Mind + Patty • CHEK Authority
            </p>
          </div>
        </div>

        {/* Live Substrate Telemetry Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-3 gap-y-2 bg-stone-950/70 border border-amber-200/10 rounded-lg px-3 py-2 text-xs font-mono w-full xl:w-auto">
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-amber-200 animate-pulse" />
            <span className="text-slate-400">Tick:</span>
            <span className="text-stone-100 font-semibold">{telemetry.tick}</span>
          </div>

          <div className="hidden" />

          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-200" />
            <span className="text-slate-400">Power:</span>
            <span className="text-stone-100 font-semibold">{telemetry.powerMillwatts} mW</span>
          </div>

          <div className="hidden" />

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Entropy:</span>
            <span
              className={`font-semibold ${
                telemetry.entropy > 3.8 ? 'text-red-400' : 'text-stone-100'
              }`}
            >
              {telemetry.entropy} bits
            </span>
          </div>

          <div className="hidden" />

          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-200" />
            <span className="text-slate-400">Refusal:</span>
            <span
              className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                telemetry.refusalGateTripped
                  ? 'bg-red-950 text-red-400 border border-red-800'
                  : 'bg-stone-900 text-stone-200 border border-stone-700'
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
                ? 'bg-amber-950/60 text-amber-100 cursor-wait'
                : telemetry.killPathSevered
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#9b7a3f] to-[#c8a96b] hover:from-[#b08d4d] hover:to-[#dfc487] text-black shadow-amber-950/30 active:scale-95'
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
