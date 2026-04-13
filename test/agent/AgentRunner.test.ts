import { describe, it, expect, vi } from 'vitest';
import { AgentRunner } from '../../src/agent/AgentRunner.js';
import { Task } from '../../src/types/Task.js';

const mockTask: Task = {
  prompt: 'Generate a hello world function',
  inputFiles: [],
  evaluator: 'test-pass-rate',
};

describe('AgentRunner', () => {
  it('should spawn agent with specific model', async () => {
    let capturedModel = '';
    const executor = async (task: Task, model: string) => {
      capturedModel = model;
      return { output: 'result', inputTokens: 10, outputTokens: 20, cost: 0.001 };
    };
    const runner = new AgentRunner(executor);
    await runner.run(mockTask, 'gpt-4o', 1);
    expect(capturedModel).toBe('gpt-4o');
  });

  it('should execute agent and capture output', async () => {
    const executor = async () => ({
      output: 'function hello() { return "world"; }',
      inputTokens: 50,
      outputTokens: 100,
      cost: 0.005,
    });
    const runner = new AgentRunner(executor);
    const result = await runner.run(mockTask, 'gpt-4o', 1);
    expect(result.output).toBe('function hello() { return "world"; }');
    expect(result.model).toBe('gpt-4o');
  });

  it('should capture token usage from agent run', async () => {
    const executor = async () => ({
      output: 'code',
      inputTokens: 150,
      outputTokens: 300,
      cost: 0.01,
    });
    const runner = new AgentRunner(executor);
    const result = await runner.run(mockTask, 'gpt-4o', 1);
    expect(result.inputTokens).toBe(150);
    expect(result.outputTokens).toBe(300);
    expect(result.totalCost).toBe(0.01);
  });

  it('should capture latency', async () => {
    const executor = async () => {
      await new Promise(r => setTimeout(r, 50));
      return { output: 'done', inputTokens: 10, outputTokens: 20, cost: 0.001 };
    };
    const runner = new AgentRunner(executor);
    const result = await runner.run(mockTask, 'gpt-4o', 1);
    expect(result.latencyMs).toBeGreaterThanOrEqual(40);
  });

  it('should handle agent timeout', async () => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const executor = async () => {
      return new Promise<{ output: string; inputTokens: number; outputTokens: number; cost: number }>((resolve) => {
        timer = setTimeout(() => resolve({ output: 'late', inputTokens: 0, outputTokens: 0, cost: 0 }), 5000);
      });
    };
    const runner = new AgentRunner(executor, 100); // 100ms timeout
    try {
      await expect(runner.run(mockTask, 'gpt-4o', 1)).rejects.toThrow('timeout');
    } finally {
      if (timer) clearTimeout(timer);
    }
  });
});
