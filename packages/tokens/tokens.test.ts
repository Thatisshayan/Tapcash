// @ts-nocheck
/**
 * Phase 1 token-foundation drift test.
 * Enforces the REDESIGN_SPEC Phase 1 gate:
 *   - One palette (Model U) shared across web + mobile.
 *   - No retired legacy hex (e.g. #00FF85 / #7B5CF0 / #0d0d1a) in either platform output.
 *
 * Runs in the web Jest suite (next-jest) so it gates PRs to main.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const repoRoot = resolve(__dirname, '..', '..', '..');

const tokens = JSON.parse(readFileSync(resolve(repoRoot, 'packages/tokens/tokens.json'), 'utf8'));
const { primitives, legacy } = tokens;

const mobileTheme = readFileSync(resolve(repoRoot, 'mobile/src/theme.ts'), 'utf8');
// Web renders tokens in globals.css; read the active Model U @theme block.
const globals = readFileSync(resolve(repoRoot, 'src/app/globals.css'), 'utf8');

describe('Phase 1 token foundation', () => {
  test('mobile theme converged to Model U primitives (no legacy drift)', () => {
    // Core Model U anchors must be present in generated mobile theme.
    expect(mobileTheme).toContain(primitives.green);   // #31F06F
    expect(mobileTheme).toContain(primitives.purple);  // #7C3DFF
    expect(mobileTheme).toContain(primitives['ink-950']); // #050813
    // Mobile must NOT still carry the legacy palette.
    for (const banned of legacy.bannedHex) {
      expect(mobileTheme.toLowerCase()).not.toContain(banned.toLowerCase());
    }
  });

  test('web globals.css anchors on Model U primitives', () => {
    expect(globals).toContain(primitives.green);
    expect(globals).toContain(primitives.purple);
    expect(globals).toContain(primitives['ink-950']);
  });

  test('web + mobile share the same canonical accent set', () => {
    const common = [primitives.green, primitives.cyan, primitives.purple, primitives.gold, primitives.red];
    for (const hex of common) {
      expect(mobileTheme.toLowerCase()).toContain(hex.toLowerCase());
      expect(globals.toLowerCase()).toContain(hex.toLowerCase());
    }
  });

  test('no banned legacy hex anywhere in platform token outputs', () => {
    const combined = (mobileTheme + '\n' + globals).toLowerCase();
    for (const banned of legacy.bannedHex) {
      expect(combined).not.toContain(banned.toLowerCase());
    }
  });
});
