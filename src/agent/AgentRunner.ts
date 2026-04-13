import { AgentRun } from '../types/AgentRun.js';
import { Task } from '../types/Task.js';
import { AgentSpawner, AgentExecutor } from './AgentSpawner.js';

export class AgentRunner {
  private spawner: AgentSpawner;
  private timeoutMs: number;

  constructor(executor: AgentExecutor, timeoutMs: number = 300_000) {
    this.spawner = new AgentSpawner(executor);
    this.timeoutMs = timeoutMs;
  }

  async run(task: Task, model: string, repetition: number): Promise<AgentRun> {
    const agent = this.spawner.spawn(task, model);
    const start = Date.now();

    let timer: ReturnType<typeof setTimeout> | undefined;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error(`Agent timeout after ${this.timeoutMs}ms`)), this.timeoutMs);
    });

    try {
      const result = await Promise.race([agent.execute(), timeoutPromise]);
      const latencyMs = Date.now() - start;

      return {
        model,
        output: result.output,
        repetition,
        inputTokens: result.inputTokens,
        outputTokens: result.outputTokens,
        totalCost: result.cost,
        latencyMs,
        outputLength: result.output.length,
      };
    } finally {
      if (timer) clearTimeout(timer);
    }
  }
}
