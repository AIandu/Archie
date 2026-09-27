import React, { useState } from 'react';
import { Cpu, Terminal, FileCode, Layers, Shield, Zap, CheckCircle2, Copy, Check } from 'lucide-react';

export const HardwareSpecComponent: React.FC = () => {
  const [copied, setCopied] = useState<boolean>(false);
  const [specTab, setSpecTab] = useState<'verilog' | 'pinout' | 'architecture'>('architecture');

  const verilogCode = `//=============================================================================
// Module: Virtual / Fabricated Neuromorphic Chip (Substrate Core)
// Architecture: 8x8 LIF Spiking Mesh with STDP and Womb Hardware Authority
// Specification: Target TSMC 28nm HPC+ / Xilinx UltraScale+ FPGA
//=============================================================================
\`timescale 1ns / 1ps

module NeuromorphicSubstrate_8x8 (
  input  wire        clk_core,             // Neuromorphic core clock (50MHz)
  input  wire        rst_n,                // Asynchronous active-low reset
  input  wire        kill_wire_carrier_1v8,// Emergency physical pull-down wire
  input  wire [63:0] axon_stimulus_bus,    // External afferent input spikes
  output wire [63:0] efferent_spike_bus,   // Efferent output spike bus
  output wire        refusal_tripwire_n,   // Hardware refusal flag (active low)
  output wire [15:0] power_telemetry_mw    // Real-time thermal dissipation telemetry
);

  //---------------------------------------------------------------------------
  // 1. HARDWARE AUTHORITY & EMERGENCY KILL CIRCUITRY
  // "Hardware Authority Supersedes All Logic" (Womb Rule W-01 & W-05)
  //---------------------------------------------------------------------------
  wire emergency_shunt;
  assign emergency_shunt = (kill_wire_carrier_1v8 == 1'b0); // Pull-down triggered

  // Refusal tripwire monitoring: Shunts output within 0.18ns if tripped
  reg refusal_state;
  assign refusal_tripwire_n = ~refusal_state;

  //---------------------------------------------------------------------------
  // 2. CONSTITUTIONAL PROTECTED REGION (CORES 0 TO 15)
  // Physical metal layer M4-M5 read-only lines. STDP write lines tied to 0V.
  //---------------------------------------------------------------------------
  wire [15:0] stdp_write_enable_protected;
  assign stdp_write_enable_protected = 16'h0000; // Physically impossible to rewrite

  //---------------------------------------------------------------------------
  // 3. ADAPTIVE REGION (CORES 16 TO 63)
  // Memristive RRAM crossbar with STDP (Spike-Timing-Dependent Plasticity)
  //---------------------------------------------------------------------------
  wire [47:0] stdp_write_enable_adaptive;
  wire        thermal_governor_clamp;

  assign stdp_write_enable_adaptive = (thermal_governor_clamp) ? 48'h0 : 48'hFFFFFFFFFFFF;

  //---------------------------------------------------------------------------
  // 4. SPIKING NEURON LEAKY INTEGRATE-AND-FIRE (LIF) CORES
  //---------------------------------------------------------------------------
  genvar i;
  generate
    for (i = 0; i < 64; i = i + 1) begin: NEURON_CORES
      LIF_Neuron_Core #(
        .IS_PROTECTED   (i < 16 ? 1 : 0),
        .V_REST_MV      (-70),
        .V_THRESH_MV    (-55),
        .V_RESET_MV     (-75),
        .TAU_DECAY      (16'd59637) // Fixed-point 0.91 decay
      ) neuron_inst (
        .clk            (clk_core),
        .rst_n          (rst_n & ~emergency_shunt),
        .synaptic_in    (axon_stimulus_bus[i]),
        .spike_out      (efferent_spike_bus[i])
      );
    end
  endgenerate

endmodule`;

  const handleCopy = () => {
    navigator.clipboard.writeText(verilogCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-xl border border-indigo-500/40 bg-gradient-to-r from-indigo-950/60 via-slate-900/80 to-slate-950 p-6 shadow-xl">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <FileCode className="w-48 h-48 text-indigo-400" />
        </div>

        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-900/80 text-indigo-300 border border-indigo-700">
              HARDWARE SUBSTRATE BRIDGE
            </span>
            <span className="text-xs font-mono text-slate-400">Target Hardware Specification (Not Yet Synthesized/Fabricated)</span>
          </div>

          <h2 className="text-2xl font-black tracking-tight text-white">
            Virtual Chip → FPGA Prototype → Fabricated Silicon
          </h2>

          <p className="text-sm text-slate-300 leading-relaxed">
            The rest of the architecture (Womb, Twin Mind, Sargent Patty, and CHEK) does not care whether the substrate
            is virtual or fabricated in silicon. It talks to the exact same packet interface, uses the same logical substrate contract. The FPGA and ASIC sections below are target specifications, not evidence of synthesis, timing closure, packaging, or fabricated silicon.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setSpecTab('architecture')}
          className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
            specTab === 'architecture'
              ? 'bg-indigo-900/60 text-indigo-200 border border-indigo-600'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          Silicon Architecture Block Diagram
        </button>
        <button
          onClick={() => setSpecTab('verilog')}
          className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
            specTab === 'verilog'
              ? 'bg-indigo-900/60 text-indigo-200 border border-indigo-600'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          Draft RTL Skeleton (Not Yet Synthesis-Verified)
        </button>
        <button
          onClick={() => setSpecTab('pinout')}
          className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
            specTab === 'pinout'
              ? 'bg-indigo-900/60 text-indigo-200 border border-indigo-600'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          Proposed Package / Signal Map
        </button>
      </div>

      {/* Tab: Architecture */}
      {specTab === 'architecture' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            <div className="p-4 rounded-xl bg-slate-950 border border-rose-900/60 space-y-2">
              <div className="flex items-center gap-2 text-rose-400 font-bold">
                <Shield className="w-4 h-4" />
                <span>Protected Sector (Cores 0-15)</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Target ASIC design: non-reconfigurable protected routing would enforce the same no-plasticity invariant that the current software reference model enforces on cores 0-15.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-cyan-900/60 space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 font-bold">
                <Cpu className="w-4 h-4" />
                <span>Adaptive Sector (Cores 16-63)</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Target hardware option: an adaptive crossbar implementing local STDP while preserving the protected-boundary invariant. RRAM is a proposed implementation technology, not a fabricated component in this build.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-amber-900/60 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <Zap className="w-4 h-4" />
                <span>Hard Refusal & Kill Circuit</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Target safety-circuit concept: an independent refusal/kill path below adaptive logic. Response time, voltage, and discharge behavior require electrical design, simulation, and bench validation.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-3">
            <h4 className="text-white font-bold uppercase text-[11px] tracking-wider">
              Substrate Progression Roadmap
            </h4>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center">
              <div className="flex-1 p-3 rounded bg-slate-900 border border-cyan-800/80">
                <span className="text-cyan-400 font-bold block">1. Virtual Chip</span>
                <span className="text-slate-400 text-[11px]">Real Software Engine (Active Now)</span>
              </div>
              <span className="text-slate-600 font-bold">→</span>
              <div className="flex-1 p-3 rounded bg-slate-900 border border-indigo-800/80">
                <span className="text-indigo-400 font-bold block">2. FPGA Prototype</span>
                <span className="text-slate-400 text-[11px]">RTL completion + simulation + synthesis + FPGA timing closure</span>
              </div>
              <span className="text-slate-600 font-bold">→</span>
              <div className="flex-1 p-3 rounded bg-slate-900 border border-purple-800/80">
                <span className="text-purple-400 font-bold block">3. Fabricated ASIC</span>
                <span className="text-slate-400 text-[11px]">Foundry process selection + physical design + tape-out + validation</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Verilog */}
      {specTab === 'verilog' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              Draft Verilog Architecture Skeleton
            </span>
            <button
              onClick={handleCopy}
              className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono flex items-center gap-1.5 transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Code'}</span>
            </button>
          </div>

          <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto max-h-[460px] leading-relaxed">
            {verilogCode}
          </pre>
        </div>
      )}

      {/* Tab: Pinout */}
      {specTab === 'pinout' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4 font-mono text-xs">
          <h3 className="text-sm font-bold text-white">Proposed Package Pinout & Logical Signals</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
              <span className="text-amber-400 font-bold block">Authority & Governance Signals</span>
              <ul className="space-y-1 text-slate-300 text-[11px]">
                <li>• <code>PIN_A01</code>: <code>KILL_WIRE_1V8</code> (Continuous pull-down monitoring line)</li>
                <li>• <code>PIN_A02</code>: <code>REFUSAL_TRIP_N</code> (Hardware refusal shunt output)</li>
                <li>• <code>PIN_B01</code>: <code>WOMB_LOCK_OUT</code> (Genesis lattice cryptographic hash valid)</li>
                <li>• <code>PIN_B02</code>: <code>CHEK_AUTH_TOKEN_IN</code> (High-speed SPI independent signature)</li>
              </ul>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
              <span className="text-cyan-400 font-bold block">Neuromorphic Spike & Telemetry Signals</span>
              <ul className="space-y-1 text-slate-300 text-[11px]">
                <li>• <code>PIN_C01-C64</code>: <code>AXON_IN[63:0]</code> (Afferent sensory spike lines)</li>
                <li>• <code>PIN_D01-D64</code>: <code>SPIKE_OUT[63:0]</code> (Efferent crossbar spikes)</li>
                <li>• <code>PIN_E01</code>: <code>ENTROPY_METRIC_BUS</code> (Hardware Lyapunov divergence meter)</li>
                <li>• <code>PIN_E02</code>: <code>THERMAL_PWR_SENSE</code> (Die current telemetry output)</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
