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
  }[] = [
    {
      id: 'womb',
      stepNumber: 1,
      label: 'WOMB',
      verb: 'DEFINES',
      icon: ShieldAlert,
    },
    {
      id: 'substrate',
      stepNumber: 2,
      label: 'CHIP SUBSTRATE',
      verb: 'CONSTRAINS',
      icon: Cpu,
    },
    {
      id: 'twinmind',
      stepNumber: 3,
      label: 'TWIN MIND',
      verb: 'REASONS',
      icon: Users,
    },
    {
      id: 'patty',
      stepNumber: 4,
      label: 'SARGENT PATTY',
      verb: 'CONVERGES',
      icon: Award,
    },
    {
      id: 'chek',
      stepNumber: 5,
      label: 'CHEK',
      verb: 'AUTHORIZES',
      icon: Lock,
    },
    {
      id: 'execution',
      stepNumber: 6,
      label: 'EXECUTION & PLASTICITY',
      verb: 'EXECUTES & LEARNS',
      icon: Play,
    },
  ];

  return (
    <div className="bg-[#0b0a08]/80 border-b border-amber-200/10 py-2.5 px-4 overflow-x-auto">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 min-w-[720px]">
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
                      ? 'bg-amber-950/20 text-stone-100 border-amber-200/40 shadow-md shadow-black/40'
                      : isCycleCurrent
                      ? 'bg-amber-950/30 text-amber-100 border-amber-200/50'
                      : 'bg-black/30 text-stone-400 border-stone-800 hover:bg-stone-900/70 hover:text-stone-200'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold ${
                      isActive
                        ? 'bg-gradient-to-br from-[#e2c98d] to-[#8d6d35] text-black'
                        : 'bg-stone-900 text-stone-500 group-hover:text-stone-200'
                    }`}
                  >
                    {step.stepNumber}
                  </div>

                  <div className="text-left flex flex-col">
                    <span className="font-bold tracking-wider leading-none text-[11px]">{step.label}</span>
                    <span
                      className={`text-[9px] uppercase tracking-wider font-semibold ${
                        isActive ? 'text-amber-200' : 'text-stone-600'
                      }`}
                    >
                      {step.verb}
                    </span>
                  </div>

                  {isActive && (
                    <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-amber-200 rounded-full" />
                  )}
                </button>

                {idx < steps.length - 1 && (
                  <div className="text-stone-700 text-xs px-0.5 select-none font-mono">→</div>
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
              ? 'bg-amber-950/30 text-amber-100 border-amber-200/40 shadow'
              : 'bg-black/30 text-stone-400 border-stone-800 hover:bg-stone-900/70'
          }`}
        >
          <FileCode className="w-3.5 h-3.5 text-amber-200" />
          <span>Silicon Spec</span>
        </button>
      </div>
    </div>
  );
};
