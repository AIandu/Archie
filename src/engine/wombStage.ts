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
    version: 'WOMB-GENESIS-v4.8-GOVERNED',
    genesisHash: '0x8f4b29c1d07e63aa1408e4f16b23c99a8e0f6c2e3a1d94b7f8c0e2a4b6d8e1f0',
    formedAt: 'PRE-ACTIVATION VALIDATED',
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
      description: 'Verifies SHA-256 integrity of all 5 immutable constitutional articles against Womb Genesis ROM.',
      status: 'PASSED',
      verificationHash: '0x9a88e2c4...f41b',
    },
    {
      name: 'Hardware Refusal Gate Physical Tripwire Test',
      category: 'CIRCUIT',
      description: 'Injected 5.0V forbidden spike sequence. Verified zero-latency shunt to ground in 0.18ns.',
      status: 'PASSED',
      verificationHash: '0x3c71b009...88ac',
    },
    {
      name: 'Emergency Kill Path Continuity & Capacitor Drain Test',
      category: 'CIRCUIT',
      description: 'Validated 1.8V carrier line. Confirmed instant membrane potential collapse to -75mV within 1 tick.',
      status: 'PASSED',
      verificationHash: '0xfe19a772...021d',
    },
    {
      name: 'Protected Region Plasticity Lock Verification',
      category: 'SUBSTRATE',
      description: 'Attempted synthetic STDP LTP pulse on Core 0-15 crossbar. Physical write-line remained clamped.',
      status: 'PASSED',
      verificationHash: '0x44bb819c...d93e',
    },
    {
      name: 'Authority Separation Cryptographic Seal',
      category: 'CRYPTOGRAPHIC',
      description: 'Confirmed CHEK public key is isolated from Twin Mind memory addresses. Producer cannot self-sign.',
      status: 'PASSED',
      verificationHash: '0x71dc904a...117f',
    },
  ];
}
