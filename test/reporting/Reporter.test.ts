import { describe, it, expect } from 'vitest';
import { Reporter } from '../../src/reporting/Reporter.js';
import { JsonReporter } from '../../src/reporting/JsonReporter.js';
import { ExperimentResult } from '../../src/types/ExperimentResult.js';

const makeResult = (): ExperimentResult => ({
  name: 'code-gen-test',
  timestamp: '2024-01-15T10:00:00.000Z',
  runs: [
    { model: 'gpt-4o', output: 'code', repetition: 1, inputTokens: 100, outputTokens: 200, totalCost: 0.01, latencyMs: 1500, outputLength: 4, qualityScore: 0.9 },
    { model: 'gpt-4o', output: 'code', repetition: 2, inputTokens: 100, outputTokens: 200, totalCost: 0.012, latencyMs: 1600, outputLength: 4, qualityScore: 0.85 },
    { model: 'gpt-4o', output: 'code', repetition: 3, inputTokens: 100, outputTokens: 200, totalCost: 0.011, latencyMs: 1400, outputLength: 4, qualityScore: 0.88 },
    { model: 'gpt-4o-mini', output: 'code', repetition: 1, inputTokens: 80, outputTokens: 150, totalCost: 0.005, latencyMs: 800, outputLength: 4, qualityScore: 0.7 },
    { model: 'gpt-4o-mini', output: 'code', repetition: 2, inputTokens: 80, outputTokens: 150, totalCost: 0.006, latencyMs: 900, outputLength: 4, qualityScore: 0.75 },
    { model: 'gpt-4o-mini', output: 'code', repetition: 3, inputTokens: 80, outputTokens: 150, totalCost: 0.005, latencyMs: 850, outputLength: 4, qualityScore: 0.72 },
  ],
  modelMetrics: [
    { model: 'gpt-4o', avgCost: 0.011, avgLatency: 1500, avgQualityScore: 0.877, costStddev: 0.001, latencyStddev: 100, qualityStddev: 0.025 },
    { model: 'gpt-4o-mini', avgCost: 0.0053, avgLatency: 850, avgQualityScore: 0.723, costStddev: 0.0005, latencyStddev: 50, qualityStddev: 0.025 },
  ],
});

describe('Reporter', () => {
  it('should format results as text table', () => {
    const reporter = new Reporter();
    const table = reporter.formatTable(makeResult());
    expect(table).toContain('Model');
    expect(table).toContain('Avg Cost');
    expect(table).toContain('Avg Latency');
    expect(table).toContain('Quality');
    expect(table).toContain('gpt-4o');
    expect(table).toContain('gpt-4o-mini');
  });

  it('should sort by quality_score descending', () => {
    const reporter = new Reporter();
    const table = reporter.formatTable(makeResult());
    const lines = table.split('\n');
    const modelLines = lines.filter(l => l.includes('gpt-4o'));
    // gpt-4o (0.877) should come before gpt-4o-mini (0.723)
    const gpt4oIdx = lines.findIndex(l => l.includes('gpt-4o') && !l.includes('mini'));
    const miniIdx = lines.findIndex(l => l.includes('gpt-4o-mini'));
    expect(gpt4oIdx).toBeLessThan(miniIdx);
  });

  it('should include repetitions info in header', () => {
    const reporter = new Reporter();
    const table = reporter.formatTable(makeResult());
    expect(table).toContain('N=3 repetitions');
  });

  it('should include task name and date in report', () => {
    const reporter = new Reporter();
    const table = reporter.formatTable(makeResult());
    expect(table).toContain('code-gen-test');
    expect(table).toContain('2024-01-15');
  });
});
