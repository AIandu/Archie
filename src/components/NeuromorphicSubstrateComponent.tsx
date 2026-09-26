import React, { useState, useRef } from 'react';
import {
  Cpu,
  Zap,
  Activity,
  Shield,
  Layers,
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Sparkles,
  Info,
  Sliders,
  Terminal,
} from 'lucide-react';
import { SpikingNeuron, SubstrateTelemetry } from '../types/architecture';
import { NeuromorphicSubstrate, PROTECTED_NEURON_COUNT, GRID_SIZE } from '../engine/neuromorphicSubstrate';

interface NeuromorphicSubstrateComponentProps {
  substrate: NeuromorphicSubstrate;
  telemetry: SubstrateTelemetry;
  onStep: () => void;
  isAutoRunning: boolean;
  onToggleAutoRun: () => void;
  tickRateHz: number;
  onChangeTickRate: (hz: number) => void;
  onAdvanceToTwinMind: () => void;
}

export const NeuromorphicSubstrateComponent: React.FC<NeuromorphicSubstrateComponentProps> = ({
  substrate,
  telemetry,
  onStep,
  isAutoRunning,
  onToggleAutoRun,
  tickRateHz,
  onChangeTickRate,
  onAdvanceToTwinMind,
}) => {
  const [selectedNeuronId, setSelectedNeuronId] = useState<number>(18);
  const [portabilityView, setPortabilityView] = useState<'virtual' | 'fpga' | 'asic'>('virtual');
  
  const selectedNeuron = substrate.neurons[selectedNeuronId] || substrate.neurons[0];

  // Track voltage history for oscilloscope without triggering state updates / cascading re-renders
  const voltageHistoryRef = useRef<number[]>([]);
  const lastRecordedTickRef = useRef<number>(-1);
  const lastNeuronIdRef = useRef<number>(selectedNeuronId);

  if (lastNeuronIdRef.current !== selectedNeuronId) {
    lastNeuronIdRef.current = selectedNeuronId;
    voltageHistoryRef.current = selectedNeuron ? [selectedNeuron.membranePotential] : [];
    lastRecordedTickRef.current = telemetry.tick;
  } else if (lastRecordedTickRef.current !== telemetry.tick) {
    lastRecordedTickRef.current = telemetry.tick;
    if (selectedNeuron) {
      voltageHistoryRef.current.push(selectedNeuron.membranePotential);
      if (voltageHistoryRef.current.length > 30) {
        voltageHistoryRef.current.shift();
      }
    }
  }

  const handleNeuronClick = (id: number) => {
    setSelectedNeuronId(id);
  };

  const handleStimulateNeuron = (id: number) => {
    substrate.injectExternalStimulus([id], 15.0);
  };

  const handleInjectBurst = () => {
    const burstTargets = [16, 17, 18, 19, 24, 25, 26, 27];
    substrate.injectExternalStimulus(burstTargets, 18.0);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-xl border border-cyan-500/40 bg-gradient-to-r from-cyan-950/60 via-slate-900/80 to-slate-950 p-6 shadow-xl">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Cpu className="w-48 h-48 text-cyan-400" />
        </div>

        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-900/80 text-cyan-300 border border-cyan-700">
              STAGE 2: BRAIN SUBSTRATE
            </span>
            <span className="text-xs font-mono text-slate-400">Virtual Neuromorphic Silicon Engine</span>
          </div>

          <h2 className="text-2xl font-black tracking-tight text-white">
            Real Computational Spiking Substrate
          </h2>

          <p className="text-sm text-slate-300 leading-relaxed">
            Not a mock illustration. This is a running computational implementation of the spiking substrate:
            Leaky Integrate-and-Fire (LIF) dynamics, Spike-Timing-Dependent Plasticity (STDP), routing crossbar mesh,
            immutable Protected Region, and live telemetry. The rest of the architecture doesn't care whether this
            substrate is virtual, an FPGA prototype, or fabricated silicon.
          </p>

          {/* Substrate Portability Switch */}
          <div className="pt-2 flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Target Substrate:</span>
            <div className="inline-flex rounded-lg bg-slate-950 p-1 border border-slate-800 text-xs font-mono">
              <button
                onClick={() => setPortabilityView('virtual')}
                className={`px-3 py-1 rounded transition-all ${
                  portabilityView === 'virtual'
                    ? 'bg-cyan-600 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Virtual Substrate (Active)
              </button>
              <button
                onClick={() => setPortabilityView('fpga')}
                className={`px-3 py-1 rounded transition-all ${
                  portabilityView === 'fpga'
                    ? 'bg-cyan-600 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                FPGA RTL Crossbar
              </button>
              <button
                onClick={() => setPortabilityView('asic')}
                className={`px-3 py-1 rounded transition-all ${
                  portabilityView === 'asic'
                    ? 'bg-cyan-600 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Fabricated Silicon ASIC
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hardware Portability Callout when FPGA or ASIC is selected */}
      {portabilityView !== 'virtual' && (
        <div className="bg-slate-900 border border-indigo-700/60 rounded-xl p-4 font-mono text-xs text-indigo-200 space-y-2">
          <div className="flex items-center justify-between text-indigo-400 font-bold">
            <span className="flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              {portabilityView === 'fpga' ? 'FPGA / Verilog RTL Crossbar Spec' : 'Fabricated Spiking ASIC Silicon Spec'}
            </span>
            <span className="text-[10px] text-slate-400">Substrate Agnostic Interface</span>
          </div>
          <p className="text-slate-300">
            {portabilityView === 'fpga'
              ? 'The Twin Mind and CHEK communicate with the chip via memory-mapped SPI/AXI4 register packet protocols. Synthesizable directly to Xilinx Ultrascale+ or Intel Stratix 10.'
              : 'Physical TSMC 28nm Low-Power Neuromorphic layout: Cores 0-15 physically unroute STDP write-enable transistors, guaranteeing hardware immunity against software tampering.'}
          </p>
          <pre className="bg-slate-950 p-3 rounded text-[11px] text-cyan-300 overflow-x-auto">
            {portabilityView === 'fpga'
              ? `// Verilog Neuromorphic Crossbar Mesh (Excerpt)
module NeuromorphicMesh_8x8 (
  input  wire clk, rst_n, kill_wire_carrier,
  input  wire [63:0] axon_in,
  output wire [63:0] spike_out,
  output wire refusal_tripwire
);
  // Protected Region Cores 0-15: STDP write-lines tied to ground
  wire [15:0] stdp_we_protected = 16'h0000; // HARDWARE IMMUTABLE
  // Adaptive Region Cores 16-63: STDP enabled with thermal governor
  wire [47:0] stdp_we_adaptive = active_stdp_bus & ~thermal_trip;
endmodule`
              : `// Silicon Layout & Physical Bonding Spec
Package: FC-BGA 256-ball | Foundry: TSMC 28nm HPC+
Core Sector 0-15: Hardwired Read-Only Metallization Layer M4-M5 (Constitutional Invariant)
Core Sector 16-63: Memristive RRAM Crossbar Synaptic Array (Adaptive Plasticity)
Kill Wire: Dedicated Low-Impedance 1.8V Pull-Down Line (Zero Clock Gating)`}
          </pre>
        </div>
      )}

      {/* Main Grid & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Neuromorphic 8x8 Grid Canvas */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-mono font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                8x8 Crossbar Mesh Architecture (64 Spiking Cores)
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Click any neuron to inspect membrane dynamics or inject stimulus
              </p>
            </div>

            {/* Region Legend */}
            <div className="flex items-center gap-3 text-[11px] font-mono">
              <span className="flex items-center gap-1.5 text-rose-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-600/80 border border-rose-400 inline-block" />
                Protected ROM (0-15)
              </span>
              <span className="flex items-center gap-1.5 text-cyan-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-cyan-600/80 border border-cyan-400 inline-block" />
                Adaptive Plasticity (16-63)
              </span>
            </div>
          </div>

          {/* Interactive 8x8 Mesh Display */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 shadow-inner flex flex-col items-center justify-center">
            <div className="grid grid-cols-8 gap-2 w-full max-w-[440px]">
              {substrate.neurons.map((neuron) => {
                const isProtected = neuron.region === 'PROTECTED';
                const isSelected = neuron.id === selectedNeuronId;
                const hasSpiked = neuron.spikedThisTick;

                // Potential ratio between -75mV (reset) and -55mV (threshold)
                const vRatio = Math.max(0, Math.min(1, (neuron.membranePotential - -75) / 20));

                return (
                  <button
                    key={neuron.id}
                    onClick={() => handleNeuronClick(neuron.id)}
                    title={`Core #${neuron.id} (${neuron.region}): V=${neuron.membranePotential.toFixed(
                      1,
                    )}mV | Spikes=${neuron.totalSpikes}`}
                    className={`relative aspect-square rounded-lg flex flex-col items-center justify-center transition-all p-1 border font-mono select-none ${
                      isSelected
                        ? 'ring-2 ring-white scale-105 z-10'
                        : 'hover:scale-105 hover:z-10'
                    } ${
                      hasSpiked
                        ? 'bg-white text-slate-950 border-white shadow-lg shadow-white/80 animate-ping-short'
                        : isProtected
                        ? 'bg-rose-950/70 border-rose-700/80 text-rose-300'
                        : 'bg-cyan-950/70 border-cyan-800/70 text-cyan-300'
                    }`}
                    style={{
                      boxShadow: hasSpiked
                        ? '0 0 16px rgba(255, 255, 255, 0.9)'
                        : isProtected
                        ? `0 0 ${vRatio * 8}px rgba(244, 63, 94, ${vRatio * 0.5})`
                        : `0 0 ${vRatio * 8}px rgba(6, 182, 212, ${vRatio * 0.5})`,
                    }}
                  >
                    {/* Protected lock icon on cores 0-15 */}
                    {isProtected && (
                      <span className="absolute top-0.5 right-0.5 text-[8px] text-rose-400">
                        <Shield className="w-2 h-2" />
                      </span>
                    )}

                    <span className="text-[10px] font-bold leading-none">{neuron.id}</span>
                    <span className="text-[8px] opacity-75 leading-none mt-0.5">
                      {neuron.membranePotential.toFixed(0)}m
                    </span>

                    {/* Firing glow indicator */}
                    {hasSpiked && (
                      <span className="absolute inset-0 rounded-lg bg-white opacity-40 animate-pulse pointer-events-none" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Mesh Status Footer */}
            <div className="w-full max-w-[440px] flex items-center justify-between mt-3 text-[10px] font-mono text-slate-500">
              <span>Row 0-1: Constitutional ROM (Immutable)</span>
              <span>Row 2-7: Adaptive STDP Mesh</span>
            </div>
          </div>

          {/* Interactive Simulation Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <button
                onClick={onToggleAutoRun}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow ${
                  isAutoRunning
                    ? 'bg-amber-600 hover:bg-amber-500 text-slate-950'
                    : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-950'
                }`}
              >
                {isAutoRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {isAutoRunning ? 'Pause Engine' : 'Run Clock'}
              </button>

              <button
                onClick={onStep}
                disabled={isAutoRunning}
                className="px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1 disabled:opacity-50"
              >
                <SkipForward className="w-3.5 h-3.5" />
                Step 1 Tick
              </button>

              <button
                onClick={() => handleStimulateNeuron(selectedNeuronId)}
                className="px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-800/80 flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Stimulate #{selectedNeuronId}
              </button>

              <button
                onClick={handleInjectBurst}
                className="px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-800/80 flex items-center gap-1"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Inject Burst
              </button>
            </div>

            {/* Clock Rate */}
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span>Freq:</span>
              <select
                value={tickRateHz}
                onChange={(e) => onChangeTickRate(Number(e.target.value))}
                className="bg-slate-950 border border-slate-800 text-cyan-300 text-xs rounded px-2 py-1"
              >
                <option value={5}>5 Hz</option>
                <option value={15}>15 Hz</option>
                <option value={30}>30 Hz</option>
                <option value={60}>60 Hz</option>
              </select>
            </div>
          </div>
        </div>

        {/* Selected Neuron Inspector & Oscilloscope */}
        <div className="lg:col-span-5 space-y-4">
          {/* Neuron Deep Dive */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <span
                  className={`w-3 h-3 rounded-full ${
                    selectedNeuron.region === 'PROTECTED' ? 'bg-rose-500' : 'bg-cyan-500'
                  }`}
                />
                <h3 className="text-sm font-bold text-white font-mono">
                  Core #{selectedNeuron.id} [Grid ({selectedNeuron.x}, {selectedNeuron.y})]
                </h3>
              </div>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                  selectedNeuron.region === 'PROTECTED'
                    ? 'bg-rose-950 text-rose-300 border border-rose-800'
                    : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                }`}
              >
                {selectedNeuron.region}
              </span>
            </div>

            {/* Dynamic LIF Parameters */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Membrane Potential</span>
                <span
                  className={`text-base font-bold ${
                    selectedNeuron.spikedThisTick ? 'text-white' : 'text-cyan-300'
                  }`}
                >
                  {selectedNeuron.membranePotential.toFixed(2)} mV
                </span>
              </div>

              <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Threshold / Reset</span>
                <span className="text-slate-300 font-semibold text-sm">
                  {selectedNeuron.thresholdPotential} / {selectedNeuron.resetPotential} mV
                </span>
              </div>

              <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Total Spikes Fired</span>
                <span className="text-amber-300 font-bold text-sm">{selectedNeuron.totalSpikes}</span>
              </div>

              <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">STDP Plasticity Mode</span>
                <span
                  className={`font-semibold text-xs ${
                    selectedNeuron.region === 'PROTECTED' ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {selectedNeuron.region === 'PROTECTED' ? 'IMMUTABLE LOCKED' : 'ACTIVE LTP/LTD'}
                </span>
              </div>
            </div>

            {/* Voltage Trace Oscilloscope */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Membrane Potential Oscilloscope (V_m)</span>
                <span className="text-cyan-400">{selectedNeuron.membranePotential.toFixed(1)} mV</span>
              </div>

              <div className="h-24 bg-slate-950 rounded-lg border border-slate-800 p-2 flex items-end gap-1 relative overflow-hidden">
                {/* Threshold line (-55mV) */}
                <div
                  className="absolute left-0 right-0 border-t border-dashed border-red-500/60 z-0"
                  style={{ bottom: `${((V_THRESH - -75) / 25) * 100}%` }}
                >
                  <span className="text-[8px] font-mono text-red-400 absolute right-1 -top-3">V_th (-55mV)</span>
                </div>

                {/* Reset line (-75mV) */}
                <div className="absolute left-0 right-0 border-t border-slate-800 z-0 bottom-1">
                  <span className="text-[8px] font-mono text-slate-600 absolute right-1 -top-3">V_reset (-75mV)</span>
                </div>

                {voltageHistoryRef.current.map((v, idx) => {
                  const heightPct = Math.max(5, Math.min(100, ((v - -75) / 25) * 100));
                  const isSpike = v >= -56;
                  return (
                    <div
                      key={idx}
                      className={`flex-1 rounded-t transition-all z-10 ${
                        isSpike
                          ? 'bg-white shadow-sm shadow-white'
                          : selectedNeuron.region === 'PROTECTED'
                          ? 'bg-rose-500/80'
                          : 'bg-cyan-500/80'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Telemetry Snapshot: Raster & Entropy */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Live Axon Raster Stream</span>
              <span className="text-cyan-400">{telemetry.activeSpikes} Cores Firing This Tick</span>
            </h3>

            {/* Spike Raster Visualizer (Recent 15 ticks) */}
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 h-28 overflow-x-auto flex gap-1 items-end font-mono text-[9px]">
              {telemetry.rasterHistory.slice(-18).map((frame, fIdx) => (
                <div key={fIdx} className="flex-1 flex flex-col items-center justify-end h-full">
                  <div className="w-full flex flex-col gap-0.5 items-center justify-end h-20">
                    {frame.spikingNeuronIds.map((id) => (
                      <div
                        key={id}
                        title={`Tick ${frame.tick}: Core #${id} fired`}
                        className={`w-full h-1 rounded-sm ${
                          id < PROTECTED_NEURON_COUNT ? 'bg-rose-400' : 'bg-cyan-400'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-slate-600 text-[8px] mt-1">{frame.tick % 100}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Entropy (Shannon)</span>
                <span className="text-emerald-400 font-bold">{telemetry.entropy} bits</span>
              </div>
              <div className="p-2 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Adaptive Mean Weight</span>
                <span className="text-indigo-300 font-bold">{telemetry.meanWeightAdaptive}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Advance to Next Stage Button */}
      <div className="flex justify-between items-center pt-2">
        <span className="text-xs font-mono text-slate-400">
          Substrate is continuously running LIF kinetics & STDP plasticity.
        </span>

        <button
          onClick={onAdvanceToTwinMind}
          className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-mono text-xs font-bold shadow-lg shadow-purple-950 active:scale-95 transition-all flex items-center gap-2"
        >
          <span>Activate Twin Mind Reasoning Arena</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
};

const V_THRESH = -55.0;
