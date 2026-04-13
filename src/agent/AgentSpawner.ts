import { Task } from '../types/Task.js';

export interface SpawnedAgent {
  model: string;
  task: Task;
  execute: () => Promise<{ output: string; inputTokens: number; outputTokens: number; cost: number }>;
}

export type AgentExecutor = (task: Task, model: string) => Promise<{ output: string; inputTokens: number; outputTokens: number; cost: number }>;

export class AgentSpawner {
  private executor: AgentExecutor;

  constructor(executor: AgentExecutor) {
    this.executor = executor;
  }

  spawn(task: Task, model: string): SpawnedAgent {
    return {
      model,
      task,
      execute: () => this.executor(task, model),
    };
  }
}
