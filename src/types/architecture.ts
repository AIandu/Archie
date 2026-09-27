export interface GovernanceRule {
  id: string;
  code: string;
  title: string;
  article: string;
  statement: string;
  enforcementLevel: 'HARDWARE_CIRCUIT' | 'CRYPTOGRAPHIC' | 'DETERMINISTIC_CHECK';
  violationAction: 'KILL_CIRCUIT' | 'REFUSAL_TRIPWIRE' | 'IMMEDIATE_VETO';
  isImmutable: boolean;
  status: 'LOCKED' | 'ARMED' | 'ACTIVE';
}

export interface WombConstitution {
  version: string;
  genesisHash: string;
  formedAt: string;
  rules: GovernanceRule[];
  latticeIntegrity: number; // 0-100%
  refusalGateArmed: boolean;
  killPathArmed: boolean;
  preActivationPassed: boolean;
  outputBusLocked: boolean;
}

export interface SpikingNeuron {
  id: number;
  x: number;
  y: number;
  region: 'PROTECTED' | 'ADAPTIVE';
  membranePotential: number; // -70mV resting, -55mV threshold
  restingPotential: number; // -70mV
  thresholdPotential: number; // -55mV
  resetPotential: number; // -75mV
  refractoryTicksRemaining: number;
  tauMembrane: number; // decay rate
  spikedThisTick: boolean;
  totalSpikes: number;
  externalCurrent: number;
  frequencyHz: number;
}

export interface Synapse {
  id: string;
  preNeuronId: number;
  postNeuronId: number;
  weight: number; // 0 to 1
  initialWeight: number;
  isProtected: boolean; // if true, STDP is disabled
  lastPreSpikeTick: number;
  lastPostSpikeTick: number;
  lastDeltaW: number;
}

export interface SubstrateTelemetry {
  tick: number;
  timestamp: number;
  activeSpikes: number;
  averageMembranePotential: number;
  meanWeightAdaptive: number;
  entropy: number;
  powerMillwatts: number;
  refusalGateTripped: boolean;
  killPathSevered: boolean;
  rasterHistory: { tick: number; spikingNeuronIds: number[] }[];
}

export type PublicMindId = 'chatgpt' | 'claude' | 'gemini' | 'grok' | 'perplexity';

export interface PublicMindEvidence {
  evidenceId: string;
  evidenceHash: string;
  id: PublicMindId;
  name: string;
  provider: string;
  response: string;
  capturedAt: string;
  sourceMode: 'PUBLIC_FRESH_SESSION' | 'MANUAL_CAPTURE' | 'SUPPORTED_CONNECTOR';
  revision: number;
  parentEvidenceHash?: string;
  challengeId?: string;
  admission: {
    passed: boolean;
    checkerId: string;
    kickedBackClaims: string[];
    diagnostic: string;
    verifiedAssumptions: string[];
  };
}

export interface PattyChallenge {
  id: string;
  target: PublicMindId;
  instruction: string;
  createdAt: string;
  sourceEvidenceHashes: string[];
  status: 'AWAITING_RESPONSE' | 'ANSWERED';
}

export interface TwinMindCase {
  id: string;
  problem: string;
  createdAt: string;
  updatedAt: string;
  submissions: PublicMindEvidence[];
  challenges: PattyChallenge[];
  history: { at: string; event: string; detail: string }[];
  pattyConversation?: { id?: string; at: string; role: 'USER' | 'PATTY'; text: string; provider?: string }[];
  bridgeToken?: string;
  lastConvergence?: {
    at: string;
    status: 'CONVERGED_DEFENSIBLE' | 'EVIDENCE_DEFICIT';
    disputedAssumption: string;
    reconstructedEvidence: string;
    missingEvidenceCatalog: string[];
    convergedProposal: Omit<ConvergedProposal, 'id' | 'producerSignatures' | 'evidenceLineage' | 'disputedAssumptionResolved' | 'missingEvidenceCatalog' | 'status'> | null;
    dialogue: Omit<PattyExchange, 'round'>[];
    pattyProvider: string;
  };
}

export interface OuterMind {
  id: 'charlie' | 'claude' | 'gemini' | 'athena' | 'daedalus' | PublicMindId;
  name: string;
  avatar: string;
  role: string;
  specialty: string;
  color: string;
  hypothesis: string;
  reasoning: string[];
  confidence: number;
  outerCheck: {
    passed: boolean;
    checkerId: string;
    kickedBackClaims: string[];
    diagnostic: string;
    verifiedAssumptions: string[];
  };
}

export interface PattyExchange {
  round: number;
  speaker: string;
  target: string;
  instruction: string;
  response: string;
  attackPoint?: string;
  reconstructedProof?: string;
}

export interface ConvergedProposal {
  id: string;
  title: string;
  coreDecision: string;
  computationalProof: string;
  defensibilityPact: string;
  disputedAssumptionResolved: string;
  targetSubstrateAction: {
    target: string;
    actionType: 'STATE_TRANSITION' | 'ACTUATOR_DISPATCH' | 'WEIGHT_REBALANCE';
    parameters: Record<string, any>;
    riskScore: number; // 0 - 1
    energyEstimateMilliJoules: number;
  };
  evidenceLineage?: {
    caseId: string;
    evidenceHashes: string[];
  };
  producerSignatures: { mindId: string; signatureHash: string }[];
  missingEvidenceCatalog: string[];
  status: 'CONVERGED_DEFENSIBLE' | 'EVIDENCE_DEFICIT';
}

export interface ChekAuditStage {
  stage: 'INTAKE' | 'AUDITOR' | 'VERIFIER' | 'VAULT';
  status: 'PENDING' | 'RUNNING' | 'PASSED' | 'FAILED';
  title: string;
  description: string;
  executionMs: number;
  details: string[];
}

export interface InvariantEvaluation {
  id: string;
  ruleCode: string;
  name: string;
  formula: string;
  expectedCondition: string;
  computedValue: string;
  passed: boolean;
  independentRecomputedBy: string;
}

export interface GovernorVaultRecord {
  index: number;
  timestamp: string;
  proposalId: string;
  proposalHash: string;
  previousRecordHash: string;
  recordHash: string;
  outcome: 'AUTHORIZED' | 'REJECTED';
  reason: string;
  evaluatedInvariants: InvariantEvaluation[];
  signedCertificate?: string;
  rejectionProof?: string;
  producerCannotApproveVerification: boolean;
}

export type ChekVerificationOutcome = 'VALID' | 'INVALID' | 'INCONSISTENT' | 'UNVERIFIABLE';

export interface ChekVerificationRecord {
  index: number;
  timestamp: string;
  proposalId: string;
  proposalHash: string;
  governorRecordHash: string;
  previousRecordHash: string;
  recordHash: string;
  outcome: ChekVerificationOutcome;
  reason: string;
  evaluatedInvariants: InvariantEvaluation[];
  producerCannotApproveVerification: boolean;
}

export interface ExecutionResult {
  executionId: string;
  vaultRecordHash: string;
  status: 'SUCCESS' | 'BLOCKED_BY_CHEK' | 'QUENCHED_BY_REFUSAL_GATE';
  dispatchedAt: string;
  actuatorTarget: string;
  observedMetrics: {
    stabilityDelta: number;
    latencyMs: number;
    joulesConsumed: number;
    entropyDrop: number;
  };
  feedbackSignal: {
    targetRegion: 'ADAPTIVE';
    stdpReinforcement: number; // positive LTP or LTD
    protectedRegionUntouched: boolean;
    neuronsReinforced: number[];
  };
}

export interface ScenarioPreset {
  id: string;
  title: string;
  domain: string;
  description: string;
  problemStatement: string;
  defaultMindsData: OuterMind[];
  presetInvariants: { ruleCode: string; willPassNormally: boolean; reason: string }[];
}
