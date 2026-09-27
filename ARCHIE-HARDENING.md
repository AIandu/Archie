# Archie hardening pass

This build is a software reference implementation of the four-part architecture: Womb, virtual neuromorphic substrate, Twin Mind/Patty, and CHEK. Hardware pages are target specifications, not claims of fabricated silicon.

## Implemented hardening

- Protected boundary now covers every synapse touching cores 0-15, including protected/adaptive cross-boundary edges.
- STDP and adaptive reinforcement cannot modify protected or cross-boundary synapses.
- Added protected-boundary invariant inspection.
- Resetting the refusal gate no longer unlocks execution. Only a verified Governor authorization, independently validated by CHEK, can temporarily unlock the output bus; it re-locks after dispatch.
- Governor uses canonicalized SHA-256 record/proposal hashing and HMAC-SHA-256 execution authorizations. CHEK independently verifies the governed chain and never issues execution authority.
- Added authorization verification and full hash-chain tamper verification before execution.
- Governor rejects protected writes, self-authorization, evidence-deficit proposals, invalid/excess transition energy, and out-of-policy declared risk. CHEK independently checks Patty evidence lineage, convergence integrity, Governor proposal binding, policy reproducibility, certificate validity, and protected substrate integrity.
- Removed the unsupported fake Lyapunov numerical recomputation. Risk is now represented honestly as a deterministic declared-policy bound unless a real numerical model is supplied.
- Twin Mind model output no longer self-generates its checker result. The server applies deterministic admission checks after generation.
- Gemini model name is configurable with `GEMINI_MODEL`; default is `gemini-2.5-flash`.
- Fixed the autonomous-cycle stale-state bug so Governor evaluates the proposal returned by the current Patty convergence, not a prior React state value.
- Producer values are explicitly treated as attestations, not Governor or CHEK authority signatures.
- Reworded Womb and hardware screens to distinguish the live software reference model from proposed FPGA/ASIC implementation.
- Hardware RTL and package information are now labeled as draft/target material pending simulation, synthesis, timing closure, physical design, fabrication, and bench validation.
- Added regression tests for protected plasticity, refusal-gate execution locking, Governor authorization/rejection and CHEK verification, and vault tamper detection.

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


## Twin Mind public-mind evolution (September 2026)

- Added a live public-mind intake path for ChatGPT, Claude, Gemini, Grok, and Perplexity responses from fresh sessions.
- Public minds are treated as independent evidence-producing guests. They do not hold Archie memory and cannot claim CHEK or execution authority.
- Added persistent Patty case objects that retain the problem, captured responses, timestamps, and convergence history for the running service.
- Sargent Patty can use the paid OpenAI Responses API as the persistent convergence/control plane through `OPENAI_API_KEY` and `PATTY_MODEL`, with Gemini retained as an optional fallback.
- Patty is explicitly instructed not to vote, invent measurements, or self-authorize. She must converge through reconstruction/challenge or return an evidence deficit.
- Added a shared deterministic public-mind admission engine. Admission means structurally admissible, not true.
- Added rejection of guest-mind attempts to assert execution/CHEK authority.
- Added GitHub Actions CI that installs dependencies, type-checks, runs architecture regression tests, and performs a production Vite build on every main push.
- Updated the Vite/esbuild dependency pairing so a clean install resolves correctly.

### Current transport boundary

The live public-mind path currently uses controlled response capture: ask the same case in a fresh public AI session and capture the response into Archie. This avoids storing third-party passwords or depending on brittle/unauthorized scraping. Supported automated transports can later implement the same mind interface without changing Patty, the admission checker, or CHEK.

### Persistence boundary

Patty case history is currently process-persistent in the running Archie service. Durable cross-redeploy storage is the next infrastructure layer and should be backed by an external datastore or attached persistent disk before claiming durable archival persistence.


## Governor / CHEK authority separation (September 27, 2026)

- Governor is the deterministic authority gate and the only component that issues GOV1 execution certificates.
- CHEK is a separate non-authorizing verifier. Its outcomes are VALID, INVALID, INCONSISTENT, or UNVERIFIABLE.
- CHEK's four gates are Evidence Auditor → Rule Checker → Conformance Gateway → Vault.
- CHEK verifies Patty evidence lineage and convergence state, independently reproduces Governor policy, checks exact proposal binding and Governor certificate validity, and checks protected substrate integrity.
- Execution requires an existing Governor authorization plus a VALID CHEK verification. CHEK cannot create permission; it establishes whether the Governor permission and governed chain are trustworthy.
- Governor and CHEK maintain separate tamper-evident ledgers in this software reference implementation.

## Patty cognitive-partner restoration

- Patty is the human-facing front door to Archie rather than a mandatory committee screen.
- Patty follows an explicit Truth Protocol: facts/evidence/inference/uncertainty are separated; absent evidence and tool results may not be invented; useful answers come before caveats; corrections happen when premises fail.
- Patty supports cognitive, predictive, generative, and decisive reasoning modes while retaining zero execution authority.
- Patty receives the active persistent case plus a bounded continuity index of recent Archie cases so older project decisions can be surfaced without pretending unsupported memory.
- Twin Mind is selectively recommended for consequential decisions, unresolved factual disputes, weak evidence, meaningful prediction uncertainty, adversarial review, or explicit operator request. Ordinary conversation does not automatically spend five-mind compute.
- Public minds still receive only the operator's raw case question. Patty's private governance/context is never injected into the public-mind prompt.
- Patty can recommend Twin Mind, but the operator chooses whether to bring it in. Governor and CHEK remain downstream and independent of Patty's cognition.
