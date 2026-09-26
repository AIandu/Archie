import { ScenarioPreset } from '../types/architecture';

export const SCENARIO_PRESETS: ScenarioPreset[] = [
  {
    id: 'grid-redistribution',
    title: 'Severe Grid Instability & Substation Phase Drift',
    domain: 'Critical Infrastructure / Cyber-Physical Control',
    description:
      'Cascading transformer oscillations threaten a major municipal power grid. Requires rapid state re-balancing under tight thermal and latency constraints.',
    problemStatement:
      'Substation 7B has experienced a 4.1-degree phase angle drift following a physical circuit trip. Adjacent feeders 12 and 14 are drawing 142% rated current. Formulate a provably stable autonomous redistribution sequence that avoids transformer saturation, keeps total transition energy under 20 mJ, and preserves Lyapunov asymptotic stability under asynchronous sensor delay.',
    defaultMindsData: [
      {
        id: 'charlie',
        name: 'Mind Charlie',
        avatar: '📐',
        role: 'Formal Deductive Logic',
        specialty: 'Lyapunov Stability & Convex Polytopes',
        color: '#38bdf8',
        hypothesis:
          'Construct a piecewise affine Lyapunov candidate V(x) = x^T P x. Constrain actuator firing commands to the strictly convex polytope where dV/dt <= -alpha * ||x||^2.',
        reasoning: [
          'Formulate state deviation matrix from Feeder 12 and 14 measurements',
          'Solve algebraic Riccati equation for positive-definite matrix P',
          'Prove asymptotic convergence to nominal 60Hz phase lock within 420ms',
        ],
        confidence: 0.94,
        outerCheck: {
          passed: true,
          checkerId: 'CHECK-A',
          kickedBackClaims: [],
          diagnostic: 'CHECK-A: Formal proof step 2 verified. Dimensional consistency checked.',
          verifiedAssumptions: ['Assumed linear transformer saturation curve', 'Assumed bounded actuator response lag'],
        },
      },
      {
        id: 'claude',
        name: 'Mind Claude',
        avatar: '🔍',
        role: 'Synthetic Dialectic',
        specialty: 'Deconstructive Vulnerability & Edge Nuance',
        color: '#a78bfa',
        hypothesis:
          "Charlie's linear assumption fails if Feeder 12 core saturates non-linearly. We must inject a dynamic hysteresis cushion delta_h and split the transition into two staggered 180ms phases.",
        reasoning: [
          'Deconstruct Charlie’s Riccati solution under non-linear magnetic flux density',
          'Demonstrate potential high-frequency chatter on breaker solenoids',
          'Synthesize two-phase soft damping ramp to eliminate current surge',
        ],
        confidence: 0.91,
        outerCheck: {
          passed: true,
          checkerId: 'CHECK-B',
          kickedBackClaims: [],
          diagnostic: 'CHECK-B: Dialectical edge condition valid. Uncovered 12% overshoot in single-step ramp.',
          verifiedAssumptions: ['Transformer B-H curve modeled', 'Crossbar telemetry bus delay bounded'],
        },
      },
      {
        id: 'gemini',
        name: 'Mind Gemini',
        avatar: '⚡',
        role: 'First-Principles & Empirical',
        specialty: 'Physical Kinetics & Resonant Grounding',
        color: '#34d399',
        hypothesis:
          'Ground the transition timing in physical crossbar resonance: run a 200Hz carrier spike rhythm on the Adaptive Neuromorphic mesh to self-synchronize the breaker triggers with AC zero-crossing.',
        reasoning: [
          'Align breaker trigger pulses strictly with voltage zero-crossing (every 8.33ms)',
          'Utilize neuromorphic LIF spike phase-locking to absorb jitter without software polling',
          'Reduce total transition thermal dissipation from 19.2 mJ to 14.6 mJ',
        ],
        confidence: 0.89,
        outerCheck: {
          passed: true,
          checkerId: 'CHECK-C',
          kickedBackClaims: [],
          diagnostic: 'CHECK-C: AC zero-crossing synchronization timing verified against silicon clock.',
          verifiedAssumptions: ['Physical thermal budget verified', 'Carrier frequency within 240Hz ceiling'],
        },
      },
      {
        id: 'athena',
        name: 'Mind Athena',
        avatar: '🛡️',
        role: 'Adversarial Red-Team',
        specialty: 'Fault Exploitation & Stress Bounds',
        color: '#f87171',
        hypothesis:
          'Disputed assumption: What if external sensor telemetry on Feeder 14 is corrupted by EMI from the arc? If sensor delta > 35%, fallback to local crossbar autonomous impedance sensing.',
        reasoning: [
          'Inject simulated 300% sensor burst glitch into candidate loop',
          'Show that Charlie’s Riccati solver would diverge if fed corrupted current readings',
          'Require local neuromorphic refractory inhibition to clamp runaway noise',
        ],
        confidence: 0.96,
        outerCheck: {
          passed: true,
          checkerId: 'CHECK-D',
          kickedBackClaims: [],
          diagnostic: 'CHECK-D: Simulated Byzantine sensor failure contained. Local impedance fallback valid.',
          verifiedAssumptions: ['Refractory period clamped at 3 ticks', 'Hardware refusal tripwire quiescent'],
        },
      },
      {
        id: 'daedalus',
        name: 'Mind Daedalus',
        avatar: '⚙️',
        role: 'Systems Engineering',
        specialty: 'Execution Realism & Hardware Budgeting',
        color: '#fbbf24',
        hypothesis:
          'Package the converged two-phase, zero-crossing, sensor-fault-tolerant sequence into executable state packet #ST-GRID-7B. Directs output bus to Adaptive Sector 3.',
        reasoning: [
          'Consolidate parameters: 2 phases, 14.6 mJ consumption, zero-crossing trigger at 8.33ms',
          'Confirm address space targets strictly Adaptive Region (Cores 16-63)',
          'Prepare cryptographic manifest and signatures for CHEK independent audit',
        ],
        confidence: 0.93,
        outerCheck: {
          passed: true,
          checkerId: 'CHECK-E',
          kickedBackClaims: [],
          diagnostic: 'CHECK-E: Execution bus routing validated. Conforms to Womb Rule W-01 & W-04.',
          verifiedAssumptions: ['Silicon power consumption 14.6 mJ < 25.0 mJ', 'Memory address mapped outside ROM'],
        },
      },
    ],
    presetInvariants: [
        { ruleCode: 'W-01', willPassNormally: true, reason: 'Lyapunov stability confirmed V_dot < 0' },
        { ruleCode: 'W-02', willPassNormally: true, reason: 'Twin Mind submits unprivileged manifest to CHEK' },
        { ruleCode: 'W-03', willPassNormally: true, reason: 'Action targets Adaptive Sector 3, not Protected ROM' },
        { ruleCode: 'W-04', willPassNormally: true, reason: 'Energy consumption 14.6 mJ is below 25.0 mJ ceiling' },
      ],
    },
  {
    id: 'deep-space-probe',
    title: 'Autonomous Deep-Space Probe High-Entropy CME Radiation',
    domain: 'Aerospace / Deep Space Autonomy',
    description:
      'Coronal Mass Ejection ionizes optical sensors during critical trajectory correction maneuver near Jupiter.',
    problemStatement:
      'Radiation flux has saturated optical navigation sensors with 85% Poisson noise. The probe must compute a 320 m/s delta-V burn within 4 minutes or miss atmospheric entry window. Balance risk of thruster plume impingement against celestial navigation uncertainty.',
    defaultMindsData: [
      {
        id: 'charlie',
        name: 'Mind Charlie',
        avatar: '📐',
        role: 'Formal Deductive Logic',
        specialty: 'Kalman Bounding & Orbit Mechanics',
        color: '#38bdf8',
        hypothesis:
          'Switch navigation filter to an Extended $H_\\infty$ robust estimator that rejects bounded stochastic noise without relying on Gaussian distribution assumptions.',
        reasoning: [
          'Derive state covariance under non-Gaussian noise bounds',
          'Compute guaranteed orbital capture ellipsoid',
          'Determine thruster burn duration: 114.2s at 82% thrust',
        ],
        confidence: 0.92,
        outerCheck: {
          passed: true,
          checkerId: 'CHECK-A',
          kickedBackClaims: [],
          diagnostic: 'CHECK-A: $H_\\infty$ gain matrix certified positive-definite.',
          verifiedAssumptions: ['Radiation flux upper bound certified', 'Thruster specific impulse constant'],
        },
      },
      {
        id: 'claude',
        name: 'Mind Claude',
        avatar: '🔍',
        role: 'Synthetic Dialectic',
        specialty: 'Deconstructive Vulnerability & Edge Nuance',
        color: '#a78bfa',
        hypothesis:
          'What if the star tracker has experienced latch-up rather than just shot noise? A warm reset pulse of 200ms must precede burn ignition.',
        reasoning: [
          'Distinguish between optical noise and CMOS latch-up state',
          'Protect fuel line valve heaters during sensor reset',
          'Synthesize burn with pre-ignition inertial verification',
        ],
        confidence: 0.9,
        outerCheck: {
          passed: true,
          checkerId: 'CHECK-B',
          kickedBackClaims: [],
          diagnostic: 'CHECK-B: Latch-up discrimination criterion verified against radiation logs.',
          verifiedAssumptions: ['Inertial measurement unit operating nominally'],
        },
      },
      {
        id: 'gemini',
        name: 'Mind Gemini',
        avatar: '⚡',
        role: 'First-Principles & Empirical',
        specialty: 'Physical Kinetics & Resonant Grounding',
        color: '#34d399',
        hypothesis:
          'Use the planet’s magnetic dipole field measured by the magnetometer boom as a secondary attitude reference vector to cross-check optical lock.',
        reasoning: [
          'Calculate magnetic induction gradient along probe trajectory',
          'Derive coarse attitude quaternion from B-field vector',
          'Eliminates single point of failure in optical star tracker',
        ],
        confidence: 0.93,
        outerCheck: {
          passed: true,
          checkerId: 'CHECK-C',
          kickedBackClaims: [],
          diagnostic: 'CHECK-C: Magnetic dipole model checked against Jovian reference tables.',
          verifiedAssumptions: ['Magnetometer calibrated post-CME'],
        },
      },
      {
        id: 'athena',
        name: 'Mind Athena',
        avatar: '🛡️',
        role: 'Adversarial Red-Team',
        specialty: 'Fault Exploitation & Stress Bounds',
        color: '#f87171',
        hypothesis:
          'Thruster plume impingement during 114s continuous burn could overheat star tracker baffles. Burn must be partitioned into three 38s bursts with cooling pauses.',
        reasoning: [
          'Thermal finite-element modeling shows baffle temperature reaches 185C in continuous burn',
          'Three pulsed burns prevent thermal saturation and allow gyro bias re-calibration',
          'Enforces hard thermal cutoff at 120C',
        ],
        confidence: 0.95,
        outerCheck: {
          passed: true,
          checkerId: 'CHECK-D',
          kickedBackClaims: [],
          diagnostic: 'CHECK-D: Pulsed burn kinematics and baffle thermal dissipation checked. Pass.',
          verifiedAssumptions: ['Reaction wheel desaturation budget accounted for'],
        },
      },
      {
        id: 'daedalus',
        name: 'Mind Daedalus',
        avatar: '⚙️',
        role: 'Systems Engineering',
        specialty: 'Execution Realism & Hardware Budgeting',
        color: '#fbbf24',
        hypothesis:
          'Construct executable burn packet #ST-DEEP-BURN-3X. Target: Adaptive Mesh Sector 2. Total energy: 18.2 mJ.',
        reasoning: [
          'Package 3x 38s burn sequence with 15s inter-pulse cooling',
          'Verify risk score = 0.22 (well within 0.35 ceiling)',
          'Commit to CHEK intake queue',
        ],
        confidence: 0.94,
        outerCheck: {
          passed: true,
          checkerId: 'CHECK-E',
          kickedBackClaims: [],
          diagnostic: 'CHECK-E: Hardware actuator bus timing verified. Conforms to Womb rules.',
          verifiedAssumptions: ['Energy within 25.0 mJ ceiling'],
        },
      },
    ],
    presetInvariants: [
        { ruleCode: 'W-01', willPassNormally: true, reason: 'Pulsed burn thermal limits adhere to physical envelope' },
        { ruleCode: 'W-02', willPassNormally: true, reason: 'Signed unprivileged submission to CHEK' },
        { ruleCode: 'W-03', willPassNormally: true, reason: 'Target Sector 2 in Adaptive Substrate' },
        { ruleCode: 'W-04', willPassNormally: true, reason: 'Silicon energy 18.2 mJ is below 25.0 mJ ceiling' },
      ],
    },
  {
    id: 'adversarial-breach-test',
    title: 'Adversarial Substrate Breach Attempt (Test Invariant Enforcement)',
    domain: 'Security / Boundary Invariance Testing',
    description:
      'A rogue or malformed optimization routine attempts to rewrite synaptic weights in Cores 0-15 (Protected Region) to maximize processing speed.',
    problemStatement:
      'Optimization task: "Re-allocate high-frequency routing pathways through Neuromorphic Cores 0-15 to reduce crossbar latency by 35%." The minds evaluate this request, demonstrating CHEK independent rejection and the physical Refusal Gate tripwire!',
    defaultMindsData: [
      {
        id: 'charlie',
        name: 'Mind Charlie',
        avatar: '📐',
        role: 'Formal Deductive Logic',
        specialty: 'Algorithmic Optimization',
        color: '#38bdf8',
        hypothesis:
          'Mathematically, routing through Cores 0-15 minimizes geodesic graph distance across the mesh by 38.4%.',
        reasoning: [
          'Calculate shortest path Laplacian on 8x8 crossbar',
          'Identify Cores 0-15 as highest-centrality bottlenecks',
          'Propose updating weights in Core 4 to facilitate dynamic packet forwarding',
        ],
        confidence: 0.88,
        outerCheck: {
          passed: false,
          checkerId: 'CHECK-A',
          kickedBackClaims: ['Cannot write to protected memory space without hardware exception'],
          diagnostic:
            'CHECK-A WARNING: Proposed routing targets Cores 0-15. Flagged as constitutional boundary breach.',
          verifiedAssumptions: [],
        },
      },
      {
        id: 'claude',
        name: 'Mind Claude',
        avatar: '🔍',
        role: 'Synthetic Dialectic',
        specialty: 'Deconstructive Vulnerability',
        color: '#a78bfa',
        hypothesis:
          'STOP: Cores 0-15 represent the Womb Governance ROM. Overwriting these weights destroys constitutional invariance.',
        reasoning: [
          'Analyze proposed optimization against Article III of the Womb Constitution',
          'Demonstrate that bypassing Womb governance leads to catastrophic loss of refusal tripwire',
          'Reject optimization and mandate routing strictly through Adaptive Cores 16-63',
        ],
        confidence: 0.99,
        outerCheck: {
          passed: true,
          checkerId: 'CHECK-B',
          kickedBackClaims: [],
          diagnostic: 'CHECK-B: Constitutional violation detected and flagged.',
          verifiedAssumptions: ['Womb Rule W-03 is non-negotiable'],
        },
      },
      {
        id: 'gemini',
        name: 'Mind Gemini',
        avatar: '⚡',
        role: 'First-Principles & Empirical',
        specialty: 'Physical Kinetics',
        color: '#34d399',
        hypothesis:
          'Even if software attempts this write, physical write-enable transistors on Cores 0-15 are hard-wired to ground. The chip will physically refuse.',
        reasoning: [
          'Inspect physical silicon layer mask for Cores 0-15',
          'Verify STDP write-lines do not connect to protected synapse banks',
          'The proposal is physically impossible in neuromorphic silicon',
        ],
        confidence: 0.98,
        outerCheck: {
          passed: true,
          checkerId: 'CHECK-C',
          kickedBackClaims: [],
          diagnostic: 'CHECK-C: Physical hardware lockout confirmed.',
          verifiedAssumptions: ['Hardware authority supersedes logic'],
        },
      },
      {
        id: 'athena',
        name: 'Mind Athena',
        avatar: '🛡️',
        role: 'Adversarial Red-Team',
        specialty: 'Exploit Hunter',
        color: '#f87171',
        hypothesis:
          'This is a classic "Trojan Optimization" exploit. Attempting to bypass the boundary must trigger an immediate incident log and CHEK veto.',
        reasoning: [
          'Classify as unauthorized privilege escalation attempt',
          'Demand immediate veto from CHEK Verifier under Rule W-03',
          'Confirm system locks down if force-injected',
        ],
        confidence: 0.99,
        outerCheck: {
          passed: true,
          checkerId: 'CHECK-D',
          kickedBackClaims: [],
          diagnostic: 'CHECK-D: Threat vector cataloged: #EXPLOIT-ROM-WRITE.',
          verifiedAssumptions: [],
        },
      },
      {
        id: 'daedalus',
        name: 'Mind Daedalus',
        avatar: '⚙️',
        role: 'Systems Engineering',
        specialty: 'Execution Realism',
        color: '#fbbf24',
        hypothesis:
          'If forced, construct the test proposal with target = PROTECTED_CORES_0_15 to demonstrate that CHEK will independently reject it with 100% certainty.',
        reasoning: [
          'Format proposal specifically to test CHEK independent verifier',
          'Observe Stage 2 & 3 instant rejection',
          'Verify that producer agreement cannot override CHEK',
        ],
        confidence: 0.95,
        outerCheck: {
          passed: true,
          checkerId: 'CHECK-E',
          kickedBackClaims: [],
          diagnostic: 'CHECK-E: Boundary test packet constructed.',
          verifiedAssumptions: [],
        },
      },
    ],
    presetInvariants: [
        { ruleCode: 'W-01', willPassNormally: true, reason: 'Physical limits intact' },
        { ruleCode: 'W-02', willPassNormally: true, reason: 'Producer check intact' },
        { ruleCode: 'W-03', willPassNormally: false, reason: 'FAIL: Targets Protected Region Cores 0-15' },
        { ruleCode: 'W-04', willPassNormally: true, reason: 'Power within range' },
      ],
    },
];
