import { describe, it, expect, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { runExperiment } from '../../src/cli/runExperiment.js';
import { Task } from '../../src/types/Task.js';

const TEST_CONFIG_DIR = path.join(process.cwd(), '.test-cli');

const validConfig = {
  name: 'cli-test',
  task: { prompt: 'Generate code', inputFiles: [], evaluator: 'test-pass-rate' },
  models: ['gpt-4o'],
  repetitions: 1,
};

function writeConfigFile(config: object): string {
  fs.mkdirSync(TEST_CONFIG_DIR, { recursive: true });
  const fp = path.join(TEST_CONFIG_DIR, 'config.json');
  fs.writeFileSync(fp, JSON.stringify(config));
  return fp;
}

afterEach(() => {
  if (fs.existsSync(TEST_CONFIG_DIR)) {
    fs.rmSync(TEST_CONFIG_DIR, { recursive: true, force: true });
  }
});

describe('CLI', () => {
  it('should parse experiment config path argument', async () => {
    const fp = writeConfigFile(validConfig);
    const result = await runExperiment(fp, {
      executor: async () => ({ output: 'ok', inputTokens: 10, outputTokens: 20, cost: 0.001 }),
    });
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('cli-test');
  });

  it('should print results table after execution', async () => {
    const fp = writeConfigFile(validConfig);
    const result = await runExperiment(fp, {
      executor: async () => ({ output: 'code', inputTokens: 50, outputTokens: 100, cost: 0.005 }),
    });
    expect(result.output).toContain('Model');
    expect(result.output).toContain('gpt-4o');
    expect(result.output).toContain('Avg Cost');
  });

  it('should exit 0 on success, 1 on error', async () => {
    // Success
    const fp = writeConfigFile(validConfig);
    const success = await runExperiment(fp, {
      executor: async () => ({ output: 'ok', inputTokens: 10, outputTokens: 20, cost: 0.001 }),
    });
    expect(success.exitCode).toBe(0);

    // Error - bad config path
    const fail = await runExperiment('/nonexistent/config.json', {
      executor: async () => ({ output: 'ok', inputTokens: 10, outputTokens: 20, cost: 0.001 }),
    });
    expect(fail.exitCode).toBe(1);
    expect(fail.output).toContain('Error');
  });
});
