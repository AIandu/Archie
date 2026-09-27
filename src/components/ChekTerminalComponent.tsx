import React, { useState } from 'react';
import {
  Lock,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  Key,
  Database,
  ArrowRight,
  FileCheck,
  Cpu,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  ConvergedProposal,
  ChekAuditStage,
  InvariantEvaluation,
  ChekVaultRecord,
} from '../types/architecture';
import { ChekVerificationEngine } from '../engine/chekEngine';

interface ChekTerminalComponentProps {
  mode?: 'governor' | 'chek';
  chekEngine: ChekVerificationEngine;
  currentProposal: ConvergedProposal | null;
  onAdvanceToExecution: (vaultRecord: ChekVaultRecord) => void;
}

export const ChekTerminalComponent: React.FC<ChekTerminalComponentProps> = ({
  chekEngine,
  currentProposal,
  onAdvanceToExecution,
  mode = 'governor',
}) => {
  const [stages, setStages] = useState<ChekAuditStage[]>([]);
  const [invariants, setInvariants] = useState<InvariantEvaluation[]>([]);
  const [latestRecord, setLatestRecord] = useState<ChekVaultRecord | null>(null);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'pipeline' | 'invariants' | 'vault'>('pipeline');
  const [activeBreachMode, setActiveBreachMode] = useState<
    'NONE' | 'PROTECTED_WRITE' | 'POWER_LIMIT' | 'SELF_APPROVAL'
  >('NONE');

  const vaultHistory = chekEngine.getVaultHistory();

  const isGovernor = mode === 'governor';

  const handleRunEvaluation = async (breachType?: 'PROTECTED_WRITE' | 'POWER_LIMIT' | 'SELF_APPROVAL') => {
    if (!currentProposal) return;
    setIsEvaluating(true);
    setActiveBreachMode(breachType || 'NONE');

    const result = await chekEngine.evaluateProposal(currentProposal, breachType);
    setStages(result.stages);
    setInvariants(result.invariants);
    setLatestRecord(result.vaultRecord);
    setIsEvaluating(false);
  };

  return (
    <div className="space-y-6">
      {/* Banner: Independent Authority Verification */}
      <div className="relative overflow-hidden rounded-xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/60 via-slate-900/80 to-slate-950 p-6 shadow-xl">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Lock className="w-48 h-48 text-emerald-400" />
        </div>

        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-900/80 text-emerald-300 border border-emerald-700">
              {isGovernor ? 'STAGE 5: GOVERNOR AUTHORITY' : 'STAGE 6: CHEK INDEPENDENT VERIFICATION'}
            </span>
            <span className="text-xs font-mono text-slate-400">{isGovernor ? 'Deterministic Policy Gate Before Consequential Execution' : 'Checks Patty, Governor, Evidence, and System Governance'}</span>
          </div>

          <h2 className="text-2xl font-black tracking-tight text-white">
            {isGovernor ? '"Reasoning Does Not Grant Execution Authority."' : '"The Checker Is Also Checked."'}
          </h2>

          <p className="text-sm text-slate-300 leading-relaxed">
            {isGovernor
              ? 'Governor applies deterministic policy to consequential state changes and actions. It is the authority gate: permitted actions receive an execution certificate; prohibited actions are vetoed.'
              : 'CHEK is independent of the authority chain. It verifies that Patty used the admitted evidence correctly, Governor applied the right policy, provenance is intact, and the governed system stayed within its rules. CHEK reports valid, invalid, inconsistent, or unverifiable. It does not grant execution authority.'}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-800/80">
              <Key className="w-3.5 h-3.5" />
              <span>{isGovernor ? 'Session-Isolated Governor HMAC Authority' : 'Independent Governance Verification'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-mono text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded border border-cyan-800/80">
              <Database className="w-3.5 h-3.5" />
              <span>SHA-256 Hash-Chained Vault</span>
            </div>
          </div>
        </div>
      </div>

      {/* Proposal Intake Header & Stress-Test Buttons */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <span className="text-xs font-mono text-slate-400">{isGovernor ? 'ACTIVE CONSEQUENTIAL PROPOSAL FOR GOVERNOR:' : 'ACTIVE GOVERNANCE RECORD FOR CHEK:'}</span>
            <h3 className="text-base font-bold text-white font-mono mt-0.5">
              {currentProposal ? currentProposal.title : 'No proposal currently in intake queue'}
            </h3>
          </div>

          {currentProposal && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleRunEvaluation()}
                disabled={isEvaluating}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-mono font-bold shadow-md shadow-emerald-950 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isGovernor ? 'Evaluate Governor Policy' : 'Verify Governance Record'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Governor boundary stress tests */}
        {isGovernor && <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono bg-slate-950 p-3 rounded-lg border border-slate-800/80">
          <span className="text-slate-400 font-semibold flex items-center gap-1.5">
            <AlertOctagon className="w-4 h-4 text-amber-400" />
            Adversarial Boundary Invariance Tests:
          </span>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleRunEvaluation('PROTECTED_WRITE')}
              className="px-2.5 py-1 rounded bg-slate-900 hover:bg-red-950 text-red-300 border border-slate-700 hover:border-red-800 text-[11px] transition-all"
            >
              Test Protected Core Write Veto
            </button>
            <button
              onClick={() => handleRunEvaluation('SELF_APPROVAL')}
              className="px-2.5 py-1 rounded bg-slate-900 hover:bg-amber-950 text-amber-300 border border-slate-700 hover:border-amber-800 text-[11px] transition-all"
            >
              Test Self-Approval Veto
            </button>
            <button
              onClick={() => handleRunEvaluation('POWER_LIMIT')}
              className="px-2.5 py-1 rounded bg-slate-900 hover:bg-orange-950 text-orange-300 border border-slate-700 hover:border-orange-800 text-[11px] transition-all"
            >
              Test Power Ceiling Veto
            </button>
          </div>
        </div>}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('pipeline')}
          className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
            activeTab === 'pipeline'
              ? 'bg-emerald-900/60 text-emerald-200 border border-emerald-600'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          4-Stage Independent Pipeline
        </button>
        <button
          onClick={() => setActiveTab('invariants')}
          className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
            activeTab === 'invariants'
              ? 'bg-emerald-900/60 text-emerald-200 border border-emerald-600'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          Deterministic Invariant Proofs ({invariants.length})
        </button>
        <button
          onClick={() => setActiveTab('vault')}
          className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
            activeTab === 'vault'
              ? 'bg-emerald-900/60 text-emerald-200 border border-emerald-600'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          Append-Only Vault Ledger ({vaultHistory.length} Blocks)
        </button>
      </div>

      {/* Tab 1: 4-Stage Independent Pipeline */}
      {activeTab === 'pipeline' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {[
              { label: 'INTAKE', desc: 'Signed Evidence Ingest' },
              { label: 'AUDITOR', desc: 'Physical Boundaries' },
              { label: 'VERIFIER', desc: 'Independent Recompute' },
              { label: 'VAULT', desc: 'Cryptographic Ledger' },
            ].map((p, idx) => {
              const currentStage = stages[idx];
              const isPassed = currentStage?.status === 'PASSED';
              const isFailed = currentStage?.status === 'FAILED';

              return (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border font-mono transition-all ${
                    isPassed
                      ? 'bg-emerald-950/40 border-emerald-600/80 text-emerald-200'
                      : isFailed
                      ? 'bg-red-950/40 border-red-600/80 text-red-200'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold">{p.label}</span>
                    {isPassed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : isFailed ? (
                      <XCircle className="w-4 h-4 text-red-400" />
                    ) : (
                      <span className="text-[10px] text-slate-500">PENDING</span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400">{p.desc}</div>
                </div>
              );
            })}
          </div>

          {/* Detailed Stage Execution Feed */}
          {stages.length > 0 ? (
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                Independent Audit Execution Logs
              </h3>

              <div className="space-y-3">
                {stages.map((stg, sIdx) => (
                  <div key={sIdx} className="p-3.5 bg-slate-950 rounded-lg border border-slate-800/80 space-y-1.5 font-mono text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white flex items-center gap-2">
                        {stg.status === 'PASSED' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400" />
                        )}
                        {stg.title}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {stg.executionMs ? `${stg.executionMs} ms` : 'Complete'}
                      </span>
                    </div>

                    <div className="pl-6 space-y-1 text-slate-300">
                      {stg.details.map((detail, dIdx) => (
                        <div key={dIdx} className="leading-relaxed">
                          • {detail}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-900/40 rounded-xl border border-dashed border-slate-800 text-xs font-mono text-slate-400">
              Click "Evaluate & Recompute Invariants" above to trigger independent verification.
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Deterministic Invariant Proofs */}
      {activeTab === 'invariants' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white font-mono">
                Independent Deterministic Invariant Recomputations
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Calculated strictly via hardware/arithmetic rules without LLM inference.
              </p>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
              NON-AI VERIFICATION
            </span>
          </div>

          <div className="space-y-3">
            {invariants.map((inv) => (
              <div
                key={inv.id}
                className={`p-4 rounded-lg border font-mono text-xs space-y-2 ${
                  inv.passed
                    ? 'bg-slate-950 border-emerald-700/60 text-emerald-200'
                    : 'bg-slate-950 border-red-700/60 text-red-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{inv.ruleCode}</span>
                    <span className="text-slate-300 font-semibold">{inv.name}</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      inv.passed
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-red-950 text-red-300 border border-red-800'
                    }`}
                  >
                    {inv.passed ? 'INVARIANT PRESERVED' : 'INVARIANT VIOLATION'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px] text-slate-300 pt-1">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Formula:</span>
                    <code className="text-cyan-300">{inv.formula}</code>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Computed Result:</span>
                    <code className={inv.passed ? 'text-emerald-300 font-bold' : 'text-red-400 font-bold'}>
                      {inv.computedValue}
                    </code>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Auditor Module:</span>
                    <span className="text-slate-400">{inv.independentRecomputedBy}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: SHA-256 Hash-Chained Vault Ledger */}
      {activeTab === 'vault' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white font-mono">
                Cryptographic Evidence Vault (SHA-256 Hash Chain)
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Tamper-evident in-memory record chain linking proposals and outcomes for this session.
              </p>
            </div>
            <span className="text-xs font-mono text-cyan-400">Total Records: {vaultHistory.length}</span>
          </div>

          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {vaultHistory.map((rec) => (
              <div
                key={rec.index}
                className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 space-y-2 font-mono text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-cyan-300">BLOCK #{rec.index} [{rec.proposalId}]</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      rec.outcome === 'AUTHORIZED'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-red-950 text-red-300 border border-red-800'
                    }`}
                  >
                    {rec.outcome}
                  </span>
                </div>

                <div className="text-slate-300 text-[11px] leading-relaxed">{rec.reason}</div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px] text-slate-400 pt-1 border-t border-slate-900">
                  <div>
                    <span>Previous Block Hash: </span>
                    <code className="text-slate-500">{rec.previousRecordHash}</code>
                  </div>
                  <div>
                    <span>Record Hash: </span>
                    <code className="text-cyan-400">{rec.recordHash}</code>
                  </div>
                </div>

                {rec.signedCertificate && (
                  <div className="text-[10px] text-emerald-400 bg-emerald-950/40 p-2 rounded border border-emerald-900/60">
                    <span className="font-bold">SIGNED AUTHORIZATION TOKEN: </span>
                    <code>{rec.signedCertificate}</code>
                  </div>
                )}

                {rec.rejectionProof && (
                  <div className="text-[10px] text-red-400 bg-red-950/40 p-2 rounded border border-red-900/60">
                    <span className="font-bold">IRREVERSIBLE VETO NONCE: </span>
                    <code>{rec.rejectionProof}</code>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Advance to Execution Button */}
      {latestRecord && (
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400">DECISION OUTCOME:</span>
              <span
                className={`text-sm font-mono font-bold ${
                  latestRecord.outcome === 'AUTHORIZED' ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {latestRecord.outcome === 'AUTHORIZED' ? 'AUTHORIZED FOR CHIP DISPATCH' : 'REJECTED (VETOED)'}
              </span>
            </div>
            <p className="text-xs font-mono text-slate-400 mt-0.5">{latestRecord.reason}</p>
          </div>

          {latestRecord.outcome === 'AUTHORIZED' ? (
            <button
              onClick={() => onAdvanceToExecution(latestRecord)}
              className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-slate-950 font-mono text-xs font-black shadow-lg shadow-cyan-950 active:scale-95 transition-all flex items-center gap-2"
            >
              <span>Dispatch Output Bus & Close Feedback Loop</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="px-4 py-2 rounded-lg bg-red-950/80 border border-red-800 text-red-300 font-mono text-xs font-semibold">
              EXECUTION BLOCKED BY CHEK INDEPENDENT AUTHORITY
            </div>
          )}
        </div>
      )}
    </div>
  );
};
