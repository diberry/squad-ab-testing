import { describe, it, expect } from 'vitest';
import { Orchestrator } from '../../src/orchestration/Orchestrator.js';
import { ExperimentConfig } from '../../src/types/ExperimentConfig.js';
import { Task } from '../../src/types/Task.js';

const makeConfig = (models: string[], repetitions: number = 1): ExperimentConfig => ({
  name: 'test-exp',
  task: { prompt: 'Generate code', inputFiles: [], evaluator: 'test-pass-rate' },
  models,
  repetitions,
});

describe('Orchestrator', () => {
  it('should run task across 3 models in parallel', async () => {
    const calls: string[] = [];
    const executor = async (task: Task, model: string) => {
      calls.push(model);
      return { output: `output-${model}`, inputTokens: 10, outputTokens: 20, cost: 0.001 };
    };
    const orch = new Orchestrator(executor);
    const result = await orch.run(makeConfig(['model-a', 'model-b', 'model-c']));
    expect(result.runs).toHaveLength(3);
    expect(calls).toContain('model-a');
    expect(calls).toContain('model-b');
    expect(calls).toContain('model-c');
  });

  it('should respect max concurrent limit', async () => {
    let concurrent = 0;
    let maxConcurrent = 0;
    const executor = async (task: Task, model: string) => {
      concurrent++;
      maxConcurrent = Math.max(maxConcurrent, concurrent);
      await new Promise(r => setTimeout(r, 30));
      concurrent--;
      return { output: 'out', inputTokens: 10, outputTokens: 20, cost: 0.001 };
    };
    const orch = new Orchestrator(executor, { maxConcurrent: 2 });
    await orch.run(makeConfig(['a', 'b', 'c', 'd'], 1));
    expect(maxConcurrent).toBeLessThanOrEqual(2);
  });

  it('should aggregate results', async () => {
    const executor = async (task: Task, model: string) => ({
      output: 'code',
      inputTokens: 100,
      outputTokens: 200,
      cost: 0.01,
    });
    const orch = new Orchestrator(executor);
    const result = await orch.run(makeConfig(['gpt-4o', 'gpt-4o-mini'], 2));
    expect(result.runs).toHaveLength(4);
    expect(result.modelMetrics).toHaveLength(2);
    expect(result.name).toBe('test-exp');
    expect(result.timestamp).toBeDefined();
  });

  it('should handle partial failures gracefully', async () => {
    const executor = async (task: Task, model: string) => {
      if (model === 'bad-model') throw new Error('API error');
      return { output: 'ok', inputTokens: 10, outputTokens: 20, cost: 0.001 };
    };
    const orch = new Orchestrator(executor);
    const result = await orch.run(makeConfig(['good-model', 'bad-model']));
    expect(result.runs).toHaveLength(2);
    const badRun = result.runs.find(r => r.model === 'bad-model') as any;
    expect(badRun.error).toBeDefined();
    const goodRun = result.runs.find(r => r.model === 'good-model');
    expect(goodRun!.output).toBe('ok');
  });
});
