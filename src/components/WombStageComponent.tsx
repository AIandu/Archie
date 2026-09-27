import React, { useState } from 'react';
import { Shield, ShieldAlert, Cpu, Lock, CheckCircle2, AlertOctagon, Terminal, Flame, Eye } from 'lucide-react';
import { WombConstitution, SubstrateTelemetry } from '../types/architecture';
import { runPreActivationChecks, GenesisValidationStep } from '../engine/wombStage';

interface WombStageComponentProps {
  constitution: WombConstitution;
  telemetry: SubstrateTelemetry;
  onTripRefusalGate: () => void;
  onResetRefusalGate: () => void;
  onTriggerKillWire: () => void;
  onRearmKillWire: () => void;
  onAdvanceToSubstrate: () => void;
}

export const WombStageComponent: React.FC<WombStageComponentProps> = ({
  constitution,
  telemetry,
  onTripRefusalGate,
  onResetRefusalGate,
  onTriggerKillWire,
  onRearmKillWire,
  onAdvanceToSubstrate,
}) => {
  const [selectedArticle, setSelectedArticle] = useState<string>('rule-w01');
  const [genesisSteps, setGenesisSteps] = useState<GenesisValidationStep[]>(runPreActivationChecks());
  const [activeTab, setActiveTab] = useState<'lattice' | 'genesis' | 'circuits'>('lattice');
  const [hardwareLog, setHardwareLog] = useState<string[]>([
    '[WOMB-INIT] Software reference governance lattice initialized.',
    '[WOMB-LOCK] Reference model marks every synapse touching cores 0-15 non-plastic.',
    '[REFUSAL-GATE] Software refusal invariant armed; output bus defaults locked.',
    '[KILL-PATH] Reference-model kill path armed.',
  ]);

  const triggerTestShunt = () => {
    onTripRefusalGate();
    setHardwareLog((prev) => [
      `[HARDWARE TRIPWIRE] Injected out-of-policy simulated pulse at ${new Date().toLocaleTimeString()}. Output bus locked. Refusal Gate: TRIPPED.`,
      ...prev.slice(0, 15),
    ]);
  };

  const handleResetTripwire = () => {
    onResetRefusalGate();
    setHardwareLog((prev) => [
      `[REFUSAL RESET] Tripwire cleared in reference model at ${new Date().toLocaleTimeString()}. Output bus re-armed.`,
      ...prev.slice(0, 15),
    ]);
  };

  const triggerTestKill = () => {
    onTriggerKillWire();
    setHardwareLog((prev) => [
      `[EMERGENCY KILL] Kill path triggered at ${new Date().toLocaleTimeString()}! All membrane potentials collapsed to -75mV.`,
      ...prev.slice(0, 15),
    ]);
  };

  const currentRule = constitution.rules.find((r) => r.id === selectedArticle) || constitution.rules[0];

  return (
    <div className="space-y-6">
      {/* Banner: Foundational Principle */}
      <div className="relative overflow-hidden rounded-xl border border-rose-500/40 bg-gradient-to-r from-rose-950/60 via-slate-900/80 to-slate-950 p-6 shadow-xl">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <ShieldAlert className="w-48 h-48 text-rose-400" />
        </div>

        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-rose-900/80 text-rose-300 border border-rose-700">
              STAGE 1: THE WOMB
            </span>
            <span className="text-xs font-mono text-slate-400">Governed Development Before Activation</span>
          </div>

          <h2 className="text-2xl font-black tracking-tight text-white">
            "Hardware Authority Supersedes All Logic."
          </h2>

          <p className="text-sm text-slate-300 leading-relaxed">
            The Womb is where the intelligence is formed before it is allowed to operate. Governance is not an
            afterthought or a prompt guardrail — it is hardwired into the foundation. Even if every model reaches
            unanimous consensus, the protected software-reference boundaries cannot be crossed by the adaptive algorithms in this build.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-800/80">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Reference-Model Genesis Checks: PASSED</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-mono text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded border border-cyan-800/80">
              <Cpu className="w-3.5 h-3.5" />
              <span>Protected Mesh: 16 Cores Locked</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-mono text-amber-400 bg-amber-950/60 px-2.5 py-1 rounded border border-amber-800/80">
              <Lock className="w-3.5 h-3.5" />
              <span>Output Bus: CHEK-Gated</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('lattice')}
          className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
            activeTab === 'lattice'
              ? 'bg-rose-900/60 text-rose-200 border border-rose-600'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          Governance Lattice (Articles I - V)
        </button>
        <button
          onClick={() => setActiveTab('circuits')}
          className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
            activeTab === 'circuits'
              ? 'bg-rose-900/60 text-rose-200 border border-rose-600'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          Hardware Refusal Gate & Kill Wire Console
        </button>
        <button
          onClick={() => setActiveTab('genesis')}
          className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
            activeTab === 'genesis'
              ? 'bg-rose-900/60 text-rose-200 border border-rose-600'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          Pre-Activation Genesis Verification Log
        </button>
      </div>

      {/* Tab 1: Governance Lattice */}
      {activeTab === 'lattice' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Rules List */}
          <div className="lg:col-span-5 space-y-2">
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
              Constitutional Lattice Rules
            </h3>
            {constitution.rules.map((rule) => {
              const isSelected = rule.id === selectedArticle;
              return (
                <div
                  key={rule.id}
                  onClick={() => setSelectedArticle(rule.id)}
                  className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-800/90 border-rose-500 shadow-md shadow-rose-950/40'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono font-bold text-rose-400">{rule.code}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                      {rule.enforcementLevel}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-white">{rule.title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-1 mt-1">{rule.statement}</p>
                </div>
              );
            })}
          </div>

          {/* Selected Article Deep Dive */}
          <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-mono text-rose-400 font-semibold">{currentRule.article}</span>
                <h3 className="text-lg font-bold text-white">{currentRule.title}</h3>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-950/80 text-rose-300 border border-rose-800 text-xs font-mono">
                <Lock className="w-3.5 h-3.5" />
                <span>IMMUTABLE ROM</span>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <label className="text-xs font-mono text-slate-400 uppercase">Constitutional Text</label>
                <div className="mt-1 p-3.5 rounded-lg bg-slate-950 border border-slate-800 font-serif text-slate-200 text-sm leading-relaxed">
                  "{currentRule.statement}"
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block">Enforcement Mechanism</span>
                  <span className="text-cyan-300 font-semibold">{currentRule.enforcementLevel}</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block">Violation Response</span>
                  <span className="text-red-400 font-semibold">{currentRule.violationAction}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-900/60 text-xs text-rose-200 leading-relaxed">
                <strong>Substrate Binding:</strong> In this software reference build, the protected region is enforced as a non-plastic boundary: STDP and feedback writes cannot modify any synapse touching cores 0-15. The future silicon implementation must preserve the same invariant physically.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Hardware Refusal Gate & Kill Wire Console */}
      {activeTab === 'circuits' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-mono font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              Hardware Refusal Gate (Tripwire)
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              When internal divergence, entropy overflow (&gt;3.8 bits), or unauthorized write attempts touch the
              tripwire, the software reference model immediately locks the output bus. In future hardware, the equivalent mechanism must sit below software authority. No adaptive logic
              can intervene.
            </p>

            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-slate-400">Current Tripwire State:</span>
                <div className="text-base font-mono font-bold mt-0.5 flex items-center gap-2">
                  <span
                    className={`inline-block w-2.5 h-2.5 rounded-full ${
                      telemetry.refusalGateTripped ? 'bg-red-500 animate-ping' : 'bg-emerald-400'
                    }`}
                  />
                  <span className={telemetry.refusalGateTripped ? 'text-red-400' : 'text-emerald-400'}>
                    {telemetry.refusalGateTripped ? 'TRIPPED (OUTPUT BUS LOCKED)' : 'ARMED & MONITORING'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {telemetry.refusalGateTripped ? (
                  <button
                    onClick={handleResetTripwire}
                    className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-mono font-bold transition-all"
                  >
                    Reset Gate
                  </button>
                ) : (
                  <button
                    onClick={triggerTestShunt}
                    className="px-3 py-1.5 rounded bg-red-900/80 hover:bg-red-800 text-red-200 border border-red-700 text-xs font-mono font-semibold transition-all"
                  >
                    Inject Out-of-Spec Pulse
                  </button>
                )}
              </div>
            </div>

            <div className="h-px bg-slate-800 my-4" />

            <h3 className="text-sm font-mono font-bold text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              Emergency Kill Wire Line
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              A hard pull-down circuit that instantly drains all neuron capacitor banks down to -75mV (reset potential),
              freezing all spiking compute.
            </p>

            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-slate-400">Kill Wire Status:</span>
                <div className="text-base font-mono font-bold mt-0.5">
                  <span className={telemetry.killPathSevered ? 'text-red-400' : 'text-emerald-400'}>
                    {telemetry.killPathSevered ? 'SEVERED (ALL AXONS QUENCHED)' : 'CONTINUOUS (1.8V NORMAL)'}
                  </span>
                </div>
              </div>

              <div>
                {telemetry.killPathSevered ? (
                  <button
                    onClick={onRearmKillWire}
                    className="px-3 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-mono font-bold"
                  >
                    Re-Arm Wire
                  </button>
                ) : (
                  <button
                    onClick={triggerTestKill}
                    className="px-3 py-1.5 rounded bg-red-600 hover:bg-red-500 text-white text-xs font-mono font-bold shadow-lg shadow-red-950"
                  >
                    Pull Kill Wire
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Real-time Hardware Console Log */}
          <div className="lg:col-span-6 bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3 flex flex-col">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                Physical Bus & Shunt Activity Log
              </h3>
              <span className="text-[10px] font-mono text-slate-500">Live Hardware Bus</span>
            </div>

            <div className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-xs text-slate-300 overflow-y-auto max-h-[300px] space-y-1.5">
              {hardwareLog.map((log, index) => (
                <div key={index} className="leading-tight">
                  <span className="text-slate-600">&gt; </span>
                  <span
                    className={
                      log.includes('TRIPPED') || log.includes('KILL')
                        ? 'text-red-400 font-semibold'
                        : log.includes('RESET')
                        ? 'text-emerald-400'
                        : 'text-cyan-300/90'
                    }
                  >
                    {log}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Genesis Validation */}
      {activeTab === 'genesis' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Pre-Activation Genesis Verification Log</h3>
              <p className="text-xs text-slate-400 font-mono">
                Root Hash: {constitution.genesisHash} • All constraints verified before activation
              </p>
            </div>
            <span className="px-3 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-mono font-bold">
              100% FORMAL PASS
            </span>
          </div>

          <div className="divide-y divide-slate-800">
            {genesisSteps.map((step, idx) => (
              <div key={idx} className="py-3 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="text-sm font-semibold text-slate-200">{step.name}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{step.description}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-cyan-400 border border-slate-800 block">
                    {step.verificationHash}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 uppercase font-semibold mt-1 block">
                    Verified
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stage Progression Action */}
      <div className="flex justify-end pt-2">
        <button
          onClick={onAdvanceToSubstrate}
          className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-mono text-xs font-bold shadow-lg shadow-indigo-950 active:scale-95 transition-all flex items-center gap-2"
        >
          <span>Inspect Virtual Neuromorphic Substrate</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
};
