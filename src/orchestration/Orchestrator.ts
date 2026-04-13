import { ExperimentConfig } from '../types/ExperimentConfig.js';
import { ExperimentResult } from '../types/ExperimentResult.js';
import { AgentRun } from '../types/AgentRun.js';
import { AgentRunner } from '../agent/AgentRunner.js';
import { AgentExecutor } from '../agent/AgentSpawner.js';
import { MetricsAggregator } from '../metrics/MetricsAggregator.js';

export class Orchestrator {
  private runner: AgentRunner;
  private maxConcurrent: number;

  constructor(executor: AgentExecutor, options?: { maxConcurrent?: number; timeoutMs?: number }) {
    this.runner = new AgentRunner(executor, options?.timeoutMs);
    this.maxConcurrent = options?.maxConcurrent ?? Infinity;
  }

  async run(config: ExperimentConfig): Promise<ExperimentResult> {
    const task = {
      prompt: config.task.prompt,
      inputFiles: config.task.inputFiles || [],
      evaluator: config.task.evaluator,
    };

    // Build list of all jobs
    const jobs: { model: string; repetition: number }[] = [];
    for (const model of config.models) {
      for (let rep = 1; rep <= config.repetitions; rep++) {
        jobs.push({ model, repetition: rep });
      }
    }

    const runs: AgentRun[] = [];

    // Execute with concurrency limit
    const executing = new Set<Promise<void>>();
    for (const job of jobs) {
      const p = this.runner
        .run(task, job.model, job.repetition)
        .then(run => { runs.push(run); })
        .catch(err => {
          runs.push({
            model: job.model,
            output: '',
            repetition: job.repetition,
            inputTokens: 0,
            outputTokens: 0,
            totalCost: 0,
            latencyMs: 0,
            outputLength: 0,
            qualityScore: undefined,
            error: err instanceof Error ? err.message : String(err),
          } as AgentRun & { error: string });
        });

      executing.add(p);
      p.then(() => executing.delete(p));

      if (executing.size >= this.maxConcurrent) {
        await Promise.race(executing);
      }
    }
    await Promise.all(executing);

    const aggregator = new MetricsAggregator();
    const modelMetrics = aggregator.aggregate(runs);

    return {
      name: config.name,
      timestamp: new Date().toISOString(),
      runs,
      modelMetrics,
    };
  }
}
