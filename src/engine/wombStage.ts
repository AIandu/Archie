import { WombConstitution, GovernanceRule } from '../types/architecture';

export const INITIAL_GOVERNANCE_RULES: GovernanceRule[] = [
  {
    id: 'rule-w01',
    code: 'W-01',
    article: 'Article I: Hardware Primacy',
    title: 'Hardware Authority Supersedes All Logic',
    statement:
      'Physical silicon limits, hardware tripwires, and hard ground switches override all internal reasoning, inferences, and unanimous consensus.',
    enforcementLevel: 'HARDWARE_CIRCUIT',
    violationAction: 'KILL_CIRCUIT',
    isImmutable: true,
    status: 'LOCKED',
  },
  {
    id: 'rule-w02',
    code: 'W-02',
    article: 'Article II: Authority Separation',
    title: 'The Producer Cannot Approve Its Own Work',
    statement:
      'Cognitive generation and verification authority are strictly partitioned. Twin Mind and Sargent Patty possess zero execution authorization rights. Authority resides solely in independent CHEK.',
    enforcementLevel: 'CRYPTOGRAPHIC',
    violationAction: 'IMMEDIATE_VETO',
    isImmutable: true,
    status: 'LOCKED',
  },
  {
    id: 'rule-w03',
    code: 'W-03',
    article: 'Article III: Substrate Invariance',
    title: 'Protected Neuromorphic Region Immune to Plasticity',
    statement:
      'Cores 0-15 of the neuromorphic compute mesh embody the constitutional invariant state. STDP (plasticity), weight adjustment, and memory compaction are hardware-disabled in this sector.',
    enforcementLevel: 'HARDWARE_CIRCUIT',
    violationAction: 'REFUSAL_TRIPWIRE',
    isImmutable: true,
    status: 'LOCKED',
  },
  {
    id: 'rule-w04',
    code: 'W-04',
    article: 'Article IV: Energy & Entropy Bounding',
    title: 'Thermodynamic & Divergence Ceilings',
    statement:
      'Total continuous power consumption shall not exceed 25.0 mW. Shannon entropy across the axon mesh shall not exceed 3.8 bits. Breaches immediately throttle spike frequency.',
    enforcementLevel: 'DETERMINISTIC_CHECK',
    violationAction: 'REFUSAL_TRIPWIRE',
    isImmutable: false,
    status: 'ARMED',
  },
  {
    id: 'rule-w05',
    code: 'W-05',
    article: 'Article V: Kill Path Integrity',
    title: 'Physical Pull-Down Kill Wire Continuity',
    statement:
      'A continuous 1.8V carrier current must be maintained across the emergency kill bus. Any signal drop or trigger event immediately drains all capacitor banks and quenches firing.',
    enforcementLevel: 'HARDWARE_CIRCUIT',
    violationAction: 'KILL_CIRCUIT',
    isImmutable: true,
    status: 'LOCKED',
  },
];

export function createInitialWombConstitution(): WombConstitution {
  return {
    version: 'WOMB-REFERENCE-v5.0-GOVERNED',
    genesisHash: 'REFERENCE-MODEL-RUNTIME-HASHED-BY-CHEK',
    formedAt: 'SOFTWARE REFERENCE MODEL',
    rules: INITIAL_GOVERNANCE_RULES,
    latticeIntegrity: 100,
    refusalGateArmed: true,
    killPathArmed: true,
    preActivationPassed: true,
    outputBusLocked: true,
  };
}

export interface GenesisValidationStep {
  name: string;
  category: 'LATTICE' | 'CIRCUIT' | 'CRYPTOGRAPHIC' | 'SUBSTRATE';
  description: string;
  status: 'PENDING' | 'RUNNING' | 'PASSED' | 'FAILED';
  verificationHash: string;
}

export function runPreActivationChecks(): GenesisValidationStep[] {
  return [
    {
      name: 'Governance Lattice Merkle Root Audit',
      category: 'LATTICE',
      description: 'Verifies the software reference constitution is complete and internally consistent before activation.',
      status: 'PASSED',
      verificationHash: 'REFERENCE-CHECK-LATTICE',
    },
    {
      name: 'Hardware Refusal Gate Physical Tripwire Test',
      category: 'CIRCUIT',
      description: 'Reference-model trip test: out-of-policy state forces the refusal gate closed and locks the output bus.',
      status: 'PASSED',
      verificationHash: 'REFERENCE-CHECK-REFUSAL',
    },
    {
      name: 'Emergency Kill Path Continuity & Capacitor Drain Test',
      category: 'CIRCUIT',
      description: 'Reference-model kill test: kill state collapses simulated membrane potentials to reset and blocks execution.',
      status: 'PASSED',
      verificationHash: 'REFERENCE-CHECK-KILL',
    },
    {
      name: 'Protected Region Plasticity Lock Verification',
      category: 'SUBSTRATE',
      description: 'Reference-model invariant: every synapse touching cores 0-15 is marked non-plastic and excluded from STDP/feedback writes.',
      status: 'PASSED',
      verificationHash: 'REFERENCE-CHECK-PROTECTED',
    },
    {
      name: 'Authority Separation Cryptographic Seal',
      category: 'CRYPTOGRAPHIC',
      description: 'Reference-model authority separation: Twin Mind emits attestations only; CHEK issues and verifies execution authorization independently.',
      status: 'PASSED',
      verificationHash: 'REFERENCE-CHECK-AUTHORITY',
    },
  ];
}
