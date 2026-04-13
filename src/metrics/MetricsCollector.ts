import { AgentRun } from '../types/AgentRun.js';
import { RunMetrics } from '../types/RunMetrics.js';

export class MetricsCollector {
  collect(run: AgentRun): RunMetrics {
    return {
      model: run.model,
      repetition: run.repetition,
      inputTokens: run.inputTokens,
      outputTokens: run.outputTokens,
      totalCost: run.totalCost,
      latencyMs: run.latencyMs,
      outputLength: run.output.length,
    };
  }
}
