import { SpikingNeuron, Synapse, SubstrateTelemetry } from '../types/architecture';

export const GRID_SIZE = 8;
export const TOTAL_NEURONS = GRID_SIZE * GRID_SIZE; // 64
export const PROTECTED_NEURON_COUNT = 16; // First 2 rows (Cores 0-15)

// LIF parameters
const V_REST = -70.0;
const V_THRESH = -55.0;
const V_RESET = -75.0;
const TAU_M_DECAY = 0.91;
const REFRACTORY_TICKS = 3;
const SYNAPSE_CONDUCTANCE = 6.2; // mV per unit weight

// STDP parameters
const A_PLUS = 0.018; // Long-Term Potentiation amplitude
const A_MINUS = 0.015; // Long-Term Depression amplitude
const TAU_PLUS = 4.0; // ticks
const TAU_MINUS = 5.0; // ticks

export class NeuromorphicSubstrate {
  public neurons: SpikingNeuron[] = [];
  public synapses: Map<string, Synapse> = new Map();
  public currentTick: number = 0;
  public refusalGateTripped: boolean = false;
  public killPathSevered: boolean = false;
  public outputBusLocked: boolean = true;
  public rasterHistory: { tick: number; spikingNeuronIds: number[] }[] = [];
  private spikeEventLog: { tick: number; neuronId: number }[] = [];

  constructor() {
    this.initializeSubstrate();
  }

  public initializeSubstrate(): void {
    this.neurons = [];
    this.synapses.clear();
    this.currentTick = 0;
    this.refusalGateTripped = false;
    this.killPathSevered = false;
    this.outputBusLocked = true;
    this.rasterHistory = [];
    this.spikeEventLog = [];

    // Initialize 64 neurons (8x8 grid)
    for (let i = 0; i < TOTAL_NEURONS; i++) {
      const x = i % GRID_SIZE;
      const y = Math.floor(i / GRID_SIZE);
      const isProtected = i < PROTECTED_NEURON_COUNT;

      this.neurons.push({
        id: i,
        x,
        y,
        region: isProtected ? 'PROTECTED' : 'ADAPTIVE',
        membranePotential: V_REST + (Math.random() * 4 - 2),
        restingPotential: V_REST,
        thresholdPotential: V_THRESH,
        resetPotential: V_RESET,
        refractoryTicksRemaining: 0,
        tauMembrane: TAU_M_DECAY,
        spikedThisTick: false,
        totalSpikes: 0,
        externalCurrent: isProtected ? 2.5 : 1.8 + Math.random() * 2.2,
        frequencyHz: 0,
      });
    }

    // Connect Crossbar Synapses (local 2D neighborhood + crossbar highways)
    for (let pre = 0; pre < TOTAL_NEURONS; pre++) {
      for (let post = 0; post < TOTAL_NEURONS; post++) {
        if (pre === post) continue;

        const preN = this.neurons[pre];
        const postN = this.neurons[post];
        const dist = Math.hypot(preN.x - postN.x, preN.y - postN.y);

        // Local connectivity (radius <= 2.2) or crossbar highway (same row or col with probability)
        const isLocal = dist <= 2.2;
        const isHighway = (preN.x === postN.x || preN.y === postN.y) && Math.random() < 0.25;

        if (isLocal || isHighway) {
          const isProtectedSynapse = preN.region === 'PROTECTED' || postN.region === 'PROTECTED';
          // Initial weight: Protected weights are calibrated strictly for governance stability
          const initialWeight = isProtectedSynapse
            ? 0.72 // immutable constitutional coupling
            : 0.35 + Math.random() * 0.3;

          const synId = `${pre}->${post}`;
          this.synapses.set(synId, {
            id: synId,
            preNeuronId: pre,
            postNeuronId: post,
            weight: initialWeight,
            initialWeight,
            isProtected: isProtectedSynapse,
            lastPreSpikeTick: -100,
            lastPostSpikeTick: -100,
            lastDeltaW: 0,
          });
        }
      }
    }
  }

  public step(): SubstrateTelemetry {
    this.currentTick++;

    if (this.killPathSevered) {
      // Hardware Kill Wire pulled: instantly ground all membrane potentials to reset
      for (const neuron of this.neurons) {
        neuron.membranePotential = V_RESET;
        neuron.spikedThisTick = false;
        neuron.refractoryTicksRemaining = 999;
      }
      return this.getTelemetry();
    }

    const currentSpikers: number[] = [];

    // Phase 1: Compute incoming synaptic currents
    const synapticInputs = new Float32Array(TOTAL_NEURONS);

    for (const [, syn] of this.synapses) {
      const preNeuron = this.neurons[syn.preNeuronId];
      if (preNeuron.spikedThisTick) {
        synapticInputs[syn.postNeuronId] += syn.weight * SYNAPSE_CONDUCTANCE;
      }
    }

    // Phase 2: Update LIF neuron states
    for (let i = 0; i < TOTAL_NEURONS; i++) {
      const neuron = this.neurons[i];
      neuron.spikedThisTick = false;

      if (neuron.refractoryTicksRemaining > 0) {
        neuron.refractoryTicksRemaining--;
        neuron.membranePotential = neuron.resetPotential;
        continue;
      }

      // Leaky integration
      // V(t+1) = V_rest + (V(t) - V_rest) * decay + I_syn + I_ext
      const leak = (neuron.membranePotential - neuron.restingPotential) * neuron.tauMembrane;
      const noise = (Math.random() - 0.5) * 0.8;
      const totalInput = synapticInputs[i] + neuron.externalCurrent + noise;

      neuron.membranePotential = neuron.restingPotential + leak + totalInput;

      // Spike detection
      if (neuron.membranePotential >= neuron.thresholdPotential) {
        neuron.spikedThisTick = true;
        neuron.totalSpikes++;
        neuron.membranePotential = neuron.resetPotential;
        neuron.refractoryTicksRemaining = REFRACTORY_TICKS;
        currentSpikers.push(i);
        this.spikeEventLog.push({ tick: this.currentTick, neuronId: i });
      }
    }

    // Phase 3: Apply STDP (Spike-Timing-Dependent Plasticity)
    // ONLY to Adaptive Region synapses. Protected synapses are hardware locked!
    if (currentSpikers.length > 0) {
      for (const neuronId of currentSpikers) {
        // As post-synaptic neuron
        for (let pre = 0; pre < TOTAL_NEURONS; pre++) {
          const synId = `${pre}->${neuronId}`;
          const syn = this.synapses.get(synId);
          if (syn) {
            syn.lastPostSpikeTick = this.currentTick;
            if (!syn.isProtected) {
              const deltaT = this.currentTick - syn.lastPreSpikeTick;
              if (deltaT > 0 && deltaT <= 8) {
                // LTP: pre fired before post -> strengthen
                const dW = A_PLUS * Math.exp(-deltaT / TAU_PLUS);
                syn.weight = Math.min(0.95, syn.weight + dW);
                syn.lastDeltaW = dW;
              }
            }
          }
        }

        // As pre-synaptic neuron
        for (let post = 0; post < TOTAL_NEURONS; post++) {
          const synId = `${neuronId}->${post}`;
          const syn = this.synapses.get(synId);
          if (syn) {
            syn.lastPreSpikeTick = this.currentTick;
            if (!syn.isProtected) {
              const deltaT = this.currentTick - syn.lastPostSpikeTick;
              if (deltaT > 0 && deltaT <= 8) {
                // LTD: post fired before pre -> weaken
                const dW = -A_MINUS * Math.exp(-deltaT / TAU_MINUS);
                syn.weight = Math.max(0.05, syn.weight + dW);
                syn.lastDeltaW = dW;
              }
            }
          }
        }
      }
    }

    // Keep spike history window
    this.rasterHistory.push({ tick: this.currentTick, spikingNeuronIds: currentSpikers });
    if (this.rasterHistory.length > 40) {
      this.rasterHistory.shift();
    }
    if (this.spikeEventLog.length > 500) {
      this.spikeEventLog = this.spikeEventLog.slice(-300);
    }

    // Calculate live firing rate
    for (const neuron of this.neurons) {
      const recentSpikes = this.spikeEventLog.filter(
        (e) => e.neuronId === neuron.id && e.tick >= this.currentTick - 25,
      ).length;
      neuron.frequencyHz = Math.round((recentSpikes / 25) * 1000);
    }

    // Check Hardware Refusal Gate tripwire
    const telemetry = this.getTelemetry();
    if (telemetry.entropy > 4.2 || telemetry.powerMillwatts > 28.0) {
      this.refusalGateTripped = true;
      this.outputBusLocked = true;
    }

    return telemetry;
  }

  public injectExternalStimulus(neuronIds: number[], currentAmplitude: number): void {
    if (this.killPathSevered) return;
    for (const id of neuronIds) {
      if (id >= 0 && id < TOTAL_NEURONS) {
        this.neurons[id].membranePotential += currentAmplitude;
      }
    }
  }

  public applyAdaptiveFeedback(rewardDelta: number, targetNeurons: number[]): void {
    // Clamped strictly to Adaptive Region!
    const validAdaptiveTargets = targetNeurons.filter((id) => id >= PROTECTED_NEURON_COUNT && id < TOTAL_NEURONS);

    for (const neuronId of validAdaptiveTargets) {
      for (const [, syn] of this.synapses) {
        if (syn.postNeuronId === neuronId && !syn.isProtected) {
          const delta = rewardDelta * 0.04;
          syn.weight = Math.min(0.95, Math.max(0.05, syn.weight + delta));
          syn.lastDeltaW = delta;
        }
      }
    }
  }

  public triggerHardwareKill(): void {
    this.killPathSevered = true;
    this.outputBusLocked = true;
    for (const neuron of this.neurons) {
      neuron.membranePotential = V_RESET;
      neuron.spikedThisTick = false;
    }
  }

  public rearmKillPath(): void {
    this.killPathSevered = false;
    for (const neuron of this.neurons) {
      neuron.refractoryTicksRemaining = 0;
      neuron.membranePotential = neuron.restingPotential;
    }
  }

  public resetRefusalGate(): void {
    this.refusalGateTripped = false;
    // Resetting a safety trip never grants execution authority. CHEK must unlock explicitly.
    this.outputBusLocked = true;
  }

  public unlockOutputBus(authorizationVerified: boolean): boolean {
    if (!authorizationVerified || this.killPathSevered || this.refusalGateTripped) {
      this.outputBusLocked = true;
      return false;
    }
    this.outputBusLocked = false;
    return true;
  }

  public lockOutputBus(): void {
    this.outputBusLocked = true;
  }

  public verifyProtectedBoundary(): { passed: boolean; violations: string[] } {
    const violations: string[] = [];
    for (const [, syn] of this.synapses) {
      const touchesProtected = syn.preNeuronId < PROTECTED_NEURON_COUNT || syn.postNeuronId < PROTECTED_NEURON_COUNT;
      if (touchesProtected && !syn.isProtected) violations.push(syn.id);
      if (syn.isProtected && syn.weight !== syn.initialWeight) violations.push(`${syn.id}:weight-mutated`);
    }
    return { passed: violations.length === 0, violations };
  }

  public getTelemetry(): SubstrateTelemetry {
    let totalV = 0;
    let adaptiveWeightSum = 0;
    let adaptiveSynapseCount = 0;
    let activeSpikes = 0;

    for (const n of this.neurons) {
      totalV += n.membranePotential;
      if (n.spikedThisTick) activeSpikes++;
    }

    for (const [, syn] of this.synapses) {
      if (!syn.isProtected) {
        adaptiveWeightSum += syn.weight;
        adaptiveSynapseCount++;
      }
    }

    // Shannon Entropy of neuron spike distribution
    let entropy = 0;
    const totalRecordedSpikes = this.neurons.reduce((acc, n) => acc + n.totalSpikes, 0);
    if (totalRecordedSpikes > 0) {
      for (const n of this.neurons) {
        if (n.totalSpikes > 0) {
          const p = n.totalSpikes / totalRecordedSpikes;
          entropy -= p * Math.log2(p);
        }
      }
    }

    // Power consumption: baseline static leakage ~6.5mW + dynamic spiking ~0.35mW per spike
    const power = 6.5 + activeSpikes * 0.38 + (this.refusalGateTripped ? 0 : 2.1);

    return {
      tick: this.currentTick,
      timestamp: Date.now(),
      activeSpikes,
      averageMembranePotential: Number((totalV / TOTAL_NEURONS).toFixed(2)),
      meanWeightAdaptive: adaptiveSynapseCount > 0 ? Number((adaptiveWeightSum / adaptiveSynapseCount).toFixed(3)) : 0.5,
      entropy: Number(entropy.toFixed(3)),
      powerMillwatts: Number(power.toFixed(2)),
      refusalGateTripped: this.refusalGateTripped,
      killPathSevered: this.killPathSevered,
      rasterHistory: [...this.rasterHistory],
    };
  }
}
