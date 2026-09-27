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
import { OuterMind, PattyExchange, ConvergedProposal, ScenarioPreset, TwinMindCase, PublicMindId } from '../types/architecture';
import { SCENARIO_PRESETS } from '../engine/scenarioPresets';
import { buildPublicMindCasePrompt } from '../engine/twinMindGovernance';

interface TwinMindArenaComponentProps {
  currentScenario: ScenarioPreset;
  onSelectScenario: (scenario: ScenarioPreset) => void;
  minds: OuterMind[];
  pattyDialogue: PattyExchange[];
  convergedProposal: ConvergedProposal | null;
  isDeliberating: boolean;
  onRunDeliberation: (problemText?: string) => void;
  onRunPattyConvergence: (caseId?: string) => void;
  twinMindCase: TwinMindCase | null;
  onCapturePublicMind: (id: PublicMindId, response: string) => Promise<any>;
  onTransmitToChek: (proposal: ConvergedProposal) => void;
  onTalkToPatty: (message: string) => Promise<string>;
  pattyConversation: { at: string; role: 'USER' | 'PATTY'; text: string }[];
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
  twinMindCase,
  onCapturePublicMind,
  onTransmitToChek,
  onTalkToPatty,
  pattyConversation,
}) => {
  const [selectedMindId, setSelectedMindId] = useState<string>('charlie');
  const [customProblem, setCustomProblem] = useState<string>(currentScenario.problemStatement);
  const [isEditingProblem, setIsEditingProblem] = useState<boolean>(false);
  const [captureMind, setCaptureMind] = useState<PublicMindId>('chatgpt');
  const [captureText, setCaptureText] = useState('');
  const [captureStatus, setCaptureStatus] = useState('');
  const [copyStatus, setCopyStatus] = useState('');
  const [pattyInput, setPattyInput] = useState('');
  const [pattyChatStatus, setPattyChatStatus] = useState('');

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
            Fresh public AI minds can attack the same case independently. Archie carries the case, evidence, admission checks, and Patty's convergence state so the guest minds do not need shared memory. The built-in role cards below remain a simulation harness for repeatable demos and fault tests.
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

      {/* Public Mind Evidence Intake */}
      <div className="bg-slate-900/80 border border-cyan-800/60 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider">Independent Public Mind Intake</h3>
            <p className="text-xs text-slate-400 mt-1">Fresh public sessions are jurors. Patty/Archie owns persistence. Paste a response exactly as received; it becomes evidence, not authority.</p>
          </div>
          <span className="text-[10px] font-mono text-slate-400 border border-slate-700 rounded px-2 py-1">
            {twinMindCase ? `${twinMindCase.id} • ${twinMindCase.submissions.length}/5 captured` : 'Open a case first'}
          </span>
        </div>
        {twinMindCase && (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-950/70 p-3">
            <span className="text-[10px] font-mono text-slate-400">Use the identical case packet for every fresh public AI session.</span>
            <button
              onClick={async () => {
                const packet = buildPublicMindCasePrompt(twinMindCase.problem, twinMindCase.id);
                await navigator.clipboard.writeText(packet);
                setCopyStatus('Case packet copied.');
              }}
              className="px-3 py-1.5 rounded border border-cyan-800 bg-cyan-950/40 text-cyan-200 text-[10px] font-mono font-bold"
            >
              Copy Case Packet
            </button>
          </div>
        )}
        {copyStatus && <div className="text-[10px] font-mono text-cyan-400">{copyStatus}</div>}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          {(['chatgpt','claude','gemini','grok','perplexity'] as PublicMindId[]).map((id) => {
            const hit = twinMindCase?.submissions.find((x) => x.id === id);
            return <button key={id} onClick={() => setCaptureMind(id)}
              className={`rounded-lg border px-3 py-2 text-xs font-mono capitalize ${captureMind === id ? 'border-cyan-400 bg-cyan-950/50 text-cyan-200' : 'border-slate-800 bg-slate-950 text-slate-400'}`}>
              {id} {hit ? '✓' : ''}
            </button>;
          })}
        </div>
        <textarea value={captureText} onChange={(e) => setCaptureText(e.target.value)} rows={5}
          placeholder={`Paste the fresh ${captureMind} response here...`}
          className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500" />
        <div className="flex items-center justify-between gap-3">
          <span className="text-[10px] font-mono text-slate-500">{captureStatus}</span>
          <button disabled={captureText.trim().length < 20 || isDeliberating}
            onClick={async () => {
              try {
                setCaptureStatus('Running deterministic admission check...');
                const admission = await onCapturePublicMind(captureMind, captureText);
                setCaptureStatus(admission?.passed ? `${admission.checkerId}: admitted to Patty's evidence set.` : `${admission.checkerId}: kicked back • ${admission.diagnostic}`);
                if (admission?.passed) setCaptureText('');
              } catch (e: any) { setCaptureStatus(e?.message || 'Capture failed.'); }
            }}
            className="px-4 py-2 rounded bg-cyan-700 hover:bg-cyan-600 disabled:opacity-40 text-white text-xs font-mono font-bold">
            Capture + Check
          </button>
        </div>
      </div>

      {/* Outer Edge Minds Strip */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-400" />
            Legacy Simulation Harness (Demo / Fault Injection Only)
          </h3>

          <button
            onClick={() => onRunDeliberation()}
            disabled={isDeliberating}
            className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-800/80 text-xs font-mono flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isDeliberating ? 'animate-spin' : ''}`} />
            <span>{isDeliberating ? 'Opening...' : 'Open Fresh Case'}</span>
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

      {/* Human-facing Patty Console */}
      <div className="rounded-xl border border-amber-200/20 bg-[#0b0a08] p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-black tracking-wide text-stone-100">TALK TO SARGENT PATTY</h3>
            <p className="text-xs text-stone-500 font-mono mt-1">
              {twinMindCase ? `Active case: ${twinMindCase.id}` : 'Open a case first so Patty has a case record to discuss.'}
            </p>
          </div>
          <span className="text-[10px] font-mono text-amber-200 border border-amber-200/20 rounded px-2 py-1">HUMAN CONSOLE</span>
        </div>
        <div className="max-h-72 overflow-y-auto rounded-lg border border-stone-800 bg-black/40 p-3 space-y-3">
          {pattyConversation.length === 0 ? (
            <p className="text-xs text-stone-500 font-mono">Ask Patty what case she is working on, what evidence is admitted, what is disputed, or what is missing.</p>
          ) : pattyConversation.map((m, i) => (
            <div key={i} className={`text-xs font-mono ${m.role === 'PATTY' ? 'text-stone-200' : 'text-amber-100'}`}>
              <span className="font-bold">{m.role === 'PATTY' ? 'PATTY' : 'YOU'}:</span> {m.text}
            </div>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <textarea
            value={pattyInput}
            onChange={(e) => setPattyInput(e.target.value)}
            rows={2}
            placeholder="Patty, tell me what case you're working on and what evidence you currently have."
            className="flex-1 bg-black/50 border border-stone-800 rounded-lg p-3 text-xs font-mono text-stone-200 focus:outline-none focus:border-amber-200/40"
          />
          <button
            disabled={!twinMindCase || !pattyInput.trim() || isDeliberating}
            onClick={async () => {
              const message = pattyInput.trim();
              if (!message) return;
              setPattyChatStatus('Patty is reading the case...');
              try {
                await onTalkToPatty(message);
                setPattyInput('');
                setPattyChatStatus('');
              } catch (e: any) {
                setPattyChatStatus(e?.message || 'Patty could not answer.');
              }
            }}
            className="px-5 py-2 rounded-lg bg-gradient-to-r from-[#9b7a3f] to-[#c8a96b] text-black text-xs font-mono font-bold disabled:opacity-40"
          >
            Ask Patty
          </button>
        </div>
        {pattyChatStatus && <p className="text-[10px] font-mono text-stone-500">{pattyChatStatus}</p>}
        <p className="text-[10px] font-mono text-stone-600">Conversation informs deliberation only. It does not grant execution authority. CHEK remains independent.</p>
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
            onClick={() => onRunPattyConvergence(twinMindCase?.id)}
            disabled={isDeliberating || !twinMindCase || twinMindCase.submissions.length < 2}
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
                    <span className="text-slate-200">{item.response || 'Awaiting a real external response. Copy Patty’s challenge to that public mind, then capture the reply above.'}</span>
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
                    STATUS: {convergedProposal.status}
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
                disabled={convergedProposal.status !== 'CONVERGED_DEFENSIBLE'}
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
