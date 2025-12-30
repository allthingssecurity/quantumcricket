/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export type SectionBucket = {
  concepts: string[];
  antiPatterns: string[];
  scoreMessages: { six: string[]; four: string[]; two: string[]; one: string[]; dot: string[] };
};

export type SectionContent = Record<string, SectionBucket>;

export async function loadSectionContent(): Promise<SectionContent> {
  // In the Pages build, we don't include any external section content.
  // Return an empty object so the engine uses per-level curated content only.
  return {};
}
