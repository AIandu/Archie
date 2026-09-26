/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Header } from './components/Header';
import { PipelineStepper, StageId } from './components/PipelineStepper';
import { WombStageComponent } from './components/WombStageComponent';
import { NeuromorphicSubstrateComponent } from './components/NeuromorphicSubstrateComponent';
import { TwinMindArenaComponent } from './components/TwinMindArenaComponent';
import { ChekTerminalComponent } from './components/ChekTerminalComponent';
import { ExecutionFeedbackComponent } from './components/ExecutionFeedbackComponent';
import { HardwareSpecComponent } from './components/HardwareSpecComponent';

import {
  WombConstitution,
  SubstrateTelemetry,
  OuterMind,
  PattyExchange,
  ConvergedProposal,
  ChekVaultRecord,
  ExecutionResult,
  ScenarioPreset,
} from './types/architecture';

import { createInitialWombConstitution } from './engine/wombStage';
import { NeuromorphicSubstrate } from './engine/neuromorphicSubstrate';
import { ChekVerificationEngine } from './engine/chekEngine';
import { SCENARIO_PRESETS } from './engine/scenarioPresets';

export default function App() {
  // Core Engines
  const substrate = useMemo(() => new NeuromorphicSubstrate(), []);
  const chekEngine = useMemo(() => new ChekVerificationEngine(), []);

  // Application State
  const [constitution, setConstitution] = useState<WombConstitution>(createInitialWombConstitution());
  const [telemetry, setTelemetry] = useState<SubstrateTelemetry>(substrate.getTelemetry());
  const [activeStage, setActiveStage] = useState<StageId>('womb');
  const [cycleActiveStep, setCycleActiveStep] = useState<number | undefined>(undefined);
  const [isRunningAutonomousCycle, setIsRunningAutonomousCycle] = useState<boolean>(false);

  // Substrate Clock Controls
  const [isAutoRunning, setIsAutoRunning] = useState<boolean>(true);
  const [tickRateHz, setTickRateHz] = useState<number>(15);

  // Twin Mind & Patty State
  const [currentScenario, setCurrentScenario] = useState<ScenarioPreset>(SCENARIO_PRESETS[0]);
  const [minds, setMinds] = useState<OuterMind[]>(SCENARIO_PRESETS[0].defaultMindsData);
  const [pattyDialogue, setPattyDialogue] = useState<PattyExchange[]>([
    {
      round: 1,
      speaker: 'Sargent Patty',
      target: 'Mind Claude',
      instruction: "Claude, explain why Charlie's formal Lyapunov invariant fails during asynchronous bus spikes.",
      response:
        "Charlie assumed instantaneous clock propagation across all crossbar junctions. In physical silicon, propagation delay introduces a 1.2ms skew where an attacker or sensor lag can violate the bounding polytope.",
    },
    {
      round: 2,
      speaker: 'Sargent Patty',
      target: 'Mind Charlie',
      instruction: "Charlie, reconstruct Claude's reasoning without softening your formal rigor.",
      response:
        "Understood. Claude is correct that discrete clock synchronization is an unstated axiom in my proof. If we incorporate a non-zero propagation delay tau_skew in [0, 1.4ms], the Lyapunov derivative V_dot remains negative if and only if we introduce a dynamic hysteresis cushion delta_h >= sup |dTelemetry/dt| * tau_skew.",
    },
    {
      round: 3,
      speaker: 'Sargent Patty',
      target: 'Mind Gemini',
      instruction: 'Gemini, attack the disputed assumption between Charlie and Claude.',
      response:
        'The disputed assumption is whether hysteresis adds intolerable latency. By phase-locking the neuromorphic LIF neurons to a 200Hz carrier wave, the hysteresis delay collapses from 1.4ms to 0.35ms, preserving both formal stability and biological-speed reaction.',
    },
    {
      round: 4,
      speaker: 'Sargent Patty',
      target: 'Mind Athena',
      instruction: 'Athena, stress-test this phase-locked hybrid against worst-case adversary injection.',
      response:
        'I attempted high-entropy burst flooding at 300% rated capacity. With the 0.35ms phase-lock and Charlie’s updated bounds, the hardware Refusal Gate quenches the noise at cycle 12 without destabilizing the adaptive mesh. The adversary gets no traction.',
    },
    {
      round: 5,
      speaker: 'Sargent Patty',
      target: 'Mind Daedalus',
      instruction: 'Daedalus, build the final executable proposal. Every mind will sign.',
      response:
        'Synthesized into executable state transition packet #ST-8842. Consumes 14.6mJ, strictly confines plasticity updates to the Adaptive Region, and complies with Womb Rule W-01.',
    },
  ]);

  const [convergedProposal, setConvergedProposal] = useState<ConvergedProposal | null>({
    id: 'PROP-GRID-PHASE-LOCK',
    title: 'Phase-Locked Dynamic Hysteresis State Transition',
    coreDecision:
      'Commit synchronized neuromorphic core transition with 0.35ms phase-locked carrier wave, binding actuator dispatch to verified Lyapunov stability bounds.',
    computationalProof:
      'Proof: For all tau in [0, 1.4ms], V_dot(x) <= -alpha*||x||^2 + delta_h < 0 when phase-lock carrier omega >= 200Hz. Hard refusal tripwire remains quiescent at 0.12V threshold.',
    defensibilityPact:
      'Unanimously defended: Charlie (mathematical stability), Claude (boundary resilience), Gemini (kinetic realism), Athena (adversarial robustness), Daedalus (hardware feasibility).',
    disputedAssumptionResolved:
      'Whether clock synchronization delay across crossbar junctions causes invariant violation.',
    targetSubstrateAction: {
      target: 'ADAPTIVE_MESH_SECTOR_3',
      actionType: 'STATE_TRANSITION',
      parameters: {
        sector: 'ADAPTIVE_3',
        frequencyHz: 200,
        hysteresisCushionMs: 0.35,
        lyapunovBoundAlpha: 0.88,
        targetFeederState: 'STABILIZED_CURRENT_DAMPED',
      },
      riskScore: 0.14,
      energyEstimateMilliJoules: 14.6,
    },
    producerSignatures: [
      { mindId: 'Charlie', signatureHash: '0x38bdf8a1' },
      { mindId: 'Claude', signatureHash: '0xa78bfa92' },
      { mindId: 'Gemini', signatureHash: '0x34d399c4' },
      { mindId: 'Athena', signatureHash: '0xf87171d7' },
      { mindId: 'Daedalus', signatureHash: '0xfbbf24e9' },
    ],
    missingEvidenceCatalog: [],
    status: 'CONVERGED_DEFENSIBLE',
  });

  // CHEK State
  const [latestVaultRecord, setLatestVaultRecord] = useState<ChekVaultRecord | null>(null);

  // Execution State
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [isDeliberating, setIsDeliberating] = useState<boolean>(false);

  // Substrate Clock Ticking Loop
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isAutoRunning) {
      const intervalMs = Math.max(16, Math.round(1000 / tickRateHz));
      timerRef.current = setInterval(() => {
        const nextTelemetry = substrate.step();
        setTelemetry(nextTelemetry);
      }, intervalMs);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isAutoRunning, tickRateHz, substrate]);

  // Handle Scenario Change
  const handleSelectScenario = (scenario: ScenarioPreset) => {
    setCurrentScenario(scenario);
    setMinds(scenario.defaultMindsData);
    setConvergedProposal(null);
    setLatestVaultRecord(null);
    setExecutionResult(null);
  };

  // Step 1 Tick manually
  const handleStepSubstrate = () => {
    const nextTelemetry = substrate.step();
    setTelemetry(nextTelemetry);
  };

  // Hardware controls
  const handleTripRefusalGate = () => {
    substrate.refusalGateTripped = true;
    substrate.outputBusLocked = true;
    setTelemetry(substrate.getTelemetry());
  };

  const handleResetRefusalGate = () => {
    substrate.resetRefusalGate();
    setTelemetry(substrate.getTelemetry());
  };

  const handleTriggerKillWire = () => {
    substrate.triggerHardwareKill();
    setTelemetry(substrate.getTelemetry());
  };

  const handleRearmKillWire = () => {
    substrate.rearmKillPath();
    setTelemetry(substrate.getTelemetry());
  };

  // Run Deliberation via backend API or fallback
  const handleRunDeliberation = async (problemOverride?: string) => {
    setIsDeliberating(true);
    const problem = problemOverride || currentScenario.problemStatement;

    try {
      const res = await fetch('/api/twin-mind/deliberate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problem }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.minds && Array.isArray(data.minds)) {
          // Merge with avatars and colors
          const merged = data.minds.map((m: any, idx: number) => {
            const preset = currentScenario.defaultMindsData[idx] || currentScenario.defaultMindsData[0];
            return {
              ...preset,
              ...m,
              avatar: preset.avatar,
              color: preset.color,
            };
          });
          setMinds(merged);
        }
      }
    } catch (err) {
      console.warn('Deliberation API offline, preserving local minds:', err);
    } finally {
      setIsDeliberating(false);
    }
  };

  // Run Sargent Patty Convergence via backend API or fallback
  const handleRunPattyConvergence = async () => {
    setIsDeliberating(true);
    try {
      const res = await fetch('/api/twin-mind/patty-converge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problem: currentScenario.problemStatement,
          mindsData: minds,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.dialogue) setPattyDialogue(data.dialogue);
        if (data.convergedProposal) {
          setConvergedProposal({
            ...data.convergedProposal,
            id: `PROP-${Date.now().toString(36).toUpperCase()}`,
            producerSignatures: minds.map((m) => ({
              mindId: m.name,
              signatureHash: `0x${Math.abs(m.name.length * 7919).toString(16)}`,
            })),
            disputedAssumptionResolved: data.disputedAssumption || 'Clock synchronization and rate limit bounding',
            missingEvidenceCatalog: data.missingEvidenceCatalog || [],
            status: data.status || 'CONVERGED_DEFENSIBLE',
          });
        }
      }
    } catch (err) {
      console.warn('Patty convergence API offline, maintaining defensible fallback:', err);
    } finally {
      setIsDeliberating(false);
    }
  };

  // Transmit to CHEK Independent Authority
  const handleTransmitToChek = (prop: ConvergedProposal) => {
    setConvergedProposal(prop);
    setActiveStage('chek');
  };

  // Dispatch Controlled Execution & STDP Feedback
  const handleDispatchExecution = (recordOverride?: ChekVaultRecord | null) => {
    const record = recordOverride || latestVaultRecord;
    if (!record || record.outcome !== 'AUTHORIZED') return;
    setIsExecuting(true);

    setTimeout(() => {
      // Apply STDP feedback reinforcement strictly to Adaptive Cores
      const targetAdaptiveCores = [18, 19, 20, 21, 26, 27, 28, 29, 34, 35, 42, 43];
      substrate.applyAdaptiveFeedback(0.08, targetAdaptiveCores);

      const result: ExecutionResult = {
        executionId: `EXEC-DISPATCH-${Date.now().toString(36).toUpperCase()}`,
        vaultRecordHash: record.recordHash,
        status: 'SUCCESS',
        dispatchedAt: new Date().toISOString(),
        actuatorTarget: convergedProposal?.targetSubstrateAction.target || 'ADAPTIVE_MESH_SECTOR_3',
        observedMetrics: {
          stabilityDelta: 94.2,
          latencyMs: 1.4,
          joulesConsumed: convergedProposal?.targetSubstrateAction.energyEstimateMilliJoules || 14.6,
          entropyDrop: 0.42,
        },
        feedbackSignal: {
          targetRegion: 'ADAPTIVE',
          stdpReinforcement: 0.08,
          protectedRegionUntouched: true,
          neuronsReinforced: targetAdaptiveCores,
        },
      };

      setExecutionResult(result);
      setTelemetry(substrate.getTelemetry());
      setIsExecuting(false);
    }, 1200);
  };

  // Full Autonomous Cycle demonstration runner
  const handleRunAutonomousCycle = async () => {
    if (isRunningAutonomousCycle) return;
    setIsRunningAutonomousCycle(true);

    // Step 1: Womb Stage
    setActiveStage('womb');
    setCycleActiveStep(1);
    await new Promise((r) => setTimeout(r, 1200));

    // Step 2: Neuromorphic Substrate
    setActiveStage('substrate');
    setCycleActiveStep(2);
    // Inject stimulus to show live spiking
    substrate.injectExternalStimulus([18, 26, 34], 14.0);
    setTelemetry(substrate.getTelemetry());
    await new Promise((r) => setTimeout(r, 1400));

    // Step 3: Twin Mind Reasoning
    setActiveStage('twinmind');
    setCycleActiveStep(3);
    await handleRunDeliberation();
    await new Promise((r) => setTimeout(r, 1500));

    // Step 4: Sargent Patty Convergence
    setActiveStage('patty');
    setCycleActiveStep(4);
    await handleRunPattyConvergence();
    await new Promise((r) => setTimeout(r, 1800));

    // Step 5: CHEK Independent Verification
    setActiveStage('chek');
    setCycleActiveStep(5);
    let recordForExecution: ChekVaultRecord | null = null;
    if (convergedProposal) {
      const evaluation = await chekEngine.evaluateProposal(convergedProposal);
      recordForExecution = evaluation.vaultRecord;
      setLatestVaultRecord(recordForExecution);
    }
    await new Promise((r) => setTimeout(r, 1800));

    // Step 6: Controlled Execution & Feedback
    setActiveStage('execution');
    setCycleActiveStep(6);
    await new Promise((r) => setTimeout(r, 800));
    if (recordForExecution) {
      handleDispatchExecution(recordForExecution);
    }
    await new Promise((r) => setTimeout(r, 1600));

    // Finish cycle
    setCycleActiveStep(undefined);
    setIsRunningAutonomousCycle(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Telemetry Header */}
      <Header
        telemetry={telemetry}
        activeStage={activeStage}
        onSelectStage={setActiveStage}
        onRunAutonomousCycle={handleRunAutonomousCycle}
        isRunningCycle={isRunningAutonomousCycle}
        onEmergencyKill={handleTriggerKillWire}
        onRearmKill={handleRearmKillWire}
      />

      {/* Core Architectural Lifecycle Pipeline Stepper */}
      <PipelineStepper
        activeStage={activeStage}
        onSelectStage={setActiveStage}
        cycleActiveStep={cycleActiveStep}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {activeStage === 'womb' && (
          <WombStageComponent
            constitution={constitution}
            telemetry={telemetry}
            onTripRefusalGate={handleTripRefusalGate}
            onResetRefusalGate={handleResetRefusalGate}
            onTriggerKillWire={handleTriggerKillWire}
            onRearmKillWire={handleRearmKillWire}
            onAdvanceToSubstrate={() => setActiveStage('substrate')}
          />
        )}

        {activeStage === 'substrate' && (
          <NeuromorphicSubstrateComponent
            substrate={substrate}
            telemetry={telemetry}
            onStep={handleStepSubstrate}
            isAutoRunning={isAutoRunning}
            onToggleAutoRun={() => setIsAutoRunning(!isAutoRunning)}
            tickRateHz={tickRateHz}
            onChangeTickRate={setTickRateHz}
            onAdvanceToTwinMind={() => setActiveStage('twinmind')}
          />
        )}

        {(activeStage === 'twinmind' || activeStage === 'patty') && (
          <TwinMindArenaComponent
            currentScenario={currentScenario}
            onSelectScenario={handleSelectScenario}
            minds={minds}
            pattyDialogue={pattyDialogue}
            convergedProposal={convergedProposal}
            isDeliberating={isDeliberating}
            onRunDeliberation={handleRunDeliberation}
            onRunPattyConvergence={handleRunPattyConvergence}
            onTransmitToChek={handleTransmitToChek}
          />
        )}

        {activeStage === 'chek' && (
          <ChekTerminalComponent
            chekEngine={chekEngine}
            currentProposal={convergedProposal}
            onAdvanceToExecution={(record) => {
              setLatestVaultRecord(record);
              setActiveStage('execution');
            }}
          />
        )}

        {activeStage === 'execution' && (
          <ExecutionFeedbackComponent
            proposal={convergedProposal}
            vaultRecord={latestVaultRecord}
            substrate={substrate}
            onDispatchExecution={handleDispatchExecution}
            executionResult={executionResult}
            isExecuting={isExecuting}
            onReturnToSubstrate={() => setActiveStage('substrate')}
          />
        )}

        {activeStage === 'silicon-spec' && <HardwareSpecComponent />}
      </main>

      {/* Architectural Philosophy Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 px-4 text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>
              <strong>The Superpower:</strong> Womb defines → Chip constrains → Twin Mind reasons → Patty converges → CHEK authorizes → Chip executes → System learns.
            </span>
          </div>
          <div className="text-slate-400">
            Hardware Authority Supersedes All Logic • Producer Cannot Approve Its Own Work
          </div>
        </div>
      </footer>
    </div>
  );
}
