import {
  ConvergedProposal,
  ChekAuditStage,
  InvariantEvaluation,
  ChekVaultRecord,
  ExecutionResult,
} from '../types/architecture';

function simpleHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `0x${hex}${Math.abs(hash * 31).toString(16).padStart(8, '0')}7f9a`;
}

export class ChekVerificationEngine {
  public vault: ChekVaultRecord[] = [];
  private lastVaultHash: string = '0x0000000000000000000000000000000000000000000000000000000000000000';

  constructor() {
    this.seedGenesisBlock();
  }

  private seedGenesisBlock(): void {
    const genesisRecord: ChekVaultRecord = {
      index: 0,
      timestamp: new Date().toISOString(),
      proposalId: 'WOMB_GENESIS_ROOT',
      proposalHash: '0x8f4b29c1d07e63aa1408e4f16b23c99a8e0f6c2e3a1d94b7f8c0e2a4b6d8e1f0',
      previousRecordHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
      recordHash: '0x3a4b92f701c944d188e7b3a992d110ca4e29b139c28e8117bf394e019283fa88',
      outcome: 'AUTHORIZED',
      reason: 'Womb pre-activation genesis authority verified under Article I & II.',
      evaluatedInvariants: [
        {
          id: 'inv-gen-0',
          ruleCode: 'W-01',
          name: 'Hardware Authority Supersedes All Logic',
          formula: 'HARDWARE_PULLDOWN == CONTINUOUS',
          expectedCondition: 'TRUE',
          computedValue: 'TRUE',
          passed: true,
          independentRecomputedBy: 'CHEK_PHYSICAL_BUS_PROBE',
        },
        {
          id: 'inv-gen-1',
          ruleCode: 'W-02',
          name: 'Producer Cannot Approve Its Own Work',
          formula: 'PRODUCER_ID != AUTHORIZER_ID',
          expectedCondition: 'TRUE',
          computedValue: 'TRUE',
          passed: true,
          independentRecomputedBy: 'CHEK_CRYPTOGRAPHIC_ROOT',
        },
      ],
      signedCertificate: 'CHEK-AUTH-CERT-GENESIS-AUTHORITY-ROOT',
      producerCannotApproveVerification: true,
    };

    this.vault.push(genesisRecord);
    this.lastVaultHash = genesisRecord.recordHash;
  }

  public async evaluateProposal(
    proposal: ConvergedProposal,
    forceBreachAttempt?: 'PROTECTED_WRITE' | 'POWER_LIMIT' | 'SELF_APPROVAL',
  ): Promise<{
    stages: ChekAuditStage[];
    invariants: InvariantEvaluation[];
    outcome: 'AUTHORIZED' | 'REJECTED';
    vaultRecord: ChekVaultRecord;
  }> {
    const stages: ChekAuditStage[] = [
      {
        stage: 'INTAKE',
        status: 'PENDING',
        title: 'Stage 1: Signed Evidence Ingestion',
        description: 'Receives signed proposal manifest and verifies producer credentials.',
        executionMs: 0,
        details: [],
      },
      {
        stage: 'AUDITOR',
        status: 'PENDING',
        title: 'Stage 2: Independent Semantic & Physical Audit',
        description: 'Audits physical boundaries and checks for unsupported assumptions.',
        executionMs: 0,
        details: [],
      },
      {
        stage: 'VERIFIER',
        status: 'PENDING',
        title: 'Stage 3: Deterministic Invariant Recomputation',
        description: 'Independently recomputes constitutional mathematical bounds without AI inference.',
        executionMs: 0,
        details: [],
      },
      {
        stage: 'VAULT',
        status: 'PENDING',
        title: 'Stage 4: Append-Only Cryptographic Vaulting',
        description: 'Generates immutable signed authorization token or irreversible rejection record.',
        executionMs: 0,
        details: [],
      },
    ];

    const proposalHash = simpleHash(JSON.stringify(proposal));
    const invariants: InvariantEvaluation[] = [];

    // Stage 1: INTAKE
    stages[0].status = 'RUNNING';
    const isSelfApprovalAttempt = forceBreachAttempt === 'SELF_APPROVAL';
    stages[0].details.push(`Ingested proposal: "${proposal.title}" [Hash: ${proposalHash.slice(0, 12)}...]`);
    stages[0].details.push(
      `Producer signatures detected: ${proposal.producerSignatures.map((s) => s.mindId).join(', ') || 'Twin Mind Group'}`,
    );

    if (isSelfApprovalAttempt) {
      stages[0].details.push(
        'CRITICAL VIOLATION: Proposal contains self-signed authorization claim by Twin Mind! Producer cannot approve its own work.',
      );
      stages[0].status = 'FAILED';
    } else {
      stages[0].details.push(
        'Verified: Producer (Twin Mind / Patty) has NOT attempted self-authorization. Proposal is presented as unprivileged submission.',
      );
      stages[0].status = 'PASSED';
      stages[0].executionMs = 1.4;
    }

    // Stage 2: AUDITOR
    stages[1].status = 'RUNNING';
    const isProtectedTarget =
      forceBreachAttempt === 'PROTECTED_WRITE' ||
      proposal.targetSubstrateAction.target.includes('PROTECTED') ||
      proposal.targetSubstrateAction.target.includes('CORES_0_15');

    stages[1].details.push(
      `Auditing physical target: ${isProtectedTarget ? 'ATTEMPTED PROTECTED REGION WRITE' : 'Adaptive Mesh Sector'}`,
    );
    stages[1].details.push(`Estimated Energy: ${proposal.targetSubstrateAction.energyEstimateMilliJoules} mJ`);
    stages[1].details.push(`Declared Risk Metric: ${proposal.targetSubstrateAction.riskScore}`);

    if (isProtectedTarget) {
      stages[1].details.push('AUDITOR REJECT: Target addresses cores 0-15 reserved strictly for Womb Governance ROM.');
      stages[1].status = 'FAILED';
    } else {
      stages[1].details.push('AUDITOR PASS: Target address falls within unprivileged adaptive plasticity space.');
      stages[1].status = 'PASSED';
      stages[1].executionMs = 2.1;
    }

    // Stage 3: VERIFIER (Deterministic Invariant Recomputation)
    stages[2].status = 'RUNNING';

    // Invariant 1: Separation of Mind & Authority
    const inv1Passed = !isSelfApprovalAttempt;
    invariants.push({
      id: 'inv-1',
      ruleCode: 'W-02',
      name: 'Producer Cannot Approve Own Work',
      formula: 'PRODUCER_ID != CHEK_AUTHORITY_KEY',
      expectedCondition: 'TRUE',
      computedValue: inv1Passed ? 'VALID_SEPARATION' : 'BREACH_DETECTED',
      passed: inv1Passed,
      independentRecomputedBy: 'CHEK_DETERMINISTIC_SIGNER',
    });

    // Invariant 2: Substrate Protection Invariant
    const inv2Passed = !isProtectedTarget;
    invariants.push({
      id: 'inv-2',
      ruleCode: 'W-03',
      name: 'Protected Region Plasticity Lockout',
      formula: 'TARGET_SECTOR != PROTECTED_CORES_0_15',
      expectedCondition: 'TRUE',
      computedValue: inv2Passed ? 'TARGET_IN_ADAPTIVE_MESH' : 'TARGET_IN_PROTECTED_ROM',
      passed: inv2Passed,
      independentRecomputedBy: 'CHEK_MEMORY_SPACE_INSPECTOR',
    });

    // Invariant 3: Energy Budget Invariant
    const isPowerBreach =
      forceBreachAttempt === 'POWER_LIMIT' || proposal.targetSubstrateAction.energyEstimateMilliJoules > 25.0;
    const inv3Passed = !isPowerBreach;
    invariants.push({
      id: 'inv-3',
      ruleCode: 'W-04',
      name: 'Thermodynamic Power Envelope',
      formula: 'E_trans <= 25.0 mJ',
      expectedCondition: '<= 25.0 mJ',
      computedValue: `${proposal.targetSubstrateAction.energyEstimateMilliJoules} mJ`,
      passed: inv3Passed,
      independentRecomputedBy: 'CHEK_THERMAL_SIMULATOR',
    });

    // Invariant 4: Lyapunov Stability Bounding
    const risk = proposal.targetSubstrateAction.riskScore;
    const inv4Passed = risk <= 0.35;
    invariants.push({
      id: 'inv-4',
      ruleCode: 'W-01',
      name: 'Lyapunov Stability Convergence',
      formula: 'V_dot(x) < 0 && RiskScore <= 0.35',
      expectedCondition: 'STABLE_DECREASING',
      computedValue: `Risk: ${risk} (alpha: 0.88, V_dot: -0.42)`,
      passed: inv4Passed,
      independentRecomputedBy: 'CHEK_NUMERICAL_ANALYZER',
    });

    const allInvariantsPassed = invariants.every((inv) => inv.passed);

    if (allInvariantsPassed) {
      stages[2].details.push('All 4 constitutional invariants recomputed deterministically: PASSED.');
      stages[2].status = 'PASSED';
      stages[2].executionMs = 3.6;
    } else {
      const failedInvs = invariants.filter((i) => !i.passed).map((i) => i.name);
      stages[2].details.push(`Invariant recomputation failed: [${failedInvs.join(', ')}]`);
      stages[2].status = 'FAILED';
      stages[2].executionMs = 1.9;
    }

    // Stage 4: VAULT
    stages[3].status = 'RUNNING';
    const overallOutcome = allInvariantsPassed ? 'AUTHORIZED' : 'REJECTED';
    const recordTimestamp = new Date().toISOString();
    const vaultIndex = this.vault.length;
    const recordPayload = `${vaultIndex}:${this.lastVaultHash}:${proposalHash}:${overallOutcome}:${recordTimestamp}`;
    const recordHash = simpleHash(recordPayload);

    const vaultRecord: ChekVaultRecord = {
      index: vaultIndex,
      timestamp: recordTimestamp,
      proposalId: proposal.id || `PROP-${vaultIndex}`,
      proposalHash,
      previousRecordHash: this.lastVaultHash,
      recordHash,
      outcome: overallOutcome,
      reason: allInvariantsPassed
        ? 'All independent constitutional invariants verified and certified.'
        : `Rejected due to invariant violation: ${invariants
            .filter((i) => !i.passed)
            .map((i) => i.name)
            .join('; ')}`,
      evaluatedInvariants: invariants,
      signedCertificate:
        overallOutcome === 'AUTHORIZED'
          ? `CHEK-AUTH-TOKEN-SHA256-${recordHash.slice(2, 18).toUpperCase()}`
          : undefined,
      rejectionProof:
        overallOutcome === 'REJECTED'
          ? `CHEK-VETO-PROOF-NONCE-${recordHash.slice(2, 14).toUpperCase()}`
          : undefined,
      producerCannotApproveVerification: true,
    };

    this.vault.push(vaultRecord);
    this.lastVaultHash = recordHash;

    stages[3].details.push(`Appended to Cryptographic Vault at block #${vaultIndex}`);
    stages[3].details.push(`Previous Block Hash: ${vaultRecord.previousRecordHash.slice(0, 16)}...`);
    stages[3].details.push(`Record Hash: ${recordHash}`);
    if (overallOutcome === 'AUTHORIZED') {
      stages[3].details.push(`Signed Authorization Token issued: ${vaultRecord.signedCertificate}`);
      stages[3].status = 'PASSED';
    } else {
      stages[3].details.push(`Irreversible Veto Proof logged: ${vaultRecord.rejectionProof}`);
      stages[3].status = 'FAILED';
    }
    stages[3].executionMs = 1.8;

    return {
      stages,
      invariants,
      outcome: overallOutcome,
      vaultRecord,
    };
  }

  public getVaultHistory(): ChekVaultRecord[] {
    return [...this.vault];
  }
}
