import { AgentRun } from '../types/AgentRun.js';
import { EvaluatorFunction } from '../types/Evaluator.js';

export interface ScoredRun extends AgentRun {
  qualityScore: number;
  evaluatorName: string;
  evaluationError?: string;
}

export class Scorer {
  private evaluator: EvaluatorFunction;
  private evaluatorName: string;

  constructor(evaluator: EvaluatorFunction, evaluatorName: string) {
    this.evaluator = evaluator;
    this.evaluatorName = evaluatorName;
  }

  async score(run: AgentRun): Promise<ScoredRun> {
    try {
      const qualityScore = await this.evaluator(run.output);
      return {
        ...run,
        qualityScore,
        evaluatorName: this.evaluatorName,
      };
    } catch (err) {
      return {
        ...run,
        qualityScore: -1,
        evaluatorName: this.evaluatorName,
        evaluationError: err instanceof Error ? err.message : String(err),
      };
    }
  }
}
