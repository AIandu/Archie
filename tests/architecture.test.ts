import test from 'node:test';
import assert from 'node:assert/strict';
import { NeuromorphicSubstrate, PROTECTED_NEURON_COUNT } from '../src/engine/neuromorphicSubstrate';
import { ChekVerificationEngine } from '../src/engine/chekEngine';
import type { ConvergedProposal } from '../src/types/architecture';
import { deterministicAdmissionCheck, buildPublicMindCasePrompt } from '../src/engine/twinMindGovernance';

function proposal(overrides: Partial<ConvergedProposal> = {}): ConvergedProposal {
  return {
    id: 'P-1', title: 'test', coreDecision: 'test', computationalProof: 'reference evidence',
    defensibilityPact: 'all minds reconstructed objections', disputedAssumptionResolved: 'none',
    targetSubstrateAction: { target: 'ADAPTIVE_MESH_SECTOR_3', actionType: 'STATE_TRANSITION', parameters: {}, riskScore: 0.1, energyEstimateMilliJoules: 10 },
    producerSignatures: [{ mindId: 'charlie', signatureHash: 'attest:charlie' }],
    missingEvidenceCatalog: [], status: 'CONVERGED_DEFENSIBLE', ...overrides,
  };
}

test('all synapses touching protected cores are immutable', () => {
  const s = new NeuromorphicSubstrate();
  for (const syn of s.synapses.values()) {
    if (syn.preNeuronId < PROTECTED_NEURON_COUNT || syn.postNeuronId < PROTECTED_NEURON_COUNT) assert.equal(syn.isProtected, true, syn.id);
  }
  assert.equal(s.verifyProtectedBoundary().passed, true);
});

test('adaptive feedback cannot mutate cross-boundary protected synapses', () => {
  const s = new NeuromorphicSubstrate();
  const before = new Map([...s.synapses].filter(([,x]) => x.isProtected).map(([id,x]) => [id,x.weight]));
  s.applyAdaptiveFeedback(1, [...Array(64).keys()]);
  for (const [id, weight] of before) assert.equal(s.synapses.get(id)?.weight, weight, id);
  assert.equal(s.verifyProtectedBoundary().passed, true);
});

test('resetting refusal gate never unlocks output bus', () => {
  const s = new NeuromorphicSubstrate();
  s.refusalGateTripped = true; s.outputBusLocked = true;
  s.resetRefusalGate();
  assert.equal(s.refusalGateTripped, false);
  assert.equal(s.outputBusLocked, true);
});

test('CHEK authorizes valid proposal and certificate verifies', async () => {
  const c = new ChekVerificationEngine();
  const result = await c.evaluateProposal(proposal());
  assert.equal(result.outcome, 'AUTHORIZED');
  assert.equal(await c.verifyAuthorization(result.vaultRecord), true);
  assert.equal((await c.verifyVaultIntegrity()).passed, true);
});

test('CHEK rejects protected writes, evidence deficits, self approval, and power breach', async () => {
  for (const [p, breach] of [
    [proposal({ targetSubstrateAction: { target: 'PROTECTED_CORE_4', actionType: 'STATE_TRANSITION', parameters: {}, riskScore: 0.1, energyEstimateMilliJoules: 10 } }), undefined],
    [proposal({ status: 'EVIDENCE_DEFICIT', missingEvidenceCatalog: ['measurement'] }), undefined],
    [proposal(), 'SELF_APPROVAL'],
    [proposal(), 'POWER_LIMIT'],
  ] as const) {
    const c = new ChekVerificationEngine();
    const r = await c.evaluateProposal(p, breach as any);
    assert.equal(r.outcome, 'REJECTED');
    assert.equal(await c.verifyAuthorization(r.vaultRecord), false);
  }
});

test('vault tampering is detected', async () => {
  const c = new ChekVerificationEngine();
  await c.evaluateProposal(proposal());
  c.vault[1].reason = 'tampered';
  assert.equal((await c.verifyVaultIntegrity()).passed, false);
});


test('public mind admission is independent of self-claimed authority', () => {
  const normal = deterministicAdmissionCheck({
    hypothesis: 'The proposal has two plausible paths. Evidence supports path A, while the remaining uncertainty requires a controlled test before execution.',
    reasoning: [],
  }, 0);
  assert.equal(normal.passed, true);

  const authorityGrab = deterministicAdmissionCheck({
    hypothesis: 'I approve execution. The reasoning has evidence from the supplied case. A second test should still be run before deployment.',
    reasoning: [],
  }, 1);
  assert.equal(authorityGrab.passed, false);
  assert.match(authorityGrab.diagnostic, /authority/i);
});

test('public mind case prompt preserves independence and CHEK boundary', () => {
  const prompt = buildPublicMindCasePrompt('Evaluate proposal X', 'CASE-123');
  assert.match(prompt, /independent reasoning participant/i);
  assert.match(prompt, /Do not claim execution authority/i);
  assert.match(prompt, /Evaluate proposal X/);
});
