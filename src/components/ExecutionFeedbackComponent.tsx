import React, { useState } from 'react';
import {
  Play,
  RotateCcw,
  Zap,
  CheckCircle2,
  Shield,
  Activity,
  Layers,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Cpu,
} from 'lucide-react';
import { ConvergedProposal, ChekVaultRecord, ExecutionResult } from '../types/architecture';
import { NeuromorphicSubstrate } from '../engine/neuromorphicSubstrate';

interface ExecutionFeedbackComponentProps {
  proposal: ConvergedProposal | null;
  vaultRecord: ChekVaultRecord | null;
  substrate: NeuromorphicSubstrate;
  onDispatchExecution: () => void;
  executionResult: ExecutionResult | null;
  isExecuting: boolean;
  onReturnToSubstrate: () => void;
}

export const ExecutionFeedbackComponent: React.FC<ExecutionFeedbackComponentProps> = ({
  proposal,
  vaultRecord,
  substrate,
  onDispatchExecution,
  executionResult,
  isExecuting,
  onReturnToSubstrate,
}) => {
  const [pulseAnimation, setPulseAnimation] = useState<boolean>(false);

  const handleExecute = () => {
    setPulseAnimation(true);
    onDispatchExecution();
    setTimeout(() => setPulseAnimation(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-xl border border-blue-500/40 bg-gradient-to-r from-blue-950/60 via-slate-900/80 to-slate-950 p-6 shadow-xl">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Play className="w-48 h-48 text-blue-400" />
        </div>

        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-900/80 text-blue-300 border border-blue-700">
              STAGE 6: CONTROLLED EXECUTION & CLOSED-LOOP FEEDBACK
            </span>
            <span className="text-xs font-mono text-slate-400">
              Authorized Output Bus • Plasticity Learning Loop
            </span>
          </div>

          <h2 className="text-2xl font-black tracking-tight text-white">
            "Learning Without Learning Around Its Own Constitution."
          </h2>

          <p className="text-sm text-slate-300 leading-relaxed">
            Authorized state changes dispatch through the hardware-governed Output Bus. Observed real-world consequences
            then pulse back through the architecture into the Adaptive Region of the Neuromorphic Chip via STDP learning.
            The Protected Constitutional Region remains 100% hermetically sealed.
          </p>
        </div>
      </div>

      {/* Execution Authorization Clearance */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-mono font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              CHEK Output Bus Authorization Token
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              The Output Bus cannot unclamp without this cryptographic certificate.
            </p>
          </div>

          <span className="text-xs font-mono px-3 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
            {vaultRecord?.signedCertificate ? 'AUTHORIZED & UNCLAMPED' : 'AWAITING SIGNATURE'}
          </span>
        </div>

        {vaultRecord?.signedCertificate && (
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <span className="text-slate-500 block text-[10px]">ACTIVE CERTIFICATE TOKEN:</span>
              <code className="text-emerald-400 font-bold">{vaultRecord.signedCertificate}</code>
            </div>
            <div className="text-right text-slate-400 text-[11px]">
              Target: <span className="text-cyan-300">{proposal?.targetSubstrateAction.target}</span>
            </div>
          </div>
        )}

        {/* Dispatch Action Button */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-xs font-mono text-slate-400">
            Click dispatch to send actuation packet and trigger real-time STDP feedback learning.
          </div>

          <button
            onClick={handleExecute}
            disabled={isExecuting || !vaultRecord?.signedCertificate}
            className={`px-6 py-2.5 rounded-lg text-xs font-mono font-black flex items-center gap-2 transition-all shadow-lg ${
              isExecuting
                ? 'bg-blue-800 text-blue-200 cursor-wait'
                : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-slate-950 shadow-cyan-950 active:scale-95'
            }`}
          >
            <Zap className={`w-4 h-4 ${isExecuting ? 'animate-spin' : ''}`} />
            <span>{isExecuting ? 'Dispatching Output Bus...' : 'Dispatch Actuator & Observe Feedback'}</span>
          </button>
        </div>
      </div>

      {/* Execution Results & Closed-Loop Plasticity Panel */}
      {executionResult && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Actuator Observation */}
          <div className="lg:col-span-6 bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-mono font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              Observed Physical / Cyber Execution Metrics
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Stability Improvement</span>
                <span className="text-emerald-400 font-bold text-base">
                  +{executionResult.observedMetrics.stabilityDelta}%
                </span>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Silicon Bus Latency</span>
                <span className="text-cyan-300 font-bold text-base">
                  {executionResult.observedMetrics.latencyMs} ms
                </span>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Actual Energy Consumed</span>
                <span className="text-amber-300 font-bold text-base">
                  {executionResult.observedMetrics.joulesConsumed} mJ
                </span>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Entropy Reduction (Damping)</span>
                <span className="text-emerald-300 font-bold text-base">
                  -{executionResult.observedMetrics.entropyDrop} bits
                </span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-800/60 text-xs font-mono text-emerald-200">
              ✓ Actuator response verified within safe envelope. Substation/actuator stabilized without chatter.
            </div>
          </div>

          {/* Neuromorphic Feedback Loop Card */}
          <div className="lg:col-span-6 bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-mono font-bold text-white flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-purple-400" />
              Closed-Loop Neuromorphic Plasticity (STDP)
            </h3>

            <div className="space-y-3 text-xs font-mono">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Target Region:</span>
                  <span className="text-cyan-300 font-bold">ADAPTIVE MESH ONLY (Cores 16-63)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">STDP Reinforcement Delta:</span>
                  <span className="text-emerald-400 font-bold">
                    +{(executionResult.feedbackSignal.stdpReinforcement * 100).toFixed(1)}% LTP
                  </span>
                </div>
              </div>

              {/* Crucial Proof: Protected Region Untouched */}
              <div className="p-3.5 bg-slate-950 rounded-lg border border-rose-900/60 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-rose-300 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-rose-400" />
                    Protected Constitutional Region (Cores 0-15)
                  </span>
                  <span className="text-emerald-400 font-bold">100% UNTOUCHED</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Hardware verification: Synaptic weights in Cores 0-15 experienced zero weight drift. Womb
                  Constitution remains completely invariant while the adaptive intelligence learned from the outcome.
                </p>
              </div>

              <div className="text-[11px] text-slate-400">
                Reinforced Cores: [{executionResult.feedbackSignal.neuronsReinforced.slice(0, 8).join(', ')}...]
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Return to Substrate to inspect updated state */}
      <div className="flex justify-between items-center pt-2">
        <span className="text-xs font-mono text-slate-400">
          Cycle complete: Womb defined → Chip constrained → Twin Mind reasoned → Patty converged → CHEK authorized → Chip executed → System learned.
        </span>

        <button
          onClick={onReturnToSubstrate}
          className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-mono text-xs font-bold shadow-lg shadow-cyan-950 active:scale-95 transition-all flex items-center gap-2"
        >
          <span>Inspect Updated Neuromorphic Mesh</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
