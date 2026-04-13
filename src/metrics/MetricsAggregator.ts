import { AgentRun } from '../types/AgentRun.js';
import { ModelMetrics } from '../types/ExperimentResult.js';

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function stddev(values: number[]): number {
  if (values.length < 2) return 0;
  const m = mean(values);
  const variance = values.reduce((sum, v) => sum + (v - m) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

export class MetricsAggregator {
  aggregate(runs: AgentRun[]): ModelMetrics[] {
    const byModel = new Map<string, AgentRun[]>();
    for (const run of runs) {
      const list = byModel.get(run.model) || [];
      list.push(run);
      byModel.set(run.model, list);
    }

    const results: ModelMetrics[] = [];
    for (const [model, modelRuns] of byModel) {
      const costs = modelRuns.map(r => r.totalCost);
      const latencies = modelRuns.map(r => r.latencyMs);
      const qualities = modelRuns
        .filter(r => r.qualityScore !== undefined)
        .map(r => r.qualityScore!);

      results.push({
        model,
        avgCost: mean(costs),
        avgLatency: mean(latencies),
        avgQualityScore: mean(qualities),
        costStddev: stddev(costs),
        latencyStddev: stddev(latencies),
        qualityStddev: stddev(qualities),
      });
    }

    return results;
  }
}
