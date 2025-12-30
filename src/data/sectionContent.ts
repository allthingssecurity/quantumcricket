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
  try {
    const mod = await import('./sectionContent.json', { with: { type: 'json' } } as any);
    return (mod.default || mod) as SectionContent;
  } catch (e) {
    return {};
  }
}

