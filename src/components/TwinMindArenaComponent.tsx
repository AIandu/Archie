import React, { useState } from 'react';
import {
  Users,
  ShieldCheck,
  AlertTriangle,
  Award,
  Sparkles,
  ArrowRight,
  Send,
  MessageSquare,
  FileCheck2,
  CheckCircle2,
  CornerDownRight,
  RefreshCw,
} from 'lucide-react';
import { OuterMind, PattyExchange, ConvergedProposal, ScenarioPreset } from '../types/architecture';
import { SCENARIO_PRESETS } from '../engine/scenarioPresets';

interface TwinMindArenaComponentProps {
  currentScenario: ScenarioPreset;
  onSelectScenario: (scenario: ScenarioPreset) => void;
  minds: OuterMind[];
  pattyDialogue: PattyExchange[];
  convergedProposal: ConvergedProposal | null;
  isDeliberating: boolean;
  onRunDeliberation: (problemText?: string) => void;
  onRunPattyConvergence: (caseId?: string) => void;
  onTransmitToChek: (proposal: ConvergedProposal) => void;
}

export const TwinMindArenaComponent: React.FC<TwinMindArenaComponentProps> = ({
  currentScenario,
  onSelectScenario,
  minds,
  pattyDialogue,
  convergedProposal,
  isDeliberating,
  onRunDeliberation,
  onRunPattyConvergence,
  onTransmitToChek,
}) => {
  const [selectedMindId, setSelectedMindId] = useState<string>('charlie');
  const [customProblem, setCustomProblem] = useState<string>(currentScenario.problemStatement);
  const [isEditingProblem, setIsEditingProblem] = useState<boolean>(false);
  const [caseId, setCaseId] = useState<string | null>(null);
  const [publicMindId, setPublicMindId] = useState<string>('chatgpt');
  const [publicResponse, setPublicResponse] = useState<string>('');
  const [capturedMinds, setCapturedMinds] = useState<Record<string, { passed: boolean; diagnostic: string }>>({});
  const [captureBusy, setCaptureBusy] = useState<boolean>(false);

  const publicMindNames: Record<string, string> = {
    chatgpt: 'ChatGPT', claude: 'Claude', gemini: 'Gemini', grok: 'Grok', perplexity: 'Perplexity',
  };

  const ensureCase = async () => {
    if (caseId) return caseId;
    const res = await fetch('/api/twin-mind/cases', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ problem: customProblem }),
    });
    if (!res.ok) throw new Error('Unable to open persistent Patty case.');
    const data = await res.json();
    setCaseId(data.case.id);
    return data.case.id as string;
  };

  const capturePublicMind = async () => {
    if (publicResponse.trim().length < 20) return;
    setCaptureBusy(true);
    try {
      const activeCaseId = await ensureCase();
      const res = await fetch(`/api/twin-mind/cases/${activeCaseId}/submissions`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: publicMindId,
          response: publicResponse,
          sourceMode: 'PUBLIC_FRESH_SESSION',
        }),
      });
      if (!res.ok) throw new Error('Public mind response was not admitted.');
      const data = await res.json();
      setCapturedMinds((prev) => ({
        ...prev,
        [publicMindId]: { passed: data.admission.passed, diagnostic: data.admission.diagnostic },
      }));
      setPublicResponse('');
    } finally {
      setCaptureBusy(false);
    }
  };

  const selectedMind = minds.find((m) => m.id === selectedMindId) || minds[0];

  const handleScenarioChange = (presetId: string) => {
    const found = SCENARIO_PRESETS.find((p) => p.id === presetId);
    if (found) {
      onSelectScenario(found);
      setCustomProblem(found.problemStatement);
    }
  };

  const handleApplyCustomProblem = () => {
    setIsEditingProblem(false);
    onRunDeliberation(customProblem);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-xl border border-purple-500/40 bg-gradient-to-r from-purple-950/60 via-slate-900/80 to-slate-950 p-6 shadow-xl">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Users className="w-48 h-48 text-purple-400" />
        </div>

        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-purple-900/80 text-purple-300 border border-purple-700">
              STAGE 3 & 4: THE INTELLIGENCE
            </span>
            <span className="text-xs font-mono text-slate-400">
              Twin Mind Outer Edge • Deterministic Admission Checks • Sargent Patty
            </span>
          </div>

          <h2 className="text-2xl font-black tracking-tight text-white">
            "Diversity Outside → Verification Inward → Convergence at the Center."
          </h2>

          <p className="text-sm text-slate-300 leading-relaxed">
            Multiple differentiated reasoning roles attack the same problem simultaneously, retaining their different reasoning
            styles rather than being reduced to assigned little jobs. Each mind's checker kicks back garbage before it
            reaches the center. Sargent Patty forces computational cross-examination — she doesn't count votes.
          </p>

          {/* Scenario Selector */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <span className="text-xs font-mono text-slate-400">Scenario Challenge:</span>
            <select
              value={currentScenario.id}
              onChange={(e) => handleScenarioChange(e.target.value)}
              className="bg-slate-950 border border-purple-700/60 rounded-lg px-3 py-1.5 text-xs font-mono text-purple-300 font-semibold focus:outline-none focus:ring-1 focus:ring-purple-400"
            >
              {SCENARIO_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>

            <button
              onClick={() => setIsEditingProblem(!isEditingProblem)}
              className="px-2.5 py-1 text-xs font-mono rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            >
              {isEditingProblem ? 'Cancel Edit' : 'Edit Prompt'}
            </button>
          </div>
        </div>
      </div>

      {/* Problem Statement Box */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            OPERATIONAL PROBLEM DISPATCH
          </span>
          <span className="text-purple-400 font-semibold">{currentScenario.domain}</span>
        </div>

        {isEditingProblem ? (
          <div className="space-y-2">
            <textarea
              value={customProblem}
              onChange={(e) => setCustomProblem(e.target.value)}
              rows={3}
              className="w-full bg-slate-950 border border-purple-500 rounded-lg p-2.5 text-xs font-mono text-slate-200 focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={handleApplyCustomProblem}
                className="px-3 py-1.5 rounded bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-bold"
              >
                Submit & Deliberate
              </button>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-200 font-mono leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800">
            {customProblem}
          </p>
        )}
      </div>

      {/* Live Public Mind Intake */}
      <div className="bg-slate-900/80 border border-cyan-800/60 rounded-xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-white">Live Public Mind Intake</h3>
            <p className="text-xs text-slate-400 mt-1">
              Open a fresh public AI session, ask the same case, then paste its answer here. Archie preserves the case. The guest mind does not need memory.
            </p>
          </div>
          <span className="text-[10px] font-mono text-cyan-300 border border-cyan-800 rounded px-2 py-1">
            {caseId ? `PATTY CASE: ${caseId}` : 'PATTY CASE: NOT OPENED'}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {Object.entries(publicMindNames).map(([id, name]) => (
            <button
              key={id}
              onClick={() => setPublicMindId(id)}
              className={`p-2 rounded border text-xs font-mono text-left ${
                publicMindId === id ? 'border-cyan-500 bg-cyan-950/40 text-cyan-200' : 'border-slate-800 bg-slate-950 text-slate-400'
              }`}
            >
              <div className="font-bold">{name}</div>
              <div className="text-[9px] mt-1">
                {capturedMinds[id] ? (capturedMinds[id].passed ? 'ADMITTED' : 'KICKED BACK') : 'WAITING'}
              </div>
            </button>
          ))}
        </div>

        <textarea
          value={publicResponse}
          onChange={(e) => setPublicResponse(e.target.value)}
          rows={5}
          placeholder={`Paste the fresh ${publicMindNames[publicMindId]} response here...`}
          className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
        />

        <div className="flex flex-col md:flex-row gap-2 justify-between">
          <div className="text-[10px] font-mono text-slate-500">
            {capturedMinds[publicMindId]?.diagnostic || 'Deterministic admission checker runs after capture. Passing means admissible, not true.'}
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={capturePublicMind}
              disabled={captureBusy || publicResponse.trim().length < 20}
              className="px-3 py-2 rounded bg-cyan-700 hover:bg-cyan-600 text-white text-xs font-mono font-bold disabled:opacity-40"
            >
              {captureBusy ? 'Checking...' : 'Capture + Check'}
            </button>
            <button
              onClick={() => onRunPattyConvergence(caseId || undefined)}
              disabled={isDeliberating || !caseId}
              className="px-3 py-2 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-mono font-bold disabled:opacity-40"
            >
              Send Admitted Evidence to Patty
            </button>
          </div>
        </div>
      </div>

      {/* Outer Edge Minds Strip */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-400" />
            Fast Outer Cognitive Edge (5 Reasoning Roles + Checks A-E)
          </h3>

          <button
            onClick={() => onRunDeliberation()}
            disabled={isDeliberating}
            className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-800/80 text-xs font-mono flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isDeliberating ? 'animate-spin' : ''}`} />
            <span>{isDeliberating ? 'Thinking...' : 'Re-Run Outer Minds'}</span>
          </button>
        </div>

        {/* 5 Mind Badges */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {minds.map((mind) => {
            const isSelected = mind.id === selectedMindId;
            const checkerPassed = mind.outerCheck.passed;

            return (
              <div
                key={mind.id}
                onClick={() => setSelectedMindId(mind.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-slate-800 border-purple-500 shadow-md shadow-purple-950/50 scale-[1.02]'
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">{mind.avatar}</span>
                    <span className="font-bold text-xs text-white">{mind.name}</span>
                  </div>
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                      checkerPassed
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-red-950 text-red-300 border border-red-800'
                    }`}
                  >
                    {mind.outerCheck.checkerId}: {checkerPassed ? 'PASS' : 'KICKED'}
                  </span>
                </div>

                <div className="text-[10px] text-slate-400 font-mono truncate">{mind.specialty}</div>
                <div className="text-[10px] text-purple-300/80 font-mono mt-1">
                  Confidence: {(mind.confidence * 100).toFixed(0)}%
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Mind Hypothesis & Independent Checker Diagnostic */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Mind Hypothesis */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">{selectedMind.avatar}</span>
              <div>
                <h4 className="text-sm font-bold text-white">{selectedMind.name}</h4>
                <span className="text-[10px] font-mono text-purple-400">{selectedMind.role}</span>
              </div>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
              Style: {selectedMind.specialty}
            </span>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-mono text-slate-400 uppercase">Role Hypothesis</label>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs text-slate-200 leading-relaxed">
              "{selectedMind.hypothesis}"
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono text-slate-400 uppercase">Reasoning Trajectory</label>
            <div className="space-y-1">
              {selectedMind.reasoning.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs font-mono text-slate-300">
                  <span className="text-purple-400 font-bold shrink-0">{idx + 1}.</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Admission Checker Card */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Fast Outer Checker ({selectedMind.outerCheck.checkerId})
            </h4>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                selectedMind.outerCheck.passed
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'bg-red-950 text-red-300 border border-red-800'
              }`}
            >
              {selectedMind.outerCheck.passed ? 'PASSED TO CENTER' : 'CLAIMS KICKED BACK'}
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            "Before any hypothesis reaches the center, it passes through that participant's deterministic admission checker.
            Garbage, unsupported claims, broken calculations and incomplete reasoning get kicked back."
          </p>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono space-y-2">
            <div>
              <span className="text-slate-500 block text-[10px]">DIAGNOSTIC REPORT:</span>
              <span className="text-cyan-300">{selectedMind.outerCheck.diagnostic}</span>
            </div>

            {selectedMind.outerCheck.kickedBackClaims.length > 0 && (
              <div>
                <span className="text-red-400 block text-[10px]">KICKED BACK CLAIMS (RETURNED TO MIND):</span>
                {selectedMind.outerCheck.kickedBackClaims.map((claim, cIdx) => (
                  <div key={cIdx} className="text-red-300">
                    • {claim}
                  </div>
                ))}
              </div>
            )}

            {selectedMind.outerCheck.verifiedAssumptions?.length > 0 && (
              <div>
                <span className="text-emerald-400 block text-[10px]">VERIFIED ASSUMPTIONS:</span>
                {selectedMind.outerCheck.verifiedAssumptions.map((assump, aIdx) => (
                  <div key={aIdx} className="text-slate-300">
                    ✓ {assump}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SARGENT PATTY: Central Convergence Arena */}
      <div className="bg-slate-900/90 border border-amber-500/50 rounded-xl p-6 space-y-5 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white tracking-wide">SARGENT PATTY</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-bold">
                  COMMANDER OF CONVERGENCE
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                "Patty sits at the center. She does NOT count votes. She forces them to fight it out computationally."
              </p>
            </div>
          </div>

          <button
            onClick={() => onRunPattyConvergence(caseId || undefined)}
            disabled={isDeliberating}
            className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-mono font-bold shadow-md shadow-amber-950 flex items-center gap-2 active:scale-95 transition-all disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>Force Computational Cross-Examination</span>
          </button>
        </div>

        {/* Patty Cross-Examination Rounds */}
        <div className="space-y-3">
          <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
            Patty's Cross-Examination & Reconstruction Rounds
          </h4>

          <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
            {pattyDialogue.map((item, index) => (
              <div
                key={index}
                className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/80 space-y-2 font-mono text-xs"
              >
                {/* Patty Command */}
                <div className="flex items-start gap-2 text-amber-300">
                  <span className="font-bold text-amber-400 shrink-0">PATTY:</span>
                  <span className="font-semibold italic">"{item.instruction}"</span>
                </div>

                {/* Target Mind Response */}
                <div className="flex items-start gap-2 pl-4 text-slate-300 border-l-2 border-slate-800">
                  <CornerDownRight className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-cyan-400 font-bold">{item.target}: </span>
                    <span className="text-slate-200">{item.response}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Converged Defensible Proposal Card */}
        {convergedProposal && (
          <div className="bg-slate-950 rounded-xl border border-emerald-500/50 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <div>
                  <h4 className="text-sm font-bold text-white font-mono">{convergedProposal.title}</h4>
                  <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                    STATUS: ALL MINDS DEFENDED & SIGNED
                  </span>
                </div>
              </div>

              <div className="text-xs font-mono text-slate-400">
                Risk Score: <span className="text-emerald-300 font-bold">{convergedProposal.targetSubstrateAction.riskScore}</span> • Energy: <span className="text-amber-300 font-bold">{convergedProposal.targetSubstrateAction.energyEstimateMilliJoules} mJ</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="space-y-1">
                <span className="text-slate-500 block text-[10px] uppercase">Core Converged Decision</span>
                <p className="text-slate-200 bg-slate-900 p-3 rounded-lg border border-slate-800 leading-relaxed">
                  {convergedProposal.coreDecision}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-500 block text-[10px] uppercase">Computational Proof & Stability</span>
                <p className="text-cyan-300 bg-slate-900 p-3 rounded-lg border border-slate-800 leading-relaxed font-mono">
                  {convergedProposal.computationalProof}
                </p>
              </div>
            </div>

            <div className="p-3 bg-purple-950/40 border border-purple-800/60 rounded-lg text-xs font-mono text-purple-200">
              <span className="font-bold text-purple-300">Defensibility Pact: </span>
              {convergedProposal.defensibilityPact}
            </div>

            {/* Missing Evidence Catalog (if any) */}
            {convergedProposal.missingEvidenceCatalog && convergedProposal.missingEvidenceCatalog.length > 0 && (
              <div className="p-3 bg-amber-950/40 border border-amber-800/60 rounded-lg text-xs font-mono text-amber-200">
                <span className="font-bold text-amber-300">Catalog of Missing Evidence: </span>
                {convergedProposal.missingEvidenceCatalog.join('; ')}
              </div>
            )}

            {/* Crucial Thesis Callout: Patty produces proposal, but CANNOT self-approve! */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-2">
              <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <strong>CRITICAL PRINCIPLE:</strong> Even with unanimous defensible convergence, Twin Mind and Patty
                  possess ZERO authority to execute. CHEK must independently verify.
                </span>
              </div>

              <button
                onClick={() => onTransmitToChek(convergedProposal)}
                className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-mono text-xs font-black shadow-lg shadow-emerald-950 active:scale-95 transition-all flex items-center gap-2 shrink-0"
              >
                <span>Transmit to CHEK Independent Authority</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
