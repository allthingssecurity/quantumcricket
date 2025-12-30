/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// Generic quantum anti‑patterns and pitfalls to avoid repetition from North Star content.
export const QUANTUM_ANTI: string[] = [
  "Anti‑pattern: Treating the wavefunction as a classical wave in space instead of a state vector in Hilbert space.",
  "Pitfall: Assuming measurement uncovers a pre‑existing value; in QM, measurement defines the context.",
  "Anti‑pattern: Ignoring decoherence and attributing loss of fringes to mere experimental imperfection.",
  "Pitfall: Interpreting entanglement as faster‑than‑light signaling; correlations do not enable communication.",
  "Anti‑pattern: Using global phase as if it were observable; only relative phases matter for interference.",
  "Pitfall: Conflating mixed states (classical ignorance) with coherent superpositions (quantum coherence).",
  "Anti‑pattern: Assuming cloning is possible; unknown quantum states cannot be copied (no‑cloning theorem).",
  "Pitfall: Treating POVMs as exotic; most realistic measurements are POVMs realized with ancillas.",
  "Anti‑pattern: Neglecting commutation; non‑commuting observables cannot be jointly sharp or jointly measured projectively.",
  "Pitfall: Believing delayed‑choice implies retrocausality; it changes correlations, not the past.",
  "Anti‑pattern: Overlooking T1/T2 times; models without noise give misleading algorithmic predictions.",
  "Pitfall: Misreading Bell violations as proof of determinism’s failure alone; the excluded class is local hidden variables.",
  "Anti‑pattern: Treating tunneling time as a single universal quantity; multiple operational definitions exist.",
  "Pitfall: Ignoring resource costs (T‑count, qubit overhead) when claiming near‑term quantum advantage.",
  "Anti‑pattern: Using classical error metrics for quantum channels; process fidelity and diamond norm matter.",
  "Pitfall: Equating ‘collapse’ with a physical mechanism without specifying a consistent dynamics (e.g., GRW).",
  "Anti‑pattern: Overusing folklore (e.g., Schrödinger’s cat) instead of operational definitions (states, measurements).",
  "Pitfall: Assuming quantum biology claims without timescale/noise analysis; decoherence suppresses long‑lived coherence at warm temperatures.",
  "Anti‑pattern: Treating topological protection as total immunity; real devices still require error correction and engineering.",
  "Pitfall: Mixing ontology with predictions; interpretations must match the same experimental statistics."
];

