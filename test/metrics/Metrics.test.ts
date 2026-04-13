import { describe, it, expect } from 'vitest';
import { MetricsCollector } from '../../src/metrics/MetricsCollector.js';
import { MetricsAggregator } from '../../src/metrics/MetricsAggregator.js';
import { AgentRun } from '../../src/types/AgentRun.js';

const makeRun = (overrides: Partial<AgentRun> = {}): AgentRun => ({
  model: 'gpt-4o',
  output: 'function add(a, b) { return a + b; }',
  repetition: 1,
  inputTokens: 100,
  outputTokens: 200,
  totalCost: 0.01,
  latencyMs: 1500,
  outputLength: 37,
  ...overrides,
});

describe('Metrics', () => {
  it('should collect input/output token counts', () => {
    const collector = new MetricsCollector();
    const metrics = collector.collect(makeRun({ inputTokens: 150, outputTokens: 300 }));
    expect(metrics.inputTokens).toBe(150);
    expect(metrics.outputTokens).toBe(300);
  });

  it('should compute total cost', () => {
    const collector = new MetricsCollector();
    const metrics = collector.collect(makeRun({ totalCost: 0.025 }));
    expect(metrics.totalCost).toBe(0.025);
  });

  it('should measure latency', () => {
    const collector = new MetricsCollector();
    const metrics = collector.collect(makeRun({ latencyMs: 2500 }));
    expect(metrics.latencyMs).toBe(2500);
  });

  it('should compute output length', () => {
    const output = 'line1\nline2\nline3';
    const collector = new MetricsCollector();
    const metrics = collector.collect(makeRun({ output }));
    expect(metrics.outputLength).toBe(output.length);
  });

  it('should tag run with model, repetition number', () => {
    const collector = new MetricsCollector();
    const metrics = collector.collect(makeRun({ model: 'gpt-4o-mini', repetition: 3 }));
    expect(metrics.model).toBe('gpt-4o-mini');
    expect(metrics.repetition).toBe(3);
  });
});
