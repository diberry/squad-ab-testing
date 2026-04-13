import { describe, it, expect, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { ResultsStore } from '../../src/storage/ResultsStore.js';
import { ExperimentResult } from '../../src/types/ExperimentResult.js';

const TEST_DIR = path.join(process.cwd(), '.test-results-store');

const makeResult = (name: string = 'test-exp'): ExperimentResult => ({
  name,
  timestamp: new Date().toISOString(),
  runs: [
    { model: 'gpt-4o', output: 'code', repetition: 1, inputTokens: 100, outputTokens: 200, totalCost: 0.01, latencyMs: 1500, outputLength: 4 },
  ],
  modelMetrics: [
    { model: 'gpt-4o', avgCost: 0.01, avgLatency: 1500, avgQualityScore: 0.8, costStddev: 0, latencyStddev: 0, qualityStddev: 0 },
  ],
});

afterEach(() => {
  if (fs.existsSync(TEST_DIR)) {
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
  }
});

describe('ResultsStore', () => {
  it('should save experiment results to file', () => {
    const store = new ResultsStore(TEST_DIR);
    store.save(makeResult());
    const files = fs.readdirSync(TEST_DIR);
    expect(files).toHaveLength(1);
    expect(files[0]).toContain('test-exp');
  });

  it('should load previous results by experiment name', () => {
    const store = new ResultsStore(TEST_DIR);
    const result = makeResult('load-test');
    store.save(result);
    const loaded = store.load('load-test');
    expect(loaded).not.toBeNull();
    expect(loaded!.experiments).toHaveLength(1);
    expect(loaded!.experiments[0].name).toBe('load-test');
  });

  it('should append new results to history', () => {
    const store = new ResultsStore(TEST_DIR);
    store.save(makeResult('append-test'));
    store.save(makeResult('append-test'));
    const loaded = store.load('append-test');
    expect(loaded!.experiments).toHaveLength(2);
  });
});
