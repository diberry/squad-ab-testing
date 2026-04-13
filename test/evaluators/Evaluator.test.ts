import { describe, it, expect } from 'vitest';
import { EvaluatorRegistry } from '../../src/evaluators/EvaluatorRegistry.js';
import { testPassRateEvaluator } from '../../src/evaluators/TestPassRateEvaluator.js';
import { lintScoreEvaluator } from '../../src/evaluators/LintScoreEvaluator.js';

describe('Evaluator', () => {
  it('should register a custom evaluator', () => {
    const registry = new EvaluatorRegistry();
    const fn = async (output: string) => 0.5;
    registry.register('custom', fn);
    expect(registry.has('custom')).toBe(true);
  });

  it('should retrieve evaluator by name', () => {
    const registry = new EvaluatorRegistry();
    const fn = async (output: string) => 0.9;
    registry.register('my-eval', fn);
    const retrieved = registry.get('my-eval');
    expect(retrieved).toBe(fn);
  });

  it('should throw on missing evaluator', () => {
    const registry = new EvaluatorRegistry();
    expect(() => registry.get('nonexistent')).toThrow('Evaluator not found');
  });

  it('should run test-pass-rate evaluator on input', async () => {
    // 3 pass, 1 fail => 0.75
    const output = '✓ test1 passed\n✓ test2 passed\n✓ test3 passed\n✗ test4 failed';
    const score = await testPassRateEvaluator(output);
    expect(score).toBeCloseTo(0.75, 1);
  });

  it('should run lint-score evaluator on input', async () => {
    const cleanOutput = 'All files look good!';
    expect(await lintScoreEvaluator(cleanOutput)).toBe(1.0);

    const dirtyOutput = 'warning: unused variable\nerror: missing semicolon';
    const score = await lintScoreEvaluator(dirtyOutput);
    expect(score).toBeLessThan(1.0);
    expect(score).toBeGreaterThanOrEqual(0);
  });
});
