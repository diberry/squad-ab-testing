import { AgentRun } from '../types/AgentRun.js';

export interface QualityAggregate {
  model: string;
  meanQuality: number;
  stddevQuality: number;
  count: number;
}

export class QualityAggregator {
  aggregate(runs: AgentRun[]): QualityAggregate[] {
    const byModel = new Map<string, number[]>();
    for (const run of runs) {
      if (run.qualityScore !== undefined && run.qualityScore >= 0) {
        const list = byModel.get(run.model) || [];
        list.push(run.qualityScore);
        byModel.set(run.model, list);
      }
    }

    const results: QualityAggregate[] = [];
    for (const [model, scores] of byModel) {
      const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
      const variance = scores.length > 1
        ? scores.reduce((sum, v) => sum + (v - mean) ** 2, 0) / (scores.length - 1)
        : 0;
      results.push({
        model,
        meanQuality: mean,
        stddevQuality: Math.sqrt(variance),
        count: scores.length,
      });
    }
    return results;
  }
}
