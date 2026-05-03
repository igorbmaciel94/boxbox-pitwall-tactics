import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('public branding text', () => {
  it('keeps README and mobile docs free of legacy brand terms', () => {
    const root = resolve(__dirname, '../..', '..');
    const text = [
      readFileSync(resolve(root, 'README.md'), 'utf8'),
      readFileSync(resolve(root, 'MOBILE.md'), 'utf8'),
    ].join('\n');

    for (const term of [
      /\bFormula 1\b/i,
      /\bF1\b/i,
      /\bDRS\b/i,
      /\bSafety Car\b/i,
      /\bGrand Prix\b/i,
      /\bBox Box\b/i,
      /\bPit Wall\b/i,
    ]) {
      expect(text).not.toMatch(term);
    }
  });
});
