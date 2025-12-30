/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// Fallback lessons in case generated file is missing
export type LessonsData = {
  hits: string[];
  badPractices: string[];
};

// Strictly quantum-themed fallback content to avoid any cross-app bleed.
export const DEFAULT_LESSONS: LessonsData = {
  // Keep hits minimal because we now display detailed concepts from LEVELS.
  // Leaving a few short, on-theme one‑liners for optional rotation.
  hits: [
    "Superposition: systems occupy many possibilities until measured.",
    "Entanglement: correlated outcomes beyond classical limits.",
    "Interference: amplitudes add, cancel, and shape outcomes.",
    "No-cloning: unknown quantum states cannot be copied.",
    "Tunneling: barriers can be crossed via wavefunction tails.",
  ],
  // For bowled events we source anti‑patterns from QUANTUM_ANTI, so keep this empty.
  badPractices: [],
};

export async function loadLessons(): Promise<LessonsData> {
  // Always return our quantum defaults to prevent North Star content from leaking in.
  return DEFAULT_LESSONS;
}
