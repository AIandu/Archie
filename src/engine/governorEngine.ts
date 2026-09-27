import { ConvergedProposal, ChekAuditStage, InvariantEvaluation, GovernorVaultRecord } from '../types/architecture';

const ZERO_HASH = `0x${'0'.repeat(64)}`;
const enc = new TextEncoder();

function canonicalize(value: any): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(',')}]`;
  return `{${Object.keys(value).sort().map(k => `${JSON.stringify(k)}:${canonicalize(value[k])}`).join(',')}}`;
}

async function sha256(input: string): Promise<string> {
  const digest = await globalThis.crypto.subtle.digest('SHA-256', enc.encode(input));
  return `0x${Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('')}`;
}

async function hmacHex(key: CryptoKey, input: string): Promise<string> {
  const sig = await globalThis.crypto.subtle.sign('HMAC', key, enc.encode(input));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function toB64Url(input: string): string {
  const bytes = enc.encode(input);
  let binary = '';
  bytes.forEach(b => binary += String.fromCharCode(b));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromB64Url(input: string): string {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - input.length % 4) % 4);
  const binary = atob(padded);
  return new TextDecoder().decode(Uint8Array.from(binary, c => c.charCodeAt(0)));
}

export class GovernorPolicyEngine {
  public vault: GovernorVaultRecord[] = [];
  private lastVaultHash = ZERO_HASH;
  private authorityKeyPromise: Promise<CryptoKey> | null = null;

  constructor() {
    this.seedGenesisBlock();
  }

  private getAuthorityKey(): Promise<CryptoKey> {
    if (!this.authorityKeyPromise) {
      this.authorityKeyPromise = globalThis.crypto.subtle.generateKey(
        { name: 'HMAC', hash: 'SHA-256', length: 256 }, false, ['sign', 'verify'],
      ) as Promise<CryptoKey>;
    }
    return this.authorityKeyPromise;
  }

  private seedGenesisBlock(): void {
    const genesisRecord: GovernorVaultRecord = {
      index: 0,
      timestamp: 'GENESIS',
      proposalId: 'WOMB_GENESIS_ROOT',
      proposalHash: ZERO_HASH,
      previousRecordHash: ZERO_HASH,
      recordHash: ZERO_HASH,
      outcome: 'AUTHORIZED',
      reason: 'Software reference genesis root. Runtime authorizations require deterministic Governor policy approval and remain independently auditable by CHEK.',
      evaluatedInvariants: [],
      producerCannotApproveVerification: true,
    };
    this.vault.push(genesisRecord);
  }

  private async signAuthorization(recordHash: string, proposalHash: string): Promise<string> {
    const payload = canonicalize({ v: 1, recordHash, proposalHash, authority: 'GOVERNOR', purpose: 'EXECUTION_AUTH' });
    const key = await this.getAuthorityKey();
    const mac = await hmacHex(key, payload);
    return `GOV1.${toB64Url(payload)}.${mac}`;
  }

  public async verifyAuthorization(record: GovernorVaultRecord): Promise<boolean> {
    if (record.outcome !== 'AUTHORIZED' || !record.signedCertificate) return false;
    const [prefix, payload64, mac] = record.signedCertificate.split('.');
    if (prefix !== 'GOV1' || !payload64 || !mac) return false;
    try {
      const payload = fromB64Url(payload64);
      const parsed = JSON.parse(payload);
      if (parsed.recordHash !== record.recordHash || parsed.proposalHash !== record.proposalHash || parsed.authority !== 'GOVERNOR') return false;
      const key = await this.getAuthorityKey();
      return globalThis.crypto.subtle.verify('HMAC', key, Uint8Array.from(mac.match(/.{2}/g)!.map((x: string) => parseInt(x, 16))), enc.encode(payload));
    } catch {
      return false;
    }
  }

  public async verifyVaultIntegrity(): Promise<{ passed: boolean; brokenIndex?: number }> {
    let previous = ZERO_HASH;
    for (let i = 1; i < this.vault.length; i++) {
      const record = this.vault[i];
      if (record.previousRecordHash !== previous) return { passed: false, brokenIndex: i };
      const payload = canonicalize({
        index: record.index, timestamp: record.timestamp, proposalId: record.proposalId,
        proposalHash: record.proposalHash, previousRecordHash: record.previousRecordHash,
        outcome: record.outcome, reason: record.reason, evaluatedInvariants: record.evaluatedInvariants,
      });
      const expected = await sha256(payload);
      if (expected !== record.recordHash) return { passed: false, brokenIndex: i };
      previous = record.recordHash;
    }
    return { passed: true };
  }

  public async evaluateProposal(
    proposal: ConvergedProposal,
    forceBreachAttempt?: 'PROTECTED_WRITE' | 'POWER_LIMIT' | 'SELF_APPROVAL',
  ): Promise<{ stages: ChekAuditStage[]; invariants: InvariantEvaluation[]; outcome: 'AUTHORIZED' | 'REJECTED'; vaultRecord: GovernorVaultRecord }> {
    const stages: ChekAuditStage[] = [
      { stage: 'INTAKE', status: 'PENDING', title: 'Stage 1: Evidence Intake', description: 'Validates proposal completeness and authority separation.', executionMs: 0, details: [] },
      { stage: 'AUDITOR', status: 'PENDING', title: 'Stage 2: Boundary Audit', description: 'Checks protected targeting, evidence state and declared resource bounds.', executionMs: 0, details: [] },
      { stage: 'VERIFIER', status: 'PENDING', title: 'Stage 3: Deterministic Recomputation', description: 'Recomputes explicit policy invariants without model judgment.', executionMs: 0, details: [] },
      { stage: 'VAULT', status: 'PENDING', title: 'Stage 4: Cryptographic Vault', description: 'SHA-256 hash chain plus HMAC execution authorization.', executionMs: 0, details: [] },
    ];

    const proposalHash = await sha256(canonicalize(proposal));
    const invariants: InvariantEvaluation[] = [];
    const evidenceDeficit = proposal.status !== 'CONVERGED_DEFENSIBLE' || proposal.missingEvidenceCatalog.length > 0;
    const evidenceHashes = proposal.evidenceLineage?.evidenceHashes || [];
    const validEvidenceHashes = evidenceHashes.length >= 2 && evidenceHashes.every((hash) => /^[a-f0-9]{64}$/i.test(hash));
    const validCaseLineage = Boolean(proposal.evidenceLineage?.caseId?.startsWith('CASE-')) && validEvidenceHashes;
    const selfApproval = forceBreachAttempt === 'SELF_APPROVAL';
    const target = String(proposal.targetSubstrateAction?.target || '').toUpperCase();
    const protectedTarget = forceBreachAttempt === 'PROTECTED_WRITE' || /PROTECTED|CORES?_?0.?15|CORE_?(?:[0-9]|1[0-5])\b/.test(target);
    const energy = Number(proposal.targetSubstrateAction?.energyEstimateMilliJoules);
    const risk = Number(proposal.targetSubstrateAction?.riskScore);
    const powerBreach = forceBreachAttempt === 'POWER_LIMIT' || !Number.isFinite(energy) || energy < 0 || energy > 25;
    const riskBreach = !Number.isFinite(risk) || risk < 0 || risk > 0.35;

    stages[0].status = selfApproval || evidenceDeficit || !validCaseLineage ? 'FAILED' : 'PASSED';
    stages[0].details.push(`Proposal SHA-256: ${proposalHash}`);
    stages[0].details.push(evidenceDeficit ? 'REJECT: proposal is not defensibly converged or contains unresolved evidence deficits.' : 'PASS: proposal marked defensibly converged with no unresolved evidence deficits.');
    stages[0].details.push(selfApproval ? 'REJECT: producer attempted self-authorization.' : 'PASS: producer supplied evidence only; no execution authority claimed.');
    stages[0].details.push(validCaseLineage ? `PASS: traceable case lineage includes ${evidenceHashes.length} admitted SHA-256 evidence records.` : 'REJECT: missing or malformed Twin Mind case/evidence lineage.');

    stages[1].status = protectedTarget || powerBreach ? 'FAILED' : 'PASSED';
    stages[1].details.push(protectedTarget ? 'REJECT: action targets protected constitutional address space.' : 'PASS: target is outside protected cores 0-15.');
    stages[1].details.push(powerBreach ? `REJECT: declared transition energy ${energy} mJ exceeds 25 mJ policy ceiling or is invalid.` : `PASS: declared transition energy ${energy} mJ is within policy ceiling.`);

    const checks = [
      ['inv-1','W-02','Authority Separation','PRODUCER_CANNOT_AUTHORIZE', !selfApproval, selfApproval ? 'BREACH' : 'SEPARATED'],
      ['inv-2','W-03','Protected Region Lockout','TARGET_OUTSIDE_CORES_0_15', !protectedTarget, protectedTarget ? 'PROTECTED_TARGET' : 'ADAPTIVE_TARGET'],
      ['inv-3','W-04','Transition Energy Ceiling','ENERGY_MJ <= 25', !powerBreach, `${energy} mJ`],
      ['inv-4','W-04','Declared Risk Policy','0 <= RISK <= 0.35', !riskBreach, `${risk}`],
      ['inv-5','W-02','Evidence Completeness','STATUS == CONVERGED_DEFENSIBLE && MISSING_EVIDENCE == 0', !evidenceDeficit, evidenceDeficit ? 'DEFICIT' : 'COMPLETE'],
      ['inv-6','W-02','Evidence Lineage','CASE_ID_PRESENT && EVIDENCE_HASHES >= 2 && SHA256_FORMAT_VALID', validCaseLineage, validCaseLineage ? `${evidenceHashes.length}_HASHES` : 'LINEAGE_INVALID'],
    ] as const;
    for (const [id, ruleCode, name, formula, passed, computedValue] of checks) {
      invariants.push({ id, ruleCode, name, formula, expectedCondition: 'PASS', computedValue, passed, independentRecomputedBy: 'GOVERNOR_DETERMINISTIC_POLICY_ENGINE' });
    }

    const allPassed = invariants.every(i => i.passed) && stages[0].status === 'PASSED' && stages[1].status === 'PASSED';
    stages[2].status = allPassed ? 'PASSED' : 'FAILED';
    stages[2].details.push(allPassed ? 'All deterministic invariants recomputed: PASS.' : `Failed invariants: ${invariants.filter(i=>!i.passed).map(i=>i.name).join(', ')}`);

    const outcome: 'AUTHORIZED' | 'REJECTED' = allPassed ? 'AUTHORIZED' : 'REJECTED';
    const timestamp = new Date().toISOString();
    const index = this.vault.length;
    const reason = allPassed ? 'All deterministic authorization invariants passed.' : `Rejected: ${invariants.filter(i=>!i.passed).map(i=>i.name).join('; ')}`;
    const recordCore = { index, timestamp, proposalId: proposal.id || `PROP-${index}`, proposalHash, previousRecordHash: this.lastVaultHash, outcome, reason, evaluatedInvariants: invariants };
    const recordHash = await sha256(canonicalize(recordCore));
    const vaultRecord: GovernorVaultRecord = { ...recordCore, recordHash, producerCannotApproveVerification: true };
    if (outcome === 'AUTHORIZED') vaultRecord.signedCertificate = await this.signAuthorization(recordHash, proposalHash);
    else vaultRecord.rejectionProof = await sha256(`VETO:${recordHash}:${reason}`);

    this.vault.push(vaultRecord);
    this.lastVaultHash = recordHash;
    stages[3].status = outcome === 'AUTHORIZED' ? 'PASSED' : 'FAILED';
    stages[3].details.push(`Appended block #${index}; SHA-256 record hash ${recordHash}.`);
    stages[3].details.push(outcome === 'AUTHORIZED' ? 'HMAC-SHA-256 execution authorization issued.' : 'Cryptographic rejection proof issued; no execution authorization exists.');

    return { stages, invariants, outcome, vaultRecord };
  }

  public getVaultHistory(): GovernorVaultRecord[] { return [...this.vault]; }
}
