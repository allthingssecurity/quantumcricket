/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { LevelData } from "../types";

export const LEVELS: LevelData[] = [
  {
    id: 1,
    title: "Foundations",
    description: "Postulates, state vectors, and the math you stand on.",
    targetScore: 24,
    maxWickets: 10,
    totalBalls: 24,
    concepts: [
      "State space: a system is represented by a normalized vector |ψ⟩ in a complex Hilbert space.",
      "Observables: measurable quantities correspond to Hermitian operators with real eigenvalues.",
      "Born rule: measurement outcome probabilities are |⟨ϕ|ψ⟩|²; outcomes project the state.",
      "Unitary time evolution: closed systems evolve via U = e^{-iHt/ℏ}, preserving norm and inner products.",
      "Composite systems: tensor products model multi‑part systems; dimensions multiply.",
      "Global vs relative phase: only relative phase affects interference; global phase is unobservable.",
      "Density matrices: ρ = |ψ⟩⟨ψ| for pure states; mixed states capture classical uncertainty and decoherence.",
      "Trace and expectation: ⟨A⟩ = Tr(ρA); partial trace models subsystems.",
      "Commutation: [A,B] ≠ 0 implies uncertainty and measurement disturbance.",
      "Uncertainty: ΔAΔB ≥ |⟨[A,B]⟩|/2; not about apparatus limits but state structure."
    ]
  },
  {
    id: 2,
    title: "Waves & Double‑Slit",
    description: "Interference, path amplitudes, and what a slit really means.",
    targetScore: 28,
    maxWickets: 10,
    totalBalls: 24,
    concepts: [
      "Probability amplitudes add, not probabilities; interference arises from phase‑coherent paths.",
      "Double‑slit: opening both slits adds complex amplitudes, creating fringes on detection.",
      "Which‑path detection destroys interference by entangling path information with environment.",
      "Single‑photon regime: fringes emerge statistically from many trials, not from single ‘waves’.",
      "Feynman path integral: sum over histories weights each path by e^{iS/ℏ}.",
      "Visibility vs distinguishability: V² + D² ≤ 1; knowledge of path trades off with fringe contrast.",
      "Coherence length: interference requires phase stability over path differences.",
      "Aperture & Fourier optics: slit widths shape momentum spread and far‑field patterns.",
      "Phase shifters: controlled phase inserts move fringes predictably.",
      "Delayed measurement: choice of measuring path vs interference can be deferred to near detection."
    ]
  },
  {
    id: 3,
    title: "Measurement Theory",
    description: "Projectors, POVMs, and the operational view of outcomes.",
    targetScore: 30,
    maxWickets: 10,
    totalBalls: 24,
    concepts: [
      "Projective (von Neumann) measurement: orthogonal projectors {P_i} with ∑P_i = I.",
      "POVMs generalize measurements with elements {E_i} ≥ 0, ∑E_i = I, realized via ancilla.",
      "Lüders rule: post‑measurement state for projective outcomes is P_i|ψ⟩/‖P_i|ψ⟩‖.",
      "Weak measurement: extract partial information with minimal disturbance; weak values emerge.",
      "Quantum instruments: maps that output classical result and updated quantum state.",
      "Quantum Zeno effect: frequent measurement can freeze evolution.",
      "Contextuality: no noncontextual assignment reproduces all QM statistics (Kochen‑Specker).",
      "No‑cloning: unknown states cannot be copied perfectly; linearity forbids it.",
      "No‑deleting & no‑broadcast theorems: constraints on information flow in QM.",
      "Tomography: reconstruct ρ from a quorum of measurement settings."
    ]
  },
  {
    id: 4,
    title: "Spin & Qubits",
    description: "Bloch sphere, Pauli algebra, and single‑qubit control.",
    targetScore: 32,
    maxWickets: 10,
    totalBalls: 24,
    concepts: [
      "Qubit state on Bloch sphere: |ψ⟩ = cos(θ/2)|0⟩ + e^{iφ}sin(θ/2)|1⟩.",
      "Pauli operators σ_x, σ_y, σ_z generate SU(2) rotations; {σ_i} form a basis of 2×2 Hermitians.",
      "Hamiltonian control: rotations R_n(α)=e^{-i α n·σ/2}; pulses implement gates.",
      "Hadamard H creates equal superposition; phase gates S,T rotate around Z.",
      "Resonant driving (Rabi): coherent oscillations between basis states.",
      "Bloch vector r with ρ = (I + r·σ)/2; |r|<1 for mixed states.",
      "Dephasing shrinks transverse components; relaxation drives r to thermal pole.",
      "Tomography on Bloch: measure σ_x,σ_y,σ_z to reconstruct state.",
      "Single‑qubit noise channels: depolarizing, amplitude damping, phase damping.",
      "Qubit encodings: spin‑1/2, photon polarization, charge/flux in superconductors."
    ]
  },
  {
    id: 5,
    title: "Entanglement",
    description: "Bell states, nonlocality, and correlations with no classical model.",
    targetScore: 34,
    maxWickets: 10,
    totalBalls: 24,
    concepts: [
      "Bell states: (|00⟩±|11⟩)/√2 and (|01⟩±|10⟩)/√2; maximally entangled bases.",
      "Schmidt decomposition: any bipartite pure state has orthonormal modes with nonnegative weights.",
      "Entanglement entropy S(ρ_A) quantifies pure‑state bipartite entanglement.",
      "CHSH inequality: QM violates 2, reaches 2√2, excluding local hidden variables.",
      "Monogamy: strong entanglement with A limits entanglement with others.",
      "Steering and nonlocal games: operational tests of quantum correlations.",
      "LOCC paradigm: local ops + classical comm; entanglement is a resource.",
      "Teleportation: consume a Bell pair + 2 cbits to transfer an unknown state.",
      "Superdense coding: send 2 cbits via 1 qubit using shared entanglement.",
      "GHZ, W states: multipartite entanglement types with distinct robustness."
    ]
  },
  {
    id: 6,
    title: "Gates & Circuits",
    description: "Universal gate sets and compiling unitaries into circuits.",
    targetScore: 36,
    maxWickets: 10,
    totalBalls: 24,
    concepts: [
      "Universal sets: {H, T, CNOT} approximate any unitary; Solovay–Kitaev gives polylog overhead.",
      "Two‑qubit entanglers (CNOT/ZZ/XY) + 1‑qubit rotations yield universality across platforms.",
      "Decompositions: Euler angles for 1‑qubit; KAK/Cartan for 2‑qubit; QR for linear optics.",
      "Compilation vs synthesis: approximate unitaries to error ε with depth polylog(1/ε).",
      "Parameterized circuits (ansätze) for variational algorithms; train with cost functions.",
      "Circuit identities: commutation, cancellation, and template rewrites reduce depth.",
      "Hardware native gates: map abstract gates to pulse‑level primitives (ZX, iSWAP, CZ).",
      "Measurement‑based QC: cluster states + adaptive single‑qubit measurements.",
      "Adiabatic/annealing models: encode problems in Ising/Hamiltonians and evolve slowly.",
      "Error‑aware scheduling: insert dynamical decoupling, echo sequences, and calibration gaps."
    ]
  },
  {
    id: 7,
    title: "Interference & Delayed Choice",
    description: "Wheeler’s thought experiments and quantum erasers.",
    targetScore: 38,
    maxWickets: 10,
    totalBalls: 24,
    concepts: [
      "Delayed choice: interference vs which‑path can be set after the photon enters the interferometer.",
      "Quantum eraser: erase which‑path info via entanglement to restore fringes in coincidence counts.",
      "Complementarity: wave and particle behaviors are mutually exclusive experimental setups.",
      "Interferometer models (Mach–Zehnder): beam splitters as Hadamards, phase shifters as Z rotations.",
      "Phase stability: locking mechanisms keep interferometers coherent for long runs.",
      "Entanglement‑assisted erasure: idler/signal correlations conditionally recover interference.",
      "No retrocausality: choices influence correlations, not past events.",
      "Information is physical: recording path marks the environment; erasing requires unitaries.",
      "Visibility control: adjust phase/BS reflectivity to morph between particle and wave limits.",
      "Contextual interpretations: predictions remain the same despite story differences."
    ]
  },
  {
    id: 8,
    title: "Open Systems & Decoherence",
    description: "From pure to mixed: Lindblad, noise, and the classical limit.",
    targetScore: 40,
    maxWickets: 10,
    totalBalls: 30,
    concepts: [
      "Master equations: dρ/dt = −i[H,ρ] + ∑_k (L_k ρ L_k^† − ½{L_k^†L_k, ρ}).",
      "Dephasing vs relaxation: T₂ limits coherence, T₁ population lifetime; T₂ ≤ 2T₁.",
      "Quantum trajectories: unravel master equations into stochastic pure‑state evolutions.",
      "Environment‑induced superselection: pointer bases emerge from robust system‑environment couplings.",
      "Noise spectra: 1/f vs white; filter functions tune sensitivity.",
      "Dynamical decoupling: pulse sequences average out slow noise (CPMG, XY‑8).",
      "Error mitigation: zero‑noise extrapolation, probabilistic error cancellation (NISQ).",
      "Process tomography & randomized benchmarking: characterize noisy channels and average fidelities.",
      "Non‑Markovianity: memory effects violate semigroup property.",
      "Quantum thermodynamics: resource viewpoint on coherence and heat flows."
    ]
  },
  {
    id: 9,
    title: "Tunneling & Applications",
    description: "Barrier penetration and devices built on it.",
    targetScore: 42,
    maxWickets: 10,
    totalBalls: 30,
    concepts: [
      "Tunneling: classically forbidden transmission due to wavefunction tails.",
      "WKB approximation estimates transmission through smooth barriers with action integrals.",
      "Resonant tunneling diodes: engineered double‑barrier structures with sharp I–V features.",
      "Scanning tunneling microscopy: exponential sensitivity to tip‑sample distance resolves atoms.",
      "Josephson junctions: Cooper‑pair tunneling yields AC/DC Josephson effects and qubit nonlinearity.",
      "Field emission & Fowler–Nordheim tunneling under strong electric fields.",
      "Alpha decay as nuclear tunneling across Coulomb barrier.",
      "Landau–Zener sweeps: diabatic vs adiabatic transitions across avoided crossings.",
      "Tunneling time debates: dwell, phase, and Larmor clock definitions.",
      "Macroscopic quantum tunneling in superconducting circuits."
    ]
  },
  {
    id: 10,
    title: "Algorithms",
    description: "Speedups from amplitude amplification to period finding.",
    targetScore: 45,
    maxWickets: 10,
    totalBalls: 36,
    concepts: [
      "Grover’s algorithm: O(√N) queries via reflections about mean and marked state.",
      "Amplitude estimation: quadratically faster Monte Carlo via phase estimation.",
      "Phase estimation: eigenphase extraction with controlled‑U and inverse QFT.",
      "Shor’s algorithm: period finding in modular arithmetic yields factoring/discrete logs.",
      "HHL linear‑systems solver with state preparation and readout caveats.",
      "Quantum walks: search and hitting‑time speedups on graphs.",
      "VQE/QAOA: variational heuristics for chemistry and optimization on NISQ devices.",
      "Error vs advantage: asymptotic speedups demand end‑to‑end error analysis.",
      "Oracle models vs practical problems: embedding costs matter.",
      "Resource estimation: qubits, T‑count, surface code cycles for fault‑tolerant runs."
    ]
  },
  {
    id: 11,
    title: "Error Correction",
    description: "From repetition to surface codes and thresholds.",
    targetScore: 48,
    maxWickets: 10,
    totalBalls: 36,
    concepts: [
      "Stabilizer formalism: codes defined by commuting Pauli checks stabilize a codespace.",
      "Repetition and Shor/Steane codes: bit‑/phase‑flip protection and CSS structure.",
      "Surface/toric codes: local checks on a lattice, anyon picture, and minimum‑weight matching.",
      "Fault tolerance: transversal gates, magic‑state distillation for non‑Cliffords (T).",
      "Syndrome extraction circuits and measurement errors.",
      "Code distance d and logical error rates vs physical p; thresholds (~1%) for topological codes.",
      "Leakage management and bias‑preserving codes for asymmetric noise.",
      "LDPC/quantum expander codes targeting lower overheads.",
      "Decoders: MWPM, union‑find, RL‑based; latency vs performance.",
      "Heterogeneous architectures: routing, crosstalk, and scheduling with error budgets."
    ]
  },
  {
    id: 12,
    title: "Interpretations",
    description: "Copenhagen, Many‑Worlds, Bohmian, QBism, and what changes (or not).",
    targetScore: 50,
    maxWickets: 10,
    totalBalls: 36,
    concepts: [
      "Copenhagen: operational rules + classical apparatus; collapse as an update rule.",
      "Many‑Worlds: universal unitary evolution; branches encode outcomes without collapse.",
      "Bohmian mechanics: particles guided by wavefunction with nonlocal pilot‑wave.",
      "Objective collapse (GRW): stochastic collapses add new dynamics to resolve measurement.",
      "QBism: quantum states as personalist Bayesian degrees of belief constrained by coherence.",
      "Relational QM: states and facts relative to observers; consistency via interactions.",
      "Consistent histories: decoherent sets of histories with assigned probabilities.",
      "PBR, Frauchiger–Renner: constraints on epistemic state views and cross‑observer narratives.",
      "What’s invariant: experimental predictions—interpretations differ in ontology and story.",
      "Delayed choice & eraser revisited: interpretations tell different stories for same math."
    ]
  },
  {
    id: 13,
    title: "Quantum Biology & Mind",
    description: "Speculative and emerging: when do quantum effects matter in life?",
    targetScore: 52,
    maxWickets: 10,
    totalBalls: 36,
    concepts: [
      "Photosynthetic energy transport: coherence signatures in complex excitonic systems.",
      "Enzymatic tunneling: proton/electron tunneling may influence reaction rates.",
      "Olfaction proposals: vibrational theory vs shape—status remains debated.",
      "Magnetoreception: radical‑pair mechanisms as quantum compasses in birds.",
      "Quantum consciousness: Penrose–Hameroff Orch‑OR is controversial; evidence lacking.",
      "Decoherence scales: warm, wet environments suppress long‑lived superpositions.",
      "Biophysical constraints: timescales and noise often dominate over quantum advantages.",
      "Measurement issues: distinguishing genuine quantum coherence from classical beating.",
      "Experimental techniques: ultrafast spectroscopy and spin chemistry.",
      "Caution: separate inspiring hypotheses from established results."
    ]
  },
  {
    id: 14,
    title: "Advanced Models",
    description: "Topological phases, measurement‑based, and adiabatic computing.",
    targetScore: 55,
    maxWickets: 10,
    totalBalls: 42,
    concepts: [
      "Anyons and braiding: non‑Abelian statistics enable topological gates robust to local noise.",
      "Kitaev chains, Majoranas, and parity protection in superconducting platforms.",
      "Cluster states: universal resource in measurement‑based quantum computation.",
      "Adiabatic/AQC vs circuit equivalence with polynomial slowdowns.",
      "Hamiltonian complexity: QMA‑completeness of local Hamiltonian problems.",
      "Topological error correction integrated with computation (color codes).",
      "Bosonic encodings: cat/GKP codes trade qubit overhead for oscillator shaping.",
      "Analog simulation: quantum simulators for lattice gauge, chemistry, condensed matter.",
      "Boson sampling & Gaussian boson sampling complexity signatures.",
      "Resource theories: coherence, magic, and asymmetry as quantifiable resources."
    ]
  },
  {
    id: 15,
    title: "Quantum Thermo & Info",
    description: "Landauer, work extraction, and ultimate limits of computation.",
    targetScore: 58,
    maxWickets: 10,
    totalBalls: 42,
    concepts: [
      "Landauer’s principle: erasing 1 bit costs ≥ k_B T ln 2 of heat to environment.",
      "Maxwell’s demon resolved via information bookkeeping and entropy flows.",
      "Resource theory of athermality: work extraction from non‑thermal states under constraints.",
      "Holevo bound: classical information accessible from quantum states is limited.",
      "Channel capacities: classical/quantum/private capacities and additivity subtleties.",
      "Thermal operations and catalytic coherence; second‑law inequalities in quantum regimes.",
      "Fluctuation theorems: Jarzynski/Crooks relations for microscopic work statistics.",
      "Quantum metrology: phase estimation at standard vs Heisenberg limits with entanglement.",
      "Fundamental limits: speed limits (Mandelstam–Tamm) and energy‑time tradeoffs.",
      "Outlook: fault‑tolerant quantum advantage demands tight control of resources and errors."
    ]
  }
];
