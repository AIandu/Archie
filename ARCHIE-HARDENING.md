# Archie hardening pass

This build is a software reference implementation of the four-part architecture: Womb, virtual neuromorphic substrate, Twin Mind/Patty, and CHEK. Hardware pages are target specifications, not claims of fabricated silicon.

## Implemented hardening

- Protected boundary now covers every synapse touching cores 0-15, including protected/adaptive cross-boundary edges.
- STDP and adaptive reinforcement cannot modify protected or cross-boundary synapses.
- Added protected-boundary invariant inspection.
- Resetting the refusal gate no longer unlocks execution. Only a verified CHEK authorization can temporarily unlock the output bus; it re-locks after dispatch.
- CHEK now uses canonicalized SHA-256 record/proposal hashing and HMAC-SHA-256 execution authorizations rather than decorative hashes/tokens.
- Added authorization verification and full hash-chain tamper verification before execution.
- CHEK rejects protected writes, self-authorization, evidence-deficit proposals, invalid/excess transition energy, and out-of-policy declared risk.
- Removed the unsupported fake Lyapunov numerical recomputation. Risk is now represented honestly as a deterministic declared-policy bound unless a real numerical model is supplied.
- Twin Mind model output no longer self-generates its checker result. The server applies deterministic admission checks after generation.
- Gemini model name is configurable with `GEMINI_MODEL`; default is `gemini-2.5-flash`.
- Fixed the autonomous-cycle stale-state bug so CHEK evaluates the proposal returned by the current Patty convergence, not a prior React state value.
- Producer values are explicitly treated as attestations, not CHEK authority signatures.
- Reworded Womb and hardware screens to distinguish the live software reference model from proposed FPGA/ASIC implementation.
- Hardware RTL and package information are now labeled as draft/target material pending simulation, synthesis, timing closure, physical design, fabrication, and bench validation.
- Added regression tests for protected plasticity, refusal-gate execution locking, CHEK authorization/rejection, and vault tamper detection.

## Validation performed in this environment

The core TypeScript engines compile successfully with `tsc` when checked independently. Because package installation timed out in this environment, the full Vite/React dependency build could not be run. The engine files were transpiled separately and an executable Node regression harness passed all core invariant tests.

## Still intentionally not claimed

- Fabricated neuromorphic silicon
- FPGA synthesis/timing closure
- Verified FC-BGA pinout or electrical design
- Measured 0.18 ns refusal timing or physical 1.8 V kill-wire behavior
- Fabricated RRAM/memristive crossbar
- Hardware-isolated cryptographic key/HSM
- Five genuinely independent external AI providers. The current backend provides differentiated reasoning roles through the configured Gemini provider, then runs deterministic admission checks outside model generation.

Those are next-stage implementation targets, not software bugs to disguise.
