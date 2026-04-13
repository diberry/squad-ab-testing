import { describe, it, expect } from 'vitest';
import { Scorer } from '../../src/scoring/Scorer.js';
import { QualityAggregator } from '../../src/scoring/QualityAggregator.js';
import { AgentRun } from '../../src/types/AgentRun.js';

const makeRun = (overrides: Partial<AgentRun> = {}): AgentRun => ({
  model: 'gpt-4o',
  output: 'some code output',
  repetition: 1,
  inputTokens: 100,
  outputTokens: 200,
  totalCost: 0.01,
  latencyMs: 1500,
  outputLength: 16,
  ...overrides,
});

describe('Scorer', () => {
  it('should evaluate run with given evaluator', async () => {
    const evaluator = async (output: string) => 0.85;
    const scorer = new Scorer(evaluator, 'mock-eval');
    const scored = await scorer.score(makeRun());
    expect(scored.qualityScore).toBe(0.85);
  });

  it('should store evaluation result per run', async () => {
    const evaluator = async (output: string) => 0.9;
    const scorer = new Scorer(evaluator, 'test-eval');
    const scored = await scorer.score(makeRun());
    expect(scored.qualityScore).toBe(0.9);
    expect(scored.evaluatorName).toBe('test-eval');
  });

  it('should handle evaluator errors gracefully', async () => {
    const evaluator = async () => { throw new Error('eval crashed'); };
    const scorer = new Scorer(evaluator, 'broken-eval');
    const scored = await scorer.score(makeRun());
    expect(scored.qualityScore).toBe(-1);
    expect(scored.evaluationError).toBeDefined();
  });

  it('should aggregate quality scores across repetitions', () => {
    const runs: AgentRun[] = [
      makeRun({ model: 'gpt-4o', repetition: 1, qualityScore: 0.8 }),
      makeRun({ model: 'gpt-4o', repetition: 2, qualityScore: 0.9 }),
      makeRun({ model: 'gpt-4o', repetition: 3, qualityScore: 0.7 }),
    ];
    const aggregator = new QualityAggregator();
    const results = aggregator.aggregate(runs);
    expect(results).toHaveLength(1);
    expect(results[0].meanQuality).toBeCloseTo(0.8, 1);
    expect(results[0].stddevQuality).toBeGreaterThan(0);
  });
});
