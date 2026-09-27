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
  TwinMindCase,
  PublicMindId,
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
  const [twinMindCase, setTwinMindCase] = useState<TwinMindCase | null>(null);
  const [pattyDialogue, setPattyDialogue] = useState<PattyExchange[]>([]);
  const [convergedProposal, setConvergedProposal] = useState<ConvergedProposal | null>(null);

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

  // Open a persistent case. Public AI responses are captured as evidence, not simulated here.
  const handleRunDeliberation = async (problemOverride?: string) => {
    setIsDeliberating(true);
    const problem = problemOverride || currentScenario.problemStatement;
    try {
      const res = await fetch('/api/twin-mind/cases', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ problem }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setTwinMindCase(data.case);
      setPattyDialogue([]);
      setConvergedProposal(null);
    } catch (err) {
      console.warn('Unable to open persistent Twin Mind case:', err);
    } finally { setIsDeliberating(false); }
  };

  const handleCapturePublicMind = async (id: PublicMindId, response: string) => {
    let activeCase = twinMindCase;
    if (!activeCase) {
      const created = await fetch('/api/twin-mind/cases', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problem: currentScenario.problemStatement }),
      });
      if (!created.ok) throw new Error(await created.text());
      activeCase = (await created.json()).case;
      setTwinMindCase(activeCase);
    }
    const res = await fetch(`/api/twin-mind/cases/${activeCase!.id}/submissions`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, response, sourceMode: 'PUBLIC_FRESH_SESSION' }),
    });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    setTwinMindCase(data.case);
    return data.admission;
  };

  const handleRunPattyConvergence = async () => {
    if (!twinMindCase || twinMindCase.submissions.length < 2) return;
    setIsDeliberating(true);
    try {
      const res = await fetch('/api/twin-mind/patty-converge', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problem: twinMindCase.problem, caseId: twinMindCase.id }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      if (data.dialogue) setPattyDialogue(data.dialogue.map((x: any, i: number) => ({ ...x, round: i + 1 })));
      if (data.convergedProposal) {
        setConvergedProposal({
          ...data.convergedProposal,
          id: `PROP-${Date.now().toString(36).toUpperCase()}`,
          producerSignatures: twinMindCase.submissions.map((m) => ({ mindId: m.name, signatureHash: `attest:${m.id}:${m.capturedAt}` })),
          disputedAssumptionResolved: data.disputedAssumption || '',
          missingEvidenceCatalog: data.missingEvidenceCatalog || [],
          status: data.status || 'EVIDENCE_DEFICIT',
          targetSubstrateAction: { energyEstimateMilliJoules: 0, ...data.convergedProposal.targetSubstrateAction },
        });
      }
    } catch (err) {
      console.warn('Patty convergence unavailable:', err);
    } finally { setIsDeliberating(false); }
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
            twinMindCase={twinMindCase}
            onCapturePublicMind={handleCapturePublicMind}
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
