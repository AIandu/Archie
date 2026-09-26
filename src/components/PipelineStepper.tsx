import React from 'react';
import { ShieldAlert, Cpu, Users, Award, Lock, Play, RotateCcw, FileCode } from 'lucide-react';

export type StageId =
  | 'womb'
  | 'substrate'
  | 'twinmind'
  | 'patty'
  | 'chek'
  | 'execution'
  | 'silicon-spec';

interface PipelineStepperProps {
  activeStage: StageId;
  onSelectStage: (stage: StageId) => void;
  cycleActiveStep?: number; // 0 to 6 during automated execution
}

export const PipelineStepper: React.FC<PipelineStepperProps> = ({
  activeStage,
  onSelectStage,
  cycleActiveStep,
}) => {
  const steps: {
    id: StageId;
    stepNumber: number;
    label: string;
    verb: string;
    icon: React.ComponentType<{ className?: string }>;
    accentColor: string;
  }[] = [
    {
      id: 'womb',
      stepNumber: 1,
      label: 'WOMB',
      verb: 'DEFINES',
      icon: ShieldAlert,
      accentColor: 'from-rose-500 to-red-600',
    },
    {
      id: 'substrate',
      stepNumber: 2,
      label: 'CHIP SUBSTRATE',
      verb: 'CONSTRAINS',
      icon: Cpu,
      accentColor: 'from-cyan-500 to-blue-600',
    },
    {
      id: 'twinmind',
      stepNumber: 3,
      label: 'TWIN MIND',
      verb: 'REASONS',
      icon: Users,
      accentColor: 'from-purple-500 to-indigo-600',
    },
    {
      id: 'patty',
      stepNumber: 4,
      label: 'SARGENT PATTY',
      verb: 'CONVERGES',
      icon: Award,
      accentColor: 'from-amber-500 to-orange-600',
    },
    {
      id: 'chek',
      stepNumber: 5,
      label: 'CHEK',
      verb: 'AUTHORIZES',
      icon: Lock,
      accentColor: 'from-emerald-500 to-teal-600',
    },
    {
      id: 'execution',
      stepNumber: 6,
      label: 'EXECUTION & PLASTICITY',
      verb: 'EXECUTES & LEARNS',
      icon: Play,
      accentColor: 'from-blue-500 to-cyan-600',
    },
  ];

  return (
    <div className="bg-slate-900/60 border-b border-slate-800 py-2.5 px-4 overflow-x-auto">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 min-w-[760px]">
        {/* Core Steps */}
        <div className="flex items-center gap-1.5 flex-1">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isActive = activeStage === step.id;
            const isCycleCurrent = cycleActiveStep === step.stepNumber;

            return (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => onSelectStage(step.id)}
                  className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-all border ${
                    isActive
                      ? 'bg-slate-800 text-white border-cyan-500/80 shadow-md shadow-cyan-950/50'
                      : isCycleCurrent
                      ? 'bg-cyan-950/80 text-cyan-200 border-cyan-400 animate-pulse'
                      : 'bg-slate-950/50 text-slate-400 border-slate-800/80 hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold ${
                      isActive
                        ? `bg-gradient-to-br ${step.accentColor} text-white`
                        : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'
                    }`}
                  >
                    {step.stepNumber}
                  </div>

                  <div className="text-left flex flex-col">
                    <span className="font-bold tracking-wider leading-none text-[11px]">{step.label}</span>
                    <span
                      className={`text-[9px] uppercase tracking-wider font-semibold ${
                        isActive ? 'text-cyan-400' : 'text-slate-500'
                      }`}
                    >
                      {step.verb}
                    </span>
                  </div>

                  {isActive && (
                    <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-cyan-400 rounded-full" />
                  )}
                </button>

                {idx < steps.length - 1 && (
                  <div className="text-slate-600 text-xs px-0.5 select-none font-mono">→</div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Silicon Portability Spec Link */}
        <button
          onClick={() => onSelectStage('silicon-spec')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border transition-all ${
            activeStage === 'silicon-spec'
              ? 'bg-indigo-950 text-indigo-200 border-indigo-400 shadow'
              : 'bg-slate-950/40 text-indigo-400 border-slate-800 hover:bg-indigo-950/30'
          }`}
        >
          <FileCode className="w-3.5 h-3.5 text-indigo-400" />
          <span>Silicon Spec</span>
        </button>
      </div>
    </div>
  );
};
